import pathlib,json,re,heapq,copy,xml.etree.ElementTree as E,html,textwrap
R=pathlib.Path(__file__).parent;O=R.parent/'dist/aws';T=json.loads((O/'enterprise-topology.json').read_text());C=T['nodes'];by={n['id']:n for n in C};code=(R/'build_aws.py').read_text();exec(code[code.index('def crosses('):code.index('def svg(')],globals())
paths=[
 ('user','entry','HTTPS + verified JWT','AUTHORITY','Human identity enters; business approval scope still checked server-side.'),
 ('entry','contract','Validated requirement / approval','DATA','Review binds exact contract version/digest; changed text invalidates approval.'),
 ('contract','core','Approved contract / digest','AUTHORITY','Core independently rechecks organisational authority and current revision.'),
 ('plan','models','Allowlisted model inference','CONTROL','Reasoning roles invoke only approved Runtime/Bedrock paths; output remains a proposal.'),
 ('core','ledger','Guarded conditional transaction','STATE','Core alone commits current run-state, acceptance, reservations and release intent.'),
 ('core','broker','Protected token / admitted attempt','AUTHORITY','Protected correlation stays in Control; completion cannot skip business acceptance.'),
 ('core','exec','Assume qualified dispatch role','AUTHORITY','Narrow target-role trust; finite qualified job, exact inputs and bounded task policy.'),
 ('exec','artifacts','Exact candidate upload','DATA','Builder may write only its candidate namespace under explicit S3/KMS policies.'),
 ('verify','artifacts','Exact candidate read / evidence write','EVIDENCE','Assurance cannot mutate candidate; writes a separate exact evidence namespace.'),
 ('assurance-gates','broker','SigV4 completion / attestation','EVIDENCE','Validated run/task/attempt/fence and exact digests; independent owner remains required.'),
 ('owner-attestation','core','Independent I066 owner decision','AUTHORITY','Core checks owner identity, scope, digest and current dependencies before acceptance.'),
 ('release','artifacts','Pinned released manifest','DATA','Guarded exact package selection; an S3 upload is not acceptance or delivered receipt.'),
 ('release','workflow','Idempotent package + receipt','DATA','Outbox intent and confirmed handoff are distinct; deployment needs target authority.'),
 ('gateway','external-systems','Admitted HTTPS / MCP effect','AUTHORITY','Current AC guard precedes Gateway Policy ENFORCE and qualified target credentials.'),
 ('external-systems','effect','Receipt / observed postcondition','EVIDENCE','Uncertain effects are reconciled before any permitted retry.'),
 ('target-effects','external-systems','Target-authorised domain effect','AUTHORITY','Generated product operates with its own approved target authority and controls.'),
 ('core','telemetry','Redacted metrics / traces','DATA','CloudWatch/OTEL operations are distinct from exact acceptance evidence.'),
 ('core','audit','Configured API audit events','DATA','Organization trail plus selected data events; log archive is separately administered.'),
]
V={**T,'nodes':C};L=[]
for i,(a,b,label,k,note) in enumerate(paths):
 e=dict(id='P'+str(i+1).zfill(2),source=a,target=b,label=label,type=k,note=note);e['points']=points(V,e);L.append(e)
svg=E.fromstring(T['svg']);ns='{http://www.w3.org/2000/svg}'
for g in list(svg):
 if g.get('class')=='awsConnection':svg.remove(g)
