# Agentic Core | AWS Enterprise System Design Architecture

**Proposed reference design; no AWS infrastructure has been deployed by this deliverable.** Reviewed 6 October 2026. Costs are excluded.

Source: Reference Architecture schema version 1.0.0; current source snapshot includes **35 capabilities, 68 typed interfaces and five optional modules**. Source SHA-256: `6a00568419c9d4fd2d4ceccac30fe0b6b45737aabb78ba00210609f095fa97af`. Deployment/supporting services do not introduce new AC responsibilities.

## Complete logical interface register

All 68 source IDs, endpoints, types, payloads, preconditions, postconditions, failures, authority limits, state dependencies and module requirements are retained. The full all-enabled enterprise view includes their logical arrows. An arrow represents an AC interface contract; it is **not a direct physical network connection** or permission to skip the receiving guard.

Cross-account worker/control transitions use approved dispatch roles and a validating Control ingress/broker. Exact artifacts are referenced by bucket/key/versionId plus content digest under identity, resource and KMS policies. The logical sender still has only its original authority.

| ID | Logical source → destination | Type | Meaning | Module requirements | Deployment crossing |
|---|---|---|---|---|---|
| I001 | User / Business Requirement → Requirements & Contract Engine | DATA | Submit requirement | Core only | Authorised business stakeholders and task owners → Engineering Control account |
| I002 | Requirements & Contract Engine → User / Business Requirement | CONTROL | Review contract | Core only | Engineering Control account → Authorised business stakeholders and task owners |
| I003 | User / Business Requirement → Requirements & Contract Engine | AUTHORITY | Approve current contract | Core only | Authorised business stakeholders and task owners → Engineering Control account |
| I004 | Requirements & Contract Engine → Core Control Plane | AUTHORITY | Admit approved contract | Core only | Engineering Control account → Engineering Control account |
| I005 | Core Control Plane → Orchestration & Planning Engine | CONTROL | Request engineering plan | Core only | Engineering Control account → Engineering Control account |
| I006 | Orchestration & Planning Engine → PIC Kernel | PATTERN | Specialise required patterns | Core only | Engineering Control account → Engineering Control account |
| I007 | PIC Kernel → Capability & Skill Registry | CAPABILITY | Bind constrained capabilities | Core only | Engineering Control account → Engineering Control account |
| I008 | Capability & Skill Registry → Core Control Plane | CAPABILITY | Register ready plan bindings | Core only | Engineering Control account → Engineering Control account |
| I009 | Core Control Plane → Execution Layer | CONTROL | Dispatch bounded work | Core only | Engineering Control account → Construction / Execution account |
| I010 | Execution Layer → Verification & Evidence Layer | DATA | Submit candidate and evidence | Core only | Construction / Execution account → Independent Assurance account |
| I011 | PIC Kernel → Verification & Evidence Layer | PATTERN | Enforce inherited task guards | Core only | Engineering Control account → Independent Assurance account |
| I012 | Verification & Evidence Layer → Core Control Plane | EVIDENCE | Record acceptance or rejection | Core only | Independent Assurance account → Engineering Control account |
| I013 | Verification & Evidence Layer → Integration Engine | DATA | Supply accepted components | Core only | Independent Assurance account → Construction / Execution account |
| I014 | Integration Engine → Final Validation & Release Gate | DATA | Submit integrated candidate | Core only | Construction / Execution account → Independent Assurance account |
| I015 | PIC Kernel → Final Validation & Release Gate | PATTERN | Check full workflow conformance | Core only | Engineering Control account → Independent Assurance account |
| I016 | Final Validation & Release Gate → Core Control Plane | EVIDENCE | Commit final attestation | Core only | Independent Assurance account → Engineering Control account |
| I017 | Core Control Plane → Release Controller | AUTHORITY | Authorise exact handoff | Core only | Engineering Control account → Engineering Control account |
| I018 | Release Controller → MOA Workflow | DATA | Deliver governed workflow | Core only | Engineering Control account → MOA Workflow target account / external destination |
| I019 | Core Control Plane → Execution Layer | REPAIR | Admit bounded repair | Core only | Engineering Control account → Construction / Execution account |
| I020 | Requirements & Contract Engine → Scoped Memory Controller | STATE | Persist approved contract | memory | Engineering Control account → Engineering Control account |
| I021 | Core Control Plane → Scoped Memory Controller | STATE | Persist run checkpoint | memory | Engineering Control account → Engineering Control account |
| I022 | Execution Layer → Scoped Memory Controller | STATE | Record work provenance | memory | Construction / Execution account → Engineering Control account |
| I023 | Verification & Evidence Layer → Scoped Memory Controller | STATE | Retain evidence index | memory | Independent Assurance account → Engineering Control account |
| I024 | Scoped Memory Controller → Provenance & Scope Enforcement | AUTHORITY | Validate memory access | memory | Engineering Control account → Engineering Control account |
| I025 | Provenance & Scope Enforcement → Durable State Store | STATE | Read or write scoped records | memory | Engineering Control account → Engineering Control account |
| I026 | Durable State Store → Retrieval Interface | DATA | Return authorised history | memory | Engineering Control account → Engineering Control account |
| I027 | Orchestration & Planning Engine → Scoped Memory Controller | DATA | Request planning context | memory | Engineering Control account → Engineering Control account |
| I028 | Retrieval Interface → Orchestration & Planning Engine | DATA | Supply planning context | memory | Engineering Control account → Engineering Control account |
| I029 | Scoped Memory Controller → Checkpoint & Restoration Interface | STATE | Prepare consistent snapshot | memory | Engineering Control account → Engineering Control account |
| I030 | Checkpoint & Restoration Interface → Durable State Store | STATE | Commit or read checkpoint | memory | Engineering Control account → Engineering Control account |
| I031 | Checkpoint & Restoration Interface → Core Control Plane | STATE | Restore with revalidation | memory | Engineering Control account → Engineering Control account |
| I032 | Scoped Memory Controller → MOA Workflow | PATTERN | Bind scoped continuity | memory | Engineering Control account → MOA Workflow target account / external destination |
| I033 | MOA Workflow → Outcome Capture | EVIDENCE | Capture attributed outcomes | learning | MOA Workflow target account / external destination → Engineering Control account |
| I034 | Verification & Evidence Layer → Outcome Capture | EVIDENCE | Capture attributed outcomes | learning | Independent Assurance account → Engineering Control account |
| I035 | Outcome Capture → Candidate Improvement | DATA | Propose bounded improvement | learning | Engineering Control account → Engineering Control account |
| I036 | Candidate Improvement → Evaluation | DATA | Evaluate candidate against baseline | learning | Engineering Control account → Independent Assurance account |
| I037 | Evaluation → Authorised Promotion Gate | EVIDENCE | Submit evaluation evidence | learning | Independent Assurance account → Engineering Control account |
| I038 | User / Business Requirement → Authorised Promotion Gate | AUTHORITY | Authorise scoped promotion | learning | Authorised business stakeholders and task owners → Engineering Control account |
| I039 | Authorised Promotion Gate → Version Registry | STATE | Publish eligible future version | learning | Engineering Control account → Engineering Control account |
| I040 | Version Registry → Core Control Plane | STATE | Pin a new run version | learning | Engineering Control account → Engineering Control account |
| I041 | Outcome Capture → Rollback Controller | EVIDENCE | Report monitored regression | learning | Engineering Control account → Engineering Control account |
| I042 | User / Business Requirement → Rollback Controller | AUTHORITY | Authorise rollback policy | learning | Authorised business stakeholders and task owners → Engineering Control account |
| I043 | Rollback Controller → Version Registry | STATE | Select prior eligible default | learning | Engineering Control account → Engineering Control account |
| I044 | Capability & Skill Registry → Capability Requirement | CAPABILITY | Declare missing capability | tools | Engineering Control account → Engineering Control account |
| I045 | Capability Requirement → Tool / Adapter Registry | CAPABILITY | Request reviewed adapter | tools | Engineering Control account → Engineering Control account |
| I046 | Tool / Adapter Registry → Capability & Skill Registry | CAPABILITY | Return qualified binding | tools | Engineering Control account → Engineering Control account |
| I047 | Execution Layer → Permission Boundary | AUTHORITY | Request effect authority | tools | Construction / Execution account → Engineering Control account |
| I048 | Permission Boundary → Execution Gateway | AUTHORITY | Permit scoped effect | tools | Engineering Control account → Engineering Control account |
| I049 | Execution Gateway → Effect Validation | EVIDENCE | Validate observed effect | tools | Engineering Control account → Engineering Control account |
| I050 | Effect Validation → Verification & Evidence Layer | EVIDENCE | Attach effect attestation | tools | Engineering Control account → Independent Assurance account |
| I051 | Core Control Plane → Admission & Scheduling | CONTROL | Request capacity admission | recovery | Engineering Control account → Engineering Control account |
| I052 | Admission & Scheduling → Lease & Fencing Manager | CONTROL | Lease admitted task | recovery | Engineering Control account → Engineering Control account |
| I053 | Lease & Fencing Manager → Core Control Plane | AUTHORITY | Return fenced dispatch lease | recovery | Engineering Control account → Engineering Control account |
| I054 | Core Control Plane → Bounded Repair Controller | REPAIR | Classify repair eligibility | recovery | Engineering Control account → Engineering Control account |
| I055 | Bounded Repair Controller → Core Control Plane | REPAIR | Return bounded recovery decision | recovery | Engineering Control account → Engineering Control account |
| I056 | Core Control Plane → Observability & Capacity | STATE | Report lifecycle telemetry | recovery | Engineering Control account → Engineering Control account |
| I057 | Observability & Capacity → Admission & Scheduling | DATA | Inform capacity planning | recovery | Engineering Control account → Engineering Control account |
| I058 | Orchestration & Planning Engine → Domain Specification Specialists | CAPABILITY | Request domain analysis | specialists | Engineering Control account → Engineering Control account |
| I059 | Domain Specification Specialists → Orchestration & Planning Engine | EVIDENCE | Return domain advice | specialists | Engineering Control account → Engineering Control account |
| I060 | Execution Layer → Construction Specialists | CAPABILITY | Delegate qualified construction | specialists | Construction / Execution account → Construction / Execution account |
| I061 | Construction Specialists → Execution Layer | EVIDENCE | Return specialist artifact | specialists | Construction / Execution account → Construction / Execution account |
| I062 | Verification & Evidence Layer → Assurance Specialists | CAPABILITY | Request independent assurance | specialists | Independent Assurance account → Independent Assurance account |
| I063 | Assurance Specialists → Verification & Evidence Layer | EVIDENCE | Return assurance findings | specialists | Independent Assurance account → Independent Assurance account |
| I064 | Orchestration & Planning Engine → Core Control Plane | STATE | Validate proposed plan | Core only | Engineering Control account → Engineering Control account |
| I065 | Core Control Plane → PIC Kernel | AUTHORITY | Admit current architecture plan | Core only | Engineering Control account → Engineering Control account |
| I066 | Core Control Plane → Verification & Evidence Layer | AUTHORITY | Supply accountable owner attestation | Core only | Engineering Control account → Independent Assurance account |
| I067 | Version Registry → Scoped Memory Controller | STATE | Persist evaluated version history | learning, memory | Engineering Control account → Engineering Control account |
| I068 | Retrieval Interface → Version Registry | STATE | Restore authorised version metadata | learning, memory | Engineering Control account → Engineering Control account |

