import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pbkdf2Sync, randomBytes} from 'node:crypto';

export const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MAX_REQUEST_BYTES = 1024 * 1024;

export function createPreviewEnvironment() {
  const records = new Map();
  const salt = randomBytes(16);
  const username = 'preview@example.test';
  const password = 'local-preview-only';
  const env = {
    LOGIN_USERNAME: username,
    LOGIN_VERIFIER: salt.toString('base64') + ':' + pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex'),
    SESSION_SECRET: randomBytes(32).toString('hex'),
    ARCHIVE: {
      async get(key) {
        const value = records.get(key);
        return value ? {body: value, json: async () => JSON.parse(Buffer.from(value).toString('utf8'))} : null;
      },
      async put(key, value) { records.set(key, typeof value === 'string' ? Buffer.from(value) : Buffer.from(value)); },
      async delete(key) { records.delete(key); },
    },
  };
  // The original ZIP is intentionally absent from this curated export. Do not
  // require it or a sibling checkout just to preview the included application.
  for (const route of ['/aws/Agentic-Core-AWS-Architecture.png', '/aws/Deployment-Communication.png']) {
    const filename = path.join(appRoot, 'dist', route);
    if (fs.existsSync(filename)) records.set('files' + route, fs.readFileSync(filename));
  }
  return {env, username, password};
}

export function createPreviewServer(worker, env) {
  return http.createServer(async (req, res) => {
    try {
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_REQUEST_BYTES) {
          res.writeHead(413, {'Content-Type': 'text/plain', 'Connection': 'close'});
          res.end('Preview request too large.');
          return;
        }
        chunks.push(chunk);
      }
      const address = res.socket.localAddress;
      const port = res.socket.localPort;
      const origin = `http://${address.includes(':') ? '[' + address + ']' : address}:${port}`;
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
      }
      // Never manufacture an authenticated platform identity for local traffic.
      headers.delete('oai-authenticated-user-id');
      headers.delete('cf-connecting-ip');
      headers.set('cf-connecting-ip', '127.0.0.1');
      const request = new Request(new URL(req.url, origin), {
        method: req.method, headers,
        ...(['GET', 'HEAD'].includes(req.method) ? {} : {body: Buffer.concat(chunks)}),
      });
      const response = await worker.fetch(request, env, {});
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      if (!res.headersSent) res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Preview request failed.');
    }
  });
}
