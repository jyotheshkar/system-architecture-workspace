# Agentic Core | AWS Enterprise System Design Architecture

**Proposed reference design; no AWS infrastructure has been deployed by this deliverable.** Reviewed 6 October 2026. Costs are excluded.

Source: Reference Architecture schema version 1.0.0; current source snapshot includes **35 capabilities, 68 typed interfaces and five optional modules**. Source SHA-256: `6a00568419c9d4fd2d4ceccac30fe0b6b45737aabb78ba00210609f095fa97af`. Deployment/supporting services do not introduce new AC responsibilities.

## Enterprise architecture decisions

These decisions replace the former one-workload-account topology. They are proposed enterprise deployment mechanisms for the unchanged logical 35/68 source architecture. They do not show provisioned resources or completed production tests.

### EADR-01 — Separate workload authority, construction, assurance and target accounts

**Decision:** Engineering Control owns exact state/authority; Build produces candidates; Assurance reads exact candidates and supplies independent evidence; consumer/target operates the child package separately. Foundation Security, Log Archive and Platform are not application-agent accounts.

**Why:** Account isolation reduces blast radius and strengthens separation of duties. It is an enterprise reference choice, not a requirement to create one account per node.

**Alternative:** One-account prototype with distinct roles.

**Risks and assumptions:** Administrative/pipeline trust can cross these boundaries. Cross-account IAM/resource/KMS policies and ownership must be specified, tested and operated.

**Verification required:** Deny builders acceptance/release writes and target credentials; deny verifiers candidate mutation. Verify environment separation and operational ownership.