## Mandatory admitted-plan, acceptance and release path

`I064 Plan → Core` records a validated current plan. `I065 Core → PIC` admits only that plan to specialisation. `I066 Core → Verification` supplies independently authenticated accountable-owner attestation. `I012 Verification → Core` returns current task acceptance/rejection. `I016 Final Validation → Core` supplies exact final attestation. `I017 Core → Release` authorises the exact handoff; `I018 Release → MOA Workflow` delivers it. There is no direct Final→Release authority shortcut. Worker transport completion never becomes acceptance by itself.

## Exact interface definitions

### I001 — Submit requirement

**Logical endpoints:** `user` → `contract` (DATA). **Optional requirements:** None.

**Payload:** Objective, constraints, success definition and stakeholder identity.

**Purpose:** Submit requirement; Draft contract is created; execution remains prohibited.

**Precondition:** Identified input source.

**Postcondition:** Draft contract is created; execution remains prohibited.

**Failure:** Ambiguous scope creates clarification request.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Identified input source.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** HTTPS through authenticated API; application approval binds exact digest. Callback broker may signal Step Functions only after ledger commit.

**Deployment crossing:** Authorised business stakeholders and task owners → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I002 — Review contract

**Logical endpoints:** `contract` → `user` (CONTROL). **Optional requirements:** None.

**Payload:** Exact contract revision, digest and unresolved questions.

**Purpose:** Review contract; User can approve or request revision.

**Precondition:** Draft passes consistency checks.

**Postcondition:** User can approve or request revision.

**Failure:** No response leaves contract unapproved.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Draft passes consistency checks.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** HTTPS through authenticated API; application approval binds exact digest. Callback broker may signal Step Functions only after ledger commit.

**Deployment crossing:** Engineering Control account → Authorised business stakeholders and task owners.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I003 — Approve current contract

**Logical endpoints:** `user` → `contract` (AUTHORITY). **Optional requirements:** None.

