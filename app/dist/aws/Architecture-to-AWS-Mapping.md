# Agentic Core | AWS Enterprise System Design Architecture

**Proposed reference design; no AWS infrastructure has been deployed by this deliverable.** Reviewed 6 October 2026. Costs are excluded.

Source: Reference Architecture schema version 1.0.0; current source snapshot includes **35 capabilities, 68 typed interfaces and five optional modules**. Source SHA-256: `6a00568419c9d4fd2d4ceccac30fe0b6b45737aabb78ba00210609f095fa97af`. Deployment/supporting services do not introduce new AC responsibilities.

## Enterprise placement and source fidelity

The diagram depicts one selected environment. Repeat the same deployment template in isolated Dev, Preprod and Prod accounts; do not share runtime state, credentials, keys, approval records or semantic-memory namespaces across them. This reuse is infrastructure automation, not shared business authority.

Regional managed services sit outside customer VPC/subnet boxes. The Build and Assurance job networks each contain private subnets in at least two AZs. A job runs in one AZ at a time and may be scheduled/relaunched in an eligible subnet; it is not a synchronously replicated task. Planning Runtime remains managed compute with separately configured network connectivity where needed. Lambda functions also run in Lambda-owned managed VPCs; any customer-subnet placement represents an attached Hyperplane ENI, not the function host. Fargate test jobs and managed Lambda validation facets must be depicted separately.

Security, Log Archive and platform delivery are distinct foundation-account roles. They support the application and do not replace Core/PIC/Verification/Release. Foundation-account summaries are not claims that every service is co-located in one shared account. IAM/STS/Organizations are account/organization authority facets, not Region-hosted application servers.

## Exact capability map

