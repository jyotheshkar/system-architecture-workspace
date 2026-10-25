"""Generate the study model without changing the original architecture graph."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
graph = json.loads((ROOT / 'dist/aws/architecture-data.json').read_text(encoding='utf-8'))['blueprint']
canonical = json.dumps(graph, ensure_ascii=True, sort_keys=True, separators=(',', ':'))
digest = hashlib.sha256(canonical.encode()).hexdigest()

# Each row states an interface-specific condition. Global admission also checks
# message identity, schema, module requirements, current pins and receiver scope.
ROWS = {
'I001': ('intake', 'Identified(sender) AND SchemaValid(requirement)', 'Draft(c) AND NOT Approved(c)', 'A request creates a proposal. It grants no permission to execute.', []),
'I002': ('intake', 'Consistent(c) AND Current(c.version, c.digest)', 'ReviewRequest.subject = (c.id, c.version, c.digest)', 'The stakeholder must see the exact revision being reviewed.', ['I001']),
'I003': ('approval', 'Authorised(approver,c.scope) AND Decision.subject = Current(c)', 'ApprovedCurrent(c)', 'Approval is specific to this contract revision and may later expire or be revoked.', ['I001']),
'I004': ('admission', 'ApprovedCurrent(c) AND PolicyCompatible(c)', 'Run.pin = Current(c) AND P_run = P_approval INTERSECT P_policy', 'Core admits a run with an immutable contract identity and narrowed authority.', ['I003']),
'I005': ('planning', 'RunAdmitted(r) AND ApprovedCurrent(c)', 'PlanningMandate.subject = Run.pin', 'The planner may propose a plan, but cannot dispatch it.', ['I004']),
'I006': ('specialisation', 'PlanPayload.digest = AdmittedPlan.digest AND PlanAdmittedByCore', 'Required(R,policy) SUBSET SelectedPatterns SUBSET EligiblePatterns', 'PIC joins the plan payload with Core admission I065. Receiving the plan alone is insufficient.', ['I064','I065']),
'I007': ('binding', 'Spec.planDigest = AdmittedPlan.digest AND RequiredGuardsBound(spec)', 'EachTaskHasQualifiedCompatiblePinnedBinding OR GapRecorded', 'Required capability, schema and version checks produce bindings or explicit blockers.', ['I006','I065']),
'I008': ('binding', 'Bindings.specDigest = CurrentSpec.digest AND AllRequiredTasksBound', 'ReadyBindingsRecordedByCore', 'Bindings return to Core before any dispatch; the registry cannot start workers.', ['I007']),
'I009': ('execution', 'ApprovedCurrent AND PlanAdmitted AND PICReady AND Bound(t) AND DependenciesCurrent(t) AND ScopeNarrowed(t) AND BudgetAdmitted(t) AND AttemptCurrent(t)', 'Dispatched(t,attempt) AND NOT Accepted(t)', 'Dispatch requires a conjunction of independent guards, not merely an incoming arrow.', ['I008']),
'I010': ('verification', 'Candidate.task = CurrentTask AND Candidate.attempt = CurrentAttempt AND ProvenanceValid', 'CandidateQueuedForVerification AND NOT Accepted(candidate)', 'Completion supplies a candidate and evidence references, never self-acceptance.', ['I009']),
'I011': ('verification', 'Obligations.specDigest = CurrentSpec.digest AND RequiredPatternsSelected', 'TaskVerificationObligations = RequiredInheritedGuardsAndTests', 'PIC supplies obligations. It does not claim that a test passed or perform the runtime guard.', ['I006','I065']),
'I012': ('acceptance', 'CurrentAttributedVerificationDecision AND (Decision = ACCEPT IMPLIES TestsPass AND OwnerAccepted AND Evidence.subjectDigest = H(artifact) AND CurrentContractDependenciesAttempt AND RequiredEffectsResolved)', 'CoreCommitsAcceptedCurrent OR RecordsRejectionWithoutUnlockingDependents', 'The interface carries acceptance or rejection. Acceptance joins independent tests and the exact owner decision; valid rejection can trigger bounded repair.', ['I010','I011']),
'I013': ('integration', 'FOR ALL a IN manifest: CoreCommittedAcceptedCurrent(a)', 'IntegratedCandidate(manifest) AND NOT FinalPass', 'Verification supplies accepted references only after the Core ledger commit I012. Composed output is a new candidate.', ['I012']),
'I014': ('validation', 'ManifestInputsAcceptedCurrent AND Candidate.contractDigest = CurrentContract.digest', 'FinalValidationRequested(H(candidate),manifest)', 'System tests must validate the integrated bytes and composition, not just each component separately.', ['I013']),
'I015': ('validation', 'FOR ALL p IN RequiredPatterns: Bound(p) AND GuardImplemented(p) AND TestPass(p) AND EvidenceCurrent(p)', 'PICConformanceForExactCandidate', 'Pattern conformance joins the candidate supplied by I014. A label or selected pattern cannot satisfy it.', ['I011','I014']),
'I016': ('attestation', 'FinalTestsPass AND PICConformance AND Evidence.subjectDigest = H(integrated) AND ApprovedCurrent AND ManifestCurrent', 'CoreRecordsAttestationForExactIntegratedDigest', 'The final report returns to Core. The validator has no independent release authority.', ['I014','I015']),
'I017': ('release', 'ApprovedCurrent AND OwnersAcceptedCurrent AND FinalPassCurrent AND PICConformanceCurrent AND ReleaseAuthorised(destination,digest)', 'AuthorisedReleaseIntentCommitted(digest,destination,key)', 'The atomic action is the local authority/outbox commit. External delivery cannot be included in that database transaction.', ['I016']),
'I018': ('delivery', 'IntentCommitted AND Payload.digest = Intent.digest AND Destination = Intent.destination AND ReceiptConfirmed', 'DeliveredExactPackage AND NOT AutomaticallyDeployed', 'Send may be repeated only with an idempotent destination or reconciliation. An unknown receipt remains DELIVERY_UNCERTAIN.', ['I017']),
'I019': ('repair', 'RejectedOrFailed(t) AND retries(t) < limit(t) AND CurrentDispatchGuards AND EffectsResolvedOrIdempotent', 'NewBoundedAttempt AND DependentAcceptanceInvalidatedWhenInputsChange', 'An I012 rejection or an attributed execution failure can trigger repair. No successful acceptance is required. Repair consumes remaining limits and repeats admission.', []),
'I020': ('continuity', 'MemoryEnabled AND ApprovedRevisionExact AND AllowedWrite(identity,scope,purpose)', 'ProposedScopedContractWrite', 'A write proposal is not confirmed durable until an acknowledgement or authoritative read-back confirms the exact version. A lost acknowledgement leaves the outcome unknown.', ['I003']),
'I021': ('continuity', 'MemoryEnabled AND Snapshot.revision = CurrentRun.revision AND AllowedWrite', 'ProposedScopedRunSnapshot', 'Capture pins, attempts and evidence references at one consistent control revision.', ['I004']),
'I022': ('continuity', 'MemoryEnabled AND Provenance.taskAttempt = CurrentTaskAttempt AND AllowedWrite', 'ProposedProvenanceWriteWithoutAcceptanceAuthority', 'Worker provenance remains worker evidence; storing it does not make it accepted.', ['I009']),
'I023': ('continuity', 'MemoryEnabled AND EvidenceHasExactSubjectsAndProvenance AND AllowedWrite', 'ProposedVersionedEvidenceIndex', 'The index points to exact reports and artifacts, which have different digests.', ['I010']),
'I024': ('continuity', 'MemoryEnabled AND Request.identityVerified AND OperationPurposeDeclared', 'AllowedScope = IdentityScope INTERSECT ProjectScope INTERSECT PurposeScope', 'This is an authority check request, not an authority grant by the memory controller.', []),
'I025': ('continuity', 'CurrentScopedPermit AND ExpectedStoreRevisionMatches', 'ExactVersionedRead OR DurableAcknowledgement', 'Conditional writes reject stale expected revisions; content retrieval is limited to the permitted set.', ['I024']),
'I026': ('continuity', 'CurrentScopedQuery AND RecordProvenanceValid', 'ReturnedRecords SUBSET AuthorisedRecords', 'The store can return only authorised records. Relevance ranking cannot expand that set.', ['I025']),
'I027': ('continuity', 'MemoryEnabled AND PlannerIdentityKnown AND PurposeBoundToCurrentRun', 'ScopedContextRequest', 'A planning context request must declare why the history is needed.', ['I005']),
'I028': ('continuity', 'Context SUBSET AuthorisedRecords AND SourcesAttached', 'ContextAvailable AND PermissionsAfter = PermissionsBefore', 'Historical advice informs planning; old approvals and acceptance do not become current authority.', ['I026','I027']),
'I029': ('continuity', 'MemoryEnabled AND Snapshot.revision = CurrentRun.revision AND AccessScopeValidated', 'CompleteCheckpointManifest', 'Assemble a consistent manifest of state and referenced immutable objects before commit.', ['I021']),
'I030': ('continuity', 'ControllerScopedPermit AND AllReferencedDigestsExist AND ExpectedRevisionMatches', 'CheckpointCommittedOrFetchedAtExactVersion', 'This direct checkpoint/store relation carries the scope check. It cannot bypass I024 simply because that arrow is absent here.', ['I024','I029']),
'I031': ('continuity', 'CheckpointIntegrityValid AND PinsAvailable AND CurrentAuthorityRevalidated', 'RestoredProposal AND DispatchBlockedUntilAllCurrentGuardsPass', 'Restoration recovers candidate state, never old permission to cause new effects.', ['I030']),
'I032': ('specialisation', 'MemoryEnabled AND ChildRequiresContinuity AND CurrentWorkflowSpec', 'ChildSpecContainsScopedContinuityGuardsAndTests', 'This is a design-time inheritance relation, not a shortcut from Memory to a released workflow.', ['I006','I065']),
'I033': ('learning', 'LearningEnabled AND AuthorisedObservation AND Outcome.originVersionKnown AND ProvenanceValid', 'VersionAttributedObservation', 'A child can report outcomes only when those observations exist; package delivery alone proves no production outcome.', ['I018']),
'I034': ('learning', 'LearningEnabled AND VerificationObservationAuthorised AND SubjectVersionKnown', 'VersionAttributedEngineeringObservation', 'Validation outcomes are engineering evidence and must not be relabelled as production business outcomes.', ['I010']),
'I035': ('learning', 'LearningEnabled AND DatasetProvenanceValid AND HypothesisDeclared', 'CandidateDiffSeparateFromActiveVersion', 'A learning proposal includes a bounded change and a testable hypothesis.', ['I033','I034']),
'I036': ('learning', 'CandidateSeparate AND BaselinePinned AND HeldOutProtocolRegistered', 'EvaluationReportForExactCandidateAndBaseline', 'Evaluation compares pinned versions on disclosed cases, metrics and failure thresholds.', ['I035']),
'I037': ('learning', 'ProtocolCompleted AND LeakageChecksPass AND RequiredCasesReported', 'EvaluationEligibilityRecord AND NOT PromotionAuthority', 'Finite test results support the evaluated distribution. They do not prove all future inputs safe.', ['I036']),
'I038': ('learning', 'AuthorisedChangeApprover AND Approval.subjectDigest = H(candidateVersion) AND ApprovalScopeCurrent', 'ScopedCandidatePromotionApproval', 'A promotion approval is independent from evaluation evidence.', ['I035']),
'I039': ('learning', 'Evaluated(v) AND Conformant(v) AND Authorised(v) AND EvidenceCurrent(v)', 'EligibleFutureVersion(v) AND ActiveRunPinsUnchanged', 'Promotion joins I037 and I038. Either input alone is insufficient.', ['I037','I038']),
'I040': ('learning', 'NewRun(r) AND Eligible(versionSet) AND NoDispatchYet(r)', 'ImmutablePin(r) = ExactVersionSet', 'Future defaults are resolved once. Active runs never follow a moving default.', ['I039']),
'I041': ('learning', 'VersionAttributedRegression AND PriorEligibleVersionIdentified', 'RollbackProposal AND NOT ChangedDefault', 'A regression report is a trigger for review or a previously authorised policy, not a free-standing permission.', ['I033','I034']),
'I042': ('learning', 'AuthorisedRollbackScope AND ExactTargetVersionOrBoundedPolicy', 'CurrentRollbackAuthority', 'A standing rollback policy must define its target eligibility and permitted conditions.', []),
'I043': ('learning', 'RegressionOrPolicyTriggerValid AND RollbackAuthorised AND PriorVersionStillEligible', 'FutureDefaultChanged AND ActiveRunPinsUnchanged', 'Rollback changes a selection default; it does not rewrite history or silently retarget in-flight runs.', ['I041','I042']),
'I044': ('tools', 'ToolsEnabled AND MissingQualifiedBinding(task)', 'CapabilityGapRecorded AND AffectedDispatchBlocked', 'An unavailable capability is a visible design blocker.', ['I007']),
'I045': ('tools', 'CapabilityRequirementReviewed AND EffectSchemaAndScopeDeclared', 'AdapterQualificationRequested', 'Onboarding creates a qualification request, not credentials or unconstrained provisioning.', ['I044']),
'I046': ('tools', 'QualificationCurrent AND RequiredSchemaCompatible AND VersionImmutable', 'EligibleBindingReturnedToRegistry', 'A qualified adapter still requires fresh permission for each effect.', ['I045']),
'I047': ('effect', 'ToolsEnabled AND CurrentDispatchedAttempt AND EffectMatchesTaskIntent', 'EffectAdmissionRequest', 'Execution requests authority for one specific external action.', ['I009']),
'I048': ('effect', 'P_effect = P_run INTERSECT P_task INTERSECT P_adapter INTERSECT P_resource AND SchemaValid AND BudgetReserved AND FenceCurrent', 'OneScopedEffectPermit', 'Every effect path must enforce the current narrowed permit; alternate direct credentials invalidate this safety argument.', ['I047']),
'I049': ('effect', 'InvocationIdentityKnown AND ReceiptOrObservedStateAvailable', 'PostconditionChecked OR EffectUncertain', 'A timeout is uncertainty. The validator examines actual target state before any retry.', ['I048']),
'I050': ('effect', 'EffectEvidence.subject = ExactInvocation AND ObservationProvenanceValid', 'ResolvedEffectAttestation OR AcceptanceBlocker', 'Every required external effect must be resolved before task acceptance.', ['I049']),
'I051': ('recovery', 'RecoveryEnabled AND NonCapacityDispatchGuards AND spent + reserved + requested <= budget', 'AtomicReservation OR QueueOrReject', 'Concurrent work needs one authoritative budget admission point.', ['I008']),
'I052': ('recovery', 'ReservationCurrent AND TaskAttemptCurrent', 'LeaseIssuedWithMonotonicFence', 'A worker lease identifies an attempt and expires. It grants no acceptance authority.', ['I051']),
'I053': ('recovery', 'Lease.taskAttempt = CurrentAttempt AND LeaseNotExpired AND ReservationCurrent', 'CoreRecordsCurrentDispatchFence', 'The receiver must reject old tokens. A lease by itself cannot stop an external stale worker.', ['I052']),
'I054': ('recovery', 'FailureOrTimeoutRecorded AND AttemptIdentityKnown', 'RepairReconcileOrStopProposal', 'Classify whether retry is safe before consuming another attempt.', ['I009']),
'I055': ('recovery', 'RetriesRemaining AND BudgetRemaining AND UnknownEffectsNotBlindlyRepeated', 'BoundedRecoveryDecisionForCoreRecheck', 'Core still rechecks I009 guards before redispatch; exhaustion is a terminal or escalated result.', ['I054']),
'I056': ('recovery', 'TelemetryPolicyAllows AND RunAttemptVersionAttributed', 'OperationalMeasurementOrExplicitGap', 'Telemetry records observations; missing measurements must remain missing.', ['I004']),
'I057': ('recovery', 'MeasurementScopeKnown AND WindowFresh AND ApprovedCapacityPolicy', 'CapacityEstimateForAdmission', 'Measured utilisation informs limits. Lambda < c*mu is only a queue stability condition under the stated simple model.', ['I056']),
'I058': ('specialists', 'SpecialistsEnabled AND DomainCapabilityQualified AND AdvisoryScopeDelegated', 'DomainAdviceRequested', 'Requesting domain analysis does not already mean its advice was reviewed or accepted.', ['I005']),
'I059': ('specialists', 'Advice.subject = CurrentQuestion AND ProvenanceValid', 'ReviewableDomainAdvice AND ContractAuthorityUnchanged', 'Binding new constraints requires normal contract or admitted plan revision.', ['I058']),
'I060': ('specialists', 'SpecialistsEnabled AND CurrentDispatch AND QualifiedConstructor AND ScopeNarrowed', 'BoundedConstructionSubtaskDelegated', 'Many workers may assist, but one accountable owner remains for the task.', ['I009']),
'I061': ('specialists', 'Candidate.subject = DelegatedTask AND CurrentAttempt AND ProvenanceValid', 'CandidateReturned AND NOT Accepted', 'The specialist returns an artifact, not its own permission to pass.', ['I060']),
'I062': ('specialists', 'SpecialistsEnabled AND CurrentCandidateDigest AND QualifiedIndependentAssurer', 'RiskScopedAssuranceRequested', 'The request fixes the candidate and test brief before independent checking.', ['I010']),
'I063': ('specialists', 'Findings.subjectDigest = H(candidate) AND ReproducibleEvidence AND IndependencePolicyMet', 'AssuranceEvidenceAvailableToVerifier', 'The verifier joins findings with all other acceptance evidence; findings alone cannot release.', ['I062']),
'I064': ('planning', 'Proposal.contractDigest = CurrentContract.digest AND Acyclic(tasks) AND ExactlyOneOwnerPerTask AND RequiredCoverage', 'CoreRecordsAdmittedPlanDigest', 'The acyclic condition applies to task dependencies. The architectural interaction graph intentionally has cycles.', ['I005']),
'I065': ('specialisation', 'PlanDigest = CoreAdmittedPlan.digest AND ApprovedCurrent', 'PICMaySpecialiseOnlyThisPlanDigest', 'Core admission is a separate required input to PIC; this makes the authority join explicit.', ['I064']),
'I066': ('verification', 'AuthenticatedOwner = CurrentTask.owner AND Decision.subjectDigest = H(candidate) AND Decision.contractDigest = CurrentContract.digest', 'OwnerAttestationForExactTaskAndCandidate', 'The worker cannot manufacture the independent owner decision. The decision must be current and authenticated.', ['I010']),
'I067': ('learning', 'LearningEnabled AND MemoryEnabled AND ScopedWriteAllowed AND VersionImmutable', 'ProposedDurableVersionHistory', 'Persist exact evaluated version metadata only when both optional modules are enabled.', ['I039']),
'I068': ('learning', 'LearningEnabled AND MemoryEnabled AND RecordsAuthorised AND PromotionProvenanceValid AND CurrentEligibilityRechecked', 'RestoredEligibleVersionMetadata', 'Restored eligibility is rechecked before selecting a future run; old promotion text cannot authorise itself.', ['I026','I067']),
}

RELATIONS = {
'DATA': {'meaning':'A value, request or artifact reference is transferred.', 'authority':'No permission follows from receiving data.'},
'CONTROL': {'meaning':'A scoped operation is requested or scheduled.', 'authority':'The receiver rechecks current admission.'},
'AUTHORITY': {'meaning':'An authority decision is requested, supplied or narrowed.', 'authority':'Request edges such as I047 do not grant a permit; decisions bind exact scope and subject.'},
'PATTERN': {'meaning':'Design-time constraints, inherited guards or conformance obligations are supplied.', 'authority':'This is a specification relation, never an executable release shortcut.'},
'CAPABILITY': {'meaning':'A capability is requested, qualified or bound.', 'authority':'Availability and suitability do not authorise use.'},
'EVIDENCE': {'meaning':'A result or observation is supplied for independent checking.', 'authority':'Evidence does not grant authority; its subject, provenance and freshness must be checked.'},
'STATE': {'meaning':'A record, checkpoint or proposal crosses a controlled state boundary.', 'authority':'Only the responsible controller commits the corresponding trusted state.'},
'REPAIR': {'meaning':'A bounded repair or recovery decision is proposed or admitted.', 'authority':'Retries preserve current scope, budget and guard requirements.'},
}

invariants = [
('INV-01','Exact current approval','ApprovedCurrent(c) := subject(approval) = (c.id,c.version,H(c)) AND Authorised(approver,c.scope) AND NOT revoked AND now < expiry','A changed contract, revoked approver or expired decision blocks new work. The hash assumes canonical bytes and a collision-resistant digest.'),
('INV-02','No widening of authority','P_child SUBSET P_task SUBSET P_run; P_effect = P_run INTERSECT P_task INTERSECT P_adapter INTERSECT P_resource','Application permissions only narrow along delegation. All effect paths must enforce the rule. This equation does not replace full AWS IAM evaluation.'),
('INV-03','Owned task dependency DAG','Acyclic(D) AND FOR ALL t: count(owners(t)) = 1; Ready(t) := FOR ALL d IN deps(t): AcceptedCurrent(d)','The interaction graph can contain feedback. The task dependency graph cannot contain a cycle or an unowned task.'),
('INV-04','Correct evidence subjects','Evidence.subjectDigest = H(artifact); Evidence.reportDigest = H(report); subject(report) = artifact','The artifact digest is compared with the subject recorded in evidence. The report digest is a different value because the report and artifact contain different bytes.'),
('INV-05','Current acceptance','AcceptedCurrent(t) := CoreCommitted AND ownerAccepted AND testsPass AND exactArtifactContractDependenciesAttempt AND requiredEffectsResolved','A passed test, completed worker or signed report alone cannot unlock dependent work. Revocation and replacement invalidate dependent current acceptance.'),
('INV-06','Inherited conformance','FOR ALL p IN Required(R,policy): selected(p) AND componentBound(p) AND enforcingGuard(p) AND positiveNegativeTests(p) AND currentEvidence(p)','PIC supplies a trace from required pattern to implemented guard to tests and exact evidence. A trace documents an obligation; the implementation must enforce it.'),
('INV-07','Atomic budget and current attempt','spent + SUM(reserved) + requested <= budget; CommitAllowed := suppliedFence = currentFence AND leaseValid','Serial or transactional admission is required under concurrency. Downstream effects also need fencing, idempotency or reconciliation.'),
('INV-08','Exact authorised release','ReleaseIntentCommitted => ApprovedCurrent AND OwnersAcceptedCurrent AND FinalPassCurrent AND PICConformanceCurrent AND EvidenceCurrent AND ReleaseAuthorised(digest,destination)','Release authorisation is an atomic local intent/outbox commit. External delivery succeeds only when the exact destination receipt is confirmed.'),
('INV-09','Delivery is separate from deployment','Delivered => IntentCommitted AND receipt.digest = intent.digest AND receipt.destination = intent.destination AND ReceiptConfirmed','A delivered MOA package is not a running production service. Its deployment and operational effects need their own authority and tests.'),
('INV-10','Immutable active version pins','Active(r) => pin(r,next) = pin(r,now)','Learning and rollback select defaults for future runs. An explicit suspend and new run is needed to adopt another version.'),
('INV-11','Scoped optional modules','Enabled(e,M) := requirements(e) SUBSET M','All optional module configurations preserve endpoints. Memory and learning joint edges require both. Hiding a layer in a viewer is not disabling a deployed service.'),
('INV-12','Safety and progress are different','Initial(S) => Inv(S); Inv(S) AND Pre_e AND Guard_e AND CorrectImplementation(T_e) => Inv(T_e(S))','This is an induction obligation. Successful completion additionally assumes finite work, terminating attempts or enforced timeouts, fair scheduling, bounded repair and reachable dependencies.'),
]

stages = [
('intake','Define a reviewable requirement',['I001','I002'],'The exact requirement becomes a draft contract.'),
('approval','Approve the exact contract',['I003'],'Identity, revision, digest, scope and expiry are checked together.'),
('admission','Admit the run',['I004','I005'],'Core pins the contract and asks for a plan.'),
('planning','Validate and admit the task plan',['I064','I065'],'Core checks the task DAG and returns explicit permission to PIC.'),
('specialisation','Bind inherited safeguards',['I006','I011','I015'],'The plan payload and Core admission join at PIC.'),
('binding','Return qualified bindings to Core',['I007','I008'],'A usable capability is still not permission to dispatch.'),
('execution','Dispatch bounded tasks',['I009'],'Current dependencies, scope, budget, bindings and attempt must all agree.'),
('acceptance','Join evidence and owner acceptance',['I010','I011','I066','I012'],'Core commits the accepted artifact only after all required evidence is current.'),
('integration','Compose a new system candidate',['I013','I014'],'All referenced pieces are accepted, but their composition still needs system tests.'),
('attestation','Validate the complete candidate',['I015','I016'],'Final tests and PIC evidence return to Core for the exact integrated digest.'),
('release','Commit exact release authority',['I017'],'Core commits authorised intent for one digest and destination.'),
('delivery','Confirm the MOA handoff',['I018'],'A confirmed receipt completes delivery; child deployment remains separate.'),
]

contracts = {}
for edge in graph['edges']:
    phase, formula, post, explanation, prior = ROWS[edge['id']]
    # Source alternatives: observations can come from either stream, and existing
    # eligible version registries need not be newly promoted during this run.
    mode = 'any' if edge['id'] in ['I035','I041'] else 'all'
    contracts[edge['id']] = {
        'id':edge['id'],'source':edge['source'],'target':edge['target'],
        'type':edge['type'],'name':edge['name'],'phase':phase,
        'formula':formula,'guard':formula,'postcondition':post,
        'explanation':explanation,'payload':edge['payload'],
        'failure':('Missing durable acknowledgement leaves persistence unconfirmed; reconcile the exact operation and version before retrying.' if edge['id'] in ['I020','I021','I022','I023','I067'] else edge['failure']),'requirements':edge['requires'],
        'prerequisites':prior,'prerequisiteMode':mode,
        'prerequisiteMeaning':'Evidence or state dependency, not a demand to replay this edge in every run.',
        'evidence':'Record sender identity, run/task and subject version, exact subject digest, schema version, receiver guard decision and resulting record revision.',
    }

nodeStudies = {}
for n in graph['nodes']:
    incoming = [e['id'] for e in graph['edges'] if e['target']==n['id']]
    outgoing = [e['id'] for e in graph['edges'] if e['source']==n['id']]
    rule = n['rule']
    responsibility = n['responsibility']
    if n['id']=='verify':
        rule = 'AcceptedCurrent(t) := CoreCommitted AND ownerAccepted AND testsPass AND evidence.subjectDigest = H(artifact) AND contractAndDependenciesCurrent AND requiredEffectsResolved.'
    if n['id']=='release':
        rule = 'AuthorisedIntentCommitted precedes external delivery; Delivered requires the exact digest/destination receipt. Cross-system delivery is not one atomic database transaction.'
        responsibility = 'Atomically record authority and release intent for the exact attested package, then deliver with idempotency and receipt reconciliation.'
    nodeStudies[n['id']] = {'id':n['id'],'name':n['name'],'responsibility':responsibility,'formula':rule,'authority':n['authority'],'incoming':incoming,'outgoing':outgoing,'studyQuestion':'Which exact input and guard must be satisfied before this capability can change trusted state or pass work onward?'}

data = {
    'version':'1.0.0','status':'Scoped executable study model; proposed architecture, not a verified cloud implementation',
    'source':{'path':'dist/aws/architecture-data.json#blueprint','nodeCount':len(graph['nodes']),'edgeCount':len(graph['edges']),'canonicalSha256':digest,'canonicalization':'UTF-8 JSON; sorted keys; no whitespace; ASCII-escaped strings'},
    'overview':'An arrow is a typed interface with conditions. A workflow is a sequence of admitted state transitions. At joins, every required independent input must agree on exact subject, revision and authority.',
    'model':'G=(V,E,type). T=(S,Events,Guard,Next). An edge explains an interface; only an implemented guarded transition changes trusted runtime state.',
    'globalGuard':'Enabled(e,M) AND SenderVerified AND SchemaValid AND SubjectPinsCurrent AND ReceiverScopeAllows AND Pre_e',
    'symbols':[
        {'symbol':'H(x)','meaning':'Digest of the exact canonical bytes of x; integrity checks must verify the bytes.'},
        {'symbol':'S','meaning':'Authoritative state at a specified revision.'},
        {'symbol':'D','meaning':'Task dependency DAG, separate from the cyclic architecture interaction graph.'},
        {'symbol':'P','meaning':'Set of actions permitted by an application scope.'},
        {'symbol':'AND','meaning':'Every condition is required; this is a join, not a choice of arrows.'},
        {'symbol':'SUBSET','meaning':'Every item on the left belongs to the right; delegation cannot add privileges.'},
        {'symbol':'INTERSECT','meaning':'Keep only actions permitted by every participating scope.'},
        {'symbol':'Current','meaning':'Still matches the authoritative revision, digest, dependencies, attempt and revocation state at the decision point.'},
    ],
    'relationTypes':RELATIONS,'invariants':[{'id':i,'title':t,'formula':f,'explanation':x} for i,t,f,x in invariants],
    'stages':[{'id':i,'title':t,'edges':e,'explanation':x} for i,t,e,x in stages],
    'edgeContracts':contracts,'nodeStudies':nodeStudies,
    'workedTrace':[
        {'step':1,'edges':['I001','I003','I004'],'example':'A user approves contract c1, revision 1, digest contract-A. Core pins exactly that contract.'},
        {'step':2,'edges':['I005','I064','I065','I006'],'example':'Planner proposes tasks design then package. Each has one owner. Core checks the dependency DAG and admits plan-A before PIC specialises it.'},
        {'step':3,'edges':['I007','I008','I009'],'example':'Pinned qualified bindings return to Core. The first task has no dependencies; dispatch also checks narrowed permissions and remaining budget.'},
        {'step':4,'edges':['I010','I011','I066','I012'],'example':'Artifact-A is produced. Report-R has its own report digest and names artifact-A as its subject. Independent tests and the authorised owner accept that same artifact before Core commits acceptance.'},
        {'step':5,'edges':['I009','I010','I066','I012','I013','I014'],'example':'The dependent task can now run using the exact accepted input. Integration references accepted components and produces a different system digest, package-A.'},
        {'step':6,'edges':['I015','I016','I017'],'example':'System tests and inherited guard evidence attest package-A. Core rechecks current approval and commits release intent for package-A to destination D.'},
        {'step':7,'edges':['I018'],'example':'A receipt confirming package-A at D marks delivery. A timeout leaves delivery uncertain until reconciliation. No AWS production deployment is implied.'},
    ],
    'fixes':[
        {'id':'digest-subject','nodes':['verify'],'edges':['I010','I012','I016'],'issue':'The original shorthand evidenceDigest = artifactDigest conflates a report digest with the subject it describes.','correction':'Compare evidence.subjectDigest with H(artifact); independently verify evidence.reportDigest = H(report).'},
        {'id':'core-mediated-route','nodes':['cap','core','exec','final','release'],'edges':['I008','I009','I016','I017'],'issue':'The original ordered node overview is not a literal message path. cap -> exec and final -> release are not source interfaces.','correction':'The lifecycle explicitly returns through Core for bindings, acceptance, final attestation and release authority.'},
        {'id':'release-atomicity','nodes':['release','workflow'],'edges':['I017','I018'],'issue':'Atomically hand off is too strong across a local ledger and an external destination.','correction':'Commit authorised intent locally; deliver with idempotency/reconciliation; mark delivered only after confirmed exact receipt.'},
        {'id':'pattern-shortcut','nodes':['mem','workflow'],'edges':['I032'],'issue':'Untyped reachability finds a short Memory -> MOA route that can be misread as release.','correction':'PATTERN edges add design obligations; they cannot set delivered or bypass I017/I018.'},
        {'id':'joins','nodes':['pic','verify','final','promote','rollback'],'edges':['I006','I065','I010','I011','I066','I014','I015','I037','I038','I041','I042'],'issue':'Following one incoming connection can visually obscure required independent inputs.','correction':'Explain AND joins explicitly: admitted plan plus payload; candidate plus tests plus owner; evaluation plus promotion authority.'},
        {'id':'specialist-postconditions','nodes':['domain','construct','assure'],'edges':['I058','I060','I062'],'issue':'A generic specialist request postcondition implies reviewed work was already incorporated.','correction':'Requests create a delegated brief. Only a later validated response is incorporated under the original authority.'},
    ],
    'limitations':[
        'The executable checks cover a finite, explicit study abstraction. They do not prove the website, generated code, IAM, network, workers or an AWS deployment implements the rules.',
        'Boolean inputs such as independent tests, authenticated authority and PIC guard enforcement represent external facts. The study model cannot establish those facts by itself.',
        'Hashes identify exact subjects only when the actual bytes are verified and the hash/canonicalisation assumptions hold. A copied string is not cryptographic verification.',
        'Safety forbids bad transitions. It cannot guarantee every requirement is feasible, every model answer correct, or every run will finish successfully.',
        'The contract scope, all effect paths, transaction boundaries, revocation commit point, timeout policy, scheduler fairness and destination reconciliation need implementation and adversarial tests.',
        'Learning conclusions apply to evaluated cases and assumptions. Queue equations do not establish throughput or latency without measured workload and capacity.',
    ],
}

runtime = (ROOT/'tools/formal-model-runtime.txt').read_text(encoding='utf-8')
text = '/* Generated by tools/build-formal-model.py. No runtime cloud claims. */\n(function(root){\n"use strict";\nconst model = '+json.dumps(data,ensure_ascii=True,separators=(',',':'))+';\n'+runtime+'\nroot.AC_FORMAL = Object.freeze(model);\n})(globalThis);\n'
(ROOT/'dist/assets/formal-model.js').write_text(text,encoding='utf-8')
doc = [
    '# Mathematical connection audit: User to MOA Workflow',
    '',
    '**Proposed reference architecture. This is a scoped logical model and a finite executable study, not a proof of an implemented AWS system.**',
    '',
    '## What was audited',
    '',
    f'The current blueprint contains {len(graph["nodes"])} capabilities and {len(graph["edges"])} typed interfaces. The same graph is embedded in `dist/index.html` as `#architecture` and in `dist/aws/architecture-data.json` as `blueprint`. Existing node and interface IDs are preserved. Canonical source digest: `{digest}`.',
    '',
    'The audit uses the original graph, its input/output and authority contracts, and the existing `Solutions-Architect-Study-Guide.md`, `Connection-Register.md` and `Architecture-to-AWS-Mapping.md`. The mathematical definitions below are a new explicit model of those responsibilities. They do not assert that the proposed runtime has been implemented.',
    '',
    '## The logical solution',
    '',
    'Model the architecture as a typed directed multigraph `G = (V, E, type)`. Model execution separately as a guarded state machine `T = (S, Events, Guard, Next)`. These are different objects. The architecture has approval, verification, repair and learning feedback cycles. A particular task plan must be an owned dependency DAG.',
    '',
    'For an interface `e = (u, v)`, the receiver must establish `Enabled(e, M) AND SenderVerified AND SchemaValid AND SubjectPinsCurrent AND ReceiverScopeAllows AND Pre_e`. A successful receive has the stated postcondition. Receiving data, evidence, a pattern, or a capability does not itself confer permission.',
    '',
    'The safety obligation is `Initial(S) => Inv(S)` and `Inv(S) AND Pre_e(S,m) AND Guard_e(S,m) AND CorrectImplementation(T_e) => Inv(T_e(S,m))`. If every implemented transition preserves every relevant invariant, induction preserves those invariants over admitted finite traces. The current deliverable provides the obligations and a bounded executable abstraction. It does not discharge every implementation proof obligation.',
    '',
    'At a join, all required inputs must refer to the same exact subject and current revision. PIC requires both the plan payload and Core admission. Acceptance requires candidate provenance, independent tests, owner acceptance, current dependencies and resolved required effects. Promotion requires evaluation and independent change authority.',
    '',
    'Safety and progress must be assessed separately. Finite tasks, terminating attempts or enforced timeouts, bounded retries, a fair scheduler, available dependencies, and effect reconciliation can support eventual completion or explicit stop. They cannot guarantee business success for arbitrary requirements.',
    '',
    '## Exact engineering sequence',
    '',
]
for index, stage in enumerate(data['stages'], 1):
    doc.append(f'{index}. **{stage["title"]}** ({", ".join(stage["edges"])}). {stage["explanation"]}')
doc += ['', 'Core returns are intentional. `cap -> exec` and `final -> release` are not direct source interfaces: I008/I009 and I016/I017 mediate them through Core. The ordered source node list is an overview, not an executable edge sequence.', '', '## Invariants and assumptions', '']
for inv in data['invariants']:
    doc += [f'### {inv["id"]}: {inv["title"]}', '', f'`{inv["formula"]}`', '', inv['explanation'], '']
doc += ['## Corrections and clarified joins', '']
for fix in data['fixes']:
    doc += [f'### {fix["id"]}', '', f'Interfaces: {", ".join(fix["edges"])}.', '', fix['issue'], '', fix['correction'], '']
doc += [
    'The I012 interface carries either an accepted or rejected current verification decision. A rejection or attributed task failure can trigger I019 bounded repair; a successful acceptance is not a prerequisite for repair. The positive acceptance guard in the demonstration intentionally evaluates only the accept branch.',
    '',
    '## Worked example',
    '',
]
for step in data['workedTrace']:
    doc.append(f'{step["step"]}. {step["example"]} Interfaces: {", ".join(step["edges"])}.')
doc += [
    '', '## Executable scope and evidence', '',
    'The browser study object is `globalThis.AC_FORMAL`. It exposes `evaluateGate(stage, state)`, `validatePlan(tasks)`, `sampleState()`, `scenarioState(id)` and `runEvent(state, event)`. It has no cloud or DOM dependencies and does not change application or AWS state.', '',
    'The example uses symbolic digest identifiers such as `artifact-A`; hash comparisons check relationships. Byte integrity, authenticated authority, independent tests, PIC guard enforcement, authoritative completeness requirements and atomic admission are supplied external facts. The implementation would have to establish these facts.', '',
    '`runEvent` is a finite teaching trace with pre-supplied candidate/evidence snapshots. It enforces ordered gate traversal and denies skipped stages. It does not implement all asynchronous messages, optional module runtime behaviour, retries, revocation races or delivery reconciliation.', '',
    'Run `python tools/build-formal-model.py` then `node tools/test-formal-model.mjs`. The executable result is written to `dist/aws/Mathematical-Connection-Checks.json`, with a digest of the exact tested JavaScript. Checks cover all 68 source contracts, all 35 node studies, all 32 optional module combinations, all 128 combinations of seven selected release conditions, exact artifact/report/owner subjects, task DAG failures and ordered trace failures.', '',
    'The model rejects changed contracts, expired/revoked approvals, cyclic/unowned plans, missing patterns, unqualified bindings, stale dependencies, budget overrun, stale worker attempts, mismatched candidate reports, missing owner acceptance, unresolved effects, missing Core commits, incomplete manifests, changed final packages, absent release authority, uncertain receipts and incorrect destinations. A report digest distinct from its artifact digest is explicitly accepted when its subject is correct.', '',
    '## Complete interface obligations', '',
    'Prerequisite interface IDs below identify evidence or state dependencies. They are not requirements to replay an earlier network message every time. The observation inputs for I035 and I041 are alternatives. Existing eligible version state may have been established before the current run.', '',
]
for edge in graph['edges']:
    c = contracts[edge['id']]
    doc += [f'### {c["id"]}: {c["name"]}', '', f'`{c["source"]} -> {c["target"]}`; type `{c["type"]}`; phase `{c["phase"]}`; modules: {", ".join(c["requirements"]) or "Core"}.', '', f'Guard: `{c["formula"]}`.', '', f'Postcondition: `{c["postcondition"]}`.', '', c['explanation'], '', f'Failure handling: {c["failure"]}', '']
doc += ['## Remaining implementation obligations', '']
doc += ['- ' + limit for limit in data['limitations']]
doc += ['', 'All 68 interfaces now have explicit proposed logical conditions. This establishes a consistent study contract for their intended roles. Successful source coverage and finite negative cases are evidence for this model only; they do not establish universal correctness, a deployed enforcement boundary or empirical product performance.', '']
(ROOT/'dist/aws/Mathematical-Connection-Audit.md').write_text('\n'.join(doc),encoding='utf-8')
print(f'Generated {len(contracts)} exact edge contracts and {len(nodeStudies)} node studies; source {digest}.')
