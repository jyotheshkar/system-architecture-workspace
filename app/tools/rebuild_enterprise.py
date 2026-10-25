import json,pathlib,base64,html,textwrap,xml.etree.ElementTree as ET,heapq,hashlib
R=pathlib.Path(__file__).parent; O=R.parent/'dist/aws'
B=json.loads((R/'blueprint-revision.json').read_text()); D=json.loads((O/'architecture-data.json').read_text())
N={n['id']:n for n in B['nodes']}; S=D['services']; G=[]; C=[]
S['verify']=['fargate','ECS Fargate verification tests','Independent exact evidence; Core commits acceptance']
S['final']=['fargate','ECS Fargate system + PIC tests','Exact final test attestation; managed helper outside VPC']
def group(id,title,x,y,w,h,parent=None,kind='logical',module='core',note=''):
 G.append(dict(id=id,title=title,x=x,y=y,w=w,h=h,parent=parent,kind=kind,module=module,note=note))
def card(id,x,y,parent,w=335,h=180,replica=False):
 icon,svc,note=S[id]; n=N[id]
 C.append(dict(id=id+('-replica' if replica else ''),ac=id,title=n['short'],x=x,y=y,w=w,h=h,parent=parent,module=n['module'],icon=icon,service=svc,note=note,replica=replica))
def infra(id,title,icon,svc,note,x,y,parent,w=335,h=180,study=''):
 C.append(dict(id=id,title=title,x=x,y=y,w=w,h=h,parent=parent,module='core',icon=icon,service=svc,note=note,study=study,ac=None))