**Payload:** Approval identity, scope, version and digest.

**Purpose:** Approve current contract; Approval is bound to exactly one contract revision.

**Precondition:** Approver is authorised; revision is current.

**Postcondition:** Approval is bound to exactly one contract revision.

**Failure:** Stale or unauthorised approval is rejected.

**Authority limit:** Authorises only the specified contract scope.

**State dependency:** Approver is authorised; revision is current.

**Original rule:** ApprovedCurrent requires exact version and digest match.

**Proposed AWS transport:** HTTPS through authenticated API; application approval binds exact digest. Callback broker may signal Step Functions only after ledger commit.

**Deployment crossing:** Authorised business stakeholders and task owners → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I004 — Admit approved contract

**Logical endpoints:** `contract` → `core` (AUTHORITY). **Optional requirements:** None.

**Payload:** Approved contract, approval proof, limits and acceptance criteria.

**Purpose:** Admit approved contract; Core creates a session run with immutable contract pin.

**Precondition:** ApprovedCurrent and policy-compatible contract.

**Postcondition:** Core creates a session run with immutable contract pin.

**Failure:** Invalid approval prevents admission.

**Authority limit:** Delegated run scope, narrowed by Core policy.

**State dependency:** ApprovedCurrent and policy-compatible contract.

**Original rule:** P_run = P_approval ∩ P_policy.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I005 — Request engineering plan

**Logical endpoints:** `core` → `plan` (CONTROL). **Optional requirements:** None.

**Payload:** Contract pin, planning mandate and resource limits.

**Purpose:** Request engineering plan; Planner proposes owned dependency graph.

**Precondition:** Run admitted under current policy.

**Postcondition:** Planner proposes owned dependency graph.

**Failure:** No valid plan means no dispatch.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Run admitted under current policy.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I006 — Specialise required patterns

**Logical endpoints:** `plan` → `pic` (PATTERN). **Optional requirements:** None.

**Payload:** Approved architecture plan, R, task graph and capability requirements.

**Purpose:** Specialise required patterns; PIC selects mandatory patterns and maps them into the workflow specification.

**Precondition:** Plan is acyclic, owned, contract-consistent and admitted by Core at this exact revision.

**Postcondition:** PIC selects mandatory patterns and maps them into the workflow specification.

**Failure:** Missing or incompatible mandatory patterns block specialisation.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Plan is acyclic, owned and consistent with the contract.

**Original rule:** Required(R,policy) ⊆ K_R ⊆ K.

**Proposed AWS transport:** Pinned S3 WorkflowSpec/trace manifest reference through authenticated custom PIC interface; deterministic guard evaluates current digests.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I007 — Bind constrained capabilities

**Logical endpoints:** `pic` → `cap` (CAPABILITY). **Optional requirements:** None.

**Payload:** Task requirements, interface schemas, guard obligations and version pins.

**Purpose:** Bind constrained capabilities; Eligible compatible capabilities are bound or gaps recorded.

**Precondition:** Workflow specification exists.

**Postcondition:** Eligible compatible capabilities are bound or gaps recorded.

**Failure:** A missing binding blocks affected tasks.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Workflow specification exists.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I008 — Register ready plan bindings

**Logical endpoints:** `cap` → `core` (CAPABILITY). **Optional requirements:** None.

**Payload:** Plan digest, capability versions, task owners and readiness metadata.

**Purpose:** Register ready plan bindings; Core can evaluate task dispatch eligibility.

**Precondition:** PIC obligations and compatibility checks are recorded.

**Postcondition:** Core can evaluate task dispatch eligibility.

**Failure:** Stale bindings require re-planning or re-binding.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** PIC obligations and compatibility checks are recorded.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I009 — Dispatch bounded work

**Logical endpoints:** `core` → `exec` (CONTROL). **Optional requirements:** None.

**Payload:** Task contract, bindings, dependencies, permissions, limits and attempt identity.

**Purpose:** Dispatch bounded work; One admitted attempt executes under narrowed authority.

**Precondition:** ApprovedCurrent; DependencyReady; Bound; budget admitted.

**Postcondition:** One admitted attempt executes under narrowed authority.

**Failure:** Guard failure prevents dispatch.

**Authority limit:** Task-scoped authority; cannot accept or release.

**State dependency:** ApprovedCurrent; DependencyReady; Bound; budget admitted.

**Original rule:** Dispatch(t) ⇒ ApprovedCurrent ∧ DependencyReady(t) ∧ Bound(t) ∧ BudgetAdmitted(t).

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Engineering Control account → Construction / Execution account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I010 — Submit candidate and evidence

**Logical endpoints:** `exec` → `verify` (DATA). **Optional requirements:** None.

**Payload:** Artifact digest, provenance, dependency revisions and task tests. Owner acceptance is supplied independently via Core.

**Purpose:** Submit candidate and evidence; Verifier checks current artifacts and evidence.

**Precondition:** Attempt belongs to current task and contract; output is complete.

**Postcondition:** Verifier checks current artifacts and evidence.

**Failure:** Missing or stale evidence is rejected.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Attempt belongs to current task and contract; output is complete.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Construction / Execution account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I011 — Enforce inherited task guards

**Logical endpoints:** `pic` → `verify` (PATTERN). **Optional requirements:** None.

**Payload:** Required trace schema, guards and conformance tests.

**Purpose:** Enforce inherited task guards; Task checks include the inherited obligations.

**Precondition:** Required patterns selected for this specification.

**Postcondition:** Task checks include the inherited obligations.

**Failure:** Unbound guard or missing test rejects relevant task evidence.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Required patterns selected for this specification.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Engineering Control account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I012 — Record acceptance or rejection

**Logical endpoints:** `verify` → `core` (EVIDENCE). **Optional requirements:** None.

**Payload:** Digest-bound acceptance/rejection, owner decision and defect classification.

**Purpose:** Record acceptance or rejection; Core commits acceptance or schedules bounded repair/stop.

**Precondition:** Tests and owner evidence correspond to current artifact and dependencies.

**Postcondition:** Core commits acceptance or schedules bounded repair/stop.

**Failure:** Stale acceptance cannot unlock dependents.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Tests and owner evidence correspond to current artifact and dependencies.

**Original rule:** AcceptedCurrent includes current owner, artifact, contract and dependency versions.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Independent Assurance account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I013 — Supply accepted components

**Logical endpoints:** `verify` → `integrate` (DATA). **Optional requirements:** None.

**Payload:** Accepted artifact references and interface schemas.

**Purpose:** Supply accepted components; Integrator composes an exact candidate manifest.

**Precondition:** All supplied components have current acceptance records.

**Postcondition:** Integrator composes an exact candidate manifest.