| Source ID / capability | Original responsibility | Deployment / trust placement | Selected AWS services | Why / limitation | Relevant interfaces |
|---|---|---|---|---|---|
| user — User / Business Requirement | Define the business objective and approve a specific contract revision. | External authorised stakeholder; authenticated Control intake | Amazon Cognito; Amazon API Gateway; AWS Lambda; Amazon DynamoDB | Separates authenticated identity from permission to approve this business change. Identity integration does not determine business authority; organisational rules remain custom. | I001, I002, I003, I038, I042 |
| contract — Requirements & Contract Engine | Convert requirements into a versioned, reviewable engineering contract. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); AWS Step Functions Standard | Makes invariants, budgets, permissions and acceptance obligations inspectable before engineering. A schema-valid document can still be ambiguous; stakeholder review remains necessary. | I001, I002, I003, I004, I020 |
| core — Core Control Plane | Own trusted run state, guarded transitions, dispatch and authority checks. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Step Functions Standard; AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3) | Workers cannot directly dispatch themselves or change acceptance state. Workflow history helps auditing but does not prove business correctness. | I004, I005, I008, I009, I012, I016, I017, I019, I021, I031, I040, I051, I053, I054, I055, I056, I064, I065, I066 |
| plan — Orchestration & Planning Engine | Decompose the contract into a dependency DAG with one accountable owner per work unit. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon Bedrock AgentCore Runtime; Amazon Bedrock; Amazon Bedrock Guardrails; AWS Lambda; Amazon Simple Storage Service (Amazon S3) | Reasoning produces proposals while deterministic Core admission determines executable plans. Guardrails can filter model content; they cannot prove acyclicity, ownership or authority. | I005, I006, I027, I028, I058, I059, I064 |
| pic — PIC Kernel | Select, specialise and check Pattern Inheritance & Conformance obligations for the planned domain workflow. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3) | Connects every required pattern to a child component, a guard, a test and current evidence. Schema conformance alone cannot establish that generated guards execute correctly. | I006, I007, I011, I015, I065 |
| cap — Capability & Skill Registry | Bind each planned task to compatible, qualified capability versions. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); AWS Lambda | Qualified existing skills and accountable task owners are baseline Core requirements. Search convenience is secondary to complete compatibility and qualification checks. | I007, I008, I044, I046 |
| exec — Execution Layer | Perform bounded sequential or parallel work and emit artifacts with provenance. | Build account; private Fargate job pool in either eligible AZ subnet | Amazon Bedrock AgentCore Runtime; Amazon Elastic Container Service (Amazon ECS); AWS Fargate; Amazon Simple Storage Service (Amazon S3) | Separates model reasoning from build execution and trusted acceptance. Compute isolation requires explicit IAM, network and filesystem controls; managed runtime alone is insufficient. | I009, I010, I019, I022, I047, I060, I061 |
| verify — Verification & Evidence Layer | Check candidate outputs, provenance and required tests against the current task contract. | Assurance account; separate private job pool in either eligible AZ subnet | Amazon Elastic Container Service (Amazon ECS); AWS Fargate; AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3) | Acceptance requires both accountable owner approval and current reproducible test evidence. Passing tests support stated criteria, not complete correctness of arbitrary generated code. | I010, I011, I012, I013, I023, I034, I050, I062, I063, I066 |
| integrate — Integration Engine | Compose accepted components and resolve interface contracts into a candidate workflow. | Build account; private Fargate job pool in either eligible AZ subnet | Amazon Elastic Container Service (Amazon ECS); AWS Fargate; Amazon Simple Storage Service (Amazon S3); AWS Lambda | Individual task success does not establish compatible end-to-end interfaces. Container orchestration does not determine dependency correctness; custom digest validation is required. | I013, I014 |
| final — Final Validation & Release Gate | Validate the integrated system against the approved contract and PIC obligations. | Assurance account; separate private job pool in either eligible AZ subnet | Amazon Elastic Container Service (Amazon ECS); AWS Fargate; AWS Lambda; AWS Key Management Service (AWS KMS); Amazon Simple Storage Service (Amazon S3) | Whole-system requirements need a gate beyond local task acceptance. A cryptographic signature authenticates an attestation; it cannot make its assertions true. | I014, I015, I016 |
| release — Release Controller | Atomically record authority and release intent for the exact attested package, then deliver with idempotency and receipt reconciliation. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); AWS Key Management Service (AWS KMS) | Prevents a different artifact being delivered after successful validation. Database commit and external delivery are not one transaction; reconciliation remains necessary. | I017, I018 |
| workflow — MOA Workflow | Receive a domain-specific workflow with inherited guards, tests and an operating contract. | Separate consumer/target account; target operating authority | AWS Step Functions Standard; Amazon Bedrock AgentCore Runtime; AWS Lambda; Amazon Elastic Container Service (Amazon ECS); AWS Fargate | PIC preserves required governing patterns rather than identical agent counts. A valid engineering package still needs separately authorised domain execution and measured capacity. | I018, I032, I033 |
| mem — Scoped Memory Controller | Coordinate authorised record writes and context reads across run boundaries. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); Amazon Bedrock AgentCore Memory | Separates governed continuity from the AWS profile’s baseline operational run persistence. Contextual relevance does not prove provenance, consent or current acceptance. | I020, I021, I022, I023, I024, I027, I029, I032, I067 |
| store — Durable State Store | Persist versioned records and checkpoints with atomic write semantics. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); AWS Key Management Service (AWS KMS) | Restoration needs complete, current checkpoints rather than partially persisted records. S3 versioning alone is not immutability; deny overwrites/deletion and apply suitable retention controls. | I025, I026, I030 |
| scope — Provenance & Scope Enforcement | Validate record source, purpose, identity and allowed use before memory access. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; AWS IAM; Amazon DynamoDB; AWS CloudTrail | Semantic memory queries alone cannot prevent scope leakage. IAM resource permissions need custom project/purpose checks; neither replaces the other. | I024, I025 |
| retrieve — Retrieval Interface | Retrieve relevant authorised history with source references for current context. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); Amazon Bedrock AgentCore Memory | Useful history may inform reasoning without becoming current execution evidence. Semantic ranking can omit relevant history; report source scope and retrieval limitations. | I026, I028, I068 |
| checkpoint — Checkpoint & Restoration Interface | Commit consistent run snapshots and restore only after authority and version revalidation. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); AWS Step Functions Standard | Durable snapshots do not themselves authorise new effects. A workflow service resume facility still requires business reconciliation and current permission checks. | I029, I030, I031 |
| outcomes — Outcome Capture | Collect domain and engineering outcomes with provenance and consent. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon EventBridge; AWS Lambda; Amazon Simple Storage Service (Amazon S3); Amazon DynamoDB | Improvement analysis needs traceable observations rather than anecdotal success claims. Event delivery can duplicate or reorder observations; custom deduplication is necessary. | I033, I034, I035, I041 |
| candidate — Candidate Improvement | Propose a bounded change to a pattern, policy or capability configuration. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon Bedrock AgentCore Runtime; Amazon Bedrock; Amazon Bedrock Guardrails; Amazon Simple Storage Service (Amazon S3) | Exploration remains separate from promotion and active execution. Model plausibility does not establish invariant preservation or empirical improvement. | I035, I036 |
| evaluate — Evaluation | Evaluate the candidate on held-out domain cases, invariant checks and regressions. | Assurance account; separate private job pool in either eligible AZ subnet | Amazon Elastic Container Service (Amazon ECS); AWS Fargate; Amazon Simple Storage Service (Amazon S3); AWS Lambda | Separate measured eligibility from authorised promotion. Empirical results apply to the evaluated distribution; they do not guarantee unseen performance. | I036, I037 |
| promote — Authorised Promotion Gate | Admit an evaluated, authorised candidate as an eligible future version. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); AWS AppConfig; AWS Step Functions Standard | Passing evaluation alone cannot authorise operational change. AppConfig rollout controls do not implement AC’s candidate conformance or approval predicates. | I037, I038, I039 |
| versions — Version Registry | Publish immutable eligible versions and bind new runs to an explicit version set. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); AWS AppConfig; AWS Lambda | A running workflow must remain reproducible after a new version becomes available. Auto-refreshing configuration would violate run pinning unless defaults are resolved once at admission. | I039, I040, I043, I067, I068 |
| rollback — Rollback Controller | Restore the future-run default to an earlier eligible version after monitored regression. | Engineering Control account; regional managed services / restricted logical responsibility | AWS AppConfig; AWS Lambda; Amazon DynamoDB; Amazon CloudWatch | A monitored regression must not rewrite active workflow pins or historical evidence. Automatic configuration rollback addresses monitored signals only; false alarms and unmeasured regressions remain possible. | I041, I042, I043 |
| need — Capability Requirement | Describe a missing tool capability as an explicit engineering requirement. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3) | An unavailable tool must block affected work instead of encouraging improvised credentials. Adapter development introduces new effects and qualification work; it is not mandatory for already-bound baseline tasks. | I044, I045 |
| adapters — Tool / Adapter Registry | Register reviewed adapter versions, effect schemas and qualification results. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3); Amazon Bedrock AgentCore Gateway; AWS Lambda; Amazon Elastic Container Registry (Amazon ECR) | Optional onboarding adds mediated tools without replacing the Core qualified capability registry. A discoverable Gateway target is not automatically qualified or authorised for a task. | I045, I046 |
| boundary — Permission Boundary | Narrow invocation authority using run scope, task scope and adapter policy. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; AWS IAM; Amazon Bedrock AgentCore Policy; Amazon Bedrock AgentCore Identity | Managed tool authorisation supplements rather than replaces contract, budget and artifact predicates. Policy authoring and credential mediation still require validated mappings and least-privilege target permissions. | I047, I048 |
| gateway — Execution Gateway | Enforce bounded external effects through approved adapters. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon Bedrock AgentCore Gateway; Amazon Bedrock AgentCore Policy; Amazon Bedrock AgentCore Identity; AWS Lambda | External effects require a validated schema, a reserved budget and a qualified adapter binding. A tool response or timeout does not establish that the requested effect happened exactly once. | I048, I049 |
| effect — Effect Validation | Validate observed side effects against the requested effect and task evidence. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Lambda; Amazon DynamoDB; Amazon Simple Storage Service (Amazon S3) | A transport receipt may show delivery while the business change remains incomplete. Some targets cannot expose atomic read-back; explicitly document uncertainty and escalation. | I049, I050 |
| queue — Admission & Scheduling | Admit runnable work under global capacity, per-run limits and fairness policy. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon Simple Queue Service (Amazon SQS); Amazon DynamoDB; AWS Lambda; AWS Step Functions Standard | Queue availability cannot bypass dependencies, permission checks or shared run limits. SQS redelivery and ordering require idempotent envelopes; a queue alone proves no fairness. | I051, I052, I057 |
| leases — Lease & Fencing Manager | Issue attempt leases and monotonic fencing tokens for admitted workers. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon DynamoDB; AWS Lambda; Amazon Simple Queue Service (Amazon SQS) | A timed-out worker must not overwrite results from its replacement. Lease expiration is insufficient without fencing at every protected commit and applicable adapter. | I052, I053 |
| retry — Bounded Repair Controller | Convert failures into bounded repair, reconciliation, escalation or termination. | Engineering Control account; regional managed services / restricted logical responsibility | AWS Step Functions Standard; AWS Lambda; Amazon DynamoDB; Amazon Simple Queue Service (Amazon SQS) | Repair must consume the same constrained authority and budget as original work. Finite retry count alone does not prove termination of arbitrary worker code. | I054, I055 |
| observe — Observability & Capacity | Measure latency, utilisation, failures and queueing without granting control authority. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon CloudWatch; AWS CloudTrail; Amazon Simple Storage Service (Amazon S3); Amazon Bedrock AgentCore Observability | Capacity and failure claims need measured workload evidence. Service logs do not automatically capture domain correctness or every external side effect. | I056, I057 |
| domain — Domain Specification Specialists | Supply domain constraints and acceptance scenarios as reviewable planning advice. | Engineering Control account; regional managed services / restricted logical responsibility | Amazon Bedrock AgentCore Runtime; Amazon Bedrock; Amazon Bedrock Guardrails; Amazon Simple Storage Service (Amazon S3) | Specialist knowledge enriches proposals without changing the approved contract. Model advice can be incomplete; evidence and stakeholder review remain necessary. | I058, I059 |
| construct — Construction Specialists | Build domain components under the Execution Layer task boundary. | Build account; private Fargate job pool in either eligible AZ subnet | Amazon Elastic Container Service (Amazon ECS); AWS Fargate; Amazon Simple Storage Service (Amazon S3); Amazon Bedrock | Separates build environments from trusted control and independent assurance. Generated code needs sandbox controls and independent tests; extra workers do not prove correctness. | I060, I061 |
| assure — Assurance Specialists | Perform independent adversarial, security or domain validation where required. | Assurance account; separate private job pool in either eligible AZ subnet | Amazon Elastic Container Service (Amazon ECS); AWS Fargate; AWS Lambda; Amazon Simple Storage Service (Amazon S3) | Specified risks can require independent assessment beyond the artifact producer. Independence improves challenge quality but cannot guarantee detection of every defect. | I062, I063 |

