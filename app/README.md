# System Architecture Workspace — Application Source

Reviewed source recovered from the local Git object database for **published Site version 81**, commit `4f583cb90bff726eada9a180a0eeba4118981a73` (24 October 2026). Sites independently reports that exact source commit for the successful version-81 deployment.

This folder is a curated, privacy-sanitized derivative of that source snapshot. Most allowed source files retain their original bytes; the embedded personal profile, its navigation/title and tests requiring those personal records were edited for this public project-source copy. [Source provenance](docs/source-provenance.json), the [file allowlist](docs/source-file-allowlist.json), and [verification receipts](docs/verification-receipts.json) distinguish recovered files from this added documentation.

## What is here

- `worker/`: Cloudflare Worker request routing, sign-in/session checks, private GitHub workspace-storage adapter, build and test code.
- `dist/assets/`: browser workspace logic, styles, diagrams, icons and retained third-party Three.js files/licence.
- `dist/aws/`: editable diagram, SVG/PNG diagrams, architecture data and study/reference documentation.
- `dist/case-studies/`: current Agentic Core and Workspace AWS target case studies.
- `tools/`: architecture-model builders and checks.

The running website uses Cloudflare Workers. **AWS diagrams describe proposed target architectures and case studies; they do not establish that those AWS systems are deployed.**

## Build and bounded verification

The following passed locally with Node.js 24.14.0, without external API calls, credentials, deployment or model generation:

```sh
node worker/build.mjs
node worker/test.mjs
node worker/test-workspace-store.mjs
```

The build reported 145 embedded resources and two large-image references. After privacy sanitization, authentication/route/privacy checks passed (115); mocked GitHub workspace-storage checks passed (344). These are the scripts' assertion counts, not a browser or production-security certification.

The build generates `dist/server/`. Generated bundles are excluded from the reviewed source allowlist. Rebuild locally rather than treating a generated bundle as the canonical authoring source.

## Export boundaries

Hosting identity/configuration, runtime secrets and storage records, Git history, generated server bundles, the duplicate reference ZIP, the private integration-planning document, and the original hidden personal career/education/contact profile are omitted. Existing routes now present a labelled project overview where that profile previously appeared. Original source files refer to the private backing-repository adapter; a repository name is routing configuration, not a credential or permission grant.

Production sign-in requires separately configured runtime bindings and secret values. The original preview helper also expects the omitted ZIP and a sibling historical checkout, so it is not a standalone preview command for this export. No production configuration, deployment or cloud data has been changed.

All eight included PNGs were visually inspected as architecture diagrams or decorative galaxy images. Third-party notices remain with their source assets. The review covers the exported snapshot, not the entire source history or every external dependency.

Privacy repair details and source-to-export transformations are recorded in [docs/privacy-repair.json](docs/privacy-repair.json). Original source identity is preserved separately from current exported hashes.
