import json, pathlib, hashlib, csv, io

ROOT=pathlib.Path(__file__).resolve().parent
OUT=ROOT.parent/'dist/aws'
B=json.loads((ROOT/'blueprint-revision.json').read_text())
D=json.loads((ROOT.parent/'dist/aws/architecture-data.json').read_text())
E=json.loads((ROOT/'enterprise-review.json').read_text())
N={n['id']:n for n in B['nodes']}
M={m['id']:m for m in D['mapping']}
I={i['id']:i for i in D['interfaces']}
assert len(N)==35 and len(I)==68
assert set(M)==set(N) and set(I)=={e['id'] for e in B['edges']}
for id,n in N.items():
    for key in ['responsibility','authority','rule']:
        assert M[id][key]==n[key],(id,key)
for e in B['edges']:
    for key,val in e.items():
        assert I[e['id']][key]==val,(e['id'],key)
SHA=hashlib.sha256((ROOT/'blueprint-revision.json').read_bytes()).hexdigest()
HEADER=f'''# Agentic Core | AWS Enterprise System Design Architecture

**Proposed reference design; no AWS infrastructure has been deployed by this deliverable.** Reviewed 6 October 2026. Costs are excluded.

Source: Reference Architecture schema version {B['version']}; current source snapshot includes **35 capabilities, 68 typed interfaces and five optional modules**. Source SHA-256: `{SHA}`. Deployment/supporting services do not introduce new AC responsibilities.

'''
def write(name,body):
    (OUT/name).write_text(HEADER+body)
def cell(s):
    return str(s).replace('|','\\|').replace('\n','<br>')
def link(key):
    ref=E['references'][key]
    return f"[{ref['supports']}]({ref['url']})"
ACCOUNT={id:a['name'] for a in E['accounts'] for id in a['sourceNodes']}
def deployment(id):
    if id=='user':return 'External authorised stakeholder; authenticated Control intake'
    if id=='workflow':return 'Separate consumer/target account; target operating authority'
    if id in ['exec','integrate','construct']:return 'Build account; private Fargate job pool in either eligible AZ subnet'
    if id in ['verify','final','evaluate','assure']:return 'Assurance account; separate private job pool in either eligible AZ subnet'
    return 'Engineering Control account; regional managed services / restricted logical responsibility'

body='''## Enterprise placement and source fidelity

The diagram depicts one selected environment. Repeat the same deployment template in isolated Dev, Preprod and Prod accounts; do not share runtime state, credentials, keys, approval records or semantic-memory namespaces across them. This reuse is infrastructure automation, not shared business authority.

Regional managed services sit outside customer VPC/subnet boxes. The Build and Assurance job networks each contain private subnets in at least two AZs. A job runs in one AZ at a time and may be scheduled/relaunched in an eligible subnet; it is not a synchronously replicated task. Planning Runtime remains managed compute with separately configured network connectivity where needed. Lambda functions also run in Lambda-owned managed VPCs; any customer-subnet placement represents an attached Hyperplane ENI, not the function host. Fargate test jobs and managed Lambda validation facets must be depicted separately.

Security, Log Archive and platform delivery are distinct foundation-account roles. They support the application and do not replace Core/PIC/Verification/Release. Foundation-account summaries are not claims that every service is co-located in one shared account. IAM/STS/Organizations are account/organization authority facets, not Region-hosted application servers.

## Exact capability map

| Source ID / capability | Original responsibility | Deployment / trust placement | Selected AWS services | Why / limitation | Relevant interfaces |
|---|---|---|---|---|---|
'''
for id,n in N.items():
    m=M[id];edges=', '.join(e['id'] for e in B['edges'] if id in [e['source'],e['target']])
    row=[id+' — '+n['name'],n['responsibility'],deployment(id),'; '.join(m['services']),m['why']+' '+m['tradeoff'],edges]
    body+='| '+' | '.join(cell(x) for x in row)+' |\n'