## Detailed per-capability obligations

The original authority and invariant below remain unchanged. AWS implementation notes are proposed mechanisms; selecting a managed service does not prove the invariant.

### user — User / Business Requirement

**AWS implementation:** Cognito authenticates the stakeholder; API Gateway receives requirements. Custom Lambda validates organisational approval authority and records the exact contract digest.

**Identity:** Bind approver subject, tenant, role and contract revision.

**Security responsibility:** Reject client-supplied role assertions; enforce resource scope server-side.

**State:** Store requirement and approval records without granting internal state-write access.

**Typed transport:** Authenticated HTTPS; idempotent approval request with version and digest.

**Failure handling:** Missing, expired or unauthorised approval leaves the contract unapproved.

**Scaling assumptions:** Asynchronous submissions isolate stakeholder delays from workers.

**Alternative:** Federate an existing enterprise identity provider through Cognito.

**Trade-off:** Identity integration does not determine business authority; organisational rules remain custom.

**Evidence required:** Test altered contracts, replayed approvals and cross-tenant approvers; preserve digest-bound decisions.

**Deployment:** External authorised stakeholder; authenticated Control intake.

**Original authority:** May approve within organisational authority; cannot bypass system policy or fabricate evidence.

**Original invariant:** `Approval binds identity + contract version + digest; a requirement alone is not permission.`

### contract — Requirements & Contract Engine

**AWS implementation:** Lambda validates contract schemas; DynamoDB tracks revisions and approvals; versioned S3 stores contract documents. Review workflow is custom.

**Identity:** Separate contract proposer from authorised approver.

**Security responsibility:** Approval references the immutable document digest; changes invalidate approval.

**State:** DynamoDB conditional updates preserve one current contract revision.

**Typed transport:** HTTPS intake plus Step Functions task/callback integration; callbacks require identity revalidation.

**Failure handling:** Reject inconsistent constraints and stale approval submissions.

**Scaling assumptions:** Partition revision state by tenant and contract.

**Alternative:** Use containerised contract validation when processing exceeds Lambda limits.

**Trade-off:** A schema-valid document can still be ambiguous; stakeholder review remains necessary.

**Evidence required:** Test revision races and digest tampering; record approved criteria and signer identity.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May propose terms and request clarification; cannot self-approve or widen user authority.

**Original invariant:** `ApprovedCurrent := approval.digest = contract.digest ∧ approval.version = contract.version ∧ approver authorised.`

### core — Core Control Plane

**AWS implementation:** Step Functions sequences trusted phases; Lambda implements admission predicates; DynamoDB conditional transactions own run revisions. AWS does not supply AC release logic.

**Identity:** Dedicated controller role is the sole run-state writer.

**Security responsibility:** Check current approval, dependencies, owner bindings and aggregate budget before dispatch.

**State:** Baseline operational persistence supports AWS execution; optional Memory governs authorised cross-run continuity.

**Typed transport:** Service integrations and callback envelopes carry run, attempt, revision and digest.

**Failure handling:** Reject stale revisions; fence cancelled or superseded attempts.

**Scaling assumptions:** Partition control records by run; explicitly measure workflow and database quotas.

**Alternative:** A custom orchestrator could enforce the same predicates.

**Trade-off:** Workflow history helps auditing but does not prove business correctness.

**Evidence required:** Race dispatch against revocation, stale evidence and conflicting transitions; require fail-closed results.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** Sole authority for run-state transitions; cannot waive the contract, policy or evidence obligations.

**Original invariant:** `Dispatch(t) ⇒ ApprovedCurrent ∧ DependencyReady(t) ∧ Bound(t) ∧ BudgetAdmitted(t).`

### plan — Orchestration & Planning Engine

**AWS implementation:** AgentCore Runtime hosts planning code; Bedrock supplies model inference. Lambda independently validates the proposed owned dependency DAG.

**Identity:** Planner identity has proposal-write and contract-read access only.

**Security responsibility:** No direct release, state-transition or unrestricted tool credentials.

**State:** Versioned plan proposals in S3; Core records the admitted digest.

**Typed transport:** Structured JSON proposal includes tasks, owners, dependency digests and capability needs.

**Failure handling:** Cycles, missing owners or infeasible constraints return for revision.

**Scaling assumptions:** Independent planning sessions scale across runs; accepted plan revision remains atomic.

**Alternative:** Run planning in an ECS Fargate task.

**Trade-off:** Guardrails can filter model content; they cannot prove acyclicity, ownership or authority.

**Evidence required:** Inject cycles and duplicate ownership; prove invalid plans cannot reach PIC admission.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May propose decomposition and coordination; cannot dispatch outside Core authority or approve its own outputs.

**Original invariant:** `DependencyReady(t) ⇔ ∀d ∈ deps(t), AcceptedCurrent(d); |owners(t)| = 1.`

### pic — PIC Kernel

**AWS implementation:** PIC is custom Lambda checking logic over an immutable versioned pattern manifest. It is not a native Bedrock feature.

**Identity:** Checker reads admitted plans and pinned patterns; cannot approve requirements.

**Security responsibility:** Select only within the approved library; mandatory policy patterns cannot disappear.

**State:** Core pins pattern revision; S3 preserves manifests and reports.

**Typed transport:** Digest-addressed manifest and machine-readable conformance report.

**Failure handling:** Missing bindings, ineffective guards or unverifiable traces block progression.

**Scaling assumptions:** Stateless checks parallelise across runs; library versions remain immutable.

**Alternative:** Use a containerised deterministic checker for large manifests.

**Trade-off:** Schema conformance alone cannot establish that generated guards execute correctly.

**Evidence required:** Remove each mandatory trace, alter guards and substitute evidence; expect explicit rejection.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May constrain specialisation and reject nonconformance; cannot approve business requirements or grant permissions.

**Original invariant:** `Required(R,policy) ⊆ K_R ⊆ K. Each required pattern needs a current, passing trace; selection cannot remove mandatory policy.`

### cap — Capability & Skill Registry

**AWS implementation:** DynamoDB indexes qualified capabilities; S3 stores immutable schemas and qualification bundles. Custom Lambda resolves compatible pinned bindings.

**Identity:** Registry reader selects bindings; qualification publisher has separate authority.

**Security responsibility:** Tool availability never enlarges task permissions.

**State:** Versions and qualification state persist operationally; run binding remains pinned.

**Typed transport:** Typed requirement-to-binding resolution returns exact schema and evidence references.

