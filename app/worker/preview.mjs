import worker from '../dist/server/index.js';
import {createPreviewEnvironment, createPreviewServer} from './local-preview.mjs';

const {env, username, password} = createPreviewEnvironment();
const server = createPreviewServer(worker, env);
server.listen(8768, '127.0.0.1', () => {
  console.log('Local preview: http://127.0.0.1:8768');
  console.log('Synthetic login: ' + username + ' / ' + password);
  console.log('Loopback only. In-memory data is discarded on exit. No GitHub connection configured.');
});
server.on('error', error => {
  console.error('Preview could not start: ' + error.message);
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
