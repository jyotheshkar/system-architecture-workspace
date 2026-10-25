/* Derived from the supplied five-sheet Node 01 AWS v7.1 design.
 * This data records a proposal and unrun tests, not deployment evidence. */
(() => {
  'use strict';
  window.SAWNode01Data = {
  "id": "agentic-core",
  "version": "agentic-node01-v7.1",
  "title": "Agentic Core",
  "node01": {
    "version": "Node 01 AWS v7.1",
    "scope": "100 UK-user pilot; proposed durable intake and recoverable handoff",
    "region": "eu-west-2",
    "regionName": "Europe (London)",
    "deploymentStatus": "AWS implementation unknown",
    "testStatus": "AWS tests NOT RUN",
    "source": {
      "filename": "Agentic-Core-Node-01-AWS-v7.1-Official-Icons.drawio",
      "sha256": "e7baad98e146822a6692b022097306d621225904c8346680d2af93ec7e0996d0",
      "sheets": [
        {
          "id": "p1",
          "title": "01 Executive AWS Architecture",
          "cells": {
            "p1c1": "Executive AWS Architecture",
            "p1c2": "AGENTIC CORE | NODE 01 | AWS v7.1 | 100 UK-user pilot | PROPOSED DESIGN",
            "p1c3": "OFFLINE ARTIFACT CHECKS ONLY. AWS implementation unknown; AWS tests NOT RUN. Node 02 is an interface boundary.",
            "p1c4": "Customer environment | untrusted client",
            "p1c6": "Customer browser",
            "p1c7": "Natural-language requirement",
            "p1c8": "AWS Cloud | managed infrastructure, customer-configured controls",
            "p1c9": "AWS workload account | ownership and IAM administration",
            "p1c10": "Managed frontend hosting | distributed delivery",
            "p1c13": "Amplify Hosting",
            "p1c14": "Static assets and managed CDN",
            "p1c15": "CDN delivery is global; app configuration is regional.\nNo private customer data is cached in static assets.",
            "p1c16": "Europe (London) | eu-west-2 regional application resources",
            "p1c19": "Amazon Cognito",
            "p1c20": "PKCE login; scoped access tokens",
            "p1c23": "API Gateway HTTP API",
            "p1c24": "JWT claims and route permissions",
            "p1c27": "AWS Lambda",
            "p1c28": "Validate; authorise tenant/project",
            "p1c31": "Amazon DynamoDB",
            "p1c32": "Atomic message, receipt and outbox",
            "p1c35": "Outbox delivery",
            "p1c36": "Streams relay + scheduled recovery",
            "p1c39": "Amazon SQS Standard",
            "p1c40": "References; retries and DLQ",
            "p1c42": "Node 02 interface only",
            "p1c43": "Durable receipt required; not built",
            "p1c44": "Cross-cutting controls: IAM least privilege, encryption, CloudWatch, CloudTrail audit scope and rollback.\nAcceptance proves durable intake only. Keep outbox obligation until downstream durable acceptance.",
            "p1c45": "C01 assets",
            "p1c46": "C02 PKCE login",
            "p1c47": "C03 submit / history",
            "p1c48": "JWT keys",
            "p1c49": "C04 API",
            "p1c50": "C05 atomic commit",
            "p1c51": "C06 outbox",
            "p1c52": "C07 send",
            "p1c53": "C08 Lambda polls queue",
            "p1c54": "LEGEND: blue solid = HTTPS/API   purple = identity   green = data access\nOrange dashed = async delivery   grey dashed = control/telemetry\nColoured services = proposed. Amber dashed = unresolved boundary. No live-verified elements."
          }
        },
        {
          "id": "p2",
          "title": "02 Detailed Deployment Architecture",
          "cells": {
            "p2c1": "Detailed Deployment Architecture",
            "p2c2": "AGENTIC CORE | NODE 01 | AWS v7.1 | 100 UK-user pilot | PROPOSED DESIGN",
            "p2c3": "OFFLINE ARTIFACT CHECKS ONLY. AWS implementation unknown; AWS tests NOT RUN. Node 02 is an interface boundary.",
            "p2c4": "Customer environment | browser outside AWS",
            "p2c6": "Browser",
            "p2c7": "No client secret; untrusted IDs",
            "p2c8": "All customer calls use HTTPS. Frontend access does not grant API access.\nC01 assets | C02 PKCE login | C03 authenticated submit/history",
            "p2c9": "AWS Cloud",
            "p2c10": "Workload AWS account | production ID not yet assigned",
            "p2c11": "Amplify managed frontend | global CDN delivery",
            "p2c14": "Amplify Hosting",
            "p2c15": "Static Next.js export; no SSR compute",
            "p2c16": "Trust: identity + IAM + application checks.\nNo VPC/subnets in this baseline.\nAPI protection must cover the API itself.",
            "p2c17": "Europe (London), eu-west-2 | regional resources",
            "p2c20": "Cognito",
            "p2c21": "Public client; access token; PKCE",
            "p2c24": "HTTP API",
            "p2c25": "Issuer/aud or client_id; route scope",
            "p2c28": "Intake Lambda",
            "p2c29": "token_use + client allowlist;\ntenant/project/conversation checks",
            "p2c32": "History/status Lambda",
            "p2c33": "Current permission; scoped query",
            "p2c36": "DynamoDB",
            "p2c37": "Membership + project + conversation\nMessage + receipt + outbox; due GSI",
            "p2c40": "DynamoDB Streams",
            "p2c41": "Outbox filter; 24-hour retention",
            "p2c44": "Stream relay Lambda",
            "p2c45": "Conditional lease; send stable event",
            "p2c48": "EventBridge Scheduler",
            "p2c49": "Five-minute async invocation",
            "p2c52": "Reconciliation Lambda",
            "p2c53": "Due-index query; lease; retry cap",
            "p2c56": "SQS Standard queue",
            "p2c57": "Reference IDs; at-least-once delivery",
            "p2c59": "Node 02 interface",
            "p2c60": "Lambda ESM polls; durable receipt\nOnly interface responsibilities",
            "p2c63": "SQS DLQ",
            "p2c64": "Redrive after bounded failures\nOperator reviews before replay",
            "p2c65": "Recovery: PENDING_SEND -> QUEUE_ACKED -> DOWNSTREAM_ACCEPTED.\nQUEUE_ACKED stays outstanding until a durable Node 02 receipt. Stale acceptance becomes NEEDS_REVIEW.\nScheduler delivery retries and Lambda async handler-failure controls are separate. No infinite automatic DLQ replay.",
            "p2c66": "C01 assets",
            "p2c67": "C02 PKCE",
            "p2c68": "C03 HTTPS submit / history",
            "p2c69": "JWT keys",
            "p2c70": "C04 POST",
            "p2c71": "C04 GET",
            "p2c72": "C05 transaction",
            "p2c73": "C05 read",
            "p2c74": "C06 change",
            "p2c75": "C06 trigger",
            "p2c76": "C07 SendMessage",
            "p2c77": "C08 ESM",
            "p2c78": "C09 redrive policy",
            "p2c79": "C10 async Invoke",
            "p2c80": "C11 due query/update",
            "p2c81": "C07 recovery send",
            "p2c82": "C12 durable receipt",
            "p2c83": "Node 02 durable receipt uses agreed service-authenticated interface (C12); separate bounded role and tenant/reference validation.\nNo model execution or downstream workflow is implemented in this package.",
            "p2c84": "Cross-cutting: IAM role per responsibility | encryption at rest and TLS | CloudWatch logs/alarms\nCloudTrail management audit; selected DynamoDB data events only if configured | versioned IaC and restore/rollback runbooks",
            "p2c85": "LEGEND: blue solid = HTTPS/API   purple = identity   green = data access\nOrange dashed = async delivery   grey dashed = control/telemetry\nColoured services = proposed. Amber dashed = unresolved boundary. No live-verified elements."
          }
        },
        {
          "id": "p3",
          "title": "03 End-to-End Interaction Sequence",
          "cells": {
            "p3c1": "End-to-End Interaction Sequence",
            "p3c2": "AGENTIC CORE | NODE 01 | AWS v7.1 | 100 UK-user pilot | PROPOSED DESIGN",
            "p3c3": "OFFLINE ARTIFACT CHECKS ONLY. AWS implementation unknown; AWS tests NOT RUN. Node 02 is an interface boundary.",
            "p3c4": "Browser",
            "p3c6": "Cognito",
            "p3c8": "HTTP API",
            "p3c10": "Intake / history",
            "p3c12": "DynamoDB",
            "p3c14": "Relay / recovery",
            "p3c16": "SQS",
            "p3c18": "Node 02 boundary",
            "p3c22": "1. GET login; authorisation code with PKCE",
            "p3c25": "2. Code exchange + access token",
            "p3c28": "3. POST requirement + Idempotency-Key",
            "p3c31": "4. JWT + scope validated; claims forwarded",
            "p3c34": "5. Conditional atomic commit: permissions + message + receipt + outbox",
            "p3c37": "6. Commit succeeds",
            "p3c40": "7. Receipt: accepted; messageId; pending handoff",
            "p3c43": "8. HTTP 202 after commit",
            "p3c46": "9. Streams emits committed outbox; relay leases",
            "p3c49": "10. SendMessage reference + stable eventId",
            "p3c52": "11. Queue ACK; retain outstanding obligation",
            "p3c55": "12. Lambda ESM polls queue",
            "p3c58": "13. Batch; duplicates/out-of-order possible",
            "p3c61": "14. Durable acceptance receipt via agreed authenticated interface",
            "p3c64": "15. ESM deletes successful records",
            "p3c67": "16. GET authorised status/history",
            "p3c70": "17. Validated request",
            "p3c73": "18. Current permissions + tenant-scoped query",
            "p3c76": "19. Authorised records and persisted status",
            "p3c79": "20. History / status response",
            "p3c82": "21. No inferred contract completion",
            "p3c83": "FAILURE A: response lost after commit -> retry same key/hash, return original receipt. Changed hash -> 409.\nFAILURE B: relay unavailable >24h -> persistent outbox + due-index reconciliation recovers; lease expiry permits retry.\nFAILURE C: send succeeded then relay crashed -> duplicate possible; Node 02 deduplicates eventId before durable work.\nFAILURE D: queue expiry / DLQ / stale receipt -> outstanding acceptance becomes NEEDS_REVIEW; controlled replay only.\nFAILURE E: write fails -> no acceptance; invalid identity/tenant/project -> deny without writes.",
            "p3c84": "LEGEND: blue solid = HTTPS/API   purple = identity   green = data access\nOrange dashed = async delivery   grey dashed = control/telemetry\nColoured services = proposed. Amber dashed = unresolved boundary. No live-verified elements."
          }
        },
        {
          "id": "p4",
          "title": "04 Six-Pillar Architecture Review",
          "cells": {
            "p4c1": "Six-Pillar Architecture Review",
            "p4c2": "AGENTIC CORE | NODE 01 | AWS v7.1 | 100 UK-user pilot | PROPOSED DESIGN",
            "p4c3": "OFFLINE ARTIFACT CHECKS ONLY. AWS implementation unknown; AWS tests NOT RUN. Node 02 is an interface boundary.",
            "p4c5": "01  Operational Excellence",
            "p4c6": "REQ: operators can diagnose/recover accepted work.\nDECISION: versioned IaC, config and release/rollback.\nAWS: CloudWatch, Lambda, queue/outbox metrics.\nTRADE-OFF: telemetry cost and sensitive-data exposure.\nRISK: silent backlog or alarm without owner.\nMITIGATION: correlation IDs, age alarms, named runbooks.\nEVIDENCE: E10 alarm delivery, rollback/restore drill.\nSTATUS: documented; AWS tests NOT RUN.",
            "p4c8": "02  Security",
            "p4c9": "REQ: authenticated, tenant/project-isolated access.\nDECISION: PKCE + scoped tokens + current permissions.\nAWS: Cognito, HTTP API JWT, Lambda, IAM/encryption.\nTRADE-OFF: shared table relies on app authorisation.\nRISK: offline JWT survives logout; cross-tenant IDs.\nMITIGATION: token_use/client checks, active membership.\nEVIDENCE: E01/E02/E08 negative/security tests.\nSTATUS: documented; AWS tests NOT RUN.",
            "p4c11": "03  Reliability",
            "p4c12": "REQ: acceptance survives handoff/retry failure.\nDECISION: atomic outbox, leases, durable receipt.\nAWS: DynamoDB, Streams, Scheduler, SQS/DLQ.\nTRADE-OFF: single Region; duplicates remain possible.\nRISK: queue ACK mistaken for downstream acceptance.\nMITIGATION: obligation retained; bounded reconciliation.\nEVIDENCE: E03/E04/E05/E10 crash/replay/restore.\nSTATUS: documented; AWS tests NOT RUN.",
            "p4c14": "04  Performance Efficiency",
            "p4c15": "REQ: p95 intake <1s at 10rps; 50rps burst.\nDECISION: short commit path; indexed, paginated reads.\nAWS: CDN, Lambda, DynamoDB on-demand, SQS.\nTRADE-OFF: cold starts vs idle provisioned capacity.\nRISK: hot tenant, quota or backlog saturation.\nMITIGATION: measured memory, caps and fairness.\nEVIDENCE: E07 realistic load/cold-start/backlog report.\nSTATUS: assumptions only; measurements NOT RUN.",
            "p4c17": "05  Cost Optimization",
            "p4c18": "REQ: approved pilot and 10x budget.\nDECISION: workload-based regional pricing model.\nAWS: metered services, no idle workers/NAT baseline.\nTRADE-OFF: monitoring fixed cost at small demand.\nRISK: abuse, polling, retries or omitted transfer costs.\nMITIGATION: limits, cost tags, alerts, rate evidence.\nEVIDENCE: E09 pricing sources + actual cost readback.\nSTATUS: rates researched; billing tests NOT RUN.",
            "p4c20": "06  Sustainability",
            "p4c21": "REQ: efficient resources at equal correctness.\nDECISION: demand-based compute and retained-data policy.\nAWS: managed compute/CDN/storage; bounded recovery.\nTRADE-OFF: retention/audit and latency/idle capacity.\nRISK: duplicate work, unbounded scans or polling.\nMITIGATION: dedupe, pagination, lifecycle controls.\nEVIDENCE: GB-seconds/bytes per accepted request.\nSTATUS: resource model; no carbon claim or live test.",
            "p4c22": "Review depth: requirement -> decision -> implementation -> trade-off -> risk -> mitigation -> evidence -> status.\nSix pillars are review dimensions, not six sequential layers or an official L4/L6 scoring rubric."
          }
        },
        {
          "id": "p5",
          "title": "05 Requirements and Evidence Traceability",
          "cells": {
            "p5c1": "Requirements and Evidence Traceability",
            "p5c2": "AGENTIC CORE | NODE 01 | AWS v7.1 | 100 UK-user pilot | PROPOSED DESIGN",
            "p5c3": "OFFLINE ARTIFACT CHECKS ONLY. AWS implementation unknown; AWS tests NOT RUN. Node 02 is an interface boundary.",
            "p5c4": "Business requirement",
            "p5c5": "AWS component",
            "p5c6": "Architectural control",
            "p5c7": "Verification method",
            "p5c8": "Evidence / state",
            "p5c9": "BR01 Authorised submit",
            "p5c10": "Cognito / HTTP API / Lambda",
            "p5c11": "PKCE; access token; scope; current membership",
            "p5c12": "Wrong issuer/client/type/scope, expired token denied",
            "p5c13": "E01 / E02\nNOT RUN",
            "p5c14": "BR02 Tenant/project isolation",
            "p5c15": "Lambda / DynamoDB",
            "p5c16": "Server-derived tenant; project/conversation permission",
            "p5c17": "Two-tenant guessed IDs and revoked membership",
            "p5c18": "E02 / E08\nNOT RUN",
            "p5c19": "BR03 Durable acceptance",
            "p5c20": "DynamoDB transaction",
            "p5c21": "Permissions condition + message + receipt + outbox",
            "p5c22": "Fail/crash around commit; no orphan acceptance",
            "p5c23": "E03\nNOT RUN",
            "p5c24": "BR04 Retry safety",
            "p5c25": "Receipt key / relay / Node 02",
            "p5c26": "Same key/hash; stable event ID; downstream dedupe",
            "p5c27": "Lost response, send crash, concurrent duplicates",
            "p5c28": "E04\nNOT RUN",
            "p5c29": "BR05 Recoverable handoff",
            "p5c30": "Outbox / Scheduler / SQS / DLQ",
            "p5c31": "Retain until durable receipt; bounded recovery",
            "p5c32": "Outage >24h, expired queue, DLQ replay",
            "p5c33": "E05\nNOT RUN",
            "p5c34": "BR06 Truthful history/status",
            "p5c35": "HTTP API / history handler",
            "p5c36": "Scoped reads; state from durable evidence",
            "p5c37": "Compare receipt/state under failed handoff",
            "p5c38": "E06\nNOT RUN",
            "p5c39": "BR07 Responsive intake",
            "p5c40": "CDN / Lambda / indexed DB",
            "p5c41": "Short path, pagination, concurrency quotas",
            "p5c42": "10rps 15min + 50rps burst; latency/backlog",
            "p5c43": "E07\nNOT RUN",
            "p5c44": "BR08 Protected prompt",
            "p5c45": "IAM / TLS / encryption / logs",
            "p5c46": "Least privilege; no body/token logs; retention",
            "p5c47": "Policy readback; canary; deletion/backup review",
            "p5c48": "E08\nNOT RUN",
            "p5c49": "BR09 Bounded spend/resources",
            "p5c50": "Metered AWS services",
            "p5c51": "Caps, regional model, efficient queries/retries",
            "p5c52": "Pilot / 10x estimate; observed billing/resource use",
            "p5c53": "E09\nRATES RESEARCHED",
            "p5c54": "BR10 Operable recovery",
            "p5c55": "IaC / CloudWatch / audit / backup",
            "p5c56": "Named owner, alarm, restore/rollback/replay",
            "p5c57": "Alarm delivery, isolated restore, rollback drill",
            "p5c58": "E10\nNOT RUN",
            "p5c59": "Evidence scope: XML/native rendering/visual checks apply to the delivered files only.\nThey do not demonstrate authentication, tenant isolation, delivery, performance or AWS deployment.\nE11 source preservation remains PARTIAL because original v5 and eight-layer specification were unavailable."
          }
        }
      ]
    },
    "pillars": {
      "operations": {
        "title": "Operational Excellence",
        "requirement": "operators can diagnose/recover accepted work.",
        "decision": "versioned IaC, config and release/rollback.",
        "aws": "CloudWatch, Lambda, queue/outbox metrics.",
        "tradeoff": "telemetry cost and sensitive-data exposure.",
        "risk": "silent backlog or alarm without owner.",
        "mitigation": "correlation IDs, age alarms, named runbooks.",
        "evidence": "E10 alarm delivery, rollback/restore drill.",
        "status": "documented; AWS tests NOT RUN.",
        "nodes": [
          "n01-scheduler",
          "n01-reconcile",
          "n01-dlq",
          "n01-relay",
          "n01-store"
        ],
        "sourceRefs": [
          "p4c6"
        ]
      },
      "security": {
        "title": "Security",
        "requirement": "authenticated, tenant/project-isolated access.",
        "decision": "PKCE + scoped tokens + current permissions.",
        "aws": "Cognito, HTTP API JWT, Lambda, IAM/encryption.",
        "tradeoff": "shared table relies on app authorisation.",
        "risk": "offline JWT survives logout; cross-tenant IDs.",
        "mitigation": "token_use/client checks, active membership.",
        "evidence": "E01/E02/E08 negative/security tests.",
        "status": "documented; AWS tests NOT RUN.",
        "nodes": [
          "n01-browser",
          "n01-cognito",
          "n01-api",
          "n01-intake",
          "n01-history",
          "n01-store",
          "n01-node02"
        ],
        "sourceRefs": [
          "p4c9"
        ]
      },
      "reliability": {
        "title": "Reliability",
        "requirement": "acceptance survives handoff/retry failure.",
        "decision": "atomic outbox, leases, durable receipt.",
        "aws": "DynamoDB, Streams, Scheduler, SQS/DLQ.",
        "tradeoff": "single Region; duplicates remain possible.",
        "risk": "queue ACK mistaken for downstream acceptance.",
        "mitigation": "obligation retained; bounded reconciliation.",
        "evidence": "E03/E04/E05/E10 crash/replay/restore.",
        "status": "documented; AWS tests NOT RUN.",
        "nodes": [
          "n01-store",
          "n01-streams",
          "n01-relay",
          "n01-scheduler",
          "n01-reconcile",
          "n01-queue",
          "n01-dlq",
          "n01-node02"
        ],
        "sourceRefs": [
          "p4c12"
        ]
      },
      "performance": {
        "title": "Performance Efficiency",
        "requirement": "p95 intake <1s at 10rps; 50rps burst.",
        "decision": "short commit path; indexed, paginated reads.",
        "aws": "CDN, Lambda, DynamoDB on-demand, SQS.",
        "tradeoff": "cold starts vs idle provisioned capacity.",
        "risk": "hot tenant, quota or backlog saturation.",
        "mitigation": "measured memory, caps and fairness.",
        "evidence": "E07 realistic load/cold-start/backlog report.",
        "status": "assumptions only; measurements NOT RUN.",
        "nodes": [
          "n01-amplify",
          "n01-api",
          "n01-intake",
          "n01-history",
          "n01-store",
          "n01-queue"
        ],
        "sourceRefs": [
          "p4c15"
        ]
      },
      "cost": {
        "title": "Cost Optimization",
        "requirement": "approved pilot and 10x budget.",
        "decision": "workload-based regional pricing model.",
        "aws": "metered services, no idle workers/NAT baseline.",
        "tradeoff": "monitoring fixed cost at small demand.",
        "risk": "abuse, polling, retries or omitted transfer costs.",
        "mitigation": "limits, cost tags, alerts, rate evidence.",
        "evidence": "E09 pricing sources + actual cost readback.",
        "status": "rates researched; billing tests NOT RUN.",
        "nodes": [
          "n01-amplify",
          "n01-intake",
          "n01-history",
          "n01-store",
          "n01-reconcile",
          "n01-queue"
        ],
        "sourceRefs": [
          "p4c18"
        ]
      },
      "sustainability": {
        "title": "Sustainability",
        "requirement": "efficient resources at equal correctness.",
        "decision": "demand-based compute and retained-data policy.",
        "aws": "managed compute/CDN/storage; bounded recovery.",
        "tradeoff": "retention/audit and latency/idle capacity.",
        "risk": "duplicate work, unbounded scans or polling.",
        "mitigation": "dedupe, pagination, lifecycle controls.",
        "evidence": "GB-seconds/bytes per accepted request.",
        "status": "resource model; no carbon claim or live test.",
        "nodes": [
          "n01-amplify",
          "n01-intake",
          "n01-store",
          "n01-reconcile",
          "n01-queue"
        ],
        "sourceRefs": [
          "p4c21"
        ]
      }
    },
    "requirements": [
      {
        "id": "BR01",
        "name": "Authorised submit",
        "aws": "Cognito / HTTP API / Lambda",
        "control": "PKCE; access token; scope; current membership",
        "method": "Wrong issuer/client/type/scope, expired token denied",
        "state": "E01 / E02 · NOT RUN",
        "sourceRefs": [
          "p5c9",
          "p5c10",
          "p5c11",
          "p5c12",
          "p5c13"
        ]
      },
      {
        "id": "BR02",
        "name": "Tenant/project isolation",
        "aws": "Lambda / DynamoDB",
        "control": "Server-derived tenant; project/conversation permission",
        "method": "Two-tenant guessed IDs and revoked membership",
        "state": "E02 / E08 · NOT RUN",
        "sourceRefs": [
          "p5c14",
          "p5c15",
          "p5c16",
          "p5c17",
          "p5c18"
        ]
      },
      {
        "id": "BR03",
        "name": "Durable acceptance",
        "aws": "DynamoDB transaction",
        "control": "Permissions condition + message + receipt + outbox",
        "method": "Fail/crash around commit; no orphan acceptance",
        "state": "E03 · NOT RUN",
        "sourceRefs": [
          "p5c19",
          "p5c20",
          "p5c21",
          "p5c22",
          "p5c23"
        ]
      },
      {
        "id": "BR04",
        "name": "Retry safety",
        "aws": "Receipt key / relay / Node 02",
        "control": "Same key/hash; stable event ID; downstream dedupe",
        "method": "Lost response, send crash, concurrent duplicates",
        "state": "E04 · NOT RUN",
        "sourceRefs": [
          "p5c24",
          "p5c25",
          "p5c26",
          "p5c27",
          "p5c28"
        ]
      },
      {
        "id": "BR05",
        "name": "Recoverable handoff",
        "aws": "Outbox / Scheduler / SQS / DLQ",
        "control": "Retain until durable receipt; bounded recovery",
        "method": "Outage >24h, expired queue, DLQ replay",
        "state": "E05 · NOT RUN",
        "sourceRefs": [
          "p5c29",
          "p5c30",
          "p5c31",
          "p5c32",
          "p5c33"
        ]
      },
      {
        "id": "BR06",
        "name": "Truthful history/status",
        "aws": "HTTP API / history handler",
        "control": "Scoped reads; state from durable evidence",
        "method": "Compare receipt/state under failed handoff",
        "state": "E06 · NOT RUN",
        "sourceRefs": [
          "p5c34",
          "p5c35",
          "p5c36",
          "p5c37",
          "p5c38"
        ]
      },
      {
        "id": "BR07",
        "name": "Responsive intake",
        "aws": "CDN / Lambda / indexed DB",
        "control": "Short path, pagination, concurrency quotas",
        "method": "10rps 15min + 50rps burst; latency/backlog",
        "state": "E07 · NOT RUN",
        "sourceRefs": [
          "p5c39",
          "p5c40",
          "p5c41",
          "p5c42",
          "p5c43"
        ]
      },
      {
        "id": "BR08",
        "name": "Protected prompt",
        "aws": "IAM / TLS / encryption / logs",
        "control": "Least privilege; no body/token logs; retention",
        "method": "Policy readback; canary; deletion/backup review",
        "state": "E08 · NOT RUN",
        "sourceRefs": [
          "p5c44",
          "p5c45",
          "p5c46",
          "p5c47",
          "p5c48"
        ]
      },
      {
        "id": "BR09",
        "name": "Bounded spend/resources",
        "aws": "Metered AWS services",
        "control": "Caps, regional model, efficient queries/retries",
        "method": "Pilot / 10x estimate; observed billing/resource use",
        "state": "E09 · RATES RESEARCHED",
        "sourceRefs": [
          "p5c49",
          "p5c50",
          "p5c51",
          "p5c52",
          "p5c53"
        ]
      },
      {
        "id": "BR10",
        "name": "Operable recovery",
        "aws": "IaC / CloudWatch / audit / backup",
        "control": "Named owner, alarm, restore/rollback/replay",
        "method": "Alarm delivery, isolated restore, rollback drill",
        "state": "E10 · NOT RUN",
        "sourceRefs": [
          "p5c54",
          "p5c55",
          "p5c56",
          "p5c57",
          "p5c58"
        ]
      }
    ],
    "states": [
      "PENDING_SEND",
      "QUEUE_ACKED",
      "DOWNSTREAM_ACCEPTED",
      "NEEDS_REVIEW"
    ],
    "stateRules": [
      "PENDING_SEND exists only with the committed message and receipt.",
      "QUEUE_ACKED records queue acceptance but retains the delivery obligation.",
      "DOWNSTREAM_ACCEPTED requires the exact authenticated durable Node 02 receipt.",
      "Stale, expired or exhausted acceptance becomes NEEDS_REVIEW; replay is controlled."
    ],
    "evidenceScope": "Evidence scope: XML/native rendering/visual checks apply to the delivered files only.\nThey do not demonstrate authentication, tenant isolation, delivery, performance or AWS deployment.\nE11 source preservation remains PARTIAL because original v5 and eight-layer specification were unavailable.",
    "limitations": [
      "Node 02 is an interface boundary only.",
      "No downstream model execution or workflow is implemented in this package.",
      "No VPC or subnets are part of this baseline.",
      "The source records offline artifact checks only, not deployed AWS behavior.",
      "E09 has rates researched; billing tests are not run. This website does not reverify those prices.",
      "E11 source preservation remains PARTIAL because original v5 and the eight-layer specification were unavailable."
    ],
    "crossCutting": "Cross-cutting: IAM role per responsibility | encryption at rest and TLS | CloudWatch logs/alarms\nCloudTrail management audit; selected DynamoDB data events only if configured | versioned IaC and restore/rollback runbooks",
    "performance": {
      "target": "p95 intake <1 second at 10 requests/second, with a 50 requests/second burst",
      "status": "Assumptions only; measurements NOT RUN"
    },
    "failureNotes": [
      "FAILURE A: response lost after commit -> retry same key/hash, return original receipt. Changed hash -> 409.",
      "FAILURE B: relay unavailable >24h -> persistent outbox + due-index reconciliation recovers; lease expiry permits retry.",
      "FAILURE C: send succeeded then relay crashed -> duplicate possible; Node 02 deduplicates eventId before durable work.",
      "FAILURE D: queue expiry / DLQ / stale receipt -> outstanding acceptance becomes NEEDS_REVIEW; controlled replay only.",
      "FAILURE E: write fails -> no acceptance; invalid identity/tenant/project -> deny without writes."
    ]
  },
  "groups": [
    {
      "id": "core",
      "label": "Node 01: Requirement intake",
      "studyOrder": [
        "n01-browser",
        "n01-amplify",
        "n01-cognito",
        "n01-api",
        "n01-intake",
        "n01-history",
        "n01-store",
        "n01-streams",
        "n01-relay",
        "n01-scheduler",
        "n01-reconcile",
        "n01-queue",
        "n01-dlq",
        "n01-node02"
      ]
    }
  ],
  "nodes": [
    {
      "id": "n01-browser",
      "name": "Customer browser",
      "short": "Customer",
      "group": "core",
      "module": "core",
      "conceptLane": "entry",
      "role": "entry",
      "pos": [
        -42,
        5,
        0
      ],
      "order": 0,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "A customer describes the requirement, then checks the receipt and delivery status.",
      "responsibility": "A customer describes the requirement, then checks the receipt and delivery status.",
      "details": "The browser is outside AWS and is an untrusted client. It opens the static application, signs in with an authorisation code and PKCE, and sends a requirement over HTTPS with an Idempotency-Key. Client-supplied tenant, project and conversation IDs cannot grant access. A successful HTTP 202 means that Node 01 has durably accepted the request, not that Node 02 completed any work. The browser can read only currently authorised history and persisted status.\n\nSource: p2c6, p2c7, p2c8, p3c28, p3c43, p3c82. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Customer requirement",
        "Sign-in response",
        "Existing receipt or status"
      ],
      "outputs": [
        "Authenticated submission with Idempotency-Key",
        "Authorised history/status request"
      ],
      "icon": "/assets/aws-icons/browser.svg",
      "aws": {
        "service": "Customer environment",
        "short": "Customer environment",
        "icon": "/assets/aws-icons/browser.svg",
        "why": "Keep customer interaction outside the AWS trust boundary. The browser is not an AWS service.",
        "notes": "No client secret. No private customer data in the static frontend. A UI action alone cannot authorise a tenant or project.",
        "status": "Interface responsibility only",
        "sources": [],
        "services": []
      },
      "sourceRefs": [
        "p2c6",
        "p2c7",
        "p2c8",
        "p3c28",
        "p3c43",
        "p3c82"
      ]
    },
    {
      "id": "n01-amplify",
      "name": "Open the application",
      "short": "Open app",
      "group": "core",
      "module": "core",
      "conceptLane": "entry",
      "role": "entry",
      "pos": [
        -31,
        21,
        -8
      ],
      "order": 1,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Delivers the static website used to write requirements and read status.",
      "responsibility": "Delivers the static website used to write requirements and read status.",
      "details": "The proposed frontend is a static Next.js export on Amplify Hosting, with managed global CDN delivery. Application configuration is regional. This baseline has no server-side rendering compute. Static assets contain no private customer data. Access to the frontend does not grant access to the API.\n\nSource: p1c15, p2c14, p2c15, p2c16. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "HTTPS asset request",
        "Versioned static application release"
      ],
      "outputs": [
        "Public static assets"
      ],
      "icon": "/assets/aws-icons/browser.svg",
      "aws": {
        "service": "AWS Amplify Hosting",
        "short": "AWS Amplify Hosting",
        "icon": "/assets/aws-icons/node01-amplify.svg",
        "why": "Managed static hosting and CDN delivery suit the pilot without an always-running web server.",
        "notes": "CDN delivery is global; this is not an eu-west-2-only cache. API authentication and authorisation must protect the API independently.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "AWS Amplify Hosting",
            "url": "https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html"
      },
      "sourceRefs": [
        "p1c15",
        "p2c14",
        "p2c15",
        "p2c16"
      ]
    },
    {
      "id": "n01-cognito",
      "name": "Sign in securely",
      "short": "Sign in",
      "group": "core",
      "module": "core",
      "conceptLane": "identity",
      "role": "identity",
      "pos": [
        -20,
        21,
        8
      ],
      "order": 2,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Identifies the customer and issues a scoped access token through PKCE sign-in.",
      "responsibility": "Identifies the customer and issues a scoped access token through PKCE sign-in.",
      "details": "Use a public application client without a client secret. The authorisation-code flow uses PKCE. The resulting access token is presented to protected routes. Token validation and current tenant membership checks are distinct. An already issued JWT can remain valid after logout until its validity and application policy are checked; logout alone must not be presented as instant revocation of every offline JWT.\n\nSource: p2c20, p2c21, p2c25, p4c9. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "PKCE authorisation and code exchange"
      ],
      "outputs": [
        "Scoped access token",
        "Public verification keys"
      ],
      "icon": "/assets/aws-icons/user.svg",
      "aws": {
        "service": "Amazon Cognito",
        "short": "Amazon Cognito",
        "icon": "/assets/aws-icons/node01-cognito.svg",
        "why": "Cognito supplies the proposed customer sign-in and token issuance boundary.",
        "notes": "HTTP API checks issuer and the configured audience or client_id behavior and route scopes. Application code must validate token_use/client allowlist and current permission.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "Amazon Cognito",
            "url": "https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html"
      },
      "sourceRefs": [
        "p2c20",
        "p2c21",
        "p2c25",
        "p4c9"
      ]
    },
    {
      "id": "n01-api",
      "name": "Protect the API entry",
      "short": "Secure entry",
      "group": "core",
      "module": "core",
      "conceptLane": "intake",
      "role": "intake",
      "pos": [
        -23,
        2,
        0
      ],
      "order": 3,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Checks the token and route permission before sending requests to the right handler.",
      "responsibility": "Checks the token and route permission before sending requests to the right handler.",
      "details": "API Gateway HTTP API validates JWT identity claims and required route scope, then forwards validated claims to the intake or history handler. The design requires issuer and audience/client_id configuration consistent with the chosen token. It does not replace application-level token_use, client allowlist, active membership, project and conversation checks. Protected POST and GET operations both use HTTPS.\n\nSource: p2c24, p2c25, p2c68, p2c69, p2c70, p2c71. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Access token",
        "POST requirement or GET history/status"
      ],
      "outputs": [
        "Validated request and claims",
        "Denied request when JWT or route scope is invalid"
      ],
      "icon": "/assets/aws-icons/graph.svg",
      "aws": {
        "service": "Amazon API Gateway HTTP API",
        "short": "Amazon API Gateway HTTP API",
        "icon": "/assets/aws-icons/node01-api.svg",
        "why": "An HTTP API provides a managed regional entry point with JWT authorisation and separate protected routes.",
        "notes": "Frontend protection does not protect the API. This baseline deliberately contains no VPC or subnets; controls depend on identity, IAM and application checks.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "Amazon API Gateway HTTP API",
            "url": "https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html"
      },
      "sourceRefs": [
        "p2c24",
        "p2c25",
        "p2c68",
        "p2c69",
        "p2c70",
        "p2c71"
      ]
    },
    {
      "id": "n01-intake",
      "name": "Check and accept the request",
      "short": "Check request",
      "group": "core",
      "module": "core",
      "conceptLane": "intake",
      "role": "intake",
      "pos": [
        -7,
        4,
        4
      ],
      "order": 4,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Validates the request and accepts it only after an atomic durable commit.",
      "responsibility": "Validates the request and accepts it only after an atomic durable commit.",
      "details": "The intake handler checks token_use and client allowlist, derives the tenant on the server and verifies current membership plus project/conversation permission. In a conditional DynamoDB transaction it persists the message, idempotency receipt and delivery outbox together with the required permission condition. Return acceptance only after the commit succeeds. A retry using the same key and request hash returns the original receipt. The same key with changed content returns 409. Invalid identity or permissions and a failed commit must not produce acceptance.\n\nSource: p2c28, p2c29, p3c34, p3c40, p3c43, p3c83. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Validated identity claims",
        "Requirement, project/conversation reference and Idempotency-Key"
      ],
      "outputs": [
        "Durably stored message and original receipt",
        "HTTP 202 after commit, with handoff still pending",
        "Rejection or conflict without false acceptance"
      ],
      "icon": "/assets/aws-icons/check.svg",
      "aws": {
        "service": "AWS Lambda",
        "short": "AWS Lambda",
        "icon": "/assets/aws-icons/node01-lambda.svg",
        "why": "A short Lambda handler keeps request validation and the conditional commit separate from downstream delivery.",
        "notes": "p95 intake below one second at 10 requests/second with a 50 requests/second burst is a target assumption, not a measurement. Do not add model inference to this intake path.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "AWS Lambda",
            "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
      },
      "sourceRefs": [
        "p2c28",
        "p2c29",
        "p3c34",
        "p3c40",
        "p3c43",
        "p3c83"
      ]
    },
    {
      "id": "n01-history",
      "name": "Read authorised history and status",
      "short": "View history",
      "group": "core",
      "module": "core",
      "conceptLane": "history",
      "role": "history",
      "pos": [
        -6,
        -18,
        -9
      ],
      "order": 5,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Shows the customer what was saved and what the durable handoff state proves.",
      "responsibility": "Shows the customer what was saved and what the durable handoff state proves.",
      "details": "The separate history/status handler checks current permission for every request and performs tenant-scoped, indexed and paginated reads. Client references are untrusted. Revoked membership and guessed IDs must be denied. Return persisted receipts and delivery states without inferring contract completion, model execution or downstream success from a queue acknowledgement.\n\nSource: p2c32, p2c33, p3c67, p3c73, p3c76, p3c82, p5c34. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Validated GET request",
        "Current tenant/project/conversation permission"
      ],
      "outputs": [
        "Authorised records and persisted status",
        "Denied access for invalid or revoked permissions"
      ],
      "icon": "/assets/aws-icons/history.svg",
      "aws": {
        "service": "AWS Lambda",
        "short": "AWS Lambda",
        "icon": "/assets/aws-icons/node01-lambda.svg",
        "why": "A separate Lambda responsibility makes read authorisation and truthful status easy to explain and test.",
        "notes": "A signed-in user is not automatically authorised to every record. Avoid scans and unrestricted cross-tenant queries.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "AWS Lambda",
            "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
      },
      "sourceRefs": [
        "p2c32",
        "p2c33",
        "p3c67",
        "p3c73",
        "p3c76",
        "p3c82",
        "p5c34"
      ]
    },
    {
      "id": "n01-store",
      "name": "Save the request and its delivery obligation",
      "short": "Save safely",
      "group": "core",
      "module": "core",
      "conceptLane": "storage",
      "role": "storage",
      "pos": [
        8,
        1,
        0
      ],
      "order": 6,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Keeps the message, receipt and outbox together so acceptance survives failures.",
      "responsibility": "Keeps the message, receipt and outbox together so acceptance survives failures.",
      "details": "DynamoDB holds membership, project and conversation records plus the message, idempotency receipt and persistent outbox. The acceptance transaction binds current permission conditions to the message, receipt and outbox write. A due-work index supports recovery without a full-table scan. The outbox remains outstanding through QUEUE_ACKED until the agreed downstream durable receipt establishes DOWNSTREAM_ACCEPTED. Stale acceptance moves to NEEDS_REVIEW. Conditional leases prevent concurrent relays from freely claiming the same work; expiry permits bounded recovery.\n\nSource: p2c36, p2c37, p2c65, p2c72, p3c34, p5c19. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Conditional acceptance transaction",
        "Authorised scoped reads",
        "Lease and handoff state updates",
        "Authenticated downstream receipt"
      ],
      "outputs": [
        "Durable original receipt",
        "Committed outbox item",
        "Tenant-scoped records",
        "Due work and persisted handoff state"
      ],
      "icon": "/assets/aws-icons/history.svg",
      "aws": {
        "service": "Amazon DynamoDB",
        "short": "Amazon DynamoDB",
        "icon": "/assets/aws-icons/node01-dynamodb.svg",
        "why": "DynamoDB transactions and conditional writes provide the proposed durable intake boundary and guarded handoff state.",
        "notes": "A shared table still depends on correct application authorisation. Single-Region durability is not a multi-Region disaster-recovery claim. Retention, backup, restore and deletion policy require implementation and tests.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "Amazon DynamoDB",
            "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html"
      },
      "sourceRefs": [
        "p2c36",
        "p2c37",
        "p2c65",
        "p2c72",
        "p3c34",
        "p5c19"
      ]
    },
    {
      "id": "n01-streams",
      "name": "Notice committed new work",
      "short": "Detect new work",
      "group": "core",
      "module": "core",
      "conceptLane": "handoff",
      "role": "handoff",
      "pos": [
        21,
        15,
        -6
      ],
      "order": 7,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Emits committed outbox changes so delivery can start promptly.",
      "responsibility": "Emits committed outbox changes so delivery can start promptly.",
      "details": "DynamoDB Streams is filtered for committed outbox work and triggers the relay. The stream retention is 24 hours in the supplied design. It is an acceleration path, not the only recovery source. An outage longer than retention must be recovered from the persistent outbox and due index through scheduled reconciliation.\n\nSource: p2c40, p2c41, p2c74, p2c75, p3c83. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Committed outbox change"
      ],
      "outputs": [
        "Filtered delivery trigger"
      ],
      "icon": "/assets/aws-icons/graph.svg",
      "aws": {
        "service": "DynamoDB Streams",
        "short": "DynamoDB Streams",
        "icon": "/assets/aws-icons/node01-streams.svg",
        "why": "A stream trigger starts asynchronous delivery without waiting in the customer request path.",
        "notes": "Do not rely on stream retention as the lifetime of the delivery obligation. Persistent outbox recovery handles missed stream events.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "DynamoDB Streams",
            "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html"
      },
      "sourceRefs": [
        "p2c40",
        "p2c41",
        "p2c74",
        "p2c75",
        "p3c83"
      ]
    },
    {
      "id": "n01-relay",
      "name": "Send accepted work onward",
      "short": "Send onward",
      "group": "core",
      "module": "core",
      "conceptLane": "handoff",
      "role": "handoff",
      "pos": [
        35,
        8,
        4
      ],
      "order": 8,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Claims an outbox item and sends its stable reference to the delivery queue.",
      "responsibility": "Claims an outbox item and sends its stable reference to the delivery queue.",
      "details": "The stream relay obtains a conditional, expiring lease and sends a stable eventId plus reference IDs to SQS. Queue acknowledgement permits QUEUE_ACKED to be recorded but does not finish the outbox obligation. If the send succeeds and the relay crashes before recording it, a later attempt may send a duplicate. The downstream interface must deduplicate the eventId before durable work.\n\nSource: p2c44, p2c45, p2c76, p3c46, p3c49, p3c52, p3c83. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Committed outbox trigger",
        "Successful conditional lease"
      ],
      "outputs": [
        "Stable event and reference IDs to SQS",
        "Queue-acknowledged but still outstanding handoff state"
      ],
      "icon": "/assets/aws-icons/graph.svg",
      "aws": {
        "service": "AWS Lambda",
        "short": "AWS Lambda",
        "icon": "/assets/aws-icons/node01-lambda.svg",
        "why": "A bounded Lambda relay decouples the atomic database commit from the external queue send.",
        "notes": "The database commit and SendMessage are not one atomic transaction. This design permits duplicates and requires downstream idempotency.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "AWS Lambda",
            "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
      },
      "sourceRefs": [
        "p2c44",
        "p2c45",
        "p2c76",
        "p3c46",
        "p3c49",
        "p3c52",
        "p3c83"
      ]
    },
    {
      "id": "n01-scheduler",
      "name": "Wake up recovery",
      "short": "Recovery clock",
      "group": "core",
      "module": "core",
      "conceptLane": "recovery",
      "role": "recovery",
      "pos": [
        -9,
        -33,
        4
      ],
      "order": 9,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Invokes recovery every five minutes to find delivery work that still needs attention.",
      "responsibility": "Invokes recovery every five minutes to find delivery work that still needs attention.",
      "details": "EventBridge Scheduler asynchronously invokes reconciliation on a five-minute schedule. Scheduler delivery retries concern delivery of the invocation. Lambda asynchronous handler-failure retries and destinations are a separate responsibility. Configure both explicitly; successful invocation delivery does not prove the recovery handler succeeded.\n\nSource: p2c48, p2c49, p2c65, p2c79. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Five-minute configured schedule"
      ],
      "outputs": [
        "Asynchronous recovery invocation"
      ],
      "icon": "/assets/aws-icons/history.svg",
      "aws": {
        "service": "Amazon EventBridge Scheduler",
        "short": "Amazon EventBridge Scheduler",
        "icon": "/assets/aws-icons/node01-scheduler.svg",
        "why": "A periodic managed schedule covers missed triggers and delayed acceptance independently of the stream.",
        "notes": "Use a bounded invocation role, retry policy and failure handling. The proposed schedule is not an observed running service.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "Amazon EventBridge Scheduler",
            "url": "https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html"
      },
      "sourceRefs": [
        "p2c48",
        "p2c49",
        "p2c65",
        "p2c79"
      ]
    },
    {
      "id": "n01-reconcile",
      "name": "Recover unfinished handoffs",
      "short": "Recover handoff",
      "group": "core",
      "module": "core",
      "conceptLane": "recovery",
      "role": "recovery",
      "pos": [
        13,
        -24,
        -4
      ],
      "order": 10,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Finds due outbox items, retries within a cap, and escalates stale acceptance.",
      "responsibility": "Finds due outbox items, retries within a cap, and escalates stale acceptance.",
      "details": "Query the due-work index, obtain a conditional lease and reconcile the durable state before sending a stable event again. Recover missed stream work, expired leases and unconfirmed handoffs within a bounded retry policy. QUEUE_ACKED remains outstanding until downstream durable acceptance arrives. Queue expiry, DLQ outcomes and stale receipts require NEEDS_REVIEW and controlled operator action when limits are reached. Never run infinite automatic replay.\n\nSource: p2c52, p2c53, p2c65, p2c80, p2c81, p3c83. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Scheduled invocation",
        "Due-index records",
        "Persisted lease and handoff state"
      ],
      "outputs": [
        "Bounded recovery send",
        "Updated next-attempt or NEEDS_REVIEW state"
      ],
      "icon": "/assets/aws-icons/history.svg",
      "aws": {
        "service": "AWS Lambda",
        "short": "AWS Lambda",
        "icon": "/assets/aws-icons/node01-lambda.svg",
        "why": "A recovery Lambda and indexed durable outbox make delivery obligations recoverable beyond the stream retention window.",
        "notes": "Use indexed pagination, retry caps and age alarms. Capacity, maximum acceptance age, ownership and runbooks need explicit configured values and evidence.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "AWS Lambda",
            "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
      },
      "sourceRefs": [
        "p2c52",
        "p2c53",
        "p2c65",
        "p2c80",
        "p2c81",
        "p3c83"
      ]
    },
    {
      "id": "n01-queue",
      "name": "Queue the delivery reference",
      "short": "Delivery queue",
      "group": "core",
      "module": "core",
      "conceptLane": "handoff",
      "role": "handoff",
      "pos": [
        43,
        -6,
        0
      ],
      "order": 11,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Buffers a small reference event until the downstream consumer can accept it.",
      "responsibility": "Buffers a small reference event until the downstream consumer can accept it.",
      "details": "SQS Standard carries stable eventId and reference IDs, not an assertion of completed downstream work. Delivery is at least once and can be out of order. The proposed Node 02 Lambda event-source mapping polls the queue and processes batches. Successful records are deleted only according to that consumer contract. Node 02 must deduplicate before durable work and return the agreed durable acceptance receipt. Bounded failures route messages to the DLQ.\n\nSource: p2c56, p2c57, p2c76, p2c77, p2c78, p3c52, p3c58, p3c64. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Stable reference event from relay or recovery"
      ],
      "outputs": [
        "At-least-once batch delivery",
        "Queue ACK",
        "Failed delivery routed under the redrive policy"
      ],
      "icon": "/assets/aws-icons/graph.svg",
      "aws": {
        "service": "Amazon SQS Standard",
        "short": "Amazon SQS Standard",
        "icon": "/assets/aws-icons/node01-sqs.svg",
        "why": "SQS buffers delivery and failure retries independently of customer intake.",
        "notes": "SendMessage ACK proves queue acceptance, not Node 02 durable acceptance. Configure retention, visibility timeout, batch failures and redrive with the consumer; values are not established by this diagram.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "Amazon SQS Standard",
            "url": "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html"
      },
      "sourceRefs": [
        "p2c56",
        "p2c57",
        "p2c76",
        "p2c77",
        "p2c78",
        "p3c52",
        "p3c58",
        "p3c64"
      ]
    },
    {
      "id": "n01-dlq",
      "name": "Review failed delivery",
      "short": "Review failure",
      "group": "core",
      "module": "core",
      "conceptLane": "recovery",
      "role": "recovery",
      "pos": [
        34,
        -29,
        9
      ],
      "order": 12,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Holds messages that exceeded the queue delivery policy for operator review.",
      "responsibility": "Holds messages that exceeded the queue delivery policy for operator review.",
      "details": "The SQS dead-letter queue is part of the proposed failure path. Operators investigate the failed event and reconcile its durable receipt before any controlled replay. Queue expiry or a DLQ message does not erase the original outbox obligation. A stale unresolved acceptance becomes NEEDS_REVIEW. No infinite automatic DLQ replay is included.\n\nSource: p2c63, p2c64, p2c65, p2c78, p3c83. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "Message exceeding the configured redrive policy"
      ],
      "outputs": [
        "Operator-visible failed delivery",
        "Controlled replay decision after reconciliation"
      ],
      "icon": "/assets/aws-icons/review.svg",
      "aws": {
        "service": "Amazon SQS Standard",
        "short": "Amazon SQS Standard",
        "icon": "/assets/aws-icons/node01-sqs.svg",
        "why": "An SQS DLQ separates poison or persistently failing delivery from the main queue.",
        "notes": "Alarm ownership, redrive permissions, retention and replay runbooks must be configured and validated. No specific retry count is claimed in the source.",
        "status": "Proposed AWS design",
        "sources": [
          {
            "title": "Amazon SQS Standard",
            "url": "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html"
          }
        ],
        "services": [],
        "url": "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html"
      },
      "sourceRefs": [
        "p2c63",
        "p2c64",
        "p2c65",
        "p2c78",
        "p3c83"
      ]
    },
    {
      "id": "n01-node02",
      "name": "Next-stage acceptance boundary",
      "short": "Next stage",
      "group": "core",
      "module": "core",
      "conceptLane": "boundary",
      "role": "boundary",
      "pos": [
        57,
        11,
        -3
      ],
      "order": 13,
      "layer": 0,
      "status": "Proposed Node 01 design; AWS tests NOT RUN",
      "summary": "Defines the durable handoff expected from the next stage, which is not built here.",
      "responsibility": "Defines the durable handoff expected from the next stage, which is not built here.",
      "details": "Node 02 is an interface boundary only. The proposed consumer uses a Lambda event-source mapping to poll SQS, validates tenant and reference IDs and deduplicates stable eventId before durable work. Its durable acceptance receipt returns through an agreed service-authenticated interface using a separate bounded role. The diagram connects this receipt to persisted state but does not specify a public direct database endpoint. Downstream processing, model execution and full Agentic Core workflow are outside this package. Durable acceptance is not contract or workflow completion.\n\nSource: p2c59, p2c60, p2c82, p2c83, p3c61, p3c82. AWS implementation is unknown and AWS tests are NOT RUN.",
      "inputs": [
        "At-least-once reference event",
        "Agreed authenticated service identity and interface"
      ],
      "outputs": [
        "Durable acceptance receipt for the exact event",
        "Duplicate recognised without repeating durable work"
      ],
      "icon": "/assets/aws-icons/package.svg",
      "aws": {
        "service": "Node 02 interface only",
        "short": "Node 02 interface only",
        "icon": "/assets/aws-icons/package.svg",
        "why": "A clearly labelled downstream boundary records the consumer obligation without presenting an unbuilt service as deployed.",
        "notes": "The API shape, downstream implementation and receipt enforcement must be agreed and tested before integration. Separate receipt authority from intake and relay roles.",
        "status": "Interface responsibility only",
        "sources": [],
        "services": []
      },
      "sourceRefs": [
        "p2c59",
        "p2c60",
        "p2c82",
        "p2c83",
        "p3c61",
        "p3c82"
      ]
    }
  ],
  "edges": [
    {
      "id": "C01",
      "from": "n01-browser",
      "to": "n01-amplify",
      "source": "n01-browser",
      "target": "n01-amplify",
      "label": "Open static app",
      "name": "Open static app",
      "kind": "request",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "HTTPS fetch of static assets from managed CDN delivery. These assets contain no private customer data and grant no API access.\n\nSource: p2c66.",
      "sourceRefs": [
        "p2c66"
      ]
    },
    {
      "id": "C02",
      "from": "n01-browser",
      "to": "n01-cognito",
      "source": "n01-browser",
      "target": "n01-cognito",
      "label": "PKCE sign-in",
      "name": "PKCE sign-in",
      "kind": "identity",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Authorisation-code login with PKCE using a public client with no client secret.\n\nSource: p2c67, p3c22.",
      "sourceRefs": [
        "p2c67",
        "p3c22"
      ]
    },
    {
      "id": "C02-token",
      "from": "n01-cognito",
      "to": "n01-browser",
      "source": "n01-cognito",
      "target": "n01-browser",
      "label": "Return access token",
      "name": "Return access token",
      "kind": "identity",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Code exchange returns an access token. The browser supplies it to the protected API; current application permissions remain a separate check.\n\nSource: p3c25.",
      "sourceRefs": [
        "p3c25"
      ]
    },
    {
      "id": "C03",
      "from": "n01-browser",
      "to": "n01-api",
      "source": "n01-browser",
      "target": "n01-api",
      "label": "Submit or read status",
      "name": "Submit or read status",
      "kind": "request",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Authenticated HTTPS POST requirement with Idempotency-Key, or GET history/status. Client-supplied identifiers are untrusted.\n\nSource: p2c68, p3c28, p3c67.",
      "sourceRefs": [
        "p2c68",
        "p3c28",
        "p3c67"
      ]
    },
    {
      "id": "C03-keys",
      "from": "n01-cognito",
      "to": "n01-api",
      "source": "n01-cognito",
      "target": "n01-api",
      "label": "Verify JWT signature",
      "name": "Verify JWT signature",
      "kind": "identity",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "The HTTP API authoriser uses issuer key metadata and configured JWT claims and route scopes. This relationship is key verification, not forwarding each user password to the API.\n\nSource: p2c69.",
      "sourceRefs": [
        "p2c69"
      ]
    },
    {
      "id": "C04-post",
      "from": "n01-api",
      "to": "n01-intake",
      "source": "n01-api",
      "target": "n01-intake",
      "label": "Validate submission",
      "name": "Validate submission",
      "kind": "request",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Forward validated claims and POST input. The handler must still check token_use, client allowlist and current tenant/project/conversation permission.\n\nSource: p2c70, p3c31.",
      "sourceRefs": [
        "p2c70",
        "p3c31"
      ]
    },
    {
      "id": "C04-get",
      "from": "n01-api",
      "to": "n01-history",
      "source": "n01-api",
      "target": "n01-history",
      "label": "Read authorised history",
      "name": "Read authorised history",
      "kind": "request",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Forward the protected GET request. Current membership and tenant/project/conversation access must be rechecked.\n\nSource: p2c71, p3c70.",
      "sourceRefs": [
        "p2c71",
        "p3c70"
      ]
    },
    {
      "id": "C05-commit",
      "from": "n01-intake",
      "to": "n01-store",
      "source": "n01-intake",
      "target": "n01-store",
      "label": "Commit request atomically",
      "name": "Commit request atomically",
      "kind": "data",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "One conditional transaction contains the permission condition, message, idempotency receipt and outbox. No acceptance is returned if the write fails. Same key and hash return the original receipt; changed hash returns 409.\n\nSource: p2c72, p3c34, p3c83.",
      "sourceRefs": [
        "p2c72",
        "p3c34",
        "p3c83"
      ]
    },
    {
      "id": "C05-receipt",
      "from": "n01-store",
      "to": "n01-intake",
      "source": "n01-store",
      "target": "n01-intake",
      "label": "Confirm durable commit",
      "name": "Confirm durable commit",
      "kind": "response",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Return successful commit and original persisted receipt. This establishes durable Node 01 intake, not downstream completion.\n\nSource: p3c37.",
      "sourceRefs": [
        "p3c37"
      ]
    },
    {
      "id": "C04-accepted",
      "from": "n01-intake",
      "to": "n01-api",
      "source": "n01-intake",
      "target": "n01-api",
      "label": "Return intake receipt",
      "name": "Return intake receipt",
      "kind": "response",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Return accepted, messageId and pending-handoff state only after successful commit. A lost response must be recovered using the same idempotency key and request hash.\n\nSource: p3c40.",
      "sourceRefs": [
        "p3c40"
      ]
    },
    {
      "id": "C03-accepted",
      "from": "n01-api",
      "to": "n01-browser",
      "source": "n01-api",
      "target": "n01-browser",
      "label": "Show receipt or status",
      "name": "Show receipt or status",
      "kind": "response",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "HTTP 202 confirms durable intake after commit. Later authorised history/status reports persisted evidence. Neither response infers completed downstream work.\n\nSource: p3c43, p3c82.",
      "sourceRefs": [
        "p3c43",
        "p3c82"
      ]
    },
    {
      "id": "C05-read",
      "from": "n01-history",
      "to": "n01-store",
      "source": "n01-history",
      "target": "n01-store",
      "label": "Query permitted records",
      "name": "Query permitted records",
      "kind": "data",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Recheck current permission and perform a tenant-scoped, indexed, paginated history/status query. Deny revoked membership and guessed cross-tenant references.\n\nSource: p2c73, p3c73.",
      "sourceRefs": [
        "p2c73",
        "p3c73"
      ]
    },
    {
      "id": "C05-results",
      "from": "n01-store",
      "to": "n01-history",
      "source": "n01-store",
      "target": "n01-history",
      "label": "Return scoped records",
      "name": "Return scoped records",
      "kind": "response",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Return only authorised records and durable receipt/handoff state. Queue acknowledgement is distinct from downstream acceptance.\n\nSource: p3c76.",
      "sourceRefs": [
        "p3c76"
      ]
    },
    {
      "id": "C04-results",
      "from": "n01-history",
      "to": "n01-api",
      "source": "n01-history",
      "target": "n01-api",
      "label": "Return persisted status",
      "name": "Return persisted status",
      "kind": "response",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Return authorised history and status based on durable evidence, never on assumed completion.\n\nSource: p3c79.",
      "sourceRefs": [
        "p3c79"
      ]
    },
    {
      "id": "C06-change",
      "from": "n01-store",
      "to": "n01-streams",
      "source": "n01-store",
      "target": "n01-streams",
      "label": "Publish committed change",
      "name": "Publish committed change",
      "kind": "async",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Committed outbox records enter the stream. The persistent outbox remains the recovery source if the stream retention window is exceeded.\n\nSource: p2c74, p3c46.",
      "sourceRefs": [
        "p2c74",
        "p3c46"
      ]
    },
    {
      "id": "C06-trigger",
      "from": "n01-streams",
      "to": "n01-relay",
      "source": "n01-streams",
      "target": "n01-relay",
      "label": "Trigger delivery relay",
      "name": "Trigger delivery relay",
      "kind": "async",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Filter outbox changes and invoke the relay. The supplied source records 24-hour stream retention; scheduled due-index recovery covers a longer outage.\n\nSource: p2c75, p2c41.",
      "sourceRefs": [
        "p2c75",
        "p2c41"
      ]
    },
    {
      "id": "C06-lease",
      "from": "n01-relay",
      "to": "n01-store",
      "source": "n01-relay",
      "target": "n01-store",
      "label": "Lease and record handoff",
      "name": "Lease and record handoff",
      "kind": "control",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Conditionally claim an expiring lease and record handoff state. After SQS ACK, retain the outbox obligation as QUEUE_ACKED until downstream durable acceptance. The queue send and this state update are not atomic.\n\nSource: p2c45, p2c65, p3c46, p3c52.",
      "sourceRefs": [
        "p2c45",
        "p2c65",
        "p3c46",
        "p3c52"
      ]
    },
    {
      "id": "C07-send",
      "from": "n01-relay",
      "to": "n01-queue",
      "source": "n01-relay",
      "target": "n01-queue",
      "label": "Send stable reference",
      "name": "Send stable reference",
      "kind": "async",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "SendMessage carries stable eventId and reference IDs. If send succeeds before a relay crash, retry can produce a duplicate; downstream deduplication is required.\n\nSource: p2c76, p3c49, p3c83.",
      "sourceRefs": [
        "p2c76",
        "p3c49",
        "p3c83"
      ]
    },
    {
      "id": "C07-ack",
      "from": "n01-queue",
      "to": "n01-relay",
      "source": "n01-queue",
      "target": "n01-relay",
      "label": "Acknowledge queue receipt",
      "name": "Acknowledge queue receipt",
      "kind": "response",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "SQS ACK confirms the queue accepted the event. It does not prove Node 02 has durably accepted work, so the obligation remains outstanding.\n\nSource: p3c52.",
      "sourceRefs": [
        "p3c52"
      ]
    },
    {
      "id": "C08",
      "from": "n01-queue",
      "to": "n01-node02",
      "source": "n01-queue",
      "target": "n01-node02",
      "label": "Poll and deliver batch",
      "name": "Poll and deliver batch",
      "kind": "async",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "A proposed Node 02 Lambda event-source mapping polls SQS and delivers at-least-once, potentially out-of-order batches. The consumer must validate references, deduplicate eventId and honour durable acceptance before successful record deletion.\n\nSource: p2c77, p3c55, p3c58, p3c64.",
      "sourceRefs": [
        "p2c77",
        "p3c55",
        "p3c58",
        "p3c64"
      ]
    },
    {
      "id": "C09",
      "from": "n01-queue",
      "to": "n01-dlq",
      "source": "n01-queue",
      "target": "n01-dlq",
      "label": "Isolate repeated failure",
      "name": "Isolate repeated failure",
      "kind": "failure",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "The configured redrive policy sends bounded failures to the DLQ. Operator review and reconciliation precede controlled replay.\n\nSource: p2c78, p2c64.",
      "sourceRefs": [
        "p2c78",
        "p2c64"
      ]
    },
    {
      "id": "C10",
      "from": "n01-scheduler",
      "to": "n01-reconcile",
      "source": "n01-scheduler",
      "target": "n01-reconcile",
      "label": "Wake recovery every 5 min",
      "name": "Wake recovery every 5 min",
      "kind": "control",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Five-minute asynchronous invocation. Scheduler delivery retries and Lambda handler-failure controls are separately configured and tested.\n\nSource: p2c79, p2c49, p2c65.",
      "sourceRefs": [
        "p2c79",
        "p2c49",
        "p2c65"
      ]
    },
    {
      "id": "C11",
      "from": "n01-reconcile",
      "to": "n01-store",
      "source": "n01-reconcile",
      "target": "n01-store",
      "label": "Find and lease due work",
      "name": "Find and lease due work",
      "kind": "data",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Query and paginate the due index, check durable state, acquire a conditional lease, update the next retry or NEEDS_REVIEW state. No full-table scan or infinite retry loop is implied.\n\nSource: p2c80, p2c53, p2c65.",
      "sourceRefs": [
        "p2c80",
        "p2c53",
        "p2c65"
      ]
    },
    {
      "id": "C07-recovery",
      "from": "n01-reconcile",
      "to": "n01-queue",
      "source": "n01-reconcile",
      "target": "n01-queue",
      "label": "Retry bounded delivery",
      "name": "Retry bounded delivery",
      "kind": "async",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "Send the same stable eventId and references after reconciliation. Cap retries; stale acceptance, expiry and DLQ states can require operator review instead of automatic replay.\n\nSource: p2c81, p2c65, p3c83.",
      "sourceRefs": [
        "p2c81",
        "p2c65",
        "p3c83"
      ]
    },
    {
      "id": "C12",
      "from": "n01-node02",
      "to": "n01-store",
      "source": "n01-node02",
      "target": "n01-store",
      "label": "Confirm durable acceptance",
      "name": "Confirm durable acceptance",
      "kind": "receipt",
      "status": "Proposed Node 01 interface; AWS tests NOT RUN",
      "details": "The agreed service-authenticated receipt interface validates the exact tenant/reference/event with a separate bounded role and persists DOWNSTREAM_ACCEPTED. This is a logical receipt-to-state relation, not a specified public direct DynamoDB endpoint. Node 02 is an unbuilt boundary.\n\nSource: p2c82, p2c83, p3c61.",
      "sourceRefs": [
        "p2c82",
        "p2c83",
        "p3c61"
      ]
    }
  ],
  "modules": {},
  "presentation": {
    "kicker": "NODE 01 · CUSTOMER REQUIREMENT INTAKE",
    "title": "Understand how a customer requirement is accepted safely",
    "summary": "A customer submits a requirement, receives a durable intake receipt and can follow a recoverable handoff to the next-stage boundary.",
    "story": "Sign in, validate, save once, deliver with recovery and read the real status.",
    "journey": [
      "n01-browser",
      "n01-amplify",
      "n01-cognito",
      "n01-api",
      "n01-intake",
      "n01-history",
      "n01-store",
      "n01-streams",
      "n01-relay",
      "n01-scheduler",
      "n01-reconcile",
      "n01-queue",
      "n01-dlq",
      "n01-node02"
    ],
    "journeyEdges": [
      "C01",
      "C02",
      "C02-token",
      "C03",
      "C03-keys",
      "C04-post",
      "C04-get",
      "C05-commit",
      "C05-receipt",
      "C04-accepted",
      "C03-accepted",
      "C05-read",
      "C05-results",
      "C04-results",
      "C06-change",
      "C06-trigger",
      "C06-lease",
      "C07-send",
      "C07-ack",
      "C08",
      "C09",
      "C10",
      "C11",
      "C07-recovery",
      "C12"
    ],
    "disclosure": "Proposed 100 UK-user pilot in Europe (London), based on the supplied Node 01 AWS v7.1 design. AWS implementation is unknown; AWS tests are NOT RUN. Node 02 is an interface boundary only.",
    "output": "A durably accepted customer requirement, its original receipt and an explicit pending, queued, downstream-accepted or needs-review handoff state.",
    "stages": [
      {
        "title": "Open and sign in",
        "nodes": [
          "n01-browser",
          "n01-amplify",
          "n01-cognito",
          "n01-api"
        ]
      },
      {
        "title": "Accept the requirement safely",
        "nodes": [
          "n01-intake",
          "n01-store"
        ]
      },
      {
        "title": "Deliver without pretending a queue ACK is completion",
        "nodes": [
          "n01-streams",
          "n01-relay",
          "n01-queue",
          "n01-node02"
        ]
      },
      {
        "title": "Recover or request human review",
        "nodes": [
          "n01-scheduler",
          "n01-reconcile",
          "n01-store",
          "n01-dlq"
        ]
      },
      {
        "title": "Show truthful status",
        "nodes": [
          "n01-browser",
          "n01-api",
          "n01-history",
          "n01-store"
        ]
      }
    ]
  },
  "overview": {
    "title": "From a customer requirement to a durable intake receipt",
    "summary": "Node 01 accepts a customer requirement safely, protects tenant and project access, preserves its receipt and recovers unfinished delivery to the next-stage interface.",
    "current": "This workspace visualises the supplied five-sheet design and its evidence plan. The source records offline artifact checks only. AWS deployment and implementation are unknown, and AWS tests have NOT RUN. Node 02 and downstream workflow execution are outside the implemented scope of the supplied package.",
    "approach": "Study the same Node 01 data in four views: a customer-friendly 3D model, a provider-neutral concept flow, architectural depth analysis and the proposed AWS deployment. Stable study numbers refer to responsibilities; arrows include separate request, response, identity, recovery and durable-receipt relationships.",
    "workflow": [
      {
        "title": "1. Open and sign in",
        "detail": "The customer opens the static application and signs in using PKCE. The API validates the scoped access token; application handlers separately check current permission.",
        "nodes": [
          "n01-browser",
          "n01-amplify",
          "n01-cognito",
          "n01-api"
        ]
      },
      {
        "title": "2. Accept the requirement safely",
        "detail": "The intake handler validates tenant, project and conversation access. One transaction stores the message, original receipt and outbox. Only then does the customer receive HTTP 202 with handoff pending.",
        "nodes": [
          "n01-intake",
          "n01-store"
        ]
      },
      {
        "title": "3. Deliver without pretending a queue ACK is completion",
        "detail": "The stream relay claims a lease and sends a stable reference event to SQS. QUEUE_ACKED remains outstanding. The proposed Node 02 boundary must deduplicate and issue a durable authenticated receipt.",
        "nodes": [
          "n01-streams",
          "n01-relay",
          "n01-queue",
          "n01-node02"
        ]
      },
      {
        "title": "4. Recover or request human review",
        "detail": "Every five minutes the proposed scheduler invokes recovery. Due-index reconciliation and expiring leases recover missed or uncertain sends within limits. Repeated or stale failures need review; no infinite DLQ replay is included.",
        "nodes": [
          "n01-scheduler",
          "n01-reconcile",
          "n01-store",
          "n01-dlq"
        ]
      },
      {
        "title": "5. Show truthful status",
        "detail": "A separately authorised history handler reads tenant-scoped records and persisted handoff states. Accepted intake, queued delivery and downstream durable acceptance are different outcomes.",
        "nodes": [
          "n01-browser",
          "n01-api",
          "n01-history",
          "n01-store"
        ]
      }
    ],
    "operational": [
      {
        "title": "Keep acceptance precise",
        "detail": "Atomic commit establishes durable intake. Queue ACK leaves an outstanding obligation. Only an authenticated downstream durable receipt establishes downstream acceptance."
      },
      {
        "title": "Recover without hiding duplicates",
        "detail": "At-least-once delivery, relay crashes and retry races require stable eventId, leases, idempotency and bounded reconciliation. Retain the outbox beyond the stream window."
      },
      {
        "title": "Keep access current",
        "detail": "Validate scoped tokens, derive tenant context on the server, check active membership and project/conversation permissions, and apply scoped reads and least-privilege service roles."
      },
      {
        "title": "Measure the pilot before claiming scale",
        "detail": "The 100 UK-user pilot and p95/throughput figures are design targets. Cold-start, load, cost, alarm, restore and security tests remain NOT RUN."
      }
    ],
    "failures": [
      "FAILURE A: response lost after commit -> retry same key/hash, return original receipt. Changed hash -> 409.",
      "FAILURE B: relay unavailable >24h -> persistent outbox + due-index reconciliation recovers; lease expiry permits retry.",
      "FAILURE C: send succeeded then relay crashed -> duplicate possible; Node 02 deduplicates eventId before durable work.",
      "FAILURE D: queue expiry / DLQ / stale receipt -> outstanding acceptance becomes NEEDS_REVIEW; controlled replay only.",
      "FAILURE E: write fails -> no acceptance; invalid identity/tenant/project -> deny without writes."
    ],
    "aws": "Proposed single-Region serverless baseline: Amplify static hosting and global CDN; London Cognito, HTTP API and Lambda; DynamoDB transaction/outbox and Streams; scheduled recovery; SQS with a DLQ; an unbuilt Node 02 durable-acceptance interface. No VPC, subnets, model inference or full Agentic Core workflow is implied.",
    "boundaries": [
      "Node 02 is an interface boundary only.",
      "No downstream model execution or workflow is implemented in this package.",
      "No VPC or subnets are part of this baseline.",
      "The source records offline artifact checks only, not deployed AWS behavior.",
      "E09 has rates researched; billing tests are not run. This website does not reverify those prices.",
      "E11 source preservation remains PARTIAL because original v5 and the eight-layer specification were unavailable."
    ]
  },
  "evidence": {
    "scope": "Evidence scope: XML/native rendering/visual checks apply to the delivered files only.\nThey do not demonstrate authentication, tenant isolation, delivery, performance or AWS deployment.\nE11 source preservation remains PARTIAL because original v5 and eight-layer specification were unavailable.",
    "canonicalVersion": "Node 01 AWS v7.1",
    "canonicalNodeCount": 14,
    "canonicalEdgeCount": 25,
    "sourceFile": "Agentic-Core-Node-01-AWS-v7.1-Official-Icons.drawio",
    "sha256": "e7baad98e146822a6692b022097306d621225904c8346680d2af93ec7e0996d0",
    "awsSources": [
      {
        "title": "AWS Amplify Hosting",
        "url": "https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html"
      },
      {
        "title": "Amazon Cognito",
        "url": "https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html"
      },
      {
        "title": "Amazon API Gateway HTTP API",
        "url": "https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html"
      },
      {
        "title": "AWS Lambda",
        "url": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
      },
      {
        "title": "Amazon DynamoDB",
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html"
      },
      {
        "title": "DynamoDB Streams",
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html"
      },
      {
        "title": "Amazon EventBridge Scheduler",
        "url": "https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html"
      },
      {
        "title": "Amazon SQS Standard",
        "url": "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html"
      },
      {
        "title": "AWS Identity and Access Management",
        "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
      },
      {
        "title": "Amazon CloudWatch",
        "url": "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html"
      },
      {
        "title": "AWS CloudTrail",
        "url": "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html"
      }
    ]
  }
};
})();