**Failure:** Any mismatch or changed input blocks integration.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** All supplied components have current acceptance records.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Independent Assurance account → Construction / Execution account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I014 — Submit integrated candidate

**Logical endpoints:** `integrate` → `final` (DATA). **Optional requirements:** None.

**Payload:** Candidate digest, composition manifest, system tests and interface report.

**Purpose:** Submit integrated candidate; Whole-system validation begins against the current contract.

**Precondition:** Required components are AcceptedCurrent.

**Postcondition:** Whole-system validation begins against the current contract.

**Failure:** Invalid composition goes back through governed repair.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Required components are AcceptedCurrent.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Construction / Execution account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I015 — Check full workflow conformance

**Logical endpoints:** `pic` → `final` (PATTERN). **Optional requirements:** None.

**Payload:** Parent pattern → child component → guard → test → current evidence manifest.

**Purpose:** Check full workflow conformance; Final gate verifies all mandatory inheritance traces.

**Precondition:** Complete candidate and selected pattern set exist.

**Postcondition:** Final gate verifies all mandatory inheritance traces.

**Failure:** Missing or stale trace blocks final pass.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Complete candidate and selected pattern set exist.

**Original rule:** ∀p ∈ K_R: bound(p) ∧ guardEnforced(p) ∧ testPass(p) ∧ evidenceCurrent(p).

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Engineering Control account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I016 — Commit final attestation

**Logical endpoints:** `final` → `core` (EVIDENCE). **Optional requirements:** None.

**Payload:** Current candidate digest, FinalPass, PICConformance and evidence references.

**Purpose:** Commit final attestation; Core records an attestation for this exact candidate.

**Precondition:** System-level criteria pass; approval and evidence remain current.

**Postcondition:** Core records an attestation for this exact candidate.

**Failure:** Failed checks return defects; no release permission is emitted.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** System-level criteria pass; approval and evidence remain current.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Independent Assurance account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I017 — Authorise exact handoff

**Logical endpoints:** `core` → `release` (AUTHORITY). **Optional requirements:** None.

**Payload:** Candidate digest, current final attestation, destination and idempotency key.

**Purpose:** Authorise exact handoff; Release controller rechecks and atomically hands off the attested package.

**Precondition:** ApprovedCurrent ∧ OwnersAccepted ∧ FinalPass ∧ PICConformance ∧ EvidenceCurrent.

**Postcondition:** Release controller rechecks and atomically hands off the attested package.

**Failure:** Changed digest or revoked authority blocks release.

**Authority limit:** Scoped release authority only; no implicit infrastructure deployment.

**State dependency:** ApprovedCurrent ∧ OwnersAccepted ∧ FinalPass ∧ PICConformance ∧ EvidenceCurrent.

**Original rule:** Released ⇒ ApprovedCurrent ∧ OwnersAccepted ∧ FinalPass ∧ PICConformance ∧ EvidenceCurrent ∧ ReleaseAuthorised.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I018 — Deliver governed workflow

**Logical endpoints:** `release` → `workflow` (DATA). **Optional requirements:** None.

**Payload:** Immutable domain package, operating contract, version pins, PIC trace and release receipt.

**Purpose:** Deliver governed workflow; A domain-specific package is delivered with its inherited operating rules.

**Precondition:** All release guards pass at commit.

**Postcondition:** A domain-specific package is delivered with its inherited operating rules.

**Failure:** Unknown receipt remains uncertain and must reconcile.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** All release guards pass at commit.

**Original rule:** Required inherited guards must be implemented in the child; package delivery is not production deployment.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → MOA Workflow target account / external destination.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I019 — Admit bounded repair

**Logical endpoints:** `core` → `exec` (REPAIR). **Optional requirements:** None.

**Payload:** Defect scope, attempt increment, narrowed authority and remaining budget.

**Purpose:** Admit bounded repair; A bounded replacement attempt is admitted.

**Precondition:** Rejected task; retries below limit; dependency and authority guards rechecked.

**Postcondition:** A bounded replacement attempt is admitted.

**Failure:** Exhaustion or uncertain side effect causes escalation/termination.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Rejected task; retries below limit; dependency and authority guards rechecked.

**Original rule:** retryCount < retryLimit ∧ remainingBudget ≥ requested; changed artifacts invalidate dependent evidence.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Engineering Control account → Construction / Execution account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I020 — Persist approved contract

**Logical endpoints:** `contract` → `mem` (STATE). **Optional requirements:** memory.

**Payload:** Approved revision and provenance.

**Purpose:** Persist approved contract; Versioned record is proposed for scoped persistence.

**Precondition:** Memory enabled; write allowed by retention and scope policy.

**Postcondition:** Versioned record is proposed for scoped persistence.

**Failure:** No durable acknowledgement means the record is not persisted.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Memory enabled; write allowed by retention and scope policy.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I021 — Persist run checkpoint

**Logical endpoints:** `core` → `mem` (STATE). **Optional requirements:** memory.

**Payload:** Run snapshot, pins, ownership, attempts and evidence references.

**Purpose:** Persist run checkpoint; Versioned record is proposed for scoped persistence.

**Precondition:** Memory enabled; write allowed by retention and scope policy.

**Postcondition:** Versioned record is proposed for scoped persistence.

**Failure:** No durable acknowledgement means the record is not persisted.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Memory enabled; write allowed by retention and scope policy.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I022 — Record work provenance

**Logical endpoints:** `exec` → `mem` (STATE). **Optional requirements:** memory.

**Payload:** Artifact references, task outcome and scope.

**Purpose:** Record work provenance; Versioned record is proposed for scoped persistence.

**Precondition:** Memory enabled; write allowed by retention and scope policy.

**Postcondition:** Versioned record is proposed for scoped persistence.

**Failure:** No durable acknowledgement means the record is not persisted.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Memory enabled; write allowed by retention and scope policy.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Construction / Execution account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I023 — Retain evidence index

**Logical endpoints:** `verify` → `mem` (STATE). **Optional requirements:** memory.

**Payload:** Current evidence digests and test provenance.

**Purpose:** Retain evidence index; Versioned record is proposed for scoped persistence.

**Precondition:** Memory enabled; write allowed by retention and scope policy.

**Postcondition:** Versioned record is proposed for scoped persistence.

**Failure:** No durable acknowledgement means the record is not persisted.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Memory enabled; write allowed by retention and scope policy.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Independent Assurance account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I024 — Validate memory access

**Logical endpoints:** `mem` → `scope` (AUTHORITY). **Optional requirements:** memory.

**Payload:** Identity, scope, purpose, operation and record provenance.

**Purpose:** Validate memory access; Access is denied or narrowed before store access.

**Precondition:** A read or write request exists.

