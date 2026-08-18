#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'frontend', 'src');
const outPath = path.join(srcDir, 'App.jsx');
const parts = fs.readdirSync(srcDir).filter((f) => /^App\.jsx\.part\d+$/.test(f)).sort();

if (parts.length) {
  const out = parts.map((f) => fs.readFileSync(path.join(srcDir, f), 'utf8')).join('');
  fs.writeFileSync(outPath, out);
  console.log('Restored App.jsx from', parts.length, 'parts →', out.length, 'bytes');
} else if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
  console.log('No parts; using existing App.jsx →', fs.statSync(outPath).size, 'bytes');
} else {
  console.error('No App.jsx.part* and no usable App.jsx');
  process.exit(1);
}
