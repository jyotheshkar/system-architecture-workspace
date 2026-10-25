# Enterprise communication paths

Reference design. These representative paths complement the complete 35-capability / 68-interface AC diagram. They are proposed transport/enforcement paths, not provisioned routes. Private endpoint cards specify local connectivity; explicit identity/resource/KMS and application scope checks still govern access.

| ID | Producer → receiver | Protocol / boundary | Responsibility / failure limit |
|---|---|---|---|
| P01 | User → Authenticated intake | HTTPS + verified JWT | Human identity enters; business approval scope still checked server-side. |
| P02 | Authenticated intake → Contract | Validated requirement / approval | Review binds exact contract version/digest; changed text invalidates approval. |
| P03 | Contract → Core Control | Approved contract / digest | Core independently rechecks organisational authority and current revision. |
| P04 | Planning → Approved model access | Allowlisted model inference | Reasoning roles invoke only approved Runtime/Bedrock paths; output remains a proposal. |
| P05 | Core Control → Authoritative run ledger | Guarded conditional transaction | Core alone commits current run-state, acceptance, reservations and release intent. |
| P06 | Core Control → Validated completion broker | Protected token / admitted attempt | Protected correlation stays in Control; completion cannot skip business acceptance. |
| P07 | Core Control → Execution | Assume qualified dispatch role | Narrow target-role trust; finite qualified job, exact inputs and bounded task policy. |
| P08 | Execution → Exact artifacts & evidence | Exact candidate upload | Builder may write only its candidate namespace under explicit S3/KMS policies. |
| P09 | Verification → Exact artifacts & evidence | Exact candidate read / evidence write | Assurance cannot mutate candidate; writes a separate exact evidence namespace. |
| P10 | Managed verification / final helpers → Validated completion broker | SigV4 completion / attestation | Validated run/task/attempt/fence and exact digests; independent owner remains required. |
| P11 | Accountable owner decision ingress → Core Control | Independent I066 owner decision | Core checks owner identity, scope, digest and current dependencies before acceptance. |
| P12 | Release → Exact artifacts & evidence | Pinned released manifest | Guarded exact package selection; an S3 upload is not acceptance or delivered receipt. |
| P13 | Release → MOA Workflow | Idempotent package + receipt | Outbox intent and confirmed handoff are distinct; deployment needs target authority. |
| P14 | Execution Gateway → External enterprise systems | Admitted HTTPS / MCP effect | Current AC guard precedes Gateway Policy ENFORCE and qualified target credentials. |
| P15 | External enterprise systems → Effect Validation | Receipt / observed postcondition | Uncertain effects are reconciled before any permitted retry. |
| P16 | Governed target adapters → External enterprise systems | Target-authorised domain effect | Generated product operates with its own approved target authority and controls. |
| P17 | Core Control → Operations & incident response | Redacted metrics / traces | CloudWatch/OTEL operations are distinct from exact acceptance evidence. |
| P18 | Core Control → Central security audit | Configured API audit events | Organization trail plus selected data events; log archive is separately administered. |
