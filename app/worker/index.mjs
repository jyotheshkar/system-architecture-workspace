import {handleWorkspaceStore} from './workspace-store.mjs';
import {content,largeFiles,publicAssets} from './content.js';

const encoder=new TextEncoder();
const cookieName='__Host-ac_session';
const lifetime=8*60*60;
const iterations=100000;
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const equal=(a,b)=>{if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
const bytes=base64=>Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
const hex=data=>[...new Uint8Array(data)].map(b=>b.toString(16).padStart(2,'0')).join('');
const encodeURL=data=>btoa(String.fromCharCode(...new Uint8Array(data))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const decodeURL=data=>bytes(data.replaceAll('-','+').replaceAll('_','/')+'='.repeat((4-data.length%4)%4));
const securityHeaders={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN'};

async function signingKey(env){return crypto.subtle.importKey('raw',encoder.encode(env.SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function issueSession(env){
 const session={exp:Math.floor(Date.now()/1000)+lifetime,nonce:crypto.randomUUID()};
 await env.ARCHIVE.put('auth/session/'+session.nonce,JSON.stringify(session));
 const payload=encodeURL(encoder.encode(JSON.stringify(session)));
 const signature=encodeURL(await crypto.subtle.sign('HMAC',await signingKey(env),encoder.encode(payload)));
 return payload+'.'+signature;
}
async function validSession(request,env){
 if(!env.SESSION_SECRET||!env.ARCHIVE)return false;
 const token=request.headers.get('Cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
 if(!token||token.length>1000)return false;
 try{const [payload,signature,extra]=token.split('.');if(extra||!signature)return false;
  const valid=await crypto.subtle.verify('HMAC',await signingKey(env),decodeURL(signature),encoder.encode(payload));
  const data=JSON.parse(new TextDecoder().decode(decodeURL(payload)));
  if(!valid||!Number.isInteger(data.exp)||data.exp<=Math.floor(Date.now()/1000)||data.exp>Math.floor(Date.now()/1000)+lifetime||typeof data.nonce!=='string')return false;
  const saved=await env.ARCHIVE.get('auth/session/'+data.nonce);
  return !!saved&&(await saved.json()).exp===data.exp;
 }catch{return false;}
}
const sessionCookie=value=>cookieName+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+lifetime;
function asset(path,method='GET'){
 const entry=content[path];if(!entry)return new Response('Not found',{status:404,headers:securityHeaders});
 const body=method==='HEAD'?null:new Blob([bytes(entry.gzip)]).stream().pipeThrough(new DecompressionStream('gzip'));
 return new Response(body,{headers:{...securityHeaders,'Content-Type':entry.type,'Cache-Control':'private, no-store'}});
}
function loginPath(url){
 const query=new URLSearchParams();
 if(url.searchParams.get('arrival')==='agentic-core')query.set('arrival','agentic-core');
 const project=url.searchParams.get('project'),view=url.searchParams.get('view');
 if(['agentic-core','system-architecture-workspace-1-0'].includes(project)){
  query.set('project',project);query.set('view',['brain','concept','ada','aws'].includes(view)?view:'aws');
 }
 return '/login'+(query.size?'?'+query:'');
}
function sameOrigin(request){return request.headers.get('Origin')===new URL(request.url).origin;}
async function login(request,env){
 if(!sameOrigin(request))return json({error:'Please sign in from this page.'},403);
 if(!env.LOGIN_VERIFIER||!env.LOGIN_USERNAME||!env.SESSION_SECRET||!env.ARCHIVE)return json({error:'Sign-in is temporarily unavailable. Please try again shortly.'},503);
 if(Number(request.headers.get('Content-Length')||0)>4096)return json({error:'Invalid sign-in request.'},413);
 let input;try{const text=await request.text();if(text.length>4096)return json({error:'Invalid sign-in request.'},413);input=JSON.parse(text);}catch{return json({error:'Invalid sign-in request.'},400);}
 if(typeof input.username!=='string'||typeof input.password!=='string'||input.password.length>256||input.username.length>254)return json({error:'Enter your email address and password.'},400);
 // Public entry still requires application sign-in. Bound attempts per admitted user or visitor IP.
 const identity=request.headers.get('oai-authenticated-user-id')||request.headers.get('cf-connecting-ip')||'anonymous';
 const throttleKey='auth/attempts/'+hex(await crypto.subtle.digest('SHA-256',encoder.encode(identity)));
 const saved=await env.ARCHIVE.get(throttleKey);let attempts=saved?await saved.json():{count:0,start:Date.now()};
 if(Date.now()-attempts.start>15*60*1000)attempts={count:0,start:Date.now()};
 if(attempts.count>=6)return json({error:'Too many attempts. Please try again in 15 minutes.'},429,{'Retry-After':'900'});
 const [salt,expected]=env.LOGIN_VERIFIER.split(':');
 const key=await crypto.subtle.importKey('raw',encoder.encode(input.password),'PBKDF2',false,['deriveBits']);
 const actual=hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:bytes(salt),iterations},key,256));
 if(!equal(actual,expected)||!equal(input.username.trim().toLowerCase(),env.LOGIN_USERNAME.toLowerCase())){
  await env.ARCHIVE.put(throttleKey,JSON.stringify({count:attempts.count+1,start:attempts.start}));
  return json({error:'The email address or password is incorrect.'},401);
 }
 await env.ARCHIVE.delete(throttleKey);
 return json({ok:true},200, {'Set-Cookie':sessionCookie(await issueSession(env))});
}

export default {async fetch(request,env){
 try{
  const url=new URL(request.url);let path;try{path=decodeURIComponent(url.pathname);}catch{return json({error:'Invalid path.'},400);}
  if(path==='/api/login'&&request.method==='POST')return await login(request,env);
  if(path==='/api/logout'&&request.method==='POST'){
   if(!sameOrigin(request))return json({error:'Invalid request.'},403);
   if(await validSession(request,env)){
    const token=request.headers.get('Cookie').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'=')).slice(cookieName.length+1);
    const session=JSON.parse(new TextDecoder().decode(decodeURL(token.split('.')[0])));
    await env.ARCHIVE.delete('auth/session/'+session.nonce);
   }
   return json({ok:true},200,{'Set-Cookie':cookieName+'=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'});
  }
  if(path.startsWith('/api/workspace-store')){const handled=await handleWorkspaceStore(request,env,{signedIn:await validSession(request,env),sameOrigin});if(handled)return handled;}
  if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed.'},405);
  if(path==='/workspace/')return Response.redirect(url.origin+'/workspace'+url.search,308);
  const signedIn=await validSession(request,env);
  // Public navigation keeps one shell and changes the right-hand content only.
  if(['/infinity', '/infinity/', '/infinity/index.html'].includes(path))return Response.redirect(url.origin+'/hypothetical-idea/'+url.search,308);
  if(['/', '/login', '/login/', '/portfolio', '/portfolio/', '/hypothetical-idea', '/hypothetical-idea/', '/hypothetical-idea/index.html'].includes(path)){
   return asset('/login/index.html',request.method);
  }
  if(publicAssets.includes(path))return asset(path,request.method);
  // Previously shared case-study links now open the same native project models.
  if(['/case-studies','/case-studies/','/case-studies/index.html'].includes(path)){
   const project=['workspace','system-architecture-workspace-1-0'].includes(url.searchParams.get('project'))?'system-architecture-workspace-1-0':'agentic-core';
   return Response.redirect(url.origin+'/workspace?project='+project+'&view=aws',308);
  }

  if(!signedIn){
   if(path==='/workspace'||path==='/workspace/'||path==='/index.html'||path==='/aws/'||path==='/aws/index.html')return Response.redirect(url.origin+loginPath(url),303);
   return json({error:'Please sign in to access this resource.'},401);
  }
  if(path==='/workspace'||path==='/workspace/')path='/index.html';if(path==='/aws/')path='/aws/index.html';
  if(path==='/api/session')return json({signedIn:true});
  if(largeFiles[path]){
   const object=await env.ARCHIVE.get('files'+path);if(!object)return json({error:'This download is temporarily unavailable.'},503);
   return new Response(request.method==='HEAD'?null:object.body,{headers:{...securityHeaders,'Content-Type':largeFiles[path].type,'Cache-Control':'private, no-store'}});
  }
  return asset(path,request.method);
 }catch{return json({error:'The workspace is temporarily unavailable. Please try again.'},503);}
}};
