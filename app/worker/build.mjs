import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';

const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.zip':'application/zip','.md':'text/markdown; charset=utf-8','.csv':'text/csv; charset=utf-8','.drawio':'application/xml'};
const content={},largeFiles={};
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const name=path.join(dir,e.name);if(e.isDirectory()){if(!['server','.openai'].includes(e.name))walk(name);continue;}
 const route='/'+path.relative('dist',name).split(path.sep).join('/');const data=fs.readFileSync(name);const type=types[path.extname(name)]||'application/octet-stream';
 if(data.length>2_000_000&&['.png','.zip'].includes(path.extname(name)))largeFiles[route]={type,size:data.length,sha256:createHash('sha256').update(data).digest('hex')};
 else content[route]={type,gzip:gzipSync(data,{level:9}).toString('base64')};
}}
walk('dist');
// Only assets used by the shared public entry shell are available anonymously.
const publicAssets=['/assets/agentic-core-mark.svg','/assets/login.css','/assets/login.js','/assets/starfield.js','/assets/infinity.css','/assets/infinity.js'];
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/content.js','export const content='+JSON.stringify(content)+';\nexport const largeFiles='+JSON.stringify(largeFiles)+';\nexport const publicAssets='+JSON.stringify(publicAssets)+';\n');
fs.copyFileSync('worker/index.mjs','dist/server/index.js');
fs.copyFileSync('worker/workspace-store.mjs','dist/server/workspace-store.mjs');
console.log('Worker built: '+Object.keys(content).length+' embedded resources; '+Object.keys(largeFiles).length+' private archive files.');
