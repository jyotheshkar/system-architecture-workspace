# Agentic Core | AWS Enterprise System Design Architecture

**Proposed reference design; no AWS infrastructure has been deployed by this deliverable.** Reviewed 6 October 2026. Costs are excluded.

Source: Reference Architecture schema version 1.0.0; current source snapshot includes **35 capabilities, 68 typed interfaces and five optional modules**. Source SHA-256: `6a00568419c9d4fd2d4ceccac30fe0b6b45737aabb78ba00210609f095fa97af`. Deployment/supporting services do not introduce new AC responsibilities.

## Problem, research hypothesis and design outcome

Agentic workflow engineering repeatedly needs approved requirements, accountable work ownership, capability qualification, controlled effects, independent validation, current evidence, bounded repair and exact release. Agentic Core researches whether these concerns can be encoded as reusable patterns and specialised into inspectable single-agent or multi-agent MOA workflow packages.

AWS supplies execution mechanisms. Custom AC software must implement the exact rules and PIC transformation. This work is an enterprise reference design and study explorer; it is not a deployed autonomous engineering system or evidence that every business problem can be solved.

## Studying the shared explorer

Use the same outer architecture workspace as Reference and Concept. AWS does not open a separate product shell. Select **AWS System Design Architecture**, then use the existing independent subsystem toggles, Guide, Camera, Interface key and Explore tools. The two study modes remain **System Overview** and **Individual Nodes**.

Start with **Read from intake** for readable labels; Fit gives the complete physical context. Drag to pan, wheel/pinch to zoom, double-click to focus, Home to fit, F to focus and Escape to clear. Select a capability for original responsibility, AWS choice, current authority/state, incoming/outgoing interfaces and required evidence. Select an interface for its payload and receiver guard. Architecture arrows are logical typed messages; account/network implementation is explained by the broker/transport notes.

Use System for all currently enabled logical interfaces, Neighbours for local exploration and Route for the admitted engineering sequence. Route includes admission, owner and final/acceptance feedback, not only a visual shortest path that skips gates. Solid containers represent physical deployment; dashed contours represent logical optional responsibilities. Select supporting service boxes for infrastructure study without counting them as additional AC agents.

## Reading the enterprise topology

| Scope | What the container means |
|---|---|
| Organization | Existing landing zone, enterprise policy and foundation accounts |
| Workload account | Engineering Control, Build, independent Assurance or product consumer authority |
| Selected Region | Authoritative operational location; service/model/residency checks remain mandatory |
| Managed service grouping | Regional resources and logical responsibilities outside customer VPC |
| Customer VPC | Job/private-resource network, distinct from managed service hosts |
| AZ/private subnet | Task placement and endpoint/network attachment |
| Logical subsystem | Optional AC capability grouping, not an AWS network/security boundary |
| External stakeholder/system | Independent business or target authority |

Show one detailed environment and compact Dev/Preprod/Prod equivalents. Reuse approved infrastructure templates; keep account data, keys, credentials, pins and approvals separate. Global IAM/STS/Organizations controls are not Region-hosted servers. External SaaS/on-premises targets are not implied to live in the consumer account/Region.

## Governed engineering sequence

1. User defines the requirement; intake validates stakeholder identity and scope.
2. Contract engine produces reviewable current invariants, permissions, resource limits, tests and evidence obligations. Approval binds exact version/digest.
3. Planner proposes an owned DAG. Core validates I064 and admits only that plan through I065 before PIC specialisation.
4. PIC selects mandatory patterns and produces WorkflowSpec, enforcing guard bindings, tests and trace evidence requirements. Capability registry pins qualified compatible workers.
5. Core checks current approval, dependencies, bindings and aggregate admission; dispatches scoped bounded tasks.
6. Workers produce versioned candidates/provenance. A same-account Control broker validates transport completion; independent owner attestation I066 and current tests establish acceptance through Verification/I012.
7. Integration composes accepted pieces into a new unaccepted system candidate; Final Validation performs system/contract/PIC checks and supplies I016 to Core.
8. Core authorises exact handoff I017; Release delivers I018 with reconciled receipt. Separately authorised consumer deployment/domain effects follow the child operating contract.

Failures return through bounded, current-authority repair. Completion, a model explanation, a signed report or a successful AWS request cannot substitute for another predicate.

## Service decisions to defend to the AWS reviewer

Step Functions Standard coordinates trustworthy phases and waits; Lambda performs short deterministic AC predicates; DynamoDB serialises current ledger conditions; S3/ECR/immutable state-machine versions identify exact artifacts/configuration. Custom DAG ready-frontier scheduling supplements Map/Parallel. No managed service supplies the AC release conjunction automatically.

AgentCore Runtime hosts qualified reasoning code and ephemeral session context. Separate Fargate construction/assurance jobs have independent roles/workspaces/accounts. Neither alone qualifies arbitrary hostile generated-code execution. Native AgentCore InvokeHarness is considered for bounded reasoning but returns final text, has no .sync/callback, has a 900-second task limit and may continue after its Step Functions task stops. This design chooses the custom Runtime/job envelope when exact artifact correlation is needed.

The custom completion broker lives with the Control state machine because task-token callback principals must be in that account. Cross-account supported jobs use scoped target-role trust and dispatch; cancellation is best-effort. Artifact reads require object/version and KMS permission in addition to caller identity.