body+='''
## Detailed per-capability obligations

The original authority and invariant below remain unchanged. AWS implementation notes are proposed mechanisms; selecting a managed service does not prove the invariant.

'''
for id,n in N.items():
    m=M[id]
    body+=f"### {id} — {n['name']}\n\n"
    for key,title in [('what','AWS implementation'),('identity','Identity'),('security','Security responsibility'),('statefulness','State'),('protocol','Typed transport'),('failure','Failure handling'),('scaling','Scaling assumptions'),('alternative','Alternative'),('tradeoff','Trade-off'),('evidence','Evidence required')]:
        body+=f"**{title}:** {m[key]}\n\n"
    body+=f"**Deployment:** {deployment(id)}.\n\n**Original authority:** {n['authority']}\n\n**Original invariant:** `{n['rule']}`\n\n"
    if id=='exec':body+='AgentCore Runtime is a managed reasoning option; the displayed Build VPC card depicts finite Fargate job execution. Do not place the managed AgentCore service inside the customer subnet. Custom connector code correlates session outputs to admitted job envelopes.\n\n'
    if id in ['verify','final','assure','evaluate']:body+='Validation jobs use separate Assurance roles, workspaces and task definitions. Any trusted result commit is mediated by Control; final signing uses a separately scoped asymmetric key. Builders cannot alter candidates after the exact version/digest is selected for validation. Fargate job compute occupies the private subnet; any Lambda validation facet remains AWS-managed outside the customer VPC and uses Hyperplane ENIs only if private connectivity is required.\n\n'
    if id=='versions':body+='AppConfig distributes an approved future-default selector. DynamoDB/S3/ECR/Step Functions versions hold exact run pins; active workers never follow the changing selector. Foundation platform artifact retention is not enabled semantic Learning history when Memory is off.\n\n'
    if id=='gateway':body+='A worker cannot bypass admission by invoking a target directly. Gateway uses authenticated ingress and Policy ENFORCE; the custom AC guard remains responsible for current contract, task, adapter, resource, reservation and fence.\n\n'
write('Architecture-to-AWS-Mapping.md',body)

body='''## Complete logical interface register

All 68 source IDs, endpoints, types, payloads, preconditions, postconditions, failures, authority limits, state dependencies and module requirements are retained. The full all-enabled enterprise view includes their logical arrows. An arrow represents an AC interface contract; it is **not a direct physical network connection** or permission to skip the receiving guard.

Cross-account worker/control transitions use approved dispatch roles and a validating Control ingress/broker. Exact artifacts are referenced by bucket/key/versionId plus content digest under identity, resource and KMS policies. The logical sender still has only its original authority.

| ID | Logical source → destination | Type | Meaning | Module requirements | Deployment crossing |
|---|---|---|---|---|---|
'''
csvbuf=io.StringIO();cw=csv.writer(csvbuf)
fields=['ID','SourceID','TargetID','SourceName','TargetName','Type','Name','Payload','Purpose','Precondition','Postcondition','Failure','Authority','StateDependency','Rule','Module','Mandatory','Transport','Requires','AWS_Source','AWS_Target','Implementation_Protocol','AWS_Boundary']
cw.writerow(fields)
for e in B['edges']:
    ie=I[e['id']];req=', '.join(e['requires']) or 'Core only'
    crossing=ACCOUNT[e['source']]+' → '+ACCOUNT[e['target']]
    body+='| '+' | '.join(cell(s) for s in [e['id'],N[e['source']]['name']+' → '+N[e['target']]['name'],e['type'],e['name'],req,crossing])+' |\n'
    cw.writerow([e['id'],e['source'],e['target'],N[e['source']]['name'],N[e['target']]['name'],e['type'],e['name'],e['payload'],e['purpose'],e['pre'],e['post'],e['failure'],e['authority'],e['stateDependency'],e['rule'],e['module'],e['mandatory'],e['transport'],','.join(e['requires']),ie['awsSource'],ie['awsTarget'],ie['implementationProtocol'],ie['awsBoundary']])
