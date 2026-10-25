/* Deterministic reference guide. No model requests, remote calls or generated claims. */
(() => {
  'use strict';
  const text = (value, limit = 1400) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const normalize = value => text(value, 5000).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const hasPhrase = (question, phrase) => phrase && (` ${question} `).includes(` ${phrase} `);
  const sourceId = value => typeof value === 'object' && value ? text(value.id, 120) : text(value, 120);
  const label = node => text(node?.name || node?.label || node?.short || node?.id, 180);
  const listText = value => Array.isArray(value) ? value.map(item => text(item, 500)).filter(Boolean).join('; ') : text(value);
  const action = (type, id, name, scope) => ({label: name, type, id, ...(scope ? {scope} : {})});
  const result = (paragraphs, actions = []) => ({
    paragraphs: paragraphs.filter(Boolean),
    actions: actions.filter((item, index, all) => all.findIndex(other => other.type === item.type && other.id === item.id && other.scope === item.scope) === index).slice(0, 8)
  });
  const note = 'These are proposed design responsibilities. The diagram and its rules do not establish that a runtime or AWS deployment enforces them.';

  function prepare(context = {}) {
    const graph = context.graph?.blueprint || context.graph || {};
    const nodes = (Array.isArray(graph.nodes) ? graph.nodes : []).slice(0, 2000).filter(node => node && text(node.id, 120));
    const byId = new Map(nodes.map(node => [node.id, node]));
    // Only describe interfaces whose two endpoints exist in the supplied model.
    const edges = (Array.isArray(graph.edges) ? graph.edges : []).slice(0, 5000).filter(edge => edge && byId.has(sourceId(edge.source||edge.from)) && byId.has(sourceId(edge.target||edge.to)));
    const sections = (Array.isArray(context.page?.sections) ? context.page.sections : []).slice(0, 200).filter(section => section && typeof section === 'object');
    const selectedId = sourceId(context.selectedNode);
    const website = graph.programId==='website' || graph.id === 'system-architecture-workspace-1-0' || graph.version === 'website-architecture-v1' || (nodes.length > 0 && nodes.every(node => node.id.startsWith('web-')));
    const program=graph.programModel?{id:graph.programId,scope:graph.scopeId,analysis:graph.analysis,sourceNote:graph.sourceNote}:null;
    // Saved notes belong to the page, while ordinary answers stay in this scope.
    // Keep a separate anchor index so a valid note in another scope is not lost.
    const anchorById=new Map(nodes.map(node=>[node.id,{node,scope:program?.scope||null,legacy:false}]));
    if(program){
      const library=program.id==='website'?window.SAWWebsiteProgram:window.SAWAgenticProgram;
      if(library?.id===program.id)for(const model of [library.overview,...library.stages.map(stage=>stage.model)])for(const node of model.nodes||[]){
        if(!anchorById.has(node.id))anchorById.set(node.id,{node,scope:model.scopeId||'overview',legacy:false});
      }
      const legacyModels=website?[window.SAWWebsiteData]:[window.SAWNode01Data,window.SAWFoundationData,window.ACReference?.data];
      for(const model of legacyModels)for(const node of model?.nodes||[]){
        if(!anchorById.has(node.id))anchorById.set(node.id,{node,scope:null,legacy:true});
      }
    }
    const node01=graph.node01||null;
    const foundation = graph.foundation && typeof graph.foundation === 'object' ? graph.foundation : null;
    // Foundation IDs intentionally overlap the larger reference. Its smaller
    // service choices come only from its own source, never the legacy mapping.
    const aws = foundation || node01 || program ? {} : {...(context.aws || {})};
    if (website || foundation || node01 || program) for (const node of nodes) {
      if ((!foundation && !node01 && !program && aws[node.id]) || !node.aws) continue;
      const entry = node.aws;
      aws[node.id] = {
        primaryService: entry.service,
        explanation: entry.why,
        pitfall: entry.notes,
        sources: Array.isArray(entry.sources) && entry.sources.length ? entry.sources : Array.isArray(entry.services) && entry.services.length ? entry.services.filter(service => service.url).map(service => ({title: service.name || service.short, url: service.url})) : entry.url ? [{title: entry.service, url: entry.url}] : []
      };
    }
    return {nodes, edges, byId, anchorById, sections, website, foundation, node01, program, overview: graph.overview || {}, page: context.page || {}, selected: byId.get(selectedId), aws};
  }

  function matchedNode(question, data) {
    const matches = data.nodes.map(node => {
      const aliases = [label(node), text(node.short), text(node.id), ...(Array.isArray(node.aliases) ? node.aliases.map(alias => text(alias)) : [])].map(normalize).filter(Boolean);
      const matched = aliases.filter(alias => hasPhrase(question, alias));
      return {node, score: matched.length ? Math.max(...matched.map(alias => alias.length)) : 0};
    }).filter(match => match.score).sort((a, b) => b.score - a.score);
    return matches[0]?.node;
  }

  function nodeAnswer(node, data) {
    const outgoing = data.edges.filter(edge => sourceId(edge.source||edge.from) === node.id);
    const incoming = data.edges.filter(edge => sourceId(edge.target||edge.to) === node.id);
    return result([
      `${label(node)}: ${text(node.responsibility || node.summary) || 'This node has no responsibility description in the current reference.'}`,
      node.problem ? `Problem it addresses: ${text(node.problem)}` : '',
      (data.website || data.foundation || data.node01 || data.program) && node.status ? `Recorded status: ${text(node.status)}.` : '',
      [node.inputs ? `Inputs: ${listText(node.inputs)}` : '', node.outputs ? `Outputs: ${listText(node.outputs)}` : ''].filter(Boolean).join('\n'),
      node.rule || node.formula ? `Rule recorded in the model: ${text(node.rule || node.formula)}` : '',
      [node.authority ? `Authority: ${text(node.authority)}` : '', node.failure ? `Failure path: ${text(node.failure)}` : '', node.scaling ? `Scaling: ${text(node.scaling)}` : ''].filter(Boolean).join('\n'),
      `Current reference: node ${node.id}; ${incoming.length} incoming and ${outgoing.length} outgoing interfaces. ${data.website ? 'This website model describes current responsibilities and marks future capabilities separately. Its AWS mappings are proposals, not deployed resources.' : note}`
    ], [action('node', node.id, `Show ${text(node.short) || label(node)}`), action('study', 'selection', 'Read node details'), action('study', 'aws', 'Explore AWS mapping')]);
  }

  function connectionAnswer(node, data) {
    const connections = data.edges.filter(edge => sourceId(edge.source||edge.from) === node.id || sourceId(edge.target||edge.to) === node.id);
    const shown = connections.slice(0, 14);
    const paragraphs = [`${label(node)} has ${connections.length} recorded interface${connections.length === 1 ? '' : 's'} in the supplied model. Each line below is a direct reference to an edge, including its identifier.`];
    for (const edge of shown) {
      const from = data.byId.get(sourceId(edge.source||edge.from));
      const to = data.byId.get(sourceId(edge.target||edge.to));
      paragraphs.push(`${text(edge.id, 120) || 'Unnumbered interface'}: ${label(from)} → ${label(to)}. ${text(edge.name || edge.purpose)}${(data.website || data.foundation || data.node01 || data.program) && edge.details ? `: ${text(edge.details)}` : ''}${(data.website || data.foundation || data.node01 || data.program) && edge.status ? ` [${text(edge.status, 120)}]` : ''}${edge.type ? ` [${text(edge.type, 100)}]` : ''}\n${edge.pre ? `Required before the transition: ${text(edge.pre)}\n` : ''}${edge.post ? `Recorded result: ${text(edge.post)}` : edge.payload ? `Payload: ${text(edge.payload)}` : ''}`);
    }
    if (!connections.length) paragraphs.push('No incoming or outgoing edge is recorded for this node in the supplied model. I cannot infer a connection from its position in the diagram.');
    if (connections.length > shown.length) paragraphs.push(`Showing ${shown.length} of ${connections.length} interfaces. Use Individual Nodes to study the remaining connections.`);
    paragraphs.push('A visible arrow records an intended relationship. Its receiver still has to enforce the preconditions, authority checks and resulting state change.');
    return result(paragraphs, [action('node', node.id, `Show ${text(node.short) || label(node)}`), action('study', 'selection', 'Open Individual Nodes')]);
  }

  function awsAnswer(node, data) {
    if (!node) {
      const mapped = data.nodes.filter(item => data.aws[item.id]?.primaryService);
      return result([
        'AWS mappings explain a possible implementation of the responsibilities in this model. Select or name a node for its service choice, rationale, learning notes and documented trade-off.',
        ...mapped.slice(0, 4).map(item => `${label(item)}: ${text(data.aws[item.id].primaryService)}.`),
        'These mappings are proposed architecture study material. They do not claim deployed AWS resources, a measured cost, or production readiness.'
      ], [action('study', 'aws', 'Open AWS study'), ...mapped.slice(0, 3).map(item => action('node', item.id, `Study ${text(item.short) || label(item)}`))]);
    }
    const entry = data.aws[node.id];
    if (!entry) return result([
      `There is no AWS learning entry for ${label(node)} in the supplied mapping.`,
      node.cloud ? `The node's recorded cloud requirement is: ${text(node.cloud)}` : 'The current node does not define a cloud requirement.',
      'A cloud requirement is not an AWS service selection. I cannot fill that gap from an unverified assumption.'
    ], [action('node', node.id, `Show ${text(node.short) || label(node)}`), action('study', 'aws', 'Open AWS study')]);
    const sources = (Array.isArray(entry.sources) ? entry.sources : []).filter(source => source && typeof source.url === 'string' && /^https:\/\/docs\.aws\.amazon\.com\//.test(source.url)).slice(0, 4);
    return result([
      `${label(node)} maps to ${text(entry.primaryService) || 'the recorded AWS services'}.`,
      text(entry.explanation),
      entry.whatToLearn ? `What to study: ${listText(entry.whatToLearn)}` : '',
      entry.pitfall ? `Important limitation: ${text(entry.pitfall)}` : '',
      sources.length ? `Sources attached to node ${node.id}:\n${sources.map(source => `${text(source.title, 220)}: ${text(source.url, 700)}`).join('\n')}` : `Source: the current AWS learning entry for node ${node.id}.`,
      'This is a proposed mapping from the workspace reference, not verification of a deployed AWS system.'
    ], [action('node', node.id, `Show ${text(node.short) || label(node)}`), action('study', 'aws', 'Read AWS explanation')]);
  }

  function websiteWorkflowAnswer(data) {
    const steps = (Array.isArray(data.overview.workflow) ? data.overview.workflow : []).map(step => ({...step, nodes: (Array.isArray(step.nodes) ? step.nodes : []).filter(id => data.byId.has(id))})).filter(step => step.nodes.length);
    const paragraphs = [
      text(data.overview.summary) || 'This page models the System Architecture Workspace website, separately from Agentic Core.',
      text(data.overview.approach) || 'This is a manually designed website architecture. Study its responsibilities, data flow and access boundaries. No mathematical proof is needed to describe its system design.',
      text(data.overview.current),
      ...steps.map(step => `${text(step.title, 180)}: ${text(step.detail)}\nRecorded components: ${step.nodes.map(id => label(data.byId.get(id))).join(' → ')}.`)
    ];
    if (!steps.length) paragraphs.push('No complete website workflow is included in the supplied reference. Select a component to read the relationships that are recorded; I cannot infer missing stages.');
    paragraphs.push('Current operation, a connected private repository, proposed AWS services and the future prompt-to-design assistant are separate states. The local guide reads saved references; it does not generate architectures. A diagram is not evidence that an AWS deployment has been created or that every production path has passed a test.');
    return result(paragraphs, [action('study', 'system', data.node01?'Open requirement intake overview':'Open website overview'), ...(data.node01?['n01-browser','n01-store','n01-node02']:['web-shell', 'web-page', 'web-store-api']).filter(id => data.byId.has(id)).map(id => action('node', id, `Show ${label(data.byId.get(id))}`))]);
  }

  function foundationAnswer(data, topic = 'workflow') {
    const f = data.foundation;
    const items = key => Array.isArray(f[key]) ? f[key] : [];
    const stepText = (item, fields) => typeof item === 'string' ? text(item, 2400) : fields.map(field => text(item?.[field], 2400)).filter(Boolean).join('\n');
    const nodeAction = id => data.byId.has(id) ? action('node', id, `Show ${label(data.byId.get(id))}`) : null;
    let paragraphs = [], nodes = ['core', 'plan', 'verify'];
    if (topic === 'pic') {
      paragraphs = [
        'PIC means Pattern Inheritance and Conformance. In this foundation it is one mandatory shared six-rule library, not a fifth autonomous agent. Core selects the required rules at admission, the compiler binds reviewed controls, and the Verifier checks the bindings and their positive and negative tests.',
        ...items('picRules').map((rule, i) => `${i + 1}. ${text(rule.title)}\nGuard: ${text(rule.guard)}\nRequired negative test: ${text(rule.test)}`),
        'The trace to retain is pattern → implementation → guard → test → evidence. Printing a rule in documentation is not runtime enforcement. A child workflow has its own operating contract; any delegated acceptance policy must be explicitly authorised and pinned. The engineering package still needs human owner acceptance.'
      ];
      nodes = ['pic', 'core', 'verify'];
    } else if (topic === 'release') {
      paragraphs = [
        'Only the Core Controller can commit a release intent at one consistent authoritative run revision. All six checks must hold together:',
        ...items('releaseChecks').map((check, i) => `${i + 1}. ${stepText(check, ['title', 'detail'])}`),
        'G_release = ApprovedCurrent ∧ OwnerAcceptedCurrent ∧ FinalPassCurrent ∧ PICConformantCurrent ∧ EvidenceCurrent ∧ ReleaseAuthorised.',
        'The intent binds the exact candidate digest, evidence digest, approval and approved destination. The delivery adapter rechecks current intent and release authority before invocation. Delivery requires a matching digest, matching destination and confirmed receipt. A local conditional write does not atomically perform an external delivery; an unknown outcome stays DELIVERY_UNCONFIRMED.',
        'The MOA Workflow package contains the runnable specification, pinned reviewed runtime/components, operating contract, PIC bindings, evidence and release record. Its later report is a domain outcome, not the package itself. Operating the child workflow requires its own authority.'
      ];
      nodes = ['core', 'workflow'];
    } else if (topic === 'mathematics') {
      paragraphs = [
        'The foundation makes conditional mathematical claims about a bounded, reviewed workflow language. These are model obligations, not completed software verification.',
        ...items('rules').map((rule, i) => `${i + 1}. ${stepText(rule, ['title', 'formula', 'explanation', 'obligation'])}`),
        ...items('propositions').map(proposition => `Conditional derivation: ${stepText(proposition, ['title', 'claim', 'assumptions'])}`),
        'The generated workflow W must be a finite dependency DAG. The engineering controller includes approval and repair feedback, so its communication graph need not be acyclic. Neither dense connections nor node counts establish a percentage mathematically proven.'
      ];
      nodes = ['contract', 'core', 'pic', 'verify'];
    } else if (topic === 'limits') {
      paragraphs = [
        'This is a deliberately bounded workflow-engineering proposal with four internal components and a reviewed primitive vocabulary. A model may propose a specification and allowed parameters; it cannot supply executable Python, shell commands, new operators, credentials or wider permissions.',
        ...items('scope').map(item => `Included scope: ${stepText(item, ['title', 'detail'])}`),
        ...items('deferred').map(item => `Deferred: ${stepText(item, ['title', 'detail'])}`),
        'The proposed first attempt limit is k = 2: one initial candidate attempt and at most one repair. Increment the global counter before any worker invocation. Invalid or failed model/plan calls also consume an attempt. Timeouts, SDK retries and orchestration retries must fit the admitted call, time and resource bounds.',
        'Resource admission requires spent + reserved ≤ B. An attempt reservation covers all bounded sub-operations, with metered handoff work admitted separately. Unknown usage retains its reservation or is charged conservatively. This accounting invariant is not a ceiling on the entire AWS bill.',
        'Bounded attempts and effective deadlines imply delivery or an explicit stop/unconfirmed state, not guaranteed success. Ambiguous interrupted runs stop for inspection. Persistence of contracts and run records does not establish general restart recovery.',
        'The small AWS proposal starts with an authenticated operator or CLI and scoped service roles. A public web application, Cognito, API Gateway, a customer VPC, multi-account isolation and enterprise recovery are not prerequisites or claims of this first demonstration.'
      ];
      nodes = ['core', 'plan'];
    } else if (topic === 'example') {
      const example = f.example || {};
      paragraphs = [
        text(example.title) || 'Support Operations Workflow',
        text(example.summary, 2400),
        Array.isArray(example.stages) ? `Supported workflow: ${example.stages.map(stage => text(stage, 180)).filter(Boolean).join(' → ')}.` : '',
        ...(Array.isArray(example.rows) ? example.rows : []).map(row => `${text(row.id, 120)}: ${text(row.input, 700)} → ${text(row.category, 300)}.`),
        text(example.reconciliation, 2400),
        text(example.variant, 2400),
        'These categories and counts are derived expectations, not measured execution results. Identical duplicate IDs collapse; conflicting duplicate IDs are quarantined. Missing amounts are not zero. Customer notes are escaped display data and never policy instructions. A policy-eligible refund category does not authorise payment or account changes.',
        'This example illustrates generating and releasing a workflow package. Executing the package to produce its local report is a separate, authorised operation.'
      ];
      nodes = ['workflow', 'plan'];
    } else if (topic === 'tests') {
      paragraphs = [
        'The source defines this minimum acceptance pack. These are expected outcomes to implement and demonstrate, not passing test results:',
        ...items('tests').map(test => `${text(test.name)}: ${text(test.expected, 2400)}`),
        'Evidence must identify the actual immutable candidate, trusted test suite and fixtures, run and attempt, and verifier identity. A missing test, timeout, unknown result or invalid evidence source is not a pass. Evidence is generated after the candidate is hashed and is kept outside its own test subject.'
      ];
      nodes = ['verify', 'core'];
    } else {
      const steps = (Array.isArray(data.overview.workflow) ? data.overview.workflow : []).filter(step => Array.isArray(step.nodes) && step.nodes.some(id => data.byId.has(id)));
      paragraphs = [
        text(data.overview.summary) || 'Turn an approved business requirement into a governed MOA Workflow package using four internal components.',
        'The six core cards are the User, Contract Engine, Core Controller, Workflow Builder, Verifier and MOA Workflow Package. The four internal components are Contract Engine, Core Controller, Workflow Builder and Verifier. PIC is a mandatory shared rule library.',
        text(data.overview.approach),
        ...steps.map(step => `${text(step.title, 180)}: ${text(step.detail, 2400)}`),
        'Core mediates the journey: admit the exact approved contract, request a bounded proposal, validate and pin the plan, compile and seal a candidate, then ask the Verifier to test it. Verification follows construction. Evidence and defects return to Core; the Builder cannot change authoritative tests or approve itself.',
        'Passing current evidence leads to authenticated human owner acceptance and the six-check release decision. Failed attempts may receive only newly admitted bounded repair. A workflow package and its domain report are different outputs, and operating the package requires separate authority.'
      ];
      if (topic === 'algorithm') paragraphs.push(
        f.algorithm ? `Recorded algorithm:\n${text(f.algorithm, 18000)}` : 'The complete control sequence is recorded in the foundation algorithm study.',
        items('states').length ? `Recorded controller states:\n${items('states').map(item => stepText(item, ['title', 'detail'])).join('\n')}` : '',
        items('exits').length ? `Explicit stop or unconfirmed exits:\n${items('exits').map(item => stepText(item, ['title', 'detail'])).join('\n')}` : ''
      );
    }
    const provenance = items('provenance').map(source => [text(source.title, 240), text(source.version, 80)].filter(Boolean).join(' ')).filter(Boolean);
    paragraphs.push(`Source: ${provenance.join('; ') || 'the supplied Agentic Core Foundational Mathematical Algorithm, version 0.1, and User to MOA Architecture diagram'}. Proposed design and conditional derivations; an implemented workflow engine, completed verification and AWS deployment are not claimed.`);
    return result(paragraphs, [action('study', 'system', 'Read foundation and algorithm'), ...nodes.map(nodeAction).filter(Boolean)]);
  }

  function programAnalysisAnswer(data,key){
    const entry=data.program.analysis?.[key];if(!entry)return lifecycleAnswer(data);
    return result([`Architectural Depth Analysis for this scope: ${key}.`,
      ...[['Decision',entry.decision],['Alternatives',entry.alternatives],['Risks',entry.risks],['Required validation',entry.validation],['Owner',entry.owner]].map(([label,value])=>value?label+': '+listText(value):''),
      'These are proposed decisions and required tests. They are not AWS execution results.',text(data.program.sourceNote,3000)], [action('study','system','Open this design overview')]);
  }
  function lifecycleAnswer(data) {
    if(data.program)return result([text(data.overview.summary,3000),...(data.overview.workflow||[]).map(step=>text(step.title,250)+': '+text(step.detail,2600)),text(data.program.sourceNote,3000)], [action('study','system','Open architecture overview'),action('study','selection','Browse this scope')]);
    if (data.website || data.node01) return websiteWorkflowAnswer(data);
    if (data.foundation) return foundationAnswer(data);
    const ids = ['user', 'contract', 'core', 'plan', 'pic', 'cap', 'exec', 'verify', 'integrate', 'final', 'release', 'workflow'];
    const nodes = ids.map(id => data.byId.get(id)).filter(Boolean);
    if (!nodes.length) return result(['The supplied model does not contain the reference lifecycle nodes. Open a reference architecture page to study that lifecycle.'], [action('pages', 'pages', 'Open Pages')]);
    const paragraphs = [
      'The request-to-result lifecycle is a set of gated responsibilities with feedback paths. This is a reading guide to the current model, not a claim that every listed stage forms one direct chain.',
      ...nodes.map(node => `${label(node)} (${node.id}): ${text(node.responsibility) || 'No responsibility is recorded.'}`)
    ];
    const gates = data.edges.filter(edge => ['I003', 'I009', 'I017', 'I018'].includes(edge.id));
    if (gates.length) paragraphs.push(`Examples of recorded gates:\n${gates.map(edge => `${edge.id}, ${text(edge.name)}: ${text(edge.pre) || 'No precondition recorded.'}`).join('\n')}`);
    paragraphs.push('The logical test for an interface is whether the receiver can establish its preconditions and authority, apply the allowed transition, and preserve the required invariants. The System Overview contains the scoped algorithm and its assumptions. Diagram edges alone do not prove runtime correctness.');
    return result(paragraphs, [action('study', 'system', 'Open overview and algorithm'), ...nodes.filter(node => ['user', 'core', 'workflow'].includes(node.id)).map(node => action('node', node.id, `Show ${text(node.short) || label(node)}`))]);
  }

  function reviewPage(data) {
    const name = text(data.page.name, 180) || 'This page';
    const paragraphs = [`${name}: this is a completeness check of the page notes, not architectural validation or proof of correctness.`];
    if (!data.sections.length) paragraphs.push(`This page uses its reference model without additional section notes. Study the ${data.website ? 'website overview and its user-to-output workflow' : 'Core Architecture and its request-to-result lifecycle'}, then inspect each component's responsibility and connections.`);
    let complete = 0;
    for (const section of data.sections.slice(0, 20)) {
      const fields = [['purpose', section.purpose], ['inputs', section.inputs], ['outputs', section.outputs], ['acceptance criteria', section.acceptance || section.acceptanceCriteria]];
      const missing = fields.filter(([, value]) => !listText(value)).map(([field]) => field);
      if (!missing.length) complete += 1;
      const anchor = text(section.anchor, 120), recorded=data.anchorById.get(anchor);
      paragraphs.push(`${text(section.name || section.title, 180) || 'Unnamed section'}: ${missing.length ? `missing ${missing.join(', ')}.` : 'all four descriptive fields are present.'}${anchor && !recorded ? ' Its anchor is not a node in the page references.' : !anchor ? ' No anchor node is recorded.' : ` Anchored to ${label(recorded.node)}${recorded.legacy?' in the retained source reference':recorded.scope&&recorded.scope!==data.program?.scope?' in the '+recorded.scope+' scope':''}.`}`);
    }
    if (data.sections.length > 20) paragraphs.push(`This reply checks the first 20 of ${data.sections.length} saved sections. Ask about another saved section by name to read its notes.`);
    if (data.sections.length) paragraphs.push(`${complete} of the ${Math.min(data.sections.length, 20)} checked sections include purpose, inputs, outputs and acceptance criteria. Text being present does not establish compatible interfaces, valid authority, correct implementation or passing tests.`);
    paragraphs.push(data.node01 ? 'Next, compare the recorded controls with the supplied Node 01 design. Define evidence for durable intake, tenant isolation and recoverable handoff before implementation.' : data.website
      ? 'Next, compare each section with the current website responsibilities, check its anchor and interfaces, define observable acceptance evidence and test its implementation. Section notes are design proposals; this manually designed website does not require the Agentic Core mathematical proof interface.'
      : 'Next, review each section against the current contract, define observable acceptance evidence, check its connection to Core, and test the implementation. Core Architecture is the shared foundation; section notes are proposed extensions.');
    return result(paragraphs, [action('study', 'system', data.node01 ? 'Study requirement intake' : data.website ? 'Study the website overview' : 'Study Core and the algorithm'), action('study', 'selection', 'Browse Individual Nodes')]);
  }

  function sectionAnswer(section, data) {
    const recorded=data.anchorById.get(text(section.anchor,120)),anchor=recorded?.node;
    return result([
      `${text(section.name || section.title, 180) || 'Untitled section'} is a custom section on ${text(data.page.name, 180) || 'the current page'}.`,
      ...[['Purpose', section.purpose], ['Inputs', section.inputs], ['Outputs', section.outputs], ['Acceptance criteria', section.acceptance || section.acceptanceCriteria], ['AWS notes', section.awsNotes]].map(([name, value]) => `${name}: ${listText(value) || 'Not recorded.'}`),
      anchor ? `Recorded anchor: ${label(anchor)} (${anchor.id}).${recorded.legacy?' This saved source anchor is retained, but is not a component in the current study diagrams.':recorded.scope&&recorded.scope!==data.program?.scope?' Open its '+recorded.scope+' scope to inspect the component.':''}` : 'No valid anchor in the page references is recorded.',
      'These are the saved design notes. They are not independently validated implementation evidence.'
    ], anchor&&!recorded.legacy ? [action('node',anchor.id,'Show anchor node',recorded.scope)] : []);
  }

  function answer(question, context) {
    const data = prepare(context);
    const query = normalize(text(question, 2000));
    if(!query&&data.program)return result(['Ask about a component, its connections, AWS mapping, the workflow or a Well-Architected pillar in the current scope.'],[action('study','system','Explore this design')]);
    if(!query&&data.node01)return result(['Ask about a component, its AWS mapping, requirement intake, recovery or the current page. I answer from the supplied Node 01 model.'],[action('study','system','Explore requirement intake')]);
    if (!query) return result([data.website
      ? 'Ask about a website component, its AWS mapping, the website workflow, or the completeness of the current page. I answer from this website model and distinguish current responsibilities from product direction.'
      : 'Ask about a node, an AWS mapping, the path from User to MOA Workflow, or the completeness of the current page. I answer from the workspace references.'], [action('study', 'system', data.website ? 'Explore the website overview' : 'Explore the algorithm'), action('pages', 'pages', 'Open Pages')]);
    if (/\b(review|check|audit)\b/.test(query) && /\b(page|sections|design|completeness)\b/.test(query)) return reviewPage(data);
    if (/\b(add|new|create|edit)\b/.test(query) && /\b(page|pages|section|sections)\b/.test(query)) return result([
      'Open Pages and use the plus action to create a page. Choose either the Agentic Core reference or the workspace website architecture.',
      'Pages contains your architecture list and the add-page action. Previously saved section notes remain part of their page data and can be read by asking for a section by name; the current interface does not provide a section editor.',
      'The guide explains the supplied references. It does not generate a new model or change your architecture from a prompt.'
    ], [action('pages', 'pages', 'Open Pages')]);
    const section = data.sections.find(item => hasPhrase(query, normalize(text(item.name || item.title))));
    if (section) return sectionAnswer(section, data);
    const selectedRequest = /\b(this|selected|current) (node|component)\b/.test(query) || query === 'explain this';
    const named = matchedNode(query, data);
    const node = named || (selectedRequest || /\baws\b/.test(query) ? data.selected : undefined);
    if (selectedRequest && !node) return result(['Select a node in the model first, or include its name in your question. I can then explain its recorded purpose, inputs, outputs, rules and AWS mapping.'], [action('study', 'selection', 'Open Individual Nodes')]);
    if (/\b(aws|amazon|cloud mapping)\b/.test(query)) return awsAnswer(node, data);
    if (node && /\b(connection|connections|connect|connects|connected|edges|interfaces|incoming|outgoing)\b/.test(query)) return connectionAnswer(node, data);
    if(data.program&&!node){
      const topic=[['security',/security|authorisation|authorization|tenant/],['reliability',/reliability|recovery|retry|idempotency/],['performance',/performance|latency|capacity/],['cost',/cost|budget/],['sustainability',/sustainability|resource efficiency/],['operations',/operational|observability|monitor/],['evidence',/evidence|tests|validation/],['decision',/decision|alternative|trade off/]].find(([,pattern])=>pattern.test(query));
      if(topic)return programAnalysisAnswer(data,topic[0]);
      if(/workflow|lifecycle|complete architecture|seven|handoff|user to moa/.test(query))return lifecycleAnswer(data);
    }
    if(data.node01 && /\b(requirement intake|intake workflow|handoff|durable|receipt|retry|recovery|node 02)\b/.test(query)&&!node) return lifecycleAnswer(data);
    if (data.foundation) {
      if (/\b(pic|pattern inheritance|conformance|six rules)\b/.test(query)) return foundationAnswer(data, 'pic');
      if (/\b(release|handoff|delivery|delivered)\b/.test(query)) return foundationAnswer(data, 'release');
      if (/\b(math|maths|mathematics|mathematical|proof|prove|proves|propositions|invariant|invariants|approval|authority|permission|permissions|evidence|digest)\b/.test(query)) return foundationAnswer(data, 'mathematics');
      if (/\b(scope|deferred|limits|limitations|attempts|repair|retry|retries|budget|bounds|bounded)\b/.test(query)) return foundationAnswer(data, 'limits');
      if (/\b(example|support operations|refund|refunds|threshold|demonstration)\b/.test(query)) return foundationAnswer(data, 'example');
      if (/\b(test|tests|testing|acceptance pack|evidence pack)\b/.test(query) && !selectedRequest) return foundationAnswer(data, 'tests');
      if (/\b(algorithm|pseudocode|state machine|controller states)\b/.test(query)) return foundationAnswer(data, 'algorithm');
    }
    if (/\b(lifecycle|algorithm|end to end|user to moa|request to result|request to workflow)\b/.test(query) || /\buser\b/.test(query) && /\b(moa|workflow)\b/.test(query)) return lifecycleAnswer(data);
    if (node) return nodeAnswer(node, data);
    if (/\b(how does (it|this|the system|the website) work|system overview|website overview|website workflow|workflow overview)\b/.test(query)) return lifecycleAnswer(data);
    return result([
      'I could not match that question to a node, section or supported topic in this workspace. This guide retrieves the current architecture references; it is not a general-purpose AI chat.',
      data.program ? 'Try “explain this node”, “AWS mapping”, “complete architecture workflow”, “security” or “reliability”.' : data.node01 ? 'Try “requirement intake”, “AWS for Save safely”, “connections from Customer” or “review my page”.' : data.website ? 'Try “explain this node”, “AWS for 3D design”, “connections from Session”, “website workflow”, or “review my page”.' : 'Try “explain this node”, “AWS for Core Control”, “connections from User”, “user to MOA workflow”, or “review my page”.'
    ], [action('study', 'system', 'Open System Overview'), action('study', 'selection', 'Browse Individual Nodes')]);
  }

  function scopedAnswer(question,context={}){
    const response=answer(question,context),graph=context.graph?.blueprint||context.graph;
    const scope=graph?.programModel?(graph.scopeId||'overview'):null;
    return scope?{...response,actions:response.actions.map(item=>['node','study'].includes(item.type)&&!item.scope?{...item,scope}:item)}:response;
  }
  window.SAWGuide = Object.freeze({answer:scopedAnswer});
})();
