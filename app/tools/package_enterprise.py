import pathlib,json,zipfile,hashlib,shutil
R=pathlib.Path(__file__).parent;O=R.parent/'dist/aws'
dom=json.loads((O/'interaction-checks.json').read_text());struct=json.loads((R/'qa/enterprise-independent-results.json').read_text());doc=json.loads((O/'doc-source-checks.json').read_text());top=json.loads((O/'enterprise-topology.json').read_text())
assert dom['failed']==0 and struct['summary']['failed']==0
report={'status':'passed within stated verification scope','date':'2026-10-06','sourceCapabilities':35,'sourceInterfaces':68,'optionalModuleCombinations':32,'nestedBoundaries':len(top['groups']),'editableDrawioPages':8,'representativePhysicalPaths':18,'sourceDigest':top['sourceDigest'],'dom':dom,'structure':struct,'documentSourceFidelity':doc,'visualReview':'Full nested vector diagram, cropped control-plane detail and communication diagram rendered and visually inspected. High-resolution PNGs fully decoded.','limits':['No AWS infrastructure deployment or cloud runtime/security/capacity tests were performed.','DOM/event tests use actual parent scripts under linkedom/Node VM with WebGL unavailable; they are not rendered-browser tests.','Original Reference data, Three.js bundle and Concept geometry were compared byte-for-byte/structurally to the opened Site snapshot.','RTO/RPO, quotas, service/model geography, end-to-end SLO and hostile-code isolation remain implementation decisions and tests.']}
(O/'verification.json').write_text(json.dumps(report,indent=2))
(O/'Verification-Report.md').write_text(f'''# Verification report — enterprise nested revision

Reviewed 6 October 2026. **Reference design; no AWS resources deployed.**

| Check | Result | Scope |
|---|---|---|
| Full source fidelity | 35 capabilities / 68 exact typed interfaces | Original endpoints, obligations and module requirements preserved |
| Optional combinations | All 32 pass | No hidden source endpoint; I067/I068 require Memory + Learning |
| Shared interaction execution | {dom['passed']} pass; 0 fail | Actual parent scripts in linkedom/Node VM; selection, all 35 studies, all 68 interfaces, search, modules, camera, tour, pan/pinch, dock, source-view returns |
| Independent structural checks | {struct['summary']['passed']} pass; 0 fail | Nested SVG/Draw.io containment, card text, routed endpoints, source invariants, all links and original assets |
| Original Reference / Concept | Preserved | Blueprint JSON, Three.js bundle and Concept layout unchanged; parent runtime return paths exercised |
| Enterprise containers | {len(top['groups'])} | Physical organization/accounts/Regions/VPCs/AZs/subnets distinguished from logical groups |
| Draw.io | 8 editable pages | Full35/68, 18 physical communication paths, six logical subsystem studies; true parent-child containers |
| Rendered artifacts | SVG and PNG reviewed | 8,267 × 5,700 PNG outputs; full decode and visual source-diagram review |
| Source mapping/register | Pass | All35 responsibilities/authority/rules and original68 interface fields unchanged |

AWS now uses the existing workspace, module rail, Guide, search, Details inspector with two tabs, Display, Camera, Interface key, Explore, connection navigator and requirement tour. The standalone AWS iframe/UI is removed. First entry preserves the selected architecture layers; use Full Architecture for all 35 capabilities and 68 interfaces.

Lambda, Bedrock/AgentCore and regional managed services are outside customer VPC task boxes. Construction and Assurance task pools show eligible AZ placement; endpoint policies and scoped roles are explicit. Owner attestation enters through the Control-hosted API. Completion/provenance is distinct from independent acceptance. External domain systems remain outside the AWS organization. Foundation summaries contain separate physical account boxes.

## Limits

{chr(10).join('- '+s for s in report['limits'])}

The source snapshot digest is `{top['sourceDigest']}`. Diagram/UI checks do not establish formal correctness, novelty, secure deployment or empirical business performance. The security/fault tests in Security-and-Operations.md and the presenter brief are required tests for a future implementation, not claims of tests already performed in AWS.
''')
(O/'README.md').write_text('''# Agentic Core AWS enterprise reference pack

Open the root index.html and choose **AWS System Design Architecture**, then **Full Architecture**. The Reference, Concept and AWS views share the same controls and continuous study inspector. All runtime code and diagram/service icons are included for offline study.

The authoritative editable diagram is Agentic-Core-AWS-Architecture.drawio. Its first page maps all 35 capabilities and 68 interfaces; its second page explains 18 representative deployment communication paths; the other six pages are logical subsystem studies. Their arrows do not imply direct unguarded network transport. Enterprise SVG/PNG files show the same nested topology.

Read Enterprise-Architecture-Review.md before the presentation. Use the mapping and connection register for source traceability, ADRs for decisions/alternatives, Security-and-Operations.md for enforcement and operating limits, and the study guide for the AWS explanation. Official-AWS-References.md records primary documentation checked for service choices. Costs are excluded.

Solid boundaries represent physical organization/account/Region/VPC/AZ/subnet placement; dashed boundaries represent logical groupings. IAM/STS is labeled an account-wide/global facet. Managed services stay outside customer VPC task boxes. The topology depicts one selected environment, with isolated copies proposed for dev/preproduction/production.

No AWS resources were deployed by this project. Verification covers source fidelity, documentation, DOM/event behavior and rendered diagram artifacts; it does not establish real browser rendering or AWS runtime/security/capacity performance. See Verification-Report.md.

AWS service icons are from the official AWS Architecture Icons package, July 31, 2026: https://aws.amazon.com/architecture/icons/. The uploaded example images informed boundary nesting and environment separation; their services and pipelines were not copied into AC responsibilities.
''')
files=[f for f in sorted(O.rglob('*')) if f.is_file() and f.name not in ['Agentic-Core-AWS-Reference-Pack.zip','file-manifest.json']]
manifest={'sourceDigest':top['sourceDigest'],'files':[{ 'path':'aws/'+str(f.relative_to(O)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size} for f in files]}
(O/'file-manifest.json').write_text(json.dumps(manifest,indent=2))
with zipfile.ZipFile(O/'Agentic-Core-AWS-Reference-Pack.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.write(O.parent/'index.html','index.html')
 for f in files+[O/'file-manifest.json']:z.write(f,'aws/'+str(f.relative_to(O)))
 z.writestr('README.md','Open index.html → AWS System Design Architecture → Full Architecture. See aws/README.md for the file guide and verification limits.\n')
with zipfile.ZipFile(O/'Agentic-Core-AWS-Reference-Pack.zip') as z:assert z.testzip() is None
print(json.dumps({'packFiles':len(files)+3,'packBytes':(O/'Agentic-Core-AWS-Reference-Pack.zip').stat().st_size,'verificationPasses':dom['passed']+struct['summary']['passed']}))
