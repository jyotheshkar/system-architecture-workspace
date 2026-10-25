import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync,gzipSync} from 'node:zlib';
import worker from '../dist/server/index.js';
process.stdin.setRawMode?.(true);process.stdout.write('Ready for preview configuration.\n');let input='';
process.stdin.on('data',chunk=>{input+=chunk.toString();if(!/[\r\n]/.test(input))return;const values=JSON.parse(input.trim());start(values);});
function start(values){
 process.stdin.removeAllListeners('data');const records=new Map();
 const env={...values,ARCHIVE:{async get(key){const item=records.get(key);if(!item)return null;return {body:item.bytes,json:async()=>JSON.parse(new TextDecoder().decode(item.bytes))};},async put(key,data){records.set(key,{bytes:typeof data==='string'?new TextEncoder().encode(data):new Uint8Array(data)});},async delete(key){records.delete(key);}}};
 for(const file of ['/aws/Agentic-Core-AWS-Architecture.png','/aws/Deployment-Communication.png','/aws/Agentic-Core-AWS-Reference-Pack.zip'])records.set('files'+file,{bytes:fs.readFileSync(path.join('dist',file))});
 http.createServer(async(req,res)=>{try{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','preview-owner');const url='http://127.0.0.1:8768'+req.url;const request=new Request(url,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
  const response=await worker.fetch(request,env,{});const out=Object.fromEntries(response.headers);if(out.location)out.location=out.location.replace('https://agentic-core.jyothesh-karnam.chatgpt.site','http://127.0.0.1:8767');
  let data=Buffer.from(await response.arrayBuffer());if(out['content-type']?.startsWith('text/html')){const raw=out['content-encoding']==='gzip'?gunzipSync(data):data;const html=raw.toString().replaceAll('https://agentic-core.jyothesh-karnam.chatgpt.site','http://127.0.0.1:8767');data=out['content-encoding']==='gzip'?gzipSync(html):Buffer.from(html);}res.writeHead(response.status,out);res.end(data);
 }catch{res.writeHead(500);res.end('Preview request failed.');}}).listen(8768,'127.0.0.1',()=>console.log('Authenticated reference preview ready.'));
 const mainRoot='../Agentic Core Hosted Recovery/dist';const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
 http.createServer((req,res)=>{let file=path.resolve(mainRoot,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!file.startsWith(path.resolve(mainRoot)+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}let data=fs.readFileSync(file);if(['.html','.js'].includes(path.extname(file)))data=Buffer.from(data.toString().replaceAll('https://ac-workspace.jyothesh-karnam.chatgpt.site','http://127.0.0.1:8768'));res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}).listen(8767,'127.0.0.1',()=>console.log('Landing navigation preview ready.'));
}