**Failure handling:** Unmatched capability or expired qualification blocks affected dispatch.

**Scaling assumptions:** Read-heavy lookups partition by capability and version.

**Alternative:** A relational capability registry can provide equivalent version semantics.

**Trade-off:** Search convenience is secondary to complete compatibility and qualification checks.

**Evidence required:** Test incompatible schemas, absent skills and revoked qualifications; capture rejected binding reasons.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May select eligible bindings; cannot infer permission from availability or create unrestricted infrastructure.

**Original invariant:** `Bound(t) ⇒ requiredCapabilities(t) ⊆ capabilities(binding(t)) ∧ Compatible(binding(t),spec).`

### exec — Execution Layer

**AWS implementation:** AgentCore Runtime hosts bounded agent work; separate Fargate tasks perform construction. Custom task wrappers emit candidate digests and provenance.

**Identity:** Per-task role and attempt identity inherit narrowed Core dispatch.

**Security responsibility:** Workers cannot update acceptance records or release packages.

**State:** Ephemeral workspace; versioned output artifacts preserve run and attempt provenance.

**Typed transport:** Signed dispatch envelope; candidate manifest and measured-use receipt.

**Failure handling:** Timeouts and invalid output return failures; Core admits any retry.

**Scaling assumptions:** Concurrency follows ready dependencies, reservations and configured limits.

**Alternative:** Use only Fargate workers with a model client.

**Trade-off:** Compute isolation requires explicit IAM, network and filesystem controls; managed runtime alone is insufficient.

**Evidence required:** Test forged acceptance writes, out-of-scope effects and artifact substitution; deny each escalation.

**Deployment:** Build account; private Fargate job pool in either eligible AZ subnet.

**Original authority:** May act only within scoped dispatch; cannot mark its output accepted or self-release.

**Original invariant:** `P_task = P_run ∩ P_local; therefore P_task ⊆ P_run. Availability of a tool grants no authority.`

AgentCore Runtime is a managed reasoning option; the displayed Build VPC card depicts finite Fargate job execution. Do not place the managed AgentCore service inside the customer subnet. Custom connector code correlates session outputs to admitted job envelopes.

### verify — Verification & Evidence Layer

**AWS implementation:** Independent Fargate test runners execute required checks; Lambda verifies owner decisions, current dependency revisions and evidence digests.

**Identity:** Validator role differs from candidate producer and release controller.

**Security responsibility:** Only controller-authorised acceptance transactions may change trusted task state.

**State:** DynamoDB acceptance index; S3 evidence bundles retain exact versions.

**Typed transport:** Test report binds contract, task, attempt, artifact and dependency digests.

**Failure handling:** Reject absent owner acceptance, stale dependencies or mismatched evidence.

**Scaling assumptions:** Parallel validators operate on immutable candidate versions.

**Alternative:** Use CodeBuild for trusted build/test recipes with equivalent isolation.

**Trade-off:** Passing tests support stated criteria, not complete correctness of arbitrary generated code.

**Evidence required:** Change a dependency after testing and replay an old owner decision; acceptance must fail.

**Deployment:** Assurance account; separate private job pool in either eligible AZ subnet.

**Original authority:** May reject and attest; cannot change contracts, waive required tests or grant release.

**Original invariant:** `AcceptedCurrent(t) := ownerAccepted(t) ∧ testsPass(t) ∧ report.subjectArtifactDigest = artifactDigest ∧ dependenciesCurrent(t).`

Validation jobs use separate Assurance roles, workspaces and task definitions. Any trusted result commit is mediated by Control; final signing uses a separately scoped asymmetric key. Builders cannot alter candidates after the exact version/digest is selected for validation. Fargate job compute occupies the private subnet; any Lambda validation facet remains AWS-managed outside the customer VPC and uses Hyperplane ENIs only if private connectivity is required.

### integrate — Integration Engine

**AWS implementation:** Dedicated Fargate workers compose accepted inputs. Lambda checks input acceptance references; S3 stores the resulting composition manifest.

**Identity:** Integration role reads accepted artifacts and writes candidates only.

**Security responsibility:** Prevent modification of input objects and direct release access.

**State:** Ephemeral build workspace; immutable assembly manifests support provenance.

**Typed transport:** Composition manifest enumerates exact input digests, schemas and output digest.

**Failure handling:** Schema mismatch or changed input invalidates dependent acceptance.

**Scaling assumptions:** Parallelise independent assemblies; serialise one candidate revision commit.

**Alternative:** Use an isolated CodeBuild assembly job.

**Trade-off:** Container orchestration does not determine dependency correctness; custom digest validation is required.

**Evidence required:** Inject interface incompatibility and mutate inputs; require blocked assembly or renewed verification.

**Deployment:** Build account; private Fargate job pool in either eligible AZ subnet.

**Original authority:** May compose accepted inputs; cannot silently modify accepted artifacts or bypass full validation.

**Original invariant:** `IntegrationReady ⇔ ∀t required by manifest, AcceptedCurrent(t); integration still needs end-to-end tests.`

### final — Final Validation & Release Gate

**AWS implementation:** Separate Fargate system tests and custom PIC checks assess the integrated candidate. A separate asymmetric KMS SIGN_VERIFY key can sign the final digest-bound attestation.

**Identity:** Final validator cannot publish or grant external effect permissions.

**Security responsibility:** Bind tests, contract revision, PIC manifest and candidate digest.

**State:** Immutable attestation object; Core conditionally records its current revision.

**Typed transport:** Structured final report and signature referencing immutable evidence.

**Failure handling:** Any failed criterion, missing trace or stale evidence blocks final pass.

**Scaling assumptions:** Independent candidates can validate concurrently within admitted capacity.

**Alternative:** Use a dedicated independent test account for stricter separation.

**Trade-off:** A cryptographic signature authenticates an attestation; it cannot make its assertions true.

**Evidence required:** Remove each release prerequisite and test replay of attestations for another package.

**Deployment:** Assurance account; separate private job pool in either eligible AZ subnet.

**Original authority:** May attest or block; cannot publish or authorise effects outside approved scope.

**Original invariant:** `FinalPass ⇒ contractTestsPass ∧ interfacesPass ∧ PICConformance ∧ EvidenceCurrent.`

Validation jobs use separate Assurance roles, workspaces and task definitions. Any trusted result commit is mediated by Control; final signing uses a separately scoped asymmetric key. Builders cannot alter candidates after the exact version/digest is selected for validation. Fargate job compute occupies the private subnet; any Lambda validation facet remains AWS-managed outside the customer VPC and uses Hyperplane ENIs only if private connectivity is required.

### release — Release Controller

**AWS implementation:** Custom Lambda rechecks release predicates; DynamoDB atomically records authorisation and idempotency. S3 hands off the exact attested package.

**Identity:** Release role has narrowly scoped package-distribution rights.

**Security responsibility:** Revalidate approval, attestation, evidence, destination scope and package digest.

**State:** Retain release intent, package version and reconciliation state operationally.

**Typed transport:** Transactional authorisation plus outbox-style delivery and authenticated receipt.

**Failure handling:** Unknown delivery receipt stays unresolved; never infer success from timeout.

**Scaling assumptions:** Partition idempotency records by run and package.

