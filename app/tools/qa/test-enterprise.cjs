const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {parseHTML}=require('./node_modules/linkedom');
const path=__dirname+'/../../dist/index.html',html=fs.readFileSync(path,'utf8'),{window,document}=parseHTML(html);
const errors=[];let checks=0;
const rect=()=>({x:0,y:0,left:0,top:0,right:1200,bottom:800,width:1200,height:800});
window.Element.prototype.getBoundingClientRect=rect;
window.Element.prototype.setPointerCapture=()=>{};window.Element.prototype.releasePointerCapture=()=>{};
window.devicePixelRatio=1;window.innerWidth=1600;window.innerHeight=1000;
const storage={getItem:()=>null,setItem:()=>{}};const media=()=>({matches:false,addEventListener:()=>{}});
const ctx=vm.createContext({window,document,console:{log:()=>{},warn:()=>{},error:()=>{}},localStorage:storage,matchMedia:media,navigator:{userAgent:'DOM verification'},location:{hash:''},Event:window.Event,MutationObserver:class{observe(){}},ResizeObserver:class{observe(){}},requestAnimationFrame:()=>0,setTimeout:()=>0,clearTimeout:()=>{},performance,Math,Map,Set,JSON,TextEncoder,URL});
for(const s of document.querySelectorAll('script'))if(s.type!=='application/json')vm.runInContext(s.textContent,ctx,{timeout:20000});
const app=window.ACReference;
function check(name,fn){try{fn();checks++;}catch(e){errors.push({name,error:e.stack||e.message});}}
const click=el=>{assert(el);el.dispatchEvent(new window.Event('click',{bubbles:true}));};
const ev=(type,target,props)=>{const e=new window.Event(type,{bubbles:true,cancelable:true});Object.assign(e,props);target.dispatchEvent(e);};
check('Full parent runtime initializes without WebGL',()=>assert(app&&app.data.nodes.length===35));
const originalEnabled=app.getState().enabled;
app.setPage('aws');
check('AWS reuses workspace and keeps layer selection',()=>{assert(!document.querySelector('#workspace').hidden);assert(!document.querySelector('#awsViewport').hidden);assert(document.querySelector('#conceptViewport').hidden);assert(document.querySelector('#viewport').hidden);assert.deepEqual(app.getState().enabled,originalEnabled);assert(!document.querySelector('iframe'));});
check('AWS initial scale is readable',()=>assert(app.aws.getState().scale>=.65));
click(document.querySelector('#allModules'));
check('Existing Full Architecture reveals all35/68',()=>{assert.equal(app.getState().visibleNodes.length,35);assert.equal(app.aws.getState().visibleEdges.length,68);assert.equal(document.querySelectorAll('#awsWorld [data-ac-node]').length,35);});
for(const n of app.data.nodes){
 const g=document.querySelector(`#awsWorld [data-ac-node="${n.id}"]`);click(g);
 check('Shared card study / authority / exact source: '+n.id,()=>{const t=document.querySelector('#study').textContent;assert.equal(app.getState().selected.id,n.id);assert(t.includes(n.name));assert(t.includes(n.inputs));assert(t.includes(n.outputs));assert(t.includes(n.rule));assert(t.includes('Alternative & trade-off'));assert(t.includes('Security / trust boundary'));assert(!document.body.classList.contains('panelClosed'));assert.equal(g.dataset.guidance,'current');});
}
for(const e of app.data.edges){app.select('edge',e.id);check('Shared exact interface and AWS transport: '+e.id,()=>{const t=document.querySelector('#study').textContent;assert.equal(app.getState().selected.id,e.id);for(const field of ['name','payload','pre','post','failure','rule'])assert(t.includes(e[field]),field);assert(t.includes('Selected AWS interface transport'));});}
for(let mask=0;mask<32;mask++){const ids=Object.keys(app.data.modules).filter((_,i)=>mask&(1<<i));app.setModules(ids);check('Rendered module dependency combination '+mask,()=>{const expected=app.data.nodes.filter(n=>n.module==='core'||ids.includes(n.module));const es=app.data.edges.filter(e=>e.requires.every(m=>ids.includes(m)));assert.equal(app.aws.getState().visibleNodes.length,expected.length);assert.equal(app.aws.getState().visibleEdges.length,es.length);for(const e of app.data.edges){const g=document.querySelector(`[data-ac-edge="${e.id}"]`);assert.equal(g.style.display!=='none',es.some(x=>x.id===e.id));}for(const n of app.data.nodes){const g=document.querySelector(`[data-ac-node="${n.id}"]`);assert.equal(g.style.display!=='none',expected.some(x=>x.id===n.id));}});}
app.setModules([]);app.select('edge','I067');check('Cross-module interface enables BOTH modules',()=>assert.deepEqual(new Set(app.getState().enabled),new Set(['memory','learning'])));
app.setModules(Object.keys(app.data.modules));app.select('node','core');app.setScope('neighbours');
check('Existing Neighbours scope narrows exact arrows',()=>assert(app.aws.getState().visibleEdges.length<68&&app.aws.getState().visibleEdges.length>0));
app.setScope('route');check('AWS route includes PIC test obligation I011',()=>assert(app.aws.getState().visibleEdges.includes('I011')));
app.setScope('system');app.clearSelection();
click(document.querySelector('#tour'));check('Existing requirement tour starts at User',()=>assert.equal(app.getState().selected.id,'user'));
for(let i=1;i<12;i++){app.stepTour(i);check('Shared tour step '+i,()=>assert.equal(app.getState().selected.id,app.data.route[i]));}
app.endTour();app.aws.infra('broker');check('Infrastructure study uses SAME inspector tabs',()=>{assert(document.querySelector('#study').textContent.includes('same account'));assert.equal(document.querySelectorAll('#inspector .tabs button').length,2);});
app.select('node','pic');check('Capability selection exits infrastructure study',()=>assert.equal(app.aws.getState().infraSelection,null));
click(document.querySelector('#cameraToggle'));check('Existing dock camera panel',()=>assert.equal(document.querySelector('#rightControlPanel').dataset.section,'camera'));
const before=app.aws.getState().scale;click(document.querySelector('#zoomIn'));check('Existing Camera zoom controls AWS',()=>assert(app.aws.getState().scale>before));
app.fit();check('Existing Fit controls AWS geometry',()=>{const s=app.aws.getState();assert(Object.values(s).filter(v=>typeof v==='number').every(Number.isFinite));assert(s.scale>=.08);});
app.aws.readable();const vp=document.querySelector('#awsViewport'),node=document.querySelector('[data-ac-node="user"]');app.select('node','user');
const initial=app.aws.getState();ev('pointerdown',node,{button:0,pointerId:1,clientX:100,clientY:100});ev('pointermove',vp,{pointerId:1,clientX:150,clientY:130});ev('pointerup',vp,{pointerId:1,clientX:150,clientY:130});
check('Pan can start on capability card',()=>assert.equal(app.aws.getState().x,initial.x+50));
ev('click',node,{clientX:150,clientY:130});check('Drag does not accidentally select/clear',()=>assert.equal(app.getState().selected.id,'user'));
ev('pointerdown',node,{button:0,pointerId:1,clientX:100,clientY:100});ev('pointerdown',vp,{button:0,pointerId:2,clientX:200,clientY:100});const k=app.aws.getState().scale;ev('pointermove',vp,{pointerId:2,clientX:250,clientY:100});check('Pinch can start on capability card',()=>assert(app.aws.getState().scale>k));ev('pointerup',vp,{pointerId:2,clientX:250,clientY:100});ev('pointerup',vp,{pointerId:1,clientX:100,clientY:100});
const search=document.querySelector('#search');search.value='AppConfig';ev('input',search,{});check('Existing search finds AWS service mappings',()=>assert(document.querySelector('#indexResults').textContent.includes('Version Registry')));
search.value='';ev('input',search,{});app.clearSelection();click(document.querySelector('#guideStart'));check('Existing Guide selects User in AWS',()=>assert.equal(app.getState().selected.id,'user'));
app.setPage('concept');check('Concept view returns with original controls',()=>{assert(!document.querySelector('#conceptViewport').hidden);assert(document.querySelector('#awsViewport').hidden);assert(!document.querySelector('#workspace').hidden);});
app.select('node','pic');check('Concept selection still renders source research panel',()=>{assert.equal(app.getState().selected.id,'pic');assert(document.querySelector('#study').textContent.includes('Pattern Inheritance'));});
app.setPage('reference');check('Reference view returns with 3D controls',()=>{assert(!document.querySelector('#viewport').hidden);assert(document.querySelector('#awsViewport').hidden);assert(document.querySelector('#conceptViewport').hidden);assert(!document.querySelector('#spreadModules').hidden);assert.equal(app.getState().page,'reference');});
app.select('node','core');check('Reference source role still works',()=>assert(document.querySelector('#study').textContent.includes('The Core Control Plane')));
app.setPage('aws');click(document.querySelector('#skeleton'));check('Existing Core Architecture removes optional AWS layers',()=>{assert.equal(app.getState().visibleNodes.length,12);assert.equal(app.aws.getState().visibleEdges.length,22);assert.equal(document.querySelector('[data-aws-infra="credentials"]').style.display,'none');});
const report={method:'Actual bundled parent scripts executed in linkedom/Node VM with WebGL unavailable; DOM and event verification, not rendered browser testing',passed:checks,failed:errors.length,errors};
fs.writeFileSync(__dirname+'/../../dist/aws/interaction-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(errors.length)process.exit(1);