**Postcondition:** Access is denied or narrowed before store access.

**Failure:** Missing provenance or authority denies access.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** A read or write request exists.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I025 — Read or write scoped records

**Logical endpoints:** `scope` → `store` (STATE). **Optional requirements:** memory.

**Payload:** Authorised operation, allowed record keys and expected versions.

**Purpose:** Read or write scoped records; Store returns records or a durable versioned acknowledgement.

**Precondition:** Current policy allows exact scoped operation.

**Postcondition:** Store returns records or a durable versioned acknowledgement.

**Failure:** Conflict/unavailability returns explicit failure.

**Authority limit:** Narrow storage access; never execution authority.

**State dependency:** Current policy allows exact scoped operation.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I026 — Return authorised history

**Logical endpoints:** `store` → `retrieve` (DATA). **Optional requirements:** memory.

**Payload:** Scoped records with source, digest, timestamp and version.

**Purpose:** Return authorised history; Retrieval can select relevant context within the authorised set.

**Precondition:** Access scope validated for this query.

**Postcondition:** Retrieval can select relevant context within the authorised set.

**Failure:** No authorised records returns empty context.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Access scope validated for this query.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I027 — Request planning context

**Logical endpoints:** `plan` → `mem` (DATA). **Optional requirements:** memory.

**Payload:** Scoped query and current contract reference.

**Purpose:** Request planning context; Memory evaluates contextual retrieval request.

**Precondition:** Memory enabled and identity known.

**Postcondition:** Memory evaluates contextual retrieval request.

**Failure:** Denied access leaves planning without recalled context.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Memory enabled and identity known.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I028 — Supply planning context

**Logical endpoints:** `retrieve` → `plan` (DATA). **Optional requirements:** memory.

**Payload:** Relevant history and explicit freshness/provenance metadata.

**Purpose:** Supply planning context; Planner may use context; current approvals and evidence still required.

**Precondition:** Results are authorised and relevant.

**Postcondition:** Planner may use context; current approvals and evidence still required.

**Failure:** Stale records cannot become current acceptance.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Results are authorised and relevant.

**Original rule:** Context ⊆ authorised records; context cannot widen authority.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I029 — Prepare consistent snapshot

**Logical endpoints:** `mem` → `checkpoint` (STATE). **Optional requirements:** memory.

**Payload:** Core snapshot with all referenced digests and epoch.

**Purpose:** Prepare consistent snapshot; Checkpoint interface creates a complete manifest.

**Precondition:** Memory enabled; snapshot consistent with run revision.

**Postcondition:** Checkpoint interface creates a complete manifest.

**Failure:** Missing artifact invalidates snapshot.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Memory enabled; snapshot consistent with run revision.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I030 — Commit or read checkpoint

**Logical endpoints:** `checkpoint` → `store` (STATE). **Optional requirements:** memory.

**Payload:** Atomic checkpoint manifest and conditional revision.

**Purpose:** Commit or read checkpoint; Durable checkpoint is committed or fetched.

**Precondition:** Scope and integrity validated by Memory controller.

**Postcondition:** Durable checkpoint is committed or fetched.

**Failure:** Version conflict or partial manifest blocks success.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Scope and integrity validated by Memory controller.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I031 — Restore with revalidation

**Logical endpoints:** `checkpoint` → `core` (STATE). **Optional requirements:** memory.

**Payload:** Verified snapshot, pins, references and new restoration epoch.

**Purpose:** Restore with revalidation; Core may resume only after all dispatch guards are re-evaluated.

**Precondition:** Checkpoint retrieved; digests intact; current authority rechecked.

**Postcondition:** Core may resume only after all dispatch guards are re-evaluated.

**Failure:** Invalid pins or revoked authority suspend restoration.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Checkpoint retrieved; digests intact; current authority rechecked.

**Original rule:** Resume ⇒ checkpointValid ∧ authorityCurrent ∧ pinsAvailable.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I032 — Bind scoped continuity

**Logical endpoints:** `mem` → `workflow` (PATTERN). **Optional requirements:** memory.

**Payload:** Domain memory interface, allowed scopes, retention and restoration obligations.

**Purpose:** Bind scoped continuity; Child specification includes scoped continuity guards and tests.

**Precondition:** Generated workflow declares continuity requirement; module enabled.

**Postcondition:** Child specification includes scoped continuity guards and tests.

**Failure:** Unbound required continuity blocks conformance.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Generated workflow declares continuity requirement; module enabled.

**Original rule:** Memory adds continuity, not permissions; runtime operation is a future implementation obligation.

**Proposed AWS transport:** Pinned S3 WorkflowSpec/trace manifest reference through authenticated custom PIC interface; deterministic guard evaluates current digests.

**Deployment crossing:** Engineering Control account → MOA Workflow target account / external destination.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I033 — Capture attributed outcomes

**Logical endpoints:** `workflow` → `outcomes` (EVIDENCE). **Optional requirements:** learning.

**Payload:** Permitted domain outcome events attributed to workflow version.

**Purpose:** Capture attributed outcomes; Version-attributed observations enter the learning dataset.

**Precondition:** Learning enabled; capture authorised and provenance known.

**Postcondition:** Version-attributed observations enter the learning dataset.

**Failure:** Missing provenance excludes the observation.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Learning enabled; capture authorised and provenance known.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** MOA Workflow target account / external destination → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I034 — Capture attributed outcomes

**Logical endpoints:** `verify` → `outcomes` (EVIDENCE). **Optional requirements:** learning.

**Payload:** Engineering test outcomes and failures attributed to candidate version.

**Purpose:** Capture attributed outcomes; Version-attributed observations enter the learning dataset.

**Precondition:** Learning enabled; capture authorised and provenance known.

**Postcondition:** Version-attributed observations enter the learning dataset.

**Failure:** Missing provenance excludes the observation.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Learning enabled; capture authorised and provenance known.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Independent Assurance account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I035 — Propose bounded improvement

**Logical endpoints:** `outcomes` → `candidate` (DATA). **Optional requirements:** learning.

**Payload:** Version-attributed outcome dataset and baseline.

**Purpose:** Propose bounded improvement; Candidate diff and evaluation plan are created.

**Precondition:** Adequate provenance and a defined improvement hypothesis.

**Postcondition:** Candidate diff and evaluation plan are created.

**Failure:** Insufficient data prevents evaluable proposal.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Adequate provenance and a defined improvement hypothesis.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I036 — Evaluate candidate against baseline

**Logical endpoints:** `candidate` → `evaluate` (DATA). **Optional requirements:** learning.

**Payload:** Immutable candidate digest, baseline, dataset and protocol.

**Purpose:** Evaluate candidate against baseline; Held-out tests and safety regressions produce a report.

**Precondition:** Candidate is separate from active run versions.