**Alternative:** A dedicated release service can implement equivalent guarded handoff.

**Trade-off:** Database commit and external delivery are not one transaction; reconciliation remains necessary.

**Evidence required:** Test concurrent release attempts, revoked authority and delivery retry; require one digest-bound logical handoff.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May release only the attested digest under current approval; deployment is a separate scoped action.

**Original invariant:** `ReleaseIntentCommitted ⇒ ApprovedCurrent ∧ OwnersAccepted ∧ FinalPass ∧ PICConformance ∧ EvidenceCurrent ∧ ReleaseAuthorised; Delivered ⇒ ExactIntent ∧ ConfirmedReceipt.`

### workflow — MOA Workflow

**AWS implementation:** The released MOA package may specify single-worker or multi-worker execution using these services. Its topology is domain-dependent, not predeployed.

**Identity:** Child workflow receives domain-specific delegated identity and scope.

**Security responsibility:** Intersect parent permission with domain permission; no implicit engineering authority.

**State:** Domain operational state is separate; cross-run continuity requires an explicit Memory binding.

**Typed transport:** Pinned package manifest plus typed domain adapters and operating contract.

**Failure handling:** Missing required guards or unbound modules make execution nonconformant.

**Scaling assumptions:** Measure domain workload; worker count alone proves no throughput.

**Alternative:** Execute the portable package on another qualified workflow runtime.

**Trade-off:** A valid engineering package still needs separately authorised domain execution and measured capacity.

**Evidence required:** Run equivalent single- and multi-worker conformance tests and attempted permission escalation.

**Deployment:** Separate consumer/target account; target operating authority.

**Original authority:** Uses only its delegated scope; is not a new unrestricted engineering system.

**Original invariant:** `P_child = P_parent ∩ P_domain. Single-worker and multi-worker specialisations preserve required guards, not identical topology.`

### mem — Scoped Memory Controller

**AWS implementation:** Custom controller authorises cross-run records; DynamoDB and S3 hold authoritative references. Optional AgentCore Memory supports contextual recall only.

**Identity:** Bind tenant, project, actor and declared retrieval purpose.

**Security responsibility:** Memory never supplies permissions or current acceptance evidence.

**State:** Optional cross-run retention is explicitly enabled and policy-bound.

**Typed transport:** Scoped write/read envelope returns source references and retention status.

**Failure handling:** Scope mismatch denies access; continuity-dependent work pauses on store unavailability.

**Scaling assumptions:** Partition authorisation and retention records by tenant/project.

**Alternative:** Use only deterministic scoped record retrieval without semantic memory.

**Trade-off:** Contextual relevance does not prove provenance, consent or current acceptance.

**Evidence required:** Test cross-project recall, expired records and recalled approvals; require fresh authority validation.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May enforce retention and scope; cannot convert recalled text into permission.

**Original invariant:** `Retrieved ⊆ AuthorisedScope(identity,project,purpose). Memory content never enlarges P_run.`

### store — Durable State Store

**AWS implementation:** DynamoDB conditional/transactional records and versioned S3 objects implement explicitly enabled continuity storage. Custom manifests coordinate multi-object commits.

**Identity:** Storage role accepts controller-validated access context only.

**Security responsibility:** Encrypt scoped objects and deny cross-tenant key/resource access.

**State:** Optional cross-run record lifecycle is distinct from baseline execution ledger retention.

**Typed transport:** Conditional checkpoint commit references verified object versions and digests.

**Failure handling:** Missing durable acknowledgement leaves persistence unconfirmed; reconcile the exact operation and version before retrying.

**Scaling assumptions:** Design partition keys for checkpoint and project access patterns.

**Alternative:** Use a transactional relational store with immutable object references.

**Trade-off:** S3 versioning alone is not immutability; deny overwrites/deletion and apply suitable retention controls.

**Evidence required:** Interrupt writes and race revisions; restoration must reject incomplete manifests and stale state.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** Execute only a currently authorised storage operation; cannot decide workflow acceptance. Checkpoint operations inherit the controller-validated access context.

**Original invariant:** `CheckpointCommit ⇒ all referenced digests exist ∧ state version matches expected revision.`

### scope — Provenance & Scope Enforcement

**AWS implementation:** Lambda implements provenance, purpose and retention checks; IAM limits service access. CloudTrail contributes audit records, not business authorisation decisions.

**Identity:** Resolve authenticated principal and current organisational scope.

**Security responsibility:** Compute the intersection of identity, project and purpose permissions.

**State:** Policy versions and provenance references persist; evaluator keeps no acceptance state.

**Typed transport:** Signed access context includes identity, purpose, object references and decision reason.

**Failure handling:** Missing source provenance, expired retention or unavailable policy denies access.

**Scaling assumptions:** Stateless evaluations read pinned policy revisions.

**Alternative:** Use a dedicated policy evaluator with equivalent provenance rules.

**Trade-off:** IAM resource permissions need custom project/purpose checks; neither replaces the other.

**Evidence required:** Test spoofed provenance and revoked permissions; verify denial before retrieval or restoration.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May deny or narrow access; cannot grant unavailable parent privileges.

**Original invariant:** `P_memory = P_identity ∩ P_project ∩ P_purpose; recalled approval is revalidated against current policy.`

### retrieve — Retrieval Interface

**AWS implementation:** Deterministic reads return scoped records; optional AgentCore Memory can rank contextual material. Lambda filters results and attaches provenance.

**Identity:** Use the current run’s authorised retrieval context.

**Security responsibility:** Historical approval and test reports cannot bypass fresh digest checks.

**State:** No new acceptance state; context references remain traceable to retained records.

**Typed transport:** Context response contains record version, source, age and authorised purpose.

**Failure handling:** Unavailable or unverified records return explicit omissions, never invented facts.

**Scaling assumptions:** Bound query scope and result volume per request.

**Alternative:** Retrieve exact project records by key without semantic ranking.

**Trade-off:** Semantic ranking can omit relevant history; report source scope and retrieval limitations.

**Evidence required:** Replay stale acceptance evidence and conflicting history; confirm no release predicate changes.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May rank and filter permitted records; cannot approve tasks or invent facts.

**Original invariant:** `Current evidence must match current artifact/contract digests; relevant history is not current acceptance.`

### checkpoint — Checkpoint & Restoration Interface

**AWS implementation:** Custom checkpoint manifests bind operational state and immutable artifacts. Lambda revalidates authority and pins before Core resumes a stopped execution.

**Identity:** Restoration role proposes state; Core retains transition authority.

**Security responsibility:** Validate manifest integrity, artifact availability and current approval.

**State:** Optional continuity checkpoints supplement baseline AWS execution state.

**Typed transport:** Checkpoint digest, expected revision and restoration decision envelope.

**Failure handling:** Reject stale pins or missing references; reconcile unknown side effects.

**Scaling assumptions:** Restore independently by run; serialise adoption of a snapshot.

**Alternative:** Use an explicit abort-and-new-run recovery policy.

**Trade-off:** A workflow service resume facility still requires business reconciliation and current permission checks.

**Evidence required:** Revoke authority between snapshot and restore; prove restored state cannot dispatch directly.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May propose restored state; Core revalidates before further effects.

