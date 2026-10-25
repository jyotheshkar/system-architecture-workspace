# Architecture authoring

The Site is static and its runtime is dist/index.html. AWS uses the same parent workspace; aws-shared.js supplies its renderer and study content. blueprint-revision.json and revision-baseline.html preserve the opened source snapshot.

To regenerate, run rebuild_enterprise.py, build_communications.py, build_docs.py, then integrate_enterprise.py in that order. The full Draw.io page is generated with true parent-child containers; communication paths are a distinct second page. Re-render SVGs to PNG after geometry changes using an SVG-capable renderer.

QA scripts exercise the actual bundled parent scripts under linkedom and independently check the source, geometry, nesting and file paths. Install linkedom in tools/qa before running the Node test. Python structural checks use Pillow. These checks are not rendered-browser or AWS deployment tests. Run both QA scripts before package_enterprise.py.

The diagram/UI remains a proposed AWS reference design. Cloud resource IaC and deployed controls are outside this deliverable. Existing site audience and the original Reference/Concept schema and geometry are preserved.

After regenerating architecture files, run `node tools/polish-copy.mjs` before the Worker build to retain the website's reviewed wording. The original source snapshots remain unchanged for historical comparison.