**Postcondition:** Held-out tests and safety regressions produce a report.

**Failure:** Failed or invalid evaluation makes promotion ineligible.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Candidate is separate from active run versions.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Engineering Control account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I037 — Submit evaluation evidence

**Logical endpoints:** `evaluate` → `promote` (EVIDENCE). **Optional requirements:** learning.

**Payload:** Candidate-bound test report, uncertainty and conformance result.

**Purpose:** Submit evaluation evidence; Promotion gate checks eligibility and authority.

**Precondition:** Protocol completed without invalidating leakage or missing cases.

**Postcondition:** Promotion gate checks eligibility and authority.

**Failure:** Failed/stale report blocks promotion.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Protocol completed without invalidating leakage or missing cases.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Independent Assurance account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I038 — Authorise scoped promotion

**Logical endpoints:** `user` → `promote` (AUTHORITY). **Optional requirements:** learning.

**Payload:** Candidate digest and change-scope approval.

**Purpose:** Authorise scoped promotion; Gate has a version-specific approval to evaluate.

**Precondition:** Authorised stakeholder or delegated change policy.

**Postcondition:** Gate has a version-specific approval to evaluate.

**Failure:** Unauthorised or stale approval is rejected.

**Authority limit:** Change-scope approval; no authority to rewrite active pins.

**State dependency:** Authorised stakeholder or delegated change policy.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** HTTPS through authenticated API; application approval binds exact digest. Callback broker may signal Step Functions only after ledger commit.

**Deployment crossing:** Authorised business stakeholders and task owners → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I039 — Publish eligible future version

**Logical endpoints:** `promote` → `versions` (STATE). **Optional requirements:** learning.

**Payload:** Signed promotion event and immutable version set.

**Purpose:** Publish eligible future version; Version becomes eligible for future-run selection.

**Precondition:** Evaluated ∧ Conformant ∧ Authorised.

**Postcondition:** Version becomes eligible for future-run selection.

**Failure:** Failed atomic write leaves prior default active.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Evaluated ∧ Conformant ∧ Authorised.

**Original rule:** Promotion never edits an active run pin.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I040 — Pin a new run version

**Logical endpoints:** `versions` → `core` (STATE). **Optional requirements:** learning.

**Payload:** Eligible version set and compatibility proof.

**Purpose:** Pin a new run version; Core pins exact pattern/capability/policy versions.

**Precondition:** New run only; no dispatch has begun.

**Postcondition:** Core pins exact pattern/capability/policy versions.

**Failure:** Unknown version blocks admission.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** New run only; no dispatch has begun.

**Original rule:** Active(r) ⇒ pin(r,t+1)=pin(r,t).

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I041 — Report monitored regression

**Logical endpoints:** `outcomes` → `rollback` (EVIDENCE). **Optional requirements:** learning.

**Payload:** Version-attributed regression against a defined criterion.

**Purpose:** Report monitored regression; Rollback controller requests authorised future-default reversal.

**Precondition:** Sufficient monitoring evidence; prior eligible version identifiable.

**Postcondition:** Rollback controller requests authorised future-default reversal.

**Failure:** Uncertain regression is investigated; no silent rewrite.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Sufficient monitoring evidence; prior eligible version identifiable.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I042 — Authorise rollback policy

**Logical endpoints:** `user` → `rollback` (AUTHORITY). **Optional requirements:** learning.

**Payload:** Allowed target version and reversal scope.

**Purpose:** Authorise rollback policy; Future default may be changed within approved scope.

**Precondition:** Authority covers the proposed rollback.

**Postcondition:** Future default may be changed within approved scope.

**Failure:** No authority blocks the change.

**Authority limit:** Rollback selection scope only.

**State dependency:** Authority covers the proposed rollback.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** HTTPS through authenticated API; application approval binds exact digest. Callback broker may signal Step Functions only after ledger commit.

**Deployment crossing:** Authorised business stakeholders and task owners → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I043 — Select prior eligible default

**Logical endpoints:** `rollback` → `versions` (STATE). **Optional requirements:** learning.

**Payload:** Known-good compatible version and authorised rollback record.

**Purpose:** Select prior eligible default; Future-run default changes; current pins are preserved.

**Precondition:** Rollback authorised; version still eligible.

**Postcondition:** Future-run default changes; current pins are preserved.

**Failure:** No valid prior version pauses new admission.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Rollback authorised; version still eligible.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I044 — Declare missing capability

**Logical endpoints:** `cap` → `need` (CAPABILITY). **Optional requirements:** tools.

**Payload:** Unmatched capability, domain schema and permitted effect scope.

**Purpose:** Declare missing capability; Adapter requirement is recorded.

**Precondition:** No eligible binding exists.

**Postcondition:** Adapter requirement is recorded.

**Failure:** Affected tasks remain blocked.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** No eligible binding exists.

**Original rule:** Available adapter ≠ authorised effect. Every effect must satisfy current narrowed scope and observed postconditions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I045 — Request reviewed adapter

**Logical endpoints:** `need` → `adapters` (CAPABILITY). **Optional requirements:** tools.

**Payload:** Adapter requirement and qualification tests.

**Purpose:** Request reviewed adapter; Registry looks up or receives a separately reviewed implementation.

**Precondition:** Requirement approved for tool lifecycle review.

**Postcondition:** Registry looks up or receives a separately reviewed implementation.

**Failure:** No qualified adapter means no execution.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Requirement approved for tool lifecycle review.

**Original rule:** Available adapter ≠ authorised effect. Every effect must satisfy current narrowed scope and observed postconditions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I046 — Return qualified binding

**Logical endpoints:** `adapters` → `cap` (CAPABILITY). **Optional requirements:** tools.

**Payload:** Pinned adapter digest, effect schema and qualification evidence.

**Purpose:** Return qualified binding; Capability registry may bind it.

**Precondition:** Adapter qualifies for required interfaces.

**Postcondition:** Capability registry may bind it.

**Failure:** Qualification mismatch blocks binding.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Adapter qualifies for required interfaces.

**Original rule:** Available adapter ≠ authorised effect. Every effect must satisfy current narrowed scope and observed postconditions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I047 — Request effect authority

**Logical endpoints:** `exec` → `boundary` (AUTHORITY). **Optional requirements:** tools.

**Payload:** Requested effect, run/task identity and adapter binding.

**Purpose:** Request effect authority; Boundary evaluates narrowed effect permissions.

**Precondition:** Dispatched task requires an external effect.

**Postcondition:** Boundary evaluates narrowed effect permissions.

**Failure:** Denied request produces no effect.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Dispatched task requires an external effect.

**Original rule:** Available adapter ≠ authorised effect. Every effect must satisfy current narrowed scope and observed postconditions.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Construction / Execution account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I048 — Permit scoped effect