body+='''
## Mandatory admitted-plan, acceptance and release path

`I064 Plan → Core` records a validated current plan. `I065 Core → PIC` admits only that plan to specialisation. `I066 Core → Verification` supplies independently authenticated accountable-owner attestation. `I012 Verification → Core` returns current task acceptance/rejection. `I016 Final Validation → Core` supplies exact final attestation. `I017 Core → Release` authorises the exact handoff; `I018 Release → MOA Workflow` delivers it. There is no direct Final→Release authority shortcut. Worker transport completion never becomes acceptance by itself.

## Exact interface definitions

'''
for e in B['edges']:
    ie=I[e['id']]
    body+=f"### {e['id']} — {e['name']}\n\n**Logical endpoints:** `{e['source']}` → `{e['target']}` ({e['type']}). **Optional requirements:** {', '.join(e['requires']) or 'None'}.\n\n"
    for key,title in [('payload','Payload'),('purpose','Purpose'),('pre','Precondition'),('post','Postcondition'),('failure','Failure'),('authority','Authority limit'),('stateDependency','State dependency'),('rule','Original rule')]:body+=f"**{title}:** {e[key]}\n\n"
    body+=f"**Proposed AWS transport:** {ie['implementationProtocol']}\n\n**Deployment crossing:** {ACCOUNT[e['source']]} → {ACCOUNT[e['target']]}.\n\n**AWS boundary:** {ie['awsBoundary']}\n\n"
write('Connection-Register.md',body)
(OUT/'Connection-Register.csv').write_text(csvbuf.getvalue())

