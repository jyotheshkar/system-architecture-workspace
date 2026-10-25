# Agentic Core AWS enterprise reference pack

Open the root index.html and choose **AWS System Design Architecture**, then **Full Architecture**. The Reference, Concept and AWS views share the same controls and continuous study inspector. All runtime code and diagram/service icons are included for offline study.

The authoritative editable diagram is Agentic-Core-AWS-Architecture.drawio. Its first page maps all 35 capabilities and 68 interfaces; its second page explains 18 representative deployment communication paths; the other six pages are logical subsystem studies. Their arrows do not imply direct unguarded network transport. Enterprise SVG/PNG files show the same nested topology.

Read Enterprise-Architecture-Review.md before the presentation. Use the mapping and connection register for source traceability, ADRs for decisions/alternatives, Security-and-Operations.md for enforcement and operating limits, and the study guide for the AWS explanation. Official-AWS-References.md records primary documentation checked for service choices. Costs are excluded.

Solid boundaries represent physical organization/account/Region/VPC/AZ/subnet placement; dashed boundaries represent logical groupings. IAM/STS is labeled an account-wide/global facet. Managed services stay outside customer VPC task boxes. The topology depicts one selected environment, with isolated copies proposed for dev/preproduction/production.

No AWS resources were deployed by this project. Verification covers source fidelity, documentation, DOM/event behavior and rendered diagram artifacts; it does not establish real browser rendering or AWS runtime/security/capacity performance. See Verification-Report.md.

AWS service icons are from the official AWS Architecture Icons package, July 31, 2026: https://aws.amazon.com/architecture/icons/. The uploaded example images informed boundary nesting and environment separation; their services and pipelines were not copied into AC responsibilities.
