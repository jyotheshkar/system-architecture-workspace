(() => {
  'use strict';
  let data = window.SAWWebsiteData, program=null, activePage=null, scopeId='overview';
  let scopePreferences={};
  try{const saved=JSON.parse(localStorage.getItem('saw-study-scopes-v79')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))scopePreferences=saved;}catch{}
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  if (!data) return;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let by = Object.fromEntries(data.nodes.map(n => [n.id,n]));
  const isPage = p => p?.id === 'system-architecture-workspace-1-0' || p?.coreVersion === 'system-architecture-workspace-v1';
  let active = false, view = 'brain', layers = new Set(['core']), tab = 'system', selected = null, dock = null, fullArchitecture = true;
  let referenceRenderer, conceptRenderer, awsRenderer, brainRenderer, adaRenderer, adaDetail = null, width = 1, height = 1, frameId = 0, zoom = 1, panX = 0, panY = 0, brainRotation = -.22, brainPitch = .13, labels = true, connectionsOnly = false, pointer = null;
  const root = document.createElement('div'); root.id = 'websiteViewport'; root.hidden = true; root.tabIndex = 0; root.setAttribute('role','region'); root.setAttribute('aria-label','Website architecture. Drag to pan, scroll to zoom, Home to fit.');
  $('#stage').prepend(root);
  const brainIntro=document.createElement('div');brainIntro.className='brainConceptHeader';brainIntro.hidden=true;
  brainIntro.innerHTML='<span class="brainConceptKicker">3D BRAIN · PRODUCT CONCEPT</span><p>A customer\'s idea, made explorable. Build a connected model, understand its complexity, and use its structured data to prepare baseline architectures.</p><button class="brainConceptAbout" data-site-study="system">About this concept ↗</button>';
  root.append(brainIntro);
  const programCrumb=document.createElement('div');programCrumb.className='programCrumb';programCrumb.hidden=true;root.append(programCrumb);
  const tools = document.createElement('div');tools.id='websiteTools';tools.hidden=true;$('#rightControlPanel').append(tools);
  function loadModel(p,requestedScope){
    activePage=p;program=window.SAWProgramModel?.forPage(p)||null;
    fullArchitecture=isPage(p)||!!program;
    scopeId=requestedScope||scopePreferences[p.id]||'overview';
    const stage=program?.stages.find(item=>item.id===scopeId);
    if(!stage)scopeId='overview';
    const model=stage?.model||program?.overview||window.SAWArchitectureData?.forPage(p)||window.SAWWebsiteData;
    data={...model,title:stage?stage.name:(p.name||model.title),programTitle:p.name||program?.title,
      programStages:program?.stages.map(item=>({id:item.id,serial:item.serial,name:item.name,summary:item.summary}))||[]};
    programCrumb.hidden=!program;
    programCrumb.innerHTML=stage?'<button type="button" data-program-scope="overview" aria-label="Back to all seven nodes">← All seven nodes</button><span aria-hidden="true">/</span><strong>'+esc(stage.serial)+'. '+esc(stage.name)+'</strong>':'<span>Complete architecture</span><span class="programHint">Select a node to explore its detailed design</span>';
    root.classList.toggle('programModel',!!program);
    root.dataset.programScope=scopeId;
    by=Object.fromEntries(data.nodes.map(n=>[n.id,n]));
    root.classList.toggle('foundationModel',!!data.foundation);
    root.classList.toggle('node01Model',!!data.node01);
    selected=null;adaDetail=null;
    referenceRenderer?.setData(data);conceptRenderer?.setData(data);awsRenderer?.setData(data);brainRenderer?.setData(data);adaRenderer?.setData(data);
    brainIntro.innerHTML=data.node01?'<span class="brainConceptKicker">3D BRAIN · CUSTOMER REQUIREMENT INTAKE</span><p>Follow an idea from the customer to a safely stored request, then explore its handoff, history and recovery paths.</p><button class="brainConceptAbout" data-site-study="system">Understand this model ↗</button>':'<span class="brainConceptKicker">3D BRAIN · PRODUCT CONCEPT</span><p>A customer\'s idea, made explorable. Build a connected model, understand its complexity, and use its structured data to prepare baseline architectures.</p><button class="brainConceptAbout" data-site-study="system">About this concept ↗</button>';
    if(program)brainIntro.innerHTML='<span class="brainConceptKicker">3D BRAIN · '+esc(scopeId==='overview'?'COMPLETE SYSTEM':data.title.toUpperCase())+'</span><p>'+esc(data.overview.summary)+'</p><button class="brainConceptAbout" data-site-study="system">Understand this design ↗</button>';
    root.setAttribute('aria-label',data.title+'. Drag to pan, scroll to zoom, Home to fit.');

  }
  function setProgramScope(next){
    if(!program||!activePage||(next!=='overview'&&!program.stages.some(item=>item.id===next)))return;
    scopePreferences[activePage.id]=next;
    try{localStorage.setItem('saw-study-scopes-v79',JSON.stringify(scopePreferences));}catch{}
    window.SAWProduct?.close(false);openDock(null);document.body.classList.add('panelClosed');
    loadModel(activePage,next);connectionsOnly=false;tab='system';setLayers(null,false);setPage(view);schedule();
    announce(next==='overview'?'Complete architecture. Select a node to explore inside.':data.title+' detailed architecture.');
  }
  const shown = () => data.nodes.filter(n => layers.has(n.group)).sort((a,b)=>(a.layer||0)-(b.layer||0)||(a.order||0)-(b.order||0));
  const scopedEdges = () => {const ids=new Set(shown().map(n=>n.id));return data.edges.filter(e=>(fullArchitecture||data.presentation.journeyEdges.includes(e.id))&&ids.has(e.from)&&ids.has(e.to));};
  const shownEdges = () => scopedEdges().filter(e=>!connectionsOnly||!selected||(selected.kind==='edge'?e.id===selected.id:e.from===selected.id));
  function initDiagrams(){
    if(referenceRenderer)return;
    referenceRenderer=new window.SAWReferenceModel(root);
    conceptRenderer=new window.SAWConceptDesign(root);conceptRenderer.setData(data);
    awsRenderer=new window.SAWSysDiagram(root);
    adaRenderer=new window.SAWArchitecturalDepthAnalysis(root,{onInspect:detail=>{adaDetail=detail;selected=null;showStudy("selection");announce(detail.title+" selected. Review its decisions and validation questions.");schedule();}});
    adaRenderer.setData(data);
    referenceRenderer.setData(data);awsRenderer.setData(data);
  }
  function schedule(){if(active&&!frameId)frameId=requestAnimationFrame(paint);}
  function paint(){
    frameId=0;if(!active||document.hidden)return;
    const rect=root.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    const displayBrain=view==='brain',displayAda=view==='ada',displayConcept=view==='concept',displayAws=view==='aws';
    root.dataset.mode=view;root.dataset.layers=[...layers].join(' ');
    brainIntro.hidden=!displayBrain;
    if(displayBrain&&!brainRenderer){brainRenderer=new window.SAWBrainModel(root);brainRenderer.setData(data);}
    const hasNodes=shown().length>0;
    referenceRenderer.setVisible(false);conceptRenderer.setVisible(hasNodes&&displayConcept);awsRenderer.setVisible(hasNodes&&displayAws);brainRenderer?.setVisible(hasNodes&&displayBrain);adaRenderer.setVisible(hasNodes&&displayAda);
    const model={nodes:shown(),edges:displayAda?scopedEdges():shownEdges(),selected,width,height,labels,zoom,panX,panY};
    if(displayAda)adaRenderer.render(model);
    else if(displayConcept)conceptRenderer.render(model);
    else if(displayBrain){const inset=Math.ceil(brainIntro.offsetTop+brainIntro.getBoundingClientRect().height+12);root.style.setProperty('--brain-content-top',inset+'px');brainRenderer.render({...model,height:Math.max(120,height-inset),rotation:brainRotation,pitch:brainPitch});}
    else if(displayAws)awsRenderer.render(model);else referenceRenderer.render(model);
  }
  function fit(){zoom=1;panX=panY=0;if(view==='brain'){brainRotation=-.22;brainPitch=.13;}schedule();}
  function announce(message){const el=$('#delta');el.textContent=message;el.classList.add('visible');}
  function setPage(next){
    if(next==='reference')next='concept';
    if(!['brain','concept','ada','aws'].includes(next))return;
    view=next;adaDetail=null;adaRenderer?.clearSelection();if(next!=='aws'&&tab==='aws')tab='system';
    const viewName={brain:'3D Brain',concept:'Concept Design Architecture',ada:'Architectural Depth Analysis',aws:'AWS System Design Architecture'}[view];
    $('#stage').setAttribute('aria-label',data.title+' '+viewName);
    root.setAttribute('aria-label',data.title+'. '+viewName+(view==='brain'?'. Drag to orbit, Shift-drag to pan, scroll to zoom, Home to fit.':view==='ada'||view==='concept'||(view==='aws'&&(data.node01||data.programModel))?'. Scroll through the design and select a component to understand it.':'. Drag to pan, scroll to zoom, Home to fit.'));
    $('#cameraToggle').setAttribute('aria-label',view==='brain'?'3D camera controls':view==='ada'?'Analysis overview':view==='concept'?'Concept overview':(data.node01||data.programModel)?'AWS design overview':'Pan and zoom controls');
    $$('[data-page]').forEach(b=>{if(b.dataset.page===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    $('#architectureModelName').dataset.modelDescription=data.title+' '+viewName;
    if(dock==='camera'){openDock(null);openDock('camera');}
    fit();renderStudy();window.dispatchEvent(new Event('saw:website-statechange'));
  }
  function syncControls(){const open=!document.body.classList.contains('panelClosed')&&!document.body.dataset.productDrawer;$$('#detailsDock [data-tab]').forEach(b=>b.setAttribute('aria-expanded',String(open&&b.dataset.tab===tab)));$('#detailsTitle').textContent={system:'System Overview',aws:'AWS Design',selection:'Individual Nodes'}[tab];}
  function showStudy(next,toggle=false){
    const wasOpen=!document.body.classList.contains('panelClosed')&&!document.body.dataset.productDrawer&&tab===next;
    window.SAWProduct?.close(false);openDock(null);tab=next;
    document.body.classList.toggle('panelClosed',toggle&&wasOpen);renderStudy();schedule();
  }
  const textList=v=>Array.isArray(v)?v:String(v||'').split(/\n\s*\n/).filter(Boolean);
  const paragraphs=v=>textList(v).map(p=>`<p>${esc(p)}</p>`).join('');
  const nodeNumber=id=>window.SAWStudyIdentity.nodeSerial(data,id);
  const edgeNumber=id=>window.SAWStudyIdentity.edgeSerial(data,id);
  const nodeLink=id=>`<button class="websiteTextLink" data-site-node="${esc(id)}">${esc(nodeNumber(id))}. ${esc(by[id]?.name||id)}</button>`;
  function programOverview(){
    const stages=scopeId==='overview'?'<h3>Explore all seven nodes</h3><div class="websiteComponentList">'+data.programStages.map(item=>'<button type="button" class="websiteTextLink" data-program-scope="'+esc(item.id)+'">'+esc(item.serial)+'. '+esc(item.name)+'<small>'+esc(item.summary)+'</small></button>').join('')+'</div>':'';
    return '<span class="researchLabel">'+esc(scopeId==='overview'?'COMPLETE SYSTEM':'DETAILED DESIGN · '+data.scopeSerial)+'</span><h2>'+esc(data.title)+'</h2><p class="intro">'+esc(data.overview.summary)+'</p>'+stages+'<h3>From request to result</h3><ol class="websiteJourney">'+data.overview.workflow.map(step=>'<li><strong>'+esc(step.title)+'</strong>'+paragraphs(step.detail)+'</li>').join('')+'</ol><h3>Failure and recovery</h3>'+paragraphs(data.overview.failures)+'<h3>Source and design status</h3>'+paragraphs(data.sourceNote||data.presentation.disclosure)+'<p>Use the same scope in 3D Brain, Concept Design Architecture, Architectural Depth Analysis and AWS System Design Architecture. ADA records decisions, alternatives, risks and required evidence for this exact design.</p>';
  }
  function exploreLink(node){return node?.exploreScope&&program?.stages.some(item=>item.id===node.exploreScope)?'<button type="button" class="programExplore" data-program-scope="'+esc(node.exploreScope)+'">Explore inside '+esc(program.stages.find(item=>item.id===node.exploreScope).name)+' ↗</button>':'';}
  function numberingGuide(){
    if(program)return '<details class="foundationStudy"><summary>How to read the study numbers</summary><p>The complete architecture has seven stable node addresses. Inside a node, its components use that prefix: 2.1, 2.2 and so on. Connection branches add a letter, such as 2.1.a. Switching views preserves these addresses.</p><p>'+esc(program.id==='agentic'?'The seven numbers are the version 79 study grouping. Node 01 retains the supplied AWS v7.1 detail; the remaining node designs extend the supplied foundation.':'The seven stages follow the product from the customer brief to a reviewed baseline package.')+'</p></details>';
    const sections=window.SAWStudyIdentity.sections(data).filter(section=>layers.has(section.id)),core=sections.find(section=>section.id==='core');
    return `<details class="foundationStudy"><summary>How to read the study numbers</summary><p>Each architectural section has its own scale. A component such as 1.2 is component 2 in section 1. Numbers stay the same across the 3D Brain, concept, analysis and AWS views.</p>${core?`<p>Core runs from ${nodeLink(core.first)} to ${nodeLink(core.last)}. Numbers describe the study sequence; arrows show the actual branches, checks and return paths.</p>`:''}<ul>${sections.map(section=>`<li>${esc(section.serial)}. ${esc(section.label)}: ${section.count?esc(section.serial+'.1')+' to '+esc(section.serial+'.'+section.count):'no components'}</li>`).join('')}</ul><p>A connection such as 1.1.a is outgoing branch a of component 1.1. Select it to see its numbered source and destination. Letters distinguish connection labels from component numbers. A shared component keeps the number of its home section in the 3D Brain, analysis and AWS views.</p></details>`;
  }
  function brainConceptOverview(){return `<span class="researchLabel">3D BRAIN · SOFTWARE PRODUCT CONCEPT</span><h2>Make an idea understandable before it becomes infrastructure.</h2><p class="intro">A customer brings an idea. Together, we develop a connected system model that they can explore in 3D, then use the reviewed model as the data source for baseline system architectures.</p><h3>1. Capture the customer's idea</h3><p>Record the intended users, desired outcomes, features, constraints, data and unresolved questions. Prompts are an entry point for a modelling conversation.</p><h3>2. Develop the 3D Brain</h3><p>Turn the brief into named components and explicit relationships. Each component carries its purpose, inputs, outputs, owner and assumptions. Connections explain dependencies and how information moves. The view helps us inspect the same structured model from different levels of detail.</p><h3>3. Give the customer a way to explore</h3><p>The proposed customer experience is an invited, project-specific view where they can explore components, trace dependencies and understand how one decision affects the rest of their idea. Questions and agreed revisions would stay linked to the model.</p><h3>4. Use the model as a design data source</h3><p>A reviewed snapshot contains stable component IDs, relationships, requirements, constraints and revision history. This structured data provides the input for baseline architecture generation, with each design choice traceable to the customer's model.</p><h3>5. Prepare an AWS baseline for engineering review</h3><p>Map responsibilities to candidate services and document interfaces, access boundaries, reliability assumptions and cost considerations. AWS engineers review and refine the baseline before implementation.</p><h3>What this demonstration does today</h3><p>You can orbit, pan, zoom and inspect the existing ${esc(data.title)} model in 3D. Select a component to study its responsibility and connections. Concept Design Architecture explains its responsibilities and flow; Architectural Depth Analysis examines the design rationale; AWS System Design Architecture shows the proposed service layout.</p><p class="websiteStatus">Product concept: customer prompting, collaborative editing, customer access management and automatic baseline generation are planned capabilities.</p><p>Model checks can test recorded constraints and dependencies. A visual model alone does not prove that a deployed system meets its requirements.</p>`;}
  function node01Overview(){
    return `<span class="researchLabel">AGENTIC CORE · NODE 01 · PROPOSED DESIGN</span><h2>A customer's idea, safely received.</h2><p class="intro">${esc(data.overview.summary)}</p><h3>Read the journey in four views</h3><p>The 3D Brain helps a customer explore responsibilities. Concept Design Architecture explains the flow without cloud terminology. Architectural Depth Analysis records decisions, risks and evidence needs. AWS System Design Architecture maps the same responsibilities to proposed services.</p><h3>From idea to durable handoff</h3><ol class="websiteJourney">${data.overview.workflow.map(step=>`<li><strong>${esc(step.title.replace(/^\d+\. /,''))}</strong><p>${esc(step.detail)}</p></li>`).join('')}</ol><h3>What the customer can rely on in the design</h3><p>A successful intake response means the request and its receipt were committed together. It does not mean the next component has completed any work. The status comes from stored evidence.</p><h3>Three states to understand</h3><p><strong>Pending send:</strong> the request is stored and waiting for handoff.</p><p><strong>Queue acknowledged:</strong> the queue has accepted the reference; the handoff obligation remains open.</p><p><strong>Downstream accepted:</strong> Node 02 has returned an authenticated durable receipt. Its internal implementation is outside this file.</p><h3>When something goes wrong</h3>${paragraphs(data.overview.failures)}<h3>Scope and evidence</h3><p>${esc(data.overview.current)}</p><p>${esc(data.presentation.disclosure)}</p><p>Source: Agentic Core Node 01 AWS v7.1, supplied draw.io file with executive design, detailed deployment, interaction sequence, six-pillar review and evidence traceability.</p>`;
  }
  function foundationOverview(){
    const f=data.foundation,items=(value,render)=>(Array.isArray(value)?value:[]).map(render).join('');
    const section=(title,content)=>`<details class="foundationStudy"><summary>${esc(title)}</summary>${content}</details>`;
    const example=f.example||{};
    return `<span class="researchLabel">FOUNDATION 0.1 · PROPOSED DESIGN</span>
      <h2>${esc(data.overview.title)}</h2><p class="intro">${esc(data.overview.summary)}</p>
      <p>Four internal components: Contract Engine, Core Controller, Workflow Builder and Verifier. The user owns approval and final acceptance. PIC is a shared library of six inherited rules.</p>
      <h3>From the user to the MOA package</h3><ol class="websiteJourney">${items(data.overview.workflow,s=>`<li><strong>${esc(s.title.replace(/^\d+\. /,''))}</strong><p>${esc(s.detail)}</p></li>`)}</ol>
      <p class="websiteStatus">${esc(data.overview.current)}</p>
      ${section('The mathematical rules',`<h4>The engineering contract</h4><pre class="foundationFormula">${esc(f.contract.formula)}\n${esc(f.contract.approval)}</pre>${paragraphs(f.contract.fields)}${items(f.rules,r=>`<h4>${esc(r.title)}</h4><pre class="foundationFormula">${esc(r.formula)}</pre>${paragraphs(r.explanation)}${r.obligation?`<p><strong>Implementation obligation:</strong> ${esc(r.obligation)}</p>`:''}`)}`)}
      ${section('PIC: six rules, one shared library',items(f.picRules,r=>`<h4>${esc(r.title)}</h4><p>${esc(r.guard)}</p><p><strong>Negative test:</strong> ${esc(r.test)}</p>`))}
      ${section('Release and confirmed delivery',`<p>Core evaluates all six release conditions at one authoritative revision.</p><ol>${items(f.releaseChecks,c=>`<li>${esc(c)}</li>`)}</ol><p>A committed release intent is followed by an exact-content handoff. Delivery requires the intended digest, destination and confirmed receipt. An unknown receipt remains DELIVERY_UNCONFIRMED. Operating the delivered workflow requires its own current authority.</p>`)}
      ${section('The contract-to-workflow algorithm',`<p>Trusted controller transitions recheck approval, scope, deadline and budget before dispatch. The initial proposal permits two total candidate attempts: one initial attempt and at most one repair.</p><pre class="foundationAlgorithm">${esc(f.algorithm)}</pre><h4>States</h4><p>${esc(f.states.join(' → '))}</p>${items(f.stateTransitions,t=>`<p><strong>${esc(t.from)} → ${esc(t.to)}:</strong> ${esc(t.condition)}</p>`)}<h4>Explicit exits</h4>${paragraphs(f.exits)}`)}
      ${section('What the mathematics establishes',items(f.propositions,p=>`<h4>${esc(p.title)}</h4>${paragraphs(p.claim)}<p><strong>Assumptions and limits:</strong> ${esc(p.assumptions)}</p>`))}
      ${section(example.title||'Support Operations example',`<p>${esc(example.summary)}</p><p>${esc(textList(example.stages).join(' → '))}</p><div class="foundationTableWrap"><table class="foundationTable"><thead><tr><th>Record</th><th>Input</th><th>Expected category</th></tr></thead><tbody>${items(example.rows,r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.input)}</td><td>${esc(r.category)}</td></tr>`)}</tbody></table></div><p>${esc(example.reconciliation)}</p><p>${esc(example.invariant)}</p><p>${esc(example.variant)}</p><p>${esc(example.dataBoundary)}</p><p>These are derived expectations from the proposed policy, not recorded execution results.</p>`)}
      ${section('Acceptance tests to implement',`${items(f.tests,t=>`<h4>${esc(t.name)}</h4><p>${esc(t.expected)}</p>`)}<h4>Evaluation against baselines</h4><p>${esc(f.comparison)}</p><pre class="foundationFormula">${esc(f.costModel)}</pre>`)}
      ${section('Scope and source material',`<h4>Included in the foundation</h4>${paragraphs(f.scope)}<h4>Deferred</h4>${paragraphs(f.deferred)}<p>${esc(data.overview.approach)}</p>${items(f.provenance,p=>`<p class="foundationSource"><strong>${esc(p.title)}</strong>${p.version?`<br>${esc(p.version)}`:''}${p.sections?`<br>${esc(Array.isArray(p.sections)?p.sections.join(', '):p.sections)}`:''}${p.sha256?`<br><small>SHA-256: ${esc(p.sha256)}</small>`:''}</p>`)}<a class="websiteTextLink" href="/assets/agentic-foundation-source.png" target="_blank" rel="noopener noreferrer">Open the supplied architecture diagram ↗</a>`)}
      <h3>Failure and recovery boundaries</h3>${paragraphs(data.overview.failures)}<p>${esc(data.presentation.disclosure)}</p>`;
  }
  function renderStudy(){
    if(!active)return;syncControls();const n=selected?.kind==='node'?by[selected.id]:null,e=selected?.kind==='edge'?data.edges.find(x=>x.id===selected.id):null;
    if(view==='ada')adaRenderer.render({nodes:shown(),edges:scopedEdges(),selected});
    let html='';
    if(view==='ada'&&tab==='selection'&&adaDetail){html=adaDetail.html;
    }else if(tab==='system'&&view==='ada'){html=adaRenderer.overview();
    }else if(tab==='system'&&program){html=programOverview();
    }else if(tab==='system'&&view==='concept'){html=conceptRenderer.overview();
    }else if(tab==='system'&&data.node01){html=node01Overview();
    }else if(tab==='system'&&view==='brain'){html=brainConceptOverview();
    }else if(tab==='system'&&data.foundation){html=foundationOverview();
    }else if(tab==='system'){
      html=`<span class="researchLabel">${esc(data.presentation.kicker)}</span><h2>${esc(data.overview.title)}</h2><p class="intro">${esc(data.overview.summary)}</p><h3>The product journey</h3><ol class="websiteJourney">${data.overview.workflow.map(step=>`<li><strong>${esc(step.title.replace(/^\d+\. /,''))}</strong><p>${esc(step.detail)}</p></li>`).join('')}</ol><h3>What works today</h3><p>${esc(data.overview.current)}</p><h3>What the baseline contains</h3><p>${esc(data.presentation.output)}</p><p>${esc(data.presentation.disclosure)}</p><h3>Scaling the product</h3>${data.overview.operational.map(item=>`<h4>${esc(item.title)}</h4><p>${esc(item.detail)}</p>`).join('')}<h3>Failure and recovery paths</h3>${paragraphs(data.overview.failures)}<h3>Design approach</h3><p>${esc(data.overview.approach)}</p>`;
    }else if(e){html=`<span class="researchLabel">ARCHITECTURE CONNECTION</span><h2>${esc(edgeNumber(e.id))} · ${esc(e.label)}</h2><p>${nodeLink(e.from)} → ${nodeLink(e.to)}</p>${paragraphs(e.details)}<p class="websiteMeta">${esc(e.status||'Design relationship')}</p>`;
    }else if(tab==='aws'){
      const items=n?[n]:shown();html=`<span class="researchLabel">PROPOSED AWS IMPLEMENTATION</span><h2>${n?esc(nodeNumber(n.id))+'. '+esc(n.name):'AWS target for the product'}</h2><p class="intro">${esc(n?n.summary:data.overview.aws)}</p>${items.map(n=>`<section class="websiteAwsDecision"><div class="websiteAwsHeading"><img src="${esc(n.aws?.icon)}" alt=""/><h3>${esc(n.aws?.service)}</h3></div><p class="websiteMeta">${esc(nodeNumber(n.id))} · ${esc(n.name)}</p>${paragraphs(n.aws?.why)}${paragraphs(n.aws?.notes)}${n.aws?.services?.length?`<div class="foundationServices">${n.aws.services.map(s=>`<div><img src="${esc(s.icon)}" alt=""><span><strong>${esc(s.name||s.service)}</strong>${s.why?`<p>${esc(s.why)}</p>`:''}${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Service documentation ↗</a>`:''}</span></div>`).join('')}</div>`:''}${n.aws?.url?`<a href="${esc(n.aws.url)}" target="_blank" rel="noopener noreferrer">Read the AWS documentation ↗</a>`:''}</section>`).join('')}<p>Choose regions, access policies, tenancy, retention, reliability and costs before implementation. A service mapping is a starting design decision.</p>`;
    }else if(n){
      const links=scopedEdges().filter(e=>e.from===n.id||e.to===n.id);html=`<span class="researchLabel">ARCHITECTURE COMPONENT</span><h2>${esc(nodeNumber(n.id))}. ${esc(n.name)}</h2><p class="websiteStatus">${esc(n.status)}</p><p class="intro">${esc(n.summary)}</p>${paragraphs(n.details)}<h3>Inputs</h3>${paragraphs(n.inputs)}<h3>Outputs</h3>${paragraphs(n.outputs)}<h3>Connections</h3><div class="websiteComponentList">${links.map(e=>`<button class="websiteTextLink" data-site-edge="${esc(e.id)}">${esc(edgeNumber(e.id))} · ${esc(e.label)}<small>${esc(nodeNumber(e.from))} ${esc(by[e.from].short)} → ${esc(nodeNumber(e.to))} ${esc(by[e.to].short)}</small></button>`).join('')}</div><button class="websiteTextLink" data-site-study="aws">Study the proposed AWS service ↗</button>`;
    }else html=`<span class="researchLabel">INDIVIDUAL NODES</span><h2>Explore ${esc(data.title)}</h2><p>Select a component to read its responsibility, current status, inputs, outputs and connections.</p><div class="websiteComponentList">${shown().map(n=>nodeLink(n.id)).join('')}</div>`;
    $('#study').innerHTML=(n?exploreLink(n):'')+html+(tab==='system'?numberingGuide():'');$('#study').scrollTop=0;
  }
  function select(kind,id){
    if(!['node','edge'].includes(kind))return;
    const edge=kind==='edge'?scopedEdges().find(e=>e.id===id):null;
    if(kind==='node'&&!shown().some(n=>n.id===id)||kind==='edge'&&!edge)return;
    adaDetail=null;adaRenderer?.clearSelection();selected={kind,id};const n=kind==='node'?by[id]:by[edge.from];
    showStudy(view==='aws'||tab==='aws'?'aws':'selection');announce(kind==='node'?`${n.name} selected. Read its responsibility and connections in the panel.`:'Connection selected. Read the data flow in the panel.');schedule();
  }
  // Compatibility entry points keep the page's fixed scope. Old browser
  // preferences, imported modules and legacy controls cannot change the view.
  function setLayers(_next,notify=true){
    layers=new Set(fullArchitecture?data.groups.map(g=>g.id):['core']);
    if(selected?.kind==='node'&&!shown().some(n=>n.id===selected.id))selected=null;
    if(selected?.kind==='edge'&&!scopedEdges().some(e=>e.id===selected.id))selected=null;
    fit();renderStudy();
    if(notify)window.dispatchEvent(new Event('saw:website-statechange'));
  }
  function setGroup(){setLayers();}
  function toggleGroup(){setLayers();}
  function openDock(section){
    const panel=$('#rightControlPanel'),opening=!!section&&(panel.hidden||dock!==section);dock=opening?section:null;panel.hidden=!opening;tools.hidden=!opening;
    $$('#rightDock [data-section]').forEach(b=>b.setAttribute('aria-expanded',String(dock===b.dataset.section)));
    if(!opening){delete panel.dataset.section;return;}window.SAWProduct?.close(false);document.body.classList.add('panelClosed');syncControls();schedule();panel.dataset.section=section;
    $('#dockPanelTitle').textContent={guide:'Architecture guide',display:'Display',camera:view==='brain'?'3D camera':view==='ada'?'Analysis overview':view==='concept'?'Concept overview':(data.node01||data.programModel)?'AWS design overview':'Pan and zoom',interfaces:'Connection key',explore:'Connections'}[section];
    if(section==='guide')tools.innerHTML=`<p>Explore ${esc(data.title)}. Select a component to read its role and follow its connections.</p><label>Find a component<input id="websiteSearch" type="search" placeholder="Search components…"></label><div id="websiteSearchResults" class="websiteComponentList">${shown().map(n=>nodeLink(n.id)).join('')}</div>`;
    else if(section==='display')tools.innerHTML=`<button data-site-action="labels" aria-pressed="${labels}">Component labels</button><p>Architectural Depth Analysis connects requirements, design decisions and six pillar review questions. AWS System Design Architecture shows the proposed service mappings for the same components.</p>`;
    else if(section==='camera'&&view==='ada')tools.innerHTML='<p>Scroll through the analysis. Select a foundation, pillar or validation card to inspect it. Each review uses the active page model.</p><button data-site-study="system">Open analysis overview</button>';
    else if(section==='camera'&&view==='concept')tools.innerHTML='<p>Scroll through the concept from the customer to the intended output. Select a component or connection to read its role. The concept uses the same model as the 3D Brain and AWS design.</p><button data-site-study="system">Open concept overview</button>';
    else if(section==='camera'&&view==='aws'&&(data.node01||data.programModel))tools.innerHTML='<p>Scroll through the AWS layout. Select a service or connection to inspect its controls, responsibilities and evidence requirements.</p><button data-site-study="system">Open design overview</button>';
    else if(section==='camera')tools.innerHTML='<div class="websiteToolGrid"><button data-site-action="fit">'+(view==='brain'?'Reset 3D view':'Fit diagram')+'</button><button data-site-action="zoom-in">Zoom in</button><button data-site-action="zoom-out">Zoom out</button></div><p>'+(view==='brain'?'Drag or use the arrow keys to orbit. Hold Shift while dragging or using arrow keys to pan. Scroll or use plus and minus to zoom. Home resets the view.':'Drag to pan the diagram. Scroll to zoom. Use the arrow keys to pan, plus or minus to zoom, and Home to fit when the canvas is focused.')+'</p>';
    else if(section==='interfaces')tools.innerHTML='<p>Connections show which component sends information to another. Select a component and open a connection to read what crosses it.</p>'+numberingGuide()+'<p>Planned AI capabilities remain labelled as planned. AWS boxes are proposed service mappings.</p>';
    else tools.innerHTML=`<button data-site-action="neighbours" aria-pressed="${connectionsOnly}">Selected component connections only</button><div class="websiteComponentList">${shownEdges().map(e=>`<button class="websiteTextLink" data-site-edge="${esc(e.id)}">${esc(edgeNumber(e.id))} · ${esc(e.label)}</button>`).join('')}</div>`;
  }
  function activate(p){
    openDock(null);connectionsOnly=false;labels=true;loadModel(p);active=true;
    document.body.classList.add('websiteMode');root.hidden=false;initDiagrams();selected=null;tab='system';setLayers(null,false);
    $('#systemTab').dataset.label='System Overview';$('#systemTab').setAttribute('aria-label','System Overview');
    $('#cameraToggle').setAttribute('aria-label','Pan and zoom controls');
    $('#nodeAwsCard').hidden=true;$('#linkWalk').hidden=true;$('#tourBar').hidden=true;
    setPage(p.view||'brain');announce(fullArchitecture?'Explore the full architecture. Select a component to study.':'Follow the core lifecycle. Select a step to explore.');
  }
  function deactivate(){if(!active)return;openDock(null);active=false;cancelAnimationFrame(frameId);frameId=0;document.body.classList.remove('websiteMode');root.hidden=true;tools.hidden=true;$('#systemTab').dataset.label='System Overview with Algorithm';$('#systemTab').setAttribute('aria-label','System Overview with Algorithm');}
  function clearCanvasSelection(){window.SAWProduct?.close(false);openDock(null);selected=null;adaDetail=null;adaRenderer?.clearSelection();document.body.classList.add('panelClosed');renderStudy();schedule();}
  root.addEventListener('pointerdown',e=>{if(view==='ada'||view==='concept'||(view==='aws'&&(data.node01||data.programModel)))return;if(e.target.closest('button,[data-site-edge]'))return;pointer={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};root.setPointerCapture(e.pointerId);root.focus();});
  root.addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer={...pointer,x:e.clientX,y:e.clientY,moved:pointer.moved||Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>4};if(view==='brain'&&!e.shiftKey){brainRotation+=dx*.006;brainPitch=Math.max(-1.2,Math.min(1.2,brainPitch+dy*.006));}else{panX+=dx;panY+=dy;}schedule();});
  root.addEventListener('pointerup',()=>{if(pointer&&!pointer.moved){clearCanvasSelection();announce('Selection cleared. Choose a component to explore.');}pointer=null;});root.addEventListener('pointercancel',()=>pointer=null);
  root.addEventListener('wheel',e=>{if(view==='ada'||view==='concept'||(view==='aws'&&(data.node01||data.programModel)))return;e.preventDefault();zoom=Math.max(.45,Math.min(8,zoom*Math.exp(-e.deltaY*.001)));schedule();},{passive:false});
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();clearCanvasSelection();return;}if(view==='ada'||view==='concept'||(view==='aws'&&(data.node01||data.programModel))||e.target.closest('button'))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Home')fit();else if(e.key==='+'||e.key==='=')zoom=Math.min(8,zoom*1.1);else if(e.key==='-')zoom=Math.max(.45,zoom/1.1);else if(view==='brain'&&!e.shiftKey){brainRotation+=(e.key==='ArrowRight'?.08:e.key==='ArrowLeft'?-.08:0);brainPitch=Math.max(-1.2,Math.min(1.2,brainPitch+(e.key==='ArrowDown'?.06:e.key==='ArrowUp'?-.06:0)));}else{panX+=(e.key==='ArrowRight'?-20:e.key==='ArrowLeft'?20:0);panY+=(e.key==='ArrowDown'?-20:e.key==='ArrowUp'?20:0);}schedule();}});
  document.addEventListener('input',e=>{if(e.target.id==='websiteSearch'){const q=e.target.value.toLowerCase();$('#websiteSearchResults').innerHTML=shown().filter(n=>(n.name+' '+n.summary).toLowerCase().includes(q)).map(n=>nodeLink(n.id)).join('')||'<p>No matching components.</p>';}});
  document.addEventListener('click',e=>{
    if(!active)return;const b=e.target.closest('button,[data-site-edge]');if(!b)return;
    if(b.dataset.programScope){e.stopImmediatePropagation();setProgramScope(b.dataset.programScope);}
    else if(b.dataset.siteNode){e.stopImmediatePropagation();select('node',b.dataset.siteNode);}
    else if(b.dataset.siteEdge){e.stopImmediatePropagation();select('edge',b.dataset.siteEdge);}
    else if(b.dataset.siteStudy){e.stopImmediatePropagation();showStudy(b.dataset.siteStudy);}
    else if(b.dataset.siteAction){e.stopImmediatePropagation();const a=b.dataset.siteAction;if(a==='fit')fit();if(a==='zoom-in')zoom=Math.min(8,zoom*1.2);if(a==='zoom-out')zoom=Math.max(.45,zoom/1.2);if(a==='labels'){labels=!labels;b.setAttribute('aria-pressed',String(labels));}if(a==='neighbours'){connectionsOnly=!connectionsOnly;b.setAttribute('aria-pressed',String(connectionsOnly));}schedule();}
  },true);
  new ResizeObserver(schedule).observe(root);document.addEventListener('visibilitychange',schedule);
  window.SAWWebsite={isPage,activate,deactivate,setPage,setProgramScope,setGroup,setLayers,toggleGroup,select,fit,renderStudy,syncControls,showStudy,openDock,get data(){return data;},get scopedData(){return {...data,nodes:shown(),edges:scopedEdges()};},get active(){return active;},getState:()=>({page:view,tab,scope:scopeId,program:program?.id||null,enabled:[...layers],selected,visibleNodes:shown().map(n=>n.id),visibleEdges:shownEdges().map(e=>e.id),webgl:!!referenceRenderer?.renderer})};
})();
