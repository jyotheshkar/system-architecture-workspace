# Agentic Core | AWS Enterprise System Design Architecture

**Proposed reference design; no AWS infrastructure has been deployed by this deliverable.** Reviewed 6 October 2026. Costs are excluded.

Source: Reference Architecture schema version 1.0.0; current source snapshot includes **35 capabilities, 68 typed interfaces and five optional modules**. Source SHA-256: `6a00568419c9d4fd2d4ceccac30fe0b6b45737aabb78ba00210609f095fa97af`. Deployment/supporting services do not introduce new AC responsibilities.

## Security and operating model

The enterprise design separates authority, candidate generation, independent evidence, product operation and platform administration. These boundaries exist only when real IAM, resource, key, network and application guards enforce them. A diagram is not an isolation test. Privileged platform/security administrators remain trusted operating roles; break-glass changes are separately authorised, logged and reconciled.

### Account and environment boundaries

| Boundary | Role | Prohibited interpretation |
|---|---|---|
| Engineering Control | Exact contract/run state; current admission; PIC; release | Models cannot approve or self-release |
| Build / Execution | Bounded candidate generation and integration | Builder result cannot become acceptance |
| Independent Assurance | Exact read-only candidate tests, attestation and evidence | Validator cannot mutate candidate or deploy child product |
| Consumer / target | Receive MOA package; separate domain operation | Package handoff is not unlimited production authority |
| Security / Audit | Investigation and controlled incident response | Security logs do not supply task acceptance |
| Log Archive | Restricted central log copies | Archive is not an application-worker account |
| Platform delivery | Reviewed infrastructure/code deployment | Pipeline approval is not business contract or product release approval |

Repeat the topology in separate Dev, Preprod and Prod environments. Reuse an IaC template, not runtime state, secrets, keys, approvals or memory namespaces. Keep landing-zone management free of workloads. Organization SCPs restrict member identities but grant no privileges and do not restrict management-account/service-linked-role actions.

### Correct physical placement

Organization → account → selected Region → regional managed services plus customer VPC. Customer VPC → AZ → private subnet → task/endpoint ENIs. Global account/organization authority is a separate annotation. Managed Step Functions, Lambda, DynamoDB, S3, API Gateway, Cognito, ECR, Bedrock, AgentCore and CloudWatch resources are outside customer subnet boxes.

Fargate task pools use at least two eligible AZ subnets. A task occupies one AZ; completed work survives via exact artifact/evidence storage rather than a duplicated container workspace. Builder and validator do not share a task, account role or mutable candidate namespace.

AgentCore Runtime may connect to private resources through service-created customer ENIs. PrivateLink exposes supported AgentCore API planes privately. Lambda customer-VPC attachment uses Hyperplane ENIs while function execution remains in Lambda's own managed VPC. ENI connectivity does not mean that the managed service or its host infrastructure belongs to the customer VPC.

### Service identities and permissions

| Identity | Permitted purpose | Denied authority |
|---|---|---|
| Intake / contract proposer | Verify identity, propose reviewed revisions | Self-approve or widen stakeholder authority |
| Business approver | Approve exact authorised contract digest | General internal state mutation |
| Planner / domain Runtime | Read scoped requirement/context; propose DAG/advice | Acceptance, release or unrestricted effects |
| Core admission | Commit guarded transitions and bounded dispatch | Waive current policy or evidence |
| Build task role | Read admitted input versions; write candidate namespace | Other-run data, evidence mutation or release |
| Task execution role | Pull qualified images, emit configured logs | Application business permissions |
| Assurance role | Read exact candidate; write evidence; scoped attestation signing | Candidate mutation, contract approval or publishing |
| Completion broker | Validate scoped completion; deduplicate and resume protected transport | Treat completion token as acceptance |
| Effect admission / adapter | Invoke only admitted qualified effect | Direct-target policy bypass |
| Release role | Hand off the exact current attested package | New arbitrary artifacts or unapproved deployment |

Task IAM credentials are available to application code within a task; task roles alone do not implement a per-record business constraint. Use actual scoped resource policies and qualified wrappers. One accountable task owner is independently authenticated through I066; that person may differ from the original contract approver.

### Cross-account completion broker

Keep the parent state machine and callback broker in Control. A worker completion envelope includes verified caller, tenant/project/run/task/attempt identifiers, expected ledger revision, current fence, contract/plan pins, exact object version/digest, status and measured use. The broker validates the admitted attempt, authority and artifact references, records result transport/provenance idempotently, then signals the protected task token as a Control-account principal. Independent owner, test, PIC and final decisions remain separate.

Step Functions callback tokens require a principal in the state-machine account. Cross-account supported dispatch uses scoped target-role trust/credentials; .sync uses polling. Cancellation is best-effort. If the broker commits state then cannot signal transport, reconcile the durable completion key; do not repeat external effects or invent acceptance.