adrs=[
('EADR-01','Separate workload authority, construction, assurance and target accounts','Engineering Control owns exact state/authority; Build produces candidates; Assurance reads exact candidates and supplies independent evidence; consumer/target operates the child package separately. Foundation Security, Log Archive and Platform are not application-agent accounts.','One-account prototype with distinct roles.','Account isolation reduces blast radius and strengthens separation of duties. It is an enterprise reference choice, not a requirement to create one account per node.','Administrative/pipeline trust can cross these boundaries. Cross-account IAM/resource/KMS policies and ownership must be specified, tested and operated.','Deny builders acceptance/release writes and target credentials; deny verifiers candidate mutation. Verify environment separation and operational ownership.',['organizations','controltower','foundation','scps']),
('EADR-02','One authoritative Region, at least two AZ job subnets, measured recovery','Place managed regional resources outside customer VPCs. Private Fargate tasks/ENIs run in one eligible AZ at a time; jobs may relaunch across eligible AZs.','Active-active multi-Region controller; single-AZ prototype.','One serial authority domain avoids unproved conflict/fencing semantics while AZ placement improves fault separation. Business RTO/RPO decide any second-Region strategy.','Managed multi-AZ service characteristics do not establish an end-to-end SLO. Model/feature/endpoint support and permitted processing geography must be checked.','Kill an AZ/task, test trusted-state outage and backups, measure recovery, then revalidate pins/approval before resume.',['multiaz','backup','regions']),
('EADR-03','Step Functions Standard plus custom current-state guard/scheduler','Use callback/job waits and auditable phase coordination. Custom admission validates owned task DAG, current dependencies, bindings and reservations. Map/Parallel process independent ready work.','Express or free-running model-controlled dispatch; bespoke workflow engine.','Model proposals cannot own trusted state or waive acceptance/release gates.','Step Functions is not an arbitrary dynamic-DAG solver; task retries/redrives require persistent business idempotency, fencing and unknown-effect reconciliation.','Cycle/unowned/stale-plan tests; parallel reservation races; duplicate callbacks; cancellation and bounded repair.',['callbacks','transactions']),
('EADR-04','Managed AgentCore reasoning through explicit Runtime/job connector','Use framework-neutral Runtime sessions when exact typed artifacts, attempt correlation or longer session work is needed. Keep Core/PIC/release deterministic.','Native Step Functions AgentCore InvokeHarness for bounded reasoning.','The Runtime connector can return the needed artifact/evidence envelope without treating final prose as task acceptance. Native integration remains a deliberate supported option.','InvokeHarness is Request/Response only, final-text output, no .sync/callback, 900-second task maximum. Step Functions timeout/stop does not stop the harness. Runtime session isolation does not supply durable authority.','Test continued work after timeout, stale attempt completion and omitted evidence; fence outputs and never release from model text.',['invoke-harness','runtime','callbacks']),
('EADR-05','Custom PIC transformation and conformance checking','Version K and WorkflowSpec; map every required pattern to a child component, an enforcing guard, positive/negative tests and current evidence.','Prompt-only inheritance or treating Guardrails as PIC.','Reusable guard obligations require engineering code, typed contracts and traceable checks, not just model-generated explanations.','Trace completeness is necessary but does not prove domain correctness. Guardrails/Automated Reasoning have scoped content/policy capabilities and their own translation/operational limits.','Disable/remove inherited guard or substitute old artifact evidence; block dispatch/acceptance/release as specified.',['guardrails','automated-reasoning']),
('EADR-06','Qualified isolated Build and Assurance job pools','Separate Fargate task definitions, roles, images, workspaces and accounts. Preserve exact candidate/evidence identities.','One shared agent process or builder/verifier sidecars.','Independent assessment requires a different trust/effect path from the artifact producer.','Same-task containers share resources and task credentials. Fargate infrastructure isolation alone does not establish a safe arbitrary hostile-code sandbox. Task execution and application task roles are distinct.','Attempt task credential misuse, cross-run object access, broad egress, evidence mutation and self-acceptance.',['fargate','ecs-task-role','ecs-roles']),
('EADR-07','Private endpoint paths and mediated external egress','Use qualified image/artifact/log/model paths; no public task IP or broad Internet route. Keep managed services outside customer subnets.','Broad NAT egress or misdrawing managed services inside VPC.','Network containment complements identity and contextual task authority.','ECR private pulls need ECR and S3-layer access; logs need a supported path. AgentCore private endpoints and Runtime ENIs have distinct roles. OAuth users are not independently restricted by endpoint IAM-principal policies.','Launch approved image without broad Internet route; deny arbitrary targets; validate DNS, endpoint/SG/resource policies and exact Region support.',['ecr-endpoints','agentcore-vpc','lambda-vpc','agentcore-privatelink','agentcore-private-target']),
('EADR-08','Control ledger, exact S3 versions and guarded transactional outbox','Commit current guarded run/release intent plus outbox in Control after verifying exact artifact availability. Separate result/evidence ingest from final acceptance.','Distributed transaction across AWS storage and external actions; conversation as ledger.','Structured conditional state and digest-bound evidence prevent stale/racing work from progressing silently.','DynamoDB transactions cannot include S3/external actions/callbacks and cannot cross accounts/Regions. Its API idempotency token has a bounded window; durable business keys remain necessary.','Crash at each handoff step, replay completions, change candidate bytes and revoke approval around the commit point; reconcile unknown receipt.',['transactions','object-lock','callbacks']),
('EADR-09','Validated same-account callback broker','Cross-account jobs/humans send authenticated scoped envelopes to Control; broker rechecks current attempt, versions, authority and idempotency before protected task-token transport.','Let cross-account workers invoke SendTaskSuccess directly.','Callback principals must be in the state-machine account, and token arrival cannot attest business correctness.','Cross-account .sync polls and cancellation is best-effort. Broker state commit/callback signaling is not one transaction; reconcile interruption.','Wrong-account principal, stale fence, wrong tenant/digest, replay, token rotation and broker crash tests.',['callbacks','cross-account-sfn']),
('EADR-10','Optional authorised semantic continuity with exact records','Memory controller scopes every read/write. Exact contracts/checkpoints/evidence stay in typed storage; AgentCore Memory supplies fallible contextual recall only.','Use extracted memory as current approval or checkpoints; silently enable application restore whenever the cloud persists state.','Memory-off semantics remain meaningful despite unavoidable operational service records.','No cross-run application restore/history/retrieval when off; continuity-required contracts refused. Retention/purge and processing geography require explicit policy.','Test all 32 optional combinations, cross-tenant recall, poisoned/stale records and restoration under revoked authority.',['memory','runtime','agentcore-cross-region']),
('EADR-11','Evaluated and authorised future versions with immutable active-run pins','Outcome attribution → candidate → held-out/invariant evaluation → approval → eligible future default. Use immutable manifests; AppConfig only distributes future-default selectors.','Automatic active prompt/code mutation or autonomous foundation-model retraining.','Running work must retain the version set that its approvals/evidence cover.','Measured gains cover the evaluated distribution. Durable application Learning history requires Memory. AppConfig rollback is configured deployment behavior, not automatic AC authority.','Promote/rollback during active run; verify old pins unchanged, new-run eligibility and no promotion without evaluated current evidence.',['sfn-versions','appconfig','evaluation']),
('EADR-12','Reviewed adapters, custom effect admission, Gateway Policy ENFORCE and Identity','Validate current run/task/adapter/resource scope, schema, reservation and fence before governed Gateway call; independently validate observed postcondition.','Direct model-selected tool calls or assuming credentials imply authority.','Tool discovery and identity are distinct from permitted business effects.','Real IAM evaluation is richer than P_effect intersection. Targets may not support idempotency or immediate read-back; represent uncertainty and escalation.','Direct-target/Gateway bypass, revoked authority, exhausted budget, timeout-after-effect and misleading receipt tests.',['scps','agentcore-privatelink']),
('EADR-13','Separate storage/authority residency from inference-processing geography','Allowlist/pin exact model/profile configuration and permitted AgentCore processing geography. Check current features by selected Region.','Global inference profiles by default; assume same-Region API endpoint means same-Region processing.','Data movement must meet the approved contract and enterprise classification policy.','Some Memory/Policy/Evaluation processing uses cross-Region inference. Runtime platform/features/models may have distinct Region availability.','Validate source/destination profile geography, policy/SCP behavior, logged inferenceRegion and refusal of unsatisfiable residency contract.',['bedrock-cross-region','agentcore-cross-region','regions','runtime-v2']),
('EADR-14','Shared deployment template with isolated Dev/Preprod/Prod platform promotion','Platform account/repository pipeline tests reviewed IaC/code/config and deploys exact versions through isolated environments using scoped cross-account roles.','Manual drift-prone infrastructure or shared Dev/Prod state/credentials.','Reproducible deployment and production-like negative/smoke/recovery tests are needed to operate the designed boundaries.','CloudFormation preview cannot guarantee success; CDK bootstrap/self-mutation trust is privileged. Pipeline approval is not user contract approval, task-owner acceptance or I017/I018 child package release.','Malicious policy/template change, missing Preprod tests, wrong image digest and environment credential leakage; verify scoped deploy roles and rollback runbooks.',['cdk-pipelines','codepipeline-approval','cfn-changesets','ops-change-tests','ops-deployment-tests']),
('EADR-15','Operational evidence, audit and business verification are separate','Correlate run/task/attempt/digests across operational telemetry; keep security log archive copies and exact validation evidence separately authorised.','Treat a success log or signature as domain acceptance.','Monitoring supports incident response and measured capacity; independent tests/owners establish acceptance.','Redaction, retention, key custody, alert ownership and administrative separation need policies. No unmeasured throughput/RTO/RPO claims.','Telemetry loss, false success, overdue approval, expired fence, unknown effects and receipt lag exercises; verify responders cannot forge acceptance.',['foundation','backup','kms-sign','ops-design']),
]
body='''## Enterprise architecture decisions

These decisions replace the former one-workload-account topology. They are proposed enterprise deployment mechanisms for the unchanged logical 35/68 source architecture. They do not show provisioned resources or completed production tests.

'''
for id,choice,decision,alternative,why,risks,verification,refs in adrs:
    body+=f"### {id} — {choice}\n\n**Decision:** {decision}\n\n**Why:** {why}\n\n**Alternative:** {alternative}\n\n**Risks and assumptions:** {risks}\n\n**Verification required:** {verification}\n\n**Official references:** "+' · '.join(link(k) for k in refs)+'\n\n'
