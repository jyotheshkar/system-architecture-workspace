"""Render the two bounded AWS case-study target architectures.

Read-only with respect to the application: this script writes only the four
case-study SVG/PNG diagram assets. No AWS resource is provisioned.
"""
from pathlib import Path
from dataclasses import dataclass, field
import html
import math
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "case-studies"
W, H = 1800, 1500
BG = "#07111e"
PANEL = "#101e30"
BORDER = "#3b5570"
TEXT = "#f2f6fc"
MUTED = "#c2cfdf"
CYAN = "#75dfe1"
ORANGE = "#ffb15d"
ROLE = "#25364c"

REGULAR = "C:/Windows/Fonts/segoeui.ttf"
BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONTS = {}
def font(size, bold=False):
    key = size, bold
    if key not in FONTS:
        FONTS[key] = ImageFont.truetype(BOLD if bold else REGULAR, size)
    return FONTS[key]

@dataclass
class Box:
    id: str
    x: int
    y: int
    title: str
    lines: list[str]
    w: int = 330
    h: int = 110
    kind: str = "service"

@dataclass
class Edge:
    source: str
    target: str
    points: list[tuple[int, int]]
    label: str = ""
    label_at: tuple[int, int] | None = None
    dashed: bool = False
    both: bool = False
    rotate: int = 0

class Diagram:
    def __init__(self, title, subtitle):
        self.title, self.subtitle = title, subtitle
        self.boxes = []
        self.edges = []
        self.footer = []
        self.region_height = 1070
    def add(self, *args, **kwargs):
        self.boxes.append(Box(*args, **kwargs))
    def link(self, *args, **kwargs):
        self.edges.append(Edge(*args, **kwargs))
    def validate(self):
        ids = {b.id for b in self.boxes}
        assert len(ids) == len(self.boxes)
        for b in self.boxes:
            assert 0 <= b.x < b.x+b.w <= W
            assert 0 <= b.y < b.y+b.h <= H
        for e in self.edges:
            assert e.source in ids and e.target in ids
            assert len(e.points) >= 2
            for x,y in e.points:
                assert 0 <= x <= W and 0 <= y <= H

def wrap(text, max_width, size=18, bold=False):
    f = font(size, bold)
    words, lines, current = text.split(), [], ""
    for word in words:
        trial = (current + " " + word).strip()
        if f.getlength(trial) <= max_width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines

def ac():
    d = Diagram(
        "Agentic Core — AWS Target Architecture",
        "Governed workflow engineering | One workload account | Seven logical scopes share managed services")
    d.add("browser",90,155,"Customer browser",["Describe · approve · review","Accept exact tested candidate"],kind="human")
    d.add("hosting",510,155,"AWS Amplify Hosting",["Static application assets","Managed global delivery"])
    d.add("identity",90,380,"Amazon Cognito",["PKCE authentication","Identity is not project authority"])
    d.add("api",510,380,"API Gateway HTTP API",["JWT / scopes; HTTPS endpoints","Submit · approve · accept"])
    d.add("intake",930,380,"Intake Lambda",["Authorise owner / project","Validate key and payload hash"])
    d.add("ledger",1350,380,"Amazon DynamoDB",["Requirement + receipt + outbox","Contract / run / release ledger"])
    d.add("recovery",90,590,"Scheduled recovery",["EventBridge Scheduler + Lambda","Query durable due outbox"])
    d.add("contract",510,590,"Contract Engine Lambda",["Dedupe event; durable receipt","Exact version + owner approval"])
    d.add("queue",930,590,"Amazon SQS + DLQ",["Stable event references","Redelivery and explicit failures"])
    d.add("relay",1350,590,"Streams / Relay Lambda",["Relay durable outbox events","Keep pending until accepted"])
    d.add("core",510,810,"Core Controller",["Step Functions Standard + guards","Current ledger controls dispatch"])
    d.add("acceptance",1350,810,"Owner acceptance API",["Lambda binds candidate + evidence","Separate from contract approval"],kind="human")
    d.add("model",90,1020,"Amazon Bedrock",["Bounded data-only DAG proposal","Reviewed operators; no code"])
    d.add("compiler",510,1020,"Plan checks + compiler",["Core admission / Lambda compile","Pinned plan, runtime and PIC"])
    d.add("verify",930,1020,"Verifier Lambda",["Separate role; trusted tests","Read exact bytes; report to Core"])
    d.add("artifacts",1350,1020,"Private versioned S3",["Candidate / PIC / tests / evidence","Separate prefixes and permissions"])
    d.add("release",930,1230,"Release Lambda",["Six current checks; exact intent","Recheck authority and destination"])
    d.add("package",1350,1230,"MOA package / receipt",["Exact S3 package + durable receipt","Unknown stays UNCONFIRMED"])

    d.link("hosting","browser",[(510,210),(420,210)],"Assets",(438,191))
    d.link("browser","identity",[(255,265),(255,380)],"PKCE login",(275,355))
    d.link("browser","api",[(420,235),(675,235),(675,380)],"HTTPS + access token",(465,284))
    d.link("identity","api",[(420,435),(510,435)],"JWT",(438,417),dashed=True)
    d.link("api","intake",[(840,435),(930,435)],"Invoke",(854,417))
    d.link("intake","ledger",[(1260,435),(1350,435)],"Txn",(1284,417))
    d.link("ledger","relay",[(1515,490),(1515,590)],"Stream",(1532,545))
    d.link("relay","queue",[(1350,645),(1260,645)],"Send",(1278,626))
    d.link("queue","contract",[(930,645),(840,645)],"Poll",(864,626))
    d.link("recovery","ledger",[(255,590),(255,535),(1515,535),(1515,490)],
           "Query pending intent / reclaim expired relay lease",(580,526),dashed=True)
    d.link("recovery","queue",[(255,700),(255,752),(1095,752),(1095,700)],
           "Bounded replay of unresolved event IDs",(454,741),dashed=True)
    d.link("contract","core",[(675,700),(675,810)],"Approved contract + run ID",(695,710))
    d.link("core","model",[(510,865),(455,865),(455,967),(255,967),(255,1020)],
           "SDK request / JSON proposal",(85,948),both=True)
    d.link("core","compiler",[(675,920),(675,1020)],"Admitted plan / sealed refs",(695,972),both=True)
    d.link("core","verify",[(840,892),(1095,892),(1095,1020)],
           "Invoke exact subject / return evidence",(863,876),both=True)
    d.link("core","acceptance",[(675,810),(675,774),(1515,774),(1515,810)],
           "Exact candidate / owner decision",(955,752),both=True,dashed=True)
    d.link("compiler","artifacts",[(675,1130),(675,1172),(1515,1172),(1515,1130)],
           "Write sealed candidate versions",(731,1161))
    d.link("artifacts","verify",[(1350,1075),(1260,1075)],"S3 API",(1270,1057),both=True)
    d.link("core","release",[(840,839),(1298,839),(1298,1285),(1260,1285)],
           "Guarded release",(1309,966),dashed=True)
    d.link("release","package",[(1260,1285),(1350,1285)],"Handoff",(1267,1267))
    d.link("package","ledger",[(1680,1285),(1720,1285),(1720,435),(1680,435)],
           "Matching receipt to ledger",(1734,960),dashed=True,rotate=-90)
    d.footer = [
        "PIC = shared reviewed code: approval · ownership · permission scope · verification · bounded repair · release.",
        "k = 2 total candidate attempts. Core mediates all phases; owner acceptance is required before release.",
        "IAM roles · CloudWatch telemetry · audit/retention policies. Managed-service baseline; no customer VPC."
    ]
    return d