### Private image, data, log and model paths

Modern Fargate private ECR pull uses ecr.api/ecr.dkr interface endpoints and S3 image-layer access; no-public-network awslogs needs CloudWatch Logs endpoint access. Application calls need their own approved service endpoints and scoped IAM/resource policies. Check regional endpoint support and DNS/security groups before deployment admission.

AgentCore supplies data-plane, control-plane and Gateway PrivateLink endpoints. Endpoint policy IAM-principal controls do not establish OAuth end-user scope; OAuth requires the appropriate wildcard endpoint principal while the verified application/Gateway authorizer and contextual guard enforce user/task authority. Runtime VPC networking and Gateway private-target VPC Lattice networking are distinct paths.

No public task IP or broad Internet route is assumed. A NAT route is connectivity, not a destination allowlist or firewall. Pre-stage qualified images for isolated pulls; first pull-through-cache retrieval may require upstream access. Approved external calls use the qualified admission/adapter path, with no equivalent direct-worker bypass.

### Data, key and evidence governance

Separate contracts, candidates, validation evidence, pattern/qualification manifests, released packages, semantic context, audit and telemetry. Tag scopes and enforce tenant/project/purpose at the receiver; a client-supplied tag or recalled document cannot grant authority. Bucket-owner-enforced S3 object ownership simplifies cross-account policies. Exact reads require versionId and digest, applicable bucket/resource policies, consumer IAM permission and resource-owner KMS permission.

Encryption keys and asymmetric SIGN_VERIFY attestation keys serve different purposes. Record signing algorithm, key identity, digest, approved contract, current version and timestamp in the attestation context. Signature validity supports provenance/integrity under key custody; it does not establish the truth of the assertion or current authority. Object Lock protects configured object versions during retention; new versions and delete markers remain possible. Pin exact versions rather than mutable keys.

Approve data classification, retention/purge, audit access and inference geography. Single-Region control does not imply all model processing remains in that Region. Bedrock profiles and AgentCore Memory/Policy/Evaluation processing geography require independent checks. No global inference profile is assumed by default.

### Release, external effects and uncertainty

The current release conjunction is `ApprovedCurrent ∧ OwnersAccepted ∧ FinalPass ∧ PICConformance ∧ EvidenceCurrent ∧ ReleaseAuthorised`. Core receives I012/I016 and independent I066, authorises I017, then Release performs I018. There is no direct Final→Release shortcut.

No atomic transaction covers S3, DynamoDB, callbacks and an external system. Verify exact artifact availability, atomically commit guarded state plus outbox in Control, then deliver idempotently/reconcile destination receipt. Distinguish release intent, confirmed handoff, separately approved deployment and domain outcomes. Specify cancellation/revocation at the authority commit point; do not repeat an unknown non-idempotent effect.

Tool-module requests pass qualified adapters and custom scope/schema/reservation/fence checks before authenticated Gateway Policy ENFORCE and scoped credentials. Independently observed target state validates the requested postcondition. A successful HTTP status or transport receipt alone may be insufficient.

### Optional module behaviour

Memory off exposes no cross-run application restore/retrieval/history and rejects continuity-required contracts. Exact operational integrity records and service/audit retention are a disclosed AWS adaptation; they do not silently enable semantic continuity. Learning without Memory has session-bound application version history. I067/I068 require both. Active runs snapshot immutable version sets; future-default changes cannot mutate them.

Recovery off retains Core's basic bounded retries/deadlines but does not imply distributed lease/capacity management. Baseline cloud logs/security monitoring exist as operations; the optional observe responsibility adds explicit capacity/recovery analysis. Tools off denies governed external-effect workloads. Specialist pools are qualified extensions, not mandatory fixed agent counts.

### Platform deployment and generated-product lifecycle

Reviewed IaC/code/config flows through Dev → production-like Preprod → authorised Prod deployment under scoped cross-account roles. Include policy/schema compatibility, image/manifest digests, negative guard tests, callback/outbox fault tests, isolation checks, smoke tests and recovery exercises. CloudFormation change sets preview impacts but cannot guarantee a successful update. Bootstrap/self-mutating pipeline privileges need review.

Platform deployment maintains AC. The I017/I018 release sequence delivers a particular user-governed MOA package. A target operator separately validates compatibility, inherited guards, required modules, approved data/effect scope and operating authority before deploying/running it. Controlled Learning promotes only evaluated future eligible versions; it is not autonomous foundation-model retraining.

### Operations, incidents and recovery

