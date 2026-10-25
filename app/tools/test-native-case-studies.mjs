import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const baseline='383c421';
const original=file=>execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
const scripts=['architecture-programs.js','agentic-node01.js','agentic-program.js','website-program.js','study-identity.js','architectural-depth-analysis.js'];
function load(reader){
  const context=vm.createContext({window:{},URL,URLSearchParams,console});
  for(const file of scripts)vm.runInContext(reader('dist/assets/'+file),context,{filename:file});
  return context.window;
}
const current=load(read),previous=load(original);
const programmes=[current.SAWAgenticProgram,current.SAWWebsiteProgram];
const oldProgrammes=[previous.SAWAgenticProgram,previous.SAWWebsiteProgram];
const models=programme=>[programme.overview,...programme.stages.map(stage=>stage.model)];
const plain=value=>JSON.parse(JSON.stringify(value));
const keys=['requirements','services','connections','architecture','operations','security','reliability','performance','cost','sustainability','decision','failure','evidence'];
const pillarKeys=['operations','security','reliability','performance','cost','sustainability'];
const list=value=>Array.isArray(value)?value:[value];
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let checks=0;
function check(name,body){body();checks++;console.log('PASS '+name);}
function detail(model,key){
  const renderer=Object.create(current.SAWArchitecturalDepthAnalysis.prototype);
  renderer.data=model;renderer.nodes=model.nodes;renderer.edges=model.edges;
  return renderer.detail(key);
}

