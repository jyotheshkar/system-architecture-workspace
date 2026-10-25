# System Architecture Workspace

Turn a customer idea into an architecture baseline an engineer can review: map component responsibilities, inspect connections, record controls and assumptions, and compare proposed AWS service choices in an interactive 3D workspace.

The current experience supports manual architecture design and reference views. A prompt-to-design assistant is future work.

[Open the live workspace](https://sa-workspace.jyothesh-karnam.chatgpt.site) | [Review the application source](app/README.md) | [View the AWS target diagram and case study](docs/diagrams/README.md)

## What to Inspect

| Area | Evidence |
| --- | --- |
| Website implementation | [Curated Site version 81 source](app/README.md): Worker routing, authentication/session checks, workspace-storage adapter, browser logic and assets |
| Application validation | [Build, authentication and mocked storage receipts](app/docs/verification-receipts.json) |
| AWS architecture | [Diagrams and case study](docs/diagrams/README.md), clearly labelled as a proposed target architecture |
| Foundation design | `workspace/foundation-reference.json`: four Agentic Core components, inherited PIC controls, a bounded example and defined acceptance tests |
| Wider design reference | `workspace/core-reference.json`: interfaces, design decisions and proposed AWS mappings |
| Website design model | `workspace/website-reference.json`: historical source-review descriptions with explicit export provenance |
| Page definitions | `workspace/pages/` contains active descriptions; `workspace/retired-pages/` retains one retired definition as historical context |

## Source and Design Boundaries

The application export is a privacy-sanitized derivative of published Site version 81, original source commit `4f583cb90bff726eada9a180a0eeba4118981a73`. The six design-data files come from the separate source commit `dacd1ad369be24d5d0d8536ee10ed075e61feb23`. Their provenance and validation scopes are recorded independently. The app derivative removes the embedded personal career/contact profile while preserving the project overview route, sign-in and workspace logic; it is not an unchanged copy of the hosted Site. See the [privacy repair receipt](app/docs/privacy-repair.json) for the three source transformations.

The website runs on Cloudflare Workers. Its AWS diagrams describe proposed target architectures; they do not establish an AWS deployment. The exported source does not configure hosting bindings or repository credentials, and the existence of the live website does not prove this exported data copy is connected to its runtime.

Node labels such as implemented or connection required are historical design/source-review descriptions. They are not fresh passing tests. Conditional mathematical arguments are design reasoning; defined acceptance tests are definitions unless an execution receipt states otherwise. The wider reference is not proof that every component exists in the bounded Agentic Core runtime.

## Validate the Design Data

From this folder, using Python 3.11 or later:

```sh
python scripts/validate_design_export.py
```

This dependency-free check parses all six data JSON files, rejects duplicate object keys and non-finite constants, checks graph identifiers/endpoints and page references, screens selected credential/private-source patterns, and verifies recorded file hashes. It does not run the app, evaluate a model or contact a provider.

The [design-data manifest](docs/DESIGN_DATA_MANIFEST.json) covers the data and supporting export documents/scripts. The application and diagram exports have their own manifests and receipts. Read [data provenance](docs/PROVENANCE.md), [source identity](docs/SOURCE_INDEX.json) and the [data validation receipt](docs/VALIDATION_RECEIPT.json).

## Export Scope

The original private Git history, tokens, environment inventories, personal CV/contact/application records and runtime databases are omitted. A public portfolio copy must not become a private operational store.

Official AWS documentation links and retained assets keep their respective rights and notices. Public visibility alone is not a licence grant; no unsupported relicensing or production-readiness claim is introduced.
