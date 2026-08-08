import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dir = path.join(root, 'frontend', 'src');
const parts = fs.readdirSync(dir).filter(f => f.startsWith('App.jsx.b64.')).sort();
if (!parts.length) {
  console.error('No App.jsx.b64.* parts found in frontend/src');
  process.exit(1);
}
const b64 = parts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
const out = path.join(dir, 'App.jsx');
fs.writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('Restored', out, fs.statSync(out).size, 'bytes');
