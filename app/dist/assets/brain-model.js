/* Separate 3D Brain presentation. Data and selection belong to the explorer.
 * Geometry adds navigable presentation depth to the current page model.
 * No animation loop, network request or app-state mutation is owned here. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const colors = {core:'#a4a9b1',memory:'#55b8aa',learning:'#dcb35f',tools:'#71a5e1',recovery:'#dc887a',specialists:'#b39adf',pic:'#ef626e',services:'#8facb7',runtime:'#b0a1d0',experience:'#84afcb',design:'#c4b27c',storage:'#78b8b1',delivery:'#baa1cd'};
  const glyphs = {
    core:'<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3"/>',
    memory:'<ellipse cx="12" cy="6" rx="8" ry="2"/><path d="M4 6v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2"/>',
    learning:'<path d="M12 3v5m0 8v5M4.2 7.5l4.3 2.5m7 4 4.3 2.5M4.2 16.5 8.5 14m7-4 4.3-2.5"/><circle cx="12" cy="12" r="3"/>',
    tools:'<path d="M14 6a5 5 0 0 0-6 6L3 17l4 4 5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z"/>',
    recovery:'<path d="M20 7v5h-5M4 17v-5h5M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3"/>',
    specialists:'<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="m11 7-5 9m7-9 5 9M7 18h10"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    workflow:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/><path d="M10 7h3a2 2 0 0 1 2 2v5M7 10v3a2 2 0 0 0 2 2h5"/>',
    pic:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4" rx=".5"/><path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3M18 9h3m-3 6h3"/>',
    experience:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18M8 12l3 3-3 3m6 0h3"/>',
    design:'<path d="m5 18 2-6L17 2l5 5-10 10-7 1ZM14 5l5 5M3 22h18"/>',
    delivery:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v10l9 4 9-4V8M12 13v9"/>',
    check:'<path d="m5 12 4 4L19 6"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10"/>'
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const makeSvg = name => document.createElementNS(NS,name);
  const nodeSerial=(data,id)=>window.SAWStudyIdentity?.nodeSerial(data,id)||String(data.nodes.findIndex(n=>n.id===id)+1);
  const edgeSerial=(data,id)=>{
    if(window.SAWStudyIdentity?.edgeSerial)return window.SAWStudyIdentity.edgeSerial(data,id);
    const edge=data.edges.find(e=>e.id===id);if(!edge)return '';
    const from=edge.from||edge.source,ordinal=data.edges.filter(e=>(e.from||e.source)===from).findIndex(e=>e.id===id)+1;
    return nodeSerial(data,from)+'.'+ordinal;
  };
  const node01Positions={
    'n01-browser':[-30,18,2],'n01-api':[-10,18,0],'n01-intake':[10,18,0],'n01-store':[30,18,0],
    'n01-streams':[30,-3,2],'n01-relay':[10,-3,0],'n01-queue':[-10,-3,0],'n01-node02':[-30,-3,-2],
    'n01-amplify':[-32,40,-12],'n01-cognito':[-10,40,-9],'n01-history':[26,40,-12],
    'n01-scheduler':[30,-26,14],'n01-reconcile':[8,-26,10],'n01-dlq':[-14,-26,12]
  };
  const node01Labels={'n01-browser':'Customer','n01-amplify':'Open the app','n01-cognito':'Sign in','n01-api':'Secure entry','n01-intake':'Check request','n01-history':'View history','n01-store':'Save safely','n01-streams':'Notice new work','n01-relay':'Send onward','n01-scheduler':'Recovery clock','n01-reconcile':'Recover handoff','n01-queue':'Delivery queue','n01-node02':'Next-stage boundary','n01-dlq':'Review failures'};
  const namedBrain = data => !!(data?.node01||data?.programModel);
  const endpoint = node => ['user','workflow','web-user','web-baseline','n01-browser','n01-node02'].includes(node.id);
  const color = node => node.id.startsWith('n01-')?'#bdc4cd':colors[node.id==='pic'?'pic':node.group||node.module] || colors.core;
  const icon = node => {
    const n01Icon={'n01-browser':'user','n01-amplify':'experience','n01-cognito':'check','n01-api':'check','n01-intake':'check','n01-history':'recovery','n01-store':'memory','n01-streams':'workflow','n01-relay':'workflow','n01-scheduler':'recovery','n01-reconcile':'recovery','n01-queue':'delivery','n01-node02':'workflow','n01-dlq':'check'};
    const type = n01Icon[node.id]|| (node.id==='pic'?'pic':node.id==='user'||node.id==='web-user'?'user':node.id==='workflow'||node.id==='web-baseline'?'workflow':node.group==='storage'||node.group==='services'?'memory':node.group==='runtime'?'workflow':node.group||node.module||'core');
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(glyphs[type]||glyphs.core)+'</svg>';
  };

  class BrainModel {
    constructor(host) {
      this.host=host;this.data=null;this.nodes=new Map();this.edges=[];this.last=null;this.visible=true;this.disposed=false;this.hovered=null;this.focused=null;
      this.element=document.createElement('div');this.element.className='brainModelHost';this.element.setAttribute('aria-label','Interactive 3D Brain with numbered components');
      this.edgeSvg=makeSvg('svg');this.edgeSvg.classList.add('brainModelEdges');
      this.leaderSvg=makeSvg('svg');this.leaderSvg.classList.add('brainModelLeaders');this.leaderSvg.setAttribute('aria-hidden','true');
      this.overlay=document.createElement('div');this.overlay.className='brainModelLabels';
      this.element.append(this.edgeSvg,this.leaderSvg,this.overlay);host.prepend(this.element);
      this.scene=new THREE.Scene();this.scene.background=null;this.camera=new THREE.PerspectiveCamera(40,1,.1,2000);
      this.pivot=new THREE.Group();this.model=new THREE.Group();this.pivot.add(this.model);this.scene.add(this.pivot);
      try {
        this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
        this.renderer.setClearColor(0,0);this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
        this.renderer.domElement.className='brainModelCanvas';this.renderer.domElement.setAttribute('aria-hidden','true');this.element.prepend(this.renderer.domElement);
      } catch { this.renderer=null;this.element.classList.add('brainModelFallback'); }
      this.onHover=event=>{const b=event.target.closest('[data-site-node]');this.hovered=b?.dataset.siteNode||null;this.placeCaption();};
      this.onLeave=()=>{this.hovered=null;this.placeCaption();};
      this.onFocus=event=>{this.focused=event.target.closest('[data-site-node]')?.dataset.siteNode||null;this.placeCaption();};
      this.onBlur=event=>{if(!this.element.contains(event.relatedTarget))this.focused=null;else this.focused=event.relatedTarget?.closest('[data-site-node]')?.dataset.siteNode||null;this.placeCaption();};
      this.overlay.addEventListener('pointerover',this.onHover);this.overlay.addEventListener('pointerleave',this.onLeave);this.overlay.addEventListener('focusin',this.onFocus);this.overlay.addEventListener('focusout',this.onBlur);
      this.onEdgeKey=event=>{if((event.key==='Enter'||event.key===' ')&&event.target.dataset.siteEdge){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}};
      this.edgeSvg.addEventListener('keydown',this.onEdgeKey);
      this.onEdgeHover=event=>{this.hoveredEdge=event.target.closest('[data-site-edge]')?.dataset.siteEdge||null;this.refreshEdgeLabels();};
      this.onEdgeLeave=()=>{this.hoveredEdge=null;this.refreshEdgeLabels();};
      this.onEdgeFocus=event=>{this.focusedEdge=event.target.closest('[data-site-edge]')?.dataset.siteEdge||null;this.refreshEdgeLabels();};
      this.onEdgeBlur=()=>{this.focusedEdge=null;this.refreshEdgeLabels();};
      this.edgeSvg.addEventListener('pointerover',this.onEdgeHover);this.edgeSvg.addEventListener('pointerleave',this.onEdgeLeave);this.edgeSvg.addEventListener('focusin',this.onEdgeFocus);this.edgeSvg.addEventListener('focusout',this.onEdgeBlur);
    }

    clear() {
      for(const child of [...this.model.children]) {
        child.traverse(object=>{object.geometry?.dispose();if(Array.isArray(object.material))object.material.forEach(m=>m.dispose());else object.material?.dispose();});
        this.model.remove(child);
      }
      this.nodes.clear();this.edges=[];this.overlay.replaceChildren();this.edgeSvg.replaceChildren();this.leaderSvg.replaceChildren();this.hovered=null;this.focused=null;this.hoveredEdge=null;this.focusedEdge=null;
    }

    setData(data) {
      if(this.disposed||data===this.data)return;
      this.clear();this.data=data;this.element.dataset.modelId=data?.id||'';this.element.classList.toggle('isCustomerBrain',namedBrain(data));
      if(!data?.nodes?.length)return;
      // A real source Z dimension is authoritative for the canonical model.
      // Flat manually arranged sources keep their semantic X/Y layout; depth is
      // presentation only and never modifies the source or its connections.
      const canonical = data.nodes.some(n=>n.module)&&!data.foundation;
      let rawProgram=data.programModel&&!data.node01?data.nodes.map((node,index)=>Array.isArray(node.pos)?node.pos:[(index%4)*28,-Math.floor(index/4)*28,(index%3-1)*8]):null;
      // A lifecycle authored as one concept column still deserves spatial
      // separation in the Brain. This changes presentation, never source edges.
      if(rawProgram&&new Set(rawProgram.map(p=>p[0])).size===1)rawProgram=rawProgram.map((p,index)=>{const row=Math.floor(index/4),column=row%2?3-index%4:index%4;return[column*28,-row*28,Math.sin(index*1.7)*10];});
      const programSpan=rawProgram?[0,1,2].map(axis=>Math.max(...rawProgram.map(p=>Number(p[axis]||0)))-Math.min(...rawProgram.map(p=>Number(p[axis]||0)))):null;
      const programCentre=rawProgram?[0,1,2].map(axis=>(Math.max(...rawProgram.map(p=>Number(p[axis]||0)))+Math.min(...rawProgram.map(p=>Number(p[axis]||0))))/2):null;
      data.nodes.forEach((node,index)=>{
        const source=data.node01&&node01Positions[node.id]?node01Positions[node.id]:Array.isArray(node.pos)?node.pos:[0,0,0];
        const raw=rawProgram?rawProgram[index].map((value,axis)=>(Number(value||0)-programCentre[axis])/(programSpan[axis]||1)*[228,76,24][axis]):source;
        const depth=data.node01?Number(raw[2]||0):data.programModel?Number(raw[2]||0)+(programSpan?.[2]?0:Math.sin(index*2.39996)*9):canonical?Number(raw[2]||0):Number(raw[2]||0)+Math.sin(index*2.39996)*7+(node.group==='core'?2:0);
        const position=new THREE.Vector3(Number(raw[0]||0)*(data.node01?3.8:1),Number(raw[1]||0),depth);
        const point=new THREE.Mesh(new THREE.SphereGeometry(endpoint(node)?.26:.15,10,8),new THREE.MeshBasicMaterial({color:data.programModel?'#bdc4cd':color(node),transparent:true,opacity:.85}));point.position.copy(position);this.model.add(point);
        const button=document.createElement('button');button.type='button';button.className='brainModelNode'+(endpoint(node)?' isEndpoint':'')+(namedBrain(data)?' isNamedComponent':'');button.dataset.siteNode=node.id;button.dataset.serial=nodeSerial(data,node.id);button.setAttribute('aria-label','Component '+nodeSerial(data,node.id)+': '+node.name+'; inspect component');button.setAttribute('aria-pressed','false');button.style.setProperty('--brain-color',data.programModel?'#bdc4cd':color(node));
        button.innerHTML='<span class="brainModelSerial">'+esc(nodeSerial(data,node.id))+'</span><span class="brainModelGlyph">'+icon(node)+'</span>'+(endpoint(node)||namedBrain(data)?'<span class="brainModelEndpointName">'+esc(data.node01&&!node.exploreScope?node01Labels[node.id]||node.short||node.name:node.brainLabel||node.short||node.name)+'</span>':'');
        button.title=node.name;
        const caption=document.createElement('span');caption.className='brainModelCaption';caption.textContent=node.short||node.name;caption.hidden=true;button.append(caption);this.overlay.append(button);
        const leader=makeSvg('line');this.leaderSvg.append(leader);
        this.nodes.set(node.id,{node,position,point,button,caption,leader,screen:null,placed:null});
      });
      (data.edges||[]).forEach((edge,index)=>{
        const source=this.nodes.get(edge.from||edge.source),target=this.nodes.get(edge.to||edge.target);if(!source||!target)return;
        const a=source.position,b=target.position,delta=b.clone().sub(a),perp=new THREE.Vector3(-delta.y,delta.x,3).normalize();
        const back=/repair|evidence|return|feedback/i.test(edge.type||edge.name||edge.label||'');
        const middle=a.clone().lerp(b,.5).addScaledVector(perp,(back?3.4:1.7)*(index%2?1:-1));middle.z+=(index%3-1)*1.8;
        const curve=new THREE.QuadraticBezierCurve3(a,middle,b),dashed=back||edge.planned||/PATTERN|CONTAINMENT/.test(edge.type||'');
        const material=dashed?new THREE.LineDashedMaterial({color:'#8c929a',transparent:true,opacity:.25,dashSize:.6,gapSize:.45}):new THREE.LineBasicMaterial({color:'#8c929a',transparent:true,opacity:.25});
        const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(44)),material);line.computeLineDistances();this.model.add(line);
        const arrow=new THREE.Mesh(new THREE.ConeGeometry(.14,.45,7),new THREE.MeshBasicMaterial({color:'#c3c9cf',transparent:true,opacity:.5}));arrow.position.copy(curve.getPoint(.79));arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),curve.getTangent(.79).normalize());this.model.add(arrow);
        const path=makeSvg('path');path.dataset.siteEdge=edge.id;path.dataset.serial=edgeSerial(data,edge.id);path.setAttribute('role','button');path.setAttribute('tabindex','0');path.setAttribute('aria-label','Connection '+edgeSerial(data,edge.id)+': '+source.node.name+' to '+target.node.name+'. '+(edge.name||edge.label||''));path.setAttribute('aria-pressed','false');if(dashed)path.classList.add('isDashed');this.edgeSvg.append(path);
        const label=makeSvg('text');label.classList.add('brainModelEdgeSerial');label.textContent=edgeSerial(data,edge.id);label.setAttribute('aria-hidden','true');this.edgeSvg.append(label);
        this.edges.push({edge,source,target,curve,line,arrow,path,label,related:false,labelPoint:null});
      });
    }

    setVisible(visible) {this.visible=!!visible;this.element.hidden=!visible;}

    render(options) {
      if(this.disposed||!this.visible||!this.data)return new Map();
      const {nodes=this.data.nodes,edges=this.data.edges,selected=null,labels=true,rotation=.13,pitch=.13,zoom=1,panX=0,panY=0}=options;
      const width=Math.max(1,options.width||this.host.clientWidth),height=Math.max(1,options.height||this.host.clientHeight),ids=new Set(nodes.map(n=>typeof n==='string'?n:n.id)),edgeIds=new Set(edges.map(e=>typeof e==='string'?e:e.id));
      const visible=[...this.nodes.values()].filter(n=>ids.has(n.node.id));if(!visible.length)return new Map();
      this.last={...options,width,height,labels,selected};this.element.dataset.nodeCount=String(visible.length);this.element.dataset.edgeCount=String(edgeIds.size);this.element.classList.toggle('hideBrainNames',!labels);
      const box=new THREE.Box3().setFromPoints(visible.map(n=>n.position)),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
      this.model.position.copy(center).multiplyScalar(-1);this.pivot.rotation.set(pitch,rotation,0);this.pivot.position.set(0,0,0);this.pivot.updateMatrixWorld(true);
      const world=visible.map(n=>n.point.getWorldPosition(new THREE.Vector3())),rotated=new THREE.Box3().setFromPoints(world),extent=rotated.getSize(new THREE.Vector3());
      const compact=namedBrain(this.data)&&(width<650||height<260);
      const top=namedBrain(this.data)?(height<260?8:Math.min(32,height*.1)):Math.min(118,height*.24),bottom=namedBrain(this.data)?(height<260?8:Math.min(38,height*.1)):Math.min(64,height*.14),side=namedBrain(this.data)?(height<260||width<600?76:80):width<600?45:64;
      const usableWidth=Math.max(120,width-side*2-42),usableHeight=Math.max(90,height-top-bottom-46),fov=Math.tan(Math.PI/9);
      const distance=Math.max(38,(extent.x+8)/(2*fov)*(height/usableWidth),(extent.y+8)/(2*fov)*(height/usableHeight))+(extent.z/2);
      this.camera.aspect=width/height;this.camera.position.set(0,0,distance/clamp(zoom,.45,8));this.camera.lookAt(0,0,0);this.camera.updateProjectionMatrix();
      const unitsPerPixel=2*this.camera.position.z*fov/height;
      this.pivot.position.set(panX*unitsPerPixel,((bottom-top)/2-panY)*unitsPerPixel,0);this.pivot.updateMatrixWorld(true);this.camera.updateMatrixWorld(true);
      if(this.renderer){if(this.width!==width||this.height!==height)this.renderer.setSize(width,height,false);this.width=width;this.height=height;}
      const project=position=>{const p=position.clone().applyMatrix4(this.model.matrixWorld).project(this.camera);return{x:(p.x*.5+.5)*width,y:(-.5*p.y+.5)*height,z:p.z};};
      const connected=new Set();
      for(const item of this.edges) {
        const show=edgeIds.has(item.edge.id)&&ids.has(item.source.node.id)&&ids.has(item.target.node.id),important=!!selected&&(selected.kind==='edge'?selected.id===item.edge.id:item.source.node.id===selected.id);
        item.line.visible=show;item.arrow.visible=show;item.path.style.display=show?'':'none';item.label.style.display='none';item.related=important;item.labelPoint=null;if(!show)continue;
        if(important)connected.add(item.target.node.id);
        item.line.material.color.set(important?'#ffffff':'#8c929a');item.line.material.opacity=important?1:.24;item.arrow.material.color.set(important?'#ffffff':'#8c929a');item.arrow.material.opacity=important?1:.5;
        item.path.classList.toggle('isRelated',!!important);item.path.setAttribute('aria-pressed',String(selected?.kind==='edge'&&selected.id===item.edge.id));
        item.path.setAttribute('d',item.curve.getPoints(22).map((point,i)=>{const p=project(point);return(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2);}).join(' '));
      }
      const placed=[],screenPoints=new Map(),usedSlots=new Set();
      const sorted=[...visible].sort((a,b)=>Number(b.node.id===selected?.id)-Number(a.node.id===selected?.id)||Number(endpoint(b.node))-Number(endpoint(a.node))||a.position.z-b.position.z);
      for(const item of this.nodes.values()) {
        const show=ids.has(item.node.id);item.point.visible=show;item.button.hidden=!show;item.leader.style.display='none';item.caption.hidden=true;if(!show){item.screen=null;item.placed=null;continue;}
        const chosen=selected?.kind==='node'&&selected.id===item.node.id;item.button.classList.toggle('isSelected',chosen);item.button.classList.toggle('isConnected',connected.has(item.node.id));item.button.classList.toggle('isDestination',connected.has(item.node.id));item.button.setAttribute('aria-pressed',String(chosen));item.point.material.color.set(chosen?'#ffffff':this.data.programModel?'#bdc4cd':color(item.node));
      }
      for(const item of sorted) {
        const p=project(item.position);item.screen=p;screenPoints.set(item.node.id,p);
        const badge=(endpoint(item.node)||namedBrain(this.data))&&labels,w=namedBrain(this.data)?(height<260?Math.max(82,Math.min(94,Math.floor((width-170)/7))):width<360?90:width<650?102:116):badge?(width<480?92:108):34,h=namedBrain(this.data)?(height<260?40:44):34;
        item.button.style.setProperty('--brain-node-height',h+'px');
        item.button.style.setProperty('--brain-node-width',w+'px');
        const bounds={left:side+w/2-12,right:width-side-w/2+12,top:top+h/2,bottom:height-bottom-h/2};
        // Keep the live 3D point in place. Only labels move when needed, joined
        // to their true point by a subtle leader, just like the original model.
        const anchor={x:clamp(p.x,bounds.left,bounds.right),y:clamp(p.y,bounds.top,bounds.bottom)};
        let best=null;
        if(compact){
          const columns=Math.max(1,Math.floor((bounds.right-bounds.left)/(w+7))+1),rows=Math.max(1,Math.floor((bounds.bottom-bounds.top)/(h+7))+1),slots=[];
          for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const key=row+':'+col;if(usedSlots.has(key))continue;const x=columns===1?(bounds.left+bounds.right)/2:bounds.left+col*(bounds.right-bounds.left)/(columns-1),y=rows===1?(bounds.top+bounds.bottom)/2:bounds.top+row*(bounds.bottom-bounds.top)/(rows-1);slots.push({key,x,y,w,h,cost:Math.hypot(x-anchor.x,y-anchor.y)});}
          slots.sort((a,b)=>a.cost-b.cost);if(slots[0]){best=slots[0];usedSlots.add(best.key);}
        }
        for(let radius=0;radius<=Math.max(width,height)&&!best;radius+=12) {
          const count=radius?Math.max(12,Math.ceil(radius/6)):1;
          for(let i=0;i<count;i++) {
            const theta=i/count*Math.PI*2,x=anchor.x+Math.cos(theta)*radius,y=anchor.y+Math.sin(theta)*radius;
            if(x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom)continue;
            if(placed.some(q=>Math.abs(q.x-x)<(q.w+w)/2+7&&Math.abs(q.y-y)<(q.h+h)/2+7))continue;
            best={x,y,w,h};break;
          }
        }
        const place=best||{...anchor,w,h};placed.push({...place,id:item.node.id});item.placed=place;
        item.button.style.left=place.x.toFixed(2)+'px';item.button.style.top=place.y.toFixed(2)+'px';item.button.style.zIndex=String(item.node.id===selected?.id?4:2);
        item.button.style.visibility=p.z>-1&&p.z<1?'visible':'hidden';
        const displacement=Math.hypot(p.x-place.x,p.y-place.y);
        if(displacement>10){item.leader.style.display='';item.leader.setAttribute('x1',p.x);item.leader.setAttribute('y1',p.y);item.leader.setAttribute('x2',place.x);item.leader.setAttribute('y2',place.y);item.leader.classList.toggle('isSelected',item.node.id===selected?.id);}
      }
      const occupied=[];
      for(const item of this.edges){
        if(item.path.style.display==='none')continue;
        const candidates=[];
        for(const t of [.3,.42,.55,.68,.8]){const p=project(item.curve.getPoint(t));for(const dy of [-9,9])candidates.push({x:p.x,y:p.y+dy});}
        const point=candidates.find(p=>p.x>18&&p.x<width-18&&p.y>top-18&&p.y<height-bottom+18&&!placed.some(q=>Math.abs(q.x-p.x)<q.w/2+18&&Math.abs(q.y-p.y)<q.h/2+16)&&!occupied.some(q=>Math.abs(q.x-p.x)<37&&Math.abs(q.y-p.y)<17));
        item.labelPoint=point||null;if(point){item.label.setAttribute('x',point.x);item.label.setAttribute('y',point.y);if(item.related)occupied.push(point);}
      }
      this.placed=placed;this.placeCaption();this.refreshEdgeLabels();this.renderer?.render(this.scene,this.camera);return screenPoints;
    }

    refreshEdgeLabels(){for(const item of this.edges)item.label.style.display=item.labelPoint&&(item.related||item.edge.id===this.hoveredEdge||item.edge.id===this.focusedEdge)?'':'none';}

    placeCaption() {
      if(!this.last)return;
      for(const item of this.nodes.values())item.caption.hidden=true;
      if(!this.last.labels)return;
      const id=this.focused||this.hovered||(this.last.selected?.kind==='node'?this.last.selected.id:null),item=this.nodes.get(id);
      if(!item?.placed||item.button.hidden||endpoint(item.node)||namedBrain(this.data))return;
      const {width,height}=this.last,p=item.placed,caption=item.caption,w=Math.min(174,Math.max(90,caption.textContent.length*6+20)),h=caption.textContent.length>26?45:29;
      const candidates=[{x:p.x,y:p.y-26-h/2},{x:p.x,y:p.y+26+h/2},{x:p.x+26+w/2,y:p.y},{x:p.x-26-w/2,y:p.y}];
      const score=point=>{
        const overflow=Math.max(0,10-point.x+w/2)+Math.max(0,point.x+w/2-width+10)+Math.max(0,75-point.y+h/2)+Math.max(0,point.y+h/2-height+32);
        const collisions=(this.placed||[]).filter(q=>q.id!==id&&Math.abs(q.x-point.x)<(q.w+w)/2+4&&Math.abs(q.y-point.y)<(q.h+h)/2+4).length;
        return overflow*100+collisions*1000;
      };
      const best=candidates.sort((a,b)=>score(a)-score(b))[0];caption.style.width=w+'px';caption.style.left=(clamp(best.x,w/2+10,width-w/2-10)-p.x+p.w/2)+'px';caption.style.top=(clamp(best.y,h/2+75,height-h/2-32)-p.y+17)+'px';caption.hidden=false;item.button.style.zIndex='6';
    }

    dispose() {
      if(this.disposed)return;this.disposed=true;this.clear();this.renderer?.dispose();this.renderer?.forceContextLoss();this.overlay.removeEventListener('pointerover',this.onHover);this.overlay.removeEventListener('pointerleave',this.onLeave);this.overlay.removeEventListener('focusin',this.onFocus);this.overlay.removeEventListener('focusout',this.onBlur);this.edgeSvg.removeEventListener('keydown',this.onEdgeKey);this.edgeSvg.removeEventListener('pointerover',this.onEdgeHover);this.edgeSvg.removeEventListener('pointerleave',this.onEdgeLeave);this.edgeSvg.removeEventListener('focusin',this.onEdgeFocus);this.edgeSvg.removeEventListener('focusout',this.onEdgeBlur);this.element.remove();this.data=null;
    }
  }
  window.SAWBrainModel=BrainModel;
})();
