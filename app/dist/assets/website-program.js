/* System Architecture Workspace, seven-stage product architecture, version 79.
 * This is an explanatory target design. Existing browser/Worker/private GitHub
 * features are distinguished from proposed customer accounts and generation.
 * No AWS resources, model invocation, certification or performance result is implied. */
(() => {
  'use strict';
  const make = config => window.SAWProgramModel.make(config);
  const ROOT = '/assets/aws-icons/';
  const DOC = {
    framework:'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html',
    cognito:'https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html',
    api:'https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html',
    lambda:'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html',
    dynamodb:'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html',
    s3:'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html',
    cloudfront:'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html',
    bedrock:'https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html',
    stepfunctions:'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html',
    cloudwatch:'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html',
    cloudformation:'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html'
  };
  const SERVICES = {
    user:['Customer / reviewer','Person','user',DOC.framework],
    browser:['Customer browser','Browser','browser',DOC.framework],
    cognito:['Amazon Cognito','Cognito','cognito',DOC.cognito],
    api:['Amazon API Gateway','API Gateway','api',DOC.api],
    lambda:['AWS Lambda','Lambda','lambda',DOC.lambda],
    dynamodb:['Amazon DynamoDB','DynamoDB','dynamodb',DOC.dynamodb],
    s3:['Amazon S3','S3','s3',DOC.s3],
    cloudfront:['Amazon CloudFront','CloudFront','cloudfront',DOC.cloudfront],
    bedrock:['Amazon Bedrock','Bedrock','bedrock',DOC.bedrock],
    stepfunctions:['AWS Step Functions Standard','Step Functions','stepfunctions',DOC.stepfunctions],
    cloudwatch:['Amazon CloudWatch','CloudWatch','cloudwatch',DOC.cloudwatch],
    cloudformation:['AWS CloudFormation candidate templates','Candidate IaC','cloudformation',DOC.cloudformation]
  };
  const STATE = "Implemented prototype: browser architecture visualisation and study views, local page drafts, Cloudflare Worker owner sign-in, R2-backed server session/settings records and optional private GitHub revision persistence. The reference guide is deterministic authored-data lookup. Repository-scoped connection is required for production GitHub saves. Proposed AWS target: one workload account in eu-west-2, with a single-owner pilot. AWS migration, Bedrock drafting, multi-customer tenancy and cloud runtime tests are not implemented by this case study.";
  const SOURCE = "System Architecture Workspace AWS case-study baseline, 24 October 2026, integrated into the existing seven native stages and all four study views. The current Worker/R2/private GitHub implementation and proposed AWS services are distinct. The AWS target is an engineering design, not an executed migration or certification. Selected model/version availability and permissions in eu-west-2 must be checked before deployment. Scope: one owner, up to 50 graph components, 100 directed interfaces and 256 KiB canonical model JSON; these are prototype test assumptions, not measured capacity. Public static assets are separate from private project artifacts. AWS Well-Architected supplies six review lenses for the same workload.";
  const A = (decision, alternatives, risks, validation, owner) => ({decision,alternatives,risks,validation,owner});
  const n = (scope,id,name,short,service,summary,details,inputs,outputs,column=1,row=0,extra={}) => {
    const s=SERVICES[service],external=service==='user'||service==='browser';
    return {
      id:`web79-${scope}-${id}`,name,short,brainLabel:short,summary,details,inputs,outputs,
      status:extra.status || (external?'Human or browser responsibility':'Proposed AWS design'),
      placement:external?'external':service==='cloudfront'?'global':'regional',
      concept:{column,row,main:column===1},
      aws:{service:s[0],short:s[1],icon:ROOT+s[2]+'.svg',url:s[3],why:summary,
        notes:external?'This responsibility runs outside the AWS service boundary. It does not grant cloud deployment authority.':'Proposed mapping. Enforce tenant/project permissions and exact revision identity at the application boundary; no running AWS implementation is claimed.',
        status:'Proposed service mapping'},
      ...extra
    };
  };
  const e = (scope,from,to,label,details,extra={}) => ({id:`web79-${scope}-${from}-${to}`,from:`web79-${scope}-${from}`,to:`web79-${scope}-${to}`,label,name:label,details,...extra});
  const stage = (id,serial,name,summary,input,output,nodes,edges,analysis,workflow,failures,legacyIds) => {
    const model=make({id:`website-${id}-v79`,title:name,programId:'website',scopeId:id,scopeSerial:String(serial),summary,input,output,sourceNote:SOURCE,nodes,edges,analysis,workflow,failures});
    model.legacyIds=legacyIds;model.overview.current=[STATE];model.presentation.disclosure=STATE;
    model.awsAccountLabel='Single workload AWS account (proposed)';model.awsRegionLabel='Europe (London) / eu-west-2';
    return {id,serial:String(serial),name,summary,model};
  };
  const stages=[];

  {
    const s='customer';
    stages.push(stage(s,1,'Customer intake','Capture a customer idea as an owned, recoverable project before interpretation.','Customer idea','Owned intake revision',[
      n(s,'customer','Customer and intended outcome','Customer','user','Explain the problem and the people it serves.','The customer supplies the idea, expected outcome, ownership and data sensitivity. Sign-in is not consent to infer missing requirements or provision cloud services.',['Business idea','Outcome and constraints'],['Idea text','Project owner'],1,0),
      n(s,'browser','Workspace browser','Idea workspace','browser','Keep a visible draft and show actual save state.','The current workspace provides the page, selection, rendering and local draft experience. Proposed customer prompt input must display unsaved, saving, saved or failed status and must not present a local draft as private server persistence.',['Idea text','User interactions'],['Submit request','Local recovery draft'],1,1,{status:'Current browser UI; customer intake proposed'}),
      n(s,'assets','Static application delivery','Application assets','cloudfront','Deliver versioned application code globally.','CloudFront with Origin Access Control and a private S3 REST origin distributes versioned public application assets; use a bucket policy that restricts origin reads to the intended distribution. Customer design data is fetched through authenticated APIs and never bundled into the static application or cached as public content.',['Built static assets'],['Browser code and styles'],0,1),
      n(s,'identity','Customer identity','Sign in','cognito','Identify the user before accepting a private idea.','Cognito is the proposed AWS identity service for a single-owner pilot; broader customer tenancy is deferred. The existing Worker owner-session system remains the current implementation. A future public client uses code flow with PKCE, and server-side permission checks remain mandatory.',['Login intent'],['Scoped identity claims'],2,1),
      n(s,'api','Authenticated intake endpoint','Secure entry','api','Accept bounded requests from authenticated customers.','Proposed API routes validate identity and request shape. For the single-owner pilot the handler derives current owner/project access from trusted records, not customer-submitted IDs. General organisation membership and customer tenancy are deferred. Retry identity is scoped to the user and project.',['Authenticated request','Idempotency key'],['Authorised intake command'],1,2),
      n(s,'validate','Intake validation and project ownership','Check ownership','lambda','Check membership, input limits and matching retry content.','Validate length, supported fields, project ownership and content hash. A retry with the same key and same payload reuses the receipt; a changed payload under that key is a conflict. Input remains data, never executable instructions.',['Intake command','Membership record'],['Validated revision','Rejected request'],1,3),
      n(s,'store','Private intake revision store','Save idea','dynamodb','Commit the idea and its receipt together.','A proposed transaction stores the customer idea, revision identity and receipt atomically. The current private persistence path is Worker-mediated GitHub storage with revision conflict handling; it is not DynamoDB. No save is acknowledged before the chosen durable store confirms it.',['Validated revision','Expected prior version'],['Durable revision identity','Conflict or failure'],1,4),
      n(s,'receipt','Customer intake receipt','Saved receipt','browser','Show the saved revision and the next action clearly.','Display a durable receipt and distinguish saved intake from an approved brief or generated system. The customer can retry a lost response and can continue to requirements clarification when the recorded revision exists.',['Durable revision identity'],['Confirmed intake','Start requirements clarification'],1,5)
    ],[
      e(s,'customer','browser','Describe the idea','Customer submits an idea and its intended outcome.'),
      e(s,'assets','browser','Load workspace','Only static application assets use the global delivery path.'),
      e(s,'browser','identity','Authenticate','Obtain identity; membership still belongs to the server.'),
      e(s,'identity','api','Identity claims','Validate token and route permissions.'),
      e(s,'browser','api','Submit or retry','Send the same scoped idempotency key for a lost response.'),
      e(s,'api','validate','Validate intake','Bound the request and check owner/project access.'),
      e(s,'validate','store','Atomic save','Commit the idea revision and receipt together.'),
      e(s,'store','receipt','Return saved revision','Report only the actual persisted identity.'),
      e(s,'receipt','browser','Recover and continue','A saved receipt restores the customer view without generating another idea.')
    ],{
      requirements:A('Capture one owned project revision and a recoverable receipt before interpretation.','Anonymous local-only drafts remain possible but cannot claim customer isolation.','Lost responses can look like failed saves and cause duplicate submissions.','Retry one request before and after response loss; same payload returns one receipt, changed payload conflicts.','Product owner'),
      services:A('Separate static browser delivery, identity, authenticated intake and durable records.','Retain the current Worker/private GitHub backend during the prototype; do not imply an AWS migration.','Adding Cognito without application membership checks exposes cross-customer records.','Test both current owner routes and the future tenant-aware contract separately.','Platform engineer'),
      connections:A('Browser commands carry a request ID and expected revision; tenant identity comes from trusted membership.','A synchronous intake is simpler than introducing a queue before saving the idea.','A client can supply another customer\'s project ID.','Run positive and negative project-ownership fixtures at every read/write route.','Application engineer'),
      architecture:A('Customer, global assets and regional private data are separate trust boundaries.','A managed hosting origin can replace CloudFront/S3 without changing ownership semantics.','Static caches can expose private payloads if API paths are misconfigured.','Assert private responses are not publicly cached and static bundles contain no private data.','Solutions architect'),
      operations:A('Trace submit, validation, persistence and receipt using a redacted request ID.','Full request logging improves debugging but is rejected for private idea text.','A support operator cannot distinguish failed persistence from response loss.','Exercise each failure point and verify logs reveal state without tokens or prompt content.','Operations owner'),
      security:A('Authorise each project operation and protect signed sessions or validated tokens.','Current single-owner sessions do not substitute for customer membership.','Revoked membership may race with a write.','Condition the write on current authorisation/version and test a concurrent revocation.','Security owner'),
      reliability:A('Acknowledge durable storage and make retries content-aware.','Browser storage is useful recovery only, not a durable server acknowledgement.','A saved record without a matching receipt creates ambiguous acceptance.','Inject a transaction failure and confirm neither record is acknowledged partially.','Application engineer'),
      performance:A('Agree an intake payload cap, concurrent editor count and save-latency target before sizing.','Keep input parsing bounded rather than making intake depend on inference latency.','Very large attachments or hot project keys cause slow saves.','Load-test bounded payloads and report measured p95 save latency and conflicts.','Performance owner'),
      cost:A('Meter authentication, intake requests and storage per project.','Current private GitHub storage is a prototype option, not a zero-cost scaling guarantee.','Frequent auto-save can multiply writes without user value.','Measure actual save frequency and compare debounced versus explicit-save usage.','Product owner'),
      sustainability:A('Debounce draft persistence and serve cached versioned application assets.','Persist every keystroke only if collaboration requirements justify it.','Repeated full-document saves waste network and storage.','Measure bytes and writes per editing session and retain a defined recovery window.','Frontend engineer'),
      decision:A('Treat receipt of an idea as durable intake only.','Automatically starting generation on every save is deferred.','Customers may confuse saved intake with a validated architecture.','Review copy and state transitions with a novice customer.','Product owner'),
      failure:A('On save failure retain the local draft; on version conflict keep both revisions for resolution.','Silently overwriting the latest server version is rejected.','Offline drafts can become stale while another editor changes the project.','Test offline recovery, conflict response and session expiry without losing entered text.','Application engineer'),
      evidence:A('Collect ownership, retry, caching, revision-conflict and accessibility results against the release.','A UI screenshot does not establish server isolation.','Passing browser checks may be mistaken for AWS execution evidence.','Record environment, source revision, request/result and explicit unrun AWS tests.','Quality engineer')
    },[{title:'Describe and sign in',detail:'The customer enters an idea and authenticates before private operations.'},{title:'Validate and save',detail:'Ownership, request limits and retry identity are checked before a durable revision is acknowledged.'},{title:'Return a receipt',detail:'The customer sees the saved revision and can begin clarification.'}],['Session expiry returns to sign-in while preserving the unsent draft.','A same-key changed payload is a conflict, not an update.','No durable store acknowledgement means no saved receipt.'],['web-user','web-session','web-shell','web-entry','web-transition','web-drafts','web-store-api','web-router','web-github']));
  }

  {
    const s='brief';
    stages.push(stage(s,2,'Requirements brief','Turn an idea into a customer-confirmed brief with visible assumptions.','Owned intake revision','Confirmed requirements revision',[
      n(s,'intake','Saved customer idea','Saved idea','dynamodb','Read the exact intake revision and its permissions.','The clarification job reads an immutable source revision rather than the latest mutable draft. Current page descriptions supply manually entered context; automated brief extraction remains proposed.',['Intake revision ID'],['Source text and ownership'],1,0),
      n(s,'context','Approved question and constraint patterns','Question patterns','s3','Use a reviewed requirements template and supported terminology.','Version templates for users, outcome, data sensitivity, workload, latency, availability, recovery, region, budget and accessibility. Templates guide clarification; they are not facts about the customer.',['Template version'],['Approved clarification context'],0,1),
      n(s,'assistant','Requirements drafting assistant','Draft the brief','bedrock','Optionally suggest a structured brief and explicit unanswered questions.','Manual entry into the same typed brief is the baseline path; optional bounded inference receives only authorised source text and reviewed context. The reviewer supplies or confirms unknown fields; the model cannot grant confirmation. Guardrails and output validation reduce selected risks but do not prove correctness. Record model/version, source revision and token budget. The current workspace guide is a recorded-data lookup, not a live model.',['Source idea','Template context'],['Candidate requirements','Unanswered questions'],1,1),
      n(s,'questions','Customer clarification','Clarify unknowns','user','Answer missing requirements without hidden assumptions.','Ask only the unresolved questions needed for the intended baseline. The customer can choose unknown; region, load and recovery values must remain labelled assumptions until accepted.',['Draft brief','Open questions'],['Clarification answers','Accepted assumptions'],2,2),
      n(s,'validate','Brief schema and consistency checks','Check the brief','lambda','Require typed fields and trace each requirement to source or assumption.','Reject malformed records, conflicting units and unsupported values. Flag incompatible constraints such as an unmeasured low budget with an unconditional availability promise. This validates declared information, not business feasibility.',['Candidate brief','Customer answers'],['Versioned candidate','Conflicts to resolve'],1,2),
      n(s,'confirm','Customer scope confirmation','Confirm scope','user','Confirm the exact brief before model drafting begins.','Show goals, exclusions, assumptions and success criteria with the revision identity. A confirmation applies only to that revision and does not approve deployment or future changes.',['Candidate requirements revision'],['Explicit confirmation','Requested edits'],1,3),
      n(s,'store','Requirements and confirmation record','Save confirmed brief','dynamodb','Persist the exact brief and customer confirmation together.','Proposed conditional persistence binds the confirmation to the content digest and expected version. If the brief changes, a previous confirmation becomes stale and cannot advance the job.',['Brief digest','Customer decision'],['Confirmed requirements record'],1,4),
      n(s,'release','Brief handoff to modelling','Ready for modelling','stepfunctions','Start one modelling job from the confirmed revision.','Use a stable project/revision job identity. Workflow state records input references rather than unnecessary prompt copies, with bounded retries and cancellation. The assistant is not allowed to reinterpret accepted scope silently.',['Confirmed brief identity'],['Model-drafting job','Traceable job status'],1,5)
    ],[
      e(s,'intake','assistant','Read accepted intake','The job is bound to the source revision.'),e(s,'context','assistant','Apply reviewed template','The question template version is recorded.'),
      e(s,'assistant','validate','Propose requirements','Treat generated structured content as untrusted.'),e(s,'assistant','questions','Ask unresolved questions','No invented traffic or availability target.'),
      e(s,'questions','validate','Answer or mark unknown','Customer answers keep their source lineage.'),e(s,'validate','confirm','Present candidate brief','The complete digest-bound revision is shown.'),
      e(s,'confirm','assistant','Request clarification','Edits create a new candidate, invalidating earlier confirmation.',{kind:'feedback'}),e(s,'confirm','store','Confirm exact revision','Bind owner decision to the reviewed digest.'),
      e(s,'store','release','Start once','Only the confirmed revision can initiate modelling.')
    ],{
      requirements:A('Record users, outcomes, exclusions, workload, data, recovery and budget assumptions.','Free-form prose remains supporting evidence but cannot be the only typed contract.','An unanswered recovery target may be quietly replaced by an invented value.','Use incomplete and contradictory briefs; unknown fields remain visible and prevent premature claims.','Requirements owner'),
      services:A('Use bounded inference for suggestions, deterministic checks for shape, and durable confirmation for authority.','A fully manual brief follows the same schema and confirmation contract.','Model text can impersonate a customer decision.','Assert only an authenticated customer action can produce the confirmation record.','Application engineer'),
      connections:A('Bind every question, answer, draft and confirmation to one project and source revision.','A latest-document pointer is convenient but unsuitable for approving a changing brief.','Late answers may be applied to a superseded question set.','Submit an answer from an old question revision and confirm it is rejected or rebased explicitly.','Workflow engineer'),
      architecture:A('Separate suggestion, validation and customer confirmation states.','One model call that drafts and approves is rejected.','A failed generation could leave an apparently confirmed partial brief.','Interrupt each transition and verify only complete confirmed records advance.','Solutions architect'),
      operations:A('Observe job state, model version, question count and confirmation age without logging private text.','Keep redacted structured traces instead of raw prompt logs.','A hanging model call leaves the customer waiting indefinitely.','Inject model timeout and verify a bounded failure, visible retry option and owned incident.','Operations owner'),
      security:A('Scope source retrieval to the project and constrain inference context.','No cross-customer example retrieval without an explicit approved anonymised corpus.','Prompt injection asks the assistant to fetch another project or grant authority.','Adversarial fixtures must fail retrieval authorisation and cannot write confirmation records.','Security owner'),
      reliability:A('Pin inputs and make job initiation conditional on the confirmed digest.','Retry generation may yield a different draft and therefore needs fresh confirmation.','Duplicate starts create conflicting model jobs.','Retry the confirmation-to-job transition and verify one recorded job identity.','Workflow engineer'),
      performance:A('Bound question rounds, input size and inference timeout.','Short iterative clarification is preferable to an unlimited one-shot prompt.','Long histories create latency and context truncation.','Benchmark brief lengths and round counts before committing a customer response target.','Performance owner'),
      cost:A('Apply project token budgets and a maximum clarification round count.','Manual correction is the fallback once the automated budget is exhausted.','Repeated empty or adversarial prompts burn inference spend.','Measure tokens per accepted brief and test quota enforcement before inference.','Product owner'),
      sustainability:A('Reuse confirmed context and regenerate only changed requirement sections.','Whole-brief regeneration is justified only for scope changes that affect the complete contract.','Small edits repeatedly trigger expensive full-context inference.','Compare tokens and accepted output quality for incremental versus full drafts.','AI engineer'),
      decision:A('The customer confirms what the system is meant to achieve before technical modelling.','Engineer-authored assumptions may be proposed but remain labelled until confirmed.','A visually polished brief can conceal unsupported requirements.','Review a brief with a customer and require each success criterion to have an owner and measure.','Product owner'),
      failure:A('Conflicting constraints return to clarification; stale confirmations block modelling.','Silently weakening a requirement to make the design fit is rejected.','An edited budget invalidates an already scheduled generation.','Change the brief after confirmation and verify the old job cannot claim the new revision.','Quality engineer'),
      evidence:A('Preserve source lineage, generated draft, edits and digest-bound confirmation.','A conversational yes without a revision binding is inadequate.','Replaying an old confirmation can authorise a new brief accidentally.','Test changed-digest and revoked-member confirmations; both fail.','Quality engineer')
    },[{title:'Extract and clarify',detail:'A proposed assistant drafts typed requirements and asks the customer about missing information.'},{title:'Check and confirm',detail:'Deterministic checks expose inconsistencies before the customer confirms the exact brief.'},{title:'Handoff once',detail:'A durable confirmation starts a revision-bound modelling job.'}],['Unknown constraints remain unknown rather than being fabricated.','Changing the brief invalidates its confirmation.','Inference timeout returns to a visible retry or manual-edit state.'],['web-requirements','web-ai','web-workflow','web-page']));
  }

  {
    const s='model';
    stages.push(stage(s,3,'3D model','Make the customer idea explorable as a versioned system model.','Confirmed requirements revision','Inspectable candidate graph',[
      n(s,'brief','Confirmed brief input','Confirmed brief','dynamodb','Load the customer-approved requirements revision.','Read the exact confirmed digest, exclusions and assumptions. This stage cannot quietly add capabilities or rewrite accepted success measures.',['Confirmed brief identity'],['Pinned modelling requirements'],1,0),
      n(s,'patterns','Reviewed component and interface patterns','Model patterns','s3','Supply approved component vocabulary and example interfaces.','A versioned pattern library records responsibilities, allowed edge types and explanation templates. Retrieval is authorised and limited; pattern similarity is not evidence that an architecture works.',['Pattern version','Requirements class'],['Permitted modelling context'],0,1),
      n(s,'draft','Graph drafting proposal','Draft connections','bedrock','Optionally propose components, directed interfaces and explanations.','Manual authoring of the same canonical graph remains supported. The optional proposed model adapter returns structured graph data with requirement references; validate at most 50 components, 100 interfaces and 256 KiB JSON before save or render. It does not execute generated scripts or create AWS resources. The current 3D Brain visualises manually authored graphs; prompt-to-graph generation is not connected.',['Pinned brief','Reviewed patterns'],['Candidate graph','Declared assumptions'],1,1),
      n(s,'schema','Graph parser and schema guard','Validate structure','lambda','Accept only bounded graphs with stable IDs and valid endpoints.','Validate node/edge counts, types, labels, requirement references and graph limits. Reject HTML/script payloads and dangling references; escape customer labels in the UI. Mathematical constraints, when explicitly supplied, are checkable design inputs rather than a general proof of business correctness.',['Candidate graph'],['Parsed graph','Structured errors'],1,2),
      n(s,'revisions','Graph revision service','Save model revision','api','Save edits against an expected graph revision.','A proposed revision API checks membership and rejects stale updates. Customer editing and multi-party review need explicit permissions. Current page state and private GitHub revision checks provide prototype behaviour, not live concurrent graph collaboration.',['Parsed graph','Expected prior version'],['Authorised revision write'],1,3),
      n(s,'store','Immutable model and lineage','Model history','s3','Retain graph content and source identities.','Store a private immutable graph artifact with its digest and brief/pattern/model references; metadata and the active pointer can live in DynamoDB. Publish the pointer only after the artifact exists. Retention is explicit.',['Graph content','Source manifest'],['Immutable graph reference'],1,4),
      n(s,'explain','Change and assumption explanation','Explain changes','lambda','Explain differences using the actual graph and source records.','Calculate structural additions, removals and changed constraints deterministically. A narrative helper may explain those facts, but must not invent execution guarantees or suppress unresolved assumptions.',['Prior graph','Candidate graph'],['Revision diff','Impacted requirements'],2,4),
      n(s,'viewer','Customer 3D exploration','Explore the model','browser','Let the customer inspect responsibilities and follow connections.','The current renderer supports inspection, orbiting, selection and linked views. The proposed customer experience adds project-scoped sharing and editable ideas. The 3D layout is a visual representation, not a runtime simulation or proof that every connection is enforced.',['Graph reference','Explanations and revision diff'],['Customer understanding','Model review feedback'],1,5,{status:'Current manually authored 3D renderer; generation and collaboration proposed'})
    ],[
      e(s,'brief','draft','Use confirmed requirements','Input is fixed to a confirmed revision.'),e(s,'patterns','draft','Use approved patterns','Context carries pattern version and ownership.'),e(s,'draft','schema','Propose graph data','Generated data is untrusted and bounded.'),
      e(s,'schema','revisions','Submit valid graph','A schema pass allows persistence, not architecture approval.'),e(s,'revisions','store','Persist revision','Use expected-version and tenant permission checks.'),
      e(s,'store','viewer','Load exact graph','The viewer receives authorised content only.'),e(s,'store','explain','Compare revisions','Diff the actual graph and source identities.'),e(s,'explain','viewer','Explain impact','Show known changes and remaining unknowns.'),
      e(s,'viewer','revisions','Propose an edit','Customer edits become a new reviewable revision.',{kind:'feedback'}),e(s,'schema','draft','Return validation findings','Bounded repair receives explicit errors, not silent acceptance.',{kind:'feedback'})
    ],{
      requirements:A('Every visible component and connection explains a responsibility tied to the confirmed brief.','A diagram-only image is shareable but cannot support traceable inspection.','Attractive geometry may hide missing interfaces.','Sample each requirement and trace it to nodes, edges or an explicit unresolved gap.','Model owner'),
      services:A('Use browser rendering, proposed bounded model inference, validation functions and private versioned artifacts.','Keep manual model authoring available without inference.','Moving orbit/render interaction to the server adds latency and cost without value.','Verify all camera interactions are local and model fetches require access.','Frontend engineer'),
      connections:A('Carry source revision, graph digest and typed endpoints through drafting, parsing and viewing.','Free-text arrows are insufficient as the only interface definition.','The label says one direction while the stored edge points the other way.','Test renderer and inspector against the same directed-edge records.','Model engineer'),
      architecture:A('The graph is a semantic model; the browser is a view over that model.','Physics-like animation is optional and cannot replace explicit data contracts.','A simulated-looking brain may be mistaken for a running system.','Check content labels and ensure graph state is separate from operational claims.','Solutions architect'),
      operations:A('Track generation errors, schema rejection and model-render failures by revision.','Capture bounded diagnostic metadata instead of complete private graphs in logs.','A corrupt saved graph prevents the customer opening their design.','Exercise a malformed revision and recover the last valid immutable artifact.','Operations owner'),
      security:A('Treat labels, imports and model output as untrusted data and authorise artifact retrieval.','Model-generated HTML or executable formulas are excluded from the graph contract.','Cross-site scripting or an insecure artifact URL leaks another design.','Test malicious labels, blocked executable fields and cross-project download attempts.','Security owner'),
      reliability:A('Keep immutable revisions and update the active pointer only after content persistence.','Mutable single-file overwrite cannot support exact review lineage.','Pointer update succeeds but content upload failed.','Inject each write failure and verify the active pointer always resolves to valid content.','Application engineer'),
      performance:A('Cap graph size and label density; pause work when the view is hidden.','Start with bounded customer models before supporting very large graphs.','Hundreds of labels or excessive particles block useful interaction.','Measure interaction latency, memory and frame time at the agreed maximum graph size on target devices.','Frontend engineer'),
      cost:A('Meter graph-drafting tokens and artifact revisions separately from local rendering.','A deterministic manual edit should not trigger paid inference.','Every camera movement accidentally starts an API job.','Observe network activity while orbiting and selecting; no generation calls should occur.','Product owner'),
      sustainability:A('Render on demand when possible and reuse unchanged geometry and source artifacts.','Continuous animation remains optional and respects reduced motion.','Hidden canvases continue consuming CPU/GPU.','Switch views and background the tab; measure rendering work stops or reduces.','Frontend engineer'),
      decision:A('Customer exploration operates on the same graph later used by checks and AWS mapping.','Separately authored pictures drift from the reviewed data source.','A model edit updates one view but not the others.','Switch all four views for the same revision and compare node and edge identities.','Model owner'),
      failure:A('Schema errors return bounded repair findings; repeated failure offers manual correction.','Unlimited self-repair is rejected.','A generated repair drops a difficult requirement to pass validation.','Compare requirement coverage before and after repair and block unexplained loss.','Quality engineer'),
      evidence:A('Preserve graph schema results, source lineage, browser accessibility and layout observations.','A schema pass is not a mathematical proof of the software concept.','Screenshots are treated as evidence that the model runs correctly.','Label render tests separately from design checks and unrun deployment tests.','Quality engineer')
    },[{title:'Draft responsibilities',detail:'Use the confirmed brief and reviewed patterns to propose a connected model.'},{title:'Parse and preserve',detail:'Reject invalid structure and save a traceable graph revision.'},{title:'Explore and refine',detail:'The customer inspects the 3D model, reads the actual connections and submits explicit revisions.'}],['Invalid or oversized graphs are rejected before rendering.','A stale edit creates a conflict instead of replacing someone else\'s work.','The last valid graph remains recoverable after a failed candidate save.'],['web-canvas','web-page','web-ai','web-sections']));
  }

  {
    const s='checks';
    stages.push(stage(s,4,'Design checks','Expose structural, authority and evidence gaps before service mapping.','Candidate graph and confirmed brief','Revision-bound findings and disposition',[
      n(s,'candidate','Candidate graph snapshot','Model snapshot','s3','Load the immutable graph and its confirmed source brief.','The check job pins graph, brief and pattern revisions. A later graph edit cannot inherit a pass from this snapshot.',['Graph and brief references'],['Exact check input'],1,0),
      n(s,'run','Versioned validation run','Run checks','stepfunctions','Coordinate bounded independent validators and collect their outcomes.','A proposed workflow records pending, running, passed, failed or inconclusive per rule family. Timeout or missing result is inconclusive, never a pass. Each rule has an owner and version.',['Check input','Rule-set version'],['Validation tasks','Run identity'],1,1),
      n(s,'structure','Structure and coverage validator','Check structure','lambda','Check IDs, endpoints, reachability and requirement coverage.','Find dangling edges, disconnected mandatory outputs, undefined interfaces and requirements with no mapped responsibility. Some cycles are legitimate feedback and need classification rather than blanket rejection.',['Graph','Requirement references'],['Structural findings'],0,2),
      n(s,'boundary','Trust and data boundary validator','Check boundaries','lambda','Identify missing authority and data-handling declarations.','Require caller, payload, protocol, authority, timeout and failure handling at relevant boundaries. Inspect data classification, tenant scope and external dependencies. A declared control is still a design assertion until implemented.',['Graph interfaces','Data classifications'],['Boundary findings'],1,2),
      n(s,'constraints','Constraint and recovery validator','Check constraints','lambda','Compare declared budgets, recovery and consistency requirements.','Check typed constraints and supported deterministic relations. Flag contradictions, unresolved assumptions and missing failure paths. Optional mathematical checks verify only their stated model and assumptions; this manual product architecture does not depend on a universal proof.',['Requirement constraints','Failure-path declarations'],['Constraint findings'],2,2),
      n(s,'triage','Finding owner and disposition','Resolve findings','user','Assign blocking gaps, accepted risks and requests for evidence.','The designated reviewer reviews severity and authority. A risk acceptance needs owner, rationale, expiry and exact revision; it cannot reclassify a failed security control as implemented.',['All findings'],['Disposition record','Requested model changes'],1,3),
      n(s,'evidence','Validation evidence artifact','Save evidence','s3','Preserve rule inputs, outputs and observed statuses.','Store the complete run manifest with hashes, rule versions, expected and observed outcomes and environment. Do not confuse proposed test steps with executed test evidence. Logs can reference the artifact without exposing private source content.',['Run identity','Rule results','Disposition'],['Immutable evidence reference'],1,4),
      n(s,'gate','Mapping eligibility decision','Ready for mapping','dynamodb','Advance only the exact revision meeting declared design gates.','A proposed conditional decision records the allowed scope and unresolved risks. The gate checks all required results and current dispositions. Eligibility to create a candidate AWS mapping is not authority to deploy it.',['Graph digest','Evidence reference','Disposition'],['Mapping eligibility','Blocked state'],1,5)
    ],[
      e(s,'candidate','run','Pin check input','Load exact immutable sources.'),e(s,'run','structure','Check graph integrity','Dispatch structural validators.'),e(s,'run','boundary','Check authority and data','Dispatch boundary validators.'),e(s,'run','constraints','Check declared constraints','Dispatch deterministic constraint validators.'),
      e(s,'structure','triage','Report structural gaps','Return actual status and rule version.'),e(s,'boundary','triage','Report trust gaps','Declared controls are not runtime evidence.'),e(s,'constraints','triage','Report conflicts','Unknowns stay explicit.'),e(s,'triage','evidence','Record dispositions','Preserve approved risk rationale and owner.'),
      e(s,'evidence','gate','Evaluate exact revision','A missing or stale result cannot pass.'),e(s,'triage','candidate','Request a new revision','Fixes create new input and invalidate prior findings.',{kind:'feedback'})
    ],{
      requirements:A('Produce explainable findings that identify the source requirement, affected interface and owner.','A single numerical architecture score is not used as a release criterion.','Customers may interpret a green score as certification.','For each blocked fixture verify the finding names the specific failed obligation.','Quality owner'),
      services:A('Use deterministic validators under a recorded workflow and store immutable results.','Human review covers criteria that cannot be reliably automated.','An LLM marks its own generated design correct.','Validate deterministic rules independently of the drafting model.','Validation engineer'),
      connections:A('Every validator receives the same graph digest and a versioned rule set.','Reading the latest graph independently can produce mixed-revision results.','One validator inspects a newer candidate than another.','Change the active draft while a run executes; evidence must retain its original input.','Workflow engineer'),
      architecture:A('Separate result collection, finding disposition and conditional eligibility.','A completed workflow is not automatically a passed validation.','Missing validators are hidden by a successful orchestration status.','Force one validator to time out and confirm the gate remains blocked or inconclusive.','Solutions architect'),
      operations:A('Track missing results, stale runs and unresolved blocking findings with an assigned owner.','Aggregate job success alone hides rule-level failures.','An old finding stays open with no accountable reviewer.','Test alert routing for expired review windows and rule execution failures.','Operations owner'),
      security:A('Evaluate trust boundaries and enforce who may accept which risk.','Customer acknowledgement cannot waive an organisation-mandated access rule.','A low-privilege reviewer dismisses a tenant-isolation failure.','Attempt unauthorised disposition changes and verify they are denied and recorded.','Security owner'),
      reliability:A('Record each rule outcome durably and resume only missing work.','Rerunning every check may be acceptable for small graphs but must retain distinct run IDs.','Retries overwrite a previous failure without history.','Repeat a failed run and confirm earlier observations remain independently traceable.','Validation engineer'),
      performance:A('Classify cheap graph checks separately from expensive scenario analysis.','Do not block simple editing on full validation.','An unbounded graph walk or combinatorial path check exhausts the job.','Test maximum graph size and enforce step, runtime and memory bounds.','Performance owner'),
      cost:A('Run checks affected by changed inputs while requiring a complete valid manifest.','Full reruns are simpler but can be expensive for external evaluators.','Incremental caching reuses findings from stale rule versions.','Invalidate cached results when any input or rule digest changes.','Platform engineer'),
      sustainability:A('Reuse exact-match evidence and avoid duplicate validation jobs.','Reuse applies only when the complete input identity matches.','Overly broad cache keys waste correctness for resource savings.','Compare complete fingerprints and count avoided work without accepting stale evidence.','Validation engineer'),
      decision:A('A check establishes a declared design property within its scope, never all real-world behaviour.','Runtime tests remain separate acceptance obligations after implementation.','A schema pass is presented as proof of security or availability.','Review customer-facing claims against the evidence category that supports each one.','Architecture owner'),
      failure:A('Failed or inconclusive required checks return to model refinement.','Risk acceptance is explicit and policy-scoped, not an automatic bypass.','A stale accepted risk is copied into an unrelated model revision.','Change an affected boundary and verify its prior exception is re-evaluated.','Quality owner'),
      evidence:A('Use a manifest with rule version, input digest, expected and observed result, environment and reviewer.','Proposed tests are labelled not run until executed.','An evidence link points to a result for another candidate.','Cross-check every required result digest against the mapping eligibility record.','Quality engineer')
    },[{title:'Pin and evaluate',detail:'Independent checks evaluate the same graph, brief and rule versions.'},{title:'Explain findings',detail:'A reviewer sees structural, trust and constraint gaps with specific owners.'},{title:'Record eligibility',detail:'Only the exact reviewed revision with complete required results can advance to AWS mapping.'}],['Missing or timed-out checks are inconclusive.','Model edits invalidate affected prior evidence.','Blocked findings return to model refinement with their source references.'],['web-checks','web-workflow','web-archive']));
  }

  {
    const s='mapping';
    stages.push(stage(s,5,'AWS mapping','Translate checked responsibilities into an explainable AWS candidate.','Eligible graph and constraint set','Reviewable AWS candidate',[
      n(s,'model','Checked model and design constraints','Checked model','s3','Read the graph and its mapping eligibility record.','Mapping uses the same model the customer explored, with accepted risks and explicit unknowns. An ineligible or superseded revision cannot quietly enter synthesis.',['Graph digest','Eligibility reference'],['Mapping input'],1,0),
      n(s,'catalog','Reviewed AWS pattern catalogue','Service patterns','s3','Use versioned service rationale and region constraints.','The catalogue records service responsibilities, limits, supported patterns, official references and review dates. It is not a live AWS inventory or a promise that every service is available in the selected region.',['Pattern version','Target region'],['Candidate service options'],0,1),
      n(s,'select','Service selection and rationale','Choose services','lambda','Map each responsibility to a justified service or external actor.','Start with deterministic approved mappings and explicit alternatives. Browser and human responsibilities remain outside AWS. Record which choices rely on unresolved load, latency, consistency, region or cost assumptions. An assistant may explain options but cannot approve them.',['Model responsibilities','Approved options'],['Service decisions','Unresolved choices'],1,1),
      n(s,'boundaries','Trust and deployment boundary planner','Place boundaries','lambda','Separate customers, global delivery, regional services and any required networks.','Draw a VPC only when the workload needs customer network resources. Serverless managed services do not all live inside a customer VPC. Document endpoint exposure, identity checks, data paths and who owns each boundary.',['Service choices','Data and access constraints'],['Account/region/network boundaries'],1,2),
      n(s,'flows','Interface and recovery mapping','Map connections','lambda','Turn each semantic edge into a concrete interface contract.','Record protocol, caller permissions, schema, timeout, retry, deduplication, persistence, dead-letter handling and downstream acceptance. A queue acknowledgement is not completion of the customer workflow.',['Typed model edges','Selected services'],['AWS connections','Recovery contracts'],1,3),
      n(s,'estimate','Workload, quota and cost assumptions','Check assumptions','user','Review sizing and cost inputs before calling the design credible.','An engineer records workload assumptions, regional availability, quotas and dated cost estimates from the appropriate official tools. The site does not invent current prices or claim measured performance.',['Candidate services','Declared workload'],['Sizing notes','Dated estimates','Open risks'],2,3),
      n(s,'candidate','AWS candidate revision','Save candidate','s3','Preserve the diagram data and service rationale together.','Store the service map, original model digest, boundary definitions, interface contracts, sizing assumptions and remaining questions as one versioned candidate. Official icons identify services without implying AWS endorsement.',['Service mapping','Boundaries','Interfaces','Assumptions'],['Immutable AWS candidate'],1,4),
      n(s,'handoff','Engineer review request','Ready for review','stepfunctions','Request a human review of the exact candidate.','A review task references candidate, graph, brief and findings digests. Generation completion creates a review request, never an approval or automatic deployment.',['Candidate reference','Owner and reviewers'],['Pending engineer review'],1,5)
    ],[
      e(s,'model','select','Map checked responsibilities','Keep original requirement and graph references.'),e(s,'catalog','select','Use reviewed service options','Record catalogue date and region assumptions.'),e(s,'select','boundaries','Place service responsibilities','Keep people and browsers outside AWS.'),
      e(s,'boundaries','flows','Map trust crossings','Each edge gains an implementation contract.'),e(s,'select','estimate','Review capacity assumptions','Use declared demand, not invented measurements.'),e(s,'estimate','candidate','Attach estimates and risks','Unknown cost or quota stays visible.'),
      e(s,'flows','candidate','Record interfaces','Include failure and downstream acceptance semantics.'),e(s,'candidate','handoff','Request exact-candidate review','No generated candidate can self-approve.'),e(s,'estimate','select','Revise unsuitable choices','Unsupported constraints return to service selection.',{kind:'feedback'})
    ],{
      requirements:A('Map every required responsibility and recovery path while preserving the confirmed constraints.','A generic AWS service collage is not a sufficient baseline.','A popular service is selected without meeting consistency or recovery needs.','Trace each mapping to a requirement and state why the alternative was rejected.','Solutions architect'),
      services:A('Use reviewed service patterns with official references, region checks and dated assumptions.','Where multiple services fit, retain alternatives for human review.','An old catalogue assumes regional availability or a quota that no longer applies.','Recheck candidate service availability and relevant quotas before an engineering handoff.','Cloud engineer'),
      connections:A('Specify payload, protocol, permission, retry and acceptance for every cross-service edge.','Avoid adding a queue merely to make a diagram look scalable.','An at-least-once path duplicates irreversible work.','Walk a duplicate and delayed-message scenario through the stated idempotency and receipt contracts.','Integration engineer'),
      architecture:A('Separate account, region, global delivery, optional VPC and external actors accurately.','Managed serverless services can be used without drawing fictitious subnets.','A diagram puts a regional managed API into a customer subnet without an interface design.','Review service placement and network paths against official service documentation.','Solutions architect'),
      operations:A('Attach operational owner, metrics, alarms and rollback expectations to service choices.','A service list without an operating model is incomplete.','The diagram contains a DLQ but no person or process owns recovery.','Trace an example failed message from detection to authorised replay and durable completion.','Operations owner'),
      security:A('Define tenant isolation, trust boundaries, least-privilege roles and secret handling.','A service icon alone does not establish a configured control.','Shared roles can access every customer artifact.','Review resource/action scopes and model cross-tenant access-denial tests.','Security owner'),
      reliability:A('Map recovery objectives to persistence, retry, deduplication and restore obligations.','Multi-region design is added only when requirements justify its complexity.','A queue retention period is shorter than the promised recovery window.','Compare each timeout, retention and redrive policy with the accepted recovery objective.','Cloud engineer'),
      performance:A('Make expected request rates, payloads, concurrency and latency explicit before sizing.','Do not inherit Node 01 pilot targets as measured website capacity.','One synchronous generation request exceeds frontend or API timeouts.','Model asynchronous job handoff where needed and plan load tests for each bounded path.','Performance owner'),
      cost:A('Use dated estimates with workload inputs, region and service alternatives.','A provisional estimate remains an assumption until observed spend exists.','Inference tokens, transfer or long retention are omitted from the baseline cost.','Check the cost manifest covers requests, inference, storage, transfer and operational overhead.','Product owner'),
      sustainability:A('Prefer managed, demand-aligned services and explicit retention that fit the workload.','Avoid continuously running infrastructure where bounded event-driven work suffices.','Overprovisioned compute is chosen for a diagram without a demand model.','Compare resource utilisation and lifecycle alternatives against the stated workload.','Solutions architect'),
      decision:A('The mapping is an explainable candidate for review, not an automatically correct AWS implementation.','A human engineer can replace any unsuitable proposed mapping with rationale.','A generated mapping is presented as AWS-approved.','Audit labels and service rationale for unsupported endorsement or deployment claims.','Architecture owner'),
      failure:A('An unresolved region, cost or recovery constraint blocks candidate acceptance or becomes an explicit scoped risk.','Silently weakening a requirement is rejected.','An impossible target is disguised by adding more services.','Challenge one infeasible constraint and verify the process requests a requirement decision.','Review owner'),
      evidence:A('Preserve source graph, service references, review date, estimates and proposed validation plan.','Diagrams and documentation are design evidence, not runtime results.','An updated service map loses its source model lineage.','Compare manifest digests and verify every service and connection has an explainable source.','Quality engineer')
    },[{title:'Choose with reasons',detail:'Map checked responsibilities to services while retaining alternatives and assumptions.'},{title:'Specify boundaries and interfaces',detail:'Define trust crossings, delivery semantics and recovery responsibilities.'},{title:'Request review',detail:'Save the complete AWS candidate and hand it to an engineer.'}],['Unavailable or unsuitable service choices return to mapping with reasons.','Missing workload or cost inputs remain labelled assumptions.','Diagram completion does not grant deployment permission.'],['web-aws-mapping','web-secrets','web-workflow']));
  }

  {
    const s='review';
    stages.push(stage(s,6,'Engineer review','Bind an accountable human decision to the exact candidate and evidence.','AWS candidate and evidence pack','Current review disposition',[
      n(s,'candidate','Candidate and evidence package','Review package','s3','Load the complete candidate with its source lineage.','The review includes brief, model, AWS mapping, checks, unresolved findings, alternatives and cost assumptions. A reviewer must not be asked to approve a diagram without its limitations.',['AWS candidate reference'],['Complete review context'],1,0),
      n(s,'identity','Reviewer identity and role','Reviewer access','cognito','Identify the person permitted to review this project.','Proposed customer collaboration requires explicit project roles and current membership. The existing owner-only login does not provide a deployed engineer/customer role model. Authentication alone does not make a person an authorised approver.',['Reviewer login'],['Identity claims'],0,1),
      n(s,'reviewer','Engineer and customer review','Inspect the design','user','Examine design choices and affected customer expectations.','The engineer examines service fit, boundaries, failure paths and evidence. The customer confirms material requirement changes. Organisational policy determines whether independent reviewers or separation of duties are required.',['Review context','Reviewer role'],['Questions','Requested changes','Decision intent'],1,1),
      n(s,'diff','Revision and impact comparison','Compare changes','lambda','Show what changed since the previous review.','Compare exact graph, brief and mapping identities. Highlight security, cost, outcome and recovery changes; a summary must not hide deleted requirements or newly introduced assumptions.',['Current and prior manifests'],['Structural diff','Impacted approvals'],2,1),
      n(s,'risks','Risk ownership and bounded exceptions','Resolve exceptions','api','Record explicit accept, reject or revise decisions for findings.','Server-side rules check who may accept each category of risk. Exceptions require rationale, owner, expiry and affected revision. A customer cannot waive a mandatory platform isolation rule by clicking approve.',['Finding identity','Reviewer decision'],['Authorised disposition','Denied action'],1,2),
      n(s,'record','Review decision ledger','Save review decision','dynamodb','Persist a human decision with the exact candidate digest.','Use conditional state transitions and immutable decision records. Approve, request changes and reject are distinct outcomes. Record reviewer identity and time; a model can draft a response but cannot sign an approval.',['Candidate digest','Authorised decision'],['Review record'],1,3),
      n(s,'guard','Current revision and evidence guard','Check review is current','lambda','Recheck candidate, evidence, membership and exception validity.','An approval becomes stale if relevant inputs change, required evidence expires, access is revoked or a risk exception no longer applies. The baseline gate reads current authoritative records rather than a browser checkmark.',['Review record','Current source identities'],['Current approval','Stale or blocked state'],1,4),
      n(s,'handoff','Baseline preparation authority','Ready for baseline','stepfunctions','Permit preparation of a versioned baseline package.','The approved scope authorises artifact preparation only. Provisioning resources and running the customer workload require separately scoped authority and implementation evidence.',['Current approval reference'],['Baseline packaging task'],1,5)
    ],[
      e(s,'candidate','reviewer','Open full context','Present source, assumptions and evidence.'),e(s,'identity','risks','Check reviewer permissions','Membership and policy are validated by the server.'),e(s,'candidate','diff','Compare exact revisions','No latest-pointer ambiguity.'),e(s,'diff','reviewer','Explain material changes','Expose invalidated prior decisions.'),
      e(s,'reviewer','risks','Decide each finding','Human intent is subject to role and policy checks.'),e(s,'risks','record','Persist valid disposition','Bind the record to a candidate digest.'),e(s,'record','guard','Recheck authority and freshness','Approval is not permanently valid.'),e(s,'guard','handoff','Permit packaging','The grant is limited to baseline preparation.'),
      e(s,'reviewer','candidate','Request a revised candidate','Requested changes return to modelling or mapping as appropriate.',{kind:'feedback'})
    ],{
      requirements:A('Enable a reviewer to explain, defend and challenge the candidate before it is packaged.','A checkbox with no source revision or supporting material is inadequate.','The customer believes an engineer approved changes they never saw.','Change the candidate while the review is open and require a fresh decision.','Review owner'),
      services:A('Use identity, an authorised review API, conditional decisions and immutable source artifacts.','Email discussion can inform review but must be captured as an attributable revision-bound record.','A model-generated recommendation is stored as a human approval.','Attempt a decision without an authenticated reviewer principal and deny it.','Application engineer'),
      connections:A('Link reviewer identity, candidate digest, finding IDs and expiry to each decision.','Do not bind approval only to a mutable page name.','An approval for one project is reused for another.','Replay the decision with a different tenant, project or candidate and verify rejection.','Security engineer'),
      architecture:A('Separate reviewing, recording a decision and checking whether the decision remains current.','A single browser flag cannot authorise baseline preparation.','Client state is altered to bypass unresolved findings.','Call the packaging boundary directly without valid server-side approval and deny it.','Solutions architect'),
      operations:A('Track review age, unowned findings, requested changes and stale approvals.','Automated reminders may notify, but never auto-approve on timeout.','A review queue silently accumulates blocked customer work.','Exercise timeout handling and escalation with a named owner and visible blocked state.','Operations owner'),
      security:A('Apply role-scoped decision authority and recheck membership at use time.','Independent approval is configured when policy requires it.','A revoked engineer\'s old approval remains usable forever.','Revoke the reviewer before packaging and confirm the guard blocks or requires replacement review.','Security owner'),
      reliability:A('Make decision submission idempotent and record conflicts explicitly.','Last-write-wins is unsafe for simultaneous approve and reject actions.','Concurrent reviewers overwrite each other\'s decisions.','Submit opposing decisions against the same expected revision and verify policy-defined conflict handling.','Application engineer'),
      performance:A('Load the manifest and relevant diff first, with large evidence artifacts on demand.','Do not synchronously download all historical versions for every review.','A large package prevents the reviewer seeing current blockers.','Measure initial review load and evidence retrieval for the expected package size.','Frontend engineer'),
      cost:A('Retain useful review lineage with lifecycle policies for bulky supporting artifacts.','Do not regenerate candidates simply because a reviewer opens a page.','Review navigation repeatedly invokes paid inference.','Observe network activity and verify reading existing evidence has no generation side effect.','Product owner'),
      sustainability:A('Reuse stored candidate and diff artifacts during collaborative review.','Only changed inputs should request new analysis.','Each reviewer duplicates the same compute-heavy report.','Use one versioned result per input identity and measure duplicate work avoided.','Platform engineer'),
      decision:A('A human approves the exact baseline candidate within declared scope and limitations.','No model output can grant deployment authority.','The word approved is shown without stating what was approved.','Review interface copy with customers and engineers for the artifact-preparation boundary.','Product owner'),
      failure:A('Requested changes return to the affected stage; changed inputs invalidate prior approval.','An expired exception cannot silently renew.','A design is repackaged under an old approval after a material change.','Modify security, cost and output semantics and verify the currentness guard detects each change.','Quality engineer'),
      evidence:A('Preserve reviewer identity, source digests, dispositions, timestamps and currentness checks.','A screenshot of a selected approval button is not sufficient.','A review record cannot reconstruct the candidate that was seen.','Resolve every stored manifest reference and compare its digest during an audit fixture.','Quality engineer')
    },[{title:'Inspect and compare',detail:'The authorised reviewer reads the candidate, source evidence and changes.'},{title:'Decide explicitly',detail:'Findings receive a permitted disposition, bound to the exact candidate.'},{title:'Check currentness',detail:'Only a still-valid human review can initiate baseline preparation.'}],['A changed candidate needs re-evaluation rather than inheriting approval.','No response to a review request remains pending; it never means consent.','Revoked roles, expired exceptions and unresolved mandatory findings block packaging.'],['web-engineer','web-study','web-guide','web-workflow']));
  }

  {
    const s='baseline';
    stages.push(stage(s,7,'Baseline package','Deliver an explainable engineering starting point with complete source lineage.','Current engineer-reviewed candidate','Versioned baseline and customer access',[
      n(s,'accepted','Current accepted candidate','Accepted candidate','dynamodb','Read the valid review and exact input identities.','Check that brief, graph, mapping, validation and human review still refer to the intended candidate. Preparation must fail closed on a missing reference, stale approval or revoked permission.',['Current approval reference'],['Accepted source manifest'],1,0),
      n(s,'manifest','Baseline manifest compiler','Assemble manifest','lambda','Resolve source artifacts and record digests before packaging.','The manifest includes requirements, graph, service mapping, interfaces, design decisions, evidence categories, unresolved risks, approval and revision identity. Every item is labelled observed, proposed or not run as appropriate.',['Accepted source manifest'],['Complete digest manifest'],1,1),
      n(s,'diagram','Architecture and explanation export','Create readable design','lambda','Produce diagrams and explanations from the same structured model.','Export the official-icon AWS diagram, concept view, component catalogue and interface descriptions from the pinned data. Readability, content parity and no clipped labels are validation requirements. A diagram is an engineering communication artifact.',['Graph and mapping artifacts'],['Diagrams','Component/interface guide'],1,2),
      n(s,'iac','Optional candidate infrastructure templates','Candidate IaC','cloudformation','Include explicitly marked templates only if requested and separately validated.','Infrastructure templates are an optional future artifact. They require schema, policy, environment and change-set review; the package does not execute them. A successful template validation cannot prove application correctness or authorise spending.',['Reviewed service mapping','Template rules'],['Candidate template files','Validation limitations'],0,2),
      n(s,'verify','Package completeness and integrity checks','Verify the package','lambda','Verify required files, references, digests and review scope.','Check that diagrams, JSON, written rationale and optional templates agree with the manifest. Reject stale sources and incomplete evidence labels. Re-read the approval before promoting the completed package reference.',['Manifest','Generated files'],['Verified package index','Packaging failure'],1,3),
      n(s,'archive','Private versioned baseline archive','Store baseline','s3','Store a private versioned package with defined retention.','Pin exact S3 VersionIds and byte digests and associate the accepted manifest with project metadata. Versioning alone is not immutability: constrain overwrite/delete permissions and define lifecycle and approved retention; additional retention locks need a separate requirement. Private GitHub and portable page files exist in the current prototype; an AWS package archive and its download authorisation are proposed. Do not put customer packages in public website assets.',['Package files','Integrity manifest'],['Private package reference'],1,4),
      n(s,'access','Project-scoped download and exploration','Customer access','api','Authorise each package read and 3D-model access.','A proposed API checks current customer/project membership and issues short-lived access where appropriate. Revocation prevents new access; already downloaded copies cannot be recalled. Audit metadata without logging private content.',['Package reference','Current user identity'],['Authorised package read','Access rejection'],2,4),
      n(s,'customer','Customer and AWS engineer handoff','Baseline delivered','user','Explore the idea deeply and use the package as an engineering starting point.','The customer can study complexity in the 3D Brain and discuss proposed changes. An AWS engineer receives a traceable baseline for further design, implementation and runtime tests. Deployment, operation and proven business outcomes remain separate activities.',['Baseline package','3D model and evidence'],['Informed review','Proposed next revision','Separately authorised engineering work'],1,5)
    ],[
      e(s,'accepted','manifest','Resolve accepted sources','Pin all identities and current review scope.'),e(s,'manifest','diagram','Export from one source','Generate human-readable artifacts from the exact model.'),e(s,'manifest','iac','Prepare optional candidate templates','Only if requested; no execution permission.'),
      e(s,'diagram','verify','Check content parity','Required diagram and narrative files match the manifest.'),e(s,'iac','verify','Attach optional template status','Include validation limitations and no deployment claim.'),e(s,'verify','archive','Save exact versioned package','Publish the complete package after integrity checks.'),
      e(s,'archive','access','Request private access','A package reference does not grant permission.'),e(s,'access','customer','Deliver authorised baseline','The engineer receives an input to implementation, not a running workload.'),e(s,'customer','accepted','Request a future revision','Changes start a new reviewable lifecycle, preserving the delivered baseline.',{kind:'feedback'})
    ],{
      requirements:A('Deliver a readable, traceable baseline the customer can understand and an AWS engineer can develop.','A ZIP of unrelated pictures without source lineage is insufficient.','The recipient cannot tell what was reviewed or what remains untested.','Ask a reviewer to trace a requirement through graph, mapping, decision and evidence from the package alone.','Product owner'),
      services:A('Use bounded artifact preparation, private versioned storage and authorised access.','The current portable JSON/private GitHub workflow remains distinct from a future AWS archive.','A package is copied into public static assets for convenience.','Inspect publication inputs and assert customer artifacts are excluded from public website bundles.','Platform engineer'),
      connections:A('Carry exact digests and access context from accepted sources through download.','A download URL is short-lived access, not the package\'s persistent identity.','An object path is accepted without project ownership checks.','Test direct and cross-project artifact access, including expired access links.','Security engineer'),
      architecture:A('Separate baseline preparation, private delivery and later deployment authority.','Automatic provisioning is outside this product stage.','An optional template is executed by a packaging worker.','Use a packaging role with no infrastructure mutation permissions and verify attempted provisioning is denied.','Solutions architect'),
      operations:A('Track preparation state, missing artifacts, checksum failure and delivery access errors.','A completed ZIP write is not evidence that recipients can read its contents.','A successful job emits an inaccessible or corrupt bundle.','Download and verify the exact stored package using an authorised test identity.','Operations owner'),
      security:A('Check current membership for package access and protect customer design artifacts.','Public long-lived package links are not the default.','Revoked customers continue creating new download links.','Revoke access and verify new reads fail; explain that prior downloaded copies cannot be recalled.','Security owner'),
      reliability:A('Preserve immutable artifacts and promote a package only after completeness and integrity checks.','Overwrite-in-place cannot support dependable recipient references.','A partial packaging retry mixes files from two candidates.','Interrupt packaging, retry, and confirm every file matches one manifest identity.','Application engineer'),
      performance:A('Bound package size, render time and download requirements for the target customer devices.','Generate large exports asynchronously while retaining clear progress state.','Large vector diagrams freeze the packaging function or the recipient browser.','Test maximum supported graph/package sizes and provide a clear failure or pagination strategy.','Performance owner'),
      cost:A('Measure artifact storage, retention, generation and download transfer.','Keep unnecessary duplicate rendered formats optional.','Indefinite historical exports dominate storage and delivery cost.','Estimate and later measure package bytes and download volume per active project.','Product owner'),
      sustainability:A('Generate artifacts once per accepted revision and apply a documented retention lifecycle.','Re-rendering on every download is avoidable duplicate work.','Old unused exports remain in hot storage indefinitely.','Compare retained bytes to the agreed retention schedule and preserve required source lineage.','Platform engineer'),
      decision:A('The output is a baseline design package, with implementation and operational validation still required.','Do not claim production readiness from document completeness.','A customer treats the package as a guarantee that the idea works.','Review handoff language so assumptions, limitations and next engineering responsibilities remain explicit.','Architecture owner'),
      failure:A('Missing evidence or stale approval blocks release; preparation failures leave the prior baseline intact.','Do not replace the last valid baseline with a partial candidate.','Recovery loses the prior working download reference.','Fail each packaging stage and confirm the previous immutable baseline remains readable.','Quality engineer'),
      evidence:A('Record artifact hashes, source versions, packaging checks and authorised readback separately from AWS runtime tests.','A published website version proves publication, not deployed customer infrastructure.','The package reports test plans as passed evidence.','Inspect every evidence category and require observed results only for tests actually executed.','Quality engineer')
    },[{title:'Resolve approved sources',detail:'The current review and exact revisions define what can be packaged.'},{title:'Build and verify',detail:'Readable designs, source data and evidence are checked against one manifest.'},{title:'Deliver privately',detail:'The customer explores the model and the engineer receives a baseline for separately authorised implementation.'}],['Incomplete artifacts are never promoted as the latest baseline.','Stale approval returns to engineer review.','A new customer idea or material change creates a new lifecycle revision.'],['web-baseline','web-archive','web-release']));
  }

  const overviewNodes=stages.map((item,index)=>{
    const service=['user','lambda','s3','lambda','lambda','user','s3'][index];
    const node=n('overview',item.id,item.name,item.name,service,item.summary,
      `${item.summary} Open this stage for its complete component model, service choices, failure paths and Architectural Depth Analysis. ${STATE}`,
      [item.model.input||['Customer idea','Owned intake','Confirmed brief','Candidate graph','Checked model','AWS candidate','Current review'][index]],
      [item.model.output||['Owned intake','Confirmed brief','Inspectable model','Design findings','AWS candidate','Current review','Baseline package'][index]],1,index,{exploreScope:item.id,studySerial:String(index+1)});
    return node;
  });
  const overviewEdges=stages.slice(0,-1).map((item,index)=>e('overview',item.id,stages[index+1].id,
    ['Save the idea','Confirm requirements','Inspect the model','Resolve design findings','Request engineer review','Prepare the baseline'][index],
    'Advance using exact source revisions, current project permissions and the recorded state of this boundary.'));
  overviewEdges.push(e('overview','checks','model','Revise the model','Blocking or inconclusive design findings return to a new model revision.',{kind:'feedback'}));
  overviewEdges.push(e('overview','review','mapping','Revise AWS choices','Engineer feedback returns to the service mapping and invalidates stale candidate approval.',{kind:'feedback'}));
  overviewEdges.push(e('overview','review','brief','Clarify the requirement','Material requirement changes require customer confirmation and downstream re-evaluation.',{kind:'feedback'}));
  overviewEdges.push(e('overview','baseline','customer','Explore and propose changes','A customer studies the delivered model and starts a traceable new idea or revision.',{kind:'feedback'}));
  const overviewAnalysis={
    requirements:A('Turn a customer idea into an understandable model and a reviewed AWS baseline.','The current manual modelling workflow remains useful without AI generation.','The concept promises time savings or mathematical proof that have not been measured.','Pilot with agreed outcomes and compare observed effort, comprehension and design quality.','Product owner'),
    services:A('Keep browser rendering separate from proposed identity, drafting, checks, review and private artifacts.','Retain the current Worker/private GitHub prototype while evaluating AWS implementation.','A target-service diagram is interpreted as an existing AWS deployment.','Inventory current code separately from proposed services and label every unimplemented boundary.','Solutions architect'),
    connections:A('Carry one traceable chain from intake revision to baseline manifest, with explicit feedback.','Do not synchronise separate diagram files by hand as the authoritative data model.','One view presents an old model while another uses a new candidate.','Check shared IDs and source digests across all four views and exported artifacts.','Model engineer'),
    architecture:A('Use seven stages with customer ownership, bounded generation, independent checks and human review.','A single unrestricted agent with deployment permissions is outside this design.','Generation completion is treated as authority to operate.','Demonstrate each distinct acceptance, review and release gate with denied-path fixtures.','Architecture owner'),
    operations:A('Give every stage a visible state, correlated revision identity, owner and recovery path.','Overall job success alone cannot explain a failed validator or stale review.','Failures disappear behind optimistic interface messages.','Inject errors at stage boundaries and compare UI state with authoritative records.','Operations owner'),
    security:A('Enforce tenant/project access at every data boundary and keep generated content untrusted.','Single-owner sign-in is the current prototype, not deployed multi-tenant isolation.','Shared artifact paths leak customer ideas between projects.','Test negative access, revocation and untrusted-content handling throughout the complete lifecycle.','Security owner'),
    reliability:A('Preserve immutable sources, conditional transitions and revision-bound authority.','Retryable jobs still need stable identities and explicit duplicate handling.','An old approval or evidence record advances a changed candidate.','Run interruption, retry and stale-revision scenarios from intake through baseline.','Application engineer'),
    performance:A('Agree limits for prompts, graph size, job duration and package size before capacity claims.','Customer rendering remains local while longer generation can be asynchronous.','Large models or slow inference make the website appear frozen.','Measure browser interaction and each job path on representative devices and workloads.','Performance owner'),
    cost:A('Track inference, requests, artifacts, retention and delivery per project.','Manual editing and existing-data exploration should avoid inference spend.','Automatic regeneration on every interaction creates unpredictable costs.','Set and test project budgets, then report measured usage separately from dated estimates.','Product owner'),
    sustainability:A('Reuse immutable results, pause hidden rendering and avoid duplicate generation.','Retain only the artifacts needed for recovery, evidence and agreed customer history.','Frequent full reruns waste compute and storage.','Measure reuse, idle render work, tokens and retained bytes for the same useful output.','Platform engineer'),
    decision:A('One shared data model supports 3D Brain, Concept, ADA and AWS views.','Views explain different aspects of the same source rather than becoming separate implementations.','A beautiful interface hides inconsistent underlying architecture content.','Trace selected nodes and feedback paths through each view and its inspector.','Architecture owner'),
    failure:A('Return to the affected stage with a new revision and invalidate dependent results explicitly.','Silent repair that weakens customer requirements is rejected.','A required finding is lost while moving between stages.','Carry one deliberately failing requirement through model repair, mapping and review.','Quality owner'),
    evidence:A('Separate implemented prototype behaviour, target design, proposed tests and observed results.','The hypothesis remains an idea until customer and engineering evaluations exist.','A complete architecture description is mistaken for a completed software platform.','Maintain a claim-to-evidence ledger with implementation scope and environment for each assertion.','Quality engineer')
  };
  const overview=make({id:'website-program-v79',title:'System Architecture Workspace',programId:'website',scopeId:'overview',scopeSerial:'',summary:'From a customer idea to an explorable system model, depth analysis and an engineer-reviewed AWS baseline.',input:'Customer idea',output:'Reviewed baseline package',sourceNote:SOURCE,nodes:overviewNodes,edges:overviewEdges,analysis:overviewAnalysis,
    workflow:stages.map(item=>({title:`${item.serial}. ${item.name}`,detail:item.summary})),failures:['Design findings return to model refinement.','Engineer feedback can revise AWS mappings or the confirmed brief.','A baseline is an engineering starting point; deployment and customer workload execution need separate implementation and authority.'],current:[STATE]});
  overview.overview.current=[STATE];overview.presentation.disclosure=STATE;
  overview.sourceReferences=[{title:'AWS Well-Architected six pillars',url:DOC.framework},{title:'DynamoDB transactional writes',url:DOC.dynamodb},{title:'Amazon Bedrock safeguards and their configured scope',url:DOC.bedrock}];
  // Bounded junior Solutions Architect case-study content. Native model IDs and UI are unchanged.
  Object.assign(overview.analysis, {
  "requirements": {
    "decision": [
      "A browser workspace for manually authored, versioned architecture models. The bounded AWS target adds controlled requirements/model proposals, deterministic checks, AWS mapping and explicit engineer review. All views share one canonical model.",
      "Pilot scope: one owner and one AWS workload account in eu-west-2; 50 components, 100 interfaces and 256 KiB canonical graph JSON maximum.",
      "Intended outcomes: a confirmed brief, an inspectable canonical model, version-bound findings, exact engineer review and a traceable baseline export."
    ],
    "alternatives": [
      "Manual modelling with the current Worker/private GitHub prototype remains useful without model generation.",
      "General customer accounts, collaboration, automatic provisioning and broad architecture generation are deferred."
    ],
    "risks": [
      "Unresolved workload, data, recovery or cost constraints are presented as unknown assumptions rather than invented values.",
      "A proposed capacity bound is not evidence that the browser or cloud meets it."
    ],
    "validation": [
      "Use an example brief to trace requirements through graph, AWS choices, findings and review.",
      "Reject over-limit graph input and leave the last valid model available.",
      "Report declared bounds and actual tests separately."
    ],
    "owner": "Product owner"
  },
  "services": {
    "decision": [
      "One workload account in eu-west-2. CloudFront OAC with a private S3 REST origin delivers public application code; the browser renders the model outside the AWS account.",
      "Cognito plus API Gateway/Lambda protect project operations. DynamoDB holds revision/status/review metadata; private versioned S3 holds models, findings, diagrams and packages.",
      "Step Functions Standard coordinates bounded proposal, checking and review work. Optional Bedrock suggestions remain untrusted data and require schema checks and human review. IAM and CloudWatch support the complete path."
    ],
    "alternatives": [
      "Retain current Cloudflare Worker/R2 and optional private GitHub storage while evaluating a deliberate AWS migration.",
      "Manual brief/graph entry avoids paid inference; a fixed reviewed catalogue is the initial AWS mapping source.",
      "Do not add a VPC, NAT or container tier without a private-network or execution requirement."
    ],
    "risks": [
      "Public asset caching leaks project content if private data is bundled into the frontend.",
      "Identity tokens alone do not establish permission to read, edit or review a project.",
      "A selected model or service configuration may not be available or permitted in the target Region."
    ],
    "validation": [
      "Inspect private origin policy/OAC configuration, API authorisation and private response caching.",
      "Check selected service/model availability and actual IAM permissions before deployment.",
      "Document why each service is used, a realistic alternative and its operational trade-off."
    ],
    "owner": "Solutions architect"
  },
  "connections": {
    "decision": [
      "HTTPS static delivery serves public code only; customer data follows authenticated API routes.",
      "Pin idea, brief, graph, findings, AWS mapping, reviewer decision and baseline manifest to exact revision identities.",
      "Persist artifact bytes before promoting metadata references; use conditional writes, stable request/job identities and explicit conflict handling."
    ],
    "alternatives": [
      "Keeping one canonical model avoids maintaining separate unsynchronised diagrams.",
      "DynamoDB metadata and S3 bytes are separate operations; retain pending/orphan states and a reconciliation procedure rather than implying an atomic cross-service transaction."
    ],
    "risks": [
      "Lost save responses can duplicate work.",
      "An object key without its exact version/digest can point at the wrong candidate.",
      "A changed brief or graph can inherit stale findings/review if currentness is not checked."
    ],
    "validation": [
      "Replay a lost response and show one durable receipt or truthful pending state.",
      "Resolve stale edits without discarding either conflicting draft.",
      "Trace one exact revision through all four native views and reject stale baseline packaging."
    ],
    "owner": "Application engineer"
  },
  "architecture": {
    "decision": [
      "Keep the seven existing stages: intake, brief, model, design checks, AWS mapping, engineer review and baseline package.",
      "A customer confirmation applies to an exact brief; engineer review applies to the exact AWS candidate and evidence. Baseline export grants no cloud deployment authority.",
      "Use scoped managed services in one account and Region, with browser/public delivery separate from private data and review authority."
    ],
    "alternatives": [
      "Separate production accounts, multi-Region control planes and automatic CloudFormation execution are outside this case-study baseline.",
      "Manual and optional model-assisted authoring feed the same canonical graph and checks."
    ],
    "risks": [
      "A completion animation can be mistaken for evidence of a working generation service.",
      "Service icons can be read as deployed resources if status is not explicit."
    ],
    "validation": [
      "Walk one idea from its brief through the graph, six-pillar findings, AWS mapping, exact review and export.",
      "Demonstrate that a changed source revision blocks prior approval and that packaging cannot provision cloud resources."
    ],
    "owner": "Architecture owner"
  },
  "decision": {
    "decision": [
      "One canonical model supplies 3D Brain, Concept, ADA and AWS views, preserving node/interface identity and scope.",
      "Choose a single-owner pilot and bounded manual/optional-assist authoring for a case study that can be explained and reviewed."
    ],
    "alternatives": [
      "A full general architecture generator would require its own evaluation and delivery programme.",
      "A small supported graph/template catalogue can establish the baseline without claiming general intelligence."
    ],
    "risks": [
      "Additional visual features consume time without resolving a requirement or evidence gap."
    ],
    "validation": [
      "Stop at an explainable seven-stage design with service rationale, trust boundaries, failure/recovery, six pillars, workload/cost assumptions and truthful evidence labels.",
      "Use the five-minute study sequence in the Evidence review to explain the design and its limitations."
    ],
    "owner": "Architecture owner"
  },
  "failure": {
    "decision": [
      "Fail closed on absent or inconclusive checks, stale revision bindings and revoked review authority.",
      "Preserve the last valid graph/baseline and local drafts when a save, proposal, checker or package job fails."
    ],
    "alternatives": [
      "Silently overwriting a conflicting revision or weakening a requirement to make a check pass is rejected.",
      "Bound retry/repair by current project work limits; uncertain cross-service results require reconciliation."
    ],
    "risks": [
      "A retry mixes artifacts from two candidates.",
      "An older review approves a changed security or cost assumption.",
      "A pending job is presented as a successful export."
    ],
    "validation": [
      "Inject lost-save-response, duplicate-job, concurrent-edit, missing-check and stale-review cases.",
      "Re-read each manifest artifact/version and reviewer binding before publishing the baseline reference.",
      "Record failed/blocked/unconfirmed states with an owner and recovery action."
    ],
    "owner": "Quality engineer"
  },
  "evidence": {
    "decision": [
      "Implemented today: browser models/study views and local drafts; Cloudflare Worker owner authentication, R2 session/settings records and optional encrypted private GitHub connection with SHA-based conflicts.",
      "Authored today: this seven-stage native AWS case study, its service mapping, decisions and validation obligations. AWS migration, prompt-driven generation, cloud IAM/isolation, recovery and load tests remain pending.",
      "CV wording: Built an interactive architecture-modelling prototype with owner authentication, browser drafts and optional private GitHub revision storage; designed a serverless AWS target covering canonical models, deterministic design checks, engineer review and traceable baseline exports across all six Well-Architected pillars."
    ],
    "alternatives": [
      "A published ChatGPT Site proves publication of the study application, not deployment of its proposed AWS workload.",
      "Recorded test obligations are not passed runtime tests."
    ],
    "risks": [
      "A claim lacks its environment, source revision or observed result.",
      "Prototype owner sign-in is misrepresented as deployed multi-customer AWS tenancy."
    ],
    "validation": [
      "Five-minute explanation: 0:00-0:45 customer problem; 0:45-1:45 static/private boundaries and service choices; 1:45-3:00 trace one confirmed brief through model, findings, review and export; 3:00-4:15 explain a stale-save or changed-candidate failure; 4:15-5:00 defend scope, costs and evidence limits.",
      "Keep authored, locally implemented and cloud-validated claims separate. Collect real AWS results only after the corresponding resources and tests exist."
    ],
    "owner": "Independent reviewer"
  },
  "operations": {
    "decision": [
      "Correlated project/revision/job IDs, explicit save states and reproducible deployment."
    ],
    "alternatives": [
      "The current Worker/R2/private GitHub implementation remains a prototype; the proposed AWS mechanisms require their own validation."
    ],
    "risks": [
      "Persistence fails after a local edit or a checker job stops."
    ],
    "validation": [
      "Preserve the draft, show truthful status, trace the job and run an alert/recovery exercise."
    ],
    "owner": "Platform engineer"
  },
  "security": {
    "decision": [
      "Project-aware authorisation, private artifacts, untrusted model output and separate reviewer authority.",
      "For the selected single-owner AWS pilot, enforce current owner/project and designated reviewer authority. General tenancy and organisation membership are deferred capabilities."
    ],
    "alternatives": [
      "The current Worker/R2/private GitHub implementation remains a prototype; the proposed AWS mechanisms require their own validation."
    ],
    "risks": [
      "A user requests another project or a changed candidate inherits old approval."
    ],
    "validation": [
      "Deny wrong-owner/project operations, expired tokens and stale reviews; inspect private-object and IAM policies.",
      "Inspect scoped API, S3 and DynamoDB permissions and try a direct object read, stale reviewer decision and wrong-project reference. Record real cloud outcomes separately from authored checks."
    ],
    "owner": "Solutions architect"
  },
  "reliability": {
    "decision": [
      "Conditional revision writes, stable job identities, valid-model recovery and exact baseline lineage.",
      "Use exact S3 VersionIds/digests, conditional metadata transitions and a documented pending-job/artifact reconciliation path; versioning alone is not immutability."
    ],
    "alternatives": [
      "The current Worker/R2/private GitHub implementation remains a prototype; the proposed AWS mechanisms require their own validation."
    ],
    "risks": [
      "Lost save response, concurrent edit conflict or duplicate modelling job."
    ],
    "validation": [
      "Reconcile the durable receipt; preserve both conflicting drafts; recover the last valid model and block stale packaging."
    ],
    "owner": "Solutions architect"
  },
  "performance": {
    "decision": [
      "Render in browser; bound graph/payload size; keep inference asynchronous.",
      "Proposed graph bounds: 50 components, 100 interfaces and 256 KiB JSON. Pilot planning volume is 100 baseline packages/month; 1,000/month is a 10x sensitivity assumption, not a peak throughput target."
    ],
    "alternatives": [
      "The current Worker/R2/private GitHub implementation remains a prototype; the proposed AWS mechanisms require their own validation."
    ],
    "risks": [
      "Large graphs or slow inference freeze navigation."
    ],
    "validation": [
      "Measure save, interaction and job latency on declared devices and pilot load. Graph limits are test assumptions.",
      "Measure save p95, browser interaction and job completion on declared devices and a separately defined concurrent workload; report model/token limits and throttling. Monthly totals alone do not establish concurrency or latency."
    ],
    "owner": "Solutions architect"
  },
  "cost": {
    "decision": [
      "Illustrative normal-path monthly planning inputs: 100 successful baseline packages; compare 1,000 packages at 10x volume. These are assumptions, not observed usage.",
      "Per package: 20 API requests; 14 Lambda invocations; aggregate Lambda duration 3.5 GB-seconds; 45 Standard state transitions; 20 DynamoDB write request units and 40 read request units after item-size/transaction effects.",
      "Optional inference aggregate: 9,000 input and 2,000 output tokens per package across bounded proposal work; manual authoring uses no proposal tokens. New artifacts: 3 MiB per package before retained-version effects."
    ],
    "alternatives": [
      "Manual authoring and reference-guide lookup avoid proposal inference.",
      "Replace the input assumptions with measured API/compute/read-write/token usage before claiming actual economics."
    ],
    "risks": [
      "Failures, reruns, retained versions, downloads and logs add cost beyond the successful normal path.",
      "Budget alerts do not automatically stop AWS charges."
    ],
    "validation": [
      "At 100 packages: 2,000 API requests; 1,400 Lambda invocations; 350 GB-seconds; 4,500 transitions; 2,000 write units; 4,000 read units; optional 900,000 input/200,000 output tokens; 300 MiB newly generated artifacts. At 1,000 packages multiply these quantities by 10.",
      "Price each measured quantity using dated eu-west-2 rates in AWS Pricing Calculator. Add Cognito users, CloudFront requests/transfer, DynamoDB storage/backups, S3 requests/current and noncurrent retention/transfer, CloudWatch and other applicable charges. New artifact MiB is not a monthly GB-storage charge.",
      "Record region, model/version, currency, request sizes, retention and free-tier eligibility before a monetary total; no live price quotation or actual AWS bill is claimed."
    ],
    "owner": "Workload owner"
  },
  "sustainability": {
    "decision": [
      "Reuse unchanged results, avoid hidden rendering work and expire redundant artifacts."
    ],
    "alternatives": [
      "The current Worker/R2/private GitHub implementation remains a prototype; the proposed AWS mechanisms require their own validation."
    ],
    "risks": [
      "Hidden animation or repeated full regeneration wastes compute."
    ],
    "validation": [
      "Measure idle rendering, transmitted bytes, model calls and reuse per useful reviewed baseline; no emissions claim."
    ],
    "owner": "Platform engineer"
  }
});
  overview.awsAccountLabel='Single workload AWS account (proposed)';
  overview.awsRegionLabel='Europe (London) / eu-west-2';
  overview.sourceNote=SOURCE+'\n\n'+STATE+'\n\nReview boundary: this is an architecture case study. The design records, AWS deployment and measured runtime validation have separate evidence requirements.';
  overview.overview.current=[STATE];overview.presentation.disclosure=STATE;
  overview.overview.workflow=stages.map(item=>({title:`${item.serial}. ${item.name}`,detail:item.summary}));
  overview.overview.failures=[
    'Failed or inconclusive checks return findings to the affected stage; keep the last valid model and baseline.',
    'A changed brief, graph, mapping or required finding invalidates dependent eligibility and exact engineer review.',
    'Baseline packaging does not authorise AWS provisioning or customer workload operation. Optional infrastructure templates remain a separately reviewed future export.',
    'Stop scope expansion when the seven-stage path, service choices, trust/data flows, six pillars, costs and evidence limits can be explained in five minutes.'
  ];
  for(const item of stages){
    item.model.awsAccountLabel='Single workload AWS account (proposed)';
    item.model.awsRegionLabel='Europe (London) / eu-west-2';
    item.model.sourceNote=SOURCE+'\n\n'+STATE;
    item.model.overview.current=[STATE];item.model.presentation.disclosure=STATE;
    if(item.id==='model'){
      const draft=item.model.nodes.find(node=>node.id==='web79-model-draft');
      if(draft){draft.status='Optional bounded Bedrock proposal; manual canonical-model authoring remains supported';draft.aws.status='Optional proposed mapping';}
    }
    if(item.id==='brief'){
      const assistant=item.model.nodes.find(node=>node.id==='web79-brief-assistant');
      if(assistant){assistant.status='Optional bounded Bedrock proposal; manual typed-brief entry remains supported';assistant.aws.status='Optional proposed mapping';}
    }
    if(item.id==='customer'){
      const assets=item.model.nodes.find(node=>node.id==='web79-customer-assets');
      if(assets){assets.aws.notes='Proposed CloudFront OAC with a private S3 REST origin. This origin contains public static application assets only. Private project data and baseline packages use authorised API access and separate private artifact storage.';}
    }
  }
  window.SAWWebsiteProgram={id:'website',title:'System Architecture Workspace',version:'79',overview,stages,sourceNote:SOURCE,current:STATE};
})();
