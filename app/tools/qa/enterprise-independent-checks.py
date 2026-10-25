#!/usr/bin/env python3
"""Read-only structural/geometry QA. Writes only its scratch JSON report.
Usage: python qa/enterprise-independent-checks.py [--root /path/to/scratch]
This does not execute or publish a Site and does not replace browser tests.
"""
from pathlib import Path
import argparse, hashlib, itertools, json, math, re, sys, xml.etree.ElementTree as ET

p=argparse.ArgumentParser();p.add_argument('--root',default=str(Path(__file__).resolve().parents[1]));args=p.parse_args()
root=Path(args.root);dist=root.parent/'dist';checks=[];warnings=[]
def check(name,ok,detail=None):checks.append({'check':name,'pass':bool(ok),'detail':detail})
def sha(s):return hashlib.sha256(s.encode()).hexdigest()
def read(path):return Path(path).read_text()
def embedded(html,id):
 m=re.search(r'<script\b[^>]*\bid=[\"\']'+re.escape(id)+r'[\"\'][^>]*>(.*?)</script>',html,re.S)
 if not m:raise ValueError('Missing embedded '+id)
 return json.loads(m.group(1)),m.group(1)
def single_line(source,prefix):return next((x for x in source.splitlines() if x.startswith(prefix)),None)
def concept_layout(source):
 m=re.search(r'const conceptLayout=(.*?),conceptView=\$\(',source,re.S)
 if not m:raise ValueError('Missing concept layout literal')
 return m.group(1)
def three_bundle(source):
 scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',source,re.S)
 return next((x for x in scripts if 'THREE={}' in x and 'function(t,e)' in x),None)
base=read(root/'revision-baseline.html');current=read(dist/'index.html')
b=json.loads(read(root/'blueprint-revision.json'));parent,parent_raw=embedded(current,'architecture');baseline,baseline_raw=embedded(base,'architecture')
d=json.loads(read(dist/'aws/architecture-data.json'));t=json.loads(read(dist/'aws/enterprise-topology.json'))
aw,aw_raw=embedded(current,'awsArchitectureData')
check('parent_architecture_exact_baseline_json',parent_raw==baseline_raw,{'before':sha(baseline_raw),'after':sha(parent_raw)})
check('parent_architecture_equals_revision_source',parent==b)
check('aws_source_blueprint_equals_parent',d['blueprint']==parent)
check('threejs_bundle_byte_identical',three_bundle(base)==three_bundle(current) and three_bundle(base) is not None,sha(three_bundle(current) or ''))
check('concept_layout_source_byte_identical',concept_layout(base)==concept_layout(current),{'before':sha(concept_layout(base)),'after':sha(concept_layout(current))})
for label,prefix in [('study_positions','const studyPositions='),('interface_styles','const kinds='),('module_palette','const moduleColors='),('reference_mesh_generation','A.nodes.forEach(n=>{const group='),('reference_edge_generation','A.edges.forEach((e,i)=>{const a='),('reference_frame','function frame(')]:
 check(label+'_source_unchanged',single_line(base,prefix)==single_line(current,prefix) and single_line(base,prefix) is not None)
ns={n['id']:n for n in parent['nodes']};es={e['id']:e for e in parent['edges']};modules=parent['modules']
check('exactly_35_unique_capabilities',len(ns)==len(parent['nodes'])==35)
check('exactly_68_unique_interfaces',len(es)==len(parent['edges'])==68)
check('all_interface_endpoints_exist',all(e['source'] in ns and e['target'] in ns for e in es.values()))
check('mapping_covers_exact_35',len(d['mapping'])==35 and {m['id'] for m in d['mapping']}==set(ns))
check('aws_interface_register_exact_semantic_contracts',len(d['interfaces'])==68 and all(all(next((x for x in d['interfaces'] if x['id']==e['id']),{}).get(k)==v for k,v in e.items()) for e in parent['edges']))
check('embedded_aws_data_matches_files',aw['mapping']==d['mapping'] and aw['interfaces']==d['interfaces'] and aw['enterprise']=={k:v for k,v in d['enterprise'].items() if k!='icons'})
combos=[]
for bits in itertools.product([False,True],repeat=len(modules)):
 enabled={m for m,on in zip(modules,bits) if on};visible={id for id,n in ns.items() if n['module']=='core' or n['module'] in enabled};edges=[e for e in es.values() if set(e['requires'])<=enabled];valid=all(e['source'] in visible and e['target'] in visible for e in edges)
 bridge=all(id in {e['id'] for e in edges} for id in ['I067','I068'])==({'memory','learning'}<=enabled)
 combos.append({'modules':sorted(enabled),'capabilities':len(visible),'interfaces':len(edges),'validEndpoints':valid,'validBridge':bridge})