group('org','AWS enterprise organization · existing landing zone',370,160,4530,3220,kind='organization',note='One environment shown. Repeat isolated stacks for dev, preproduction and production; SCPs limit maximum permissions.')
group('control-account','Engineering Control account · authority owner',400,230,2480,2670,'org','account')
group('control-region','Selected authoritative AWS Region',425,295,2430,2580,'control-account','region',note='Managed services below are regional service resources, outside customer VPCs. Region/model/residency approval remains required.')
group('trusted-plane','Trusted engineering services + reasoning boundary',450,370,2380,690,'control-region',note='Solid inner cards are AC responsibilities; smaller service boxes identify AWS implementation. Models propose; deterministic guards admit.')
infra('entry','Authenticated intake','api','API Gateway REST · Cognito · WAF','JWT identity + custom business approval checks',475,460,'trusted-plane',study='Regional API stage uses WAF and Cognito authorisation. Intake Lambda independently validates tenant, stakeholder scope and exact contract revision. Separate worker ingress uses IAM/SigV4; it never trusts human JWT claims as state authority.')
for id,x in [('contract',930),('core',1385),('pic',1840),('cap',2295)]:card(id,x,460,'trusted-plane')
for id,x in [('plan',475),('release',2295)]:card(id,x,790,'trusted-plane')
infra('ledger','Authoritative run ledger','ddb','Amazon DynamoDB · guarded transactions','Only Core/controller writes accepted state',930,790,'trusted-plane',study='Partition by tenant/run; conditional revisions and transactions guard approval, owner acceptance, task attempts, reservations and release intent. Use current/strongly consistent reads where decisions need them; atomically recheck at commit. S3, DynamoDB and external systems share no distributed transaction. Commit ledger + outbox after exact artifact verification; reconcile delivery.')
infra('artifacts','Exact artifacts & evidence','s3','Amazon S3 · versions · SSE-KMS','VersionId + SHA-256 + signed manifests',1385,790,'trusted-plane',study='Separate candidate, assurance, immutable pattern and released-package namespaces. Builder writes candidates; independent verifier reads exact candidates and writes evidence; release can publish only admitted versions. KMS key and bucket policies explicitly grant cross-account access. Optional Object Lock applies retention to exact object versions; it cannot validate correctness.')
infra('broker','Validated completion broker','lambda','API Gateway IAM · Lambda · DynamoDB','Control-account principal resumes workflow',1840,790,'trusted-plane',study='Cross-account jobs submit signed completion envelopes carrying run/task/attempt/epoch and object versions/digests to a narrow Control API. The broker verifies the admitted attempt and current authority, records validated completion/provenance idempotently, and only then uses a protected task token. Step Functions callback tokens require a principal in the same account as the state machine. Token arrival is transport completion, never owner acceptance; Core still requires the independent owner, test, PIC and final predicates.')
group('memory','Optional Memory · scoped continuity',450,1120,755,850,'control-region',module='memory',note='Exact records are distinct from fallible contextual recall.')
for id,x,y in [('mem',475,1230),('scope',850,1230),('store',475,1470),('retrieve',850,1470),('checkpoint',475,1710)]:card(id,x,y,'memory',w=330)
group('learning','Optional Controlled Learning · future versions',1240,1120,755,850,'control-region',module='learning',note='Held-out evaluation runs in Assurance; active run pins never change.')
for id,x,y in [('outcomes',1265,1230),('candidate',1640,1230),('promote',1265,1470),('versions',1640,1470),('rollback',1265,1710)]:card(id,x,y,'learning',w=330)
group('recovery','Optional Recovery · shared admission/fencing',2030,1120,800,610,'control-region',module='recovery',note='SQS + DLQ buffer intent; ledger guards aggregate reservations and epochs.')
for id,x,y in [('queue',2055,1230),('leases',2455,1230),('retry',2055,1470),('observe',2455,1470)]:card(id,x,y,'recovery',w=330)
group('domain-specialist','Optional qualified domain reasoning',2030,1770,800,200,'control-region',module='specialists')
card('domain',2055,1800,'domain-specialist',w=730,h=145)
group('tools','Optional Tool & Adapter Governance · mediated effects',450,2040,1550,755,'control-region',module='tools',note='Reviewed capability → current effect admission → Gateway Policy ENFORCE → observed postcondition. No direct equivalent target bypass.')
for id,x,y in [('need',475,2180),('adapters',960,2180),('boundary',1445,2180),('gateway',475,2480),('effect',960,2480)]:card(id,x,y,'tools')
infra('credentials','Approved target credentials','secrets','Secrets Manager · AgentCore Identity','Scoped credentials; never distributed to builders',1445,2480,'tools',study='The governed adapter obtains only a reviewed target credential. Identity authenticates the caller and manages supported credentials; custom AC checks decide permitted resource, purpose, budget and attempt. Gateway Policy must use ENFORCE. Receiver-side idempotency/fencing or reconciliation is still required for external effects.')
group('security-controls','Enforcement applied at each boundary',2030,2040,800,755,'control-region',note='These controls supplement application predicates; they do not implement them automatically.')
infra('roles','Account-wide service identities','iam','AWS IAM (global) · STS · resource policies','Account policy facet; planner ≠ builder ≠ verifier ≠ releaser',2055,2140,'security-controls',w=730,study='IAM is an account-wide/global control facet shown beside regional enforcement, not a service hosted in a subnet or Region. Dedicated roles and trust policies scope each service. Core may assume only qualified dispatch roles; build cannot write authority state or assurance evidence; assurance cannot mutate candidate artifacts. Cross-account access needs both identity/trust and resource/KMS policy review. SCPs and permissions boundaries restrict maximum grants; they do not grant access. Review real IAM evaluation including resource policies and explicit denies.')
infra('models','Approved model access','bedrock','Amazon Bedrock · Guardrails · AgentCore Runtime','Allowlisted models; content controls + quotas',2055,2360,'security-controls',w=730,study='Runtime hosts qualified reasoning code; Bedrock provides inference. Contract, plan, candidate and domain roles can invoke only approved models under data classification and Region constraints. Guardrails filters selected content risks; it is not PIC, IAM, domain correctness or release authority. Runtime session data is not the trusted run ledger. A custom adapter handles exact output artifacts; bounded jobs may alternatively use the optimized Step Functions InvokeHarness integration subject to its 15-minute/text-only/no-stop limitations.')
infra('keys','Encryption & attestation keys','kms','AWS KMS · separate signing/encryption keys','SSE-KMS for objects; SIGN_VERIFY for attestations',2055,2580,'security-controls',w=730,study='Separate encryption keys from asymmetric SIGN_VERIFY attestation keys. Scope key policies and grants by producer/consumer account. TLS protects service transport. Sign exact release manifests; a signature establishes provenance/integrity under key custody, not the business correctness of its content.')
def job_account(id,title,x,y,h):
 group(id,title,x,y,920,h,'org','account')
 group(id+'-region','Same selected authoritative Region',x+20,y+65,880,h-90,id,'region')
 group(id+'-vpc','Customer VPC · job network',x+40,y+140,840,790,id+'-region','vpc',note='No public task IP / broad Internet route. Endpoint policies and mediated egress.')
 for j in range(2):
  group(id+'-az'+str(j),'Availability Zone '+('A' if j==0 else 'B'),x+60+j*405,y+220,375,640,id+'-vpc','az')
  group(id+'-subnet'+str(j),'Private job subnet',x+75+j*405,y+280,345,560,id+'-az'+str(j),'subnet')