def workspace():
    d = Diagram(
        "System Architecture Workspace — AWS Target Architecture",
        "Idea to engineer-reviewed baseline | One canonical versioned model | Separate product from Agentic Core")
    d.region_height = 920
    d.add("browser",90,155,"Customer / engineer",["Browser renders the workspace","3D · Concept · ADA · AWS views"],kind="human")
    d.add("hosting",510,155,"CloudFront + S3 origin",["Versioned static application","Private origin; global delivery"])
    d.add("identity",90,380,"Amazon Cognito",["Customer identity via PKCE","Current membership checked by API"])
    d.add("api",510,380,"API Gateway HTTP API",["JWT / scope validation","Private project operations"])
    d.add("app",930,380,"Workspace API Lambda",["Intake, edits and review actions","Revision / project authorisation"])
    d.add("metadata",1350,380,"Amazon DynamoDB",["Membership + project metadata","Revision, job and review state"])
    d.add("orchestrator",930,590,"Step Functions Standard",["Draft → check → map → review","Bounded jobs; explicit outcomes"])
    d.add("store",1350,590,"Private versioned S3",["Brief, graph, findings, baseline","Exact versions + content digests"])
    d.add("model",90,820,"Amazon Bedrock",["Optional bounded JSON proposals","Requirements / graph drafting"])
    d.add("canonical",510,820,"Canonical model Lambda",["Validate graph schema and limits","Pin one shared model revision"])
    d.add("checks",930,820,"Design checks Lambda",["Structure, scope and evidence","Missing checks are inconclusive"])
    d.add("mapping",1350,820,"AWS mapping Lambda",["Reviewed service catalogue","Alternatives and assumptions"])
    d.add("review",930,1050,"Engineer review API",["Human accepts exact candidate","Changes invalidate stale approval"],kind="human")
    d.add("baseline",1350,1050,"Baseline packager Lambda",["Manifest + designs + findings","Private engineer-ready baseline"])
    d.add("views",90,1260,"Customer browser: one model, four views",["Browser-local rendering · private model revisions returned through the authenticated API","3D Brain · Concept · ADA · AWS — consistent IDs and canonical source lineage"],w=1590,h=90,kind="human")

    d.link("hosting","browser",[(510,210),(420,210)],"Assets",(438,191))
    d.link("browser","identity",[(255,265),(255,380)],"PKCE login",(275,355))
    d.link("browser","api",[(420,235),(675,235),(675,380)],"HTTPS commands / model revisions",(465,284),both=True)
    d.link("identity","api",[(420,435),(510,435)],"JWT",(438,417),dashed=True)
    d.link("api","app",[(840,435),(930,435)],"Invoke",(854,417))
    d.link("app","metadata",[(1260,435),(1350,435)],"Txn",(1284,417))
    d.link("app","orchestrator",[(1095,490),(1095,590)],"Confirmed brief + revision",(1113,548))
    d.link("metadata","store",[(1515,490),(1515,590)],"Version refs",(1535,544),dashed=True)
    d.link("orchestrator","model",[(930,645),(875,645),(875,752),(255,752),(255,820)],
           "Bounded proposal request; deterministic path available",(301,740))
    d.link("model","canonical",[(420,875),(510,875)],"JSON",(437,857))
    d.link("canonical","checks",[(840,875),(930,875)],"Pinned",(853,857))
    d.link("checks","mapping",[(1260,875),(1350,875)],"Eligible",(1268,857))
    d.link("store","mapping",[(1515,700),(1515,820)],"Exact inputs / artifacts",(1534,762),both=True)
    d.link("mapping","review",[(1515,930),(1515,990),(1095,990),(1095,1050)],
           "Candidate + revision-bound findings",(1158,980))
    d.link("review","canonical",[(930,1105),(867,1105),(867,975),(675,975),(675,930)],
           "Changes return to affected revision",(497,965),dashed=True)
    d.link("review","baseline",[(1260,1105),(1350,1105)],"Approve",(1269,1087))
    d.link("baseline","store",[(1680,1105),(1720,1105),(1720,645),(1680,645)],
           "Write exact baseline / confirm availability",(1733,1020),dashed=True,rotate=-90)
    d.footer = [
        "Lifecycle: customer intake → requirements brief → 3D model → design checks → AWS mapping → engineer review → baseline.",
        "IAM + CloudWatch apply across the workload. Proposed AI output is data; no generated code or cloud resources execute.",
        "Current prototype uses browser + Worker owner sessions + optional private GitHub storage. AWS migration remains proposed."
    ]
    return d

def arrow_polygon(p1, p2, size=11):
    dx,dy=p2[0]-p1[0],p2[1]-p1[1]
    mag=math.hypot(dx,dy)
    if mag == 0: return []
    ux,uy=dx/mag,dy/mag
    return [(p2[0],p2[1]),(p2[0]-size*ux-size*.45*uy,p2[1]-size*uy+size*.45*ux),
            (p2[0]-size*ux+size*.45*uy,p2[1]-size*uy-size*.45*ux)]