check('all_32_dependency_combinations',len(combos)==32 and all(c['validEndpoints'] and c['validBridge'] for c in combos),combos)
for id,source,target,kind,requires in [('I064','plan','core','STATE',[]),('I065','core','pic','AUTHORITY',[]),('I066','core','verify','AUTHORITY',[]),('I067','versions','mem','STATE',['learning','memory']),('I068','retrieve','versions','STATE',['learning','memory'])]:
 e=es.get(id,{});check(id+'_preserves_critical_interface',e.get('source')==source and e.get('target')==target and e.get('type')==kind and e.get('requires')==requires)
# Topology is presentation data. One semantic card per capability; infra cards are separate.
groups={g['id']:g for g in t['groups']};cards={c['id']:c for c in t['nodes']};semantic=[c for c in t['nodes'] if c.get('ac')]
check('topology_semantic_card_count_35',len(semantic)==35 and {c['ac'] for c in semantic}==set(ns))
check('topology_exact_68_interfaces',len(t['edges'])==68 and {e['id'] for e in t['edges']}==set(es) and all(all(e.get(k)==v for k,v in es[e['id']].items()) for e in t['edges']))
check('unique_boundary_and_card_ids',len(groups)==len(t['groups']) and len(cards)==len(t['nodes']) and not(set(groups)&set(cards)))

card_by_ac={c['ac']:c for c in semantic};route_fail=[]
def on_boundary(point,c):
 x,y=point;a,b,w,h=[c[k] for k in ['x','y','w','h']];tol=.2
 return a-tol<=x<=a+w+tol and b-tol<=y<=b+h+tol and (abs(x-a)<=tol or abs(x-a-w)<=tol or abs(y-b)<=tol or abs(y-b-h)<=tol)
for e in t['edges']:
 points=e.get('points',[])
 if len(points)<2 or not all(len(pt)==2 and all(isinstance(z,(int,float)) and math.isfinite(z) for z in pt) for pt in points):route_fail.append({'id':e['id'],'reason':'invalid route points'});continue
 if not on_boundary(points[0],card_by_ac[e['source']]) or not on_boundary(points[-1],card_by_ac[e['target']]):route_fail.append({'id':e['id'],'reason':'route endpoints do not touch exact cards'})
 if not all(abs(a[0]-b[0])<=3 or abs(a[1]-b[1])<=3 for a,b in zip(points,points[1:])):route_fail.append({'id':e['id'],'reason':'route is not orthogonal'})
check('all_68_routes_finite_near_orthogonal_and_endpoint_bound',not route_fail,route_fail)

containment=[];cycles=[]
for obj in list(groups.values())+list(cards.values()):
 parent_id=obj.get('parent')
 if not parent_id:continue
 g=groups.get(parent_id)
 if not g:containment.append({'id':obj['id'],'reason':'missing parent','parent':parent_id});continue
 if not(obj['x']>=g['x']-0.01 and obj['y']>=g['y']-0.01 and obj['x']+obj['w']<=g['x']+g['w']+.01 and obj['y']+obj['h']<=g['y']+g['h']+.01):containment.append({'id':obj['id'],'parent':parent_id,'childBounds':[obj['x'],obj['y'],obj['w'],obj['h']],'parentBounds':[g['x'],g['y'],g['w'],g['h']]})
 seen={obj['id']};cur=parent_id
 while cur in groups:
  if cur in seen:cycles.append(obj['id']);break
  seen.add(cur);cur=groups[cur].get('parent')