titles=[x for x in svg if x.tag==ns+'text'];titles[1].text='Enterprise deployment communication · representative physical paths'
titles[2].text='Same nested topology; arrows here describe AWS transport and trust. Full AC semantics remain in the separate 35-capability / 68-interface diagram.'
obstacles=[[n['x']-8,n['y']-8,n['w']+16,n['h']+16] for n in C]+[[g['x'],g['y'],g['w'],75] for g in T['groups']];used=[]
def overlaps(a,b):return max(a[0],b[0])<min(a[0]+a[2],b[0]+b[2]) and max(a[1],b[1])<min(a[1]+a[3],b[1]+b[3])
insert=next(i for i,n in enumerate(list(svg)) if n.get('class')=='awsCapability')
for e in L:
 g=E.Element(ns+'g');E.SubElement(g,ns+'title').text=e['label']+' · '+e['note'];E.SubElement(g,ns+'polyline',points=' '.join(f'{x},{y}' for x,y in e['points']),fill='none',stroke='#c1b8ce',**{'stroke-width':'2','marker-end':'url(#awsArrow)'})
 label=e['id']+' · '+e['label'];ww=max(110,min(290,len(label)*6.8+16));found=None
 for a,b in sorted(zip(e['points'],e['points'][1:]),key=lambda p:abs(p[1][0]-p[0][0])+abs(p[1][1]-p[0][1]),reverse=True):
  for frac in [.5,.25,.75]:
   for off in [-20,20,-42,42,-65,65,-90,90]:
    x=a[0]+(b[0]-a[0])*frac+(off if a[0]==b[0] else 0);y=a[1]+(b[1]-a[1])*frac+(off if a[1]==b[1] else 0);r=[x-ww/2,y-20,ww,38]
    if x<ww/2+20 or y<145 or any(overlaps(r,o) for o in obstacles+used):continue
    found=(x,y,r);break
   if found:break
  if found:break
 if found:
  x,y,r=found;used.append(r);E.SubElement(g,ns+'rect',x=str(r[0]),y=str(r[1]),width=str(ww),height='38',rx='3',fill='#080808')
  for j,line in enumerate(textwrap.wrap(label,int((ww-15)/7))):E.SubElement(g,ns+'text',x=str(x),y=str(y-3+j*15),fill='#d8c4e9',**{'text-anchor':'middle','font-size':'12'}).text=line
 svg.insert(insert,g);insert+=1
E.register_namespace('',ns[1:-1]);E.register_namespace('xlink','http://www.w3.org/1999/xlink');(O/'Deployment-Communication.svg').write_bytes(E.tostring(svg,encoding='utf-8'))
mx=E.parse(O/'Agentic-Core-AWS-Architecture.drawio').getroot()
for d in list(mx):
 if d.get('id')=='communication':mx.remove(d)
p=copy.deepcopy(mx[0]);p.set('id','communication');p.set('name','Enterprise communication / trust paths');mx.insert(1,p);root=p.find('.//root')
for c in list(root):
 if c.get('edge')=='1':root.remove(c)
root.find('.//mxCell[@id="architecture-title"]').set('value','AGENTIC CORE · ENTERPRISE DEPLOYMENT COMMUNICATION · REFERENCE DESIGN')
for e in L:
 a,b=by[e['source']],by[e['target']];ps=e['points'];anchors=f'exitX={(ps[0][0]-a["x"])/a["w"]};exitY={(ps[0][1]-a["y"])/a["h"]};entryX={(ps[-1][0]-b["x"])/b["w"]};entryY={(ps[-1][1]-b["y"])/b["h"]};'
 c=E.SubElement(root,'mxCell',id=e['id'],value=e['id']+' · '+e['label'],edge='1',source=e['source'],target=e['target'],parent='1',style='edgeStyle=orthogonalEdgeStyle;rounded=0;endArrow=open;strokeWidth=2;strokeColor=#c1b8ce;fontColor=#d8c4e9;fontSize=13;labelBackgroundColor=#080808;'+anchors);geo=E.SubElement(c,'mxGeometry',relative='1',**{'as':'geometry'});arr=E.SubElement(geo,'Array',**{'as':'points'})
 for x,y in ps[1:-1]:E.SubElement(arr,'mxPoint',x=str(x),y=str(y))
E.indent(mx);(O/'Agentic-Core-AWS-Architecture.drawio').write_bytes(E.tostring(mx,encoding='utf-8',xml_declaration=True))
(O/'Deployment-Communication.md').write_text('# Enterprise communication paths\n\nReference design. These representative paths complement the complete 35-capability / 68-interface AC diagram. They are proposed transport/enforcement paths, not provisioned routes. Private endpoint cards specify local connectivity; explicit identity/resource/KMS and application scope checks still govern access.\n\n| ID | Producer → receiver | Protocol / boundary | Responsibility / failure limit |\n|---|---|---|---|\n'+''.join('| '+e['id']+' | '+by[e['source']]['title']+' → '+by[e['target']]['title']+' | '+e['label']+' | '+e['note']+' |\n' for e in L))
print(json.dumps({'physicalPaths':len(L),'drawioPages':len(mx)}))