write('Architecture-Decision-Records.md',body)
write('Enterprise-Architecture-Decisions.md',body)

body='''## Security and operating model

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

'''
for key in ['organizations','controltower','foundation','scps','agentcore-vpc','lambda-vpc','agentcore-privatelink','ecr-endpoints','ecs-roles','ecs-task-role','callbacks','cross-account-sfn','invoke-harness','s3-ownership','cross-account-kms','sse-kms','kms-sign','bedrock-cross-region','agentcore-cross-region','multiaz','backup','cdk-pipelines','codepipeline-approval','cfn-changesets','ops-change-tests','ops-deployment-tests','ops-design']:
    body+='- '+link(key)+'\n'
write('Security-and-Operations.md',body)

body='''## Problem, research hypothesis and design outcome

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

'''
for key,m in B['modules'].items():body+=f"### {m['name']}\n\n**When enabled:** {m['property']}\n\n**When off:** {m['off']}\n\n"
body+='''Memory-off has no cross-session application restoration/recall despite AWS service operational retention. Learning-only application history is session-bound; I067/I068 require both Memory and Learning. Baseline security audit/operational monitoring is separate from optional Recovery capacity analysis.

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
'''
write('Solutions-Architect-Study-Guide.md',body)

body='''## Presenter brief

Agentic Core is a research approach to governed workflow engineering. It proposes reusable approval, ownership, scope, evidence, repair and release patterns that PIC specialises into a domain-specific single-agent or multi-agent MOA package. This enterprise design maps every source responsibility/interface to a deployment mechanism while keeping managed infrastructure, model proposals and trusted authority separate.

## Why the design is enterprise-shaped

The Control account owns exact current approval/state/PIC/release. Build produces unaccepted candidates in qualified private task pools. Independent Assurance validates exact read-only candidates and supplies evidence; owners attest separately. The consumer account operates the released package under its own domain authority. Security, Log Archive and platform delivery provide cross-cutting controls without becoming additional AC agents.

Organization→account→selected Region→customer VPC→AZ/subnet nesting describes actual deployment. Regional managed services remain outside subnets; Runtime VPC connectivity and PrivateLink attach ENIs/endpoints, not customer-owned service hosts. Example task positions are eligible placements, not fixed role-to-AZ affinity.

## Claims supported by the artifact

- The source has 35 capabilities, 68 typed interfaces and five optional modules; the mapping/register preserve them.
- Required Core plan/owner/acceptance/final/release interfaces remain explicit.
- Decisions identify implementable AWS building blocks and custom engineering obligations.
- A reference design, UI/topology inspection and source checks have limited evidence scope.

## Claims still requiring implementation evidence

- Correct execution and effective inherited guards for a bounded domain.
- Real IAM/network/credential isolation, independent owner/validator paths and exact release prevention.
- Consistent concurrency, callback/outbox reconciliation, fenced repair and unknown-effect handling.
- Safe admitted generated-code workloads; no automatic adversarial-sandbox claim.
- Measured workload latency/capacity, SLOs/RTO/RPO, tested backups and incident response.
- Controlled Learning performance within its stated held-out distribution.

## Three decisions worth discussing

1. **Trusted orchestration versus reasoning.** Standard Step Functions coordinates phases; custom current-state guards make decisions. Runtime/Bedrock proposes; native InvokeHarness is a bounded alternative with text-only/no-stop/15-minute limits.
2. **Exact evidence versus semantic context.** Version IDs/digests and conditional ledger records carry acceptance. Optional Memory provides scoped fallible recall. Context does not become permission or current evidence.
3. **Enterprise isolation versus operating overhead.** Separate Build/Assurance/Control/target accounts strengthen boundaries; a smaller prototype may use roles but must state weaker assurance. One authoritative Region is selected until measured business recovery requirements justify additional complexity.

## Proposed validation sequence

Build one synthetic domain prototype with independent owner approval and deterministic negative gate tests. Then test exact artifact substitution, stale dependencies, callback replay, reservation/fence races, interrupted delivery, direct-target bypass, scoped Memory and future-only promotion. Deploy through reviewed isolated environments; measure actual fault recovery/capacity before making production claims.

Costs are intentionally outside this artifact. A diagram is not an AWS deployment or a guarantee of business correctness.
'''
write('Enterprise-Architecture-Review.md',body)

refs={r['url']:r['supports'] for r in E['references'].values()}
for r in D['references']:refs.setdefault(r['url'],r['topic'])
body='''## Primary AWS documentation

References were reviewed for service capabilities and limitations. A reference documents a building block; it does not establish that custom AC logic, deployment permissions or workload assumptions have been implemented correctly. Service/feature/model/endpoint availability must be rechecked for the selected environment before deployment.

'''
for url,title in sorted(refs.items(),key=lambda p:p[1].lower()):body+=f'- [{title}]({url})\n'
write('Official-AWS-References.md',body)

manifest={'sourceDigest':SHA,'sourceCapabilities':len(N),'sourceInterfaces':len(I),'mappingResponsibilitiesAuthoritiesRulesUnchanged':True,'allInterfaceFieldsUnchanged':True,'files':[p.name for p in OUT.iterdir() if p.suffix in ['.md','.csv']],'verificationScope':'Document/source fidelity only. No AWS deployment/runtime/security/capacity test claims.'}
(OUT/'doc-source-checks.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest))
