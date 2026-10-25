/* Study addresses are section.component, not positions in the complete model.
 * Build once from the complete page model. Filtering never changes an address.
 * The canonical group owns a shared component; edges use lettered branches. */
(() => {
  'use strict';
  const cache=new WeakMap();
  const from=edge=>edge.from||edge.source;
  const to=edge=>edge.to||edge.target;
  const letters=index=>{let label='';for(let n=index+1;n>0;n=Math.floor((n-1)/26))label=String.fromCharCode(97+(n-1)%26)+label;return label;};
  function compile(data){
    if(!data||typeof data!=='object')return {nodes:new Map(),edges:new Map(),homes:new Map(),sections:[]};
    if(cache.has(data))return cache.get(data);
    const nodes=data.nodes||[],edges=data.edges||[],definitions=data.groups||[];
    const groups=new Map(definitions.map(group=>[group.id,group]));
    const home=node=>node.studyGroup||node.group||node.module||(node.groups||[]).find(id=>groups.has(id))||'other';
    // Core always owns section 1. Supporting sections follow the toolbar order.
    const missing=[...new Set(nodes.map(home).filter(id=>!groups.has(id)))].sort();
    missing.forEach(id=>groups.set(id,{id,label:id==='other'?'Other components':id}));
    const ids=[...groups.keys()].sort((a,b)=>a===b?0:a==='core'?-1:b==='core'?1:0);
    const addresses=new Map(),homes=new Map(),sections=[];
    const journey=data.presentation?.journey||[];
    const terminal=journey.at(-1);
    ids.forEach((id,sectionIndex)=>{
      const group=groups.get(id),section=String(sectionIndex+1);
      const explicit=group.studyOrder||journey;
      const order=new Map(explicit.map((nodeId,index)=>[nodeId,index]));
      const members=nodes.filter(node=>home(node)===id).slice().sort((a,b)=>{
        if(a.id===b.id)return 0;
        // The declared lifecycle output stays last even when support is added.
        if(a.id===terminal||b.id===terminal)return a.id===terminal?1:-1;
        const ai=order.get(a.id),bi=order.get(b.id);
        if(ai!=null||bi!=null)return (ai??Infinity)-(bi??Infinity);
        return (a.studyOrder??a.order??a.journeyStep??Infinity)-(b.studyOrder??b.order??b.journeyStep??Infinity)||String(a.id).localeCompare(String(b.id));
      });
      members.forEach((node,index)=>{addresses.set(node.id,node.studySerial||section+'.'+(index+1));homes.set(node.id,id);});
      sections.push(Object.freeze({id,label:group.label||id,serial:section,count:members.length,first:members[0]?.id||null,last:members.at(-1)?.id||null}));
    });
    const edgeNumbers=new Map(),journeyEdges=new Map((data.presentation?.journeyEdges||[]).map((id,index)=>[id,index]));
    for(const source of addresses.keys()){
      const outgoing=edges.filter(edge=>from(edge)===source).slice().sort((a,b)=>(journeyEdges.get(a.id)??Infinity)-(journeyEdges.get(b.id)??Infinity)||String(a.id).localeCompare(String(b.id),undefined,{numeric:true}));
      outgoing.forEach((edge,index)=>edgeNumbers.set(edge.id,addresses.get(source)+'.'+letters(index)));
    }
    const result={nodes:addresses,edges:edgeNumbers,homes,sections:Object.freeze(sections)};
    cache.set(data,result);return result;
  }
  const nodeSerial=(data,id)=>compile(data).nodes.get(id)||'';
  const edgeSerial=(data,id)=>compile(data).edges.get(id)||'';
  const sectionSerial=(data,id)=>compile(data).sections.find(section=>section.id===id)?.serial||'';
  const nodeSection=(data,id)=>compile(data).homes.get(id)||'';
  const sections=data=>compile(data).sections;
  const edgeDescription=(data,id)=>{const edge=(data?.edges||[]).find(item=>item.id===id);return edge?edgeSerial(data,id)+': '+nodeSerial(data,from(edge))+' → '+nodeSerial(data,to(edge)):'';
  };
  window.SAWStudyIdentity=Object.freeze({nodeSerial,edgeSerial,sectionSerial,nodeSection,sections,edgeDescription});
})();