**Logical endpoints:** `boundary` → `gateway` (AUTHORITY). **Optional requirements:** tools.

**Payload:** Expiring effect capability, adapter version, limits and idempotency key.

**Purpose:** Permit scoped effect; Gateway may execute only the admitted effect.

**Precondition:** All permission intersections and budgets pass.

**Postcondition:** Gateway may execute only the admitted effect.

**Failure:** Expired/revoked scope blocks invocation.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** All permission intersections and budgets pass.

**Original rule:** Available adapter ≠ authorised effect. Every effect must satisfy current narrowed scope and observed postconditions.

**Proposed AWS transport:** Admission adapter → authenticated AgentCore Gateway; HTTPS/MCP target; Policy ENFORCE plus custom current-scope checks.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I049 — Validate observed effect

**Logical endpoints:** `gateway` → `effect` (EVIDENCE). **Optional requirements:** tools.

**Payload:** Receipt, observed state and measured use.

**Purpose:** Validate observed effect; Effect validator checks requested postcondition.

**Precondition:** Invocation completed or requires reconciliation.

**Postcondition:** Effect validator checks requested postcondition.

**Failure:** Unknown effect remains unresolved.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Invocation completed or requires reconciliation.

**Original rule:** Available adapter ≠ authorised effect. Every effect must satisfy current narrowed scope and observed postconditions.

**Proposed AWS transport:** Admission adapter → authenticated AgentCore Gateway; HTTPS/MCP target; Policy ENFORCE plus custom current-scope checks.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I050 — Attach effect attestation

**Logical endpoints:** `effect` → `verify` (EVIDENCE). **Optional requirements:** tools.

**Payload:** Validated effect result or reconciliation defect.

**Purpose:** Attach effect attestation; Task verification includes actual effect evidence.

**Precondition:** Observation provenance matches invocation and current task.

**Postcondition:** Task verification includes actual effect evidence.

**Failure:** Unresolved effect blocks task acceptance.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Observation provenance matches invocation and current task.

**Original rule:** Available adapter ≠ authorised effect. Every effect must satisfy current narrowed scope and observed postconditions.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Engineering Control account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I051 — Request capacity admission

**Logical endpoints:** `core` → `queue` (CONTROL). **Optional requirements:** recovery.

**Payload:** Ready task, cost estimate, deadline and tenant budget.

**Purpose:** Request capacity admission; Task is queued or gets a reserved budget.

**Precondition:** All non-capacity dispatch guards pass.

**Postcondition:** Task is queued or gets a reserved budget.

**Failure:** Insufficient budget blocks admission.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** All non-capacity dispatch guards pass.

**Original rule:** spent + Σreserved ≤ budget; leases fence stale attempts; finite retry policy must include timeouts and fair scheduling assumptions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I052 — Lease admitted task

**Logical endpoints:** `queue` → `leases` (CONTROL). **Optional requirements:** recovery.

**Payload:** Task id, budget reservation and attempt limits.

**Purpose:** Lease admitted task; One active attempt lease is issued.

**Precondition:** Reservation is atomically granted.

**Postcondition:** One active attempt lease is issued.

**Failure:** Lease failure releases reservation or reconciles it.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Reservation is atomically granted.

**Original rule:** spent + Σreserved ≤ budget; leases fence stale attempts; finite retry policy must include timeouts and fair scheduling assumptions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I053 — Return fenced dispatch lease

**Logical endpoints:** `leases` → `core` (AUTHORITY). **Optional requirements:** recovery.

**Payload:** Current fencing token, expiry and reservation.

**Purpose:** Return fenced dispatch lease; Core binds token to dispatched work.

**Precondition:** Lease belongs to admitted task attempt.

**Postcondition:** Core binds token to dispatched work.

**Failure:** Stale token prevents commit.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Lease belongs to admitted task attempt.

**Original rule:** spent + Σreserved ≤ budget; leases fence stale attempts; finite retry policy must include timeouts and fair scheduling assumptions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I054 — Classify repair eligibility

**Logical endpoints:** `core` → `retry` (REPAIR). **Optional requirements:** recovery.

**Payload:** Failure class, retries, unresolved effects and budget.

**Purpose:** Classify repair eligibility; Repair controller proposes retry, reconcile or stop.

**Precondition:** A task failed or timed out.

**Postcondition:** Repair controller proposes retry, reconcile or stop.

**Failure:** Unknown side effects cannot be blindly retried.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** A task failed or timed out.

**Original rule:** spent + Σreserved ≤ budget; leases fence stale attempts; finite retry policy must include timeouts and fair scheduling assumptions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I055 — Return bounded recovery decision

**Logical endpoints:** `retry` → `core` (REPAIR). **Optional requirements:** recovery.

**Payload:** Policy-bound repair proposal or terminal reason.

**Purpose:** Return bounded recovery decision; Core rechecks guards before re-dispatch.

**Precondition:** Retries and budget remain within contract.

**Postcondition:** Core rechecks guards before re-dispatch.

**Failure:** Exhaustion terminates or escalates.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Retries and budget remain within contract.

**Original rule:** spent + Σreserved ≤ budget; leases fence stale attempts; finite retry policy must include timeouts and fair scheduling assumptions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I056 — Report lifecycle telemetry

**Logical endpoints:** `core` → `observe` (STATE). **Optional requirements:** recovery.

**Payload:** Transitions, timings, queue length and measured resource use.

**Purpose:** Report lifecycle telemetry; Operational bottlenecks become measurable.

**Precondition:** Telemetry allowed by policy.

**Postcondition:** Operational bottlenecks become measurable.

**Failure:** Telemetry loss is explicit; no fabricated capacity claim.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Telemetry allowed by policy.

**Original rule:** spent + Σreserved ≤ budget; leases fence stale attempts; finite retry policy must include timeouts and fair scheduling assumptions.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I057 — Inform capacity planning

**Logical endpoints:** `observe` → `queue` (DATA). **Optional requirements:** recovery.

**Payload:** Measured utilisation, service times and overload alerts.

**Purpose:** Inform capacity planning; Admission policy can use approved capacity estimates.

**Precondition:** Measurements have known scope and time window.

**Postcondition:** Admission policy can use approved capacity estimates.

**Failure:** Stale metrics trigger conservative configured limits.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Measurements have known scope and time window.

**Original rule:** spent + Σreserved ≤ budget; leases fence stale attempts; finite retry policy must include timeouts and fair scheduling assumptions.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I058 — Request domain analysis

**Logical endpoints:** `plan` → `domain` (CAPABILITY). **Optional requirements:** specialists.

**Payload:** Scoped domain questions and contract.

