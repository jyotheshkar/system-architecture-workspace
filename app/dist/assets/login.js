import {mountStarfield} from './starfield.js';
import {mountInfinity} from './infinity.js?v=75';

const skyCanvas=document.querySelector('#login-sky');
const sky=mountStarfield({fixedViewport:true,canvasElement:skyCanvas});
const sculpture=mountInfinity({canvas:document.querySelector('#infinity-galaxy'),motionButton:document.querySelector('#galaxy-motion')});
const motion=matchMedia('(prefers-reduced-motion:reduce)');
const shell=document.querySelector('#entry-shell');
const form=document.querySelector('#login-form');
const password=form.elements.namedItem('password');
const visibility=document.querySelector('#password-visibility');
const panel=document.querySelector('.information-panel');
const profile=document.querySelector('#profile');
const signInView=document.querySelector('#sign-in-view');
const idea=document.querySelector('#infinity-view');
const profileRail=document.querySelector('[data-profile-navigation]');
const ideaRail=document.querySelector('[data-idea-navigation]');
const views={workspace:signInView,portfolio:profile,infinity:idea};
const scrollPositions=new Map();
let currentView=null,loading=null,scrollFrame=0,hashFrame=0,workspaceFrame=null;
let authRequest=null,authGeneration=0,disposed=false,pendingWorkspaceFrame=null;

function routeView(pathname) {
 const path=pathname.replace(/\/index\.html$/,'').replace(/\/+$/,'')||'/';
 if(path==='/'||path==='/login')return 'workspace';
 if(path==='/portfolio')return 'portfolio';
 if(path==='/hypothetical-idea'||path==='/infinity')return 'infinity';
 return null;
}
const normal=event=>event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!event.shiftKey;
function routeUrl(view) {if(view==='infinity')return '/hypothetical-idea/';return view==='workspace'?'/':`/${view}/`;}
function activeRail() {return currentView==='portfolio'?profileRail:currentView==='infinity'?ideaRail:null;}
function heading(view=currentView) {return views[view]?.querySelector('h1')||document.querySelector('#login-title');}
function targetForHash(hash=location.hash) {
 if(!hash)return null;
 let id;try{id=decodeURIComponent(hash.slice(1));}catch{return null;}
 const target=document.getElementById(id);
 return target&&views[currentView]?.contains(target)?target:null;
}
function jumpTo(target,behavior='instant',focus=false) {
 if(!target)return;
 const top=target===views[currentView]?0:panel.scrollTop+target.getBoundingClientRect().top-panel.getBoundingClientRect().top-16;
 panel.scrollTo({top:Math.max(0,top),behavior});
 if(focus)(target===views[currentView]?heading():target)?.focus({preventScroll:true});
 scheduleRail();
}
function visitHash({focus=false}={}) {const target=targetForHash();if(target)jumpTo(target,'instant',focus);}
function updateRail() {
 const rail=activeRail();if(!rail||rail.hidden)return;
 const links=[...rail.querySelectorAll('a[href^="#"]')];
 if(!links.length)return;
 let selected=links[0];const anchor=panel.getBoundingClientRect().top+80;
 for(const link of links){const target=targetForHash(link.hash||link.getAttribute('href'));if(target&&target.getBoundingClientRect().top<=anchor)selected=link;}
 if(panel.scrollTop+panel.clientHeight>=panel.scrollHeight-3)selected=links.at(-1);
 for(const link of links){if(link===selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
}
function scheduleRail() {if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;if(!disposed)updateRail();});}
function showView(view,{focus=false,restore=false}={}) {
 if(!views[view])return;
 if(currentView)scrollPositions.set(currentView,panel.scrollTop);
 currentView=view;
 for(const [name,element] of Object.entries(views))element.hidden=name!==view;
 profileRail.hidden=view!=='portfolio';ideaRail.hidden=view!=='infinity';
 shell.dataset.entryView=view;
 for(const link of document.querySelectorAll('.profile-nav a')) {
  const selected=routeView(new URL(link.href,location.href).pathname)===view;
  if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
 }
 const titles={workspace:'System Architecture Workspace',portfolio:'Project overview | System Architecture Workspace',infinity:'Hypothetical Idea | System Architecture Workspace'};
 document.title=titles[view];
 const skip=document.querySelector('.skip-link');
 const destinations={workspace:['#login-title','Skip to sign in'],portfolio:['#profile','Skip to project overview'],infinity:['#idea','Skip to the idea']};
 [skip.href,skip.textContent]=destinations[view];
 document.querySelector('link[rel=canonical]').href=location.origin+routeUrl(view);
 panel.scrollTo({top:restore?(scrollPositions.get(view)||0):0,behavior:'instant'});
 if(focus)heading()?.focus({preventScroll:true});
 if(hashFrame)cancelAnimationFrame(hashFrame);
 hashFrame=requestAnimationFrame(()=>{hashFrame=0;visitHash({focus});updateRail();});
 // A route changes only the right column. Keep the same particle canvas and phase.
 sculpture.resize();
}
function cancelAuthentication() {authGeneration++;authRequest?.abort();authRequest=null;resetButton();}
function onNavigation(event) {
 if(!normal(event)||event.defaultPrevented)return;
 const link=event.currentTarget;
 if(link.target&&link.target!=='_self'||link.hasAttribute('download'))return;
 const url=new URL(link.href,location.href),view=routeView(url.pathname);
 if(url.origin!==location.origin||!view)return;
 event.preventDefault();cancelAuthentication();resetLoading();
 if(url.href!==location.href)history.pushState({entryView:view},'',url.pathname+url.search+url.hash);
 showView(view,{focus:true});
}
for(const link of document.querySelectorAll('[data-entry-workspace],[data-entry-infinity],[data-entry-portfolio],[data-entry-home]'))link.addEventListener('click',onNavigation);
function onPopState() {
 if(pendingWorkspaceFrame)resetLoading();
 if(workspaceFrame||!routeView(location.pathname)){location.reload();return;}
 cancelAuthentication();resetLoading();showView(routeView(location.pathname),{restore:true});
}
window.addEventListener('popstate',onPopState);
for(const rail of [profileRail,ideaRail])rail.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="#"]');if(!link||!normal(event))return;
 const target=targetForHash(link.hash||link.getAttribute('href'));if(!target)return;
 event.preventDefault();history.replaceState({entryView:currentView},'',location.pathname+location.search+(link.hash||link.getAttribute('href')));
 jumpTo(target,motion.matches?'instant':'smooth',true);
});
panel.addEventListener('scroll',scheduleRail,{passive:true});
window.addEventListener('resize',scheduleRail,{passive:true});
window.addEventListener('hashchange',visitHash);
visibility.addEventListener('click',()=>{const show=password.type==='password';password.type=show?'text':'password';visibility.setAttribute('aria-pressed',String(show));visibility.setAttribute('aria-label',show?'Hide password':'Show password');});

