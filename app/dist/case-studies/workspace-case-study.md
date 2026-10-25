# System Architecture Workspace — AWS Architecture Case Study

From a customer idea to an explorable model and an engineer-reviewed AWS baseline.

**Status:** AWS design case studies; cloud deployment and runtime validation pending

## Business Scope
A browser workspace for manually authored, versioned architecture models. The bounded AWS target adds controlled requirements/model proposals, deterministic checks, AWS mapping and explicit engineer review. All views share one canonical model.

## Constraints
- One workload account and one Region, targeting eu-west-2. Start with an explicitly single-owner pilot; general customer tenancy is later work.
- Prototype design limits: 50 components, 100 interfaces and 256 KiB canonical model JSON. These are chosen test assumptions, not measured capacity.
- The browser renders the graph. Longer drafting/checking jobs are asynchronous and bounded.
- Generated graphs are data. No generated script executes and no architecture output automatically provisions AWS resources.
- A changed brief, graph or AWS mapping invalidates dependent eligibility and engineer approval.

## Seven Logical Responsibilities
- 1. Customer intake — CloudFront/S3 + Cognito + API: Accept an owned idea and return the actual durable revision receipt.
- 2. Requirements brief — Lambda + DynamoDB; bounded Bedrock proposal: Expose unanswered questions and record customer confirmation of an exact brief.
- 3. 3D model — Canonical model in S3; browser rendering: Draft or manually edit connected components and interfaces; preserve source lineage across views.
- 4. Design checks — Step Functions + validator Lambdas: Check structure, references, ownership and constraints; incomplete results remain inconclusive.
- 5. AWS mapping — Reviewed catalog + Lambda: Choose services with alternatives, boundaries, interfaces and cost assumptions; save an exact candidate.
- 6. Engineer review — Authenticated review API + ledger: Record reviewer identity and disposition for the exact candidate and evidence; changes require re-review.
- 7. Baseline package — Private S3 + export Lambda: Deliver diagrams, canonical model, assumptions, findings and decisions under one manifest. Implementation needs separate authority.

## Architecture Decisions

### One canonical architecture model
Store nodes, edges, revisions and requirement references once. 3D, concept, ADA and AWS views project that same revision.
Alternative / trade-off: Independently maintained diagrams are simpler initially but create version drift and conflicting source claims.

### Static delivery separate from private data
CloudFront with an S3 REST origin and OAC serves versioned assets. Cognito/API Gateway/Lambda handle private project operations.
Alternative / trade-off: The existing Worker-hosted site remains the implemented prototype. This AWS hosting target is a proposed migration.

### Keep identity and authorisation separate
Cognito identifies the principal; trusted application records decide each project read, edit and review. Begin with an explicit single-owner AWS pilot.
Alternative / trade-off: A general multi-tenant service needs membership, revocation and cross-tenant isolation design/testing beyond this baseline.

### Metadata versus artifacts
DynamoDB holds project/revision/status/approval records and exact artifact references. Private versioned S3 holds briefs, graph JSON, findings, diagrams and baselines.
Alternative / trade-off: The current private GitHub contents backend remains an optional versioned persistence path; it is not already DynamoDB.

### Bounded proposals and deterministic checks
Bedrock may propose typed requirements or graphs from reviewed patterns. Lambda validates shape, references, acyclicity where required, limits and findings.
Alternative / trade-off: Manual authoring is a supported baseline. Model-written text and graph completeness do not establish design correctness.

### Review the exact candidate
Engineer approval binds graph, requirements, AWS mapping, findings and rule versions. Missing mandatory checks or expired authority block baseline release.
Alternative / trade-off: A generated diagram or completion status cannot substitute for accountable engineer review.

### Export an engineering baseline
Package source data, readable diagrams, decisions and evidence with version/digest lineage. Storage versions are not automatically immutable.
Alternative / trade-off: Optional candidate CloudFormation is a future export; validation or generation never grants deployment or spending authority.

## Six-Pillar Review

### Operational Excellence
Decision: Correlated project/revision/job IDs, explicit save states and reproducible deployment.
Failure: Persistence fails after a local edit or a checker job stops.
Required evidence (pending cloud execution): Preserve the draft, show truthful status, trace the job and run an alert/recovery exercise.

### Security
Decision: Project-aware authorisation, private artifacts, untrusted model output and separate reviewer authority.
Failure: A user requests another project or a changed candidate inherits old approval.
Required evidence (pending cloud execution): Deny wrong-owner/project operations, expired tokens and stale reviews; inspect private-object and IAM policies.

### Reliability
Decision: Conditional revision writes, stable job identities, valid-model recovery and exact baseline lineage.
Failure: Lost save response, concurrent edit conflict or duplicate modelling job.
Required evidence (pending cloud execution): Reconcile the durable receipt; preserve both conflicting drafts; recover the last valid model and block stale packaging.

### Performance Efficiency
Decision: Render in browser; bound graph/payload size; keep inference asynchronous.
Failure: Large graphs or slow inference freeze navigation.
Required evidence (pending cloud execution): Measure save, interaction and job latency on declared devices and pilot load. Graph limits are test assumptions.

### Cost Optimization
Decision: Debounce saves, use explicit generation, bound tokens and lifecycle artifacts.
Failure: Every canvas movement triggers a model call or a full save.
Required evidence (pending cloud execution): Meter requests, tokens, jobs, artifact versions and logs per project; estimate pilot and 10x volume.

### Sustainability
Decision: Reuse unchanged results, avoid hidden rendering work and expire redundant artifacts.
Failure: Hidden animation or repeated full regeneration wastes compute.
Required evidence (pending cloud execution): Measure idle rendering, transmitted bytes, model calls and reuse per useful reviewed baseline; no emissions claim.

## Evidence Status
### Implemented / authored
- Interactive browser models and study views, local page drafts and owner sign-in through the current Cloudflare Worker.
- Server-side session records, optional encrypted private GitHub connection settings, private-repository checks and SHA-based revision conflicts.
- A deterministic reference guide using authored data. Production GitHub saves require the configured repository-scoped connection.
### Proposed AWS design
- AWS hosting/identity/data target and the seven-stage customer-idea-to-reviewed-baseline pipeline.
- Bounded model proposals, future customer accounts and version-bound engineer approval controls.
### Pending
- AWS migration, prompt-driven architecture generation and multi-customer tenancy are not implemented by the current prototype.
- Cloud auth/IAM/recovery tests and measured browser/job capacity, model quality and billing evidence remain to be collected.

## Suggested CV Wording
Built an interactive architecture-modelling prototype with owner authentication, browser drafts and optional private GitHub revision storage; designed a serverless AWS target covering canonical models, deterministic design checks, engineer review and traceable baseline exports across all six Well-Architected pillars.

## Scope Boundary
The design baseline is ready to discuss when one idea can be traced through the seven stages, shared model, AWS services, engineer review and versioned baseline, with alternatives and evidence limits. Automatic architecture generation, broad tenancy and cloud provisioning remain separate extensions.

## Official Sources
- AWS Well-Architected six pillars: https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html
- API Gateway JWT authorizers: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html
- DynamoDB transactions: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html
- Step Functions Standard and Express: https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html
- S3 versioning and lifecycle: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html
- CloudFront origin access control: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- AWS Pricing Calculator: https://calculator.aws/