def draw(d, basename):
    d.validate()
    OUT.mkdir(parents=True,exist_ok=True)
    im=Image.new("RGB",(W,H),BG)
    dr=ImageDraw.Draw(im)
    svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1500" viewBox="0 0 1800 1500" role="img" aria-labelledby="title desc">',
         f'<title id="title">{html.escape(d.title)}</title>',
         '<desc id="desc">Proposed junior Solutions Architect design case study. AWS resources have not been deployed or cloud runtime validation performed.</desc>',
         f'<rect width="{W}" height="{H}" fill="{BG}"/>']

    def line(points, color=BORDER, width=2, dashed=False):
        if dashed:
            # Deliberate dashes, preserving orthogonal route coordinates.
            for a,b in zip(points,points[1:]):
                dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy)
                if not length: continue
                ux,uy=dx/length,dy/length
                for start in range(0,int(length),13):
                    end=min(start+7,length)
                    dr.line([(a[0]+start*ux,a[1]+start*uy),(a[0]+end*ux,a[1]+end*uy)],fill=color,width=width)
        else: dr.line(points,fill=color,width=width,joint="curve")
        pts=" ".join(f"{x},{y}" for x,y in points)
        dash=' stroke-dasharray="7 6"' if dashed else ""
        svg.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="{width}"{dash}/>')
    def rect(x,y,w,h,fill,stroke=None,r=10):
        dr.rounded_rectangle((x,y,x+w,y+h),r,fill=fill,outline=stroke,width=2)
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="2"' if stroke else "")+'/>')
    def text(x,y,s,size=18,color=TEXT,bold=False,rotate=0):
        f=font(size,bold)
        if rotate:
            tw=int(f.getlength(s))+10;tile=Image.new("RGBA",(tw,size+14));td=ImageDraw.Draw(tile);td.text((2,0),s,font=f,fill=color)
            tile=tile.rotate(-rotate,expand=True)
            im.paste(tile,(int(x),int(y)-tile.height),tile)
            svg.append(f'<text x="{x}" y="{y}" transform="rotate({rotate} {x} {y})" fill="{color}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" font-weight="{600 if bold else 400}">{html.escape(s)}</text>')
        else:
            dr.text((x,y),s,font=f,fill=color,anchor="lt")
            # PIL text top anchor corresponds approximately to SVG dominant-baseline.
            svg.append(f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" fill="{color}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" font-weight="{600 if bold else 400}">{html.escape(s)}</text>')

    text(60,35,d.title,42,bold=True)
    text(62,93,d.subtitle,21,MUTED)
    text(90,128,"CUSTOMER ENVIRONMENT · OUTSIDE AWS",16,ORANGE,bold=True)
    text(510,128,"GLOBAL FRONTEND DELIVERY",16,ORANGE,bold=True)
    rect(50,310,1700,d.region_height,"#0a1727",BORDER,14)
    text(78,329,"AWS WORKLOAD ACCOUNT  /  EUROPE (LONDON) — eu-west-2",20,CYAN,bold=True)
    text(1230,331,"Managed services · no customer VPC",17,MUTED)

    # Edges underneath service nodes, with opaque label backgrounds.
    for e in d.edges:
        color=ORANGE if e.dashed else CYAN
        line(e.points,color,2,e.dashed)
        tri=arrow_polygon(e.points[-2],e.points[-1])
        dr.polygon(tri,fill=color);svg.append('<polygon points="'+" ".join(f"{x},{y}" for x,y in tri)+f'" fill="{color}"/>')
        if e.both:
            tri=arrow_polygon(e.points[1],e.points[0])
            dr.polygon(tri,fill=color);svg.append('<polygon points="'+" ".join(f"{x},{y}" for x,y in tri)+f'" fill="{color}"/>')
        if e.label and e.label_at:
            x,y=e.label_at
            if not e.rotate:
                width=font(16).getlength(e.label)
                dr.rectangle((x-4,y-2,x+width+4,y+22),fill="#0a1727")
                svg.append(f'<rect x="{x-4}" y="{y-2}" width="{width+8:.2f}" height="24" fill="#0a1727"/>')
            text(x,y,e.label,16,MUTED,rotate=e.rotate)

    for b in d.boxes:
        fill=ROLE if b.kind=="human" else PANEL
        if b.kind=="model":fill="#102d3b"
        rect(b.x,b.y,b.w,b.h,fill,BORDER)
        line([(b.x+15,b.y+12),(b.x+15,b.y+b.h-12)],ORANGE if b.kind=="human" else CYAN,3)
        x,y=b.x+29,b.y+13
        titlelines=wrap(b.title,b.w-42,23,True)
        for title in titlelines:
            text(x,y,title,23,bold=True);y+=29
        for s in b.lines:
            for part in wrap(s,b.w-42,18):
                text(x,y+1,part,18,MUTED);y+=24
        assert y <= b.y+b.h+5,(b.id,y,b.y+b.h)

    for i,s in enumerate(d.footer):
        text(64,1393+i*28,s,18,MUTED if i else TEXT)
    text(64,1480,"DESIGN CASE STUDY  |  AWS RUNTIME VALIDATION PENDING",16,ORANGE,bold=True)
    svg.append('</svg>')
    value="\n".join(svg)
    ET.fromstring(value)
    (OUT/(basename+".svg")).write_text(value,encoding="utf-8")
    # High-resolution PNG for readable presentation/export; vector SVG remains canonical.
    im.resize((W*2,H*2),Image.Resampling.LANCZOS).save(OUT/(basename+".png"),optimize=True)
    return {"diagram":basename,"boxes":len(d.boxes),"edges":len(d.edges),"width":W,"height":H}

if __name__=="__main__":
    import json
    print(json.dumps([draw(ac(),"agentic-core"),draw(workspace(),"workspace")],indent=2))