**Official references:** [Account security boundaries; foundational accounts; separate production/non-production](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_best-practices.html) · [Management/log archive/audit accounts; no production workloads in management account](https://docs.aws.amazon.com/controltower/latest/userguide/what-shared.html) · [Restricted central log archive and security foundations](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/foundational-ous.html) · [SCP ceilings, no grants, management/service-linked-role exceptions](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)

### EADR-02 — One authoritative Region, at least two AZ job subnets, measured recovery

**Decision:** Place managed regional resources outside customer VPCs. Private Fargate tasks/ENIs run in one eligible AZ at a time; jobs may relaunch across eligible AZs.

**Why:** One serial authority domain avoids unproved conflict/fencing semantics while AZ placement improves fault separation. Business RTO/RPO decide any second-Region strategy.

**Alternative:** Active-active multi-Region controller; single-AZ prototype.

**Risks and assumptions:** Managed multi-AZ service characteristics do not establish an end-to-end SLO. Model/feature/endpoint support and permitted processing geography must be checked.

**Verification required:** Kill an AZ/task, test trusted-state outage and backups, measure recovery, then revalidate pins/approval before resume.

**Official references:** [Multi-AZ deployment; managed data multi-AZ; multi-Region only for required resilience](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_fault_isolation_multiaz_region_system.html) · [RTO/RPO-based backup and periodic recovery verification](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/back-up-data.html) · [Current feature-by-Region matrix; precise feature checks still required](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-regions.html)

### EADR-03 — Step Functions Standard plus custom current-state guard/scheduler

**Decision:** Use callback/job waits and auditable phase coordination. Custom admission validates owned task DAG, current dependencies, bindings and reservations. Map/Parallel process independent ready work.

**Why:** Model proposals cannot own trusted state or waive acceptance/release gates.

**Alternative:** Express or free-running model-controlled dispatch; bespoke workflow engine.

**Risks and assumptions:** Step Functions is not an arbitrary dynamic-DAG solver; task retries/redrives require persistent business idempotency, fencing and unknown-effect reconciliation.

**Verification required:** Cycle/unowned/stale-plan tests; parallel reservation races; duplicate callbacks; cancellation and bounded repair.

**Official references:** [Same-account callback principals; .sync cancellation/polling limitations; integration support](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html) · [One account/Region atomic write boundary; limits and token idempotency window](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html)

### EADR-04 — Managed AgentCore reasoning through explicit Runtime/job connector

**Decision:** Use framework-neutral Runtime sessions when exact typed artifacts, attempt correlation or longer session work is needed. Keep Core/PIC/release deterministic.

**Why:** The Runtime connector can return the needed artifact/evidence envelope without treating final prose as task acceptance. Native integration remains a deliberate supported option.

**Alternative:** Native Step Functions AgentCore InvokeHarness for bounded reasoning.

**Risks and assumptions:** InvokeHarness is Request/Response only, final-text output, no .sync/callback, 900-second task maximum. Step Functions timeout/stop does not stop the harness. Runtime session isolation does not supply durable authority.

**Verification required:** Test continued work after timeout, stale attempt completion and omitted evidence; fence outputs and never release from model text.

**Official references:** [Native InvokeHarness, Request/Response only, final text, 900-second maximum, continuing harness after stop](https://docs.aws.amazon.com/step-functions/latest/dg/connect-bedrockagentcore.html) · [Session isolation and ephemeral/session-persistent distinctions](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-sessions.html) · [Same-account callback principals; .sync cancellation/polling limitations; integration support](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html)

### EADR-05 — Custom PIC transformation and conformance checking

**Decision:** Version K and WorkflowSpec; map every required pattern to a child component, an enforcing guard, positive/negative tests and current evidence.

**Why:** Reusable guard obligations require engineering code, typed contracts and traceable checks, not just model-generated explanations.

**Alternative:** Prompt-only inheritance or treating Guardrails as PIC.

**Risks and assumptions:** Trace completeness is necessary but does not prove domain correctness. Guardrails/Automated Reasoning have scoped content/policy capabilities and their own translation/operational limits.

**Verification required:** Disable/remove inherited guard or substitute old artifact evidence; block dispatch/acceptance/release as specified.

**Official references:** [Content/sensitive-data/grounding safeguards, not PIC implementation](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html) · [Detect-only findings; application decides enforcement](https://docs.aws.amazon.com/bedrock/latest/userguide/integrate-automated-reasoning-checks.html)

### EADR-06 — Qualified isolated Build and Assurance job pools

**Decision:** Separate Fargate task definitions, roles, images, workspaces and accounts. Preserve exact candidate/evidence identities.

**Why:** Independent assessment requires a different trust/effect path from the artifact producer.

**Alternative:** One shared agent process or builder/verifier sidecars.

**Risks and assumptions:** Same-task containers share resources and task credentials. Fargate infrastructure isolation alone does not establish a safe arbitrary hostile-code sandbox. Task execution and application task roles are distinct.

**Verification required:** Attempt task credential misuse, cross-run object access, broad egress, evidence mutation and self-acceptance.

**Official references:** [Dedicated task infrastructure, same-task resource sharing and customer network responsibility](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-security-considerations.html) · [Application credentials/task isolation; containers in a task are not independent security boundaries](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html) · [Separate task execution and task roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/security-iam-roles.html)

### EADR-07 — Private endpoint paths and mediated external egress

**Decision:** Use qualified image/artifact/log/model paths; no public task IP or broad Internet route. Keep managed services outside customer subnets.

**Why:** Network containment complements identity and contextual task authority.

**Alternative:** Broad NAT egress or misdrawing managed services inside VPC.

**Risks and assumptions:** ECR private pulls need ECR and S3-layer access; logs need a supported path. AgentCore private endpoints and Runtime ENIs have distinct roles. OAuth users are not independently restricted by endpoint IAM-principal policies.

**Verification required:** Launch approved image without broad Internet route; deny arbitrary targets; validate DNS, endpoint/SG/resource policies and exact Region support.

**Official references:** [Modern Fargate ECR+S3 endpoint requirements; awslogs endpoint; cache-first-pull caveat](https://docs.aws.amazon.com/AmazonECR/latest/userguide/vpc-endpoints.html) · [Runtime VPC connectivity creates customer ENIs](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-vpc.html) · [Lambda function hosts remain in Lambda-managed VPC; customer private connectivity uses Hyperplane ENIs](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html) · [Private data/control/Gateway endpoints; OAuth endpoint-policy limitation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/vpc-interface-endpoints.html) · [Gateway/private target connection through VPC Lattice resource gateways/configurations](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/vpc-egress-private-endpoints.html)

### EADR-08 — Control ledger, exact S3 versions and guarded transactional outbox

**Decision:** Commit current guarded run/release intent plus outbox in Control after verifying exact artifact availability. Separate result/evidence ingest from final acceptance.

**Why:** Structured conditional state and digest-bound evidence prevent stale/racing work from progressing silently.

**Alternative:** Distributed transaction across AWS storage and external actions; conversation as ledger.

**Risks and assumptions:** DynamoDB transactions cannot include S3/external actions/callbacks and cannot cross accounts/Regions. Its API idempotency token has a bounded window; durable business keys remain necessary.

**Verification required:** Crash at each handoff step, replay completions, change candidate bytes and revoke approval around the commit point; reconcile unknown receipt.

**Official references:** [One account/Region atomic write boundary; limits and token idempotency window](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html) · [Object-version retention, versioning and governance/compliance distinctions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html) · [Same-account callback principals; .sync cancellation/polling limitations; integration support](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html)

### EADR-09 — Validated same-account callback broker

**Decision:** Cross-account jobs/humans send authenticated scoped envelopes to Control; broker rechecks current attempt, versions, authority and idempotency before protected task-token transport.

**Why:** Callback principals must be in the state-machine account, and token arrival cannot attest business correctness.

**Alternative:** Let cross-account workers invoke SendTaskSuccess directly.

**Risks and assumptions:** Cross-account .sync polls and cancellation is best-effort. Broker state commit/callback signaling is not one transaction; reconcile interruption.

**Verification required:** Wrong-account principal, stale fence, wrong tenant/digest, replay, token rotation and broker crash tests.

**Official references:** [Same-account callback principals; .sync cancellation/polling limitations; integration support](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html) · [Target role/Credentials; cross-account polling; no cross-Region resource access](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-access-cross-acct-resources.html)

### EADR-10 — Optional authorised semantic continuity with exact records

**Decision:** Memory controller scopes every read/write. Exact contracts/checkpoints/evidence stay in typed storage; AgentCore Memory supplies fallible contextual recall only.

**Why:** Memory-off semantics remain meaningful despite unavoidable operational service records.

**Alternative:** Use extracted memory as current approval or checkpoints; silently enable application restore whenever the cloud persists state.

**Risks and assumptions:** No cross-run application restore/history/retrieval when off; continuity-required contracts refused. Retention/purge and processing geography require explicit policy.

**Verification required:** Test all 32 optional combinations, cross-tenant recall, poisoned/stale records and restoration under revoked authority.

**Official references:** [Asynchronous memory extraction; not exact authority state](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/long-term-saving-and-retrieving-insights.html) · [Session isolation and ephemeral/session-persistent distinctions](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-sessions.html) · [Memory/Policy/Evaluations processing geography](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/cross-region-inference.html)

### EADR-11 — Evaluated and authorised future versions with immutable active-run pins

**Decision:** Outcome attribution → candidate → held-out/invariant evaluation → approval → eligible future default. Use immutable manifests; AppConfig only distributes future-default selectors.

**Why:** Running work must retain the version set that its approvals/evidence cover.

**Alternative:** Automatic active prompt/code mutation or autonomous foundation-model retraining.

**Risks and assumptions:** Measured gains cover the evaluated distribution. Durable application Learning history requires Memory. AppConfig rollback is configured deployment behavior, not automatic AC authority.

**Verification required:** Promote/rollback during active run; verify old pins unchanged, new-run eligibility and no promotion without evaluated current evidence.

**Official references:** [Immutable version ARN invocation](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-state-machine-version.html) · [Configured deployment alarm rollback; custom active-run pins remain needed](https://docs.aws.amazon.com/appconfig/latest/userguide/monitoring-deployments.html) · [Finite automated/human/model-judge performance evaluation](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html)

### EADR-12 — Reviewed adapters, custom effect admission, Gateway Policy ENFORCE and Identity

**Decision:** Validate current run/task/adapter/resource scope, schema, reservation and fence before governed Gateway call; independently validate observed postcondition.

**Why:** Tool discovery and identity are distinct from permitted business effects.

**Alternative:** Direct model-selected tool calls or assuming credentials imply authority.

**Risks and assumptions:** Real IAM evaluation is richer than P_effect intersection. Targets may not support idempotency or immediate read-back; represent uncertainty and escalation.

**Verification required:** Direct-target/Gateway bypass, revoked authority, exhausted budget, timeout-after-effect and misleading receipt tests.

**Official references:** [SCP ceilings, no grants, management/service-linked-role exceptions](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html) · [Private data/control/Gateway endpoints; OAuth endpoint-policy limitation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/vpc-interface-endpoints.html)

### EADR-13 — Separate storage/authority residency from inference-processing geography

**Decision:** Allowlist/pin exact model/profile configuration and permitted AgentCore processing geography. Check current features by selected Region.

**Why:** Data movement must meet the approved contract and enterprise classification policy.

**Alternative:** Global inference profiles by default; assume same-Region API endpoint means same-Region processing.

**Risks and assumptions:** Some Memory/Policy/Evaluation processing uses cross-Region inference. Runtime platform/features/models may have distinct Region availability.

**Verification required:** Validate source/destination profile geography, policy/SCP behavior, logged inferenceRegion and refusal of unsatisfiable residency contract.

**Official references:** [Geographic/global inference-processing routing differs from storage and authority location](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html) · [Memory/Policy/Evaluations processing geography](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/cross-region-inference.html) · [Current feature-by-Region matrix; precise feature checks still required](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-regions.html) · [Runtime platform version selection and V2 regional limits](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html)

### EADR-14 — Shared deployment template with isolated Dev/Preprod/Prod platform promotion

**Decision:** Platform account/repository pipeline tests reviewed IaC/code/config and deploys exact versions through isolated environments using scoped cross-account roles.

**Why:** Reproducible deployment and production-like negative/smoke/recovery tests are needed to operate the designed boundaries.

**Alternative:** Manual drift-prone infrastructure or shared Dev/Prod state/credentials.

**Risks and assumptions:** CloudFormation preview cannot guarantee success; CDK bootstrap/self-mutation trust is privileged. Pipeline approval is not user contract approval, task-owner acceptance or I017/I018 child package release.

**Verification required:** Malicious policy/template change, missing Preprod tests, wrong image digest and environment credential leakage; verify scoped deploy roles and rollback runbooks.

**Official references:** [Bootstrapped account/Region environments, repeated stages, test/approval hooks; self-updating-pipeline privilege caution](https://docs.aws.amazon.com/cdk/v2/guide/cdk-pipeline.html) · [Manual authorized pipeline review pauses a stage; rejection/timeout fails it](https://docs.aws.amazon.com/codepipeline/latest/userguide/approvals.html) · [Preview changes before executing; no guarantee of successful runtime update](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html) · [Test code, infrastructure, security controls and operational procedure changes](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_dev_integ_test_val_chg.html) · [Production-like preproduction deployment and recovery tests](https://docs.aws.amazon.com/wellarchitected/latest/framework/ops_mit_deploy_risks_test_val_chg.html)

### EADR-15 — Operational evidence, audit and business verification are separate

**Decision:** Correlate run/task/attempt/digests across operational telemetry; keep security log archive copies and exact validation evidence separately authorised.

**Why:** Monitoring supports incident response and measured capacity; independent tests/owners establish acceptance.

**Alternative:** Treat a success log or signature as domain acceptance.

**Risks and assumptions:** Redaction, retention, key custody, alert ownership and administrative separation need policies. No unmeasured throughput/RTO/RPO claims.

**Verification required:** Telemetry loss, false success, overdue approval, expired fence, unknown effects and receipt lag exercises; verify responders cannot forge acceptance.

**Official references:** [Restricted central log archive and security foundations](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/foundational-ous.html) · [RTO/RPO-based backup and periodic recovery verification](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/back-up-data.html) · [Asymmetric SIGN_VERIFY key and exact message/digest signature](https://docs.aws.amazon.com/kms/latest/APIReference/API_Sign.html) · [Operations as code, version/configuration management and multiple environments](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/design-for-operations.html)

