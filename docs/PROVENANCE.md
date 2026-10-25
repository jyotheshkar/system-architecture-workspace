# Design Data Provenance

The six JSON records were retrieved from the architecture-data repository owned by Jyothesh Karnam, repository ID `1413161174`, at exact source commit `dacd1ad369be24d5d0d8536ee10ed075e61feb23`. The original repository was private when reviewed. This export does not copy its Git history and does not expose an authenticated source URL.

`SOURCE_INDEX.json` records the exact original Git blob SHA and source byte size for each file. Five data files are unchanged. `workspace/website-reference.json` has narrow editorial changes: original private-repository link/visibility metadata is replaced with historical source identity, the verified public export repository URL and a prepared-for-public-commit status; the GitHub-storage node explains snapshot boundaries instead of claiming this public copy is a configured private store. Original implementation-status labels are explicitly identified as historical declarations. The source README's private configuration instructions are replaced by the export README.

The exact original source identifier is preserved for traceability. The public repository https://github.com/jyotheshkar/system-architecture-workspace (ID 1433091316) has been verified to exist. These data files are marked prepared_for_public_commit: repository creation does not yet establish that this complete data/app export has been committed. No deployment receipt or runtime source connection is inferred.

## Separate Site Identity

A separate Site record identifies published website version 81 at app-source commit `4f583cb90bff726eada9a180a0eeba4118981a73`. This differs from the design-data commit. Application files were retrieved from that original version and reviewed separately. The public app/ export is a curated privacy-sanitized derivative, not an unchanged Site snapshot: its embedded career/contact profile and assertions requiring that payload were replaced with project-only content and privacy checks. Three source transformations and retained original/exported hashes are documented in app/docs/privacy-repair.json and app/docs/source-file-allowlist.json. Dependencies, assets, hosting adapters and tests have their own validation scope. Generated app/dist/server files are local build output and excluded from the publication allowlist. Their functionality must never be inferred from a design JSON document.

## Engineering Interpretation

Foundation derivations are conditional design arguments. Acceptance tests in the data are defined tests, not passing results. Architecture completeness is not runtime correctness. The AWS mappings describe service-selection options and constraints; no AWS infrastructure was provisioned or verified by creating this export.

The wider reference and retired page retain historical design scope. They must not be presented as proof that every component exists in the bounded Agentic Core runtime excerpt.

## Validation Scope

The included validator checks JSON integrity, graph/page relationships, selected text patterns and file integrity. Source Git-blob equality is verified for unchanged data files. SHA-256 hashes bind the exported bytes, including the edited website reference. This is not an exhaustive security audit or proof of execution, source ownership of every linked asset, deployment or external-link availability.
