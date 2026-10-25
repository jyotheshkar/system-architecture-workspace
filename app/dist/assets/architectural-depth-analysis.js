/* Architectural Depth Analysis is a review lens over the active page model.
 * A recorded design or suggested test is not evidence of deployed behavior. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = value => Array.isArray(value) ? value : value == null ? [] : [value];
  const paragraphs = value => list(value).filter(Boolean).map(text => `<p>${esc(text)}</p>`).join('');
  const FRAMEWORK = 'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html';
  const glyphs = {
    requirements:'<circle cx="8" cy="7" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2 21v-3a6 6 0 0 1 12 0v3m2-8a5 5 0 0 1 6 5v3"/>',
    services:'<path d="m12 2 10 6-10 6L2 8l10-6Zm-10 6v11l10 5 10-5V8M12 14v10"/>',
    connections:'<circle cx="12" cy="4" r="3"/><circle cx="4" cy="20" r="3"/><circle cx="20" cy="20" r="3"/><path d="m10.5 7-5 10m8-10 5 10M7 20h10"/>',
    architecture:'<path d="M6 14C3.8 14 2 12.2 2 10S3.8 6 6 6C6.7 3.6 8.7 2 11.2 2c3.3 0 6 2.3 6.4 5.3.5-.2 1-.3 1.6-.3C21.8 7 24 8.6 24 10.8S21.8 14 19.2 14H6Z"/><rect x="6" y="17" width="14" height="5" rx="1"/><path d="M9 19.5h1m5 0h2M13 22v2"/>',
    operations:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
    security:'<path d="m12 2 9 4v6c0 5-4 8-9 11-5-3-9-6-9-11V6l9-4Z"/><path d="m7 12 3 3 7-7"/>',
    reliability:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    performance:'<path d="M4 21V13h4v8m3 0V8h4v13m3 0V3h4v18M2 21h22"/>',
    cost:'<circle cx="12" cy="12" r="10"/><path d="M16 7h-6a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8M12 4v18"/>',
    sustainability:'<path d="M4 20C0 4 14 2 23 2c0 14-6 22-17 17M2 24 18 8"/>',
    decision:'<rect x="5" y="2" width="15" height="22" rx="1"/><path d="M9 7h7M9 12h7M9 17h5"/>',
    failure:'<path d="M12 2v21M4 23h16M3 7h18M6 7l-4 9h8L6 7Zm12 0-4 9h8l-4-9Z"/>',
    evidence:'<circle cx="10" cy="10" r="8"/><path d="m16 16 8 8m-18-14 3 3 6-6"/>'
  };
  const icon = key => `<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[key] || glyphs.architecture}</svg>`;
  const definitions = [
    {key:'requirements',serial:'1.1',title:'Business Requirements',hint:'Users · outcomes · constraints · success metrics',column:'foundations'},
    {key:'services',serial:'1.2',title:'Service Selection',hint:'Why this service? Alternatives and trade-offs.',column:'foundations'},
    {key:'connections',serial:'1.3',title:'Connections',hint:'Request flow · protocols · trust boundaries',column:'foundations'},
    {key:'architecture',serial:'2',title:'System Design Core',hint:'Boundaries · data flow · controls · evidence',column:'core'},
    {key:'operations',serial:'3.1',title:'Operational Excellence',hint:'Operate, observe, improve and recover.',column:'pillars'},
    {key:'security',serial:'3.2',title:'Security',hint:'Identity, access, isolation and protection.',column:'pillars'},
    {key:'reliability',serial:'3.3',title:'Reliability',hint:'Correct behavior and recovery from failure.',column:'pillars'},
    {key:'performance',serial:'3.4',title:'Performance Efficiency',hint:'Latency, concurrency, quotas and scaling.',column:'pillars'},
    {key:'cost',serial:'3.5',title:'Cost Optimization',hint:'Cost drivers, usage and alternatives.',column:'pillars'},
    {key:'sustainability',serial:'3.6',title:'Sustainability',hint:'Resource efficiency and measured demand.',column:'pillars'},
    {key:'decision',serial:'4.1',title:'Design Decision',hint:'Why this choice?',column:'depth'},
    {key:'failure',serial:'4.2',title:'Trade-off / Failure Case',hint:'What can go wrong?',column:'depth'},
    {key:'evidence',serial:'4.3',title:'Evidence / Validation',hint:'How will we test it?',column:'depth'}
  ];
  const pillarIds = {
    operations:['core','verify','workflow','web-router','web-release','web-workflow','web-archive'],
    security:['user','contract','core','plan','verify','web-session','web-secrets','web-store-api','web-github','web-router'],
    reliability:['core','verify','workflow','web-workflow','web-page','web-archive','web-checks','web-baseline'],
    performance:['plan','core','verify','web-shell','web-canvas','web-ai','web-workflow','web-checks'],
    cost:['plan','core','verify','workflow','web-ai','web-workflow','web-aws-mapping','web-archive'],
    sustainability:['plan','core','workflow','web-canvas','web-ai','web-workflow','web-archive']
  };
  const questions = {
    operations:['Who owns a failed run or review, and what is the escalation path?','Which transition, version and request identifiers belong in logs?','How are a change, rollback and recovery procedure tested?'],
    security:['Which identity is allowed to invoke each boundary?','How are tenant access, secrets, encryption and revocation enforced?','Can one role bypass review or reuse another revision’s authority?'],
    reliability:['Which calls can be retried, and what stable identity prevents duplicate effects?','What happens if a dependency, test or delivery confirmation is missing?','Which recovery objectives and durable states need to be agreed?'],
    performance:['What workload, latency target and concurrency should the design support?','Where do service quotas, model latency or browser rendering limit throughput?','How will load testing establish the capacity and scaling limits?'],
    cost:['Which inference, storage, request and transfer costs dominate?','What per-run budget, usage limits and retention policy are needed?','Which alternative offers the required behavior at a lower total cost?'],
    sustainability:['Can duplicate work, excessive inference and idle processing be avoided?','What storage retention and workload sizing fit actual demand?','Which measurements will show that resource use improves?']
  };

  class ArchitecturalDepthAnalysis {
    constructor(root, options = {}) {
      this.root=root;this.onInspect=typeof options.onInspect==='function'?options.onInspect:null;
      this.data=null;this.nodes=[];this.edges=[];this.selected=null;this.visible=false;
      this.viewport=document.createElement('section');this.viewport.className='adaViewport';this.viewport.hidden=true;
      this.viewport.setAttribute('aria-label','Architectural Depth Analysis');this.viewport.tabIndex=0;
      root.append(this.viewport);
      this.viewport.addEventListener('click',event=>{const button=event.target.closest('[data-ada-key]');if(button){event.stopPropagation();this.inspect(button.dataset.adaKey);}});
      this.viewport.addEventListener('pointerdown',event=>event.stopPropagation());
      this.viewport.addEventListener('wheel',event=>event.stopPropagation(),{passive:true});
      this.observer=new ResizeObserver(()=>this.connect());this.observer.observe(this.viewport);
    }
    setData(data) {
      this.data=data;this.nodes=list(data?.nodes);this.edges=list(data?.edges);this.selected=null;this.signature='';
      this.viewport.scrollTop=0;
    }
    setVisible(visible) {this.visible=!!visible;this.viewport.hidden=!this.visible;if(this.visible)this.connect();}
    render(model={}) {
      if(!this.data)return;
      this.nodes=Array.isArray(model.nodes)?model.nodes:this.data.nodes;
      const ids=new Set(this.nodes.map(node=>node.id));
      this.edges=(Array.isArray(model.edges)?model.edges:this.data.edges).filter(edge=>ids.has(edge.from)&&ids.has(edge.to));
      const signature=[this.data.id||this.data.title,...this.nodes.map(node=>node.id),...this.edges.map(edge=>edge.id)].join('|');
      if(signature!==this.signature){this.signature=signature;this.draw();}
      this.connect();
    }
    draw() {
      const card=key=>{const item=definitions.find(item=>item.key===key),core=key==='architecture';
        const source=this.data.programModel?{short:this.data.input}:this.nodes.find(node=>['user','web-user','n01-browser'].includes(node.id));
        const output=this.data.programModel?{short:this.data.output}:this.data.node01?{short:'Durable intake receipt'}:this.nodes.find(node=>['workflow','web-baseline'].includes(node.id));
        return `<button type="button" class="adaCard${core?' adaCoreCard':''}" data-ada-key="${key}" aria-pressed="${this.selected===key}"><span class="adaSerial">${item.serial}</span><span class="adaIcon">${icon(key)}</span><span class="adaCardText"><strong>${esc(item.title)}</strong>${core?`<span class="adaActiveModel">${esc(this.data.title)}</span>`:''}<span>${esc(item.hint)}</span>${core?`<span class="adaModelFlow">${esc(source?.short||source?.name||'Requirement')}<span aria-hidden="true">↓</span>${esc(output?.short||output?.name||'Reviewed output')}</span><span class="adaReviewTag">Design review required</span>`:''}</span></button>`;};
      this.viewport.innerHTML=`<div class="adaCanvas"><div class="adaMap"><svg class="adaRoutes" aria-hidden="true"><defs><marker id="adaArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="m1 1 6 3-6 3"/></marker></defs><g class="adaRoutePaths"></g></svg><section class="adaColumn adaFoundations"><header><h2>Architecture Foundations</h2><p>Understand · choose · connect</p></header>${['requirements','services','connections'].map(card).join('')}</section><section class="adaColumn adaDesignCore"><header><h2>System Design Core</h2><p>Design · analyse · document</p></header>${card('architecture')}</section><section class="adaColumn adaPillars"><header><h2>Six Pillar Evaluation</h2><p>Review through each lens</p></header>${definitions.filter(item=>item.column==='pillars').map(item=>card(item.key)).join('')}</section></div><section class="adaDepth"><header><h2>Depth Boundary for This Project</h2><p>Explain the choice. Examine the failure. Plan the validation.</p></header><div class="adaDepthFlow">${['decision','failure','evidence'].map(card).join('')}</div></section><p class="adaScopeNote">${esc(this.data.title)} · Questions and proposed decisions from this page’s model. No compliance score or execution result is inferred.</p></div>`;
      this.connect();
    }
    connect() {
      if(!this.visible)return;
      const map=this.viewport.querySelector('.adaMap'),svg=this.viewport.querySelector('.adaRoutes'),group=this.viewport.querySelector('.adaRoutePaths');
      if(!map||!svg||!group)return;
      const bounds=map.getBoundingClientRect(),width=map.clientWidth,height=map.clientHeight;
      if(width<1||height<1)return;
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      const point=key=>{const el=map.querySelector(`[data-ada-key="${key}"]`);if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left-bounds.left,right:r.right-bounds.left,top:r.top-bounds.top,bottom:r.bottom-bounds.top,cx:(r.left+r.right)/2-bounds.left,cy:(r.top+r.bottom)/2-bounds.top};};
      const core=point('architecture');if(!core)return;
      const narrow=getComputedStyle(map).gridTemplateColumns.split(' ').length===1;
      let output='';
      for(const [index,key] of ['requirements','services','connections'].entries()){
        const p=point(key);if(!p)continue;
        const x=(p.right+core.left)/2,port=core.top+(core.bottom-core.top)*(.22+index*.28);
        const d=narrow?`M ${p.cx} ${p.bottom} V ${p.bottom+8}`:`M ${p.right} ${p.cy} H ${x} V ${port} H ${core.left}`;
        output+=`<path class="${this.selected===key||this.selected==='architecture'?'isSelected':''}" d="${d}" marker-end="url(#adaArrow)"/>`;
      }
      for(const [index,item] of definitions.filter(item=>item.column==='pillars').entries()){
        const p=point(item.key);if(!p)continue;
        const x=(core.right+p.left)/2,port=core.top+(core.bottom-core.top)*(.11+index*.156);
        const d=narrow?`M ${p.cx} ${p.top-10} V ${p.top}`:`M ${core.right} ${port} H ${x} V ${p.cy} H ${p.left}`;
        output+=`<path class="${this.selected===item.key||this.selected==='architecture'?'isSelected':''}" d="${d}" marker-end="url(#adaArrow)"/>`;
      }
      group.innerHTML=output;
    }
    serial(id) {return window.SAWStudyIdentity?.nodeSerial(this.data,id)||String(this.data.nodes.findIndex(node=>node.id===id)+1);}
    nodeLink(node) {return `<button type="button" class="websiteTextLink" data-site-node="${esc(node.id)}">${esc(this.serial(node.id))}. ${esc(node.name)}<small>${esc(node.summary||node.responsibility||'Recorded responsibility')}</small></button>`;}
    nodeList(nodes) {return `<div class="websiteComponentList">${nodes.map(node=>this.nodeLink(node)).join('')}</div>`;}
    relevant(ids) {const matches=this.nodes.filter(node=>ids.includes(node.id));return matches.length?matches:this.nodes.filter(node=>node.group==='core').slice(0,4);}
    context() {return `<p class="websiteStatus">Active design: ${esc(this.data.title)}.${this.data.node01?' Node 01 AWS v7.1: proposed 100 UK-user pilot. AWS implementation unknown; AWS tests NOT RUN.':' This is a review of recorded responsibilities and proposed AWS mappings, not a completed AWS Well-Architected Review.'}</p>`;}
    overview() {
      if(!this.data)return '';
      return `<span class="researchLabel">ARCHITECTURAL DEPTH ANALYSIS</span><h2>Understand, connect, defend and validate the design.</h2>${this.context()}<p>${esc(this.data.overview?.summary||this.data.presentation?.output||'Review the active architecture from requirements to its intended output.')}</p><p>Begin with the business requirement, compare the proposed service choices, and follow the actual interfaces. Then review the same model through all six AWS Well-Architected pillars.</p><h3>Use the analysis map</h3><p>Select a card to open its page-specific responsibilities, questions, risks and validation needs. Component links open the existing node explanation. The map connects review lenses; the AWS view contains the proposed service placement.</p><h3>A defensible depth boundary</h3><p>For each important choice, record a design decision, its alternatives and failure case, and the test or evidence needed to establish its behavior. Documenting an expected result does not make it a passed test.</p><p><a class="websiteTextLink" href="${FRAMEWORK}" target="_blank" rel="noopener noreferrer">AWS Well-Architected: the six pillars ↗</a></p>`;
    }
    detail(key) {
      const definition=definitions.find(item=>item.key===key);if(!definition||!this.data)return null;
      if(this.data.programModel&&this.data.analysis?.[key])return this.programDetail(key,definition);
      if(this.data.node01){const detail=this.node01Detail(key,definition);if(detail)return detail;}
      const foundation=!!this.data.foundation;
      let body='';
      if(key==='requirements'){
        const linked=this.relevant(['user','contract','workflow','web-user','web-requirements','web-engineer','web-baseline']);
        body=`<h3>Business intent in this page</h3>${paragraphs(this.data.overview?.summary)}${this.nodeList(linked)}<h3>Clarify before accepting a design</h3><ul><li>Who uses and owns the result?</li><li>What exact output and success criteria should be accepted?</li><li>Which scope, permissions, budgets, deadlines and data constraints apply?</li><li>Which unresolved assumptions need a customer or engineer decision?</li></ul>${foundation?'<p>Approval and owner acceptance are separate obligations in this foundation. Approval must bind the exact contract revision; the model cannot grant itself authority.</p>':'<p>The current product model includes existing browser functionality and proposed generation capabilities. The agreed customer brief should distinguish those scopes before a baseline is accepted.</p>'}`;
      }else if(key==='services'){
        body=`<p>Compare the candidate mapping for each responsibility with its alternatives. The recorded rationale below comes from this page’s architecture data.</p>${this.nodes.filter(node=>node.aws).map(node=>`<section class="websiteAwsDecision"><h3>${esc(this.serial(node.id))}. ${esc(node.name)}</h3><p><strong>Candidate mapping:</strong> ${esc(node.aws.service)}</p>${paragraphs(node.aws.why)}${paragraphs(node.aws.notes)}${node.aws.url?`<p><a href="${esc(node.aws.url)}" target="_blank" rel="noopener noreferrer">Service documentation ↗</a></p>`:''}${this.nodeLink(node)}</section>`).join('')}<h3>Decision still required</h3><p>Record workload requirements, the rejected alternative, regional availability, expected cost, quotas and operational ownership. A browser or human responsibility is not an AWS resource.</p>`;
      }else if(key==='connections'){
        const by=Object.fromEntries(this.nodes.map(node=>[node.id,node]));
        body=`<p>These are the recorded directed relationships in the current page scope. An arrow represents an interface to explain and implement; it is not proof that a runtime enforces it.</p><h3>For every boundary</h3><p>Identify sender, receiver, payload, protocol, authority, validation, timeout, failure response and the state change. Make trust boundaries and data movement explicit.</p><div class="websiteComponentList">${this.edges.map(edge=>`<button type="button" class="websiteTextLink" data-site-edge="${esc(edge.id)}">${esc(window.SAWStudyIdentity?.edgeSerial(this.data,edge.id)||edge.id)} · ${esc(edge.label||edge.name)}<small>${esc(this.serial(edge.from))}. ${esc(by[edge.from]?.short||by[edge.from]?.name)} → ${esc(this.serial(edge.to))}. ${esc(by[edge.to]?.short||by[edge.to]?.name)}</small></button>`).join('')}</div>`;
      }else if(key==='architecture'){
        body=`<h3>Request to intended output</h3>${paragraphs(this.data.overview?.summary)}<ol class="websiteJourney">${list(this.data.overview?.workflow).map(step=>`<li><strong>${esc(step.title)}</strong>${paragraphs(step.detail)}</li>`).join('')}</ol><h3>Boundaries and controls to explain</h3><p>Follow the real request flow, identify the owner of each transition, and connect data and authority boundaries to the proposed controls. Record which claims belong to the current prototype and which require implementation.</p>${paragraphs(this.data.presentation?.disclosure)}<h3>Responsibilities in this scope</h3>${this.nodeList(this.nodes)}`;
      }else if(questions[key]){
        const nodes=this.relevant(pillarIds[key]);
        body=`<h3>Relevant responsibilities in ${esc(this.data.title)}</h3>${this.nodeList(nodes)}<h3>Review questions</h3><ul>${questions[key].map(question=>`<li>${esc(question)}</li>`).join('')}</ul>${foundation?this.foundationPillarNote(key):this.websitePillarNote(key)}<h3>Evidence to collect</h3><p>Record the decision, its implemented boundary, a repeatable evaluation and the observed result for the exact reviewed revision. Keep failed, missing and untested outcomes visible.</p><p><a class="websiteTextLink" href="${FRAMEWORK}" target="_blank" rel="noopener noreferrer">Official AWS Well-Architected guidance ↗</a></p>`;
      }else if(key==='decision'){
        body=`<p>A useful decision record connects the requirement to a concrete choice and explains why another option was rejected.</p><h3>Decision record</h3><ul><li>Requirement and accountable owner.</li><li>Chosen responsibility, interface and candidate service.</li><li>Alternatives, trade-offs and assumptions.</li><li>Expected behavior, risk, validation method and reviewed revision.</li></ul><h3>Start from this page’s actual choices</h3>${this.nodeList(this.nodes.filter(node=>node.aws?.why).slice(0,8))}<p>Open a responsibility to read its inputs, outputs, connections and recorded AWS rationale. Create acceptance evidence separately from the design description.</p>`;
      }else if(key==='failure'){
        body=`<h3>Recorded failure and recovery paths</h3>${paragraphs(this.data.overview?.failures)}<h3>Reason about the trade-off</h3><p>Choose one boundary and explain the failure trigger, the state that survives it, which action is blocked, how recovery is authorised and how a duplicate effect is prevented.</p>${foundation?'<p>For this foundation, stale approval, changed candidates, exhausted attempts and uncertain delivery are explicit failure cases. A missing verification result cannot be treated as a pass.</p>':'<p>For this product, distinguish browser draft retention from private server storage, session expiry from loss of a design, and a generated baseline from an engineer-approved implementation.</p>'}<p>Record impact, detection, timeout, recovery owner and residual risk. Review cost and performance trade-offs with the same accepted requirements.</p>`;
      }else if(key==='evidence'){
        const tests=list(this.data.foundation?.tests);
        body=`<p>Evidence connects an architecture claim to a reproducible test and an observed result. This analysis does not invent measurements, passed checks or AWS deployment receipts.</p><h3>Current and proposed scope</h3>${paragraphs(this.data.overview?.current)}${paragraphs(this.data.presentation?.disclosure)}${tests.length?`<h3>Acceptance tests proposed by this foundation</h3><p>The following expected results are design obligations, not recorded execution outcomes.</p>${tests.map(test=>`<section class="websiteAwsDecision"><h4>${esc(test.name)}</h4>${paragraphs(test.expected)}</section>`).join('')}`:'<h3>Validation plan for this product</h3><ul><li>Verify schema and relationship integrity for the reviewed model.</li><li>Test authorisation, revision conflicts, import/export and recovery boundaries.</li><li>Compare any generated baseline with the confirmed requirements and engineer review.</li><li>Measure workload capacity, latency, cost and failure recovery before making operational claims.</li></ul>'}<h3>A reviewable evidence record</h3><p>Keep the test method, input, expected and actual results, environment, model revision, artifact identity, reviewer and remaining limitation together.</p>`;
      }
      return {key,title:definition.title,html:`<span class="researchLabel">ADA · ${esc(definition.serial)}</span><h2>${esc(definition.title)}</h2>${this.context()}${body}`};
    }
    programDetail(key,definition) {
      const entry=this.data.analysis[key];
      const section=(title,value)=>list(value).length?`<section class="adaDecisionGroup"><h3>${esc(title)}</h3>${paragraphs(value)}</section>`:'';
      let linked='';
      if(key==='services')linked='<h3>Service choices in this node</h3>'+this.nodes.map(node=>`<section class="websiteAwsDecision"><h4>${esc(this.serial(node.id))}. ${esc(node.name)}</h4><p><strong>${esc(node.aws?.service||'Responsibility')}</strong></p>${paragraphs(node.aws?.why)}${paragraphs(node.aws?.notes)}${node.aws?.url?`<p><a href="${esc(node.aws.url)}" target="_blank" rel="noopener noreferrer">Service documentation ↗</a></p>`:''}${this.nodeLink(node)}</section>`).join('');
      if(key==='connections'){
        const by=Object.fromEntries(this.nodes.map(node=>[node.id,node]));
        linked='<h3>Recorded interfaces</h3><div class="websiteComponentList">'+this.edges.map(edge=>`<button type="button" class="websiteTextLink" data-site-edge="${esc(edge.id)}">${esc(window.SAWStudyIdentity?.edgeSerial(this.data,edge.id)||edge.id)}. ${esc(edge.label)}<small>${esc(by[edge.from]?.name)} → ${esc(by[edge.to]?.name)}</small></button>`).join('')+'</div>';
      }
      if(key==='architecture')linked='<h3>Responsibilities in this scope</h3>'+this.nodeList(this.nodes);
      if(this.data.scopeId==='overview'&&key==='architecture')linked+='<h3>Study a node in depth</h3><div class="websiteComponentList">'+list(this.data.programStages).map(stage=>`<button type="button" class="websiteTextLink" data-program-scope="${esc(stage.id)}">${esc(stage.serial)}. ${esc(stage.name)}<small>${esc(stage.summary)}</small></button>`).join('')+'</div>';
      const body=section('Design decision',entry.decision)+section('Alternatives and trade-offs',entry.alternatives)+section('Failure cases and risks',entry.risks)+section('Required validation',entry.validation)+section('Accountable owner',entry.owner)+linked;
      return {key,title:definition.title,html:`<span class="researchLabel">ADA · ${esc(this.data.scopeSerial||'SYSTEM')} · ${esc(definition.serial)}</span><h2>${esc(definition.title)}</h2><p class="websiteStatus">${esc(this.data.title)}. Authored design and validation plan; AWS runtime evidence has not been collected.</p>${body}<h3>Source and scope</h3>${paragraphs(this.data.sourceNote)}${questions[key]?`<p><a href="${FRAMEWORK}" target="_blank" rel="noopener noreferrer">AWS Well-Architected: six pillars ↗</a></p>`:''}`};
    }
    node01Detail(key,definition) {
      const model=this.data.node01,requirements=list(model.requirements),pillar=model.pillars?.[key];
      const source=refs=>`<p class="websiteMeta">Supplied source: ${esc(list(refs).join(', '))}.</p>`;
      const field=(label,value)=>value?`<p><strong>${esc(label)}:</strong> ${esc(value)}</p>`:'';
      const linked=ids=>this.nodeList(this.nodes.filter(node=>ids.includes(node.id)));
      let body='';
      if(key==='requirements'){
        body=`<h3>Customer outcome</h3>${paragraphs(this.data.overview.summary)}<p>The proposed pilot serves 100 UK users. The customer receives a durable intake receipt and can read the actual handoff state. Downstream execution and contract completion are outside Node 01.</p><h3>Requirements from the supplied design</h3>${requirements.map(item=>`<section class="websiteAwsDecision"><h4>${esc(item.id)} · ${esc(item.name)}</h4>${field('Control',item.control)}${field('Verification method',item.method)}${field('Evidence state',item.state)}${source(item.sourceRefs)}</section>`).join('')}${linked(['n01-browser','n01-api','n01-intake','n01-history','n01-store','n01-node02'])}`;
      }else if(key==='architecture'){
        body=`<h3>Request to durable intake and recoverable handoff</h3><ol class="websiteJourney">${list(this.data.overview.workflow).map(step=>`<li><strong>${esc(step.title)}</strong>${paragraphs(step.detail)}</li>`).join('')}</ol><h3>Read the state precisely</h3>${paragraphs(model.stateRules)}<h3>Trust and deployment boundaries</h3>${paragraphs(model.crossCutting)}<p>The browser is untrusted. Amplify delivers static assets through a global managed CDN. The regional application is proposed in Europe (London), eu-west-2. This baseline does not contain a VPC, subnets or server-side rendering compute.</p><p>Node 02 is an interface boundary. Its service-authenticated durable-receipt interface and consumer responsibilities must be agreed and implemented separately.</p>${this.nodeList(this.nodes)}`;
      }else if(pillar){
        body=`<h3>Source-specific review</h3>${field('Requirement',pillar.requirement)}${field('Decision',pillar.decision)}${field('Proposed AWS implementation',pillar.aws)}${field('Trade-off',pillar.tradeoff)}${field('Risk',pillar.risk)}${field('Mitigation',pillar.mitigation)}${field('Required evidence',pillar.evidence)}${field('Recorded status',pillar.status)}${source(pillar.sourceRefs)}<h3>Relevant responsibilities</h3>${linked(pillar.nodes)}<p>The source describes a design and an evidence plan. These entries are not passed AWS tests, a compliance certification or an official level-based scoring rubric.</p><p><a class="websiteTextLink" href="${FRAMEWORK}" target="_blank" rel="noopener noreferrer">Official AWS Well-Architected guidance ↗</a></p>`;
      }else if(key==='decision'){
        body=`<h3>Decisions that make this pilot understandable</h3><p>Keep the customer intake path short, authenticate and authorise at the right boundary, and separate durable acceptance from asynchronous handoff.</p>${Object.values(model.pillars||{}).map(item=>`<section class="websiteAwsDecision"><h4>${esc(item.title)}</h4>${field('Requirement',item.requirement)}${field('Choice',item.decision)}${field('Trade-off',item.tradeoff)}${field('Evidence required',item.evidence)}${source(item.sourceRefs)}</section>`).join('')}<h3>Explain the boundary before adding complexity</h3><p>Atomic message, receipt and outbox persistence is the acceptance decision. SQS buffers delivery; it does not prove downstream success. The persistent outbox and scheduled reconciliation retain an obligation that can outlive the stream. No VPC, model inference, full Agentic Core workflow or additional downstream services are included in this Node 01 baseline.</p>`;
      }else if(key==='failure'){
        body=`<h3>Failure paths in the supplied sequence</h3>${paragraphs(model.failureNotes)}<h3>Recovery state</h3>${paragraphs(model.stateRules)}<h3>Two separate retry boundaries</h3><p>EventBridge Scheduler delivery retries cover delivery of its asynchronous invocation. Lambda asynchronous handler failures require their own retry and failure controls. Successful scheduler delivery is not a successful reconciliation run.</p><h3>Operator boundary</h3><p>Stale acceptance, expired queue messages, repeated failures and DLQ entries must remain visible. Reconcile the stable event identity and durable receipt before controlled replay. The design includes no infinite automatic DLQ replay.</p>${linked(['n01-store','n01-relay','n01-scheduler','n01-reconcile','n01-queue','n01-dlq','n01-node02'])}${source(['p2c65','p3c83'])}`;
      }else if(key==='evidence'){
        body=`<h3>What the supplied source establishes</h3>${paragraphs(this.data.overview.current)}${paragraphs(model.evidenceScope)}<h3>Requirement-to-evidence trace</h3>${requirements.map(item=>`<section class="websiteAwsDecision"><h4>${esc(item.id)} · ${esc(item.name)}</h4>${field('Proposed component',item.aws)}${field('Control',item.control)}${field('Verification method',item.method)}${field('Recorded evidence state',item.state)}${source(item.sourceRefs)}</section>`).join('')}<h3>Source boundaries</h3><p>E09 is recorded as rates researched. This does not establish a current price estimate, observed billing or a passed AWS test. Performance targets are assumptions with measurements NOT RUN. E11 source preservation remains PARTIAL because original v5 and the eight-layer specification were unavailable to the source author.</p><h3>Five-sheet source</h3><p>${esc(model.source.filename)}</p><ul>${list(model.source.sheets).map(sheet=>`<li>${esc(sheet.title)}</li>`).join('')}</ul><p class="websiteMeta">SHA-256: ${esc(model.source.sha256)}</p><p>To create execution evidence, preserve the exact reviewed revision, test input, expected and observed results, environment, resource identities and reviewer. Keep missing and failed outcomes explicit.</p>`;
      }else{return null;}
      return {key,title:definition.title,html:`<span class="researchLabel">ADA · ${esc(definition.serial)} · NODE 01</span><h2>${esc(definition.title)}</h2>${this.context()}${body}`};
    }
    foundationPillarNote(key) {
      const notes={operations:'The foundation proposes transition records, attempt counters and bounded repair. Operational logs are useful for diagnosis; they do not replace candidate-bound acceptance evidence.',security:'The proposed contract restricts task permissions. Builder, verifier and release roles require separate implementation controls, with current approval checked at protected boundaries.',reliability:'Two total candidate attempts are proposed. Missing evidence and an unconfirmed delivery receipt remain explicit blocked or uncertain outcomes. Verify that lower-level retries cannot bypass the bound.',performance:'Measure proposal, compilation and verification separately. A finite attempt limit bounds calls, but does not establish a latency or capacity target.',cost:'The proposed attempt and resource budgets constrain dispatch. Estimate actual model calls, state transitions, Lambda execution and artifact retention, then compare those estimates with measured use.',sustainability:'Reuse only appropriately pinned, eligible artifacts and avoid unnecessary attempts. Compare compute and storage use against the same accepted workflow requirements.'};
      return `<h3>Design-specific consideration</h3><p>${esc(notes[key])}</p>`;
    }
    websitePillarNote(key) {
      const notes={operations:'The current website is a Worker-based prototype. Its proposed AWS delivery pipeline and generation workflow need runbooks, monitoring, rollback and ownership before implementation.',security:'The design separates public entry, authenticated sessions, private page storage and server-side credentials. Verify actual enforcement and project access independently of the diagram.',reliability:'Revision-aware writes, durable jobs and immutable baseline artifacts are proposed design mechanisms. Test conflict handling, recovery and idempotency when those mechanisms are implemented.',performance:'Browser rendering, model drafting and asynchronous generation have different capacity limits. Evaluate the current browser experience separately from the proposed AWS generation path.',cost:'Model inference, workflow duration, artifact retention, storage API traffic and transfer are candidate cost drivers. No usage or price estimate is recorded by this analysis.',sustainability:'Right-size model requests, reduce repeated generation and apply retention to artifacts and drafts. Measure actual demand and resource use before claiming an environmental benefit.'};
      return `<h3>Design-specific consideration</h3><p>${esc(notes[key])}</p>`;
    }
    inspect(key) {
      const detail=this.detail(key);if(!detail)return null;
      this.selected=key;
      this.viewport.querySelectorAll('[data-ada-key]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.adaKey===key)));
      this.connect();this.onInspect?.(detail);return detail;
    }
    clearSelection() {
      this.selected=null;
      this.viewport.querySelectorAll('[data-ada-key]').forEach(button=>button.setAttribute('aria-pressed','false'));
      this.connect();
    }
    dispose(){this.observer.disconnect();this.viewport.remove();}
  }
  window.SAWArchitecturalDepthAnalysis=ArchitecturalDepthAnalysis;
})();