function resetButton(){const button=form.querySelector('[type=submit]');button.disabled=false;button.querySelector('span').textContent='Sign In';button.querySelector('.login-spinner').hidden=true;}
function cancelPendingWorkspace() {
 const frame=pendingWorkspaceFrame;if(!frame)return;
 pendingWorkspaceFrame=null;if(workspaceFrame===frame)workspaceFrame=null;frame.remove();
}
function resetLoading() {
 cancelPendingWorkspace();
 if(!loading)return;
 const state=loading;loading=null;clearTimeout(state.timer);state.animation?.cancel();
 state.parent.insertBefore(state.visual,state.next?.parentNode===state.parent?state.next:null);
 state.visual.style.cssText=state.style;state.placeholder.remove();state.overlay.remove();
 shell.inert=false;document.body.classList.remove('entry-loading');resetButton();sculpture.resize();
}
function workspaceDestination() {
 const source=new URLSearchParams(location.search),query=new URLSearchParams();
 const project=source.get('project'),view=source.get('view');
 if(['agentic-core','system-architecture-workspace-1-0'].includes(project)){
  query.set('project',project);query.set('view',['brain','concept','ada','aws'].includes(view)?view:'aws');
 }
 if(source.get('arrival')==='agentic-core')query.set('arrival','agentic-core');
 return '/workspace'+(query.size?'?'+query:'');
}
function enterWorkspace() {
 const target=workspaceDestination();
 if(!document.fullscreenElement){location.assign(target);return;}
 const frame=document.createElement('iframe');workspaceFrame=frame;pendingWorkspaceFrame=frame;frame.title='System Architecture Workspace';frame.allow='fullscreen';frame.src=target;
 frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;background:transparent;color-scheme:normal;z-index:10000;visibility:hidden';
 const isCurrent=()=>workspaceFrame===frame&&pendingWorkspaceFrame===frame;
 const fail=()=>{
  if(!isCurrent())return;
  resetLoading();document.querySelector('#login-error').textContent='Unable to load the workspace. Please try signing in again.';
  form.querySelector('[type=submit]').focus();
 };
 frame.addEventListener('load',()=>{
  if(!isCurrent())return;
  let destination;try{destination=new URL(frame.contentWindow.location.href,location.href);}catch{fail();return;}
  if(destination.origin!==location.origin){fail();return;}
  if(destination.pathname!=='/workspace'&&destination.pathname!=='/workspace/'){
   resetLoading();location.assign(destination.href);return;
  }
  // Mark the frame complete before restoring the loader visual. Cancellation
  // only removes pending frames, so a completed workspace remains attached.
  pendingWorkspaceFrame=null;
  resetLoading();shell.hidden=true;sky.setPaused(true);skyCanvas.hidden=true;sculpture.setPaused(true);
  history.pushState({workspace:true},'',target);document.title='System Architecture Workspace';frame.style.visibility='visible';frame.focus();
 });
 frame.addEventListener('error',fail);
 document.body.append(frame);
}
function beginLoading() {
 const visual=document.querySelector('#entry-infinity'),rect=visual.getBoundingClientRect(),overlay=document.createElement('section');
 overlay.className='entry-loader';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');overlay.setAttribute('aria-label','Loading System Architecture Workspace');overlay.tabIndex=-1;
 overlay.innerHTML='<div class="loader-orbit" aria-hidden="true"></div><div class="loader-copy"><h1 class="silver-agentic">System Architecture Workspace</h1><div class="loader-dots" aria-hidden="true">'+Array.from({length:6},(_,i)=>'<span style="--dot:'+i+'"></span>').join('')+'</div><p class="loader-message">Loading Your Experience...</p></div>';
 const placeholder=document.createElement('div');placeholder.style.cssText='width:'+rect.width+'px;height:'+rect.height+'px;';visual.before(placeholder);
 const state={visual,parent:visual.parentNode,next:visual.nextSibling,style:visual.style.cssText,placeholder,overlay,timer:null,animation:null};loading=state;
 document.body.append(overlay);const orbit=overlay.querySelector('.loader-orbit');orbit.append(visual);visual.style.cssText='width:'+rect.width+'px;height:'+rect.height+'px;';orbit.style.width=rect.width+'px';orbit.style.height=rect.height+'px';
 const scale=Math.min(1,Math.min(420,innerWidth-44,innerHeight*.5)/Math.max(rect.width,rect.height));overlay.style.setProperty('--loader-orbit-half',rect.height*scale/2+'px');
 const from='translate(-50%,-50%) translate('+(rect.left+rect.width/2-innerWidth/2)+'px,'+(rect.top+rect.height/2-innerHeight*.35)+'px)';
 const to='translate(-50%,-50%) scale('+scale+')';orbit.style.transform=to;
 if(!motion.matches)state.animation=orbit.animate([{transform:from},{transform:to}],{duration:850,easing:'cubic-bezier(.22,.72,.2,1)',fill:'forwards'});
 shell.inert=true;document.body.classList.add('entry-loading');overlay.classList.add('is-moving');overlay.focus({preventScroll:true});document.documentElement.dataset.loaderStartedAt=String(Date.now());
 state.timer=setTimeout(()=>{if(loading!==state)return;document.documentElement.dataset.loaderCompletedAt=String(Date.now());enterWorkspace();},5000);
}
form.addEventListener('submit',async event=>{
 event.preventDefault();const button=form.querySelector('[type=submit]'),error=document.querySelector('#login-error');if(button.disabled)return;
 button.disabled=true;button.querySelector('span').textContent='Signing In';button.querySelector('.login-spinner').hidden=false;error.textContent='';
 const generation=++authGeneration;const request=new AbortController();authRequest=request;
 // Preserve the fullscreen gesture before authentication consumes activation.
 if(!document.fullscreenElement&&document.fullscreenEnabled)document.documentElement.requestFullscreen().catch(()=>{});
 try {
  const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},signal:request.signal,body:JSON.stringify({username:form.elements.namedItem('username').value,password:password.value})});
  const result=await response.json();if(generation!==authGeneration)return;
  if(!response.ok)throw new Error(result.error||'Unable to sign in. Please try again.');
  authRequest=null;password.value='';password.type='password';visibility.setAttribute('aria-pressed','false');visibility.setAttribute('aria-label','Show password');beginLoading();
 } catch(problem) {
  if(generation!==authGeneration||problem.name==='AbortError')return;
  authRequest=null;error.textContent=problem.message==='Failed to fetch'?'Unable to connect. Please try again.':problem.message;resetButton();password.focus();
 }
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&loading){resetLoading();form.querySelector('[type=submit]').focus();}});
window.addEventListener('pagehide',event=>{
 cancelAuthentication();resetLoading();if(scrollFrame)cancelAnimationFrame(scrollFrame);if(hashFrame)cancelAnimationFrame(hashFrame);scrollFrame=hashFrame=0;
 if(event.persisted){sky.setPaused(true);sculpture.setPaused(true);}else{disposed=true;sky.dispose();sculpture.dispose();}
});
window.addEventListener('pageshow',event=>{
 if(!event.persisted)return;
 resetButton();
 if(workspaceFrame){sky.setPaused(true);sculpture.setPaused(true);return;}
 shell.hidden=false;skyCanvas.hidden=false;sky.setPaused(false);sculpture.setPaused(false);showView(routeView(location.pathname)||'workspace',{restore:true});
});
showView(routeView(location.pathname)||'workspace',{restore:true});
