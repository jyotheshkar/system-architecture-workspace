import pathlib,re,json
R=pathlib.Path(__file__).parent;O=R.parent/'dist';s=(R/'revision-baseline.html').read_text();d=json.loads((O/'aws/architecture-data.json').read_text())
payload={k:d[k] for k in ['mapping','interfaces','enterprise','decisions','security','failures','references','status']}
payload['enterprise']={k:v for k,v in payload['enterprise'].items() if k not in ['icons']}
css='''
/* AWS renderer in the shared architecture workspace. */
#awsViewport{position:absolute;inset:0;overflow:hidden;touch-action:none;cursor:grab;background:var(--black)}#awsViewport.isPanning{cursor:grabbing}#awsWorld{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}#awsWorld>svg{display:block;overflow:visible}#awsReadout{position:absolute;left:20px;top:16px;color:#acacb6;background:#080808e8;padding:5px 9px;border-radius:4px;font-size:10px;pointer-events:none}#awsViewport .awsCapability{cursor:pointer;outline:none;--aws-accent:#ae8dea}#awsViewport .awsCapability .awsCardBox{fill:#080808;stroke:#74747e;transition:stroke .15s,stroke-width .15s}#awsViewport .awsCapability:hover .awsCardBox,#awsViewport .awsCapability:focus-visible .awsCardBox{stroke:var(--aws-accent,#bbb);stroke-width:3}#awsViewport .awsCapability.active .awsCardBox,#awsViewport .awsCapability.ready .awsCardBox{stroke:var(--aws-accent);stroke-width:3}#awsViewport .awsCapability.pulse .awsCardBox{stroke:var(--aws-accent);animation:awsPulse 2s ease-in-out infinite}#awsViewport .awsCapability.dim{opacity:.2}#awsViewport .awsCapability.compact text,#awsViewport .awsCapability.compact .awsServiceBox{visibility:hidden}#awsViewport .awsCapability.compact image{visibility:visible}#awsViewport .awsConnection{cursor:pointer;outline:none}#awsViewport .awsConnection .awsLine{stroke:var(--aws-edge-color,#777)}#awsViewport .awsConnection:hover .awsLine,#awsViewport .awsConnection:focus-visible .awsLine{stroke:#fff;stroke-width:3}#awsViewport .awsConnection.direct .awsLine,#awsViewport .awsConnection.selected .awsLine{stroke-width:2.5}#study a{color:#c8afe8;text-decoration-color:#776885;text-underline-offset:3px}body.awsMode .hint{white-space:normal;text-align:center;max-width:calc(100% - 120px)}@keyframes awsPulse{0%,100%{stroke-opacity:.45;stroke-width:1.6}50%{stroke-opacity:1;stroke-width:3}}@media(prefers-reduced-motion:reduce){#awsViewport .awsCapability.pulse .awsCardBox{animation:none}}@media(max-width:760px){#awsReadout{left:12px;top:10px;font-size:9px;max-width:calc(100% - 24px)}}
'''
s=s.replace('</style>',css+'</style>',1)
s=s.replace('</style>','<style-marker></style>',1).replace('<style-marker>','#awsReadout{left:auto;top:auto;right:18px;bottom:15px;font-size:11px;max-width:calc(100% - 80px)}#awsViewport .awsEdgeLabel{visibility:hidden}#awsViewport .awsConnection.direct .awsEdgeLabel,#awsViewport .awsConnection.selected .awsEdgeLabel,#awsViewport .awsConnection:hover .awsEdgeLabel,#awsViewport .awsConnection:focus-visible .awsEdgeLabel{visibility:visible}#awsViewport .awsConnection .awsTwin{stroke-width:.7}#awsViewport .awsPatternDiamond{stroke:var(--aws-edge-color,#777)}',1)
view='<div id="awsViewport" hidden tabindex="0" role="region" aria-label="Interactive AWS enterprise reference architecture"><div id="awsWorld"></div><div id="awsReadout" aria-live="polite"></div></div>'
s=s.replace('<div class="boundaryLabel">',view+'<div class="boundaryLabel">',1)
s=re.sub(r'<section id="placeholder"[\s\S]*?</section>','<section id="placeholder" hidden><button id="back" hidden>Return to Reference Architecture</button></section>',s,count=1)
s=s.replace("function systemPanel(){","function systemPanel(){\n if(page==='aws')return awsSystemPanel();",1)
s=s.replace("function nodePanel(n,selectedEdge=null){","function nodePanel(n,selectedEdge=null){\n if(page==='aws')return awsNodePanel(n,selectedEdge);",1)
s=s.replace(" const e=selectionActive&&selected.kind==='edge'?edgeBy[selected.id]:null;"," const e=selectionActive&&selected.kind==='edge'?edgeBy[selected.id]:null;\n if(page==='aws'&&tab==='selection'&&awsInfraSelection){$('#study').innerHTML=awsInfraPanel(awsInfraSelection);$$('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));$('#study').setAttribute('aria-labelledby','nodesTab');$('#study').scrollTop=0;renderIndex();return;}",1)
s=s.replace("function select(kind,id){","function select(kind,id){awsInfraSelection=null;",1)
s=s.replace("function clearSelection(","function clearSelection(",1)
# Insert reset at the function body without depending on argument defaults.
s=re.sub(r'(function clearSelection\([^\n{]*\)\{)',r'\1awsInfraSelection=null;',s,count=1)
s=s.replace("if(page==='concept')focusConcept(kind==='node'?id:edgeBy[id].source);","if(page==='concept')focusConcept(kind==='node'?id:edgeBy[id].source);if(page==='aws')awsFocus(kind==='node'?id:edgeBy[id].source);",1)
s=s.replace("if(page==='concept')focusConcept(id)}","if(page==='concept')focusConcept(id);if(page==='aws')awsFocus(id)}",1)
s=s.replace("function stepTour(i){","function stepTour(i){awsInfraSelection=null;",1)
old=re.search(r'^function setPage\(p\)\{[^\n]+',s,re.M).group(0)
new=old.replace("$('#workspace').hidden=p==='aws';$('#placeholder').hidden=p!=='aws';$('#placeholderTitle').textContent='AWS System Design Architecture';if(p==='aws'){const f=$('#awsArchitectureFrame');if(!f.getAttribute('src'))f.setAttribute('src',f.dataset.src)}","$('#workspace').hidden=false;$('#placeholder').hidden=true;$('#awsViewport').hidden=p!=='aws';document.body.classList.toggle('awsMode',p==='aws');")
new=new.replace("document.body.classList.toggle('conceptMode',p==='concept');","document.body.classList.toggle('conceptMode',p!=='reference');")
new=new.replace("p==='concept'?","p!=='reference'?")
new=new.replace("p==='concept';","p!=='reference';").replace("p!=='concept';","p==='reference';")
new=new.replace("$('#conceptViewport').hidden=p==='reference';","$('#conceptViewport').hidden=p!=='concept';")
new=new.replace("p!=='reference'?'Pan, zoom or focus the concept diagram'","p==='aws'?'Pan, zoom or focus the AWS diagram':p==='concept'?'Pan, zoom or focus the concept diagram'")
new=new.replace("p!=='reference'?'Move around the concept diagram'","p==='aws'?'Move around the AWS diagram':p==='concept'?'Move around the concept diagram'")
new=new.replace("$('#stage').setAttribute('aria-label',p!=='reference'?'Interactive 2D concept design architecture':'Interactive 3D reference architecture');","$('#stage').setAttribute('aria-label',p==='aws'?'Interactive AWS enterprise reference architecture':p==='concept'?'Interactive 2D concept design architecture':'Interactive 3D reference architecture');")
new=new.replace("openDock(null);if(p==='concept')","$('#conceptReadable').textContent=p==='aws'?'Read from intake':'Read from top';$('.hint').textContent=p==='reference'?'Drag to orbit · Shift-drag to pan · Scroll to zoom · Double-click a node to focus':'Drag to pan · Shift-scroll to move · Scroll or pinch to zoom · Double-click to focus';openDock(null);if(p==='aws'){renderAWS();awsResize();if(!awsState.initialized){awsReadable();awsState.initialized=true;notify('AWS shares the selected layers. Full Architecture shows all 35 capabilities and 68 interfaces. Use the existing Guide, Camera and Explore tools.');}}else if(p==='concept')")
new=new.replace("Enterprise Cloud Architecture · Reference Design","AWS Enterprise Reference Design · Nested Deployment")
conceptCaption=re.search(r'<button id="conceptReadable"[^>]*>(.*?)</button>',s).group(1)
new=new.replace("$('#conceptReadable').textContent=p==='aws'?'Read from intake':'Read from top';","$('#conceptReadable').textContent="+json.dumps(conceptCaption)+";")
new=new.replace("$('.guideCamera p').textContent=p!=='reference'?","$('.guideCamera p').textContent=p==='aws'?'Drag or Shift-scroll to pan. Scroll or pinch to zoom. Read from intake starts at the business approval boundary; Fit shows the entire deployment. Double-click or press F to focus. Select an interface to inspect its guarded contract.':p==='concept'?")
new=new.replace('Read from intake starts at the business approval boundary','Readable view starts at the selected capability or business approval boundary')
assert new!=old and 'awsArchitectureFrame' not in new;s=s.replace(old,new,1)
s=s.replace("#viewport,#conceptViewport,#inspector","#viewport,#conceptViewport,#awsViewport,#inspector",1)
s=s.replace("function fit(front=false){","function fit(front=false){if(page==='aws'){awsFit();return;}",1)
s=s.replace("function resize(){","function resize(){if(page==='aws'){awsResize();return;}",1)
s=s.replace("function focusNode(id){","function focusNode(id){if(page==='aws'){awsFocus(id);return;}",1)
s=s.replace("function focusSelection(){","function focusSelection(){if(page==='aws'&&awsInfraSelection){awsFocus(awsInfraSelection);return;}",1)
s=s.replace("if(page==='concept')renderConcept();}","if(page==='concept')renderConcept();if(page==='aws')renderAWS();}")
s=s.replace("if(page==='concept')zoomConcept(1.2);else","if(page==='aws')awsZoom(1.2);else if(page==='concept')zoomConcept(1.2);else",1)
s=s.replace("if(page==='concept')zoomConcept(1/1.2);else","if(page==='aws')awsZoom(1/1.2);else if(page==='concept')zoomConcept(1/1.2);else",1)
s=s.replace("if(page==='concept'){conceptKey(ev);return;}","if(page==='aws'){awsKey(ev);return;}if(page==='concept'){conceptKey(ev);return;}",1)
s=s.replace("page==='concept'&&e.id==='I011'","(page==='concept'||page==='aws')&&e.id==='I011'",1)
s=s.replace("$('#conceptReadable').onclick=()=>{readConceptFromTop();","$('#conceptReadable').onclick=()=>{if(page==='aws'){awsReadable();notify('Read from the authenticated intake boundary. Fit shows the full deployment; Follow connections explains each capability.');return;}readConceptFromTop();",1)
# Search includes AWS service terms while retaining exactly the existing search surface.
s=s.replace("(n.name+' '+n.responsibility).toLowerCase().includes(q)","(n.name+' '+n.responsibility+(page==='aws'?' '+awsMap[n.id].services.join(' ')+' '+awsMap[n.id].what:'')).toLowerCase().includes(q)",1)
s=s.replace("</script><script>'use strict';","</script><script id=\"awsArchitectureData\" type=\"application/json\">"+json.dumps(payload,separators=(',',':')).replace('</','<\\/')+"</script><script>'use strict';\nlet awsInfraSelection=null;",1)
anchor="$('#focus').innerHTML=focusIcon+'<span>Focus</span>';"
assert anchor in s;s=s.replace(anchor,(R/'aws-shared.js').read_text()+'\n'+anchor,1)
s=s.replace("window.ACReference={data:A,","window.ACReference={data:A,aws:{fit:awsFit,focus:awsFocus,zoom:awsZoom,readable:awsReadable,infra:awsStudyInfra,getState:()=>({...awsState,visibleNodes:activeNodes().map(n=>n.id),visibleEdges:awsVisibleEdges().map(e=>e.id),infraSelection:awsInfraSelection})},",1)
s=s.replace("drawnEdges:Object.entries(edgeMeshes).filter(([id,o])=>o.group.visible).map(([id])=>id)","drawnEdges:page==='aws'?awsVisibleEdges().map(e=>e.id):Object.entries(edgeMeshes).filter(([id,o])=>o.group.visible).map(([id])=>id)",1)
s=s.replace("};\n</script>","};\nif(location.hash==='#aws')setPage('aws');\n</script>",1)
assert 'iframe id="awsArchitectureFrame"' not in s
(O/'index.html').write_text(s)
(O/'aws/index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Agentic Core AWS Architecture</title><meta http-equiv="refresh" content="0;url=../index.html#aws"><p><a href="../index.html#aws">Open the AWS architecture in the shared explorer</a></p></html>')
print(json.dumps({'parentBytes':len(s),'awsUsesSharedWorkspace':True,'separateIframeRemoved':True}))
