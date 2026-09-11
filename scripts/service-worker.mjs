import fs from 'node:fs';
import { retirementWorker } from '../server/access.mjs';
// Online access must pass the server password gate. Remove the old offline shell.
fs.writeFileSync('dist/sw.js', retirementWorker);
console.log('Published offline-cache retirement worker for password-protected access.');
