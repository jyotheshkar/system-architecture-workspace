/* Readable Agentic Core views share the website architecture renderer.
 * The canonical model, logical interface IDs and scoped formal study remain
 * authoritative. This adapter changes presentation, not runtime authority. */
(() => {
  'use strict';
  const isWebsite = page => page?.id === 'system-architecture-workspace-1-0' || page?.coreVersion === 'system-architecture-workspace-v1';
  const isScaled = page => page?.id === 'agentic-core-scaled';
  const coreOrder = ['user', 'contract', 'core', 'plan', 'pic', 'cap', 'exec', 'verify', 'integrate', 'final', 'release', 'workflow'];
  const moduleOrder = ['memory', 'learning', 'tools', 'recovery', 'specialists'];
  const groupLabels = {core: 'Core Architecture', memory: 'Memory', learning: 'Learning', tools: 'Tools / Adapters', recovery: 'Recovery / Scale', specialists: 'Specialists'};
  const neutralIcons = {
    user: 'user', contract: 'brief', core: 'graph', plan: 'brief', pic: 'check', cap: 'graph',
    exec: 'browser', verify: 'check', integrate: 'graph', final: 'review', release: 'package', workflow: 'package',
    mem: 'history', store: 'history', scope: 'check', retrieve: 'history', checkpoint: 'history',
    outcomes: 'review', candidate: 'brief', evaluate: 'check', promote: 'review', versions: 'history', rollback: 'history',
    need: 'brief', adapters: 'graph', boundary: 'check', gateway: 'graph', effect: 'check',
    queue: 'graph', leases: 'check', retry: 'history', observe: 'review', domain: 'brief', construct: 'browser', assure: 'review'
  };
  const serviceLabels = {
    user: 'Amazon Cognito', contract: 'AWS Lambda', core: 'Step Functions', plan: 'AgentCore Runtime',
    pic: 'PIC on Lambda', cap: 'DynamoDB', exec: 'AWS Fargate', verify: 'AWS Fargate',
    integrate: 'AWS Fargate', final: 'AWS Fargate', release: 'AWS Lambda', workflow: 'Step Functions',
    mem: 'AWS Lambda', store: 'DynamoDB + S3', scope: 'AWS IAM', retrieve: 'AgentCore Memory',
    checkpoint: 'AWS Lambda', outcomes: 'AWS Lambda', candidate: 'AgentCore Runtime',
    evaluate: 'AWS Fargate', promote: 'Step Functions', versions: 'AWS AppConfig', rollback: 'AWS AppConfig',
    need: 'AWS Lambda', adapters: 'DynamoDB', boundary: 'AWS IAM', gateway: 'AgentCore Gateway',
    effect: 'AWS Lambda', queue: 'Amazon SQS', leases: 'DynamoDB', retry: 'Step Functions',
    observe: 'CloudWatch', domain: 'AgentCore Runtime', construct: 'AWS Fargate', assure: 'AWS Fargate'
  };
  // These are existing interfaces. In particular capability binding and final
  // attestation return to Core before execution and release can be admitted.
  const journeyEdges = ['I001', 'I003', 'I004', 'I005', 'I064', 'I065', 'I006', 'I007', 'I008', 'I009', 'I010', 'I013', 'I014', 'I016', 'I017', 'I018'];
  const list = value => Array.isArray(value) ? [...value] : String(value || '').split(';').map(item => item.trim()).filter(Boolean);
  const paragraph = (label, value) => value ? `${label}: ${value}` : '';
  const join = parts => parts.filter(Boolean).join('\n\n');

  function forPage(page = {}) {
    const program=window.SAWProgramModel?.forPage(page);
    if(program?.overview)return {...program.overview,id:page.id||program.overview.id,title:page.name||program.title};
    if (isWebsite(page)) {
      const website = window.SAWWebsiteData;
      return website && page.name && page.name !== website.title ? {...website, id: page.id || website.id, title: page.name} : website;
    }
    // All Agentic Core pages use the supplied Node 01 pilot model. Page identity
    // and saved notes remain intact; website pages keep their own data source.
    if (window.SAWNode01Data) {
      const node01 = window.SAWNode01Data;
      return {...node01, id: page.id || node01.id, title: page.name || node01.title};
    }
    const original = window.ACReference?.data;
    if (!original?.nodes?.length || !original?.edges?.length) return null;
    const enabled = new Set(isScaled(page) ? moduleOrder : (page.modules || []).filter(id => moduleOrder.includes(id)));
    const groupIds = ['core', ...moduleOrder.filter(id => enabled.has(id))];
    const formal = window.AC_FORMAL;
    const sourceNodes = original.nodes.filter(node => node.module === 'core' || enabled.has(node.module));
    const knownIds = new Set(sourceNodes.map(node => node.id));
    const nodeIndex = new Map(original.nodes.map((node, index) => [node.id, index]));
    const sourceEdges = original.edges.filter(edge => knownIds.has(edge.source) && knownIds.has(edge.target) && (edge.requires || []).every(id => enabled.has(id)));
    const nodes = sourceNodes.map(node => {
      const learning = window.AWS_LEARNING?.[node.id];
      const study = formal?.nodeStudies?.[node.id];
      const step = coreOrder.indexOf(node.id);
      const order = step >= 0 ? step : nodeIndex.get(node.id);
      const formula = study?.formula || node.rule || '';
      return {
        ...node,
        group: node.module,
        pos: [...node.pos],
        order,
        layer: Math.max(0, groupIds.indexOf(node.module)),
        ...(step >= 0 ? {journeyStep: step + 1} : {}),
        status: 'Proposed engineering responsibility',
        summary: node.responsibility,
        details: join([
          node.responsibility,
          paragraph('Authority', study?.authority || node.authority),
          paragraph('Trusted state', node.state),
          paragraph('Logical obligation', formula),
          paragraph('Failure response', node.failure),
          paragraph('Scale', node.scaling),
          'This is a reference design and scoped study obligation. An implementation and its evidence must enforce the rule; a diagram or a formula alone does not prove a deployed system correct.'
        ]),
        inputs: list(node.inputs),
        outputs: list(node.outputs),
        formula,
        formal: study || null,
        icon: `/assets/aws-icons/${neutralIcons[node.id] || 'graph'}.svg`,
        aws: {
          service: learning?.primaryService || node.cloud || 'Custom implementation on AWS',
          short: serviceLabels[node.id] || learning?.primaryService || node.short,
          icon: learning?.icon ? `/aws/icons/${learning.icon}` : '/assets/aws-icons/graph.svg',
          why: learning?.explanation || node.cloud,
          notes: join([
            learning?.whatToLearn?.join(' '),
            paragraph('Avoid', learning?.pitfall),
            paragraph('Study question', learning?.checkQuestion),
            paragraph('Reasoning', learning?.checkAnswer),
            'Proposed AWS mapping. The service supplies infrastructure; custom code must enforce the architecture contract.'
          ]),
          url: learning?.sources?.[0]?.url || 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
          sources: learning?.sources || [],
          status: 'Proposed AWS design'
        }
      };
    });
    const edges = sourceEdges.map(edge => {
      const study = formal?.edgeContracts?.[edge.id];
      return {
        ...edge,
        from: edge.source,
        to: edge.target,
        label: `${edge.id} · ${edge.name}`,
        status: 'Proposed typed interface',
        details: join([
          edge.purpose,
          paragraph('Payload', edge.payload),
          paragraph('Gate', study?.guard || edge.pre),
          paragraph('State after acceptance', study?.postcondition || edge.post),
          paragraph('Authority', edge.authority),
          paragraph('Logical contract', study?.formula || edge.rule),
          paragraph('Required evidence', study?.evidence),
          paragraph('Failure response', edge.failure),
          study?.explanation
        ]),
        formula: study?.formula || edge.rule,
        formal: study || null
      };
    });
    const edgeIds = new Set(edges.map(edge => edge.id));
    const title = page.name || (isScaled(page) ? 'Agentic Core Scaled' : 'Agentic Core');
    const summary = 'Turn a business request into an approved contract, governed engineering work and an exact, verified MOA workflow package.';
    return {
      id: page.id || 'agentic-core',
      version: 'agentic-readable-v1',
      title,
      groups: groupIds.map(id => ({id, label: groupLabels[id]})),
      nodes,
      edges,
      modules: Object.fromEntries(moduleOrder.filter(id => enabled.has(id)).map(id => [id, original.modules[id]])),
      presentation: {
        kicker: 'REQUEST TO GOVERNED WORKFLOW',
        title: 'A clear path from a request to a governed MOA workflow',
        summary,
        story: 'Define the contract, govern construction, verify the result and release the exact accepted package.',
        journey: [...coreOrder],
        journeyEdges: journeyEdges.filter(id => edgeIds.has(id)),
        disclosure: 'Reference design with scoped formal checks. These responsibilities and AWS mappings do not claim a deployed engineering platform.',
        output: 'A released MOA package with pinned artifacts, current acceptance evidence, inherited controls and a confirmed handoff receipt.',
        stages: [
          {title: 'Define and authorise', nodes: ['user', 'contract', 'core']},
          {title: 'Plan and bind', nodes: ['plan', 'pic', 'cap']},
          {title: 'Build and verify', nodes: ['exec', 'verify', 'integrate']},
          {title: 'Validate and deliver', nodes: ['final', 'release', 'workflow']}
        ]
      },
      overview: {
        title: 'From a business request to a governed MOA workflow',
        summary,
        current: 'The workspace provides an interactive reference model, recorded interface contracts, a scoped executable formal study and proposed AWS service explanations. The visualisation does not execute the engineering lifecycle or deploy the AWS resources shown.',
        approach: 'Read the numbered cards as lifecycle responsibilities. Arrows retain the canonical directed interfaces. Core mediates admission, acceptance and release, so some paths branch or return through Core instead of forming a single straight chain. The core view highlights the main journey; Full Architecture and individual node details retain the clarification, evidence, pattern and repair interfaces.',
        workflow: [
          {title: '1. Define and approve the current contract', detail: 'The user supplies the objective and resolves ambiguity. The contract names criteria, scope, budgets and evidence. Approval binds the authorised person to the exact contract revision and digest.', nodes: ['user', 'contract', 'core']},
          {title: '2. Admit a plan, inherited controls and eligible bindings', detail: 'Planning proposes an owned task DAG. Core admits its exact revision before PIC specialises the required controls. Capability bindings return to Core; the planner and registry cannot dispatch work directly.', nodes: ['plan', 'core', 'pic', 'cap']},
          {title: '3. Dispatch bounded work and accept evidence', detail: 'Core checks current authority, dependencies, qualified bindings and budget. Workers produce candidates. Independent verification and the accountable owner decision support a guarded acceptance update.', nodes: ['core', 'exec', 'verify']},
          {title: '4. Integrate exact accepted versions and validate the system', detail: 'Integration creates a new candidate from accepted pinned inputs. Final validation tests that candidate against the contract, interface expectations and inherited PIC controls; old reports cannot certify changed bytes.', nodes: ['integrate', 'final', 'pic']},
          {title: '5. Authorise release and reconcile delivery', detail: 'Final attestation returns to Core. The release gate rechecks every current prerequisite, commits a durable handoff intent and delivers the exact package. A timeout requires receipt reconciliation before a potentially duplicating retry.', nodes: ['final', 'core', 'release', 'workflow']}
        ],
        operational: [
          {title: 'Current authority and exact versions', detail: 'Bind approvals, dispatch, acceptance and release to current contract and artifact versions. Revocation, cancellation or a changed dependency invalidates affected work; recalled history never creates current authority.'},
          {title: 'Independent production and assurance', detail: 'Keep producer, verifier, owner and release responsibilities distinct. Use candidate digests, run IDs, attempt IDs and dependency pins so evidence is about the intended subject.'},
          {title: 'The mathematical composition rule', detail: 'Inv(S0) and, for every admitted interface e, {Inv and Pre_e and Guard_e} T_e {Inv and Post_e}, imply that Inv holds along admitted finite traces. This depends on the model assumptions and each implemented transition satisfying its proof obligation. The wider architecture graph includes feedback; only the admitted task dependency graph must be acyclic.'},
          {title: 'Failure, recovery and external effects', detail: 'Use bounded retries and explicit terminal failures. Superseded attempts must be fenced. A receipt with an unknown outcome requires reconciliation, because an internal database transaction cannot make an arbitrary external effect atomic.'},
          {title: enabled.size ? 'Enabled supporting responsibilities' : 'Core scope', detail: enabled.size ? moduleOrder.filter(id => enabled.has(id)).map(id => `${groupLabels[id]}: ${original.modules[id].property}`).join(' ') : 'This page contains the 12 core responsibilities. Optional cross-run memory, learned future versions, governed external adapters, distributed recovery and specialist pools are not assumed in the core-only design.'}
        ],
        failures: [
          'Approval is absent, stale or revoked: retain the draft or candidate and block the affected transition.',
          'A task plan is cyclic, unowned or incompatible: return it for revision before dispatch.',
          'No qualified capability satisfies the task: record a gap and block that task.',
          'Candidate bytes or dependency versions change: invalidate the affected evidence and repeat the required checks.',
          'A test or PIC obligation fails: return a bounded repair request or a terminal failure.',
          'Delivery times out with an unknown external outcome: reconcile the stable operation identity before retrying.'
        ],
        aws: 'This is a proposed implementation, not deployed infrastructure. Cognito identifies stakeholders; custom Lambda checks contract and PIC obligations; Step Functions Standard sequences phases; DynamoDB guards state revisions; S3 holds exact versioned artifacts. AgentCore and Bedrock can propose plans, while separately scoped Fargate tasks perform construction and assurance. AWS service names do not substitute for the business guards, evidence checks and release authority described in the model.',
        boundaries: [
          'The diagram is a responsibility and interface model, not a map of direct network connections.',
          'Scoped mathematical checks explain logical obligations; they do not certify arbitrary production code or AWS permissions.',
          'A released MOA package requires separate current authority before deployment and domain effects.',
          'Supporting modules add explicit responsibilities; they cannot bypass core approval, acceptance or release gates.'
        ]
      },
      evidence: {
        scope: 'Presentation adapter over the existing canonical reference model and recorded AWS learning notes. No new deployment or production verification is claimed.',
        currentFiles: ['dist/index.html', 'dist/assets/formal-model.js', 'dist/assets/aws-learning.js', 'dist/aws/architecture-data.json'],
        canonicalVersion: original.version,
        canonicalNodeCount: original.nodes.length,
        canonicalEdgeCount: original.edges.length,
        awsSources: [...new Map(nodes.flatMap(node => node.aws.sources).map(source => [source.url, source])).values()],
        formalAudit: '/aws/Mathematical-Connection-Audit.md'
      }
    };
  }
  window.SAWArchitectureData = Object.freeze({forPage, isWebsite, isScaled});
})();