check('nested_group_and_card_containment',not containment,containment)
check('nested_parent_tree_acyclic',not cycles,cycles)
check('svg_canvas_contains_all_boundaries',all(0<=g['x'] and 0<=g['y'] and g['x']+g['w']<=t['width'] and g['y']+g['h']<=t['height'] for g in groups.values()))
# SVG counts, nested content and text bounds. Font measurement is approximate to browser Arial.
svg=ET.fromstring(read(dist/'aws/enterprise.svg'));tag=lambda e:e.tag.rsplit('}',1)[-1]
svg_nodes=[g for g in svg.iter() if g.get('data-ac-node')];svg_edges=[g for g in svg.iter() if g.get('data-ac-edge')]
check('svg_exact_35_semantic_cards',len(svg_nodes)==35 and {g.get('data-ac-node') for g in svg_nodes}==set(ns))
check('svg_exact_68_selectable_edges',len(svg_edges)==68 and {g.get('data-ac-edge') for g in svg_edges}==set(es))
font_path=next((p for p in [Path('/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')] if p.exists()),None)
font_cache={};svg_over=[];approx=[]
try:
 from PIL import ImageFont
except ImportError:ImageFont=None
for g in svg.iter():
 if 'awsCapability' not in g.get('class','').split():continue
 id=g.get('data-ac-node') or g.get('data-aws-infra');rect=next(x for x in g if x.get('class')=='awsCardBox');x,y,w,h=[float(rect.get(k)) for k in ['x','y','width','height']]
 for child in g:
  if tag(child)=='rect' and child is not rect:
   a,b,c,d=[float(child.get(k,0)) for k in ['x','y','width','height']]
   if a<x-.01 or b<y-.01 or a+c>x+w+.01 or b+d>y+h+.01:svg_over.append({'id':id,'element':'service box','bounds':[a,b,c,d]})
  if tag(child)=='text':
   text=''.join(child.itertext());a=float(child.get('x',0));baseline_y=float(child.get('y',0));size=int(child.get('font-size',16))
   if ImageFont and font_path:
    f=font_cache.setdefault(size,ImageFont.truetype(str(font_path),size));left,top,right,bottom=f.getbbox(text,anchor='ls');bounds=[a+left,baseline_y+top,a+right,baseline_y+bottom]
   else:bounds=[a,baseline_y-size,a+len(text)*size*.6,baseline_y+size*.25]
   if bounds[0]<x-1 or bounds[1]<y-1 or bounds[2]>x+w+1 or bounds[3]>y+h+1:svg_over.append({'id':id,'element':'text','text':text,'textBounds':bounds,'cardBounds':[x,y,x+w,y+h]})
