import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await import('../dist/assets/formal-model.js');
const model=globalThis.AC_FORMAL;
const graph=JSON.parse(fs.readFileSync(path.join(root,'dist/aws/architecture-data.json'),'utf8')).blueprint;
const counts={structure:0,moduleConfigurations:0,scenarios:0,gateConjunctions:0,subjectBindingCases:0,planCases:0,sequenceCases:0};
const check=(category,label,fn)=>{try{fn();counts[category]++;}catch(error){throw new Error(label+': '+error.message,{cause:error});}};
check('structure','35 exact node studies and current source hash',()=>{
  assert.deepEqual(Object.keys(model.nodeStudies).sort(),graph.nodes.map(n=>n.id).sort());
  const sorted=value=>Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])])):value;
  const canonical=JSON.stringify(sorted(graph)).replace(/[\u0080-\uffff]/g,char=>'\\u'+char.charCodeAt(0).toString(16).padStart(4,'0'));
  assert.equal(model.source.canonicalSha256,createHash('sha256').update(canonical).digest('hex'));
});
check('structure','68 exact interface contracts',()=>assert.deepEqual(Object.keys(model.edgeContracts).sort(),graph.edges.map(e=>e.id).sort()));
for(const edge of graph.edges) check('structure',edge.id+' identity and guard',()=>{
  const formal=model.edgeContracts[edge.id];
  for(const key of ['source','target','type'])assert.equal(formal[key],edge[key]);
  assert.deepEqual(formal.requirements,edge.requires);
  assert.ok(formal.formula.length>15 && formal.explanation.length>15 && formal.postcondition.length>5);
  for(const id of formal.prerequisites) assert.ok(model.edgeContracts[id]);
});
const ids=new Set(graph.nodes.map(n=>n.id));
const modules=Object.keys(graph.modules);
for(let bits=0;bits<(1<<modules.length);bits++) check('moduleConfigurations','module set '+bits,()=>{
  const enabled=new Set(modules.filter((_,i)=>bits&(1<<i)));
  const nodes=new Set(graph.nodes.filter(n=>n.module==='core'||enabled.has(n.module)).map(n=>n.id));
  const edges=graph.edges.filter(e=>e.requires.every(m=>enabled.has(m)));
  for(const edge of edges) assert.ok(ids.has(edge.source)&&ids.has(edge.target)&&nodes.has(edge.source)&&nodes.has(edge.target));
  assert.equal(edges.some(e=>e.id==='I067'),enabled.has('memory')&&enabled.has('learning'));
  assert.equal(edges.some(e=>e.id==='I068'),enabled.has('memory')&&enabled.has('learning'));
});
for(const scenario of model.scenarios) check('scenarios',scenario.id,()=>{
  const result=model.evaluateGate(scenario.stage,model.scenarioState(scenario.id));
  assert.equal(result.ok,scenario.expected);
  assert.equal(result.failures.length===0,scenario.expected);
});
// Exhaust every combination of seven independently required release facts.
// These are supplied abstract facts, not a test of their external enforcement.
const releaseFacts=[['approval','authorityCurrent'],['evidence','testsPass'],['owner','accepted'],['finalEvidence','picPass'],['finalEvidence','manifestCurrent'],['releaseAuthority','authorised'],['finalAttestation','committed']];
for(let bits=0;bits<(1<<releaseFacts.length);bits++) check('gateConjunctions','release conjunction '+bits,()=>{
  const state=model.sampleState();releaseFacts.forEach(([section,key],i)=>{state[section][key]=Boolean(bits&(1<<i));});
  assert.equal(model.evaluateGate('release',state).ok,bits===(1<<releaseFacts.length)-1);
});
// Exact subject relationships: report hashes must not be mistaken for artifact hashes.
for(const artifact of ['artifact-A','artifact-B'])for(const reportSubject of ['artifact-A','artifact-B'])for(const ownerSubject of ['artifact-A','artifact-B'])for(const reportHash of ['report-X','report-Y']) check('subjectBindingCases','artifact/report/owner binding',()=>{
  const state=model.sampleState();state.artifact.digest=artifact;state.evidence.subjectDigest=reportSubject;state.owner.subjectDigest=ownerSubject;state.evidence.reportDigest=reportHash;
  assert.equal(model.evaluateGate('acceptance',state).ok,artifact===reportSubject&&artifact===ownerSubject);
});
check('subjectBindingCases','contract version replay',()=>{const s=model.sampleState();s.contract.version=2;assert.equal(model.evaluateGate('release',s).ok,false);});
check('subjectBindingCases','stale evidence dependencies',()=>{const s=model.sampleState();s.dependencyFingerprint='deps-B';assert.equal(model.evaluateGate('acceptance',s).ok,false);});
check('subjectBindingCases','unaccepted manifest component',()=>{const s=model.sampleState();s.integrated.manifest.push('unknown');assert.equal(model.evaluateGate('attestation',s).ok,false);});
check('subjectBindingCases','foreign owner cannot accept',()=>{const s=model.sampleState();s.owner.identity='another-owner';assert.equal(model.evaluateGate('acceptance',s).ok,false);});
check('subjectBindingCases','same bytes from stale evidence attempt are rejected',()=>{const s=model.sampleState();s.evidence.attemptFence=6;assert.equal(model.evaluateGate('acceptance',s).ok,false);});
check('subjectBindingCases','same bytes from stale owner attempt are rejected',()=>{const s=model.sampleState();s.owner.attemptFence=6;assert.equal(model.evaluateGate('acceptance',s).ok,false);});
check('subjectBindingCases','receipt key mismatch',()=>{const s=model.sampleState();s.receipt.idempotencyKey='other';assert.equal(model.evaluateGate('delivery',s).ok,false);});
check('subjectBindingCases','no accidental equality between report and artifact required',()=>{const s=model.sampleState();assert.notEqual(s.evidence.reportDigest,s.artifact.digest);assert.equal(model.evaluateGate('acceptance',s).ok,true);});
const planCases=[
  [[{id:'a',owner:'o',deps:[]}],true],
  [[{id:'a',owner:'o',deps:[]},{id:'b',owner:'p',deps:['a']}],true],
  [[{id:'a',owner:'o',deps:['a']}],false],
  [[{id:'a',owner:'o',deps:['b']},{id:'b',owner:'p',deps:['a']}],false],
  [[{id:'a',owner:'o',deps:['missing']}],false],
  [[{id:'a',owner:'',deps:[]}],false],
  [[{id:'a',owner:'o',owners:['o','p'],deps:[]}],false],
  [[{id:'a',owner:'o',owners:['p'],deps:[]}],false],
  [[{id:'a',owner:'o',deps:[]},{id:'a',owner:'p',deps:[]}],false],
  [[],false]
];
for(const [plan,ok] of planCases)check('planCases','DAG and ownership',()=>assert.equal(model.validatePlan(plan).ok,ok));
check('sequenceCases','every happy path phase can be admitted in order',()=>{
  let state=model.sampleState();
  for(const stage of model.stageOrder){const result=model.runEvent(state,stage);assert.equal(result.ok,true,stage);state=result.state;}
  assert.equal(state.phase,'delivery');assert.equal(state.history.length,model.stageOrder.length);
});
for(const stage of model.stageOrder.slice(1))check('sequenceCases','cannot jump from intake to '+stage,()=>assert.equal(model.runEvent(model.sampleState(),stage).ok,false));
check('sequenceCases','unknown state cannot start a trace',()=>{const s=model.sampleState();s.phase='invented';assert.equal(model.runEvent(s,'intake').ok,false);});
check('sequenceCases','rejected gate has no state mutation',()=>{const s=model.scenarioState('stale-approval');s.phase='binding';const before=JSON.stringify(s);const result=model.runEvent(s,'execution');assert.equal(result.ok,false);assert.equal(JSON.stringify(s),before);assert.deepEqual(result.state,s);});
check('sequenceCases','unknown gate is denied',()=>assert.equal(model.evaluateGate('invented',model.sampleState()).ok,false));
check('sequenceCases','all gates deny missing state',()=>{for(const stage of model.stageOrder)assert.equal(model.evaluateGate(stage,{}).ok,false,stage);});
check('sequenceCases','rejection does not require prior acceptance',()=>{
  assert.match(model.edgeContracts.I012.postcondition,/Rejection/);
  assert.match(model.edgeContracts.I019.guard,/RejectedOrFailed/);
  assert.deepEqual(model.edgeContracts.I019.prerequisites,[]);
});
const output={status:'PASS',scope:'Finite local graph and guard model checks. No cloud/runtime/security/business correctness proof.',counts,total:Object.values(counts).reduce((a,b)=>a+b,0),modelSha256:createHash('sha256').update(fs.readFileSync(path.join(root,'dist/assets/formal-model.js'))).digest('hex'),source:model.source,scenarioResults:model.scenarios.map(s=>({id:s.id,title:s.title,stage:s.stage,expected:s.expected,observed:model.evaluateGate(s.stage,model.scenarioState(s.id)).ok}))};
fs.writeFileSync(path.join(root,'dist/aws/Mathematical-Connection-Checks.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