**Original invariant:** `Resume ⇒ checkpointValid ∧ pinsAvailable ∧ authorityCurrent; restoration alone permits no effect.`

### outcomes — Outcome Capture

**AWS implementation:** EventBridge routes outcome notifications; Lambda validates consent and lineage; S3 records observations linked to the originating run version.

**Identity:** Capture identity cannot modify active run state.

**Security responsibility:** Collect only allowed fields and preserve consent/retention metadata.

**State:** Session-bound learning unless durable history is explicitly bound through Memory.

**Typed transport:** Versioned event schema includes outcome, run pin, source and consent reference.

**Failure handling:** Missing lineage quarantines an observation instead of attributing it to a candidate.

**Scaling assumptions:** Partition capture by project and time window.

**Alternative:** Use bounded batch ingestion from approved domain records.

**Trade-off:** Event delivery can duplicate or reorder observations; custom deduplication is necessary.

**Evidence required:** Test duplicate events, mixed version attribution and unauthorised fields; separate correlation from causation.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May record allowed observations; cannot alter a run.

**Original invariant:** `Outcome.version = originatingRun.version; correlation does not establish causation.`

### candidate — Candidate Improvement

**AWS implementation:** An isolated reasoning worker proposes bounded pattern or configuration changes. S3 holds candidate manifests; Guardrails provide advisory content filtering.

**Identity:** Candidate writer cannot change defaults, trusted state or active pins.

**Security responsibility:** Keep mandatory safety constraints and approved change scope immutable.

**State:** Candidate is a distinct immutable version, never an in-place edit.

**Typed transport:** Candidate delta includes baseline version, intended change and evaluation obligations.

**Failure handling:** Out-of-scope or unversioned proposals return for revision.

**Scaling assumptions:** Parallel candidate generation uses independent budgets and datasets.

**Alternative:** Generate candidates with deterministic search or human-authored changes.

**Trade-off:** Model plausibility does not establish invariant preservation or empirical improvement.

**Evidence required:** Attempt silent permission widening and direct promotion; require rejection and immutable baseline preservation.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May propose changes only; cannot promote or mutate active versions.

**Original invariant:** `candidate ≠ activeVersion; safety constraints remain mandatory.`

### evaluate — Evaluation

**AWS implementation:** Independent Fargate runners evaluate held-out cases and invariant regressions. Lambda assembles the protocol decision against a pinned candidate digest.

**Identity:** Evaluator may attest pass/fail but cannot publish future defaults.

**Security responsibility:** Pin dataset, protocol, baseline, candidate and test harness versions.

**State:** Reports are versioned; cross-session learning history requires explicit retention binding.

**Typed transport:** Evaluation report includes confidence assumptions, results and provenance.

**Failure handling:** Missing samples, failed invariants or reproducibility failures block eligibility.

**Scaling assumptions:** Parallel cases require predetermined aggregation and statistical assumptions.

**Alternative:** Use approved batch test infrastructure with equivalent isolation.

**Trade-off:** Empirical results apply to the evaluated distribution; they do not guarantee unseen performance.

**Evidence required:** Replay mismatched reports and introduce regression cases; preserve raw results and decision rules.

**Deployment:** Assurance account; separate private job pool in either eligible AZ subnet.

**Original authority:** May pass/fail protocol criteria; cannot authorize promotion.

**Original invariant:** `Eligible := invariantTestsPass ∧ regressionTestsPass ∧ protocolDecisionPass; empirical gains apply only to the evaluated distribution.`

Validation jobs use separate Assurance roles, workspaces and task definitions. Any trusted result commit is mediated by Control; final signing uses a separately scoped asymmetric key. Builders cannot alter candidates after the exact version/digest is selected for validation. Fargate job compute occupies the private subnet; any Lambda validation facet remains AWS-managed outside the customer VPC and uses Hyperplane ENIs only if private connectivity is required.

### promote — Authorised Promotion Gate

**AWS implementation:** Custom Lambda checks evaluation, conformance and authorised change approval. AppConfig can distribute eligible future defaults after guarded promotion.

**Identity:** Separate promoter role from candidate producer and evaluator.

**Security responsibility:** Promotion writes future eligibility only; active pins remain unchanged.

**State:** Immutable eligibility records; optional durable learning history has explicit Memory scope.

**Typed transport:** Promotion record binds candidate, evidence, approval and prior default.

**Failure handling:** Digest mismatch, missing authorisation or failed protocol blocks publication.

**Scaling assumptions:** Serialise promotions per configured default lineage.

**Alternative:** Use a manually reviewed immutable default-selection registry.

**Trade-off:** AppConfig rollout controls do not implement AC’s candidate conformance or approval predicates.

**Evidence required:** Attempt promotion without one required predicate and inspect active runs for unchanged pins.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May promote within approved change scope; cannot rewrite existing run pins.

**Original invariant:** `Promote(v) ⇒ Evaluated(v) ∧ Conformant(v) ∧ Authorised(v).`

### versions — Version Registry

**AWS implementation:** S3 manifests identify immutable eligible versions; DynamoDB binds each run to exact pins. AppConfig distributes future defaults, not live mutable run configuration.

**Identity:** New-run selector reads eligible versions; workers cannot retarget pins.

**Security responsibility:** Validate all referenced qualifications, pattern manifests and approval scope.

**State:** Operational run pins persist; cross-run learned history requires explicit continuity policy.

**Typed transport:** Admission resolves default into a complete explicit version-set manifest.

**Failure handling:** Unavailable pinned versions block start/resume rather than silently falling forward.

**Scaling assumptions:** Read-heavy lookups cache immutable manifests by digest.

**Alternative:** Resolve future defaults directly from an approved registry.

**Trade-off:** Auto-refreshing configuration would violate run pinning unless defaults are resolved once at admission.

**Evidence required:** Change AppConfig during execution; verify every active run retains its original manifest.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May select eligible versions for new runs; cannot retarget active pins.

**Original invariant:** `For active run r: pin(r,t+1) = pin(r,t). New-run selection may change.`

AppConfig distributes an approved future-default selector. DynamoDB/S3/ECR/Step Functions versions hold exact run pins; active workers never follow the changing selector. Foundation platform artifact retention is not enabled semantic Learning history when Memory is off.

### rollback — Rollback Controller

**AWS implementation:** CloudWatch alarms can inform AppConfig rollback of future defaults. Custom Lambda validates rollback scope and records the chosen eligible prior version. Alarm-based rollback requires configured deployment monitors; after completion, use the supported revert window or a new authorised deployment of the eligible prior default.

**Identity:** Rollback role controls future selection; Core controls active-run suspension.

**Security responsibility:** Require earlier eligible manifests and preserve original promotion evidence.

**State:** Future default changes; immutable run pins and audit records remain.

**Typed transport:** Rollback event records reason, signal window, previous default and target digest.

**Failure handling:** Unknown target eligibility blocks rollback; active defects need explicit suspend/restart decisions.

**Scaling assumptions:** Coordinate one future-default lineage at a time.

**Alternative:** Use a reviewed manual future-default reset.

**Trade-off:** Automatic configuration rollback addresses monitored signals only; false alarms and unmeasured regressions remain possible.

