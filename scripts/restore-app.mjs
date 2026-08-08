import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'frontend', 'src')
const out = path.join(dir, 'App.jsx')
const srcParts = fs.readdirSync(dir).filter(f => /^App\.jsx\.part\d+$/.test(f)).sort()
if (srcParts.length) {
  const text = srcParts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('')
  fs.writeFileSync(out, text)
  console.log('Restored from source parts', out, fs.statSync(out).size, 'bytes')
  process.exit(0)
}
const b64parts = fs.readdirSync(dir).filter(f => /^App\.jsx\.b64\.\d+$/.test(f)).sort()
if (b64parts.length) {
  const b64 = b64parts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('')
  fs.writeFileSync(out, Buffer.from(b64, 'base64'))
  console.log('Restored from b64', out, fs.statSync(out).size, 'bytes')
  process.exit(0)
}
console.error('No App.jsx parts found')
process.exit(1)
