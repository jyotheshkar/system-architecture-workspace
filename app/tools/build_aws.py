import heapq
def crosses(ps,boxes,skip=()):
 for (x1,y1),(x2,y2) in zip(ps,ps[1:]):
  for n in boxes:
   if n['id'] in skip:continue
   l,r,t,b=n['x'],n['x']+n['w'],n['y'],n['y']+n['h']
   if x1==x2 and l<x1<r and max(min(y1,y2),t)<min(max(y1,y2),b):return True
   if y1==y2 and t<y1<b and max(min(x1,x2),l)<min(max(x1,x2),r):return True
 return False

def route(v,e):
 ns={n['id']:n for n in v['nodes']};a,b=ns[e['source']],ns[e['target']]
 ax,ay=a['x']+a['w']/2,a['y']+a['h']/2;bx,by=b['x']+b['w']/2,b['y']+b['h']/2
 if abs(by-ay)<5 and bx<ax and e['type'] not in ['DATA','CONTROL']:sa,sb='top','top'
 elif abs(bx-ax)<5:sa,sb=('bottom','top') if by>ay else ('top','bottom')
 else:sa,sb=('right','left') if bx>ax else ('left','right')
 def port(n,side):
  x,y,w,h=n['x'],n['y'],n['w'],n['h']
  return {'top':([x+w/2,y],[x+w/2,y-28]),'bottom':([x+w/2,y+h],[x+w/2,y+h+28]),'left':([x,y+h/2],[x-18,y+h/2]),'right':([x+w,y+h/2],[x+w+18,y+h/2])}[side]
 ap,start=port(a,sa);bp,end=port(b,sb)
 xs=sorted(set([18,v['width']-18,start[0],end[0]]+[q for n in v['nodes'] for q in [n['x']-18,n['x']+n['w']+18]]));ys=sorted(set([98,v['height']-28,start[1],end[1]]+[q for n in v['nodes'] for q in [n['y']-28,n['y']+n['h']+28]]))
 def blocked(p):return any(n['x']-7<p[0]<n['x']+n['w']+7 and n['y']-7<p[1]<n['y']+n['h']+7 for n in v['nodes'])
 obstacles=[{**n,'x':n['x']-7,'y':n['y']-7,'w':n['w']+14,'h':n['h']+14} for n in v['nodes']]
 source=(xs.index(start[0]),ys.index(start[1]),-1);endxy=(xs.index(end[0]),ys.index(end[1]));q=[(0,source)];dist={source:0};previous={};found=None
 while q:
  cost,state=heapq.heappop(q)
  if cost!=dist[state]:continue
  ix,iy,d=state
  if (ix,iy)==endxy:found=state;break
  for dx,dy,nd in [(1,0,0),(-1,0,0),(0,1,1),(0,-1,1)]:
   jx,jy=ix+dx,iy+dy
   if not (0<=jx<len(xs) and 0<=jy<len(ys)):continue
   p1,p2=[xs[ix],ys[iy]],[xs[jx],ys[jy]]
   if blocked(p2) or crosses([p1,p2],obstacles):continue
   nc=cost+abs(p2[0]-p1[0])+abs(p2[1]-p1[1])+(30 if d!=-1 and d!=nd else 0);st=(jx,jy,nd)
   if nc<dist.get(st,float('inf')):dist[st]=nc;previous[st]=state;heapq.heappush(q,(nc,st))
 if found is None:raise ValueError('Cannot route '+v['id']+' '+e['label'])
 path=[]
 while found!=source:path.append([xs[found[0]],ys[found[1]]]);found=previous[found]
 path=[ap,start]+list(reversed(path))+[bp]
 clean=[]
 for p in path:
  if clean and p==clean[-1]:continue
  if len(clean)>1 and ((clean[-2][0]==clean[-1][0]==p[0]) or (clean[-2][1]==clean[-1][1]==p[1])):clean[-1]=p
  else:clean.append(p)
 return clean

def proposed_points(v,e):
 if e.get('via') and not crosses(e['via'],v['nodes'],(e['source'],e['target'])):return e['via']
 ns={n['id']:n for n in v['nodes']};a=ns[e['source']];b=ns[e['target']]
 ax,ay=a['x']+a['w']/2,a['y']+a['h']/2;bx,by=b['x']+b['w']/2,b['y']+b['h']/2
 if abs(by-ay)<5:
  if bx>ax:return [[a['x']+a['w'],ay],[b['x'],by]]
  if e['type'] in ['DATA','CONTROL']:return [[a['x'],ay],[b['x']+b['w'],by]]
  yy=min(a['y'],b['y'])-48
  return [[ax,a['y']],[ax,yy],[bx,yy],[bx,b['y']]]
 if abs(bx-ax)<5:
  return [[ax,a['y']+a['h'] if by>ay else a['y']],[bx,b['y'] if by>ay else b['y']+b['h']]]
 xx=(ax+bx)/2
 ps=[[a['x']+a['w'] if bx>ax else a['x'],ay],[xx,ay],[xx,by],[b['x'] if bx>ax else b['x']+b['w'],by]]
 return route(v,e) if crosses(ps,v['nodes'],(e['source'],e['target'])) else ps
def points(v,e):
 ps=proposed_points(v,e)
 return route(v,e) if crosses(ps,v['nodes'],(e['source'],e['target'])) else ps


def svg(v):
 raise RuntimeError("Use rebuild_enterprise.py for rendering")
