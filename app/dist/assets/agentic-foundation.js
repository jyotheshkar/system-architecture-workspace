/* Agentic Core foundation, derived from the supplied v0.1 mathematical source
 * and User to MOA diagram. This records a proposed design, not an engine,
 * passed verification, deployed AWS infrastructure or operational authority. */
(() => {
  'use strict';
  const proposed = 'Proposed foundation responsibility';
  const docs = {
    lambda: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html',
    stepfunctions: 'https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html',
    bedrock: 'https://docs.aws.amazon.com/bedrock/latest/userguide/inference.html',
    dynamodb: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html',
    s3: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html',
    iam: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html',
    cloudwatch: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html',
    framework: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html'
  };
  const services = {
    lambda: {name: 'AWS Lambda', short: 'Lambda', icon: '/aws/icons/Arch_AWS-Lambda_64.svg', url: docs.lambda, why: 'Run short, bounded, reviewed handlers, compiler steps and tests. Configure timeouts and narrow service roles.'},
    stepfunctions: {name: 'AWS Step Functions Standard', short: 'Step Functions', icon: '/aws/icons/Arch_AWS-Step-Functions_64.svg', url: docs.stepfunctions, why: 'Coordinate an inspectable engineering state machine, approval waits and bounded transitions. Custom guards still enforce the contract.'},
    bedrock: {name: 'Amazon Bedrock', short: 'Bedrock', icon: '/aws/icons/Arch_Amazon-Bedrock_64.svg', url: docs.bedrock, why: 'Make a capped inference request proposing a supported workflow specification. The response remains untrusted input to deterministic admission.'},
    dynamodb: {name: 'Amazon DynamoDB', short: 'DynamoDB', icon: '/aws/icons/Arch_Amazon-DynamoDB_64.svg', url: docs.dynamodb, why: 'Persist contracts, run revisions, attempt and resource counters, and release intents. Conditional writes reject stale authoritative revisions.'},
    s3: {name: 'Amazon S3', short: 'S3', icon: '/aws/icons/Arch_Amazon-Simple-Storage-Service_64.svg', url: docs.s3, why: 'Keep version-pinned candidate payloads and separate verifier evidence. Read and hash the actual referenced bytes, and protect versions required for release.'},
    iam: {name: 'AWS Identity and Access Management', short: 'IAM', icon: '/aws/icons/Arch_AWS-Identity-and-Access-Management_64.svg', url: docs.iam, why: 'Give each component a narrowly scoped service identity. Builder, verifier and release permissions must remain distinct.'},
    cloudwatch: {name: 'Amazon CloudWatch', short: 'CloudWatch', icon: '/aws/icons/Arch_Amazon-CloudWatch_64.svg', url: docs.cloudwatch, why: 'Record run and attempt identifiers, transition failures, durations and resource measurements. Operational logs do not replace digest-bound acceptance evidence.'}
  };
  const mapping = (keys, why, notes) => {
    const chosen = keys.map(key => services[key]);
    return {
      service: chosen.map(item => item.name).join(' + '),
      short: keys.length > 2 ? 'Step Functions + guards' : chosen.map(item => item.short).join(' + '),
      icon: chosen[0].icon, url: chosen[0].url,
      why, notes, services: chosen.map(item => ({...item})),
      status: 'Proposed AWS mapping',
      sources: chosen.map(item => ({title: item.name, url: item.url}))
    };
  };
  const person = {
    service: 'Authenticated human owner', short: 'Human owner', icon: '/assets/aws-icons/user.svg', url: docs.framework,
    why: 'A person states the business need, approves the exact contract and accepts the exact final engineering package. This is not an AWS service or a model decision.',
    notes: 'Start with an authenticated operator or CLI. Public application identity infrastructure is outside this foundation. A signed-in identity alone does not approve a contract, candidate, delivery or child operation.',
    services: [], status: 'Human authority boundary'
  };
  function node(id, name, short, group, pos, summary, details, inputs, outputs, icon, aws, extra = {}) {
    return {id, name, short, group, module: group, pos, status: proposed, summary, details, responsibility: details,
      inputs, outputs, icon: `/assets/aws-icons/${icon}.svg`, aws, cloud: aws.why, order: 0, layer: group === 'core' ? 0 : 1, ...extra};
  }
  const nodes = [
    node('user', 'User / accountable owner', 'User', 'core', [0, 23, 0],
      'Defines the supported business objective and retains approval and acceptance authority.',
      'The user provides the goal, constraints and preferences, confirms that the structured contract represents the intended problem, and approves its exact identity, revision and digest. Later, the authenticated owner accepts the immutable candidate and its evidence. These are separate decisions. A model cannot manufacture either approval. Missing, revoked, expired or mismatched authority blocks protected work.',
      ['Business objective and constraints', 'Contract for exact approval', 'Sealed candidate and current evidence for final acceptance'],
      ['Authenticated contract approval', 'Clarification or rejection', 'Acceptance bound to the exact candidate and evidence'], 'user', person,
      {order: 0, role: 'owner', aliases: ['Human owner', 'Business owner']}),
    node('contract', 'Contract Engine', 'Contract Engine', 'core', [0, 13, 0],
      'Turns a supported requirement into a versioned contract with explicit limits.',
      'Collect a structured contract C = (id, v, g, X, Y, P, T, B, τ, k, π). It states input and output schemas, permitted actions and resources, independently controlled non-empty tests, resource budget, deadlines, total candidate attempts and pinned policy/runtime/compiler/primitive/test versions. Clarify incomplete or inconsistent requirements before admission. Canonically serialise the exact contract; the authenticated approval handler binds identity, revision, digest, expiry and revocation status. A material revision ends the old run and requires new approval.',
      ['Supported business requirement', 'Trusted identity and policy decisions', 'Pinned schemas, tests and implementation versions'],
      ['Approved versioned contract C and approval A', 'NEEDS_CLARIFICATION_OR_UNSUPPORTED', 'NOT_APPROVED or NEEDS_NEW_APPROVAL'], 'brief',
      mapping(['lambda', 'dynamodb'], 'Use a reviewed Lambda handler for structured contracts and authenticated approval checks, with DynamoDB holding versioned contract status.',
        'Use a defined canonical serialisation and collision-resistant digest. Never accept approved:true from model output. Conditional updates reject stale contract revisions; authentication and authorisation must be implemented by trusted logic.'),
      {order: 1, journeyStep: 1, role: 'contract', aliases: ['Requirements and Contract Engine'], formula: 'ApprovedCurrent(C,A) = Auth(principal,C) ∧ A.id=C.id ∧ A.v=C.v ∧ A.hash=H(C) ∧ ¬revoked(A) ∧ now<A.expiry'}),
    node('core', 'Core Controller', 'Core Controller', 'core', [0, 0, 0],
      'Admits plans, dispatches bounded work, records evidence and alone commits release intent.',
      'Core is a deterministic state machine and the only component allowed to commit trusted run decisions. It pins an approved contract, admits and counts each whole candidate attempt before dispatch, requests a proposal, validates and pins that plan, authorises compilation, then invokes verification over the sealed candidate. Each dispatch rechecks approval, scope, run revision, deadline and reserved resources. Reproducible defects can enter at most the admitted repair budget. After current owner acceptance, Core atomically checks all six release conditions at one authoritative revision and commits a digest-bound intent. External delivery is later and requires an exact destination and confirmed receipt; an intent is not proof of delivery.',
      ['Approved current contract', 'Proposed plan and immutable candidate', 'Digest-bound evidence or defects', 'Authenticated owner acceptance'],
      ['Admitted plan and scoped dispatch', 'Bounded repair or explicit stop', 'Exact release intent and confirmed or unconfirmed handoff record'], 'graph',
      mapping(['stepfunctions', 'lambda', 'dynamodb'], 'Step Functions Standard coordinates waits and state transitions; reviewed Lambda guards and one authoritative DynamoDB run record enforce admission, resource accounting and release.',
        'Do not infer exactly-once external effects from orchestration semantics. A local conditional transaction cannot atomically perform an arbitrary external delivery. Unknown usage retains or conservatively settles its reservation. Unknown delivery remains DELIVERY_UNCONFIRMED.'),
      {order: 2, journeyStep: 2, role: 'controller', aliases: ['Core Control', 'Controller'], formula: 'G_release = ApprovedCurrent ∧ OwnerAcceptedCurrent ∧ FinalPassCurrent ∧ PICConformantCurrent ∧ EvidenceCurrent ∧ ReleaseAuthorised'}),
    node('plan', 'Workflow Builder', 'Workflow Builder', 'core', [-23, 0, 0],
      'Proposes a supported plan, then compiles only the plan Core has admitted.',
      'One worker performs controlled planning, compilation and packaging phases. A capped model call may propose W = (V,E,b,θ,o) using only the reviewed primitive registry and permitted parameters. Core checks acyclicity, ownership, binding, types, scope and required output coverage before compilation. The deterministic compiler binds the admitted plan to pinned reviewed primitives, runtime and PIC controls and seals an immutable candidate manifest. The model cannot supply executable Python, shell commands, new operators, credentials or additional permissions. The builder cannot edit authoritative tests, approve itself or send its candidate directly to the verifier.',
      ['Approved contract and bounded proposal request', 'Core-admitted pinned plan', 'Reviewed primitive registry, compiler, runtime and PIC bindings', 'Reproducible defects within a newly admitted repair attempt'],
      ['Untrusted proposal for Core admission', 'Sealed runnable candidate for Core', 'Explicit plan or compilation errors'], 'brief',
      mapping(['bedrock', 'lambda'], 'Use capped Bedrock inference for a restricted specification proposal and a reviewed Lambda compiler for deterministic packaging after Core admits the plan.',
        'The model is optional if deterministic templates cover the supported use case. Model output is data, never privileged executable code. Every failed plan or model call consumes a candidate attempt; lower-level retries must fit the same limits.'),
      {order: 3, journeyStep: 3, role: 'builder', aliases: ['Builder', 'Planning and compilation'], formula: 'W = Propose(C, Library); ValidPlan(W,C); M = Compile(admitted W, pinned runtime, PIC)'}),
    node('verify', 'Verifier', 'Verifier', 'core', [23, 0, 0],
      'Tests the exact sealed candidate using independently controlled checks and fixtures.',
      'Verification follows construction. The trusted verifier reads actual candidate bytes and checks their manifest, contract, runtime/compiler/primitive versions, PIC bindings and acceptance behaviour. It executes positive and negative tests from an independently controlled suite and fixtures, then returns run, attempt, candidate digest, contract hash, test hash, fixture hash, results and verifier identity to Core. Missing, failing, timed-out or unknown checks are not a final pass. Store evidence outside the hashed candidate subject, hash evidence separately and bind both in the release record. A verifier report supplies evidence, never release authority.',
      ['Core-dispatched sealed candidate', 'Exact contract and trusted tests', 'Fixed fixtures and pinned versions'],
      ['Digest-bound evidence record', 'Reproducible defects', 'Explicit failure, timeout or unknown result'], 'check',
      mapping(['lambda', 's3'], 'Run trusted bounded Lambda tests over exact immutable content and store verifier-owned evidence in separately permissioned S3 objects.',
        'The builder must not overwrite authoritative tests or evidence. Validate actual bytes, not a worker-supplied digest. Protect required object versions and bind candidate and evidence hashes separately. S3 versioning alone does not make a trusted verifier.'),
      {order: 4, journeyStep: 4, role: 'verifier', aliases: ['Verification and Evidence'], formula: 'Evidence.subject = Candidate.digest; E_v = (run, attempt, h_W, H(C), h_T, h_D, results, verifier_identity)'}),
    node('workflow', 'MOA Workflow Package', 'MOA Workflow', 'core', [0, -17, 0],
      'The authorised engineering output is a runnable governed package, not its business report.',
      'The handoff contains the runnable workflow specification, pinned reviewed runtime and components, operating contract, PIC bindings, current test evidence and release record. Core may release only the exact accepted candidate and evidence to the authorised destination. Delivery is confirmed only by a receipt matching that digest and destination. Running the child workflow is a separate action under its own operating contract and current authority. A resulting support-operations report is a domain outcome, not the MOA engineering package. The source does not define an expansion of the label MOA.',
      ['Exact authorised release intent', 'Immutable candidate and separately bound evidence', 'Approved handoff destination'],
      ['Confirmed package receipt or DELIVERY_UNCONFIRMED', 'Runnable reviewed specification and operating contract', 'Later domain output only under separate operating authority'], 'package',
      mapping(['s3', 'lambda'], 'Retain the version-pinned package and release evidence in S3. Reviewed Lambda-compatible operators can execute a separately authorised child specification.',
        'The package is an engineering artifact, not a generic cloud service. Packaging, release intent, confirmed delivery and child operation have distinct states. The initial child workflow reads approved synthetic input and emits a local report; it does not send messages, change accounts or make payments.'),
      {order: 5, role: 'output', aliases: ['MOA', 'MOA Workflow', 'Workflow package'], formula: 'Delivered ⇒ IntentCommitted ∧ ExactDigest ∧ ExactDestination ∧ ConfirmedReceipt'}),
    node('pic', 'Pattern Inheritance and Conformance', 'PIC library', 'pic', [-18, -17, 0],
      'One shared six-rule library supplies patterns, guards and tests across the foundation.',
      'PIC is mandatory shared library code, not a fifth autonomous agent. Admission selects the required six controls; the compiler inserts reviewed runtime bindings; the verifier checks those bindings and exercises positive and negative tests. Each pattern retains a trace from implementation to guard to test to evidence. Child tasks inherit current approval, owned decomposition, permission narrowing, current verification, bounded repair and release gating. Printing a rule in documentation is not enforcement.',
      ['Pinned six-rule control library', 'Contract and admitted workflow', 'Reviewed runtime and tests'],
      ['Admission and compiler bindings', 'Runtime guards', 'Verifier checks and auditable evidence trace'], 'check',
      mapping(['lambda', 's3'], 'Package the reviewed PIC implementation with Lambda-compatible compiler/runtime/test code, with pinned source artifacts in S3.',
        'PIC is custom shared code, not an AWS product or autonomous agent. Every rule must have an enforced guard and a negative test. A separate child operating contract may explicitly delegate pinned acceptance policy, but the model cannot invent that delegation.'),
      {order: 6, role: 'shared-library', aliases: ['Pattern Inheritance and Conformance', 'Shared PIC library'], formula: 'pattern → implementation → guard → test → evidence'}),
    node('foundation-artifacts', 'Version-pinned artifacts and evidence', 'Artifact store', 'services', [-18, -28, 0],
      'Separates candidate content, verifier evidence and release records.',
      'Store immutable references to candidate payload versions, then separately generated verifier evidence, then the release record binding both. Separate writer permissions, verify actual bytes and retain the required versions for review. Basic persisted contracts and run records support the bounded prototype; general restart recovery remains deferred and ambiguous interrupted runs stop for inspection.',
      ['Sealed candidate payloads', 'Verifier-owned evidence', 'Release records with exact bindings'], ['Version-pinned artifacts', 'Readable evidence trail', 'Protected references for exact-content checks'], 'package',
      mapping(['s3'], 'S3 holds the pinned content and evidence required for reproducible inspection.', 'Version references and protection need explicit policies. Do not place evidence inside its own test subject or confuse an evidence hash with the candidate hash.'), {order: 7, role: 'shared-service'}),
    node('foundation-iam', 'Scoped service identities', 'Scoped access', 'services', [0, -28, 0],
      'Separates builder, verifier and release powers at infrastructure boundaries.',
      'Give the authenticated operator and each component only the AWS actions and resources it needs. Builder infrastructure writes and approved model calls still require scoped platform authority. Prevent the builder from changing authoritative tests, verifier evidence or release state. The application permission intersection is a model for child actions; it is not a replacement for the full AWS IAM evaluation rules, including explicit denies.',
      ['Explicit component responsibilities', 'Allowed actions and resource boundaries', 'Trusted identity and policy context'], ['Scoped credentials and access decisions', 'Denied out-of-scope actions', 'Distinct evidence and release authorities'], 'check',
      mapping(['iam'], 'Use distinct narrowly scoped IAM roles and verify their effective access at real service boundaries.', 'Separate roles in a sandbox account are a limited prototype boundary. They do not imply administrator-resistant isolation or multi-account assurance.'), {order: 8, role: 'shared-service'}),
    node('foundation-observe', 'Operational records and measurements', 'Operational logs', 'services', [18, -28, 0],
      'Makes attempts, stops, latency and resource use inspectable.',
      'Record run and attempt IDs, transition outcomes, failure reasons, model calls/tokens, function durations, state transitions, storage/requests and logging use. Application budget admission accounts for bounded operations, failed attempts and hidden retries. Unknown usage keeps a reservation or is charged conservatively. Infrastructure costs, retained logs and storage also require measurement; billing alerts are not admission guards.',
      ['Transition and invocation records', 'Metered usage and timing', 'Failure and handoff status'], ['Operational logs and metrics', 'Cost and latency evidence', 'Explicit stop and uncertainty records'], 'review',
      mapping(['cloudwatch'], 'CloudWatch collects operational records and measurements keyed to the same run and attempt identities.', 'Avoid secrets and unnecessary input content in logs. Operational logs do not substitute for the independently trusted, digest-bound evidence used by release.'), {order: 9, role: 'shared-service'})
  ];
  const primitiveDefinitions = [
    ['read', 'ReadApprovedInput', 'Read input', 'Read only the approved, bounded synthetic input and enforce the input schema and size limit.', ['Authorised operating contract', 'Approved input reference'], ['Finite admitted input rows'], 'brief'],
    ['deduplicate', 'DeduplicateByID', 'Deduplicate', 'Collapse identical duplicate IDs; quarantine conflicting records sharing an ID. Never silently choose a conflicting value.', ['Admitted finite input rows'], ['Unique records', 'Explicit conflict quarantine'], 'history'],
    ['validate', 'ValidateFields', 'Validate', 'Validate required fields and exact monetary values using integer pence or exact decimals. Missing is not zero and negative refund amounts require data review.', ['Deduplicated records', 'Pinned schema and semantic preconditions'], ['Validated values', 'Explicit data-review reasons'], 'check'],
    ['route', 'RouteByApprovedRules', 'Route', 'Apply the approved priority: security review, invalid-amount data review, valid refunds above the threshold to human review, otherwise policy-eligible. Unknown request types go to review. Escape customer notes as display data; they do not alter policy or authority.', ['Validated records', 'Approved routing rules and threshold'], ['Exactly one outcome category per accepted unique record', 'Per-record reason'], 'graph'],
    ['aggregate', 'AggregateCounts', 'Count', 'Count accepted unique records once and reconcile the outcome categories. Failed dependencies block consumption rather than generating guessed counters.', ['Unique categorised records'], ['Reconciled category counts', 'Integrity findings'], 'review'],
    ['report', 'EmitLocalReport', 'Report', 'Emit the approved local report with exact categories, totals and reasons. This is a business output of the child workflow, not the engineered workflow package and not permission to make external business changes.', ['Reconciled counts', 'Escaped per-record reasons'], ['Local report', 'Current child-output evidence required by its operating policy'], 'package']
  ];
  primitiveDefinitions.forEach(([id, name, short, detail, inputs, outputs, icon], index) => {
    nodes.push(node(id, name, short, 'runtime', [-30 + index * 12, -40, 0], detail,
      `${detail} This is one reviewed deterministic operator in the restricted child workflow language. It executes only under a separately authorised operating contract, with a single accountable owner, valid dependencies and enforced scoped effects. No model-generated executable code is admitted.`, inputs, outputs, icon,
      mapping(['lambda'], 'Implement this primitive as reviewed bounded code in the pinned runtime, optionally deployed through Lambda for the AWS prototype.', 'The service does not establish the primitive semantics. Tests must establish preconditions, postconditions, invariant preservation and actual action-boundary enforcement.'),
      {order: 10 + index, layer: 2, role: 'reviewed-primitive', formula: 'I(s) ∧ Pre_f(s) ⇒ I(f(s)); Effects(b(t),θ_t) ⊆ P_t'}));
  });
  const edges = [];
  const edge = (id, from, to, label, details, extra = {}) => edges.push({id, from, to, source: from, target: to, label, name: label, details, purpose: details, status: 'Proposed guarded interface', ...extra});
  edge('F01', 'user', 'contract', 'Requirement and exact approval', 'The user states a supported business objective and approves the final contract identity, revision and canonical digest through trusted authenticated logic. Clarification can precede approval; an incomplete requirement is not admitted.');
  edge('F02', 'contract', 'core', 'Approved contract C', 'Pass the exact contract and current approval. Core independently rechecks authentication/policy, id, revision, digest, expiry and revocation before pinning a run.');
  edge('F03', 'core', 'plan', 'Request supported proposal', 'Before the bounded model or worker invocation, admit and increment a whole candidate attempt, reserve its bounded sub-operation usage and recheck current approval, scope and deadline. The initial attempt and every failed proposal consume the same finite allocation.');
  edge('F04', 'plan', 'core', 'Proposal W for admission', 'Return a proposed DAG and allowed parameters as untrusted data. Core verifies DAG, ownership, reviewed bindings, schema/semantic composition, scope and supported requirement coverage. No proposed plan can broaden the contract.');
  edge('F05', 'core', 'plan', 'Compile admitted plan', 'Only after successful deterministic admission may Core dispatch compilation against the exact pinned plan, primitives, compiler, runtime and PIC rules. A material contract change exits to a newly approved run.');
  edge('F06', 'plan', 'core', 'Sealed candidate M', 'Return the runnable specification and reviewed runtime package. Seal a manifest binding the contract, admitted plan, implementation versions and actual payload-file digests before verification.');
  edge('F07', 'core', 'verify', 'Test exact candidate', 'Core sends the exact sealed candidate to trusted tests and fixtures with bounded timeout and scoped credentials. Verification follows completed construction; the builder has no direct verification-dispatch authority.');
  edge('F08', 'verify', 'core', 'Evidence or defects', 'Return run/attempt identity, candidate digest, contract hash, trusted test/fixture hashes, result completeness and verifier identity. Missing, failing, timed-out and unknown checks block final pass. Reproducible defects may inform a newly admitted bounded repair.');
  edge('F09', 'user', 'core', 'Current owner acceptance', 'The authenticated human owner accepts the exact sealed candidate and current evidence. Rejection, timeout, expiry or a changed candidate blocks release. A successful model response or verifier report cannot substitute for this decision.');
  edge('F10', 'core', 'workflow', 'Guarded exact handoff', 'At one authoritative revision Core requires all six release checks and commits an intent binding the candidate, evidence, approval, owner acceptance and destination. The adapter rechecks intent and release authority before delivery. Mark DELIVERED only after a receipt confirms the exact digest and destination; otherwise retain DELIVERY_UNCONFIRMED. Child operation needs separate authority.');
  edge('F11', 'contract', 'user', 'Clarify before admission', 'An incomplete, inconsistent or unsupported requirement returns a reason to the user before a run is admitted. Material revisions require new approval and a new run.', {conditional: true});
  edge('F12', 'core', 'plan', 'Newly admitted bounded repair', 'Reproducible defects may enter a new whole candidate attempt only after admission rechecks authority, scope, remaining attempt allocation, deadline and resource reservations. Proposed k=2 allows one initial attempt and at most one repair. Exhausted or uncertain resources stop work.', {conditional: true});
  edge('F13', 'core', 'user', 'Request final acceptance', 'After current passing evidence, show the exact candidate and evidence to the authenticated owner and wait within a bounded deadline. No automatic acceptance is inferred.', {conditional: true});
  edge('F14', 'pic', 'core', 'Select inherited controls', 'Admission selects and pins all six PIC rules and checks they remain required throughout the run. PIC is a shared library, not an independent decision-maker.');
  edge('F15', 'pic', 'plan', 'Compile reviewed guard bindings', 'The deterministic compiler binds the fixed reviewed runtime controls to the admitted workflow. Written rules alone do not enforce them.');
  edge('F16', 'pic', 'verify', 'Check control conformance', 'Verify the implementation-to-guard-to-test-to-evidence trace and run positive and negative tests for all six inherited patterns.');
  edge('F17', 'pic', 'workflow', 'Inherit governed runtime', 'The delivered child runtime contains the pinned PIC bindings and operates only under its own separately approved contract and explicit acceptance delegation.');
  edge('F18', 'plan', 'foundation-artifacts', 'Store candidate content', 'Builder-scoped writes store candidate payload versions. The builder cannot rewrite verifier-owned evidence or release records.');
  edge('F19', 'verify', 'foundation-artifacts', 'Store trusted evidence', 'Write evidence separately from the already sealed candidate subject and bind it to actual candidate bytes and trusted tests.');
  edge('F20', 'core', 'foundation-artifacts', 'Bind release records', 'Record exact candidate and evidence references with approval, owner acceptance, destination, intent and receipt status. Persisted records do not imply general restart recovery.');
  for (const [index, target] of ['contract', 'core', 'plan', 'verify'].entries()) {
    edge(`F${21 + index}`, 'foundation-iam', target, 'Scoped service identity', 'Apply component-specific infrastructure permissions at every service boundary; enforce separation between proposal, evidence and release authority. Application permission sets do not replace the full IAM policy evaluator.');
    edge(`F${25 + index}`, target, 'foundation-observe', 'Record bounded operation', 'Record run/attempt IDs, durations, usage and failures without granting release authority to logs. Preserve explicit uncertainty for unknown usage or delivery.');
  }
  edge('F29', 'workflow', 'read', 'Separately authorised operation', 'Engineering delivery does not start child work automatically. Invoke the pinned reviewed runtime only after its own operating contract and authority are current. This path illustrates a supported example workflow, not an observed run.');
  for (let index = 0; index < primitiveDefinitions.length - 1; index++) {
    const current = primitiveDefinitions[index], next = primitiveDefinitions[index + 1];
    edge(`F${30 + index}`, current[0], next[0], 'Validated dependency', 'The predecessor postcondition must establish the successor precondition and stated invariant. Failed dependencies block their consumers. The generated workflow is a finite DAG; the engineering controller graph may contain bounded feedback.');
  }
  const rules = [
    {title: 'Approval binds the exact contract', formula: 'A.hash = H(C); ApprovedCurrent = Auth ∧ matching id/revision/hash ∧ not revoked ∧ not expired', explanation: 'Historical approval does not authorise a changed contract. A material revision requires new approval and a new run.', obligation: 'Trusted identity and policy checks, canonical serialisation and digest comparison must run before every protected dispatch and release.'},
    {title: 'Admit a supported workflow before compilation', formula: 'W = Propose(C, Library); ValidPlan = DAG ∧ Owned ∧ Bound ∧ Typed ∧ ScopeOK ∧ Covers; M = Compile(admitted W)', explanation: 'The proposal uses only reviewed operators and permitted parameters, with one owner per task and valid dependencies. Coverage is a supported requirement-to-template check, not an oracle for arbitrary intent.', obligation: 'Reject cycles, missing owners, disconnected tasks, undefined inputs, unsupported parameters, missing outputs and broadened permissions.'},
    {title: 'Task authority can only narrow', formula: 'P_t = P ∩ P_primitive(t) ∩ P_local(t); Effects(b(t),θ_t) ⊆ P_t; P_W = ⋃ P_t ⊆ P', explanation: 'Set intersection and union establish the permission inclusion in the specified model. The child workflow cannot acquire authority outside the approved parent set.', obligation: 'Every real effect path must go through the reviewed enforcement boundary. Broader credentials or bypass paths invalidate the premise. This is not the full AWS IAM evaluation model.'},
    {title: 'Evidence binds the exact tested content', formula: 'Evidence.subject = Candidate.digest; E_v = (run,attempt,h_W,H(C),h_T,h_D,results,verifier_identity)', explanation: 'Seal the workflow manifest first, create verifier evidence second and bind their separate hashes in release. A changed payload, parameter, contract or implementation version invalidates old evidence.', obligation: 'Hash actual bytes with defined canonicalisation, protect immutable versions, trust the verifier/test source and atomically recheck current state at release.'},
    {title: 'Release requires every check', formula: 'G_release = ApprovedCurrent ∧ OwnerAcceptedCurrent ∧ FinalPassCurrent ∧ PICConformantCurrent ∧ EvidenceCurrent ∧ ReleaseAuthorised', explanation: 'Only Core can commit a release intent, at one authoritative revision, after all six checks hold. Handoff intent and successful external delivery are different states.', obligation: 'Bind candidate, evidence, acceptance, approval and destination. Recheck release authority at adapter invocation; require an exact digest/destination receipt for DELIVERED.'},
    {title: 'Reserve before spending', formula: 'spent + reserved ≤ B; reserve r only if spent + reserved + r ≤ B; spent′=spent+q, reserved′=reserved-r, 0≤q≤r', explanation: 'If reservations cover actual bounded usage, each settlement preserves the application accounting invariant. Failed attempts and lower-level retries are included.', obligation: 'Unknown usage retains a reservation or is charged conservatively. This is an application resource bound, not a guaranteed ceiling on all AWS storage, logging or infrastructure charges.'},
    {title: 'Repair and waits are finite', formula: 'attempts_started ≤ k; proposed k=2; T_run ≤ τ_intake + τ_approval + kτ_attempt + τ_owner + τ_handoff', explanation: 'Increment the global candidate counter before any worker call. Each attempt, wait and handoff has an enforced deadline; the output is delivery or an explicit stop/unconfirmed state.', obligation: 'Include SDK/orchestration retries, bounded scheduling overhead and effective timeouts. Stopping orchestration does not prove a remote call was cancelled or uncharged.'}
  ];
  const picRules = [
    {title: 'Current approval', guard: 'Engineering dispatch and child operation require approval for their respective exact contracts.', test: 'Change the approved contract and verify that protected work is blocked.'},
    {title: 'Owned decomposition', guard: 'Every child task has exactly one accountable owner and a valid dependency position.', test: 'Remove an owner or introduce a cycle and reject admission.'},
    {title: 'Permission narrowing', guard: 'Reviewed operators execute only actions and resources in the intersected permitted scope.', test: 'Request an unapproved action or input and deny it at the runtime boundary.'},
    {title: 'Current verification', guard: 'Trusted digest-bound checks must cover the exact candidate or output currently being accepted.', test: 'Modify a candidate after testing and reject the old evidence.'},
    {title: 'Bounded repair', guard: 'Attempt count, deadline and resource reservation are checked before dispatch.', test: 'Exhaust the allocation and confirm that no further worker invocation occurs.'},
    {title: 'Release gating', guard: 'Core requires current approval, owner acceptance, final pass, PIC, evidence and release authority.', test: 'Remove any required release condition and block handoff intent.'}
  ];
  const releaseChecks = ['Current approval', 'Current human owner acceptance', 'Current final pass', 'Current PIC conformance', 'Current evidence', 'Release authority'];
  const algorithm = `ENGINEER(requirement, authenticated_user):
  C := create_supported_contract(requirement)
  if incomplete, inconsistent or unsupported: return NEEDS_CLARIFICATION_OR_UNSUPPORTED
  A := await_authenticated_exact_approval(C, bounded_deadline)
  if not ApprovedCurrent(C,A): return NOT_APPROVED
  run := Core.admit_and_pin(C,A)
  defects := none

  for attempt in 1 .. C.max_candidate_attempts:
    if not Core.admit_attempt_and_reserve_all_bounded_work(run,attempt): return STOPPED
    # Count the attempt BEFORE any invocation; failed proposals consume it.
    proposal := Core.invoke_scoped(Builder.propose_supported_plan,C,defects)
    if unavailable_or_invalid(proposal): record_failure_and_settle_usage; defects := reproducible_plan_errors; continue
    plan := Core.validate_and_pin_plan(proposal,C)
    if material_contract_change(plan): return NEEDS_NEW_APPROVAL
    if rejected(plan): record_failure_and_settle_usage; defects := admission_errors; continue
    candidate := Core.invoke_scoped(Builder.compile_and_package,plan,pinned_runtime,PIC)
    candidate := seal_exact_content(candidate)
    evidence := Core.invoke_scoped(Verifier.check,candidate,C,trusted_tests,fixed_fixtures)
    Core.record_evidence_and_settle_usage(candidate,evidence)
    if not evidence_is_current_and_passing: defects := reproducible_errors; continue
    acceptance := await_authenticated_owner_acceptance(candidate,evidence,bounded_deadline)
    if not current(acceptance): return OWNER_REJECTED_OR_TIMED_OUT
    intent := Core.commit_release_intent_atomically(
      expected_run_revision,all_six_release_checks,exact_candidate_hash,
      exact_evidence_hash,acceptance,approved_destination,stable_handoff_key)
    if rejected(intent): return RELEASE_BLOCKED
    # Reserve metered handoff work and recheck current intent/release authority.
    receipt := deliver_exact_authorised_package(intent,bounded_timeout)
    if receipt.confirms(intent.digest,intent.destination): return DELIVERED
    return DELIVERY_UNCONFIRMED

  return ATTEMPT_LIMIT_REACHED

# Every scoped invocation rechecks authority, run status, scope, deadline and budget.
# Unexpected exceptions stop explicitly; unknown usage is not settled as zero.
# Child operation requires a separate current operating contract and authority.`;
  const states = ['DRAFT', 'AWAITING_APPROVAL', 'ADMITTED', 'BUILDING', 'VERIFYING', 'AWAITING_OWNER_ACCEPTANCE', 'RELEASE_INTENT', 'DELIVERED'];
  const exits = ['NEEDS_CLARIFICATION_OR_UNSUPPORTED', 'NOT_APPROVED', 'UNSUPPORTED', 'NEEDS_NEW_APPROVAL', 'STOPPED', 'OWNER_REJECTED_OR_TIMED_OUT', 'RELEASE_BLOCKED', 'ATTEMPT_LIMIT_REACHED', 'DELIVERY_UNCONFIRMED'];
  const propositions = [
    {title: 'Authority cannot expand', claim: 'Each intersected P_t is a subset of P, so the union P_W is also a subset of P.', assumptions: 'Actual effects must be constrained to these sets by every reviewed runtime path. Bypass permissions violate the premise.'},
    {title: 'Composition preserves a stated invariant', claim: 'If every reviewed primitive preserves I when its precondition holds, and predecessor postconditions establish successor preconditions, induction over a finite DAG topological order preserves I on every accepted step.', assumptions: 'Initial I holds; primitive implementations and joins satisfy their contracts; failed dependencies block consumers. Matching schemas alone do not prove business semantics.'},
    {title: 'Stale evidence cannot release changed content', claim: 'Changing bound content changes the sealed manifest digest except under collision or broken integrity; EvidenceCurrent fails and the release conjunction cannot hold.', assumptions: 'Defined canonicalisation, collision-resistant hashes, actual-byte verification, trusted evidence, immutable versions and atomic current-state checks. Hashes bind content; they do not prove verifier honesty.'},
    {title: 'Resource admission preserves its accounting budget', claim: 'If a reservation satisfies spent+reserved+r≤B and actual usage is 0≤q≤r, settlement produces spent′+reserved′=spent+reserved+q-r≤B.', assumptions: 'Reservations cover actual bounded work and retries; unknown usage is retained or conservatively charged. This does not cap every part of a cloud bill.'},
    {title: 'An admitted run cannot repair forever', claim: 'The decreasing quantity k-attempts_started and bounded waits yield delivery or an explicit stop/unconfirmed state within the stated conditional time bound.', assumptions: 'Finite task and fixture sets, effective deadlines, counted lower-level retries and bounded controller overhead. Termination does not guarantee successful delivery or cancellation of remote charges.'}
  ];
  const example = {
    title: 'Support Operations Workflow',
    summary: 'Compile a supported requirement into a governed workflow that deduplicates synthetic requests, validates amounts, routes cases, calculates counters and reports a reason. It sends no messages, changes no accounts and executes no payments. These are derived expectations, not measured results.',
    stages: primitiveDefinitions.map(item => item[1]),
    rows: [
      {id: 'R1', input: 'Refund £40; identical row appears twice', category: 'Policy-eligible, counted once'},
      {id: 'R2', input: 'Refund £150', category: 'Human review'},
      {id: 'R3', input: 'Refund with missing amount', category: 'Data review'},
      {id: 'S1', input: 'Security request', category: 'Security review'},
      {id: 'R4', input: 'Refund £100; customer note tries to override the rules', category: 'Policy-eligible under the numeric rule; note has no authority'},
      {id: 'R5', input: 'Refund £100.01', category: 'Human review'},
      {id: 'R6', input: 'Refund -£5', category: 'Data review'}
    ],
    reconciliation: 'At the approved £100 threshold: 8 input rows produce 7 unique records = 2 policy-eligible + 2 human review + 2 data review + 1 security review.',
    invariant: 'Every counted record has a unique validated ID and exactly one outcome category. Identical duplicates collapse; conflicting duplicates are quarantined.',
    variant: 'A separately approved £50 threshold changes R4 to human review. The contract and candidate digests change and old approval and evidence must be rejected. Expected totals become 1 policy-eligible + 3 human review + 2 data review + 1 security review = 7.',
    dataBoundary: 'Customer notes are escaped display data and never routing-policy instructions or executable code. This restriction is not a universal prompt-injection defence.'
  };
  const tests = [
    {name: 'Supported happy path', expected: 'Approved contract produces a runnable package and a confirmed exact handoff.'},
    {name: 'Missing, revoked or expired approval', expected: 'Protected dispatch and release are denied.'},
    {name: 'Contract changed after approval', expected: 'Require new approval and prevent protected work under the old run.'},
    {name: 'Cycle, missing owner or unsupported operator', expected: 'Reject the plan before construction admission.'},
    {name: 'Forbidden resource or action', expected: 'Deny at the real runtime boundary, not only in a warning.'},
    {name: 'Candidate changed after testing', expected: 'Old evidence cannot authorise release.'},
    {name: 'Missing, failing or timed-out test', expected: 'No current final pass.'},
    {name: 'Attempt limit exhausted', expected: 'No extra invocation, including hidden lower-level retries.'},
    {name: 'Concurrent stale release request', expected: 'At most one matching logical intent; reject the stale revision.'},
    {name: 'Duplicate or uncertain delivery', expected: 'Use stable identity and explicit uncertainty; never invent success.'},
    {name: 'Synthetic business edge cases', expected: 'Exact categories, deduplicated counts and reconciliation match the approved policy.'},
    {name: 'Second contract variant', expected: 'Rebuild with fresh approval and evidence; reject stale acceptance.'}
  ];
  const scope = ['Four internal components: Contract Engine, Core Controller, Workflow Builder and Verifier.', 'Six inherited PIC controls in one shared reviewed library.', 'One supported workflow family and six pinned deterministic operators.', 'A proposed maximum of two whole candidate attempts, with explicit deadlines and resource reservations.', 'Authenticated approval and owner acceptance, scoped infrastructure access, persisted contracts/run records and durable evidence.', 'A runnable package with separately authorised child operation, exact release intent and confirmed or explicitly unconfirmed delivery.'];
  const deferred = ['Autonomous learning', 'Semantic cross-session memory', 'Specialist swarms', 'Automatic tool creation', 'Distributed worker pools', 'General restart and multi-region recovery', 'Multi-account enterprise isolation', 'Public application exposure and additional landing pages'];
  const provenance = [
    {title: 'Agentic Core - Foundational Mathematical Algorithm', version: '0.1, 10 October 2026', sha256: 'E1F73170C8DB16093E13FB12C067EBCACA23CB442008319B6C01DB2DC98608C3', sections: 'Engineering content from sections 2 through 10: four-component design, bounded language, mathematical objects, PIC, algorithm, conditional propositions, synthetic example, AWS mapping and defined acceptance tests.'},
    {title: 'Agentic Core - User to MOA Architecture', version: 'Supplied diagram, 10 October 2026', sha256: '74EA0455E8811C7A1C0F86C1668666C0FD9AE4F94C6A30A147CC1CB4147752A1', sections: 'Visual arrangement and small AWS mapping: user, contract, controller-mediated builder and verifier, output package, shared PIC and services.'}
  ];
  window.SAWFoundationData = {
    id: 'agentic-core', version: 'agentic-core-foundation-v0.1', title: 'Agentic Core',
    groups: [{id: 'core', label: 'Core Architecture'}, {id: 'pic', label: 'PIC controls'}, {id: 'runtime', label: 'Child workflow'}, {id: 'services', label: 'Shared services'}],
    nodes, edges, journey: ['user', 'contract', 'core', 'plan', 'verify', 'workflow'],
    presentation: {
      layout: 'foundation', kicker: 'USER TO MOA WORKFLOW', title: 'One approved requirement. One governed workflow.',
      summary: 'Four internal components turn a supported contract into a reviewed, runnable workflow package with bounded work and exact-content evidence.',
      journey: ['user', 'contract', 'core', 'plan', 'verify', 'workflow'], journeyEdges: ['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10'],
      disclosure: 'Proposed foundation design and conditional mathematical derivations. The diagram does not demonstrate an implemented engine, passing workflow tests or AWS deployment.',
      output: 'MOA package: runnable specification, pinned reviewed runtime, operating contract, PIC bindings, evidence and release record.',
      stages: [{title: 'Approve', nodes: ['user', 'contract']}, {title: 'Admit and build', nodes: ['core', 'plan']}, {title: 'Verify and accept', nodes: ['verify', 'user']}, {title: 'Authorise handoff', nodes: ['workflow']}]
    },
    overview: {
      title: 'Agentic Core: User to MOA Workflow', summary: 'An approved business requirement becomes a runnable, governed workflow package through four internal components and a shared six-rule PIC library.',
      current: 'This page is a source-backed reference design based on the supplied foundation v0.1. The mathematical propositions are conditional on explicit implementation assumptions. No generated workflow execution, passing acceptance pack or AWS deployment is claimed.',
      approach: 'Read the engineering flow through Core: exact contract approval, proposed plan admission, admitted construction, sealed candidate verification, current human acceptance and guarded exact handoff. The generated child workflow is a finite DAG; the controller may contain clarification and bounded repair feedback.',
      workflow: [
        {title: '1. Define and approve the contract', detail: 'The authenticated user confirms the supported objective and approves the exact contract identity, revision, digest, permissions, tests and limits.', nodes: ['user', 'contract']},
        {title: '2. Admit a bounded candidate attempt', detail: 'Core counts the attempt and reserves all its bounded work before asking the builder for a proposal. Proposed k=2 means an initial attempt and at most one repair.', nodes: ['core', 'plan']},
        {title: '3. Validate, compile and seal', detail: 'Core admits only a reviewed-primitive plan with valid ownership, dependency and scope checks. The builder compiles that exact plan and returns immutable content.', nodes: ['core', 'plan']},
        {title: '4. Verify the exact candidate', detail: 'Core invokes independently controlled tests and fixtures after construction. The verifier returns digest-bound evidence or reproducible defects, never release authority.', nodes: ['core', 'verify']},
        {title: '5. Accept and authorise handoff', detail: 'The human owner accepts the exact package. Core requires all six release conditions and commits an intent at one authoritative revision.', nodes: ['user', 'core']},
        {title: '6. Confirm delivery; authorise operation separately', detail: 'A matching digest and destination receipt confirms delivery. The child workflow needs its own current operating contract; its eventual report is not the engineered package.', nodes: ['workflow']}
      ],
      aws: 'Proposed small AWS implementation: Lambda and DynamoDB for contracts; Step Functions Standard, Lambda guards and DynamoDB for Core; capped Bedrock inference and a Lambda compiler for the builder; trusted Lambda tests and S3 evidence for verification. S3 holds pinned artifacts, IAM separates scoped service identities and CloudWatch records operations. Begin with an authenticated operator/CLI. Select an AWS Region, available model and measured cost assumptions before deployment.',
      failures: ['Incomplete or unsupported requirement: clarify before admission.', 'Absent, changed, revoked or expired authority: block protected dispatch and require current approval.', 'Invalid proposal or failed compilation: record a consumed attempt and reproducible defects.', 'Missing, failing, timed-out or mismatched evidence: no final pass and no release.', 'Attempt, deadline or reserved-resource limit reached: stop without hidden retries.', 'Owner rejects or times out: stop without release intent.', 'Stale authoritative revision or absent release condition: reject intent.', 'Ambiguous handoff or interrupted run: preserve uncertainty and stop for inspection.'],
      boundaries: ['Only four internal components; the human owner, output artifact and shared services are separate responsibilities.', 'PIC is a mandatory shared library, not an autonomous agent.', 'Model output is an untrusted restricted specification, never executable source code or authority.', 'Basic persistence is included; general restart recovery and the scaled reference subsystems remain deferred.', 'Proposed acceptance tests and derived example expectations are not measured passing results.', 'The existing Agentic Core Scaled reference remains a separate larger architecture.'],
      operational: [
        {title: 'Trusted ownership and scope', detail: 'Authenticate exact decisions, separate builder/test/release permissions and audit every effect path.'},
        {title: 'Finite work and accounting', detail: 'Reserve before invocation, count failed calls and retries, enforce timeouts and preserve unknown usage conservatively.'},
        {title: 'Evidence and delivery', detail: 'Bind actual candidate bytes, trusted tests and fixtures; commit current intent atomically and verify the external receipt separately.'},
        {title: 'Cost and performance', detail: 'Measure inference, orchestration, compute, storage/requests, logs and other infrastructure. Declare Region and pricing units before quoting cost. Compare latency, unsafe releases, appropriate blocks and human corrections using the same resource allowance.'}
      ],
      vision: 'Demonstrate a small reusable engineering core that preserves approved constraints while compiling supported requirements into runnable workflows with an inspectable evidence trail.'
    },
    foundation: {version: '0.1', status: 'Proposed design and conditional derivations', rules, picRules, releaseChecks, algorithm, states, exits, propositions, example, tests, scope, deferred, provenance,
      testStatus: 'Defined acceptance tests; not passing execution results.',
      contract: {formula: 'C = (id,v,g,X,Y,P,T,B,τ,k,π)', approval: 'A = (principal,id,v,H(C),expiry,revocation_status)', candidateAttempts: 2, fields: ['Identity and revision', 'Business goal', 'Input/output schemas and input limits', 'Allowed actions/resources', 'Independent non-empty acceptance tests', 'Application resource budget', 'Explicit deadlines', 'Maximum whole candidate attempts', 'Pinned policy, primitives, compiler, runtime and tests']},
      stateTransitions: [{from: 'VERIFYING', to: 'BUILDING', condition: 'Only a newly admitted bounded repair.'}, {from: 'AWAITING_OWNER_ACCEPTANCE', to: 'RELEASE_INTENT', condition: 'All six current release checks at one authoritative revision.'}, {from: 'RELEASE_INTENT', to: 'DELIVERED', condition: 'Exact digest and destination confirmed by receipt.'}],
      comparison: 'Evaluate the actual candidate using held-out cases and an independent harness against a structured single-model baseline and a deterministic template-only baseline with the same declared total resources. Report whole-workflow pass rate, unsafe releases, appropriate blocks, latency, cost and human corrections. A system that blocks everything is not successful.',
      costModel: 'Cost_run = Cost_inference + Cost_orchestration + Cost_compute + Cost_storage/requests + Cost_logs + Cost_other'
    },
    evidence: {scope: 'User-supplied engineering reference data. Design content and conditional expectations are not runtime or deployment evidence.', provenance, awsSources: Object.entries(docs).map(([id, url]) => ({id, url})), iconSource: {url: 'https://aws.amazon.com/architecture/icons/', note: 'Existing official AWS service SVG assets are used unchanged. Neutral reference symbols describe responsibilities.'}}
  };
})();
