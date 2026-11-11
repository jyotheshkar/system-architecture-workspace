import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../dist/server/index.js';
import {createPreviewEnvironment, createPreviewServer, MAX_REQUEST_BYTES} from './local-preview.mjs';

test('standalone preview keeps sign-in and private storage boundaries', async () => {
  const {env, username, password} = createPreviewEnvironment();
  const server = createPreviewServer(worker, env);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const publicPage = await fetch(origin);
    assert.equal(publicPage.status, 200);
    assert.match(await publicPage.text(), /login-form/);
    const protectedPage = await fetch(origin + '/workspace', {redirect: 'manual'});
    assert.equal(protectedPage.status, 303);
    const signed = await fetch(origin + '/api/login', {method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'}, body: JSON.stringify({username, password})});
    assert.equal(signed.status, 200);
    const cookie = signed.headers.get('set-cookie').split(';')[0];
    assert.equal((await fetch(origin + '/workspace', {headers: {Cookie: cookie}})).status, 200);
    const status = await fetch(origin + '/api/workspace-store/status', {headers: {Cookie: cookie}});
    assert.equal(status.status, 200);
    assert.equal((await status.json()).configured, false);
    const image = await fetch(origin + '/aws/Deployment-Communication.png', {headers: {Cookie: cookie}});
    assert.equal(image.status, 200);
    assert.ok((await image.arrayBuffer()).byteLength > 2000000);
    const oversized = await fetch(origin + '/api/login', {method: 'POST', body: 'x'.repeat(MAX_REQUEST_BYTES + 1)});
    assert.equal(oversized.status, 413);
  } finally {
    await new Promise(resolve => server.close(resolve));
    server.closeAllConnections();
  }
});