**Evidence required:** Exercise rollback while runs execute; confirm unchanged pins and documented restart authority.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May change future selection; current runs require an explicit suspend/restart decision by Core.

**Original invariant:** `Rollback changes defaultVersion, not immutable run pins or historical evidence.`

### need — Capability Requirement

**AWS implementation:** Custom gap analysis converts missing capability bindings into a reviewable adapter engineering requirement.

**Identity:** Requirement proposer has no provisioning or invocation authority.

**Security responsibility:** Specify effect schema and requested scope separately from permission approval.

**State:** Persist reviewed requirements and links to blocked bindings.

**Typed transport:** Versioned requirement includes capability, effect limits, interfaces and acceptance tests.

**Failure handling:** Unclear capability gaps return for clarification; dependent dispatch remains blocked.

**Scaling assumptions:** Independent gap requests deduplicate by capability and contract scope.

**Alternative:** Revise scope to use an existing qualified capability.

**Trade-off:** Adapter development introduces new effects and qualification work; it is not mandatory for already-bound baseline tasks.

**Evidence required:** Request a nonexistent or excessive capability; verify no infrastructure or external permission appears automatically.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May request an adapter; cannot provision external authority.

**Original invariant:** `Missing capability ⇒ block affected dispatch until an eligible binding exists.`

### adapters — Tool / Adapter Registry

**AWS implementation:** Registry stores reviewed adapter versions and qualifications. AgentCore Gateway can expose approved adapters; custom logic binds exact adapter schema and version.

**Identity:** Separate adapter publisher from invocation identities.

**Security responsibility:** Require current qualification, resource scope and schema compatibility before binding.

**State:** Versioned manifests and qualification records remain immutable.

**Typed transport:** Typed adapter manifest describes requests, effects, receipts and qualification evidence.

**Failure handling:** Expired qualification or incompatible schema blocks invocation.

**Scaling assumptions:** Read-heavy adapter metadata supports immutable-version caching.

**Alternative:** Use direct qualified adapters behind an equivalent guarded service.

**Trade-off:** A discoverable Gateway target is not automatically qualified or authorised for a task.

**Evidence required:** Test unqualified targets, changed schemas and substituted versions; verify blocked admission.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May expose qualified adapters; availability does not authorize use.

**Original invariant:** `Eligible(adapter) ⇒ qualificationCurrent ∧ schemaCompatible.`

### boundary — Permission Boundary

**AWS implementation:** Custom invocation admission intersects AC run/task/adapter/resource scopes. AgentCore Policy in ENFORCE mode supplies an additional Gateway policy check.

**Identity:** AgentCore Identity mediates credentials after authenticated scoped admission.

**Security responsibility:** Compute the permission intersection; never expose broad credentials to the model.

**State:** Decision receipt binds policy version and task attempt.

**Typed transport:** Admitted effect envelope carries schema, budget reservation, identity and resource constraints.

**Failure handling:** Missing policy context or admission record denies invocation.

**Scaling assumptions:** Stateless policy checks read current versioned scope records.

**Alternative:** Use a dedicated custom policy service with equivalent enforcement.

**Trade-off:** Policy authoring and credential mediation still require validated mappings and least-privilege target permissions.

**Evidence required:** Test parent-disallowed resources, revoked tokens and budget exhaustion before any target call.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May deny/narrow; cannot expand parent permissions.

**Original invariant:** `P_effect = P_run ∩ P_task ∩ P_adapter ∩ P_resource.`

### gateway — Execution Gateway

**AWS implementation:** Gateway exposes mediated targets; Policy ENFORCE checks tool permissions; Identity handles scoped credentials. Custom AC admission precedes every call.

**Identity:** Target credentials remain mediated and constrained to approved resources.

**Security responsibility:** Reject calls without a current admission receipt and idempotency context.

**State:** Persist admission and effect correlation records outside worker memory.

**Typed transport:** Supported target integration plus typed request, idempotency key and effect receipt.

**Failure handling:** Timeout creates an unknown outcome requiring reconciliation, not blind replay.

**Scaling assumptions:** Bound target concurrency by measured limits and reservations.

**Alternative:** Use a custom adapter proxy with equivalent authentication and enforcement.

**Trade-off:** A tool response or timeout does not establish that the requested effect happened exactly once.

**Evidence required:** Simulate timeout after side effect and duplicate delivery; require reconciliation without unauthorised repetition.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May invoke only admitted effects; cannot reinterpret a timeout as success.

**Original invariant:** `AllowedEffect ⇒ capabilityValid ∧ budgetReserved ∧ effectSchemaValid.`

A worker cannot bypass admission by invoking a target directly. Gateway uses authenticated ingress and Policy ENFORCE; the custom AC guard remains responsible for current contract, task, adapter, resource, reservation and fence.

### effect — Effect Validation

**AWS implementation:** Custom validators compare observed effects with requested postconditions and produce digest-bound effect evidence. DynamoDB records reconciliation status.

**Identity:** Validator has restricted observation access, not permission for new effects.

**Security responsibility:** Bind observation to task, adapter version, requested resource and idempotency key.

**State:** Retain reconciliation outcomes and evidence versions operationally.

**Typed transport:** Postcondition report includes observed state, provenance and requested effect digest.

**Failure handling:** Mismatch or unknown result blocks task acceptance and routes to Core.

**Scaling assumptions:** Parallel read-back is limited by target quotas and consistency windows.

**Alternative:** Use adapter-specific independent read-back checks.

**Trade-off:** Some targets cannot expose atomic read-back; explicitly document uncertainty and escalation.

**Evidence required:** Return misleading success receipts and delayed effects; ensure acceptance follows verified postconditions.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May attest or reject effects; cannot grant new effects.

**Original invariant:** `EffectAccepted ⇒ observedEffect satisfies requestedPostcondition; receipt alone may be insufficient.`

### queue — Admission & Scheduling

**AWS implementation:** SQS buffers ready work; custom admission uses DynamoDB transactions to reserve capacity and aggregate budgets before Core dispatch.

**Identity:** Scheduler may delay/deny work; Core remains dispatcher.

**Security responsibility:** Recheck current authority and dependency revisions at admission.

**State:** Operational reservations persist; optional recovery adds distributed scheduling semantics.

**Typed transport:** Task envelope carries run, attempt, expected revision and reservation identity.

**Failure handling:** Stale reservations or overload trigger conservative delay and reconciliation.

**Scaling assumptions:** Measure service rates and tail latency; configure capacity rather than claiming throughput.

**Alternative:** Use Step Functions scheduling without a distributed queue for bounded workloads.

**Trade-off:** SQS redelivery and ordering require idempotent envelopes; a queue alone proves no fairness.

**Evidence required:** Race concurrent reservations and simulate redelivery; assert aggregate budget never exceeds its bound.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May delay/deny admission; cannot override dependency or authority checks.

**Original invariant:** `spent + Σreserved + requested ≤ budget; λ < cμ is necessary in a simple homogeneous steady-state model, not a throughput guarantee.`

### leases — Lease & Fencing Manager

**AWS implementation:** Custom lease logic conditionally advances monotonically increasing attempt epochs in DynamoDB. Workers must present current fencing tokens at commit.

