// Private, explicit GitHub saves. Contents API updates use the caller's last-read
// blob SHA, so an older browser revision cannot silently overwrite a newer one.
// https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
const REPOSITORY = 'jyotheshkar/system-architecture-workspace-data';
const BRANCH = 'main';
const PREFIX = 'workspace/pages';
const CONNECTION_KEY = 'settings/github-connection';
const API_ROOT = 'https://api.github.com/repos/' + REPOSITORY;
const MAX_BYTES = 256 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {fatal: true});
const idPattern = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const shaPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const moduleNames = new Set(['memory', 'learning', 'tools', 'recovery', 'specialists']);
const retiredPageIds = new Set(['agentic-core-scaled']);
// Legacy view names remain valid for portable files and private repository data.
// The browser maps the legacy reference name to Concept Design Architecture.
const views = new Set(['reference', 'concept', 'ada', 'aws', 'brain']);
const target = {repository: REPOSITORY, branch: BRANCH, prefix: PREFIX};

class StoreError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const fail = (status, code, message) => { throw new StoreError(status, code, message); };
const json = (value, status = 200, extra = {}) => new Response(JSON.stringify(value), {status, headers: {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Vary': 'Cookie, Origin',
  ...extra
}});
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => isRecord(value) && Object.keys(value).every(key => keys.includes(key));
function validText(value, maximum, required = false) {
  return typeof value === 'string' && value.length <= maximum && (!required || value.trim().length > 0) &&
    !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value);
}
function validISO(value) {
  if (typeof value !== 'string' || value.length > 32 || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 19) === value.slice(0, 19);
}
function validatePage(value, expectedId) {
  const pageKeys = ['schemaVersion', 'id', 'name', 'description', 'view', 'modules', 'sections', 'updatedAt', 'coreVersion'];
  const sectionKeys = ['id', 'name', 'purpose', 'inputs', 'outputs', 'acceptance', 'awsNotes', 'anchor'];
  let valid = exactKeys(value, pageKeys) && value.schemaVersion === 1 && idPattern.test(value.id || '') &&
    value.id === expectedId && validText(value.name, 80, true) && validText(value.description, 2400) &&
    views.has(value.view) && Array.isArray(value.modules) && value.modules.length <= moduleNames.size &&
    value.modules.every(name => moduleNames.has(name)) && new Set(value.modules).size === value.modules.length &&
    Array.isArray(value.sections) && value.sections.length <= 50 && validISO(value.updatedAt) &&
    (value.coreVersion === undefined || ['agentic-core-reference-v1','system-architecture-workspace-v1'].includes(value.coreVersion));
  if (valid) {
    const ids = new Set();
    for (const section of value.sections) {
      if (!exactKeys(section, sectionKeys) || typeof section.id !== 'string' || !idPattern.test(section.id) || ids.has(section.id) ||
          !validText(section.name, 80, true) || !validText(section.purpose, 2400) ||
          !validText(section.inputs, 2400) || !validText(section.outputs, 2400) || !validText(section.acceptance, 2400) ||
          !validText(section.awsNotes, 2400) || typeof section.anchor !== 'string' || !idPattern.test(section.anchor)) {
        valid = false; break;
      }
      ids.add(section.id);
    }
  }
  if (!valid || encoder.encode(JSON.stringify(value) + '\n').byteLength > MAX_BYTES) {
    fail(400, 'INVALID_PAGE', 'This page has invalid or oversized fields. Check its name, sections and architecture settings.');
  }
  return value;
}
async function readJSON(message, limit, code = 'INVALID_REQUEST') {
  if (Number(message.headers.get('Content-Length') || 0) > limit) fail(413, code, 'The request is too large.');
  const reader = message.body?.getReader();
  if (!reader) fail(400, code, 'Send a JSON request.');
  const chunks = []; let size = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); fail(413, code, 'The request is too large.'); }
      chunks.push(value);
    }
    const result = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(decoder.decode(result));
  } catch (error) {
    if (error instanceof StoreError) throw error;
    fail(400, code, 'Send valid UTF-8 JSON.');
  } finally { reader.releaseLock(); }
}
function toBase64(value) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : new Uint8Array(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
function fromBase64(value) { return Uint8Array.from(atob(value), char => char.charCodeAt(0)); }
async function encryptionKey(env) {
  if (!env.ARCHIVE || typeof env.SESSION_SECRET !== 'string' || env.SESSION_SECRET.length < 16) {
    fail(503, 'STORE_UNAVAILABLE', 'Private workspace storage is temporarily unavailable.');
  }
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode('saw-github-connection-v1\0' + env.SESSION_SECRET));
  return crypto.subtle.importKey('raw', digest, {name: 'AES-GCM'}, false, ['encrypt', 'decrypt']);
}
async function readConnection(env) {
  const key = await encryptionKey(env);
  const stored = await env.ARCHIVE.get(CONNECTION_KEY);
  if (!stored) return null;
  try {
    const data = await stored.json();
    if (data.version !== 1 || data.repository !== REPOSITORY || data.branch !== BRANCH ||
        typeof data.iv !== 'string' || data.iv.length > 32 || typeof data.ciphertext !== 'string' || data.ciphertext.length > 4096 ||
        !validISO(data.connectedAt)) throw new Error('Invalid connection');
    const clear = await crypto.subtle.decrypt({name: 'AES-GCM', iv: fromBase64(data.iv), additionalData: encoder.encode(REPOSITORY + '/' + BRANCH)}, key, fromBase64(data.ciphertext));
    const token = decoder.decode(clear);
    if (!/^github_pat_[A-Za-z0-9_]{20,240}$/.test(token)) throw new Error('Invalid connection');
    return {token, connectedAt: data.connectedAt};
  } catch {
    fail(503, 'CONNECTION_UNAVAILABLE', 'Reconnect GitHub in Page settings to restore private repository access.');
  }
}
async function saveConnection(env, token) {
  const key = await encryptionKey(env), iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({name: 'AES-GCM', iv, additionalData: encoder.encode(REPOSITORY + '/' + BRANCH)}, key, encoder.encode(token));
  const connectedAt = new Date().toISOString();
  await env.ARCHIVE.put(CONNECTION_KEY, JSON.stringify({version: 1, repository: REPOSITORY, branch: BRANCH, iv: toBase64(iv), ciphertext: toBase64(cipher), connectedAt}));
  return connectedAt;
}
async function github(token, path = '', options = {}) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(API_ROOT + path, {
      method: options.method || 'GET', redirect: 'error', signal: controller.signal,
      headers: {'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'System-Architecture-Workspace',
        ...(options.body ? {'Content-Type': 'application/json'} : {})},
      ...(options.body ? {body: JSON.stringify(options.body)} : {})
    });
    let data;
    try { data = await readJSON(response, 1024 * 1024, 'GITHUB_RESPONSE'); }
    catch {
      if (controller.signal.aborted) fail(504, 'GITHUB_TIMEOUT', 'GitHub did not respond in time. If saving, check the repository version before trying again.');
      if (options.method === 'PUT') fail(502, 'SAVE_UNCONFIRMED', 'GitHub returned an unreadable save receipt. Check its latest page revision before saving again.');
      fail(502, 'GITHUB_RESPONSE', 'GitHub returned an unreadable response. Try again shortly.');
    }
    if (response.status === 401) fail(502, 'GITHUB_AUTH_REJECTED', 'GitHub rejected the saved connection. Reconnect with a valid fine-grained token.');
    if (response.status === 429 || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0')) {
      fail(429, 'GITHUB_RATE_LIMIT', 'GitHub is limiting requests. Your local work is still available; try again later.');
    }
    if (response.status === 403) fail(502, 'GITHUB_PERMISSION', 'GitHub denied this action. Check Contents read and write permission for the private repository.');
    if (response.status >= 500) fail(502, 'GITHUB_UNAVAILABLE', 'GitHub is temporarily unavailable. Your local work has not been discarded.');
    return {status: response.status, data};
  } catch (error) {
    if (error instanceof StoreError) throw error;
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      fail(504, 'GITHUB_TIMEOUT', 'GitHub did not respond in time. If saving, check the repository version before trying again.');
    }
    fail(502, 'GITHUB_UNREACHABLE', 'GitHub could not be reached. If saving, check the repository version before trying again.');
  } finally { clearTimeout(timer); }
}
async function verifyRepository(token) {
  const response = await github(token);
  if (response.status !== 200 || typeof response.data?.full_name !== 'string' || response.data.full_name.toLowerCase() !== REPOSITORY.toLowerCase()) {
    fail(400, 'REPOSITORY_UNAVAILABLE', 'This connection cannot access the workspace repository. Select the private workspace repository when creating the token.');
  }
  if (response.data.private !== true) fail(403, 'REPOSITORY_NOT_PRIVATE', 'The workspace repository must remain private before pages can be read or saved.');
  if (response.data.permissions?.push !== true || response.data.archived || response.data.disabled) {
    fail(403, 'REPOSITORY_READ_ONLY', 'The workspace repository must be active and grant this connection write access.');
  }
}
function contentPath(id) { return '/contents/' + PREFIX + '/' + encodeURIComponent(id) + '.json'; }
function storedPage(data, id) {
  try {
    if (data.type !== 'file' || data.encoding !== 'base64' || typeof data.content !== 'string' || data.content.length > MAX_BYTES * 1.5 ||
        data.size > MAX_BYTES || !shaPattern.test(data.sha || '') || data.path !== PREFIX + '/' + id + '.json') throw new Error('Invalid stored file');
    const bytes = fromBase64(data.content.replace(/\s/g, ''));
    if (bytes.byteLength > MAX_BYTES) throw new Error('Oversized stored file');
    return validatePage(JSON.parse(decoder.decode(bytes)), id);
  } catch { fail(502, 'INVALID_STORED_PAGE', 'The saved file is not a supported workspace page. Your local page has not been replaced.'); }
}

