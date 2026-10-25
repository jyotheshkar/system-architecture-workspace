/* Provider-neutral responsibilities. Every node and connection comes from the
 * active page model; this view does not infer deployment or completion. */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg=name=>document.createElementNS(NS,name);
  const from=e=>e.from||e.source,to=e=>e.to||e.target;
  const serial=(d,id)=>window.SAWStudyIdentity?.nodeSerial(d,id)||String(d.nodes.findIndex(n=>n.id===id)+1);
  const paths={person:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',screen:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',shield:'<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8 12 3 3 5-6"/>',check:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 3 3 5-6"/>',store:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 4 16 4 16 0V6M4 12c0 4 16 4 16 0"/>',flow:'<path d="M4 7h11m-4-4 4 4-4 4M20 17H9m4-4-4 4 4 4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',boundary:'<path d="M5 3v18M11 12h10m-4-4 4 4-4 4"/>',history:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l4 2"/>',box:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v10l9 4 9-4V8M12 13v9"/>'};
  const node01Copy={
    'n01-browser':['Customer','Write a requirement','person'],
    'n01-amplify':['Open the application','Load the public interface','screen'],
    'n01-cognito':['Sign in','Prove who is asking','shield'],
    'n01-api':['Secure entry','Check token and route scope','shield'],
    'n01-intake':['Check the request','Confirm current permissions','check'],
    'n01-history':['View history and status','Read authorised records','history'],
    'n01-store':['Save the request safely','Commit receipt and handoff duty','store'],
    'n01-streams':['Notice committed work','React to the saved outbox','flow'],
    'n01-relay':['Send the handoff','Lease and forward a stable event','flow'],
    'n01-scheduler':['Start recovery checks','Wake the recovery process','clock'],
    'n01-reconcile':['Recover a delayed handoff','Retry outstanding work safely','history'],
    'n01-queue':['Hold work for delivery','Buffer references and retries','box'],
    'n01-node02':['Next-stage boundary','Durable receipt still required','boundary'],
    'n01-dlq':['Review failed delivery','Operator review before replay','check']
  };
  const node01Main=['n01-browser','n01-api','n01-intake','n01-store','n01-streams','n01-relay','n01-queue','n01-node02'];
  const webMain=['web-user','web-requirements','web-canvas','web-checks','web-aws-mapping','web-engineer','web-baseline'];
  const webLeft=['web-entry','web-session','web-transition','web-shell','web-page','web-sections','web-drafts','web-store-api','web-github'];
  const webRight=['web-ai','web-workflow','web-study','web-guide','web-router','web-release','web-archive','web-secrets'];
  let instance=0;
  class ConceptDesign {
    constructor(host){
      this.host=host;this.data=null;this.visible=true;this.disposed=false;this.last=null;this.signature='';this.buttons=new Map();this.links=[];this.uid='concept-'+(++instance);
      this.element=document.createElement('div');this.element.className='conceptDesignHost';this.element.setAttribute('aria-label','Concept design architecture');
      this.viewport=document.createElement('div');this.viewport.className='conceptViewport';this.viewport.setAttribute('role','region');this.viewport.setAttribute('aria-label','Concept architecture, scroll to explore');this.viewport.tabIndex=0;
      this.sheet=document.createElement('div');this.sheet.className='conceptSheet';this.edgeSvg=svg('svg');this.edgeSvg.classList.add('conceptEdges');
      this.heading=document.createElement('div');this.heading.className='conceptLanes';this.cards=document.createElement('div');this.cards.className='conceptCards';this.sheet.append(this.heading,this.edgeSvg,this.cards);this.viewport.append(this.sheet);this.element.append(this.viewport);host.prepend(this.element);
      this.onKey=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.siteEdge){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}};this.edgeSvg.addEventListener('keydown',this.onKey);
      this.resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(this.visible&&this.last)this.layout();}):null;this.resize?.observe(this.viewport);
    }
    setData(data){if(this.disposed||data===this.data)return;this.data=data;this.element.classList.toggle('isProgramConcept',!!data?.programModel);this.signature='';this.last=null;this.renderNodes=[];this.renderEdges=[];this.positions=new Map();this.links=[];this.buttons.clear();this.cards.replaceChildren();this.edgeSvg.replaceChildren();this.element.dataset.nodeCount='0';this.element.dataset.edgeCount='0';this.viewport.scrollTop=0;}
    setVisible(visible){if(this.disposed)return;this.visible=!!visible;this.element.hidden=!visible;if(visible&&this.last)this.layout();}
    overview(){const name=esc(this.data?.title||'This page');return '<h3>Concept Design Architecture</h3><p>'+name+' explained as responsibilities and information flow. Follow the centre path from the customer to the intended output. The side paths show access, recovery and supporting work.</p><p>Select a component to inspect its source details. Its outgoing connections become white and their destinations pulse. Each connection opens the original relationship.</p><p>'+(this.data?.node01?'Node 01 accepts and preserves an authorised customer requirement. Acceptance means durable intake, not completion of a contract or a workflow. Node 02 remains an interface boundary. This source is a proposed design; AWS implementation is unknown and AWS tests have not run.':'Current workspace capabilities and proposed product capabilities retain their source status. A conceptual connection does not demonstrate runtime enforcement or a deployed AWS system.')+'</p>';}
    arrangement(nodes){
      if(this.data?.programModel&&!this.data?.node01){
        const positions=new Map(),occupied=new Set();
        nodes.forEach((node,index)=>{
          const explicit=node.concept,column=explicit&&[0,1,2].includes(explicit.column)?explicit.column:1;
          let row=explicit&&Number.isInteger(explicit.row)&&explicit.row>=0?explicit.row:index;
          while(occupied.has(column+':'+row))row++;
          occupied.add(column+':'+row);positions.set(node.id,{column,row,main:explicit?.main??column===1});
        });
        return positions;
      }
      const isNode01=!!this.data?.node01,main=isNode01?node01Main:webMain;
      const positions=new Map();let left=0,right=0,centre=0;
      for(const id of main){if(nodes.some(n=>n.id===id))positions.set(id,{column:1,row:centre++,main:true});}
      const assign=(id,column,row)=>{if(nodes.some(n=>n.id===id))positions.set(id,{column,row,main:false});};
      if(isNode01){assign('n01-amplify',0,0);assign('n01-cognito',0,1);assign('n01-history',0,3);assign('n01-scheduler',2,4);assign('n01-reconcile',2,5);assign('n01-dlq',2,6);}
      else{for(const id of webLeft)if(nodes.some(n=>n.id===id))assign(id,0,left++);for(const id of webRight)if(nodes.some(n=>n.id===id))assign(id,2,right++);}
      for(const n of nodes)if(!positions.has(n.id))positions.set(n.id,{column:centre<left?1:left<=right?0:2,row:centre<left?centre++:left<=right?left++:right++,main:false});
      return positions;
    }
    render(options={}){
      if(!this.data||this.disposed)return new Map();this.last=options;
      const nodes=options.nodes||this.data.nodes,ids=new Set(nodes.map(n=>typeof n==='string'?n:n.id)),selected=options.selected||null;
      const available=this.data.nodes.filter(n=>ids.has(n.id)),edges=(options.edges||this.data.edges||[]).map(e=>typeof e==='string'?this.data.edges.find(x=>x.id===e):e).filter(e=>e&&ids.has(from(e))&&ids.has(to(e)));
      this.renderNodes=available;this.renderEdges=edges;this.positions=this.arrangement(available);
      const signature=available.map(n=>n.id).join('|')+'::'+edges.map(e=>e.id).join('|');
      if(signature!==this.signature){this.signature=signature;this.buttons.clear();this.cards.replaceChildren();this.edgeSvg.replaceChildren();this.links=[];
        this.heading.innerHTML=(this.data.node01?['Access and status','Requirement to handoff','Recovery and review']:this.data.programModel?(this.data.conceptLanes||['Access and context','Request to result','Evidence and recovery']):['Workspace and storage','Idea to baseline','Design and delivery']).map(t=>'<span>'+esc(t)+'</span>').join('');
        const defs=svg('defs');for(const [suffix,fill] of [['grey','#81858c'],['white','#ffffff']]){const marker=svg('marker');marker.id=this.uid+'-'+suffix;marker.setAttribute('viewBox','0 0 8 8');marker.setAttribute('refX','7');marker.setAttribute('refY','4');marker.setAttribute('markerWidth','6');marker.setAttribute('markerHeight','6');marker.setAttribute('orient','auto');const arrow=svg('path');arrow.setAttribute('d','M1 1 7 4 1 7');arrow.setAttribute('fill','none');arrow.setAttribute('stroke',fill);arrow.setAttribute('stroke-width','1.2');marker.append(arrow);defs.append(marker);}this.edgeSvg.append(defs);
        for(const node of available){const copy=this.data.node01?node01Copy[node.id]:null,title=(node.exploreScope?node.short:null)||copy?.[0]||node.short||node.name,description=copy?.[1]||node.conceptSummary||node.summary||node.status||'',glyph=copy?.[2]||(/user/.test(node.id)?'person':/storage|store|archive|github|draft|page/.test(node.id)?'store':/check|engineer/.test(node.id)?'check':/session/.test(node.id)?'shield':'box');
          const b=document.createElement('button');b.type='button';b.className='conceptNode';b.dataset.siteNode=node.id;b.dataset.serial=serial(this.data,node.id);b.setAttribute('aria-label',serial(this.data,node.id)+'. '+title+'. '+description);b.setAttribute('aria-pressed','false');b.title=node.name;
          b.innerHTML='<span class="conceptSerial">'+esc(serial(this.data,node.id))+'</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[glyph]+'</svg><span class="conceptNodeCopy"><strong>'+esc(title)+'</strong><span>'+esc(description)+'</span></span>';
          if(node.id==='n01-node02'||node.boundary)b.classList.add('isBoundary');this.buttons.set(node.id,b);this.cards.append(b);
        }
        for(const edge of edges){const p=svg('path');p.classList.add('conceptEdge');p.dataset.siteEdge=edge.id;p.setAttribute('role','button');p.setAttribute('tabindex','0');p.setAttribute('aria-pressed','false');p.setAttribute('aria-label',(window.SAWStudyIdentity?.edgeSerial(this.data,edge.id)||'Connection')+'. '+(edge.name||edge.label||from(edge)+' to '+to(edge)));const title=svg('title');title.textContent=edge.name||edge.label||'Inspect this connection';p.append(title);this.edgeSvg.append(p);const text=svg('text');text.classList.add('conceptEdgeLabel');text.textContent=edge.name||edge.label||'';this.edgeSvg.append(text);this.links.push({edge,path:p,label:text});}
      }
      const destinations=new Set();for(const link of this.links){const active=selected?.kind==='edge'?link.edge.id===selected.id:selected?.kind==='node'&&from(link.edge)===selected.id;if(active)destinations.add(to(link.edge));link.path.classList.toggle('isRelated',!!active);link.path.setAttribute('aria-pressed',String(selected?.kind==='edge'&&selected.id===link.edge.id));link.path.setAttribute('marker-end','url(#'+this.uid+'-'+(active?'white':'grey')+')');link.label.style.display=active?'':'none';link.related=!!active;}
      for(const [id,b] of this.buttons){b.classList.toggle('isSelected',selected?.kind==='node'&&selected.id===id);b.classList.toggle('isDestination',destinations.has(id));b.setAttribute('aria-pressed',String(selected?.kind==='node'&&selected.id===id));}
      this.element.dataset.nodeCount=String(available.length);this.element.dataset.edgeCount=String(edges.length);if(this.visible)this.layout();return new Map();
    }
    layout(){
      if(this.disposed||!this.data||!this.last||!this.renderNodes?.length||!this.visible)return;
      const width=Math.max(240,this.viewport.clientWidth),narrow=width<570,padding=narrow?28:36,gap=narrow?0:Math.max(40,Math.min(64,width*.07)),cardWidth=narrow?Math.min(290,width-86):(width-padding*2-gap*2)/3,rowHeight=narrow?102:110,cardHeight=70,top=narrow?18:48;
      this.element.classList.toggle('isNarrow',narrow);this.heading.hidden=narrow;
      const rects=new Map(),main=this.data.node01?node01Main:this.data.programModel?this.renderNodes.filter(n=>this.positions.get(n.id)?.main).sort((a,b)=>this.positions.get(a.id).row-this.positions.get(b.id).row).map(n=>n.id):webMain,ordered=narrow?[...main.map(id=>this.renderNodes.find(n=>n.id===id)).filter(Boolean),...this.renderNodes.filter(n=>!main.includes(n.id))]:this.renderNodes;
      let rows=0;for(const [index,node]of ordered.entries()){const pos=narrow?{column:0,row:index}:this.positions.get(node.id),x=narrow?(width-cardWidth)/2:padding+pos.column*(cardWidth+gap),y=top+pos.row*rowHeight,b=this.buttons.get(node.id);b.style.left=x+'px';b.style.top=y+'px';b.style.width=cardWidth+'px';b.style.height=cardHeight+'px';rects.set(node.id,{x,y,w:cardWidth,h:cardHeight,row:pos.row,col:pos.column});rows=Math.max(rows,pos.row+1);}
      const height=top+rows*rowHeight+12;this.sheet.style.height=height+'px';this.edgeSvg.setAttribute('viewBox','0 0 '+width+' '+height);this.edgeSvg.style.height=height+'px';
      const laneUses=new Map(),parallelGroups=new Map();
      for(const link of this.links){const key=[from(link.edge),to(link.edge)].sort().join('|');if(!parallelGroups.has(key))parallelGroups.set(key,[]);parallelGroups.get(key).push(link);}
      this.links.forEach((link,index)=>{const a=rects.get(from(link.edge)),b=rects.get(to(link.edge));if(!a||!b)return;let d,labelX,labelY;const parallel=parallelGroups.get([from(link.edge),to(link.edge)].sort().join('|')),offset=(parallel.indexOf(link)-(parallel.length-1)/2)*10;
        if(a.col===b.col&&Math.abs(a.row-b.row)===1){const down=b.y>a.y,sx=a.x+a.w/2+offset,sy=down?a.y+a.h:a.y,ey=down?b.y:b.y+b.h;d='M'+sx+' '+sy+' V'+ey;labelX=sx+8;labelY=(sy+ey)/2;}
        else if(a.col!==b.col&&a.row===b.row){const right=b.x>a.x,sx=right?a.x+a.w:a.x,ex=right?b.x:b.x+b.w,sy=a.y+a.h/2+offset;d='M'+sx+' '+sy+' H'+ex;labelX=(sx+ex)/2;labelY=sy-9;}
        else{const right=narrow?index%2===0:(b.col>a.col||a.col===b.col&&a.col!==2),sx=right?a.x+a.w:a.x,ex=a.col===b.col?sx:right?b.x:b.x+b.w,sy=a.y+a.h/2+offset,ey=b.y+b.h/2+offset,key=a.col+'-'+right,used=laneUses.get(key)||0;laneUses.set(key,used+1);const laneOffset=12+(used%4)*5,bus=narrow?(right?width-12-laneOffset/3:12+laneOffset/3):(right?a.x+a.w+laneOffset:a.x-laneOffset);
          if(Math.abs(a.col-b.col)>1&&!narrow){const rowY=a.y+a.h+15+(used%3)*5,endBus=right?b.x-12:b.x+b.w+12;d='M'+sx+' '+sy+' H'+bus+' V'+rowY+' H'+endBus+' V'+ey+' H'+ex;labelX=(bus+endBus)/2;labelY=rowY-6;}
          else{d='M'+sx+' '+sy+' H'+bus+' V'+ey+' H'+ex;labelX=bus+(right?7:-7);labelY=(sy+ey)/2;}}
        link.path.setAttribute('d',d);link.label.setAttribute('x',Math.max(40,Math.min(width-40,labelX)));link.label.setAttribute('y',labelY);link.label.setAttribute('text-anchor','middle');
        // Long connection names remain in their accessible title and inspector.
        // The diagram itself uses a short source identity to avoid line overlap.
        link.label.textContent=window.SAWStudyIdentity?.edgeSerial(this.data,link.edge.id)||'';
      });
    }
    dispose(){if(this.disposed)return;this.disposed=true;this.resize?.disconnect();this.edgeSvg.removeEventListener('keydown',this.onKey);this.element.remove();this.buttons.clear();this.links=[];this.last=null;this.renderNodes=[];this.renderEdges=[];this.positions=new Map();this.data=null;}
  }
  window.SAWConceptDesign=ConceptDesign;
})();
