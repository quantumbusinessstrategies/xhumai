#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'frontend', 'src');
const parts = fs.readdirSync(srcDir).filter(f => /^App\.jsx\.part\d+$/.test(f)).sort();
if (!parts.length) {
  console.error('No App.jsx.part* files found');
  process.exit(1);
}
const out = parts.map(f => fs.readFileSync(path.join(srcDir, f), 'utf8')).join('');
fs.writeFileSync(path.join(srcDir, 'App.jsx'), out);
console.log('Restored App.jsx from', parts.length, 'parts →', out.length, 'bytes');
