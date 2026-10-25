import assert from 'node:assert/strict';
import {createHash, randomBytes} from 'node:crypto';
import {handleWorkspaceStore} from './workspace-store.mjs';

const origin = 'https://workspace.example';
const repository = 'jyotheshkar/system-architecture-workspace-data';
const prefix = 'workspace/pages/';
const token = 'github_pat_test_only_' + 'x'.repeat(60);
const records = new Map(), files = new Map(), calls = [];
const sha = value => createHash('sha1').update(value).digest('hex');
const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), {status, headers: {'Content-Type': 'application/json', ...headers}});
const metadata = () => ({full_name: repository, private: true, archived: false, disabled: false, permissions: {push: true}});
let repo = metadata(), failNext = null, thrown = null, contentOverride = null;
const env = {
  SESSION_SECRET: randomBytes(32).toString('hex'),
  ARCHIVE: {
    async get(key) { const value = records.get(key); return value ? {json: async () => JSON.parse(value)} : null; },
    async put(key, value) { records.set(key, value); }
  }
};
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  calls.push({url, options});
  assert.equal(new URL(url).origin, 'https://api.github.com');
  assert.ok(new URL(url).pathname.startsWith('/repos/' + repository));
  assert.equal(options.redirect, 'error');
  assert.equal(options.headers.Authorization, 'Bearer ' + token);
  if (thrown) { const error = thrown; thrown = null; throw error; }
  if (failNext) { const response = failNext; failNext = null; return response; }
  const path = new URL(url).pathname.slice(('/repos/' + repository).length);
  if (!path) return json(repo);
  assert.ok(path.startsWith('/contents/' + prefix.slice(0, -1)));
  if (path === '/contents/' + prefix.slice(0, -1)) {
    assert.equal(new URL(url).searchParams.get('ref'), 'main');
    return json([...files].map(([name, file]) => ({name, path: prefix + name, sha: file.sha, type: 'file'})));
  }
  const name = path.slice(('/contents/' + prefix).length), file = files.get(name);
  if (options.method === 'PUT') {
    const body = JSON.parse(options.body);
    assert.equal(body.branch, 'main');
    assert.ok(!('committer' in body));
    if (file && !body.sha) return json({message: 'Invalid request. "sha" was not supplied.'}, 422);
    if ((file && body.sha !== file.sha) || (!file && body.sha)) return json({message: 'sha does not match'}, 409);
    const content = Buffer.from(body.content, 'base64').toString('utf8');
    const next = {content, sha: sha(content)};
    files.set(name, next);
    return json({content: {sha: next.sha}, commit: {sha: sha('commit:' + next.sha)}}, file ? 200 : 201);
  }
  assert.equal(new URL(url).searchParams.get('ref'), 'main');
  if (contentOverride) { const response = contentOverride; contentOverride = null; return response; }
  if (!file) return json({message: 'Not found'}, 404);
  return json({type: 'file', encoding: 'base64', path: prefix + name, size: Buffer.byteLength(file.content),
    sha: file.sha, content: Buffer.from(file.content).toString('base64')});
};
const page = {
  schemaVersion: 1, id: 'agentic-core', name: 'Agentic Core', description: 'A governed architecture 🧭',
  view: 'reference', modules: ['learning'], coreVersion: 'agentic-core-reference-v1',
  sections: [{id: 'business-contract', name: 'Business contract', purpose: 'Capture the goal', inputs: 'A request',
    outputs: 'A versioned contract', acceptance: 'The owner accepts its limits', awsNotes: 'No service deployed', anchor: 'contract'}],
  updatedAt: '2026-10-10T12:00:00.000Z'
};
let checks = 0;
const check = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
async function request(path, {method = 'GET', data, signedIn = true, requestOrigin = method === 'GET' ? undefined : origin, headers = {}, useEnv = env} = {}) {
  const req = new Request(origin + path, {method, headers: {
    ...(data !== undefined ? {'Content-Type': 'application/json'} : {}), ...(requestOrigin !== undefined ? {Origin: requestOrigin} : {}), ...headers
  }, ...(data !== undefined ? {body: typeof data === 'string' ? data : JSON.stringify(data)} : {})});
  const response = await handleWorkspaceStore(req, useEnv, {signedIn, sameOrigin: value => value.headers.get('Origin') === origin});
  if (response) {
    check(response.headers.get('cache-control'), 'private, no-store');
    check(response.headers.get('access-control-allow-origin'), null);
  }
  return response;
}
async function expect(path, options, status, code) {
  const response = await request(path, options); check(response.status, status);
  const body = await response.json(); if (code) check(body.code, code);
  check(JSON.stringify(body).includes(token), false); return body;
}
try {
  check(await request('/api/unrelated'), null);
  await expect('/api/workspace-store/status', {signedIn: false}, 401, 'UNAUTHENTICATED');
  await expect('/api/workspace-store/status', {requestOrigin: 'https://attacker.example'}, 403, 'INVALID_ORIGIN');
  await expect('/api/workspace-store/status', {headers: {'Sec-Fetch-Site': 'cross-site'}}, 403, 'INVALID_ORIGIN');
  check((await expect('/api/workspace-store/status', {}, 200)).configured, false);
  await expect('/api/workspace-store/pages', {}, 503, 'UNCONFIGURED');
  check(calls.length, 0);
  await expect('/api/workspace-store/connect', {method: 'POST', data: {token}, requestOrigin: undefined, headers: {Origin: ''}}, 403, 'INVALID_ORIGIN');
  await expect('/api/workspace-store/connect', {method: 'POST', data: {token}, requestOrigin: 'https://attacker.example'}, 403, 'INVALID_ORIGIN');
  await expect('/api/workspace-store/connect', {method: 'POST', data: {token, repository: 'attacker/public'}}, 400, 'INVALID_TOKEN');
  await expect('/api/workspace-store/connect', {method: 'POST', data: {token: 'ghp_wrong_kind'}}, 400, 'INVALID_TOKEN');
  check(calls.length, 0);
  repo = {...metadata(), private: false};
  await expect('/api/workspace-store/connect', {method: 'POST', data: {token}}, 403, 'REPOSITORY_NOT_PRIVATE');
  check(records.size, 0);
  repo = {...metadata(), permissions: {push: false}};
  await expect('/api/workspace-store/connect', {method: 'POST', data: {token}}, 403, 'REPOSITORY_READ_ONLY');
  repo = {...metadata(), full_name: 'attacker/public'};
  await expect('/api/workspace-store/connect', {method: 'POST', data: {token}}, 400, 'REPOSITORY_UNAVAILABLE');
  repo = metadata();
  const connected = await expect('/api/workspace-store/connect', {method: 'POST', data: {token}}, 200);
  check(connected.configured, true); check(connected.repository, repository);
  check(records.size, 1); check(records.has('settings/github-connection'), true);
  const encrypted = records.get('settings/github-connection');
  check(encrypted.includes(token), false); check(encrypted.includes('github_pat'), false);
  const encryptedRecord = JSON.parse(encrypted);
  check(Buffer.from(encryptedRecord.iv, 'base64').length, 12);
  check(calls.some(call => call.options.method !== 'GET'), false);
  check((await expect('/api/workspace-store/status', {}, 200)).configured, true);
  const wrongSecretEnv = {...env, SESSION_SECRET: randomBytes(32).toString('hex')};
  await expect('/api/workspace-store/status', {useEnv: wrongSecretEnv}, 503, 'CONNECTION_UNAVAILABLE');
  await expect('/api/workspace-store/status', {useEnv: {}}, 503, 'STORE_UNAVAILABLE');
  check((await expect('/api/workspace-store/pages', {}, 200)).pages, []);
  const beforeRetiredCalls = calls.length;
  await expect('/api/workspace-store/pages/agentic-core-scaled', {}, 404, 'PAGE_RETIRED');
  await expect('/api/workspace-store/pages/agentic-core-scaled', {method: 'PUT', data: {page: {...page, id: 'agentic-core-scaled'}}}, 404, 'PAGE_RETIRED');
  check(calls.length, beforeRetiredCalls);
  const retiredContent = JSON.stringify({...page, id: 'agentic-core-scaled'});
  files.set('agentic-core-scaled.json', {content: retiredContent, sha: sha(retiredContent)});
  check((await expect('/api/workspace-store/pages', {}, 200)).pages, []);
  files.delete('agentic-core-scaled.json');
  await expect('/api/workspace-store/pages/missing', {}, 404, 'PAGE_NOT_FOUND');
  await expect('/api/workspace-store/pages/%2e%2e%2fsecret', {method: 'PUT', data: {page}}, 404, 'NOT_FOUND');
  await expect('/api/workspace-store/pages/agentic-core', {method: 'DELETE'}, 405, 'METHOD_NOT_ALLOWED');
  await expect('/api/workspace-store/connect', {}, 405, 'METHOD_NOT_ALLOWED');
  await expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: {page}, requestOrigin: 'https://attacker.example'}, 403, 'INVALID_ORIGIN');
  const beforeInvalid = calls.length;
  const putPage = (changed, envelope = {}) => expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: {page: changed, ...envelope}}, 400);
  await putPage({...page, id: 'other'});
  await putPage({...page, name: 'x'.repeat(81)});
  await putPage({...page, description: 'x'.repeat(2401)});
  await putPage({...page, modules: ['memory', 'memory']});
  await putPage({...page, modules: ['external']});
  await putPage({...page, view: 'javascript:alert(1)'});
  await putPage({...page, coreVersion: 'replace-shared-core'});
  await putPage({...page, coreVersion: null});
  await putPage({...page, coreVersion: ['system-architecture-workspace-v1']});
  await putPage({...page, updatedAt: '2026-02-30T00:00:00Z'});
  await putPage({...page, sections: [{...page.sections[0], id: '../secret'}]});
  await putPage({...page, sections: [page.sections[0], page.sections[0]]});
  await putPage({...page, sections: [{...page.sections[0], purpose: {html: 'untrusted'}}]});
  await putPage({...page, sections: [{...page.sections[0], anchor: '../../core'}]});
  await putPage({...page, sections: Array.from({length: 51}, (_, i) => ({...page.sections[0], id: 's-' + i}))});
  await putPage(page, {sha: 'invalid'});
  await putPage(page, {repository: 'attacker/public'});
  await putPage(JSON.parse(JSON.stringify(page).slice(0, -1) + ',"__proto__":{"target":"attacker"}}'));
  await expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: '{invalid'}, 400, 'INVALID_REQUEST');
  await expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: 'x'.repeat(256 * 1024 + 1)}, 413, 'INVALID_REQUEST');
  check(calls.length, beforeInvalid);
  const first = await expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: {page}}, 200);
  check(first.created, true); check(first.page, page); check(shaPattern(first.sha), true);
  check(files.size, 1); check(JSON.parse(files.get('agentic-core.json').content), page);
  const loaded = await expect('/api/workspace-store/pages/agentic-core', {}, 200);
  check(loaded.page, page); check(loaded.sha, first.sha);
  const listed = await expect('/api/workspace-store/pages', {}, 200);
  check(listed.pages, [{id: 'agentic-core', sha: first.sha}]);
  const changed = {...page, name: 'Updated architecture', view: 'brain', updatedAt: '2026-10-10T13:00:00Z'};
  await expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: {page: changed}}, 409, 'CONFLICT');
  await expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: {page: changed, sha: 'a'.repeat(40)}}, 409, 'CONFLICT');
  check(JSON.parse(files.get('agentic-core.json').content).name, page.name);
  const second = await expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: {page: changed, sha: first.sha}}, 200);
  check(second.created, false); check(second.sha !== first.sha, true);
  check(second.page.view, 'brain');
  const brainLoaded = await expect('/api/workspace-store/pages/agentic-core', {}, 200);
  check(brainLoaded.page, changed); check(brainLoaded.sha, second.sha);
  const puts = calls.filter(call => call.options.method === 'PUT');
  check(JSON.parse(puts.at(-1).options.body).sha, first.sha);
  check(puts.every(call => new URL(call.url).pathname === '/repos/' + repository + '/contents/' + prefix + 'agentic-core.json'), true);
  repo = {...metadata(), private: false};
  const putCount = puts.length;
  await expect('/api/workspace-store/pages/agentic-core', {method: 'PUT', data: {page, sha: second.sha}}, 403, 'REPOSITORY_NOT_PRIVATE');
  await expect('/api/workspace-store/pages', {}, 403, 'REPOSITORY_NOT_PRIVATE');
  check(calls.filter(call => call.options.method === 'PUT').length, putCount);
  repo = metadata();
  contentOverride = json({type: 'file', encoding: 'base64', path: prefix + 'agentic-core.json', sha: second.sha, content: Buffer.from('{invalid').toString('base64')});
  await expect('/api/workspace-store/pages/agentic-core', {}, 502, 'INVALID_STORED_PAGE');
  failNext = json({message: 'secret upstream ' + token}, 401);
  await expect('/api/workspace-store/pages', {}, 502, 'GITHUB_AUTH_REJECTED');
  failNext = json({message: 'limit ' + token}, 403, {'x-ratelimit-remaining': '0'});
  await expect('/api/workspace-store/pages', {}, 429, 'GITHUB_RATE_LIMIT');
  failNext = json({message: 'server ' + token}, 503);
  await expect('/api/workspace-store/pages', {}, 502, 'GITHUB_UNAVAILABLE');
  thrown = new DOMException('testing abort', 'AbortError');
  await expect('/api/workspace-store/pages', {}, 504, 'GITHUB_TIMEOUT');
  thrown = new Error('network ' + token);
  await expect('/api/workspace-store/pages', {}, 502, 'GITHUB_UNREACHABLE');
  // Website designs have their own model identity. A private save and reload
  // must preserve it and its website section anchors rather than coercing it
  // back to Agentic Core. The original Agentic Core round trip above remains.
  const website = {...page, id: 'system-architecture-workspace-1-0', name: 'System Architecture Workspace 1.0',
    description: 'The website itself, with manually designed component relationships.',
    coreVersion: 'system-architecture-workspace-v1', modules: [],
    sections: [{...page.sections[0], id: 'website-page-design', name: 'Page design', anchor: 'web-page'}]};
  const websitePath = '/api/workspace-store/pages/' + website.id;
  const websiteSaved = await expect(websitePath, {method: 'PUT', data: {page: website}}, 200);
  check(websiteSaved.created, true); check(websiteSaved.page, website);
  const websiteLoaded = await expect(websitePath, {}, 200);
  check(websiteLoaded.page, website); check(websiteLoaded.sha, websiteSaved.sha);
  check(websiteLoaded.page.sections[0].anchor, 'web-page');
  const websiteChanged = {...website, view: 'aws', updatedAt: '2026-10-10T14:00:00Z'};
  const websiteUpdated = await expect(websitePath, {method: 'PUT', data: {page: websiteChanged, sha: websiteSaved.sha}}, 200);
  check(websiteUpdated.created, false); check(websiteUpdated.page.coreVersion, 'system-architecture-workspace-v1');
  check((await expect(websitePath, {}, 200)).page, websiteChanged);
  const beforeUnsupportedModel = calls.length;
  await expect(websitePath, {method: 'PUT', data: {page: {...websiteChanged, coreVersion: 'website-architecture-v1'}, sha: websiteUpdated.sha}}, 400, 'INVALID_PAGE');
  check(calls.length, beforeUnsupportedModel);
  check(JSON.parse(files.get(website.id + '.json').content), websiteChanged);
  contentOverride = json({type: 'file', encoding: 'base64', path: prefix + website.id + '.json', sha: websiteUpdated.sha,
    content: Buffer.from(JSON.stringify({...websiteChanged, coreVersion: 'unrecognised-website-model'})).toString('base64')});
  await expect(websitePath, {}, 502, 'INVALID_STORED_PAGE');
  check(records.get('settings/github-connection'), encrypted);
  console.log('Private GitHub workspace storage checks passed: ' + checks + '.');
} finally { globalThis.fetch = originalFetch; }
function shaPattern(value) { return /^[a-f0-9]{40}$/.test(value); }