/** Return null for another API route. signedIn must be a verified boolean. */
export async function handleWorkspaceStore(request, env, {signedIn, sameOrigin} = {}) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/workspace-store')) return null;
  try {
    if (signedIn !== true) fail(401, 'UNAUTHENTICATED', 'Sign in to manage workspace pages.');
    const originAllowed = typeof sameOrigin === 'function' ? sameOrigin(request) : sameOrigin === true;
    const origin = request.headers.get('Origin');
    if ((origin && origin !== url.origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site' ||
        (!['GET', 'HEAD'].includes(request.method) && !originAllowed)) {
      fail(403, 'INVALID_ORIGIN', 'Open this action from the workspace website.');
    }
    const route = url.pathname.slice('/api/workspace-store'.length);
    const pageMatch = /^\/pages\/([A-Za-z0-9][A-Za-z0-9_-]{0,63})$/.exec(route);
    const allowed = route === '/status' || route === '/pages' ? ['GET'] : route === '/connect' ? ['POST'] : pageMatch ? ['GET', 'PUT'] : null;
    if (!allowed) fail(404, 'NOT_FOUND', 'Workspace storage endpoint not found.');
    if (!allowed.includes(request.method)) return json({error: 'Method not allowed.', code: 'METHOD_NOT_ALLOWED'}, 405, {'Allow': allowed.join(', ')});
    if (pageMatch && retiredPageIds.has(pageMatch[1])) fail(404, 'PAGE_RETIRED', 'This workspace page has been removed. Select another page.');
    if (route === '/connect') {
      const input = await readJSON(request, 4096);
      if (!exactKeys(input, ['token']) || typeof input.token !== 'string' || !/^github_pat_[A-Za-z0-9_]{20,240}$/.test(input.token)) {
        fail(400, 'INVALID_TOKEN', 'Enter a fine-grained GitHub token restricted to the private workspace repository.');
      }
      await encryptionKey(env);
      await verifyRepository(input.token);
      const connectedAt = await saveConnection(env, input.token);
      return json({ok: true, configured: true, ...target, connectedAt});
    }
    const connection = await readConnection(env);
    if (route === '/status') return json({configured: !!connection, ...target, ...(connection ? {connectedAt: connection.connectedAt} : {})});
    if (!connection) fail(503, 'UNCONFIGURED', 'Connect the private GitHub repository in Pages before saving or loading repository pages.');
    let input;
    if (request.method === 'PUT') {
      input = await readJSON(request, MAX_BYTES);
      if (!exactKeys(input, ['page', 'sha']) || (input.sha !== undefined && (typeof input.sha !== 'string' || !shaPattern.test(input.sha)))) {
        fail(400, 'INVALID_REQUEST', 'Save a page with its last-read GitHub revision.');
      }
      validatePage(input.page, pageMatch[1]);
    }
    // Recheck visibility before every read or save in case repository settings changed.
    await verifyRepository(connection.token);
    if (route === '/pages') {
      const result = await github(connection.token, '/contents/' + PREFIX + '?ref=' + BRANCH);
      if (result.status === 404) return json({pages: [], ...target});
      if (result.status !== 200 || !Array.isArray(result.data)) fail(502, 'GITHUB_RESPONSE', 'GitHub could not list the saved pages.');
      const pages = result.data.filter(entry => entry.type === 'file' && typeof entry.name === 'string' && entry.name.endsWith('.json') &&
        idPattern.test(entry.name.slice(0, -5)) && !retiredPageIds.has(entry.name.slice(0, -5)) && entry.path === PREFIX + '/' + entry.name && shaPattern.test(entry.sha || ''))
        .map(entry => ({id: entry.name.slice(0, -5), sha: entry.sha}));
      return json({pages, ...target, limit: 1000, possiblyTruncated: result.data.length >= 1000});
    }
    const id = pageMatch[1];
    if (request.method === 'GET') {
      const result = await github(connection.token, contentPath(id) + '?ref=' + BRANCH);
      if (result.status === 404) fail(404, 'PAGE_NOT_FOUND', 'This page has not been saved to GitHub.');
      if (result.status !== 200) fail(502, 'GITHUB_RESPONSE', 'GitHub could not load this page.');
      return json({page: storedPage(result.data, id), sha: result.data.sha});
    }
    const result = await github(connection.token, contentPath(id), {method: 'PUT', body: {
      message: (input.sha ? 'Update' : 'Create') + ' workspace page ' + id,
      branch: BRANCH, content: toBase64(JSON.stringify(input.page) + '\n'),
      ...(input.sha ? {sha: input.sha} : {})
    }});
    const shaProblem = result.status === 422 && (/sha|already exists|does not match/i.test(String(result.data?.message || '')) ||
      (Array.isArray(result.data?.errors) && result.data.errors.some(error => error?.field === 'sha')));
    if (result.status === 409 || shaProblem) fail(409, 'CONFLICT', 'The GitHub page has changed or already exists. Load its latest revision before saving again. Your local edits are still available.');
    if (![200, 201].includes(result.status)) fail(502, 'GITHUB_SAVE_REJECTED', 'GitHub did not accept this save. Your local edits are still available. Check repository access and try again.');
    if (!shaPattern.test(result.data?.content?.sha || '') || !shaPattern.test(result.data?.commit?.sha || '')) {
      fail(502, 'SAVE_UNCONFIRMED', 'GitHub returned an incomplete save receipt. Check its latest page revision before saving again.');
    }
    return json({ok: true, page: input.page, sha: result.data.content.sha, commit: result.data.commit.sha, created: result.status === 201});
  } catch (error) {
    if (error instanceof StoreError) return json({error: error.message, code: error.code}, error.status);
    return json({error: 'Private workspace storage is temporarily unavailable. Your local edits are still available.', code: 'STORE_UNAVAILABLE'}, 503);
  }
}