Monitor pending approval age, guarded-transition failures, queue/admission latency, model/tool throttles, task/validator latency, candidate rejection, expired attempts, uncertain effects, DLQ age and release receipt lag. Correlate tenant/run/task/attempt/contract/artifact versions. Assign alarm/responding owners and redact sensitive model/tool trace payloads. Operational telemetry, security audit and exact acceptance evidence have different writers, access and retention.

Refuse new authority decisions if trusted state is unavailable. Define business SLOs, RTO/RPO, backup scope, permitted regional failover and operator reconciliation. Exercise data/key/config restore and revalidate approval, current pins, artifact availability and fencing before resume. Multi-AZ icons alone do not establish availability; a second Region requires a measured and consistent authority-recovery design.

## Required security/fault verification

1. Alter approved contract and replay the prior digest; dispatch/release must fail.
2. Forge a task owner or omit current test evidence; acceptance must fail.
3. Change candidate/dependency versions after verification; integration/release must fail.
4. Remove a mandatory PIC guard/trace; no conformance or release.
5. Compete on reservations and leases; preserve aggregate limits and reject stale attempts.
6. Duplicate/delay cross-account completion; validate and deduplicate without accepting old work.
7. Crash between artifact write, ledger/outbox commit, callback and delivery; reconcile exact state.
8. Time out after an external side effect; observe/reconcile before any permitted retry.
9. Attempt worker direct-target/Gateway/acceptance/release bypass; real policies/network paths deny it.
10. Poison/scoped-memory query, disable Memory, restore revoked approval; no authority widening.
11. Change future defaults during a run; active pins stay fixed and new runs select only eligible versions.
12. Lose AZ/region/service/telemetry or rotate a key; record measured response/recovery and unresolved limits.

These are tests to perform on an implementation. Current documentation, topology/UI and source-count checks do not claim they passed in AWS.

## Official operational references

- [Account security boundaries; foundational accounts; separate production/non-production](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_best-practices.html)
- [Management/log archive/audit accounts; no production workloads in management account](https://docs.aws.amazon.com/controltower/latest/userguide/what-shared.html)
- [Restricted central log archive and security foundations](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/foundational-ous.html)
- [SCP ceilings, no grants, management/service-linked-role exceptions](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)
- [Runtime VPC connectivity creates customer ENIs](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-vpc.html)
- [Lambda function hosts remain in Lambda-managed VPC; customer private connectivity uses Hyperplane ENIs](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html)
- [Private data/control/Gateway endpoints; OAuth endpoint-policy limitation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/vpc-interface-endpoints.html)
- [Modern Fargate ECR+S3 endpoint requirements; awslogs endpoint; cache-first-pull caveat](https://docs.aws.amazon.com/AmazonECR/latest/userguide/vpc-endpoints.html)
- [Separate task execution and task roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/security-iam-roles.html)
- [Application credentials/task isolation; containers in a task are not independent security boundaries](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [Same-account callback principals; .sync cancellation/polling limitations; integration support](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html)
- [Target role/Credentials; cross-account polling; no cross-Region resource access](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-access-cross-acct-resources.html)
- [Native InvokeHarness, Request/Response only, final text, 900-second maximum, continuing harness after stop](https://docs.aws.amazon.com/step-functions/latest/dg/connect-bedrockagentcore.html)
- [Bucket owner enforced; ACL-free cross-account object ownership](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)
- [Resource KMS key policy plus consumer IAM policy required](https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-modifying-external-accounts.html)
- [KMS key same Region as S3 bucket; GenerateDataKey/Decrypt permissions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)
- [Asymmetric SIGN_VERIFY key and exact message/digest signature](https://docs.aws.amazon.com/kms/latest/APIReference/API_Sign.html)
- [Geographic/global inference-processing routing differs from storage and authority location](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html)
- [Memory/Policy/Evaluations processing geography](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/cross-region-inference.html)
- [Multi-AZ deployment; managed data multi-AZ; multi-Region only for required resilience](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_fault_isolation_multiaz_region_system.html)
- [RTO/RPO-based backup and periodic recovery verification](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/back-up-data.html)
- [Bootstrapped account/Region environments, repeated stages, test/approval hooks; self-updating-pipeline privilege caution](https://docs.aws.amazon.com/cdk/v2/guide/cdk-pipeline.html)
- [Manual authorized pipeline review pauses a stage; rejection/timeout fails it](https://docs.aws.amazon.com/codepipeline/latest/userguide/approvals.html)
- [Preview changes before executing; no guarantee of successful runtime update](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)
- [Test code, infrastructure, security controls and operational procedure changes](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_dev_integ_test_val_chg.html)
- [Production-like preproduction deployment and recovery tests](https://docs.aws.amazon.com/wellarchitected/latest/framework/ops_mit_deploy_risks_test_val_chg.html)
- [Operations as code, version/configuration management and multiple environments](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/design-for-operations.html)
