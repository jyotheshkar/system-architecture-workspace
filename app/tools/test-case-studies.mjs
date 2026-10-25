import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import worker from '../dist/server/index.js';
let checks=0;
function check(value){assert.ok(value);checks++;}
const origin='https://case.example';
for(const path of ['/case-studies','/case-studies/','/case-studies/index.html']){
 for(const [project,expected] of [['agentic','agentic-core'],['workspace','system-architecture-workspace-1-0'],['system-architecture-workspace-1-0','system-architecture-workspace-1-0'],['bad','agentic-core']]){
  const url=origin+path+'?project='+project;
  for(const method of ['GET','HEAD']){
   const r=await worker.fetch(new Request(url,{method}),{},{});
   check(r.status===308);
   check(r.headers.get('location')===origin+'/workspace?project='+expected+'&view=aws');
  }
  check((await worker.fetch(new Request(url,{method:'POST'}),{},{})).status===405);
 }
}
for(const path of ['/case-studies/case-studies.json','/case-studies/agentic-core.svg','/case-studies/workspace.svg','/case-studies/app.js','/assets/agentic-program.js','/assets/website-program.js','/aws/index.html','/server/content.js']){
 const r=await worker.fetch(new Request(origin+path),{},{});
 check([303,401].includes(r.status));
}
for(const [query,expected] of [
 ['project=agentic-core&view=aws','project=agentic-core&view=aws'],
 ['project=system-architecture-workspace-1-0&view=ada','project=system-architecture-workspace-1-0&view=ada'],
 ['project=agentic-core&view=bad','project=agentic-core&view=aws'],
 ['project=unknown&view=aws',''],
 ['next=https://foreign.example&project=agentic-core&view=concept','project=agentic-core&view=concept']
]){
 const r=await worker.fetch(new Request(origin+'/workspace?'+query),{},{});
 check(r.status===303);
 check(r.headers.get('location')===origin+'/login'+(expected?'?'+expected:''));
}
const source=fs.readFileSync('dist/assets/login.js','utf8');
const destination=source.slice(source.indexOf('function workspaceDestination()'),source.indexOf('function enterWorkspace()'));
for(const [search,expected] of [
 ['?project=agentic-core&view=aws','/workspace?project=agentic-core&view=aws'],
 ['?project=system-architecture-workspace-1-0&view=ada','/workspace?project=system-architecture-workspace-1-0&view=ada'],
 ['?project=agentic-core&view=bad&next=https://foreign.example','/workspace?project=agentic-core&view=aws'],
 ['?project=unknown&view=aws','/workspace'],
 ['?arrival=agentic-core','/workspace?arrival=agentic-core']
]){
 const context={URLSearchParams,location:{search}};
 check(vm.runInNewContext(destination+'\nworkspaceDestination()',context)===expected);
}
check(source.includes('frame.src=target'));
check(source.includes("history.pushState({workspace:true},'',target)"));
for(const name of ['index.html','style.css','app.js'])check(!fs.existsSync('dist/case-studies/'+name));
check(!fs.readFileSync('dist/index.html','utf8').includes('href="/case-studies/"'));
console.log('Native case-study redirects, sign-in continuity and private access checks passed: '+checks);
