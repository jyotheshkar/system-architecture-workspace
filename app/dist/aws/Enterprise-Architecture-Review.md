# Agentic Core | AWS Enterprise System Design Architecture

**Proposed reference design; no AWS infrastructure has been deployed by this deliverable.** Reviewed 6 October 2026. Costs are excluded.

Source: Reference Architecture schema version 1.0.0; current source snapshot includes **35 capabilities, 68 typed interfaces and five optional modules**. Source SHA-256: `6a00568419c9d4fd2d4ceccac30fe0b6b45737aabb78ba00210609f095fa97af`. Deployment/supporting services do not introduce new AC responsibilities.

## Presenter brief

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