job_account('build-account','Construction account · untrusted candidates',2920,230,1320)
card('exec',3010,600,'build-account-subnet0',w=315)
card('integrate',3010,870,'build-account-subnet0',w=315)
card('construct',3415,600,'build-account-subnet1',w=315)
infra('build-capacity','AZ-independent scheduling','fargate','ECS Fargate · qualified task definitions','Each job role can run in either eligible subnet',3415,870,'build-account-subnet1',w=315,study='Positions show example placement, not fixed role-to-AZ affinity. ECS RunTask placement accepts qualified subnets in both AZs. Independent finite task definitions implement executor, integrator and specialist construction. Bounded deadlines, per-job roles, no broad egress and ECR digest pins are required. Fargate isolation is not a claim that arbitrary hostile generated code is safely sandboxed.')
infra('build-endpoints','Private service endpoint paths','vpc','S3 gateway; ECR API/DKR, logs and Control API interfaces','Endpoint and resource policies narrow access',2980,1080,'build-account-vpc',w=780,h=70,study='S3 gateway endpoint policy scopes admitted object access. ECR API and Docker registry interface endpoints plus S3 layers enable qualified image pull; CloudWatch Logs uses its supported interface endpoint. Use a private IAM-authenticated Control API with an execute-api endpoint where appropriate. Confirm service/Region support, private DNS, TLS and security-group ingress for each required endpoint. No public NAT route is implied.')
infra('build-images','Qualified build images','ecr','Amazon ECR · immutable image digests','Pipeline tests images before registry admission',2980,1220,'build-account-region',w=780,study='ECR stores reviewed container images. Pipeline validation binds scan/test evidence to a digest, task definition and capability schema. Workers cannot promote their own images. Private image pull needs the supported ECR endpoints and S3 layer access; logs need their own endpoint path.')
job_account('assurance-account','Independent Assurance account · evidence only',3880,230,1670)
for id,x,y,parent in [('verify',3970,600,'assurance-account-subnet0'),('final',3970,870,'assurance-account-subnet0'),('assure',4375,600,'assurance-account-subnet1'),('evaluate',4375,870,'assurance-account-subnet1')]:card(id,x,y,parent,w=315)
infra('assurance-endpoints','Independent endpoint policies','vpc','S3 gateway; ECR API/DKR, logs and Control API interfaces','Candidate read-only; assurance prefix write only',3940,1080,'assurance-account-vpc',w=780,h=70,study='Assurance uses separate endpoint security groups and policies. It reads only exact admitted candidate inputs and writes its own evidence namespace. Cross-account S3/KMS grants are explicit. Private callback ingress returns through the narrow Control API; neither evidence upload nor a valid task token confers owner acceptance.')
infra('owner-attestation','Accountable owner decision ingress','api','Control API · independent owner scope','I066 decision is independent of worker result',1840,990,'trusted-plane',w=790,h=65,study='One accountable owner per work unit independently attests acceptance through the Control account API hosted in Control. Evidence generation and owner acceptance are separate. Verification completion does not imply acceptance. Core checks owner identity, approved test obligations, exact artifact digest and current dependencies before recording AcceptedCurrent.')
infra('assurance-gates','Managed verification / final helpers','lambda','AWS Lambda · exact attestation manifests','Managed service outside VPC; Core independently gates acceptance',3940,1230,'assurance-account-region',w=780,study='Lambda validates structured verifier/final results and PIC evidence outside customer VPCs, then submits exact digest-bound attestation manifests to the Control broker. Lambda runs in AWS-managed infrastructure; a customer VPC attachment creates networking ENIs, not an in-subnet function host. Fargate subnet cards represent test runners only. Helpers cannot write current acceptance/release state; Core separately checks independent owner, tests, dependencies, PIC and current approval.')
infra('assurance-capacity','Qualified independent tests','ecr','Amazon ECR · separate roles/workspaces','Read exact candidates; write assurance prefix only',3940,1470,'assurance-account-region',w=780,study='Verifier, final validation, assurance specialist and controlled-learning evaluation use separate task definitions and evidence namespaces; they may be scheduled in either eligible AZ subnet. They cannot alter candidates, business approval, release records or active configuration pins. Security independence depends on actual policies, test trust and administrator separation, not account boxes alone.')
group('target-account','Workflow consumer / target account · separate operating authority',2920,1980,1880,810,'org','account',note='AC releases an attested package. Deployment and execution require explicit target approval, credentials and inherited guards.')
group('target-region','Target Region · residency and service compatibility verified',2940,2055,1840,700,'target-account','region')
card('workflow',2980,2190,'target-region',w=430,h=200)
group('target-runtime','Qualified generated workflow deployment',3450,2150,1290,550,'target-region',note='Compute is selected by the approved WorkflowSpec; these are supported choices, not services every workflow must use.')
infra('target-compute','Contract-selected runtime','sfn','Step Functions / Lambda / ECS Fargate','Single or multiple workers; inherited owner/guard/test controls',3480,2280,'target-runtime',w=575,study='The released WorkflowSpec declares the required runtime, dependencies, roles, accepted image/model/pattern pins and evidence controls. A separately authorised target deployment role validates the package and installs its controls. Deployment cannot inherit unlimited engineering-system authority. The generated workflow must enforce its own equivalent pattern guard/test/evidence bindings.')
infra('target-effects','Governed target adapters','agentcore','Governed adapters · approved APIs / MCP','Target-side permissions + observable effect acceptance',4100,2280,'target-runtime',w=600,study='This box is the target-owned adapter boundary, not the external SaaS/on-prem system. External enterprise APIs and domain data remain separate trust boundaries outside the AWS organization. Target execution calls only approved adapters under target authority. Reconcile uncertain effects; no blind non-idempotent retry. Data access, residency and postconditions depend on the selected business use case and cannot be inferred from the reference diagram.')
infra('external-systems','External enterprise systems','api','Approved SaaS / on-prem APIs','Independent target identity, data and effect boundary',20,2460,None,w=310,h=210,study='These systems are outside the AWS enterprise organization. Only approved engineering or workflow adapters may invoke allowed resources under separately granted target credentials. The domain contract defines idempotency, reconciliation, data residency and observable success. Timeout is not proof that an effect failed.')
group('foundation','Foundation accounts · logical landing-zone group',400,2940,4400,390,'org',note='Separate physical accounts below. Organizational controls and platform lifecycle support AC; they add no logical blueprint capabilities.')
group('archive-account','Log Archive account',420,3020,1030,285,'foundation','account')
group('security-account','Security / Operations account',1470,3020,1030,285,'foundation','account')
group('platform-account','Platform engineering account',2520,3020,2260,285,'foundation','account')
infra('audit','Central security audit','trail','CloudTrail · encrypted S3 archive','Selected management/data events; separate from acceptance',430,3030,'foundation',w=1000,h=130,study='Organization trail and selected data events record relevant API activity into a separate protected archive. CloudWatch/AgentCore operational traces use correlation IDs with sensitive content redaction and retention. Neither log stream automatically supplies domain test acceptance. Baseline audit/metrics exist even when optional Recovery is off; observe adds recovery/capacity analysis.')
infra('telemetry','Operations & incident response','cw','CloudWatch · AgentCore Observability · OTEL','Trace run/task/attempt; alarm on blockers and failed release',1480,3030,'foundation',w=1000,h=130,study='Monitor admission latency, pending approvals, model/tool latency, throttles, candidate rejection, uncertain effects, expired attempts, DLQ age and release receipt lag. Define alarm owners, incident runbooks and measured SLOs per use case. Collect only approved model/tool trace content; segregate audit, operational telemetry and exact acceptance evidence.')
infra('delivery','Platform lifecycle / IaC','ecr','Reviewed IaC · CI/CD · dev → preprod → prod','Approved artifacts, policies and conformance tests',2530,3030,'foundation',w=1000,h=130,study='Deploy isolated copies of this topology per environment. Version state-machine definitions, Lambda code, task definitions, image digests, policy and pattern manifests. Run negative/fault tests and smoke tests in preproduction before authorised production promotion. Platform deployment is distinct from releasing a generated MOA Workflow. Choose the organization’s established pipeline; avoid an unnecessary parallel tooling stack.')
infra('readiness','Availability & recovery admission','vpc','Region + quotas + endpoints + recovery tests','One authoritative Region; no invented RTO/RPO',3580,3030,'foundation',w=1180,h=130,study='Select the authoritative Region from service/model availability, residency and enterprise policy. Measure throughput and per-service concurrency against quotas. AZ placement and managed service durability do not establish an end-to-end SLO. A regional outage stops new authority decisions; documented backup/restore requires reconciliation, current pins and operator approval. Propose a second Region only after RTO/RPO and recovery consistency are justified.')
card('user',20,460,None,w=310)
for c in C:
 if c['id'] in ['audit','telemetry','delivery','readiness']:
  c['parent']={'audit':'archive-account','telemetry':'security-account','delivery':'platform-account','readiness':'platform-account'}[c['id']];c['y']=3120;c['h']=160
 if not c.get('ac'):
  parent=next((g for g in G if g['id']==c['parent']),None)
  if parent and parent['module']!='core':c['module']=parent['module']
