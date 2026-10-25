import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const edits=[
 ['Select a next connection there to continue.','Select the next connection there to continue.'],
 ['It addresses failures that isolated component tests cannot establish, including interactions, missing guards and inconsistent operating assumptions.','It addresses failures that isolated component tests may not detect, including those caused by interactions, missing guards and inconsistent operating assumptions.'],
 ['Digest mismatch, obsolete authority or absent artifacts blocks resume.','Resumption is blocked by a digest mismatch, obsolete authority or absent artifacts.'],
 ['Unclear mechanism or insufficient observations blocks advancement.','Advancement is blocked by an unclear mechanism or insufficient observations.'],
 ['Connects every required pattern to child component, guard, test and current evidence.','Connects every required pattern to a child component, a guard, a test and current evidence.'],
 ['External effects require validated schema, reserved budget and a qualified adapter binding.','External effects require a validated schema, a reserved budget and a qualified adapter binding.'],
 ['A separate task definition, role and workspace performs independent tests.','Independent tests use a separate task definition, role and workspace.'],
 ['Its first page maps all35 capabilities and68 interfaces; its second page explains18 representative deployment communication paths; the other six pages are logical subsystem studies.','Its first page maps all 35 capabilities and 68 interfaces; its second page explains 18 representative deployment communication paths; the other six pages are logical subsystem studies.'],
 ['all35 studies, all68 interfaces','all 35 studies, all 68 interfaces'],
 ['use Full Architecture for all35/68.','use Full Architecture for all 35 capabilities and 68 interfaces.'],
 ['Version K and WorkflowSpec; map every required pattern to child component, enforcing guard, positive/negative tests and current evidence.','Version K and WorkflowSpec; map every required pattern to a child component, an enforcing guard, positive/negative tests and current evidence.'],
 ['Handoff exact current attested package','Hand off the exact current attested package'],
 ['A success HTTP status or transport receipt alone may be insufficient.','A successful HTTP status or transport receipt alone may be insufficient.'],
 ['I017/I018 delivers a particular user-governed MOA package.','The I017/I018 release sequence delivers a particular user-governed MOA package.'],
];
const documents=fs.readdirSync(path.join(root,'dist/aws')).filter(file=>file.endsWith('.md')).map(file=>'dist/aws/'+file);
for(const relative of ['dist/index.html','dist/aws/architecture-data.json','tools/build_docs.py','tools/package_enterprise.py',...documents]){
 const file=path.join(root,relative);let text=fs.readFileSync(file,'utf8');const before=text;
 for(const [old,replacement] of edits)text=text.replaceAll(old,replacement);
 if(text!==before){fs.writeFileSync(file,text);console.log('Polished '+relative);}
}
const manifestPath=path.join(root,'dist/aws/file-manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
for(const entry of manifest.files){const file=path.join(root,'dist',entry.path);if(fs.existsSync(file)){const bytes=fs.readFileSync(file);entry.bytes=bytes.length;entry.sha256=createHash('sha256').update(bytes).digest('hex');}}
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
