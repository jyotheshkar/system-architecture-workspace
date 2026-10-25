/* An AWS deployment-view renderer over the existing, immutable responsibility
 * model. Boundaries describe a proposed placement, not deployed resources.
 * In particular regional managed services are not VPC subnet residents. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const NS = 'http://www.w3.org/2000/svg';
  const W = 166, H = 112;
  // Identity comes from the complete page model, so changing layers never
  // renumbers a responsibility or one of its outgoing interfaces.
  const nodeSerial=(data,id)=>window.SAWStudyIdentity?.nodeSerial(data,id)??(data.nodes.findIndex(node=>node.id===id)+1);
  const edgeSerial=(data,id)=>{
    const shared=window.SAWStudyIdentity?.edgeSerial(data,id);if(shared!=null)return shared;
    const edge=data.edges.find(item=>item.id===id);if(!edge)return '';
    return nodeSerial(data,edge.from)+'.'+(data.edges.filter(item=>item.from===edge.from).findIndex(item=>item.id===id)+1);
  };
  const groupNames = {memory:'Persistent state and retrieval',learning:'Controlled improvement',tools:'Tool access and effects',recovery:'Work admission and recovery',specialists:'Specialist workers'};
  const externalWebsite = new Set(['web-user','web-canvas','web-transition','web-drafts','web-engineer','web-github']);
  const globalWebsite = new Set(['web-shell']);
  const controlCore = ['user','contract','core','plan','pic','cap','release','workflow'];
  const workers = new Set(['exec','verify','integrate','final','evaluate','construct','assure']);
  const dimensions = points => {
    const values = [...points.values()];
    return {left:Math.min(...values.map(p=>p.x-W/2)),right:Math.max(...values.map(p=>p.x+W/2)),top:Math.min(...values.map(p=>p.y-H/2)),bottom:Math.max(...values.map(p=>p.y+H/2))};
  };
  function layout(data, nodes) {
    const ids = new Set(nodes.map(n=>n.id)), positions = new Map(), boundaries = [], notes = [];
    const place = (id,x,y) => {if(ids.has(id))positions.set(id,{x,y});};
    const addBox = (id,label,x,y,w,h,kind='lane',sub='') => boundaries.push({id,label,x,y,w,h,kind,sub});
    function row(list, x, y, columns=4, spacing=222, step=178) {
      const chosen=list.filter(id=>ids.has(id));
      chosen.forEach((id,i)=>place(id,x+(i%columns)*spacing,y+Math.floor(i/columns)*step));
      return chosen.length ? Math.ceil(chosen.length/columns)*step : 0;
    }
    if(data.node01) {
      // The supplied Node 01 v7.1 design separates customer trust, global
      // delivery and regional managed resources. It has no customer VPC.
      place('n01-browser',100,240);place('n01-amplify',345,240);
      place('n01-cognito',590,240);place('n01-api',835,240);
      place('n01-intake',1080,240);place('n01-store',1325,240);
      place('n01-history',1080,440);place('n01-streams',1325,440);
      place('n01-scheduler',590,640);place('n01-reconcile',835,640);
      place('n01-relay',1325,640);place('n01-queue',1554,640);
      place('n01-node02',1825,640);place('n01-dlq',1554,840);
      addBox('customer-environment','Customer environment',0,132,200,188,'external','Untrusted browser');
      addBox('aws-cloud','AWS Cloud',218,0,1470,988,'cloud','Proposed Node 01 intake architecture');
      addBox('workload-account','Workload AWS account',236,52,1432,916,'account','Ownership, IAM and customer-configured controls');
      addBox('global-frontend','Managed frontend',253,115,187,246,'global','Global CDN delivery');
      addBox('aws-region','Europe (London) / eu-west-2',462,115,1188,832,'region','Regional managed services; no customer VPC or subnets');
      addBox('node02-boundary','Node 02 interface',1721,530,210,208,'unresolved','Downstream implementation not built');
      notes.push('Proposed design from Node 01 v7.1. AWS implementation is unknown; AWS tests have not run.');
      notes.push('Queue acknowledgement is not downstream acceptance. Keep the outbox obligation until a durable Node 02 receipt.');
      notes.push('IAM least privilege, TLS and encryption, CloudWatch, scoped CloudTrail audit, versioned IaC and controlled recovery.');
    } else if(data.programModel) {
      // A responsibility is placed only where its model declares it. Global
      // delivery and external actors never become regional VPC residents.
      const groups={external:[],global:[],regional:[]};
      for(const node of nodes)groups[['external','global','regional'].includes(node.aws?.placement)?node.aws.placement:'regional'].push(node);
      const top=198,spacing=248,rowStep=206,externalWidth=groups.external.length?216:0,globalWidth=groups.global.length?226:0;
      const cloudX=externalWidth?externalWidth+28:8,regionX=cloudX+28+globalWidth;
      const placeGroup=(list,start,columns)=>{
        const used=new Set();let maxCol=0,maxRow=0;
        list.forEach((node,index)=>{
          const position=node.aws?.diagram;
          let column=columns===1?0:Number.isInteger(position?.column)&&position.column>=0?position.column:index%columns;
          let rowIndex=Number.isInteger(position?.row)&&position.row>=0?position.row:Math.floor(index/columns);
          while(used.has(column+':'+rowIndex))rowIndex++;
          used.add(column+':'+rowIndex);place(node.id,start+column*spacing,top+rowIndex*rowStep);maxCol=Math.max(maxCol,column);maxRow=Math.max(maxRow,rowIndex);
        });
        return {width:list.length?(maxCol+1)*spacing-36:0,bottom:top+maxRow*rowStep+H/2+36};
      };
      const external=placeGroup(groups.external,108,1),global=placeGroup(groups.global,cloudX+122,1),regional=placeGroup(groups.regional,regionX+108,Math.min(4,Math.max(1,groups.regional.length)));
      const bottom=Math.max(external.bottom,global.bottom,regional.bottom)+20,regionWidth=Math.max(212,regional.width),cloudWidth=regionX-cloudX+regionWidth+24;
      if(groups.external.length)addBox('external-actors','Outside AWS',0,112,externalWidth,bottom-112,'external','Customers and external systems');
      addBox('aws-cloud','AWS Cloud',cloudX,0,cloudWidth,bottom+16,'cloud',data.awsAccountLabel||'Proposed workload account');
      if(groups.global.length)addBox('global-services','Global services',cloudX+18,76,208,bottom-91,'global','Delivery and account controls');
      if(groups.regional.length)addBox('aws-region',data.awsRegionLabel||'Selected AWS Region',regionX,76,regionWidth,bottom-91,'region','Proposed managed services');
      notes.push('Proposed service mapping. AWS resources and tests are not confirmed as deployed or executed.');
      notes.push('Connections retain the source direction. Current authority, durable evidence and bounded recovery remain required.');
    } else if(data.foundation) {
      // A landscape control plane stays legible in the short workspace stage.
      // Horizontal placement never adds a Builder -> Verifier edge: the actual
      // candidate and evidence paths still return through the Core Controller.
      place('user',90,178);place('contract',340,178);place('core',600,178);place('plan',860,178);place('verify',1120,178);place('workflow',1380,178);
      let bottom=282;
      const support=['pic','foundation-artifacts','foundation-observe'];
      if(support.some(id=>ids.has(id))) {
        row(support,476,bottom+99,3,360);
        addBox('foundation-services','Shared PIC controls, versioned evidence and observability',230,bottom+12,1232,156,'lane');bottom+=190;
      }
      const runtime=['read','deduplicate','validate','route','aggregate','report'];
      if(runtime.some(id=>ids.has(id))) {
        row(runtime,332,bottom+116,6,205,168);addBox('child-runtime','Child workflow: reviewed Lambda operators',230,bottom+14,1232,172,'library','Requires separate operating authority');bottom+=206;
      }
      addBox('aws-cloud','AWS Cloud',198,8,ids.has('foundation-iam')?1501:1280,bottom+17,'cloud','Foundation sandbox account');
      addBox('aws-region','One selected AWS Region',218,48,1249,bottom-38,'region','Managed services');
      if(ids.has('foundation-iam')) {
        place('foundation-iam',1584,178);addBox('account-identity','Account-wide identity',1480,71,202,188,'global','Scoped IAM roles');
      }
      notes.push('Reviewed handlers and managed services. No VPC is required by this foundation.');
    } else if(nodes.some(n=>n.id.startsWith('web-'))&&nodes.every(n=>n.group==='core')) {
      place('web-user',90,138);place('web-canvas',90,314);place('web-requirements',350,220);place('web-checks',598,220);place('web-aws-mapping',846,220);place('web-baseline',1094,220);place('web-engineer',1354,220);
      addBox('browser','User / browser',0,40,183,339,'external');
      addBox('aws-cloud','AWS Cloud',220,8,989,374,'cloud','Proposed product account');
      addBox('aws-region','Selected AWS Region',240,59,949,301,'region','Requirement intake, design checks, mapping and approved output');
      addBox('engineer','Outside AWS',1261,81,188,229,'external','Engineer review');
      notes.push('The browser holds the 3D model. An AWS engineer reviews the proposed baseline before delivery.');
    } else if(nodes.some(n=>n.id.startsWith('web-'))) {
      // Four compact service groups use the width of a desktop workspace.
      // The browser and collaborators remain outside AWS, and CloudFront
      // remains in the global edge area outside the selected Region.
      row(['web-user','web-transition','web-canvas','web-drafts'],96,154,1,0,176);
      addBox('browser','User / browser',4,63,184,690,'external');
      place('web-engineer',1804,346);place('web-github',1804,674);
      addBox('external-collaboration','Outside AWS',1712,230,190,524,'external','Review and version history');
      if(ids.has('web-shell')) {
        place('web-shell',336,170);
        addBox('global-edge','Global edge',234,65,202,170,'global','CloudFront');
      }
      const sections=[
        ['Identity and request entry',472,112,[
          ['web-entry',566,200],['web-session',764,200],['web-requirements',962,200],['web-store-api',962,346]
        ]],
        ['Design generation and review',1066,112,[
          ['web-workflow',1160,200],['web-ai',1358,200],['web-checks',1556,200],['web-aws-mapping',1556,346]
        ]],
        ['Versioned product data',472,440,[
          ['web-page',566,528],['web-sections',764,528],['web-study',962,528],['web-guide',962,674]
        ]],
        ['Delivery and operations',1066,440,[
          ['web-router',1160,528],['web-release',1358,528],['web-baseline',1556,528],['web-secrets',1160,674],['web-archive',1358,674]
        ]]
      ];
      for(const [title,x,y,services] of sections) {
        if(!services.some(([id])=>ids.has(id)))continue;
        for(const [id,px,py] of services)place(id,px,py);
        addBox('lane-'+title,title,x,y,588,302,'lane');
      }
      addBox('aws-cloud','AWS Cloud',214,8,1480,766,'cloud','Proposed product account');
      addBox('aws-region','Selected AWS Region',456,64,1214,698,'region','Managed-service architecture');
      notes.push('Browser rendering and private GitHub remain outside AWS. Baseline output requires engineer review.');
    } else if(nodes.every(n=>n.group==='core')) {
      const control=controlCore.filter(id=>ids.has(id));
      row(control,130,154,8,211,176);
      const workerIds=nodes.filter(n=>workers.has(n.id)||/Fargate/.test(n.aws?.service||n.aws?.short||'')).map(n=>n.id);
      row(workerIds,404,377,4,270,174);
      addBox('aws-cloud','AWS Cloud',2,4,1727,494,'cloud','Proposed engineering account');
      addBox('aws-region','Selected AWS Region',20,51,1691,429,'region','Managed control plane');
      if(workerIds.length){addBox('workload-vpc','Workload VPC',271,244,1083,218,'vpc','Proposed private worker network');addBox('private-workers','Private workload subnets',290,293,1045,150,'subnet');}
      notes.push('Core admits work, independent workers produce evidence, and current authority gates the exact MOA handoff.');
    } else {
      // The control plane is regional. Fargate workers get their own proposed
      // network boundary, never the Bedrock, DynamoDB or orchestration services.
      const global = nodes.filter(n => /(?:AWS IAM|Identity and Access Management)/i.test(n.aws?.service||n.aws?.short||'')).map(n=>n.id);
      const control=controlCore.filter(id=>ids.has(id)&&!global.includes(id));
      let y=188;
      const controlHeight=row(control,136,y,4,236,185);
      addBox('control-plane','Identity, contracts and orchestration',34,y-83,919,controlHeight+5,'lane');y+=controlHeight+51;
      const workerIds=nodes.filter(n=>workers.has(n.id)||/Fargate/.test(n.aws?.service||n.aws?.short||'')).map(n=>n.id);
      if(workerIds.length) {
        const height=row(workerIds,150,y+70,4,228,174);
        addBox('workload-vpc','Workload VPC',34,y-83,919,height+103,'vpc','Proposed private worker network');
        addBox('private-workers','Private workload subnets',54,y-41,879,height+44,'subnet','Separately scoped Fargate tasks');
        y+=height+151;
      }
      const seen=new Set([...control,...workerIds,...global]);
      for(const [id,title] of Object.entries(groupNames)) {
        const list=nodes.filter(n=>n.group===id&&!seen.has(n.id)).map(n=>n.id);if(!list.length)continue;
        list.forEach(n=>seen.add(n));const h=row(list,136,y,4,236,174);
        addBox('support-'+id,title,34,y-83,919,h+5,'lane');y+=h+50;
      }
      const remaining=nodes.filter(n=>!seen.has(n.id)).map(n=>n.id);
      if(remaining.length){const h=row(remaining,136,y,4,236,174);addBox('support-other','Shared managed services',34,y-83,919,h+5,'lane');y+=h+50;}
      const regionBottom=y-39;
      addBox('aws-cloud','AWS Cloud',2,4,global.length?1220:985,regionBottom+31,'cloud','Proposed engineering account');
      addBox('aws-region','Selected AWS Region',18,42,953,regionBottom-49,'region','Managed services are outside workload subnets');
      if(global.length) {const h=row(global,1095,154,1,0,180);addBox('account-access','Account-wide access',990,58,211,h+4,'global');}
      notes.push('Private tasks need explicitly designed service endpoints or egress. Arrows show application interfaces, not network routes.');
    }
    // Imported/custom pages retain every visible component. Unknown IDs get a
    // labelled extension area rather than being silently dropped.
    const missed=nodes.filter(n=>!positions.has(n.id));
    if(missed.length) {const bottom=positions.size?dimensions(positions).bottom:100;row(missed.map(n=>n.id),150,bottom+160,4,220,172);addBox('extensions','Page extensions',42,bottom+72,884,Math.ceil(missed.length/4)*172+8,'lane');}
    const size=dimensions(positions),right=Math.max(size.right,...boundaries.map(b=>b.x+b.w)),bottom=Math.max(size.bottom,...boundaries.map(b=>b.y+b.h));
    boundaries.sort((a,b)=>({cloud:0,region:1,global:2,vpc:3,subnet:4}[a.kind]??5)-({cloud:0,region:1,global:2,vpc:3,subnet:4}[b.kind]??5));
    return {positions,boundaries,notes,width:right+20,height:bottom+(data.node01||data.programModel?130:43)};
  }
  // The router constructs an orthogonal visibility grid once per layer. A
  // weighted shortest path avoids unrelated service symbols and distributes
  // repeated interfaces over separate lanes where space permits.
  function router(positions, boundaries) {
    const rects=[...positions].map(([id,p])=>({id,left:p.x-W/2-8,right:p.x+W/2+8,top:p.y-H/2-8,bottom:p.y+H/2+8}));
    const epsilon=.01;
    const inside=p=>rects.some(r=>p.x>r.left+epsilon&&p.x<r.right-epsilon&&p.y>r.top+epsilon&&p.y<r.bottom-epsilon);
    const crosses=(a,b)=>rects.some(r=>a.x===b.x?a.x>r.left+epsilon&&a.x<r.right-epsilon&&Math.max(a.y,b.y)>r.top+epsilon&&Math.min(a.y,b.y)<r.bottom-epsilon:a.y>r.top+epsilon&&a.y<r.bottom-epsilon&&Math.max(a.x,b.x)>r.left+epsilon&&Math.min(a.x,b.x)<r.right-epsilon);
    const xs=[...new Set(rects.flatMap(r=>[r.left,r.right,(r.left+r.right)/2]).concat([0,Math.max(...rects.map(r=>r.right))+20]))].sort((a,b)=>a-b);
    const ys=[...new Set(rects.flatMap(r=>[r.top,r.bottom,(r.top+r.bottom)/2]).concat([0,Math.max(...rects.map(r=>r.bottom))+20]))].sort((a,b)=>a-b);
    const vertices=[],lookup=new Map(),links=[];
    for(let yi=0;yi<ys.length;yi++)for(let xi=0;xi<xs.length;xi++){const p={x:xs[xi],y:ys[yi]};if(inside(p))continue;lookup.set(xi+','+yi,vertices.length);vertices.push(p);links.push([]);}
    for(let yi=0;yi<ys.length;yi++)for(let xi=0;xi<xs.length;xi++){
      const at=lookup.get(xi+','+yi);if(at===undefined)continue;
      for(const [dx,dy,axis] of [[1,0,0],[0,1,1]]){
        const next=lookup.get((xi+dx)+','+(yi+dy));if(next===undefined||crosses(vertices[at],vertices[next]))continue;
        const distance=Math.abs(vertices[at].x-vertices[next].x)+Math.abs(vertices[at].y-vertices[next].y),key=at<next?at+':'+next:next+':'+at;
        links[at].push({next,distance,axis,key});links[next].push({next:at,distance,axis,key});
      }
    }
    const used=new Map(), index=p=>lookup.get(xs.indexOf(p.x)+','+ys.indexOf(p.y));
    const ports=id=>{const r=rects.find(item=>item.id===id),p=positions.get(id);return[
      {p:{x:p.x-W/2,y:p.y},q:{x:r.left,y:p.y},axis:0},
      {p:{x:p.x+W/2,y:p.y},q:{x:r.right,y:p.y},axis:0},
      {p:{x:p.x,y:p.y-H/2},q:{x:p.x,y:r.top},axis:1},
      {p:{x:p.x,y:p.y+H/2},q:{x:p.x,y:r.bottom},axis:1}
    ];};
    function compact(path) {return path.filter((p,i)=>!i||p.x!==path[i-1].x||p.y!==path[i-1].y).filter((p,i,a)=>!i||i===a.length-1||!((p.x===a[i-1].x&&p.x===a[i+1].x)||(p.y===a[i-1].y&&p.y===a[i+1].y)));}
    return (from,to)=>{
      const starts=ports(from),ends=ports(to),targets=new Map(ends.map((p,i)=>[index(p.q),i]));
      const cost=new Map(),previous=new Map(),source=new Map(),heap=[];
      const push=(state,priority)=>{let i=heap.length;heap.push({state,priority});while(i){const p=(i-1)>>1;if(heap[p].priority<=priority)break;heap[i]=heap[p];i=p;heap[i]={state,priority};}};
      const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;heap[0]=last;while(true){let c=i*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1].priority<heap[c].priority)c++;if(heap[c].priority>=last.priority)break;heap[i]=heap[c];i=c;heap[i]=last;}}return first;};
      starts.forEach((p,i)=>{const at=index(p.q);if(at===undefined)return;const state=at*2+p.axis;cost.set(state,0);source.set(state,i);push(state,0);});
      let final=null;
      while(heap.length){
        const item=pop(),state=item.state;if(item.priority!==cost.get(state))continue;
        const at=Math.floor(state/2),axis=state%2;if(targets.has(at)){final=state;break;}
        for(const link of links[at]){const next=link.next*2+link.axis,score=item.priority+link.distance+(axis!==link.axis?20:0)+(used.get(link.key)||0)*16;
          if(score>=(cost.get(next)??Infinity))continue;cost.set(next,score);previous.set(next,{state,key:link.key});source.set(next,source.get(state));push(next,score);
        }
      }
      if(final===null)return [];
      const end=ends[targets.get(Math.floor(final/2))],start=starts[source.get(final)],path=[end.p];
      for(let state=final;;){path.unshift(vertices[Math.floor(state/2)]);const prev=previous.get(state);if(!prev)break;used.set(prev.key,(used.get(prev.key)||0)+1);state=prev.state;}
      path.unshift(start.p);return compact(path);
    };
  }
  function edgeLabel(path, occupied, wide) {
    const candidates=[];
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],length=Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
      const fractions=[.5,.3,.7];for(let distance=15;distance<length-12;distance+=24)fractions.push(distance/length);
      for(const fraction of fractions){const anchor={x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction};
        for(const offset of [0,24,-24,48,-48,72,-72])candidates.push({x:anchor.x+(a.x===b.x?offset:0),y:anchor.y+(a.y===b.y?offset:0),anchor,offset,length,score:Math.abs(offset)*10+Math.abs(fraction-.5)*30-length*.01});
      }
    }
    const clear=(p,w,h)=>p.x>w/2&&p.y>h/2&&!occupied.some(r=>Math.abs(p.x-r.x)<w/2+r.w/2+4&&Math.abs(p.y-r.y)<h/2+r.h/2+4);
    candidates.sort((a,b)=>a.score-b.score);
    // Long inline captions are a convenience, never a reason to cover a service
    // or another interface. Dense/parallel connections use compact markers.
    let point=wide?candidates.find(c=>c.offset===0&&clear(c,130,32)):null;
    const labelled=!!point;
    if(!point)point=candidates.find(c=>clear(c,45,25));
    if(!point){
      const anchor=candidates[0]?.anchor||path[0]||{x:30,y:30};
      for(let radius=96;radius<=600&&!point;radius+=24)for(let dx=-radius;dx<=radius&&!point;dx+=24)for(const dy of [-radius,radius]){
        const candidate={x:anchor.x+dx,y:anchor.y+dy,anchor,offset:radius};if(clear(candidate,45,25)){point=candidate;break;}
      }
    }
    point=point||{x:20,y:20,anchor:{x:20,y:20},offset:0};
    occupied.push({...point,w:labelled?130:45,h:labelled?32:25});return {...point,labelled};
  }
  function parallelRoute(edge, positions, ordinal, count) {
    if(count<2)return null;
    const a=positions.get(edge.from),b=positions.get(edge.to),offset=(ordinal-(count-1)/2)*Math.min(30,92/(count-1));
    let path;
    if(a.y===b.y){const direction=Math.sign(b.x-a.x);path=[{x:a.x+direction*W/2,y:a.y+offset},{x:b.x-direction*W/2,y:b.y+offset}];}
    else if(a.x===b.x){const direction=Math.sign(b.y-a.y);path=[{x:a.x+offset,y:a.y+direction*H/2},{x:b.x+offset,y:b.y-direction*H/2}];}
    else return null;
    const [s,t]=path;
    for(const [id,p] of positions){if(id===edge.from||id===edge.to)continue;
      if(s.y===t.y?s.y>p.y-H/2-8&&s.y<p.y+H/2+8&&Math.max(s.x,t.x)>p.x-W/2-8&&Math.min(s.x,t.x)<p.x+W/2+8:s.x>p.x-W/2-8&&s.x<p.x+W/2+8&&Math.max(s.y,t.y)>p.y-H/2-8&&Math.min(s.y,t.y)<p.y+H/2+8)return null;
    }
    return path;
  }
  const shortLabel=e=>String(e.label||e.name||e.id).replace(/^I\d+\s*[·:]\s*/,'').replace(/^Newly admitted /,'').replace('Requirement and exact approval','Requirement + approval').replace('Current owner acceptance','Owner acceptance').replace('Request supported proposal','Request proposal').replace('Proposal W for admission','Admit proposal').replace('Approved contract C','Approved contract').replace('Guarded exact handoff','Authorised handoff');
  const node01Roles = {
    'n01-browser':['Customer browser','Write a requirement'],
    'n01-amplify':['Amplify Hosting','Static assets / CDN'],
    'n01-cognito':['Amazon Cognito','Sign-in / access token'],
    'n01-api':['API Gateway','HTTP API / JWT checks'],
    'n01-intake':['Intake Lambda','Authorise / atomic commit'],
    'n01-history':['History Lambda','Authorised status / history'],
    'n01-store':['Amazon DynamoDB','Message / receipt / outbox'],
    'n01-streams':['DynamoDB Streams','Committed outbox changes'],
    'n01-relay':['Relay Lambda','Lease / stable event ID'],
    'n01-scheduler':['EventBridge Scheduler','Every five minutes'],
    'n01-reconcile':['Recovery Lambda','Due query / bounded retries'],
    'n01-queue':['Amazon SQS','Standard / at-least-once'],
    'n01-node02':['Node 02 interface','Durable receipt required'],
    'n01-dlq':['Amazon SQS DLQ','Operator review / replay']
  };
  function serviceMarkup(node, isWebsite, isNode01=false) {
    if(isNode01&&node01Roles[node.id]) {
      const [service,role]=node.exploreScope?[node.short||node.name,'Durable receipt boundary']:node01Roles[node.id];
      return `<span class="awsDesignSymbols"><img src="${esc(node.aws?.icon||node.icon)}" alt="" draggable="false"/></span><span class="awsDesignService">${esc(service)}</span><span class="awsDesignRole">${esc(role)}</span>`;
    }
    let services=node.aws?.services?.length?node.aws.services:[{name:node.aws?.service||node.name,short:node.aws?.short||node.short,icon:node.aws?.icon||node.icon}];
    if(isWebsite&&externalWebsite.has(node.id))services=[{name:node.id==='web-github'?'Private GitHub':node.id==='web-engineer'?'Engineer review':node.id==='web-user'?'Product owner':'Browser',short:node.id==='web-github'?'Private GitHub':node.id==='web-engineer'?'Engineer review':node.id==='web-user'?'Product owner':'Browser',icon:node.icon}];
    const icons=services.slice(0,3).map(s=>`<img src="${esc(s.icon||node.icon)}" alt="" draggable="false"/>`).join('');
    const label=services.length>2?(node.aws?.short||services.map(s=>s.short||s.name).join(' + ')):services.length>1?services.map(s=>s.short||s.name).join(' + '):services[0]?.short||services[0]?.name||node.name;
    return `<span class="awsDesignSymbols">${icons}</span><span class="awsDesignService">${esc(label)}</span><span class="awsDesignRole">${esc(node.short||node.name)}</span>`;
  }
  let serial=0;
  class AWSSystemDiagram {
    constructor(host) {
      this.host=host;this.data=null;this.key='';this.last=null;this.visible=false;this.id='aws-design-'+(++serial);
      this.root=document.createElement('div');this.root.className='awsSystemDiagram';this.root.hidden=true;this.root.setAttribute('aria-label','Proposed AWS system design');
      this.root.innerHTML=`<div class="awsDesignCanvas"><svg class="awsDesignWires" aria-hidden="true"><defs><marker id="${this.id}-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L7 4L1 7"/></marker><marker id="${this.id}-arrow-selected" class="selectedArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L7 4L1 7"/></marker></defs><g class="awsDesignBoundaries"></g><g class="awsDesignConnections"></g><g class="awsDesignNotes"></g></svg><div class="awsDesignServices"></div><div class="awsDesignInterfaces"></div></div>`;
      host.append(this.root);this.canvas=this.root.querySelector('.awsDesignCanvas');
      this.scrollSpace=document.createElement('div');this.scrollSpace.className='awsDesignScrollSpace';this.scrollSpace.setAttribute('aria-hidden','true');this.root.append(this.scrollSpace);
      this.root.addEventListener('wheel',event=>{if(this.data?.node01||this.data?.programModel)event.stopPropagation();},{passive:true});
      this.root.addEventListener('pointerdown',event=>{if(this.data?.node01||this.data?.programModel)event.stopPropagation();});
      this.root.addEventListener('keydown',event=>{if((this.data?.node01||this.data?.programModel)&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(event.key))event.stopPropagation();});
    }
    setData(data){this.data=data;this.key='';this.last=null;this.root.classList.toggle('node01Diagram',!!(data?.node01||data?.programModel));this.root.classList.toggle('programDiagram',!!data?.programModel);this.root.tabIndex=data?.node01||data?.programModel?0:-1;this.root.scrollTop=0;this.root.scrollLeft=0;this.root.setAttribute('aria-label',`${data?.title||'Page'} proposed AWS system design`);}
    setVisible(value){this.visible=!!value;this.root.hidden=!value;}
    dispose(){this.root.remove();this.data=null;this.last=null;}
    build(nodes,edges){
      const data=this.data,model=layout(data,nodes),route=router(model.positions,model.boundaries),journey=new Set(data.presentation?.journeyEdges||[]);
      const primary=[...edges].sort((a,b)=>Number(journey.has(b.id))-Number(journey.has(a.id))),occupied=nodes.map(n=>({...model.positions.get(n.id),w:W,h:H}));
      for(const b of model.boundaries){const textWidth=Math.min(b.w-26,Math.max(b.label.length*7,(b.sub||'').length*5.6));occupied.push({x:b.x+13+textWidth/2,y:b.y+(b.sub?24:19),w:textWidth,h:b.sub?39:21});}
      const pairKey=edge=>[edge.from,edge.to].sort().join('|'),pairCounts=new Map(),pairSeen=new Map();
      for(const edge of primary){const key=pairKey(edge);pairCounts.set(key,(pairCounts.get(key)||0)+1);}
      const wide=!!data.node01||edges.length<=11;
      const routes=primary.map(edge=>{const key=pairKey(edge),count=pairCounts.get(key),ordinal=pairSeen.get(key)||0;pairSeen.set(key,ordinal+1);const path=parallelRoute(edge,model.positions,ordinal,count)||route(edge.from,edge.to);return{edge,path,position:edgeLabel(path,occupied,wide&&count===1),number:edgeSerial(data,edge.id),major:journey.has(edge.id)};});
      const boundaries=this.root.querySelector('.awsDesignBoundaries');boundaries.innerHTML=model.boundaries.map(b=>`<g class="awsDesignBoundary ${esc(b.kind)}" data-aws-boundary="${esc(b.id)}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/><text x="${b.x+13}" y="${b.y+21}">${esc(b.label)}</text>${b.sub?`<text class="awsBoundarySub" x="${b.x+13}" y="${b.y+37}">${esc(b.sub)}</text>`:''}</g>`).join('');
      this.root.querySelector('.awsDesignConnections').innerHTML=routes.map(({edge,path,position,major})=>`<path data-aws-wire="${esc(edge.id)}" class="awsDesignWire${major?' major':''}" d="${path.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' ')}" marker-end="url(#${this.id}-arrow)"/>${position.offset?`<path class="awsDesignBadgeLeader" d="M${position.anchor.x},${position.anchor.y}L${position.x},${position.y}"/>`:''}`).join('');
      this.root.querySelector('.awsDesignNotes').innerHTML=data.node01||data.programModel?model.notes.map((note,index)=>`<text class="awsNode01Note" x="${data.node01?236:28}" y="${model.height-93+index*24}">${esc(note)}</text>`).join(''):'';
      const isWebsite=nodes.some(n=>n.id.startsWith('web-'));
      this.root.querySelector('.awsDesignServices').innerHTML=nodes.map(node=>{const p=model.positions.get(node.id),number=nodeSerial(data,node.id),placement=data.programModel&&!data.node01?(node.aws?.placement||'regional'):data.node01?(node.id==='n01-browser'?'external':node.id==='n01-amplify'?'global-delivery':node.id==='n01-node02'?'interface-boundary':'regional-managed-service'):(isWebsite&&externalWebsite.has(node.id))||(data.foundation&&node.id==='user')?'external':node.id==='foundation-iam'||/(?:AWS IAM|Identity and Access Management)/i.test(node.aws?.service||'')?'account-global':workers.has(node.id)&&!data.foundation?'private-workload':'managed-service';return`<button type="button" class="awsDesignNode" data-site-node="${esc(node.id)}" data-aws-placement="${placement}" data-study-serial="${esc(number)}" style="left:${p.x}px;top:${p.y}px" aria-label="${esc(number)}. ${esc(node.name)}: ${esc(node.aws?.service||'Architecture responsibility')}" aria-pressed="false" title="${esc(number)}. ${esc(node.name)}. ${esc(node.aws?.why||node.summary)}"><span class="awsDesignNodeNumber" aria-hidden="true">${esc(number)}</span>${serviceMarkup(node,isWebsite,!!data.node01)}</button>`;}).join('');
      this.root.querySelector('.awsDesignInterfaces').innerHTML=routes.map(({edge,position,number})=>`<button type="button" data-site-edge="${esc(edge.id)}" data-study-serial="${esc(number)}" class="awsDesignInterface${position.labelled?' labelled':''}" style="left:${position.x}px;top:${position.y}px" aria-label="${esc(number)}. ${esc(edge.from)} to ${esc(edge.to)}: ${esc(edge.label||edge.name)}" aria-pressed="false" title="${esc(number)}. ${esc(edge.label||edge.name)}"><span class="awsInterfaceNumber">${esc(number)}</span><span class="awsInterfaceLabel">${esc(shortLabel(edge))}</span></button>`).join('');
      const svg=this.root.querySelector('svg');svg.setAttribute('width',model.width);svg.setAttribute('height',model.height);svg.setAttribute('viewBox',`0 0 ${model.width} ${model.height}`);
      this.canvas.style.width=model.width+'px';this.canvas.style.height=model.height+'px';
      this.root.dataset.nodeCount=nodes.length;this.root.dataset.edgeCount=edges.length;this.last={...model,routes};
    }
    render({nodes=[],edges=[],selected=null,width=1,height=1,labels=true,zoom=1,panX=0,panY=0}={}) {
      if(!this.data||!nodes.length)return;
      const validIds=new Set(nodes.map(n=>n.id));edges=edges.filter(e=>validIds.has(e.from)&&validIds.has(e.to));
      const key=nodes.map(n=>n.id).join(',')+'|'+edges.map(e=>e.id).join(',');
      if(this.key!==key){this.key=key;this.build(nodes,edges);}
      const fullWebsite=nodes.some(n=>n.id.startsWith('web-'))&&nodes.some(n=>n.group!=='core');
      const model=this.last,gutter=width<600?54:68,top=fullWebsite?60:76,bottom=fullWebsite?36:49;
      const fit=Math.min(1,(Math.max(width-gutter*2,140))/model.width,Math.max(height-top-bottom,130)/model.height);
      // Node 01 is deliberately readable and scrollable. Shrinking a detailed
      // deployment drawing to the height of a laptop hides its actual controls.
      const nativeScroll=!!(this.data.node01||this.data.programModel);const scale=nativeScroll?Math.min(1,Math.max(.78,(width-gutter*2)/model.width)):Math.max(.14,fit)*zoom;
      const x=nativeScroll?8:(width-model.width*scale)/2+panX,y=nativeScroll?8:top+(height-top-bottom-model.height*scale)/2+panY;
      this.canvas.style.width=nativeScroll?'0':model.width+'px';
      this.canvas.style.height=nativeScroll?'0':model.height+'px';
      this.scrollSpace.style.width=nativeScroll?(model.width*scale+20)+'px':'0';
      this.scrollSpace.style.height=nativeScroll?(model.height*scale+20)+'px':'0';
      this.canvas.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
      this.root.style.setProperty('--aws-diagram-scale',scale);this.root.classList.toggle('hideInterfaceLabels',!labels);
      const outgoing=selected?.kind==='node'?edges.filter(edge=>edge.from===selected.id):selected?.kind==='edge'?edges.filter(edge=>edge.id===selected.id):[];
      const adjacent=new Set(outgoing.map(edge=>edge.id)),destinations=new Set(outgoing.map(edge=>edge.to));
      for(const node of this.root.querySelectorAll('.awsDesignNode')){const picked=selected?.kind==='node'&&selected.id===node.dataset.siteNode;node.setAttribute('aria-pressed',String(picked));node.classList.toggle('selected',picked);node.classList.toggle('destination',destinations.has(node.dataset.siteNode));}
      for(const button of this.root.querySelectorAll('.awsDesignInterface')){const picked=selected?.kind==='edge'&&selected.id===button.dataset.siteEdge;button.setAttribute('aria-pressed',String(picked));button.classList.toggle('selected',picked);button.classList.toggle('related',adjacent.has(button.dataset.siteEdge));}
      for(const wire of this.root.querySelectorAll('.awsDesignWire')){const picked=adjacent.has(wire.dataset.awsWire);wire.classList.toggle('selected',picked);wire.setAttribute('marker-end',`url(#${this.id}-arrow${picked?'-selected':''})`);}
      return {scale,width:model.width,height:model.height,nodeCount:nodes.length,edgeCount:edges.length};
    }
  }
  // Export the pure geometry for regression checks without a browser or WebGL.
  AWSSystemDiagram.layout=layout;AWSSystemDiagram.router=router;AWSSystemDiagram.edgeLabel=edgeLabel;AWSSystemDiagram.parallelRoute=parallelRoute;AWSSystemDiagram.nodeSize={width:W,height:H};
  window.SAWSysDiagram=AWSSystemDiagram;
})();