**Purpose:** Request domain analysis; Receiving component incorporates reviewed specialist work under its existing authority.

**Precondition:** Specialist capability is qualified and scope is delegated.

**Postcondition:** Receiving component incorporates reviewed specialist work under its existing authority.

**Failure:** Invalid specialist output is rejected without bypassing the normal gates.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Specialist capability is qualified and scope is delegated.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I059 — Return domain advice

**Logical endpoints:** `domain` → `plan` (EVIDENCE). **Optional requirements:** specialists.

**Payload:** Proposed constraints, scenarios and evidence.

**Purpose:** Return domain advice; Receiving component incorporates reviewed specialist work under its existing authority.

**Precondition:** Specialist capability is qualified and scope is delegated.

**Postcondition:** Receiving component incorporates reviewed specialist work under its existing authority.

**Failure:** Invalid specialist output is rejected without bypassing the normal gates.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Specialist capability is qualified and scope is delegated.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I060 — Delegate qualified construction

**Logical endpoints:** `exec` → `construct` (CAPABILITY). **Optional requirements:** specialists.

**Payload:** Scoped subtask with one accountable owner.

**Purpose:** Delegate qualified construction; Receiving component incorporates reviewed specialist work under its existing authority.

**Precondition:** Specialist capability is qualified and scope is delegated.

**Postcondition:** Receiving component incorporates reviewed specialist work under its existing authority.

**Failure:** Invalid specialist output is rejected without bypassing the normal gates.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Specialist capability is qualified and scope is delegated.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Construction / Execution account → Construction / Execution account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I061 — Return specialist artifact

**Logical endpoints:** `construct` → `exec` (EVIDENCE). **Optional requirements:** specialists.

**Payload:** Candidate, tests and provenance.

**Purpose:** Return specialist artifact; Receiving component incorporates reviewed specialist work under its existing authority.

**Precondition:** Specialist capability is qualified and scope is delegated.

**Postcondition:** Receiving component incorporates reviewed specialist work under its existing authority.

**Failure:** Invalid specialist output is rejected without bypassing the normal gates.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Specialist capability is qualified and scope is delegated.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Construction / Execution account → Construction / Execution account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I062 — Request independent assurance

**Logical endpoints:** `verify` → `assure` (CAPABILITY). **Optional requirements:** specialists.

**Payload:** Risk-scoped test brief and candidate digest.

**Purpose:** Request independent assurance; Receiving component incorporates reviewed specialist work under its existing authority.

**Precondition:** Specialist capability is qualified and scope is delegated.

**Postcondition:** Receiving component incorporates reviewed specialist work under its existing authority.

**Failure:** Invalid specialist output is rejected without bypassing the normal gates.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Specialist capability is qualified and scope is delegated.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Independent Assurance account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I063 — Return assurance findings

**Logical endpoints:** `assure` → `verify` (EVIDENCE). **Optional requirements:** specialists.

**Payload:** Reproducible findings and evidence.

**Purpose:** Return assurance findings; Receiving component incorporates reviewed specialist work under its existing authority.

**Precondition:** Specialist capability is qualified and scope is delegated.

**Postcondition:** Receiving component incorporates reviewed specialist work under its existing authority.

**Failure:** Invalid specialist output is rejected without bypassing the normal gates.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Specialist capability is qualified and scope is delegated.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Independent Assurance account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I064 — Validate proposed plan

**Logical endpoints:** `plan` → `core` (STATE). **Optional requirements:** None.

**Payload:** Plan digest, owned DAG and contract compatibility report.

**Purpose:** Validate proposed plan; Core validates and records the approved plan revision before PIC specialisation.

**Precondition:** Planner has produced a complete proposal.

**Postcondition:** Core validates and records the approved plan revision before PIC specialisation.

**Failure:** Invalid DAG, ownership or contract mismatch blocks PIC admission.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Planner has produced a complete proposal.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I065 — Admit current architecture plan

**Logical endpoints:** `core` → `pic` (AUTHORITY). **Optional requirements:** None.

**Payload:** Core-attested plan digest and current contract pin.

**Purpose:** Admit current architecture plan; PIC may specialise only this admitted plan revision.

**Precondition:** Plan is validated against the approved contract.

**Postcondition:** PIC may specialise only this admitted plan revision.

**Failure:** Unapproved or stale plan cannot progress.

**Authority limit:** Plan-specialisation scope only; not permission to execute.

**State dependency:** Plan is validated against the approved contract.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Versioned application message through Lambda/Runtime adapter with SigV4; Core dispatch owns current state transitions.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I066 — Supply accountable owner attestation

**Logical endpoints:** `core` → `verify` (AUTHORITY). **Optional requirements:** None.

**Payload:** Authenticated owner decision bound to task and artifact digest.

**Purpose:** Supply accountable owner attestation; Verifier can combine owner acceptance with independent test evidence.

**Precondition:** Owner identity matches the current task assignment.

**Postcondition:** Verifier can combine owner acceptance with independent test evidence.

**Failure:** Missing or mismatched owner decision prevents acceptance.

**Authority limit:** Owner acceptance of exact output; no independent release authority.

**State dependency:** Owner identity matches the current task assignment.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.

**Deployment crossing:** Engineering Control account → Independent Assurance account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I067 — Persist evaluated version history

**Logical endpoints:** `versions` → `mem` (STATE). **Optional requirements:** learning, memory.

**Payload:** Immutable version set, evaluation/provenance and scoped promotion record.

**Purpose:** Persist evaluated version history; Future-version records can survive a session boundary.

**Precondition:** Both Learning and Memory enabled; scoped write permitted.

**Postcondition:** Future-version records can survive a session boundary.

**Failure:** No durable acknowledgement means no persistent version history.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Both Learning and Memory enabled; scoped write permitted.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

### I068 — Restore authorised version metadata

**Logical endpoints:** `retrieve` → `versions` (STATE). **Optional requirements:** learning, memory.

**Payload:** Scoped immutable version records and signed promotion provenance.

**Purpose:** Restore authorised version metadata; Registry may recover eligible records after conformance and authority revalidation.

**Precondition:** Both Learning and Memory enabled; version records passed current access checks.

**Postcondition:** Registry may recover eligible records after conformance and authority revalidation.

**Failure:** Missing or stale authority prevents new-run selection.

**Authority limit:** No new authority; receiver rechecks current scope.

**State dependency:** Both Learning and Memory enabled; version records passed current access checks.

**Original rule:** The receiver validates the payload and its version before applying the stated postcondition.

**Proposed AWS transport:** AWS SDK / SigV4; custom Lambda controller; DynamoDB conditional write or transaction, exact S3 references where relevant.

**Deployment crossing:** Engineering Control account → Engineering Control account.

**AWS boundary:** One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.

