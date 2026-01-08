import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const rootDir = process.cwd();

// Load .env (optional)
const envPath = path.join(rootDir, '.env');
const parsed = fs.existsSync(envPath) ? dotenv.config({ path: envPath }).parsed : {};

const backendUrl = parsed?.BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5269/api';

const outDir = path.join(rootDir, 'public');
const outFile = path.join(outDir, 'env.js');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const content = `// Auto-generated from .env by scripts/generate-env.mjs
// Do not edit by hand; edit .env instead.
(function () {
  window.__env = window.__env || {};
  window.__env.BACKEND_URL = ${JSON.stringify(backendUrl)};
})();
`;

fs.writeFileSync(outFile, content, 'utf8');
console.log(`[env] Wrote ${path.relative(rootDir, outFile)} (BACKEND_URL=${backendUrl})`);