W,H=4960,3420
# Route exact source interfaces using the previous verified obstacle-avoiding algorithm.
code=(R/'build_aws.py').read_text(); start=code.index('def crosses('); end=code.index('def svg(',start)
exec(code[start:end],globals())
V=dict(id='enterprise',title='Full AWS enterprise deployment architecture',width=W,height=H,nodes=C,edges=[])
byac={c['ac']:c for c in C if c.get('ac') and not c.get('replica')}
links=[]
for e in B['edges']:
 edge={**e,'label':e['id'],'ref':e['id']};edge['points']=points(V,edge);links.append(edge)
V['edges']=links
iconfiles={k:v for k,v in {'lambda':'Arch_AWS-Lambda_64.svg','sfn':'Arch_AWS-Step-Functions_64.svg','agentcore':'Arch_Amazon-Bedrock-AgentCore_64.svg','bedrock':'Arch_Amazon-Bedrock_64.svg','ddb':'Arch_Amazon-DynamoDB_64.svg','s3':'Arch_Amazon-Simple-Storage-Service_64.svg','fargate':'Arch_AWS-Fargate_64.svg','api':'Arch_Amazon-API-Gateway_64.svg','cognito':'Arch_Amazon-Cognito_64.svg','iam':'Arch_AWS-Identity-and-Access-Management_64.svg','kms':'Arch_AWS-Key-Management-Service_64.svg','secrets':'Arch_AWS-Secrets-Manager_64.svg','sqs':'Arch_Amazon-Simple-Queue-Service_64.svg','cw':'Arch_Amazon-CloudWatch_64.svg','trail':'Arch_AWS-CloudTrail_64.svg','ecr':'Arch_Amazon-Elastic-Container-Registry_64.svg','vpc':'Arch_Amazon-Virtual-Private-Cloud_64.svg','config':'Arch_AWS-AppConfig_64.svg','waf':'Arch_AWS-WAF_64.svg'}.items()}
icons={k:'data:image/svg+xml;base64,'+base64.b64encode((O/'icons'/v).read_bytes()).decode() for k,v in iconfiles.items()}
palette={'organization':'#68686f','account':'#ad81ce','region':'#5bbabc','vpc':'#8c7bdd','az':'#56a7aa','subnet':'#67ab80','logical':'#616169'}
moduleColors={'core':'#ae8dea','memory':'#64bdaf','learning':'#d6ac6a','tools':'#729fd3','recovery':'#d7897c','specialists':'#b5a5d5'}
def txt(out,s,x,y,size=16,color='#dedee4',width=80):
 for j,line in enumerate(textwrap.wrap(s,width)):out.append(f'<text x="{x}" y="{y+j*(size+5)}" font-size="{size}" fill="{color}">{html.escape(line)}</text>')