check('the existing page identities select their original native programmes',()=>{
  assert.equal(current.SAWProgramModel.forPage({id:'agentic-core'}),programmes[0]);
  assert.equal(current.SAWProgramModel.forPage({id:'system-architecture-workspace-1-0'}),programmes[1]);
  assert.equal(current.SAWProgramModel.forPage({id:'custom-workspace',coreVersion:'system-architecture-workspace-v1'}),programmes[1]);
});
check('all seven stages and existing saved node and edge anchors remain stable',()=>{
  programmes.forEach((programme,index)=>{
    const old=oldProgrammes[index];
    assert.equal(programme.stages.length,7);
    assert.equal(programme.overview.nodes.length,7);
    assert.deepEqual(plain(programme.stages.map(stage=>[stage.id,stage.serial])),plain(old.stages.map(stage=>[stage.id,stage.serial])));
    models(programme).forEach((model,modelIndex)=>{
      const before=models(old)[modelIndex];
      assert.equal(model.id,before.id);
      assert.equal(model.scopeId,before.scopeId);
      assert.deepEqual(plain(model.nodes.map(node=>node.id)),plain(before.nodes.map(node=>node.id)));
      assert.deepEqual(plain(model.edges.map(edge=>[edge.id,edge.from,edge.to])),plain(before.edges.map(edge=>[edge.id,edge.from,edge.to])));
      for(const node of model.nodes)assert.equal(current.SAWStudyIdentity.nodeSerial(model,node.id),previous.SAWStudyIdentity.nodeSerial(before,node.id));
      for(const edge of model.edges)assert.equal(current.SAWStudyIdentity.edgeSerial(model,edge.id),previous.SAWStudyIdentity.edgeSerial(before,edge.id));
    });
  });
});
check('native graphs retain complete directed connections and valid drill-downs',()=>{
  for(const programme of programmes)for(const model of models(programme)){
    const ids=new Set(model.nodes.map(node=>node.id));
    assert.equal(ids.size,model.nodes.length);
    assert.equal(new Set(model.edges.map(edge=>edge.id)).size,model.edges.length);
    for(const edge of model.edges){
      assert.ok(ids.has(edge.from)&&ids.has(edge.to),edge.id+' has a missing endpoint');
      assert.equal(edge.source,edge.from);assert.equal(edge.target,edge.to);
      assert.ok(typeof edge.details==='string'&&edge.details.trim().length>15,edge.id+' needs an interface description');
    }
    for(const node of model.nodes)if(node.exploreScope)assert.ok(programme.stages.some(stage=>stage.id===node.exploreScope),node.id+' has no drill-down');
  }
});
check('all thirteen native analysis cards render the exact model decisions and evidence',()=>{
  for(const programme of programmes)for(const model of models(programme))for(const key of keys){
    const entry=model.analysis[key];assert.ok(entry,model.id+':'+key);
    const output=detail(model,key);assert.ok(output?.html);
    for(const field of ['decision','alternatives','risks','validation','owner']){
      const values=list(entry[field]);assert.ok(values.length>0,model.id+':'+key+':'+field);
      for(const value of values){
        assert.ok(typeof value==='string'&&value.trim().length>3);
        assert.ok(output.html.includes(escape(value)),model.id+':'+key+' does not render '+field);
      }
    }
    assert.ok(output.html.includes('AWS runtime evidence has not been collected'));
  }
});
check('the six pillar cards have distinct case-study decisions at the complete-system level',()=>{
  for(const programme of programmes){
    const statements=pillarKeys.map(key=>JSON.stringify(programme.overview.analysis[key].decision));
    assert.equal(new Set(statements).size,6);
    for(const key of pillarKeys)assert.ok(detail(programme.overview,key).html.includes('https://docs.aws.amazon.com/wellarchitected/'));
  }
});
check('the inspector escapes authored strings while retaining array paragraphs',()=>{
  const source=programmes[0].overview;
  const model={...source,analysis:{...source.analysis,security:{...source.analysis.security,
    decision:['<img src=x onerror=alert(1)>','A separate second paragraph & exact digest.']}}};
  const html=detail(model,'security').html;
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(html.includes('<p>A separate second paragraph &amp; exact digest.</p>'));
  assert.ok(!html.includes('<img src=x'));
});
check('native AWS mappings have real local assets, safe source URLs and declared trust placement',()=>{
  for(const programme of programmes)for(const model of models(programme)){
    assert.match(model.awsRegionLabel,/eu-west-2/);
    assert.match(model.awsAccountLabel,/account/i);
    for(const node of model.nodes){
      const aws=node.aws;assert.ok(aws,node.id+' has no AWS mapping');
      assert.ok(['external','global','regional'].includes(aws.placement),node.id+': '+aws.placement);
      assert.ok(fs.existsSync(path.join(root,'dist',aws.icon)),node.id+' icon '+aws.icon);
      assert.equal(new URL(aws.url).protocol,'https:');
      assert.ok(['docs.aws.amazon.com','aws.amazon.com'].includes(new URL(aws.url).hostname));
      assert.ok(list(aws.why).join(' ').length>10);
      assert.ok(!/^(?:deployed|passed|production proven)$/i.test(String(node.status)));
      for(const service of aws.services||[]){
        assert.ok(fs.existsSync(path.join(root,'dist',service.icon)),node.id+' missing service icon '+service.icon);
        if(service.url)assert.equal(new URL(service.url).protocol,'https:');
      }
    }
  }
});
check('customer browsers and human authorities stay outside the AWS boundary',()=>{
  for(const programme of programmes)for(const model of models(programme))for(const node of model.nodes){
    if(/(?:^Authenticated human owner$|^Customer browser$|^Customer \/ reviewer$|^Browser$)/i.test(node.aws?.service||''))
      assert.equal(node.aws.placement,'external',node.id);
    if(/(?:Amazon CloudFront|AWS Amplify)/.test(node.aws?.service||''))
      assert.equal(node.aws.placement,'global',node.id);
  }
});
function uiShell(html){
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
    .replace(/\?v=\d+/g,'').replace(/\r\n/g,'\n');
}
check('the native workspace and sign-in shells preserve the original v79 interface',()=>{
  for(const file of ['dist/index.html','dist/login/index.html']){
    assert.ok(uiShell(read(file))===uiShell(original(file)),file+' changed the native UI');
    assert.ok(!read(file).includes('href="/case-studies/"'));
  }
  const styleFiles=execFileSync('git',['ls-tree','-r','--name-only',baseline,'dist/assets'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(file=>file.endsWith('.css'));
  for(const file of styleFiles)assert.ok(read(file).replace(/\r\n/g,'\n')===original(file).replace(/\r\n/g,'\n'),file+' changed the existing styles');
});
check('all four native views still share the same active programme and scope',()=>{
  for(const file of ['dist/assets/website-explorer.js','dist/assets/aws-system-diagram.js','dist/assets/concept-design.js','dist/assets/brain-model.js','dist/assets/architectural-depth-analysis.js']){
    assert.ok(read(file).replace(/\r\n/g,'\n')===original(file).replace(/\r\n/g,'\n'),file+' changed a native view instead of the authored content');
  }
});


check('deep links select only the two existing projects and supported native views',()=>{
  const route=current.SAWProgramModel.route;
  for(const projectId of ['agentic-core','system-architecture-workspace-1-0']){
    for(const view of ['brain','concept','ada','aws']){
      assert.deepEqual(plain(route('?project='+projectId+'&view='+view)),{projectId,view,scope:'overview'});
    }
    for(const view of ['', 'unknown', 'https://example.com', '<script>']){
      assert.deepEqual(plain(route('?project='+projectId+'&view='+encodeURIComponent(view))),{projectId,view:'aws',scope:'overview'});
    }
  }
  for(const query of ['', '?view=aws', '?project=missing', '?project=agentic-core-scaled', '?project=../../private', '?project=https://example.com']){
    assert.equal(route(query),null);
  }
});


function startProduct(search,saved){
  const storage=new Map(saved?[['saw-design-pages-v1',JSON.stringify(saved)]]:[]);
  const elements=new Map(),scopes=[],activations=[],urls=[];
  class Element{
    constructor(){this.dataset={};this.style={};this.hidden=false;this.classList={add(){},remove(){},toggle(){}};}
    addEventListener(){} setAttribute(){} removeAttribute(){} insertBefore(){} replaceChildren(){}
    get parentElement(){return this;}
  }
  const document={body:new Element(),querySelector(selector){if(!elements.has(selector))elements.set(selector,new Element());return elements.get(selector);},querySelectorAll(){return [];},createElement(){return new Element();},addEventListener(){}};
  const window={...current,history:{state:{existing:true},replaceState(_state,_title,url){urls.push(String(url));}},ACReference:{data:current.SAWAgenticProgram.overview,clearSelection(){},setModules(){}},
    SAWWebsiteData:current.SAWWebsiteProgram.overview,
    SAWWebsite:{active:true,activate(page){activations.push(plain(page));},setProgramScope(scope){scopes.push(scope);}},
    addEventListener(){}};
  const context=vm.createContext({window,document,location:{search,pathname:'/workspace',hash:'#kept',href:'https://native.example/workspace'+search+'#kept'},URL,URLSearchParams,history:{state:{existing:true},replaceState(_state,_title,url){urls.push(String(url));}},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
    fetch:async()=>({ok:true,json:async()=>({configured:false})}),console});
  vm.runInContext(read('dist/assets/workspace-product.js'),context,{filename:'workspace-product.js'});
  return {state:JSON.parse(storage.get('saw-design-pages-v1')),scopes,activations,urls};
}
check('native startup preserves user drafts and conflict metadata while selecting a deep link',()=>{
  const stamp='2026-10-24T10:00:00.000Z',sha='a'.repeat(40);
  const page=(id,name)=>({schemaVersion:1,coreVersion:'agentic-core-reference-v1',id,name,
    description:'My saved description',view:'concept',modules:[],sections:[{id:'scope-note',name:'My contract notes',anchor:'ac2-receive',
    purpose:'Keep my own notes',inputs:'Customer brief',outputs:'Contract',acceptance:'Exact approval',awsNotes:'Unchanged personal draft'}],updatedAt:stamp});
  const ac=page('agentic-core','Agentic Core'),custom=page('personal-draft','My personal design');
  const saved={active:'personal-draft',pages:[ac,custom],shas:{'agentic-core':sha,'personal-draft':sha},
    synced:{'agentic-core':stamp,'personal-draft':stamp},dirty:{'agentic-core':false,'personal-draft':true},
    pending:{'personal-draft':{sha,page:custom}}};
  const opened=startProduct('?project=agentic-core&view=aws&mode=keep',saved);
  assert.equal(opened.state.active,'agentic-core');
  assert.equal(opened.state.pages.find(item=>item.id==='agentic-core').view,'aws');
  assert.deepEqual(opened.state.pages.find(item=>item.id==='personal-draft'),custom);
  assert.deepEqual(opened.state.pages.find(item=>item.id==='agentic-core').sections,ac.sections);
  assert.deepEqual(opened.state.shas,saved.shas);
  assert.deepEqual(opened.state.synced,saved.synced);
  assert.deepEqual(opened.state.pending,saved.pending);
  assert.equal(opened.state.dirty['personal-draft'],true);
  assert.deepEqual(opened.scopes,['overview']);
  assert.equal(opened.activations[0].id,'agentic-core');
  const consumed=new URL(opened.urls[0],'https://native.example');
  assert.equal(consumed.pathname,'/workspace');
  assert.equal(consumed.search,'?mode=keep');
  assert.equal(consumed.hash,'#kept');
  const ordinary=startProduct('',saved);
  assert.equal(ordinary.state.active,'personal-draft');
  assert.equal(ordinary.state.pages.find(item=>item.id==='personal-draft').view,'concept');
  assert.deepEqual(ordinary.scopes,[]);
  assert.deepEqual(ordinary.urls,[]);
  const missing=startProduct('?project=system-architecture-workspace-1-0&view=ada',saved);
  assert.equal(missing.state.pages.length,3);
  assert.equal(missing.state.active,'system-architecture-workspace-1-0');
  assert.equal(missing.state.pages.at(-1).view,'ada');
  assert.deepEqual(missing.state.pages.find(item=>item.id==='personal-draft'),custom);
});

check('case studies remain authored designs with an explicit evidence and scope boundary',()=>{
  for(const programme of programmes){
    const model=programme.overview,text=JSON.stringify(model);
    assert.match(text,/eu-west-2/);
    assert.ok(/100/.test(text),model.id+' lacks pilot workload assumptions');
    assert.ok(/1,?000/.test(text),model.id+' lacks sensitivity assumptions');
    assert.match(text,/assum|propos/i);
    assert.match(text,/not.{0,80}(deployed|run|performed|collected)|unrun|unperformed/i);
    assert.match(JSON.stringify(model.analysis.evidence),/design|prototype|proposed/i);
    assert.ok(model.overview.workflow.length>=4);
    assert.ok(list(model.sourceNote).join(' ').length>100);
  }
  const ac=JSON.stringify(programmes[0].overview);
  assert.match(ac,/two.{0,50}(attempt|human)|k\s*=\s*2/i);
  assert.match(ac,/acceptance/);
  const workspace=JSON.stringify(programmes[1].overview);
  assert.match(workspace,/Cloudflare Worker/);
  assert.match(workspace,/GitHub/);
  assert.match(workspace,/OAC|Origin Access Control/);
});

console.log('Native case-study model, inspector and UI preservation checks passed: '+checks);
