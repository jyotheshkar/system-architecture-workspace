/* Shared presentation contract for authored architecture study models.
 * A design decision or validation plan never implies an executed result. */
(() => {
  'use strict';
  const list = value => Array.isArray(value) ? value : value == null ? [] : [value];
  function make(config) {
    const prefix=String(config.scopeSerial||'');
    const nodes=(config.nodes||[]).map((node,index)=>{
      const concept=node.concept||{column:1,row:index,main:true};
      return {
        group:'core',module:'core',layer:0,order:index,
        status:'Proposed design, implementation and validation required',
        inputs:[],outputs:[],...node,
        short:node.short||node.name,summary:node.summary||'',
        details:node.details||node.summary||'',responsibility:node.details||node.summary||'',
        studySerial:node.studySerial||(prefix?prefix+'.'+(index+1):String(index+1)),
        pos:node.pos||[(concept.column-1)*28,-concept.row*12,index%3===0?5:index%3===1?-5:0],concept,
        aws:node.aws?{status:'Proposed AWS mapping',...node.aws,placement:node.aws.placement||node.placement||'regional'}:null
      };
    });
    const edges=(config.edges||[]).map((edge,index)=>({
      id:edge.id||config.id+'-e'+(index+1),status:'Proposed interface',...edge,
      from:edge.from||edge.source,to:edge.to||edge.target,source:edge.from||edge.source,target:edge.to||edge.target,
      name:edge.name||edge.label,label:edge.label||edge.name,
      details:edge.details||edge.description||edge.label||edge.name
    }));
    return {
      id:config.id,version:'architecture-program-v79',title:config.title,
      programModel:true,programId:config.programId,scopeId:config.scopeId||'overview',scopeSerial:prefix,
      groups:[{id:'core',label:config.title,studyOrder:nodes.map(n=>n.id)}],nodes,edges,
      analysis:config.analysis||{},sourceNote:config.sourceNote||'',
      input:config.input||'Requirements',output:config.output||'Reviewed design',
      overview:{title:config.title,summary:config.summary||'',
        workflow:config.workflow||nodes.filter(n=>n.concept.main).map(n=>({title:n.name,detail:n.summary})),
        current:config.sourceNote||'Authored study design. AWS runtime tests have not run.',
        aws:config.summary||'',operational:[],failures:list(config.failures),
        approach:'Explain the responsibility, evaluate the alternatives, examine failures and define the evidence.'},
      presentation:{kicker:prefix?'DETAILED ARCHITECTURE · '+prefix:'COMPLETE ARCHITECTURE',
        journey:nodes.map(n=>n.id),journeyEdges:edges.map(e=>e.id),
        disclosure:config.sourceNote||'Proposed baseline; no AWS deployment or execution is inferred.',output:config.output||'Reviewed design'},
      ...(config.diagram?{diagram:config.diagram}:{})
    };
  }
  const forPage=page=>page?.id==='system-architecture-workspace-1-0'||page?.coreVersion==='system-architecture-workspace-v1'?window.SAWWebsiteProgram:window.SAWAgenticProgram;
  // Explicit deep links select an existing authored page without changing its schema.
  const route = search => {
    const query=new URLSearchParams(search),projectId=query.get('project');
    if(!['agentic-core','system-architecture-workspace-1-0'].includes(projectId))return null;
    const requestedView=query.get('view');
    return {projectId,view:['brain','concept','ada','aws'].includes(requestedView)?requestedView:'aws',scope:'overview'};
  };
  window.SAWProgramModel=Object.freeze({make,forPage,route});
})();