def svg():
 out=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" width="{W}" height="{H}" style="font-family:Arial,sans-serif"><defs><marker id="awsArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1L7 4L1 7" fill="none" stroke="context-stroke"/></marker></defs><rect width="100%" height="100%" fill="#080808"/>']
 txt(out,'AGENTIC CORE · AWS ENTERPRISE SYSTEM DESIGN · REFERENCE DESIGN',25,38,20,'#c3a6e6',180)
 txt(out,'Full 35-capability architecture · physical deployment boundaries and logical subsystems',25,82,32,'#fff',180)
 txt(out,'SOLID: organization/account/Region/VPC/AZ/subnet    DASHED: logical groups    SERVICE BOXES: AWS implementation    ARROWS: AC interfaces; physical transfer uses Control broker + S3',25,120,17,'#b8b8c0',230)
 for g in G:
  c=moduleColors.get(g['module'],palette[g['kind']]) if g['module']!='core' else palette[g['kind']]
  out.append(f'<g class="awsBoundary" data-boundary="{g["id"]}" data-module-layer="{g["module"]}"><rect x="{g["x"]}" y="{g["y"]}" width="{g["w"]}" height="{g["h"]}" fill="none" stroke="{c}" stroke-width="2"'+(' stroke-dasharray="8 6"' if g['kind']=='logical' else '')+'/ >'.replace('/ >','/>'))
  txt(out,g['title'],g['x']+15,g['y']+28,18,c,max(25,int(g['w']/11)))
  if g['note']:txt(out,g['note'],g['x']+15,g['y']+54,13,'#b0b0b9',int((g['w']-30)/7))
  out.append('</g>')
 label_rects=[];dashmap={'CONTROL':'','DATA':'9 3','EVIDENCE':'1 4','AUTHORITY':'','STATE':'5 5','CAPABILITY':'2 6','PATTERN':'13 5','REPAIR':'3 2'}
 def overlap(r,a):return max(r[0],a[0])<min(r[0]+r[2],a[0]+a[2]) and max(r[1],a[1])<min(r[1]+r[3],a[1]+a[3])
 obstacles=[[c['x']-5,c['y']-5,c['w']+10,c['h']+10] for c in C]+[[g['x'],g['y'],g['w'],75] for g in G]
 for e in links:
  ps=' '.join(f'{x},{y}' for x,y in e['points']); dash=f' stroke-dasharray="{dashmap[e["type"]]}"' if dashmap[e['type']] else ''
  out.append(f'<g class="awsConnection" data-ac-edge="{e["id"]}" role="button" tabindex="0" aria-label="{e["id"]}: {html.escape(e["name"])}"><title>{e["id"]} · {html.escape(e["name"])} · {e["type"]}</title><polyline class="awsLine" points="{ps}" fill="none" stroke="#7b7b84" stroke-width="1.5"{dash} marker-end="url(#awsArrow)"/>')
  if e['type']=='AUTHORITY':out.append(f'<polyline class="awsLine awsTwin" points="{ps}" transform="translate(0 3)" fill="none" stroke="#7b7b84" stroke-width=".7"/>')
  segs=sorted(zip(e['points'],e['points'][1:]),key=lambda p:abs(p[1][0]-p[0][0])+abs(p[1][1]-p[0][1]),reverse=True)
  if e['type']=='PATTERN':
   a,b=segs[0];xx=(a[0]+b[0])/2;yy=(a[1]+b[1])/2;out.append(f'<path class="awsPatternDiamond" d="M{xx-6} {yy}L{xx} {yy-6}L{xx+6} {yy}L{xx} {yy+6}Z" fill="#080808" stroke="#7b7b84"/>')
  found=None
  for a,b in segs:
   for fraction in [.5,.33,.67,.2,.8]:
    for offset in [-18,18,-38,38,-58,58,-78,78]:
     x=a[0]+(b[0]-a[0])*fraction+(offset if a[0]==b[0] else 0);y=a[1]+(b[1]-a[1])*fraction+(offset if a[1]==b[1] else 0)
     rect=[x-20,y-9,40,18]
     if x<25 or x>W-25 or y<145 or y>H-25 or any(overlap(rect,r) for r in obstacles+label_rects):continue
     found=(x,y,rect);break
    if found:break
   if found:break
  if found:
   x,y,rect=found;label_rects.append(rect);e['labelBounds']=rect;out.append(f'<g class="awsEdgeLabel"><rect x="{x-20}" y="{y-9}" width="40" height="18" rx="2" fill="#080808"/><text x="{x}" y="{y+4}" text-anchor="middle" font-size="11" fill="#aaaab7">{e["id"]}</text></g>')
  out.append(f'<polyline class="awsHit" points="{ps}" fill="none" stroke="transparent" stroke-width="17"/></g>')
 for c in C:
  x,y,w,h=c['x'],c['y'],c['w'],c['h']; attr=f'data-ac-node="{c["ac"]}"' if c['ac'] else f'data-aws-infra="{c["id"]}"'
  out.append(f'<g class="awsCapability" {attr} data-module-layer="{c["module"]}" role="button" tabindex="0" aria-label="Study {html.escape(c["title"])}"><title>{html.escape(c["title"]+" · "+c["service"])}</title><rect class="awsCardBox" x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#080808" stroke="#75757d" stroke-width="1.6"/>')
  if c['icon']:out.append(f'<image x="{x+13}" y="{y+13}" width="28" height="28" xlink:href="{icons[c["icon"]]}"/>')
  txt(out,c['title'],x+(52 if c['icon'] else 13),y+32,18,'#fff',int((w-60)/10))
  # Small service boxes nest visibly within the exact AC capability.
  sy=y+(66 if h>150 else 56 if h>110 else 40); services=c['service'].split(' · ')
  if len(services)>3:services=[' · '.join(services[:2]),' · '.join(services[2:])]
  sw=(w-26-(len(services)-1)*8)/len(services)
  for i,sv in enumerate(services):
   xx=x+13+i*(sw+8);out.append(f'<rect class="awsServiceBox" x="{xx}" y="{sy}" width="{sw}" height="{50 if h>110 else 22}" rx="2" fill="#121212" stroke="#44444c"/>');txt(out,sv,xx+7,sy+(18 if h>110 else 15),12,'#d2d2dc',max(12,int((sw-14)/6.4)))
  if h>150:txt(out,c['note'],x+13,y+142,13,'#ababba',int((w-26)/7))
  elif h>120:txt(out,c['note'],x+13,y+118,11,'#ababba',int((w-26)/6))
  out.append('</g>')
 out.append('</svg>');return ''.join(out)
