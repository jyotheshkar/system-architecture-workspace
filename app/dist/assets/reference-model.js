/* Readable two-dimensional Reference Architecture with orthogonal connections.
 * The source model, component identity and connections remain authoritative. */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg',abs=Math.abs,min=Math.min,max=Math.max,hypot=Math.hypot;
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
  const makeSvg = name => document.createElementNS(NS,name);
  const color = node => colors[node.id==='pic'?'pic':node.group||node.module] || colors.core;
  const icon = node => {
    const type = node.id==='pic'?'pic':node.id==='user'||node.id==='web-user'?'user':node.id==='workflow'||node.id==='web-baseline'?'workflow':node.group==='storage'||node.group==='services'?'memory':node.group==='runtime'?'workflow':node.group||node.module||'core';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(glyphs[type]||glyphs.core)+'</svg>';
  };


  const nodeSerial=(data,id)=>window.SAWStudyIdentity?.nodeSerial(data,id)||String(data.nodes.findIndex(n=>n.id===id)+1);
  const edgeSerial=(data,id)=>{
    if(window.SAWStudyIdentity?.edgeSerial)return window.SAWStudyIdentity.edgeSerial(data,id);
    const edge=data.edges.find(e=>e.id===id);if(!edge)return '';
    const from=edge.from||edge.source,ordinal=data.edges.filter(e=>(e.from||e.source)===from).findIndex(e=>e.id===id)+1;
    return nodeSerial(data,from)+'.'+ordinal;
  };
  function layoutCards(data,nodes,width){
    // Keep the main engineering flow wide enough to read before placing
    // supporting controls in their own bands. These are presentation points;
    // source coordinates and the authoritative directed graph stay unchanged.
    if(data.presentation?.layout==='foundation'){
      // The main authority-to-output path stays left to right. Planning and
      // verification occupy a separate branch band; shared controls and the
      // child workflow have their own lower bands, never perspective depth.
      const stepX=240,stepY=174,positions=new Map(),known={user:[-360,0],contract:[-120,0],core:[120,0],workflow:[360,0],plan:[0,-stepY],verify:[240,-stepY],pic:[-360,stepY],'foundation-artifacts':[-120,stepY],'foundation-iam':[120,stepY],'foundation-observe':[360,stepY]};
      const runtime=nodes.filter(n=>n.group==='runtime'),others=nodes.filter(n=>!known[n.id]&&n.group!=='runtime');
      nodes.forEach(n=>{if(known[n.id])positions.set(n.id,{x:known[n.id][0],y:known[n.id][1]});});
      runtime.forEach((n,i)=>positions.set(n.id,{x:(i-(runtime.length-1)/2)*stepX,y:stepY*2}));
      others.forEach((n,i)=>positions.set(n.id,{x:(i-(others.length-1)/2)*stepX,y:stepY*3}));
      const xs=[...positions.values()].map(p=>p.x),ys=[...positions.values()].map(p=>p.y),centerX=(min(...xs)+max(...xs))/2,centerY=(min(...ys)+max(...ys))/2;
      positions.forEach(p=>{p.x-=centerX;p.y-=centerY;});
      return {positions,columns:max(4,runtime.length,others.length),rows:new Set(ys).size,spanWidth:max(...xs)-min(...xs)+140,spanHeight:max(...ys)-min(...ys)+90,stepX,stepY};
    }
    const columns=width>1050?6:width>700?4:width>460?3:2,rows=Math.ceil(nodes.length/columns),stepX=226,stepY=174;
    const journey=data.presentation?.journey||[],rank=new Map(journey.map((id,i)=>[id,i]));
    const ordered=[...nodes].sort((a,b)=>Number(!rank.has(a.id))-Number(!rank.has(b.id))||(rank.get(a.id)??999)-(rank.get(b.id)??999));
    const positions=new Map(ordered.map((n,i)=>{const row=Math.floor(i/columns),count=min(columns,ordered.length-row*columns),col=row%2?count-1-i%columns:i%columns;return[n.id,{x:(col-(count-1)/2)*stepX,y:(row-(rows-1)/2)*stepY}];}));
    return {positions,columns,rows,stepX,stepY,spanWidth:(min(nodes.length,columns)-1)*stepX+140,spanHeight:(rows-1)*stepY+90};
  }
  function createEdgeRouter(points,halfW,halfH,edges=[]){
    const gap=max(2,min(7,halfW/10)),epsilon=.001,usedSegments=[];
    const incident=new Map([...points.keys()].map(id=>[id,edges.filter(e=>(e.from===id||e.to===id)&&points.has(e.from)&&points.has(e.to))]));
    const boxes=[...points].map(([id,p])=>({id,left:p.x-halfW-gap,right:p.x+halfW+gap,top:p.y-halfH-gap,bottom:p.y+halfH+gap}));
    const distance=(a,b)=>hypot(b.x-a.x,b.y-a.y);
    const intersects=(a,b,r)=>{
      if(abs(a.y-b.y)<epsilon)return a.y>r.top+epsilon&&a.y<r.bottom-epsilon&&max(a.x,b.x)>r.left+epsilon&&min(a.x,b.x)<r.right-epsilon;
      if(abs(a.x-b.x)<epsilon)return a.x>r.left+epsilon&&a.x<r.right-epsilon&&max(a.y,b.y)>r.top+epsilon&&min(a.y,b.y)<r.bottom-epsilon;
      let low=0,high=1;
      for(const [start,delta,lower,upper] of [[a.x,b.x-a.x,r.left+epsilon,r.right-epsilon],[a.y,b.y-a.y,r.top+epsilon,r.bottom-epsilon]]){
        if(abs(delta)<epsilon){if(start<=lower||start>=upper)return false;continue;}
        const first=(lower-start)/delta,last=(upper-start)/delta;
        low=max(low,min(first,last));high=min(high,max(first,last));if(low>high)return false;
      }
      return high>=0&&low<=1;
    };
    const clear=(a,b,ignore)=>!boxes.some(r=>!ignore?.has(r.id)&&intersects(a,b,r));
    const compact=path=>path.filter((p,i)=>!i||distance(p,path[i-1])>epsilon).filter((p,i,all)=>!i||i===all.length-1||abs((p.x-all[i-1].x)*(all[i+1].y-p.y)-(p.y-all[i-1].y)*(all[i+1].x-p.x))>epsilon);
    const svg=path=>compact(path).map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ');
    const ports=(id,edge)=>{const p=points.get(id),ignore=new Set([id]),list=incident.get(id)||[],ordinal=list.findIndex(e=>e.id===edge?.id),fraction=list.length>1&&ordinal>=0?(ordinal/(list.length-1)-.5)*1.3:0,xOffset=halfW*fraction,yOffset=halfH*fraction;return [
      {p:{x:p.x-halfW,y:p.y+yOffset},q:{x:p.x-halfW-gap,y:p.y+yOffset}},
      {p:{x:p.x+halfW,y:p.y+yOffset},q:{x:p.x+halfW+gap,y:p.y+yOffset}},
      {p:{x:p.x+xOffset,y:p.y-halfH},q:{x:p.x+xOffset,y:p.y-halfH-gap}},
      {p:{x:p.x+xOffset,y:p.y+halfH},q:{x:p.x+xOffset,y:p.y+halfH+gap}}
    ].filter(port=>clear(port.p,port.q,ignore));};
    const lanes=(axis,a,b)=>{
      const values=[...new Set(boxes.flatMap(r=>axis==='x'?[r.left,r.right]:[r.top,r.bottom]))].sort((x,y)=>x-y);
      const near=origin=>[...values].sort((x,y)=>abs(x-origin)-abs(y-origin)).slice(0,3);
      const between=values.slice(1).map((v,i)=>(v+values[i])/2).sort((x,y)=>abs(x-(a+b)/2)-abs(y-(a+b)/2)).slice(0,3);
      return [...new Set([(a+b)/2,...near(a),...near(b),...between,values[0]-gap,values[values.length-1]+gap])];
    };
    let visibility=null;
    function fallback(starts,ends){
      // Use a shared corner graph only if the short orthogonal candidates fail.
      // Every corner link is itself an obstacle-free orthogonal path.
      const join=(a,b)=>{
        const candidates=abs(a.x-b.x)<epsilon||abs(a.y-b.y)<epsilon?[[a,b]]:[[a,{x:b.x,y:a.y},b],[a,{x:a.x,y:b.y},b]];
        return candidates.map(compact).find(path=>path.slice(1).every((p,i)=>clear(path[i],p)))||null;
      };
      if(!visibility){
        const vertices=boxes.flatMap(r=>[{x:r.left,y:r.top},{x:r.right,y:r.top},{x:r.right,y:r.bottom},{x:r.left,y:r.bottom}]).filter(p=>!boxes.some(r=>p.x>r.left+epsilon&&p.x<r.right-epsilon&&p.y>r.top+epsilon&&p.y<r.bottom-epsilon));
        const links=vertices.map(()=>[]);
        for(let i=0;i<vertices.length;i++)for(let j=i+1;j<vertices.length;j++){const path=join(vertices[i],vertices[j]);if(path){const cost=path.slice(1).reduce((sum,p,k)=>sum+distance(path[k],p),0)+(path.length-2)*14;links[i].push([j,cost,path]);links[j].push([i,cost,[...path].reverse()]);}}
        visibility={vertices,links};
      }
      const count=visibility.vertices.length,vertices=[...visibility.vertices,...starts.map(p=>p.q),...ends.map(p=>p.q)],links=visibility.links.map(a=>[...a]);
      for(let i=count;i<vertices.length;i++)links.push([]);
      for(let i=count;i<vertices.length;i++)for(let j=0;j<i;j++){const path=join(vertices[i],vertices[j]);if(path){const cost=path.slice(1).reduce((sum,p,k)=>sum+distance(path[k],p),0)+(path.length-2)*14;links[i].push([j,cost,path]);links[j].push([i,cost,[...path].reverse()]);}}
      const costs=vertices.map(()=>Infinity),previous=vertices.map(()=>-1),previousPath=vertices.map(()=>null),origin=vertices.map(()=>-1),visited=new Set();
      starts.forEach((p,i)=>{costs[count+i]=gap;origin[count+i]=i;});
      for(let step=0;step<vertices.length;step++){
        let next=-1;for(let i=0;i<vertices.length;i++)if(!visited.has(i)&&(next<0||costs[i]<costs[next]))next=i;
        if(next<0||!Number.isFinite(costs[next]))break;
        if(next>=count+starts.length){const end=next-count-starts.length,path=[];let at=next;while(previous[at]>=0){path.unshift(...previousPath[at].slice(1));at=previous[at];}path.unshift(vertices[at]);return [starts[origin[next]].p,...path,ends[end].p];}
        visited.add(next);for(const [other,cost,path] of links[next])if(!visited.has(other)&&costs[next]+cost<costs[other]){costs[other]=costs[next]+cost;previous[other]=next;previousPath[other]=path;origin[other]=origin[next];}
      }
      return null;
    }
    const segmentCost=(a,b)=>usedSegments.slice(-20).reduce((cost,s)=>{
      const horizontal=abs(a.y-b.y)<epsilon,otherHorizontal=abs(s.a.y-s.b.y)<epsilon;
      if(horizontal===otherHorizontal){
        const near=horizontal?abs(a.y-s.a.y):abs(a.x-s.a.x);
        const overlap=horizontal?min(max(a.x,b.x),max(s.a.x,s.b.x))-max(min(a.x,b.x),min(s.a.x,s.b.x)):min(max(a.y,b.y),max(s.a.y,s.b.y))-max(min(a.y,b.y),min(s.a.y,s.b.y));
        if(near<4&&overlap>2)return cost+overlap*3+35;
      }else{
        const h=horizontal?{a,b}:s,v=horizontal?s:{a,b};
        if(v.a.x>min(h.a.x,h.b.x)+epsilon&&v.a.x<max(h.a.x,h.b.x)-epsilon&&h.a.y>min(v.a.y,v.b.y)+epsilon&&h.a.y<max(v.a.y,v.b.y)-epsilon)return cost+24;
      }
      return cost;
    },0);
    return (from,to,edge)=>{
      const a=points.get(from),b=points.get(to);if(!a||!b||abs(b.x-a.x)+abs(b.y-a.y)<epsilon)return '';
      const starts=ports(from,edge),ends=ports(to,edge),nearStarts=[...starts].sort((s,t)=>distance(s.q,b)-distance(t.q,b)).slice(0,2),nearEnds=[...ends].sort((s,t)=>distance(s.q,a)-distance(t.q,a)).slice(0,2),xs=lanes('x',a.x,b.x),ys=lanes('y',a.y,b.y);
      let best=null,bestCost=Infinity;
      const consider=(s,t,inside)=>{
        const path=compact(inside),length=path.slice(1).reduce((sum,p,i)=>sum+distance(path[i],p),0)+(path.length-2)*14;
        if(length>=bestCost||path.slice(1).some((p,i)=>!clear(path[i],p)))return;
        const cost=length+path.slice(1).reduce((sum,p,i)=>sum+segmentCost(path[i],p),0);
        if(cost>=bestCost)return;
        best=[s.p,...path,t.p];bestCost=cost;
      };
      for(const s of nearStarts)for(const t of nearEnds){
        consider(s,t,[s.q,{x:t.q.x,y:s.q.y},t.q]);consider(s,t,[s.q,{x:s.q.x,y:t.q.y},t.q]);
        for(const x of xs)consider(s,t,[s.q,{x,y:s.q.y},{x,y:t.q.y},t.q]);
        for(const y of ys)consider(s,t,[s.q,{x:s.q.x,y},{x:t.q.x,y},t.q]);
      }
      const path=compact(best||fallback(starts,ends)||[]);
      for(let i=1;i<path.length;i++)usedSegments.push({a:path[i-1],b:path[i]});
      return path.length?svg(path):'';
    };
  }

  const routePoints=d=>[...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m=>({x:+m[1],y:+m[2]}));
  function labelPoint(path,blocked,occupied,width,height,top=64,bottom=64){
    const ps=routePoints(path),candidates=[];
    for(let i=1;i<ps.length;i++){
      const a=ps[i-1],b=ps[i];
      for(const t of [.32,.5,.68,.18,.82])for(const offset of [-11,11,-20,20]){
        const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
        candidates.push(abs(b.x-a.x)>abs(b.y-a.y)?{x,y:y+offset}:{x:x+offset,y});
      }
    }
    return candidates.find(p=>p.x>18&&p.x<width-18&&p.y>top+8&&p.y<height-bottom-8&&!blocked.some(b=>abs(b.x-p.x)<b.w/2+17&&abs(b.y-p.y)<b.h/2+8)&&!occupied.some(q=>abs(q.x-p.x)<37&&abs(q.y-p.y)<17))||null;
  }
  class ReferenceModel{
    constructor(host){
      this.host=host;this.nodes=new Map();this.edges=[];this.visible=true;this.disposed=false;
      this.element=document.createElement('div');this.element.className='referenceModelHost';this.element.dataset.dimensions='2d';this.element.setAttribute('aria-label','Interactive 2D reference architecture with numbered components');
      this.edgeSvg=makeSvg('svg');this.edgeSvg.classList.add('referenceModelEdges');this.edgeSvg.setAttribute('aria-label','Directed architecture connections');
      this.overlay=document.createElement('div');this.overlay.className='referenceModelLabels';this.element.append(this.edgeSvg,this.overlay);host.prepend(this.element);
      this.onKey=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.siteEdge){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}};
      this.edgeSvg.addEventListener('keydown',this.onKey);
      this.onHover=e=>{this.hovered=e.target.closest('[data-site-edge]')?.dataset.siteEdge||null;this.refreshLabels();};
      this.onLeave=()=>{this.hovered=null;this.refreshLabels();};
      this.onFocus=e=>{this.focused=e.target.closest('[data-site-edge]')?.dataset.siteEdge||null;this.refreshLabels();};
      this.onBlur=()=>{this.focused=null;this.refreshLabels();};
      this.edgeSvg.addEventListener('pointerover',this.onHover);this.edgeSvg.addEventListener('pointerleave',this.onLeave);this.edgeSvg.addEventListener('focusin',this.onFocus);this.edgeSvg.addEventListener('focusout',this.onBlur);
    }
    clear(){
      this.nodes.clear();this.edges=[];this.overlay.replaceChildren();this.edgeSvg.replaceChildren();this.hovered=null;this.focused=null;
    }
    setData(data){
      if(this.disposed||data===this.data)return;this.clear();this.data=data;if(!data?.nodes?.length)return;
      this.element.dataset.modelId=data.id||'';
      for(const n of data.nodes){
        const b=document.createElement('button');b.type='button';b.className='referenceModelNode';b.dataset.siteNode=n.id;b.dataset.serial=nodeSerial(data,n.id);b.setAttribute('aria-label','Component '+nodeSerial(data,n.id)+': '+n.name+'; inspect component');b.setAttribute('aria-pressed','false');b.style.setProperty('--reference-color',color(n));
        const image=n.icon?'<img src="'+esc(n.icon)+'" alt="" draggable="false">':icon(n);
        b.innerHTML='<span class="referenceModelSerial">'+esc(nodeSerial(data,n.id))+'</span><span class="referenceModelGlyph">'+image+'</span><span class="referenceModelName">'+esc(n.short||n.name)+'</span>';
        this.overlay.append(b);this.nodes.set(n.id,{node:n,button:b});
      }
      for(const edge of data.edges||[]){
        if(!this.nodes.has(edge.from)||!this.nodes.has(edge.to))continue;
        const group=makeSvg('g'),visual=makeSvg('path'),hit=makeSvg('path'),arrow=makeSvg('path'),label=makeSvg('text');
        group.classList.add('referenceModelEdge');group.dataset.edgeId=edge.id;visual.classList.add('referenceModelRoute');hit.classList.add('referenceModelHit');arrow.classList.add('referenceModelArrow');label.classList.add('referenceModelEdgeSerial');
        hit.dataset.siteEdge=edge.id;hit.dataset.serial=edgeSerial(data,edge.id);hit.setAttribute('role','button');hit.setAttribute('tabindex','0');hit.setAttribute('aria-pressed','false');hit.setAttribute('aria-label','Connection '+edgeSerial(data,edge.id)+': '+this.nodes.get(edge.from).node.name+' to '+this.nodes.get(edge.to).node.name+'. '+(edge.label||edge.name||''));
        label.textContent=edgeSerial(data,edge.id);label.setAttribute('aria-hidden','true');arrow.setAttribute('aria-hidden','true');visual.setAttribute('aria-hidden','true');
        if(/planned|PATTERN|CONTAINMENT|repair|return|feedback|evidence/i.test(edge.status||edge.type||edge.label||''))group.classList.add('isDashed');
        group.append(visual,arrow,hit,label);this.edgeSvg.append(group);this.edges.push({edge,group,visual,hit,arrow,label,related:false,labelPoint:null});
      }
    }
    setVisible(v){this.visible=!!v;this.element.hidden=!v;}
    render(options){
      if(this.disposed||!this.visible||!this.data)return new Map();
      const {nodes=this.data.nodes,edges=this.data.edges,selected=null,labels=true,zoom=1,panX=0,panY=0}=options;
      const width=max(1,options.width||this.host.clientWidth),height=max(1,options.height||this.host.clientHeight),ids=new Set(nodes.map(n=>typeof n==='string'?n:n.id)),edgeIds=new Set(edges.map(e=>typeof e==='string'?e:e.id));
      const visible=this.data.nodes.filter(n=>ids.has(n.id)).sort((a,b)=>(a.layer||0)-(b.layer||0)||(a.order||0)-(b.order||0));if(!visible.length)return new Map();
      this.element.dataset.nodeCount=String(visible.length);this.element.dataset.edgeCount=String(edgeIds.size);this.element.classList.toggle('hideReferenceNames',!labels);
      const layout=layoutCards(this.data,visible,width),side=width<600?40:62,top=min(64,height*.24),bottom=min(64,height*.24),routePadding=min(24,height*.08);
      // Fit includes the connectors, not just the cards. The router's outer
      // lanes extend at most twice its 7px gap beyond a card. This extra inset
      // keeps those lanes and their study labels clear of the page badge and
      // creator credit, including a short landscape viewport.
      const baseScale=max(.01,min(1,(width-side*2-routePadding*2)/layout.spanWidth,(height-top-bottom-routePadding*2)/layout.spanHeight));
      // Cards and every connector share the exact same planar transform. Pan
      // and zoom can never bend the topology or change the relative spacing.
      const cardScale=baseScale*zoom;this.element.style.setProperty('--reference-card-scale',String(cardScale));
      const centerX=width/2+panX,centerY=(top+height-bottom)/2+panY,points=new Map();
      visible.forEach(n=>{const p=layout.positions.get(n.id);points.set(n.id,{x:centerX+p.x*cardScale,y:centerY+p.y*cardScale,z:0});});
      const destinations=new Set(),blocked=visible.map(n=>({...points.get(n.id),id:n.id,w:140*cardScale,h:90*cardScale})),occupied=[];
      const router=createEdgeRouter(points,70*cardScale,45*cardScale,this.data.edges);this.edgeSvg.setAttribute('viewBox','0 0 '+width+' '+height);
      const routeOrder=[...this.edges].sort((a,b)=>Number(!(selected&&(selected.kind==='edge'?selected.id===a.edge.id:a.edge.from===selected.id)))-Number(!(selected&&(selected.kind==='edge'?selected.id===b.edge.id:b.edge.from===selected.id))));
      for(const item of routeOrder){
        const {edge}=item,show=edgeIds.has(edge.id)&&ids.has(edge.from)&&ids.has(edge.to),related=!!selected&&(selected.kind==='edge'?selected.id===edge.id:edge.from===selected.id);
        item.group.style.display=show?'':'none';item.related=related;item.group.classList.toggle('isRelated',related);item.hit.setAttribute('aria-pressed',String(selected?.kind==='edge'&&selected.id===edge.id));if(!show)continue;
        if(related)destinations.add(edge.to);
        const d=router(edge.from,edge.to,edge);item.visual.setAttribute('d',d);item.hit.setAttribute('d',d);
        const ps=routePoints(d),a=ps[ps.length-2],b=ps[ps.length-1];
        if(a&&b){const angle=Math.atan2(b.y-a.y,b.x-a.x),length=5,wing=2.6,c={x:b.x-Math.cos(angle)*length,y:b.y-Math.sin(angle)*length};item.arrow.setAttribute('d','M'+b.x+' '+b.y+' L'+(c.x-Math.sin(angle)*wing)+' '+(c.y+Math.cos(angle)*wing)+' L'+(c.x+Math.sin(angle)*wing)+' '+(c.y-Math.cos(angle)*wing)+' Z');}
        item.labelPoint=labelPoint(d,blocked,occupied,width,height,top,bottom);if(item.labelPoint&&related)occupied.push(item.labelPoint);
        if(item.labelPoint){item.label.setAttribute('x',item.labelPoint.x);item.label.setAttribute('y',item.labelPoint.y);}
      }
      for(const item of this.nodes.values()){
        const p=points.get(item.node.id);item.button.hidden=!p;if(!p)continue;
        const chosen=selected?.kind==='node'&&selected.id===item.node.id;item.button.style.left=p.x.toFixed(2)+'px';item.button.style.top=p.y.toFixed(2)+'px';item.button.classList.toggle('isSelected',chosen);item.button.classList.toggle('isDestination',destinations.has(item.node.id));item.button.setAttribute('aria-pressed',String(chosen));
      }
      this.placed=blocked;this.refreshLabels();return points;
    }
    refreshLabels(){for(const item of this.edges)item.label.style.display=item.labelPoint&&(item.related||item.edge.id===this.hovered||item.edge.id===this.focused)?'':'none';}
    dispose(){if(this.disposed)return;this.disposed=true;this.clear();this.edgeSvg.removeEventListener('keydown',this.onKey);this.edgeSvg.removeEventListener('pointerover',this.onHover);this.edgeSvg.removeEventListener('pointerleave',this.onLeave);this.edgeSvg.removeEventListener('focusin',this.onFocus);this.edgeSvg.removeEventListener('focusout',this.onBlur);this.element.remove();this.data=null;}
  }
  ReferenceModel.layout=layoutCards;ReferenceModel.router=createEdgeRouter;window.SAWReferenceModel=ReferenceModel;
})();
