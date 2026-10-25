import fs from 'node:fs';
const path = 'dist/index.html';
let html = fs.readFileSync(path, 'utf8');
if (html.includes('/assets/architecture-study.js?v=51')) throw new Error('Study integration is already applied');
const replace = (before, after) => {
  if (!html.includes(before)) throw new Error('Missing integration anchor: '+before.slice(0,90));
  html = html.replace(before, () => after);
};
replace('</head>', '<link rel="stylesheet" href="/assets/architecture-study.css?v=51"></head>');
replace('<button id="nodesTab"', '<button id="awsStudyTab" data-tab="aws" role="tab" aria-selected="false" aria-controls="study" tabindex="-1">AWS</button><button id="nodesTab"');
replace('<p class="stage-credit">', '<aside id="nodeAwsCard" class="node-aws-card" aria-label="Selected node AWS mapping" hidden></aside><p class="stage-credit">');
replace("</script><script>'use strict';", '</script><script src="/assets/aws-learning.js?v=51"></script><script src="/assets/formal-model.js?v=51"></script><script src="/assets/architecture-study.js?v=51"></script><script>\'use strict\';');
const anchor="const researchContent=";
replace(anchor,"const studyMapping=JSON.parse(document.getElementById('awsArchitectureData').textContent); AC_STUDY.configure(A,studyMapping);\n"+anchor);
replace("const AW=JSON.parse(document.getElementById('awsArchitectureData').textContent),awsTopology=AW.enterprise;", "const AW=studyMapping,awsTopology=AW.enterprise;");
replace("if(page==='aws')return awsSystemPanel();", "if(page==='aws')return AC_STUDY.formalOverview()+awsSystemPanel();");
replace('return `<span class="researchLabel">${esc(s.status)}', 'return AC_STUDY.formalOverview()+`<details class="original-study-context"><summary>Architecture context and optional capabilities</summary><span class="researchLabel">${esc(s.status)}');
replace("${s.validationSteps.map(p=>`<li>${esc(p)}</li>`).join('')}</ol>`;", "${s.validationSteps.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></details>`;");
replace('function interfaceParagraphs(e){return `', 'function interfaceParagraphs(e){return AC_STUDY.edgeMath(e.id)+`');
replace('<h3>Mathematical conditions and validation</h3>', '${AC_STUDY.nodeMath(n.id,selectedEdge)}<h3>Mathematical conditions and validation</h3>');
replace("const e=selectionActive&&selected.kind==='edge'?edgeBy[selected.id]:null;", "const e=selectionActive&&selected.kind==='edge'?edgeBy[selected.id]:null;\n AC_STUDY.syncCard(selectionActive?(e?e.source:selected.id):null);");
replace("$('#study').innerHTML=tab==='system'?systemPanel():!selectionActive?", "$('#study').innerHTML=tab==='aws'?AC_STUDY.awsPanel(selectionActive?nodeBy[e?e.source:selected.id]:null,e):tab==='system'?systemPanel():!selectionActive?");
replace("tab==='system'?'systemTab':'nodesTab'", "tab==='system'?'systemTab':tab==='aws'?'awsStudyTab':'nodesTab'");
replace("function setTab(t){tab=t==='system'?'system':'selection';renderStudy()}", "function setTab(t){tab=['system','aws','selection'].includes(t)?t:'system';renderStudy();$$('[data-tab]').forEach(b=>b.tabIndex=b.dataset.tab===tab?0:-1)}");
replace("ev.key==='End'?1:ev.key==='ArrowRight'?(idx+1)%2:(idx+1)%2", "ev.key==='End'?tabs.length-1:ev.key==='ArrowRight'?(idx+1)%tabs.length:(idx+tabs.length-1)%tabs.length");
replace("updateButtons();tab='selection';renderStudy();styleScene();placeLabels();", "updateButtons();if(tab!=='aws')tab='selection';renderStudy();styleScene();placeLabels();");
replace("label.innerHTML='<span class=\"nodeGlyph\" aria-hidden=\"true\">'+glyphSVG(nodeGlyphs[n.id]?n.id:n.module)", "label.innerHTML='<span class=\"nodeGlyph\" aria-hidden=\"true\">'+AC_STUDY.icon(n.id)");
replace('${conceptFinalGlyph(conceptFinalGlyphs[n.id]?n.id:n.module)}</span><span class="conceptText">', '${AC_STUDY.icon(n.id)}</span><span class="conceptText">');
replace("#awsViewport,#inspector,#rightDock,#linkWalk", "#awsViewport,#inspector,#rightDock,#nodeAwsCard,#linkWalk");
replace("if(b.dataset.node)select('node',b.dataset.node);", "if(b.hasAttribute('data-dismiss-aws'))$('#nodeAwsCard').hidden=true;if(b.hasAttribute('data-open-aws')){setTab('aws');document.body.classList.remove('panelClosed');syncPanel();$('#awsStudyTab').focus()}if(b.dataset.node)select('node',b.dataset.node);");
// Correct the subject binding: a report hash is not the artifact hash.
html=html.replaceAll('evidenceDigest = artifactDigest','report.subjectArtifactDigest = artifactDigest');
fs.writeFileSync(path,html);
for (const file of ['dist/aws/architecture-data.json','dist/aws/Architecture-to-AWS-Mapping.md']) {
  const text=fs.readFileSync(file,'utf8');
  fs.writeFileSync(file,text.replaceAll('evidenceDigest = artifactDigest','report.subjectArtifactDigest = artifactDigest'));
}
console.log('Integrated AWS study tab, per-node service icons and scoped mathematical audit.');