render=svg();(O/'enterprise.svg').write_text(render);(O/'main.svg').write_text(render)
topology={**V,'groups':G,'icons':icons,'svg':render,'sourceDigest':hashlib.sha256((R/'blueprint-revision.json').read_bytes()).hexdigest(),'canonicalSourceDigest':hashlib.sha256(json.dumps(B,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'layoutVersion':'enterprise-nested-v2'}
(O/'enterprise-topology.json').write_text(json.dumps(topology,indent=2))
# Make genuinely editable parent-child containers, not decorative boundary rectangles.
old=ET.parse(O/'Agentic-Core-AWS-Architecture.drawio').getroot()
for d in list(old):
 if d.get('id') in ['main','enterprise','security']:old.remove(d)
 elif d.get('id') not in ['main','enterprise','security']:
  if not d.get('name','').startswith('Logical · '):d.set('name','Logical · '+d.get('name',''))
  status=d.find('.//mxCell[@id="status"]')
  if status is not None:status.set('value','LOGICAL SUBSYSTEM STUDY · see enterprise page for physical deployment')
page=ET.Element('diagram',id='enterprise',name='Full nested enterprise architecture');old.insert(0,page)
model=ET.SubElement(page,'mxGraphModel',grid='1',gridSize='10',page='1',pageWidth=str(W),pageHeight=str(H),background='#080808');root=ET.SubElement(model,'root');ET.SubElement(root,'mxCell',id='0');ET.SubElement(root,'mxCell',id='1',parent='0')
allg={g['id']:g for g in G};allc={c['id']:c for c in C}
def cell(id,value,x,y,w,h,parent='1',style=''):
 p=allg.get(parent,allc.get(parent,{'x':0,'y':0}));v=ET.SubElement(root,'mxCell',id=id,value=value,vertex='1',parent=parent,style=style);ET.SubElement(v,'mxGeometry',x=str(x-p['x']),y=str(y-p['y']),width=str(w),height=str(h),**{'as':'geometry'});return v
cell('architecture-title','AGENTIC CORE · AWS ENTERPRISE SYSTEM DESIGN · REFERENCE DESIGN',25,22,4000,60,style='text;html=0;fontSize=28;fontColor=#ffffff;align=left;')
for g in G:
 cell(g['id'],g['title']+'\n'+g['note'],g['x'],g['y'],g['w'],g['h'],g['parent'] or '1','container=1;recursiveResize=0;collapsible=0;fillColor=none;strokeColor='+palette[g['kind']]+';'+('dashed=1;' if g['kind']=='logical' else '')+'fontColor=#bdbdc8;fontSize=16;align=left;verticalAlign=top;spacing=14;whiteSpace=wrap;')
for c in C:
 cell(c['id'],'',c['x'],c['y'],c['w'],c['h'],c['parent'] or '1','container=1;rounded=1;arcSize=5;fillColor=#080808;strokeColor=#75757d;')
 if c['icon']:cell(c['id']+'-icon','',c['x']+13,c['y']+13,28,28,c['id'],'shape=image;image='+icons[c['icon']]+';')
 cell(c['id']+'-title',c['title'],c['x']+52,c['y']+10,c['w']-65,43,c['id'],'text;html=0;fontColor=#ffffff;fontSize=18;align=left;whiteSpace=wrap;')
 cell(c['id']+'-services',c['service'],c['x']+13,c['y']+(66 if c['h']>150 else 56 if c['h']>110 else 40),c['w']-26,50 if c['h']>110 else 22,c['id'],'rounded=0;fillColor=#121212;strokeColor=#44444c;fontColor=#d2d2dc;fontSize=12;whiteSpace=wrap;')
 if c['h']>110:
  off=min(125,c['h']-35);cell(c['id']+'-note',c['note'],c['x']+13,c['y']+off,c['w']-26,c['h']-off-8,c['id'],'text;html=0;fontColor=#ababba;fontSize=12;align=left;whiteSpace=wrap;')
for e in links:
 a=byac[e['source']];b=byac[e['target']];ps=e['points'];anchors=f'exitX={(ps[0][0]-a["x"])/a["w"]};exitY={(ps[0][1]-a["y"])/a["h"]};entryX={(ps[-1][0]-b["x"])/b["w"]};entryY={(ps[-1][1]-b["y"])/b["h"]};'
 v=ET.SubElement(root,'mxCell',id=e['id'],value=e['id']+' · '+e['name'],edge='1',source=a['id'],target=b['id'],parent='1',style='edgeStyle=orthogonalEdgeStyle;rounded=0;endArrow=open;strokeColor=#7b7b84;fontColor=#bdbdc8;fontSize=12;labelBackgroundColor=#080808;'+anchors)
 geo=ET.SubElement(v,'mxGeometry',relative='1',**{'as':'geometry'});arr=ET.SubElement(geo,'Array',**{'as':'points'})
 for x,y in ps[1:-1]:ET.SubElement(arr,'mxPoint',x=str(x),y=str(y))
ET.indent(old);(O/'Agentic-Core-AWS-Architecture.drawio').write_bytes(ET.tostring(old,encoding='utf-8',xml_declaration=True))
D['enterprise']=topology;D['blueprint']=B;D['sourceVersion']='13';D['blueprintDigest']=topology['sourceDigest'];D['status']='AWS enterprise system design · reference design · not an AWS deployment'
account={c['ac']:c['parent'] for c in C if c['ac']}
for m in D['mapping']:m['deploymentContainer']=account[m['id']]
for e in D['interfaces']:
 e['awsBoundary']='One authoritative Region; separated Control, Build, Assurance and target accounts. Identity, resource and KMS policies explicitly scope cross-account access. Current versions and authority rechecked at receiver.'
 if any(n in ['exec','verify','integrate','final','construct','assure','evaluate'] for n in [e['source'],e['target']]):e['implementationProtocol']='Control dispatch adapter assumes only approved cross-account job role. Completion envelope uses IAM-authenticated Control API with run/task/attempt/fence and exact S3 versions/digests; same-account broker records validated completion/provenance idempotently then resumes Step Functions. Core independently requires current owner, test, PIC and final predicates for acceptance and release.'
D['views']=[topology]+[{**v,'caption':'Logical subsystem study; arrows show AC interfaces, not direct physical transport. See enterprise view for account/VPC placement.','zones':[{**z,'label':'Logical boundary: '+z['label'],'kind':'logical'} for z in v.get('zones',[])]} for v in D['views'] if v['id'] not in ['main','security','enterprise']]
D.pop('svg',None)
(O/'architecture-data.json').write_text(json.dumps(D,indent=2))
print(json.dumps({'capabilities':len(byac),'interfaces':len(links),'boundaries':len(G),'cards':len(C),'width':W,'height':H,'sourceDigest':topology['sourceDigest']}))