check('svg_card_children_fit',not svg_over,svg_over)
if not ImageFont or not font_path:warnings.append('Text measurement uses conservative estimation: Pillow or Arial-compatible font unavailable.')
# Draw.io actual parent-child tree; test child local geometry, not decorative borders.
drawio=ET.parse(dist/'aws/Agentic-Core-AWS-Architecture.drawio').getroot();diagram=next((x for x in drawio.findall('diagram') if x.get('id')=='enterprise'),None)
check('drawio_enterprise_page_exists',diagram is not None)
xml_over=[];xml_parent=[];xml_cycles=[]
if diagram is not None:
 cells={c.get('id'):c for c in diagram.findall('.//mxCell')};vertices={id:c for id,c in cells.items() if c.get('vertex')=='1'};connections={id:c for id,c in cells.items() if c.get('edge')=='1'}
 check('drawio_exact_68_semantic_edges',len(connections)==68 and set(connections)==set(es))
 check('drawio_contains_all_35_semantic_cards',all(id in vertices for id in ns))
 check('drawio_correct_edge_endpoints',all(connections[id].get('source')==es[id]['source'] and connections[id].get('target')==es[id]['target'] for id in connections if id in es))
 for id,c in vertices.items():
  par=c.get('parent');geo=c.find('mxGeometry')
  if par not in cells:xml_parent.append({'id':id,'parent':par});continue
  if par in vertices:
   pg=vertices[par].find('mxGeometry');a,b,w,h=[float(geo.get(k,0)) for k in ['x','y','width','height']];pw,ph=[float(pg.get(k,0)) for k in ['width','height']]
   if a<-.01 or b<-.01 or a+w>pw+.01 or b+h>ph+.01:xml_over.append({'id':id,'parent':par,'childBounds':[a,b,w,h],'parentSize':[pw,ph]})
  seen={id};q=par
  while q in cells:
   if q in seen:xml_cycles.append(id);break
   seen.add(q);q=cells[q].get('parent')
 check('drawio_no_missing_parents',not xml_parent,xml_parent)
 check('drawio_parent_tree_acyclic',not xml_cycles,xml_cycles)
 check('drawio_child_geometries_within_parents',not xml_over,xml_over)
 for id,c in vertices.items():
  if id in groups:check('drawio_boundary_parent_'+id,c.get('parent')==(groups[id]['parent'] or '1'))
# Static shared-shell integration contracts and downloadable paths.
check('aws_in_shared_workspace',bool(re.search(r'id=[\"\']awsViewport[\"\']',current)) and 'awsArchitectureFrame' not in current)
for id in ['moduleButtons','rightDock','rightControlPanel','search','indexResults','linkWalk','tourBar','inspector','systemTab','nodesTab','study']:
 check('single_shared_control_'+id,len(re.findall(r'\bid=[\"\']'+id+r'[\"\']',current))==1)
check('no_standalone_aws_iframe',not bool(re.search(r'<iframe[^>]*aws',current,re.I)))
page_line=single_line(current,'function setPage(') or ''
check('page_switch_keeps_shared_workspace_visible',"$('#workspace').hidden=false" in page_line)
check('aws_clickaway_excluded_from_global_handler','#viewport,#conceptViewport,#awsViewport,#inspector' in current)

tour_line=single_line(current,'function stepTour(') or ''
check('aws_tour_dispatches_camera_focus',"if(page==='aws')awsFocus(id)" in tour_line or 'focusNode(id)' in tour_line)
aws_down=single_line(current,"awsView.addEventListener('pointerdown'") or ''
check('aws_interactive_taps_avoid_unconditional_view_capture',('interactive' in aws_down and ('if(!interactive)' in aws_down or '!interactive&&' in aws_down)) or 'setPointerCapture' not in aws_down)

if "setModules(Object.keys(A.modules))" in page_line and not any(x in page_line for x in ['savedModules','pageModules','restoreModules','awsModules']):
 warnings.append('First AWS entry sets global enabled to all modules; switching back changes Reference/Concept layer preference unless separately saved/restored.')
check('reference_core_scene_data_unchanged',parent==baseline)
paths=sorted(set(re.findall(r'href=[\"\'](\./aws/[^\"\']+)[\"\']',current)))
missing=[v for v in paths if not(dist/v.removeprefix('./')).is_file()]
check('all_current_aws_download_paths_exist',not missing,{'paths':paths,'missing':missing})
redirect=read(dist/'aws/index.html')
check('legacy_aws_url_redirects_to_shared_view','../index.html#aws' in redirect and '<iframe' not in redirect)
report={'kind':'Independent read-only structure and geometry checks; browser interaction and AWS deployment not evaluated','sourceHash':sha(current),'baselineHash':sha(base),'checks':checks,'warnings':warnings,'summary':{'passed':sum(x['pass'] for x in checks),'failed':sum(not x['pass'] for x in checks)}}
(root/'qa/enterprise-independent-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'summary':report['summary'],'failures':[x for x in checks if not x['pass']],'warnings':warnings,'report':str(root/'qa/enterprise-independent-results.json')},ensure_ascii=False,indent=2))
sys.exit(1 if report['summary']['failed'] else 0)