Optional tool effects pass custom run/task/adapter/resource scope, schema, reservation/fence and qualification before authenticated Gateway Policy ENFORCE/Identity. Effect validation reads observed business state. Unknown effects require reconciliation, not blind non-idempotent replay.

## PIC and mathematical feasibility

PIC trace: **parent pattern version → child responsibility → enforcing guard → positive/negative test → current exact evidence**. Required(R,policy) ⊆ K_R ⊆ K; absent mandatory eligible patterns or unenforced child guards block progression. Single/multiple worker topology can differ while inherited safety obligations remain.

The architecture graph intentionally contains control feedback, repair and learning cycles. The task plan accepted for execution is a separate owned dependency DAG. Graph reachability or an adjacency matrix explains connectivity; a determinant or fixed agent count cannot prove a correct implementation.

For typed transition e, trusted state S and validated message m, establish `Inv(S) ∧ Pre_e(S,m) ∧ Guard_e(S,m) ⇒ Inv(T_e(S,m))`. This is a proof obligation under actual enforcement assumptions, not a claimed finished proof. Safety is distinct from progress; deadlines, bounded retries, availability and effect reconciliation need additional assumptions/tests.

`P_effect = P_run ∩ P_task ∩ P_adapter ∩ P_resource` implies application scope does not widen if all effect paths enforce that intersection. AWS IAM/resource/session/SCP evaluation must be reviewed separately; the equation is not its complete semantics.

`spent + Σreserved + requested ≤ budget` requires atomic admission under concurrency; reservations need fenced current ownership and reconciliation. `pin(r,t+1)=pin(r,t)` requires immutable per-run manifests rather than live default lookups. The final release conjunction requires current exact evidence and authority at its defined commit point.

## Optional module fidelity

### Memory

**When enabled:** Authorised continuity across runs and sessions.

**When off:** Only in-session control state exists. Restart recovery and cross-session recall are unavailable; continuity-dependent contracts must be rejected.

### Controlled Learning

**When enabled:** Evaluated and authorised changes become eligible future versions; active runs keep their pins. Without Memory, this pipeline and registry are session-bound; enable Memory for persisted version history.

**When off:** No outcome-driven improvement pipeline. The selected static version remains fixed.

### Tool / Adapter Governance

**When enabled:** External effects pass qualified adapters, explicit permission narrowing and effect validation.

**When off:** Skeleton is restricted to sandboxed computation and artifacts. External effects requiring this boundary are not admitted.

### Recovery & Scalability

**When enabled:** Capacity admission, fencing, bounded recovery and operational measurement are explicit. Without Memory, leases, reservations and telemetry are session-local and coordinator restart requires explicit abandonment/reconciliation.

**When off:** Basic bounded task retries remain in Core, but no distributed lease recovery or capacity-management subsystem is assumed.

### Advanced Specialists

**When enabled:** Qualified domain, construction and assurance pools augment distinct existing responsibilities.

**When off:** Baseline capabilities perform the core work. No fixed specialist or agent count is assumed.

Memory-off has no cross-session application restoration/recall despite AWS service operational retention. Learning-only application history is session-bound; I067/I068 require both Memory and Learning. Baseline security audit/operational monitoring is separate from optional Recovery capacity analysis.

## Platform changes, product operation and evidence

Platform deployment tests reviewed infrastructure/code/config through isolated Dev→Preprod→Prod. A deployment approval and a CloudFormation change set belong to operations; they are not the exact user contract approval or task/PIC/release gate. Child MOA deployment and effects require separate target authority.

Define operational owners, supported domain, data classification/residency, exact model/profile, workload duration/concurrency/artifact sizes, SLO/RTO/RPO, retention and external target idempotency/read-back. No throughput, recovery or security-certification assertion is made before measured tests. Logs, signatures, finite content checks and UI tests support distinct limited conclusions.

## Suggested L6 presentation

1. Explain one business workflow and the consequence of stale/unsupported output.
2. Trace User→Contract→Core→PIC→bounded work→independent evidence→exact release in the shared canvas.
3. Show why Build and Assurance cannot approve their own business changes; distinguish managed-service and private-network placement.
4. Remove one guard/evidence condition in a future prototype and demonstrate fail-closed behaviour; explain PIC reuse.
5. Discuss one deliberately chosen trade-off: Runtime connector versus native InvokeHarness, single authoritative Region versus unproved active-active, or exact state versus fallible semantic Memory.
6. Separate the research hypothesis, completed systems-design artifact, future prototype tests and production evidence required.

## Reviewer questions

- Where is each exact approval/task/artifact/dependency digest checked?
- Who owns task acceptance independently of worker completion?
- What enforces a required child PIC guard beyond an instruction prompt?
- Why does the callback broker use a Control-account principal?
- What happens if a worker or harness continues after timeout?
- Which cross-account S3/KMS permissions are necessary and denied?
- What prevents a direct worker target/Gateway bypass?
- What does Memory-off prohibit, and what operational records still persist?
- How are active pins isolated from platform/default version changes?
- Which fault/capacity evidence would justify actual production deployment?

## Files and evidence scope

The mapping retains all 35 source capabilities and their unchanged responsibility/authority/invariant fields. The register retains all 68 exact logical interfaces. Security/Operations and Enterprise ADRs explain physical mechanisms and trade-offs. Current source/format checks are separate from future AWS deployment, workload and security tests. Historical viewer checks are not re-labelled as production validation.