**Identity:** Lease issuer cannot accept outputs; worker identity binds attempt epoch.

**Security responsibility:** Restrict fence updates to trusted lease service; reject older tokens.

**State:** Operational lease state is distinct from optional cross-run contextual Memory.

**Typed transport:** Lease acquire/renew/release includes expected epoch and attempt identity.

**Failure handling:** Expired or mismatched lease denies commit and requires reconciliation.

**Scaling assumptions:** Partition lease records by task; account for heartbeat load.

**Alternative:** Use single-owner serial execution where distributed leases are unnecessary.

**Trade-off:** Lease expiration is insufficient without fencing at every protected commit and applicable adapter.

**Evidence required:** Pause old workers, issue replacement leases and resume them; stale commits must fail.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May fence attempts; cannot accept their output.

**Original invariant:** `CommitAllowed ⇔ token = currentFence ∧ leaseValid; external adapters must also enforce fencing/idempotency.`

### retry — Bounded Repair Controller

**AWS implementation:** Step Functions supports bounded retry mechanics; custom repair logic checks deadline, attempt allocation, reservations and unknown-effect reconciliation.

**Identity:** Repair controller proposes action; trusted Core alone admits dispatch.

**Security responsibility:** No policy widening, stale dependency reuse or blind external-effect replay.

**State:** Operational attempt counters and decisions remain versioned by task.

**Typed transport:** Failure envelope classifies retryable, reconcilable and terminal outcomes.

**Failure handling:** Exhausted limits produce escalation or terminal failure.

**Scaling assumptions:** Backoff and measured capacity prevent correlated retry storms.

**Alternative:** Stop and request stakeholder intervention for nonrecoverable failures.

**Trade-off:** Finite retry count alone does not prove termination of arbitrary worker code.

**Evidence required:** Exhaust budgets, hang workers and duplicate failure events; assert bounded admitted retries and explicit terminal states.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May propose retries within policy; Core remains dispatcher.

**Original invariant:** `0 ≤ retries(t) ≤ limit(t); finite retry limits do not alone prove termination of arbitrary worker code.`

### observe — Observability & Capacity

**AWS implementation:** CloudWatch records approved metrics; OpenTelemetry traces requests; CloudTrail contributes API audit activity. Custom instrumentation preserves AC task and version identifiers. AgentCore Observability instruments runtime agents with CloudWatch-compatible OTEL traces and metrics.

**Identity:** Telemetry writers cannot change permissions or run state.

**Security responsibility:** Redact sensitive payloads and constrain metric/log access.

**State:** Operational retention differs from optional research-memory continuity.

**Typed transport:** Structured events correlate run, contract, attempt, artifact and service request.

**Failure handling:** Lost or delayed telemetry is explicit; conservative admission uses configured limits.

**Scaling assumptions:** Measure queue depth, latency percentiles, utilisation and bottleneck rates.

**Alternative:** Use another approved OpenTelemetry-compatible collection pipeline.

**Trade-off:** Service logs do not automatically capture domain correctness or every external side effect.

**Evidence required:** Inject telemetry loss and workload spikes; verify no fabricated capacity figures or direct authority changes.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** May alert; cannot directly alter run state or permissions.

**Original invariant:** `Measure bottleneck capacity and tail latency; queue stability requires bounded workload assumptions.`

### domain — Domain Specification Specialists

**AWS implementation:** Optional AgentCore Runtime specialists provide domain constraints and acceptance scenarios using Bedrock. Their structured advice enters planning review.

**Identity:** Domain specialist identity reads scoped requirements and writes advisory outputs.

**Security responsibility:** No contract approval, release authority or broad external tools.

**State:** Session-scoped advice; accepted revisions persist through the normal contract path.

**Typed transport:** Advice bundle includes sources, scenarios, assumptions and intended contract impact.

**Failure handling:** Unsupported advice is rejected; required changes need approved contract revision.

**Scaling assumptions:** Independent domain consultations scale across runs under budget admission.

**Alternative:** Use qualified human specialists or deterministic domain rule libraries.

**Trade-off:** Model advice can be incomplete; evidence and stakeholder review remain necessary.

**Evidence required:** Offer conflicting or unsupported constraints; confirm no silent contract modification.

**Deployment:** Engineering Control account; regional managed services / restricted logical responsibility.

**Original authority:** Advisory only; cannot change the approved contract.

**Original invariant:** `Advice becomes binding only through approved contract/plan revision.`

### construct — Construction Specialists

**AWS implementation:** Optional isolated Fargate construction workers build domain components, invoking Bedrock only for bounded assistance. Execution retains the task boundary.

**Identity:** Per-task worker identity inherits scoped dispatch and one accountable owner.

**Security responsibility:** Deny acceptance writes, release rights and broad egress.

**State:** Ephemeral workspaces; immutable candidate artifacts are operational records.

**Typed transport:** Task contract plus pinned inputs; output manifest records artifact digest and provenance.

**Failure handling:** Invalid artifacts return to Execution for governed verification and repair.

**Scaling assumptions:** Parallel construction follows dependency readiness and aggregate reservations.

**Alternative:** Use qualified baseline execution capabilities without a specialist pool.

**Trade-off:** Generated code needs sandbox controls and independent tests; extra workers do not prove correctness.

**Evidence required:** Test permission escalation, hidden dependencies and self-acceptance; require blocked actions.

**Deployment:** Build account; private Fargate job pool in either eligible AZ subnet.

**Original authority:** Limited to task authority; cannot accept its own result.

**Original invariant:** `One accountable task owner may coordinate many workers; worker count is not architectural correctness.`

### assure — Assurance Specialists

**AWS implementation:** Optional separate Fargate assurance workers perform adversarial, security or domain tests. Findings return to Verification, not directly to release.

**Identity:** Assurance identity differs from construction and has evidence-read/report-write access.

**Security responsibility:** No modification of candidate artifacts, approved criteria or trusted acceptance state.

**State:** Immutable findings preserve exact assessed artifact and scope.

**Typed transport:** Risk brief references candidate digest; report contains reproducible findings and test versions.

**Failure handling:** Inconclusive findings block policy-required assurance rather than implying success.

**Scaling assumptions:** Parallel risk-specific tests obey admitted budgets and isolation requirements.

**Alternative:** Use qualified external reviewers with the same scoped evidence contract.

**Trade-off:** Independence improves challenge quality but cannot guarantee detection of every defect.

**Evidence required:** Inject known vulnerabilities and swapped candidates; assess detection coverage and reject mismatched reports.

**Deployment:** Assurance account; separate private job pool in either eligible AZ subnet.

**Original authority:** May report failures; final acceptance remains governed by Verification.

**Original invariant:** `Validator independence is a policy requirement for specified risks, not a claim of perfect detection.`

Validation jobs use separate Assurance roles, workspaces and task definitions. Any trusted result commit is mediated by Control; final signing uses a separately scoped asymmetric key. Builders cannot alter candidates after the exact version/digest is selected for validation. Fargate job compute occupies the private subnet; any Lambda validation facet remains AWS-managed outside the customer VPC and uses Hyperplane ENIs only if private connectivity is required.

