/* Learning views share the same graph and selected node as the workspace. */
(() => {
  'use strict';
  let graph, aws, byId;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const para = (title, text) => text ? `<h3>${esc(title)}</h3><p>${esc(text)}</p>` : '';
  const items = values => `<ul>${values.map(value => `<li>${esc(value)}</li>`).join('')}</ul>`;
  const link = (id, label) => `<button class="inlineLink" data-node="${esc(id)}">${esc(label || byId[id].name)}</button>`;
  const sourceLinks = sources => `<ul class="aws-source-list">${sources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a></li>`).join('')}</ul>`;
  const icon = (id, className = 'aws-service-icon') => {
    const entry = window.AWS_LEARNING[id];
    return entry ? `<img class="${className}" src="/aws/icons/${esc(entry.icon)}" alt="${esc(entry.primaryService)} icon" width="32" height="32" decoding="async">` : '';
  };
  function configure(model, mapping) { graph = model; aws = mapping; byId = Object.fromEntries(model.nodes.map(n => [n.id, n])); }
  function directory() {
    return `<div class="aws-node-directory">${['core', ...Object.keys(graph.modules)].map(module => `<details${module === 'core' ? ' open' : ''}><summary>${esc(module === 'core' ? 'Core lifecycle' : graph.modules[module].name)}</summary>${graph.nodes.filter(n => n.module === module).map(n => `<button class="aws-directory-node" data-node="${n.id}">${icon(n.id)}<span>${esc(n.name)}<small>${esc(window.AWS_LEARNING[n.id].primaryService)}</small></span></button>`).join('')}</details>`).join('')}</div>`;
  }
  function awsPanel(node, edge) {
    if (!node) return `<span class="researchLabel">AWS study guide · Proposed implementation</span><h2>From your idea to AWS</h2><p class="intro">Your graph describes the responsibilities Agentic Core needs. An AWS service supplies infrastructure for a responsibility; custom code must still enforce its contract, permissions and acceptance rules.</p><p>Choose a node below or on the model. Study why the service fits, what you need to build yourself, and which evidence makes the connection valid.</p><p class="study-note">All 35 nodes have a mapping. Selecting an optional node enables its layer. These are design recommendations, not deployed AWS resources.</p>${directory()}`;
    const m = aws.mapping.find(entry => entry.id === node.id), learning = window.AWS_LEARNING[node.id];
    const ins = graph.edges.filter(e => e.target === node.id), outs = graph.edges.filter(e => e.source === node.id);
    const selected = edge ? aws.interfaces.find(e => e.id === edge.id) : null;
    return `<span class="researchLabel">AWS · ${esc(node.module === 'core' ? 'Core responsibility' : graph.modules[node.module].name)}</span><div class="aws-study-title">${icon(node.id)}<div><h2>${esc(node.name)}</h2><p>${esc(learning.primaryService)}</p></div></div><p class="intro">${esc(learning.explanation)}</p>${para('Why this belongs in your architecture', m.why)}${para('What you would build', m.what)}${para('Supporting AWS services', m.services.join(' · '))}<h3>What to understand first</h3>${items(learning.whatToLearn)}${para('The mistake to avoid', learning.pitfall)}${para('State, identity and permissions', m.statefulness + ' ' + m.identity + ' ' + m.security)}${para('Failure and recovery', m.failure)}${para('Scaling decision', m.scaling)}${para('Alternative and trade-off', m.alternative + ' ' + m.tradeoff)}${para('Evidence to collect', m.evidence)}${nodeMath(node.id, edge)}${selected ? `<h3>${esc(selected.id)} · AWS connection</h3><p>${esc(selected.implementationProtocol)}</p><p>${esc(selected.awsBoundary)}</p>` : ''}<h3>Connected responsibilities</h3><p><b>Receives from:</b> ${ins.length ? [...new Set(ins.map(e => e.source))].map(id => link(id)).join(' · ') : 'External starting point'}.</p><p><b>Sends to:</b> ${outs.length ? [...new Set(outs.map(e => e.target))].map(id => link(id)).join(' · ') : 'Delivery boundary'}.</p><details class="study-check"><summary>Check your understanding</summary><p>${esc(learning.checkQuestion)}</p><details><summary>Show the reasoning</summary><p>${esc(learning.checkAnswer)}</p></details></details><h3>Read the AWS documentation</h3>${sourceLinks(learning.sources)}<details><summary>Browse all 35 nodes</summary>${directory()}</details>`;
  }
  function edgeMath(id) {
    const c = window.AC_FORMAL.edgeContracts[id];
    if (!c) return '';
    return `<details class="formal-contract"><summary>${esc(id)} · Logical connection contract</summary><pre class="researchMath">${esc(c.formula)}</pre><p>${esc(c.explanation)}</p>${para('Gate before this connection', c.guard)}${para('State after this connection', c.postcondition)}${para('Evidence required', c.evidence)}${c.prerequisites?.length ? `<p><b>Dependencies:</b> ${c.prerequisites.map(eid => `<button class="inlineLink" data-edge="${esc(eid)}">${esc(eid)}</button>`).join(' · ')}</p>` : ''}</details>`;
  }
  function nodeMath(id, edge) {
    const n = window.AC_FORMAL.nodeStudies[id];
    if (!n) return '';
    return `<section class="node-formal-study"><h3>Why the connections are logical</h3>${n.formula ? `<pre class="researchMath">${esc(n.formula)}</pre>` : ''}<p>${esc(n.responsibility || '')}</p>${para('Authority boundary',n.authority)}${edge ? edgeMath(edge.id) : ''}<details><summary>Inspect every connected interface</summary>${graph.edges.filter(e => e.source === id || e.target === id).map(e => edgeMath(e.id)).join('')}</details></section>`;
  }
  function formalOverview() {
    const f = window.AC_FORMAL;
    return `<section class="formal-overview"><span class="researchLabel">Logic of the complete lifecycle</span><h2>From a request to a governed MOA workflow</h2><p class="intro">A connection is logical when its receiver can establish the required preconditions, apply a permitted change and preserve the system's invariants. The arrows alone do not establish that.</p><p class="study-note">Scoped formal model · 35 responsibilities · 68 typed interfaces. The checked model explains the gates and feedback paths. Production code, IAM configuration and test evidence still have to enforce them.</p><h3>The composition rule</h3><pre class="researchMath">Inv(S₀) ∧ ∀e: {Inv ∧ Preₑ ∧ Guardₑ} Tₑ {Inv ∧ Postₑ}\n⇒ Inv holds along every admitted finite trace.</pre><p>S is trusted state, e is a typed interface, and T is its receiving transition. Release intent is admitted only when approval, the plan, acceptance, final attestation and release authority are current. Delivery then requires the exact destination receipt.</p><details><summary>Symbols and shared invariants</summary>${f.symbols.map(s => `<p><b>${esc(s.symbol || s.name)}</b>: ${esc(s.meaning || s.description)}</p>`).join('')}${f.invariants.map(inv => `<h4>${esc(inv.name || inv.title || inv.id)}</h4><pre class="researchMath">${esc(inv.formula)}</pre><p>${esc(inv.explanation || inv.text)}</p>`).join('')}</details>${guardDemo()}<h3>Follow the actual gated lifecycle</h3><p>Some stages branch or return through Core. Read these as satisfied obligations, not one straight chain of node names.</p><ol class="formal-stage-list">${f.stages.map(stage => `<li><strong>${esc(stage.title || stage.name)}</strong><p>${esc(stage.explanation || stage.description)}</p>${stage.formula ? `<pre class="researchMath">${esc(stage.formula)}</pre>` : ''}${(stage.interfaces || stage.edges || []).length ? `<p>${(stage.interfaces || stage.edges).map(id => `<button class="inlineLink" data-edge="${esc(id)}">${esc(id)}</button>`).join(' · ')}</p>` : ''}</li>`).join('')}</ol><details><summary>Worked request-to-delivery trace</summary><ol>${f.workedTrace.map(step => `<li><strong>${esc(step.title || step.event || step.stage || 'Step '+step.step)}</strong><p>${esc(step.explanation || step.description || step.text || step.example || '')}</p>${step.formula ? `<pre class="researchMath">${esc(step.formula)}</pre>` : ''}</li>`).join('')}</ol></details><details><summary>What each arrow type means</summary>${Object.entries(f.relationTypes).map(([name,t]) => `<h4>${esc(name)}</h4><p>${esc(typeof t === 'string' ? t : t.meaning || t.explanation || t.description)}</p>`).join('')}</details><details><summary>Assumptions and limits of the mathematics</summary>${items(f.limitations)}</details><p><a href="/aws/Mathematical-Connection-Audit.md" download>Download the complete mathematical connection audit</a></p></section>`;
  }
  function guardDemo() {
    const f=window.AC_FORMAL;
    return `<section class="guard-demonstration"><h3>Try the gate logic</h3><p>Change the example to see why a transition is admitted or blocked in the scoped model. The sample facts stand in for evidence an implementation must obtain and validate.</p><label for="formalScenario">Scenario</label><select id="formalScenario">${f.scenarios.map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')}</select><div id="formalScenarioResult" aria-live="polite">${scenarioResult(f.scenarios[0].id)}</div></section>`;
  }
  function stageIntro(index) {
    const stage=window.AC_FORMAL.stages[index];
    return `<section class="study-note"><h3>Lifecycle stage ${index+1}: ${esc(stage.title)}</h3><p>${esc(stage.explanation)}</p><p>${stage.edges.map(id=>`<button class="inlineLink" data-edge="${id}">${id}</button>`).join(' · ')}</p></section>`;
  }
  function scenarioResult(id) {
    const f=window.AC_FORMAL, scenario=f.scenarios.find(s=>s.id===id), result=f.evaluateGate(scenario.stage,f.scenarioState(id));
    return `<p class="gate-status ${result.ok?'gate-allowed':'gate-blocked'}"><strong>${result.ok?'Admitted':'Blocked'}</strong> · ${esc(scenario.title)}</p>${result.ok?'<p>All required conditions for this transition are satisfied.</p>':`<ul class="gate-checks">${result.checks.filter(c=>!c.ok).map(c=>`<li>× ${esc(c.label)}</li>`).join('')}</ul>`}<details><summary>Inspect all ${result.checks.length} conditions</summary><ul class="gate-checks">${result.checks.map(c=>`<li><span aria-hidden="true">${c.ok?'✓':'×'}</span> ${esc(c.label)}</li>`).join('')}</ul></details><p class="study-note">${esc(result.scope)}</p>`;
  }
  function syncCard(nodeId) {
    const card = document.getElementById('nodeAwsCard');
    card.hidden = !nodeId;
    if (!nodeId) return;
    const n = byId[nodeId], m = window.AWS_LEARNING[nodeId];
    card.innerHTML = `<button class="aws-card-dismiss" type="button" data-dismiss-aws aria-label="Dismiss AWS quick card">×</button><span class="researchLabel">Proposed AWS mapping</span><div class="aws-card-heading">${icon(nodeId)}<div><strong>${esc(n.short)}</strong><span>${esc(m.primaryService)}</span></div></div><button type="button" class="inlineLink" data-open-aws>Study this AWS mapping ↗</button>`;
  }
  document.addEventListener('change',event=>{if(event.target.id==='formalScenario')document.getElementById('formalScenarioResult').innerHTML=scenarioResult(event.target.value)});
  window.AC_STUDY = {configure, icon, awsPanel, nodeMath, edgeMath, formalOverview, guardDemo, stageIntro, syncCard};
})();
