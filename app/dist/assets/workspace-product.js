(() => {
  'use strict';
  const $ = s => document.querySelector(s), api = window.ACReference;
  const storageKey = 'saw-design-pages-v1', retiredPageId = 'agentic-core-scaled', modules = ['memory','learning','tools','recovery','specialists'];
  const names = {memory:'Memory',learning:'Learning',tools:'Tools / Adapters',recovery:'Recovery / Scale',specialists:'Specialists'};
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now = () => new Date().toISOString();
  const legacyCoreDescription='Develop Agentic Core from the shared core lifecycle.';
  const foundationDescription='A focused User-to-MOA foundation: Contract Engine, Core Controller, Workflow Builder and Verifier, with inherited PIC controls and a guarded workflow-package handoff.';
  const node01Description='Agentic Core Node 01: customer requirement intake, authorised access, durable storage, history and recoverable downstream handoff. Proposed AWS v7.1 design.';
  const programDescription='Seven-node Agentic Core architecture: customer intake, contract, controller, builder, verifier, PIC and MOA package. Proposed design with node-specific AWS and ADA study.';
  const seed = (id,name,description,layers) => ({schemaVersion:1,coreVersion:id==='system-architecture-workspace-1-0'?'system-architecture-workspace-v1':'agentic-core-reference-v1',id,name,description,view:'brain',modules:layers,sections:[],updatedAt:now()});
  const defaults = [seed('agentic-core','Agentic Core',programDescription,[]),seed('system-architecture-workspace-1-0','System Architecture Workspace','Design the workspace product: reusable architecture pages, structured sections and reviewable cloud designs.',[])];
  let state={active:defaults[1].id,pages:defaults,shas:{},synced:{},pending:{},dirty:{}}, drawer=null, applying=false, draftForm=null, message='',connection={configured:false},busy=false,history=[],storageOK=true,recoveryCopy='',connectionGeneration=0;
  const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  const validId=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value);
  const validSha=value=>typeof value==='string'&&/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(value);
  const validTime=value=>typeof value==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,19)===value.slice(0,19);
  const validText=(value,max,required=false)=>typeof value==='string'&&value.length<=max&&(!required||value.trim().length>0)&&!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value);
  function cleanPage(p){
    if(!record(p)||p.id===retiredPageId||p.schemaVersion!==1||!validId(p.id)||!validText(p.name,80,true)||!validText(p.description,2400)||
      !['reference','concept','ada','aws','brain'].includes(p.view)||!Array.isArray(p.modules)||p.modules.length>modules.length||
      p.modules.some(m=>!modules.includes(m))||new Set(p.modules).size!==p.modules.length||!Array.isArray(p.sections)||p.sections.length>50||
      !validTime(p.updatedAt)||(p.coreVersion!==undefined&&!['agentic-core-reference-v1','system-architecture-workspace-v1'].includes(p.coreVersion)))return null;
    const sectionIds=new Set(),sections=[];
    for(const s of p.sections){
      if(!record(s)||!validId(s.id)||sectionIds.has(s.id)||!validText(s.name,80,true)||
        !validAnchor(p,s.anchor)||
        ['purpose','inputs','outputs','acceptance','awsNotes'].some(k=>!validText(s[k],2400)))return null;
      sectionIds.add(s.id);sections.push({id:s.id,name:s.name,anchor:s.anchor,...Object.fromEntries(['purpose','inputs','outputs','acceptance','awsNotes'].map(k=>[k,s[k]]))});
    }
    return {schemaVersion:1,coreVersion:isWebsite(p)?'system-architecture-workspace-v1':'agentic-core-reference-v1',id:p.id,name:p.id==='system-architecture-workspace-1-0'&&p.name==='System Architecture Workspace 1.0'?'System Architecture Workspace':p.name,description:p.description,view:p.view==='reference'?'concept':p.view,modules:p.modules.slice(),sections,updatedAt:p.updatedAt};
  }
  function migrateDescription(p){if(p.id!=='agentic-core'||![legacyCoreDescription,foundationDescription,node01Description].includes(p.description))return false;p.description=programDescription;p.updatedAt=now();return true;}
  function keepRecovery(raw){
    recoveryCopy=raw;
    try{localStorage.setItem(storageKey+'-recovery',raw);}catch{}
    message='Some browser data could not be restored. Usable pages were kept. Download the recovery copy below to retain the original data.';
  }
  function keepRetiredPage(value){
    const page=value.pages.find(p=>p?.id===retiredPageId);if(!page)return;
    const archive={schemaVersion:1,retiredAt:now(),page,...Object.fromEntries(['shas','synced','pending','dirty'].map(key=>[key,record(value[key])&&Object.hasOwn(value[key],retiredPageId)?value[key][retiredPageId]:null]))};
    try{localStorage.setItem(storageKey+'-retired-'+retiredPageId+'-v1',JSON.stringify(archive));}catch{}
  }
  const fallbackPage=pages=>pages.find(p=>p.id==='agentic-core')||pages.find(p=>p.id==='system-architecture-workspace-1-0')||pages[0];
  let cachedText;
  try{cachedText=localStorage.getItem(storageKey);recoveryCopy=localStorage.getItem(storageKey+'-recovery')||'';}
  catch{storageOK=false;message='Browser storage is unavailable. Export your pages before leaving.';}
  if(cachedText){
    try{
      const value=JSON.parse(cachedText);let repaired=false;
      if(!record(value)||!Array.isArray(value.pages))throw Error('Unsupported browser data');
      keepRetiredPage(value);
      const ids=new Set(),pages=[],migrated=[];
      for(const candidate of value.pages){if(candidate?.id===retiredPageId)continue;const p=cleanPage(candidate);if(!p||ids.has(p.id)){repaired=true;continue;}ids.add(p.id);if(migrateDescription(p)||(isWebsite(p)&&candidate.coreVersion!==p.coreVersion)||candidate.view!==p.view||candidate.name!==p.name){p.updatedAt=now();migrated.push(p.id);}pages.push(p);}
      if(!pages.length&&value.pages.some(p=>p?.id===retiredPageId)){for(const p of defaults){pages.push(p);ids.add(p.id);}}
      if(!pages.length)throw Error('No supported browser pages');
      if(value.active===retiredPageId&&!pages.some(p=>['agentic-core','system-architecture-workspace-1-0'].includes(p.id))){const p=defaults[0];pages.push(p);ids.add(p.id);}
      const dictionary=(source,validate)=>{
        const result=Object.create(null);
        if(source===undefined)return result;
        if(!record(source)){repaired=true;return result;}
        for(const[id,item]of Object.entries(source)){if(id===retiredPageId)continue;if(ids.has(id)&&validate(item,id))result[id]=item;else repaired=true;}
        return result;
      };
      const shas=dictionary(value.shas,validSha),synced=dictionary(value.synced,validTime);
      const dirty=dictionary(value.dirty,item=>typeof item==='boolean');for(const id of migrated)dirty[id]=true;
      const pending=dictionary(value.pending,(item,id)=>record(item)&&validSha(item.sha)&&item.page?.id===id&&!!cleanPage(item.page));
      for(const id of Object.keys(pending))pending[id]={sha:pending[id].sha,page:cleanPage(pending[id].page)};
      for(const p of pages){if(Object.hasOwn(dirty,p.id))continue;const original=defaults.find(d=>d.id===p.id);
        const untouchedSeed=original&&['name','description','view'].every(k=>p[k]===original[k])&&JSON.stringify(p.modules)===JSON.stringify(original.modules)&&p.sections.length===0;
        dirty[p.id]=!(shas[p.id]&&synced[p.id]===p.updatedAt)&&!untouchedSeed;
      }
      state={active:ids.has(value.active)?value.active:fallbackPage(pages).id,pages,shas,synced,pending,dirty};
      if(repaired)keepRecovery(cachedText);
    }catch{keepRecovery(cachedText);}
  }
  function isWebsite(p){return p?.id==='system-architecture-workspace-1-0'||p?.coreVersion==='system-architecture-workspace-v1';}
  function graphFor(p){return window.SAWArchitectureData?.forPage(p)||(isWebsite(p)?window.SAWWebsiteData:api.data)||api.data;}
  function coreFor(p){return graphFor(p).nodes.filter(n=>isWebsite(p)||n.module==='core');}
  function defaultAnchor(p){const nodes=coreFor(p);return nodes.find(n=>n.id===(isWebsite(p)?'web-shell':'core'))?.id||nodes[0]?.id||'core';}
  function anchorNodes(p){const nodes=coreFor(p);return nodes.concat(api.data.nodes.filter(n=>n.module==='core'&&!nodes.some(existing=>existing.id===n.id)&&p.sections.some(section=>section.anchor===n.id)));}
  function anchorLabel(p,id){const program=window.SAWProgramModel?.forPage(p);return graphFor(p).nodes.find(n=>n.id===id)||program?.stages.flatMap(s=>s.model.nodes).find(n=>n.id===id)||window.SAWNode01Data?.nodes.find(n=>n.id===id)||window.SAWWebsiteData?.nodes.find(n=>n.id===id)||api.data.nodes.find(n=>n.module==='core'&&n.id===id);}
  function validAnchor(p,id){const program=window.SAWProgramModel?.forPage(p);return program&&[program.overview,...program.stages.map(s=>s.model)].some(model=>model.nodes.some(n=>n.id===id))||(!isWebsite(p)&&window.SAWNode01Data?.nodes.some(n=>n.id===id))||api.data.nodes.some(n=>n.module==='core'&&n.id===id)||(isWebsite(p)&&window.SAWWebsiteData?.nodes.some(n=>n.id===id));}
  const current=()=>state.pages.find(p=>p.id===state.active);
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));storageOK=true;}catch{storageOK=false;message='Browser storage is full or unavailable. Export this page before leaving.';} renderBadge();}
  function touch(){current().updatedAt=now();state.dirty[current().id]=true;persist();}
  function syncViewNavigation(){
    const chosen=current().view;
    document.querySelectorAll('nav[aria-label="Architecture views"] [data-page]').forEach(button=>{
      if(button.dataset.page===chosen)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
  }
  function clearStageMessage(){const stageMessage=$('#delta');if(stageMessage){stageMessage.textContent='';stageMessage.classList.remove('visible');}}
  function applyPage(){
    applying=true;
    try{api.clearSelection(true,true);api.setModules([]);window.SAWWebsite.activate(current());}
    finally{applying=false;}
    syncViewNavigation();clearStageMessage();if(drawer)document.body.classList.remove('panelClosed');renderBadge();
  }
  function setView(next){
    if(!['brain','concept','ada','aws'].includes(next))return;
    const changed=current().view!==next;
    applying=true;
    try{
      current().view=next;
      if(window.SAWWebsite.active)window.SAWWebsite.setPage(next);
      else{api.clearSelection(true,true);api.setModules([]);window.SAWWebsite.activate(current());}
    }finally{applying=false;}
    syncViewNavigation();clearStageMessage();if(changed)touch();
  }
  function renderBadge(){const p=current();$('#activePageBadge').innerHTML=`<span class="pageDot" aria-hidden="true"></span><span>${esc(p.name)}</span>`;const shelf=$('#designSections');if(shelf){shelf.hidden=true;shelf.replaceChildren();}}
  const productHeader=$('#productClose').parentElement;
  const headerAction=(id,label,icon,action)=>{const b=document.createElement('button');b.id=id;b.type='button';b.className='pagesHeaderAction';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=icon;if(action)b.dataset.action=action;productHeader.insertBefore(b,$('#productClose'));return b;};
  const newPageButton=headerAction('productNewPage','Add a page','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>','new-page');
  function syncDrawerHeader(){const isPages=drawer==='pages';$('#pagesToggle').setAttribute('aria-expanded',String(isPages));$('#chatToggle').setAttribute('aria-expanded',String(drawer==='chat'));$('#productTitle').textContent=isPages?'Pages':'Architecture Assistant';newPageButton.hidden=!isPages;}
  function show(which){window.SAW.closeDrawers();drawer=which;document.body.dataset.productDrawer=which;document.body.classList.remove('panelClosed');$('#productDrawer').hidden=false;syncDrawerHeader();render();}
  function toggle(which){if(drawer===which){close(true);return;}show(which);}
  function close(focus=false){if(!drawer)return;const which=drawer;drawer=null;delete document.body.dataset.productDrawer;$('#productDrawer').hidden=true;$('#pagesToggle').setAttribute('aria-expanded','false');$('#chatToggle').setAttribute('aria-expanded','false');document.body.classList.add('panelClosed');if(focus)$(which==='chat'?'#chatToggle':'#pagesToggle').focus();}
  window.SAWProduct={close,setView};
  $('nav[aria-label="Architecture views"]')?.addEventListener('click',event=>{
    const button=event.target.closest('button[data-page]');if(!button||button.hidden)return;
    event.preventDefault();event.stopImmediatePropagation();setView(button.dataset.page);
  },true);
  function render(){if(drawer==='pages')renderPages();else if(drawer==='chat')renderChat();}
  function renderPages(){const v=$('#productBody');v.innerHTML=`<div class="workspacePageList" role="group" aria-label="Architecture pages">${state.pages.map(p=>`<button class="workspacePage" data-workspace-page="${esc(p.id)}" aria-pressed="${p.id===state.active}"><span>${esc(p.name)}</span><svg class="pageSelectedMark" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg></button>`).join('')}</div>${draftForm==='page'?`<form id="newPageForm" class="productForm"><label>Page name<input name="name" maxlength="80" required autocomplete="off" placeholder="Name your next architecture"></label><label>Start from<select name="model"><option value="agentic">Agentic Core architecture</option><option value="website">Workspace website architecture</option></select></label><label>What are you designing?<textarea name="description" maxlength="2400" rows="3" placeholder="The problem, intended users and outcome"></textarea></label><div class="productActions"><button type="submit" class="productPrimary">Create page</button><button type="button" data-action="cancel-form">Cancel</button></div></form>`:''}<p id="productMessage" class="srOnly" role="status">${esc(message)}</p>`;}
  function syncPageSummary(){renderBadge();}
  function announce(text){message=text;const el=$('#productMessage');if(el)el.textContent=text;}
  function appendRecoveryAction(){if(!recoveryCopy)return;const button=document.createElement('button');button.type='button';button.className='productQuiet';button.textContent='Download browser recovery copy';button.onclick=()=>download('workspace-browser-recovery.txt',recoveryCopy,'text/plain');$('#productMessage').append(button);}
  function setBusy(value){busy=value;document.querySelectorAll('#productBody [data-action=save-github],#productBody [data-action=load-github],#githubConnectForm .productPrimary').forEach(button=>{button.disabled=value;if(button.dataset.action==='save-github')button.textContent=value?'Working…':'Save page to GitHub';});}
  const draftSafety=()=>storageOK?'Your draft remains saved in this browser.':'Browser saving is unavailable. Export your draft before leaving.';
  async function request(path,options={}){
    let response;
    try{response=await fetch('/api/workspace-store/'+path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...options.headers}});}
    catch{throw Error('The storage service could not be reached. '+draftSafety());}
    let data;try{data=await response.json();}catch{throw Error('The storage service did not return a usable response. '+draftSafety());}
    if(!response.ok)throw Object.assign(Error((typeof data?.error==='string'?data.error:'GitHub request failed.')+' '+draftSafety()),{code:data?.code});
    return data;
  }
  async function loadRemote(){
    const list=await request('pages'),received=[],ids=new Set();
    if(!Array.isArray(list?.pages))throw Error('The saved page list was invalid. '+draftSafety());
    // Fetch and validate every file before changing any local page or canvas state.
    for(const entry of list.pages){
      if(entry?.id===retiredPageId)continue;
      if(!validId(entry?.id)||ids.has(entry.id))throw Error('The saved page list was invalid. '+draftSafety());
      ids.add(entry.id);const r=await request('pages/'+encodeURIComponent(entry.id)),p=cleanPage(r?.page);
      if(!p||p.id!==entry.id||!validSha(r?.sha))throw Error('A saved page was invalid. No repository pages were loaded. '+draftSafety());
      received.push({page:p,sha:r.sha,migrated:r.page.name!==p.name||r.page.view!==p.view||(isWebsite(p)&&r.page.coreVersion!==p.coreVersion)});
    }
    const next={...state,pages:state.pages.slice(),shas:{...state.shas},synced:{...state.synced},dirty:{...state.dirty},pending:{...state.pending}};
    let count=0,held=0;
    for(const r of received){const id=r.page.id,index=next.pages.findIndex(p=>p.id===id);
      // Check the latest local state, including edits made while files were loading.
      if(index>=0&&next.dirty[id]){held++;continue;}
      const savedTime=r.page.updatedAt,migrated=migrateDescription(r.page)||r.migrated;
      if(migrated)r.page.updatedAt=now();
      if(index>=0)next.pages[index]=r.page;else next.pages.push(r.page);
      next.shas[id]=r.sha;next.synced[id]=savedTime;next.dirty[id]=migrated;delete next.pending[id];count++;
    }
    state=next;persist();applyPage();announce(`Loaded ${count} saved pages.${held?' Kept '+held+' local drafts with unsaved changes. Export them before replacing them.':''}`);
  }
  async function saveRemote(){const p=JSON.parse(JSON.stringify(current()));let sha=state.shas[p.id];if(!sha){try{const remote=await request('pages/'+encodeURIComponent(p.id));if(state.synced[p.id]!==remote.page.updatedAt){showConflict(remote);return;}sha=remote.sha;}catch(e){if(!['NOT_FOUND','PAGE_NOT_FOUND'].includes(e.code))throw e;}}let r;try{r=await request('pages/'+encodeURIComponent(p.id),{method:'PUT',body:JSON.stringify({page:p,...(sha?{sha}:{})})});}catch(e){if(e.code==='CONFLICT'){showConflict(await request('pages/'+encodeURIComponent(p.id)));return;}throw e;}state.shas[p.id]=r.sha;state.synced[p.id]=p.updatedAt;state.dirty[p.id]=state.pages.find(x=>x.id===p.id)?.updatedAt!==p.updatedAt;delete state.pending[p.id];persist();announce('Saved '+p.name+' as a new revision in your private GitHub repository.');}
  function showConflict(remote){
    const page=cleanPage(remote?.page);
    if(!page||!validSha(remote?.sha)||!state.pages.some(p=>p.id===page.id)){announce('GitHub returned a conflict that could not be opened. '+draftSafety());return;}
    state.pending[page.id]={page,sha:remote.sha};persist();
    message='GitHub has a different revision of '+page.name+'. Review its saved version before replacing it.';
    renderPendingConflicts();
  }
  function renderPendingConflicts(){const remote=state.pending[state.active]||Object.values(state.pending)[0];if(remote)announce('A saved GitHub revision differs from '+remote.page.name+'. Its local draft and remote revision have both been retained.');}
  function download(name,text,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function markdown(p){return `# ${p.name}\n\n${p.description}\n\nCore: ${p.coreVersion}\n\nLayers: ${isWebsite(p)?'Website architecture':('Core Architecture'+p.modules.map(m=>', '+names[m]).join(''))}\n\nStatus: design proposal, not a deployed or validated implementation.\n\n`+p.sections.map(s=>`## ${s.name}\n\n${isWebsite(p)?'Website':'Core'} connection: ${anchorLabel(p,s.anchor)?.name||s.anchor}\n\nPurpose: ${s.purpose}\n\nInputs: ${s.inputs}\n\nOutputs: ${s.outputs}\n\nAcceptance: ${s.acceptance}\n\nAWS notes: ${s.awsNotes}\n`).join('\n');}
  function renderChat(){const p=current();$('#productBody').innerHTML=`<section class="productVision"><p class="productKicker">FROM AN IDEA TO A SYSTEM</p><p class="productLead">Think it through. Shape it in 3D.</p><p>The 3D Brain is a product concept for turning a customer's idea into an explorable model of the system they want to build. A customer would describe the idea, then work with a designer to map its components, responsibilities and connections.</p><p>Customers could receive access to their own 3D Brain and explore how each part affects the whole, from requirements and dependencies to tradeoffs and unanswered questions. The planned assistant would help refine the model; checks could test its stated rules and constraints.</p><p>The structured 3D Brain could become a data source for baseline AWS system architectures. AWS engineers would review the proposed services, security, resilience and cost before developing an implementation.</p><p class="productHint">Today, 3D Brain demonstrates the product concept, and the guide below explains the authored architecture references. Prompt-based generation, customer-specific access and automated AWS design are planned capabilities. Logical checks support design review; implementation and testing establish how a system works in practice.</p></section><div class="guideSuggestions"><button data-prompt="Explain the selected node">Explain this node</button>${isWebsite(p)?'<button data-prompt="Explain the website request to result workflow">Website workflow</button>':'<button data-prompt="Explain the complete architecture workflow">Complete workflow</button>'}<button data-prompt="Review my page">Review my page</button><button data-prompt="Explain the AWS mapping for the selected node">AWS mapping</button></div><div id="guideTranscript" role="log" aria-live="polite" aria-relevant="additions">${history.filter(h=>h.pageId===p.id).map(h=>`<article class="guideMessage ${h.role}"><small>${h.role==='user'?'You':'Reference guide'}</small>${h.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}${(h.actions||[]).map(a=>`<button data-guide-action="${esc(a.type)}" data-guide-id="${esc(a.id||'')}" data-guide-scope="${esc(a.scope||'')}">${esc(a.label)}</button>`).join('')}</article>`).join('')||`<p class="emptyState">Ask about ${esc(p.name)}, a component, its connections, or its AWS mapping.</p>`}</div><form id="guideForm" class="guideComposer"><label class="srOnly" for="guideQuestion">Ask about the workspace</label><textarea id="guideQuestion" name="question" rows="3" maxlength="1200" required placeholder="Ask about a component, connection or AWS mapping…"></textarea><button type="submit" class="productPrimary">Ask guide ↗</button></form>`;}
  function followGuideAction(type,id,requestedScope){
    if(type==='pages'){show('pages');return;}
    if(!['node','study'].includes(type))return;
    close(false);
    const site=window.SAWWebsite,program=window.SAWProgramModel?.forPage(current());
    if(site.active&&program){
      const models=[program.overview,...program.stages.map(stage=>stage.model)];
      const target=models.find(model=>model.scopeId===requestedScope&&(type!=='node'||model.nodes.some(node=>node.id===id)))
        ||(type==='node'?models.find(model=>model.nodes.some(node=>node.id===id)):null);
      if(target&&site.getState().scope!==target.scopeId)site.setProgramScope(target.scopeId);
    }
    if(type==='node')(site.active?site:api).select('node',id);
    else if(site.active)site.showStudy(id);
    else window.SAW.showStudy(id);
  }
  function ask(question){const activeApi=window.SAWWebsite.active?window.SAWWebsite:api,s=activeApi.getState();const answer=window.SAWGuide.answer(question,{graph:activeApi.scopedData||graphFor(current()),page:current(),selectedNode:s.selected?.kind==='node'?s.selected.id:null,aws:isWebsite(current())?window.SAWWebsite?.aws:window.AWS_LEARNING});history.push({role:'user',pageId:current().id,paragraphs:[question]},{role:'guide',pageId:current().id,...answer});history=history.slice(-48);renderChat();$('#guideQuestion').focus();$('#guideTranscript').scrollTop=$('#guideTranscript').scrollHeight;}
  $('#pagesToggle').onclick=()=>toggle('pages');$('#chatToggle').onclick=()=>toggle('chat');$('#productClose').onclick=()=>close(true);$('#activePageBadge').onclick=()=>drawer==='pages'?close(true):show('pages');
  $('#productDrawer').addEventListener('keydown',e=>{if(e.target.tagName==='SELECT')return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close(true);}},true);
  $('#detailsDock').addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer){e.preventDefault();e.stopImmediatePropagation();close(true);}},true);
  $('#detailsDock').addEventListener('click',e=>{if(e.target.closest('[data-tab]'))close(false);},true);
  $('#productBody').addEventListener('submit',e=>{e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f));try{if(f.id==='newPageForm'){const p=seed(crypto.randomUUID(),d.name.trim(),d.description.trim(),[]);if(!p.name)return;if(d.model==='website')p.coreVersion='system-architecture-workspace-v1';state.pages.push(p);state.active=p.id;state.dirty[p.id]=true;draftForm=null;persist();applyPage();render();}else if(f.id==='guideForm'){ask(d.question.trim());}}catch(error){announce(error.message);}});
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.workspacePage&&state.pages.some(p=>p.id===b.dataset.workspacePage)){state.active=b.dataset.workspacePage;draftForm=null;message='';persist();applyPage();if(drawer!=='pages')toggle('pages');else render();}if(b.dataset.prompt)ask(b.dataset.prompt);if(b.dataset.guideAction){const type=b.dataset.guideAction,id=b.dataset.guideId;followGuideAction(type,id,b.dataset.guideScope);}if(b.dataset.action==='new-page'){draftForm='page';if(drawer!=='pages')show('pages');else render();$('#newPageForm input').focus();}if(b.dataset.action==='cancel-form'){draftForm=null;render();}});
  window.addEventListener('saw:website-statechange',event=>{if(applying||!window.SAWWebsite.active)return;const view=window.SAWWebsite.getState().page;if(['brain','concept','ada','aws'].includes(view)&&view!==current().view){current().view=view;touch();syncPageSummary();}syncViewNavigation();});
  const requestedRoute=window.SAWProgramModel?.route(location.search);
  if(requestedRoute){
    let page=state.pages.find(p=>p.id===requestedRoute.projectId);
    if(!page){page={...defaults.find(p=>p.id===requestedRoute.projectId),sections:[],modules:[]};state.pages.push(page);}
    state.active=page.id;
    if(page.view!==requestedRoute.view){page.view=requestedRoute.view;page.updatedAt=now();state.dirty[page.id]=true;}
  }
  applyPage();
  if(requestedRoute){
    window.SAWWebsite.setProgramScope(requestedRoute.scope);
    // Consume landing hints so later project/view/scope choices restore normally.
    const address=new URL(location.href);address.searchParams.delete('project');address.searchParams.delete('view');
    window.history.replaceState(window.history.state,'',address.pathname+address.search+address.hash);
  }
  persist();const statusGeneration=connectionGeneration;request('status').then(s=>{if(statusGeneration!==connectionGeneration)return;connection=s;}).catch(()=>{if(statusGeneration===connectionGeneration)connection={configured:false};});
})();
