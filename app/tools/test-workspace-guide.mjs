import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({window: {}});
vm.runInContext(fs.readFileSync(new URL('../dist/assets/workspace-guide.js', import.meta.url), 'utf8'), context);
vm.runInContext(fs.readFileSync(new URL('../dist/assets/aws-learning.js', import.meta.url), 'utf8'), context);
vm.runInContext(fs.readFileSync(new URL('../dist/assets/website-architecture.js', import.meta.url), 'utf8'), context);
const answer = context.window.SAWGuide.answer;
const website = context.window.SAWWebsiteData;
const websiteBase = {graph: website, page: {id: website.id, coreVersion: 'system-architecture-workspace-v1', name: website.title, sections: []}};
const graph = JSON.parse(fs.readFileSync(new URL('../dist/aws/architecture-data.json', import.meta.url), 'utf8')).blueprint;
const base = {graph, aws: context.window.AWS_LEARNING};
const prose = response => response.paragraphs.join('\n');
let checks = 0;
function check(name, body) { body(); checks += 1; console.log(`PASS ${name}`); }

check('selected node uses recorded fields and valid navigation', () => {
  const response = answer('explain this node', {...base, selectedNode: 'contract'});
  assert.match(prose(response), /Requirements & Contract Engine/);
  assert.match(prose(response), /ApprovedCurrent/);
  assert.equal(response.actions.find(action => action.type === 'node').id, 'contract');
});
check('no selected node does not invent one', () => assert.match(prose(answer('explain this node', base)), /Select a node/));
check('named connections cite actual directed interface identifiers', () => {
  const response = answer('connections from User', base);
  assert.match(prose(response), /I001: User \/ Business Requirement → Requirements & Contract Engine/);
  assert.match(prose(response), /I003/);
  assert.doesNotMatch(prose(response), /I018/);
});
check('references stay within a supplied partial graph', () => {
  const response = answer('connections from User', {graph: {nodes: graph.nodes.filter(node => node.id === 'user'), edges: graph.edges}});
  assert.match(prose(response), /No incoming or outgoing edge/);
  assert.doesNotMatch(prose(response), /Requirements & Contract Engine/);
});
check('AWS mapping is source-based and retains caveats', () => {
  const response = answer('AWS for User', base);
  assert.match(prose(response), /Amazon Cognito/);
  assert.match(prose(response), /https:\/\/docs\.aws\.amazon\.com/);
  assert.match(prose(response), /proposed mapping/);
});
check('missing AWS entry does not invent a service', () => {
  const response = answer('AWS for User', {graph, aws: {}});
  assert.match(prose(response), /no AWS learning entry/);
  assert.doesNotMatch(prose(response), /Amazon Cognito/);
});
check('workflow cites actual gates and does not claim runtime proof', () => {
  const response = answer('user to MOA workflow', base);
  assert.match(prose(response), /I017/);
  assert.match(prose(response), /Release Controller/);
  assert.match(prose(response), /do not prove runtime correctness/);
});
check('page review identifies missing fields and invalid anchors', () => {
  const response = answer('review my page', {...base, page: {name: 'My architecture', sections: [{name: 'Payments', purpose: 'Take orders', inputs: '', outputs: 'Receipt', acceptance: '', anchor: 'missing-node'}]}});
  assert.match(prose(response), /missing inputs, acceptance criteria/);
  assert.match(prose(response), /anchor is not a node/);
  assert.match(prose(response), /not architectural validation/);
});
check('named custom section returns saved content without markup construction', () => {
  const response = answer('Explain payment boundary', {...base, page: {name: 'My architecture', sections: [{name: 'Payment boundary', purpose: '<script>untrusted text</script>', inputs: 'Order', outputs: 'Receipt', acceptance: 'Receipt verified', anchor: 'core'}]}});
  assert.equal(response.paragraphs[1], 'Purpose: <script>untrusted text</script>');
  assert.equal(response.actions.find(action => action.type === 'node').id, 'core');
  assert.equal(typeof response.html, 'undefined');
});
check('unsupported request states limitations and does not masquerade as AI', () => assert.match(prose(answer('Write a pancake recipe', base)), /not a general-purpose AI chat/));
check('every response contains plain strings and bounded typed actions', () => {
  for (const question of ['', 'how do I add a section?', 'AWS', 'algorithm', 'connections from Core Control']) {
    const response = answer(question, base);
    assert(response.paragraphs.every(paragraph => typeof paragraph === 'string'));
    assert(response.actions.length <= 8);
    assert(response.actions.every(action => ['node', 'study', 'pages'].includes(action.type) && typeof action.id === 'string'));
  }
});
check('removed section settings are not advertised while page creation stays in Pages', () => {
  const section = answer('how do I add a section?', base);
  assert.match(prose(section), /does not provide a section editor/);
  assert.doesNotMatch(prose(section), /Page settings/);
  assert.equal(section.actions[0].id, 'pages');
  assert.equal(section.actions[0].label, 'Open Pages');
  assert.equal(answer('create a page', base).actions[0].id, 'pages');
});
check('website workflow explains all seven journey stages while distinguishing prototype from the proposal', () => {
  const response = answer('Explain the website request to result workflow', websiteBase);
  const explanation = prose(response);
  const stages = ['1. User and product owner', '2. Idea and requirements brief', '3. Editable 3D system model', '4. Schema checks and design findings', '5. AWS architecture synthesis', '6. AWS engineer review', '7. Reviewed AWS baseline package'];
  let previous = -1;
  for (const stage of stages) { const position = explanation.indexOf(stage); assert(position > previous, `Journey stage missing or out of order: ${stage}`); previous = position; }
  assert.match(explanation, /working prototype provides sign-in, selectable pages, (?:an )?interactive 3D (?:reference models|model)/);
  assert.match(explanation, /website runs on a Worker, not on the proposed AWS stack/);
  assert.match(explanation, /manually authored system design/);
  assert.match(explanation, /without a mathematical-proof claim/);
  assert.match(explanation, /future prompt-to-design assistant/);
  assert.match(explanation, /guide reads saved references; it does not generate architectures/);
  assert.doesNotMatch(prose(response), /Requirements & Contract Engine|I017|MOA Workflow/);
  assert(response.actions.filter(action => action.type === 'node').every(action => action.id.startsWith('web-')));
});
check('website AWS answers adapt embedded node mappings without an external AWS map', () => {
  const response = answer('AWS for 3D design', websiteBase);
  assert.match(prose(response), /Browser 3D workspace/);
  assert.match(prose(response), /Browser graphics are not an AWS service/);
  assert.match(prose(response), /https:\/\/docs\.aws\.amazon\.com\/wellarchitected/);
  assert.equal(response.actions.find(action => action.type === 'node').id, 'web-canvas');
});
check('website component answer preserves future status and selected-node context', () => {
  const response = answer('explain this node', {...websiteBase, selectedNode: 'web-ai'});
  assert.match(prose(response), /Recorded status: Product direction/);
  assert.match(prose(response), /current guide only looks up recorded architecture information/);
  assert.match(prose(response), /no live generative model connection/);
  assert.equal(response.actions.find(action => action.type === 'node').id, 'web-ai');
});
check('website interfaces use actual connection records and their status', () => {
  const response = answer('connections from Page API', websiteBase);
  assert.match(prose(response), /web-e15/);
  assert.match(prose(response), /Requires repository connection/);
  assert.match(prose(response), /last-read file SHA/);
  assert.doesNotMatch(prose(response), /I003|Core Control/);
});
check('website review uses its own overview without removed settings or a Core algorithm action', () => {
  const response = answer('review my page', websiteBase);
  assert.match(prose(response), /website overview and its user-to-output workflow/);
  assert.doesNotMatch(prose(response), /Page settings/);
  assert.equal(response.actions.find(action => action.type === 'study').id, 'system');
  assert(response.actions.every(action => !/algorithm/i.test(action.label)));
});
check('partial website graph never invents missing workflow stages or invalid actions', () => {
  const graph = {nodes: website.nodes.filter(node => node.id === 'web-session'), edges: website.edges};
  const response = answer('website workflow', {graph});
  assert.match(prose(response), /No complete website workflow/);
  assert(response.actions.every(action => action.type !== 'node' || action.id === 'web-session'));
});
check('website empty and unsupported questions provide website examples', () => {
  assert.match(prose(answer('', websiteBase)), /website workflow/);
  const response = answer('Write a pancake recipe', websiteBase);
  assert.match(prose(response), /not a general-purpose AI chat/);
  assert.match(prose(response), /AWS for 3D design/);
  assert.doesNotMatch(prose(response), /MOA|Core Control/);
});
console.log(`${checks} workspace guide checks passed.`);
