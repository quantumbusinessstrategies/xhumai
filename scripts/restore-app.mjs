import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'frontend', 'src')
const out = path.join(dir, 'App.jsx')

const packParts = fs.readdirSync(dir).filter(f => /^lander\.pack\.b64\.\d+$/.test(f)).sort()
if (packParts.length) {
  const b64 = packParts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('')
  const zipPath = path.join(dir, 'lander.pack.zip')
  fs.writeFileSync(zipPath, Buffer.from(b64, 'base64'))
  try {
    execSync(`unzip -o -q "${zipPath}" -d "${dir}"`, { stdio: 'inherit' })
  } catch (e) {
    try {
      execSync(`powershell -Command "Expand-Archive -Force '${zipPath.replace(/'/g, "''")}' '${dir.replace(/'/g, "''")}'"`, { stdio: 'inherit' })
    } catch (e2) {
      console.error('unzip failed', e2.message)
      process.exit(1)
    }
  }
  try { fs.unlinkSync(zipPath) } catch {}
  console.log('Restored from lander.pack →', fs.statSync(out).size, 'bytes')
  process.exit(0)
}

const srcParts = fs.readdirSync(dir).filter(f => /^App\.jsx\.part\d+$/.test(f)).sort()
if (srcParts.length) {
  const text = srcParts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('')
  fs.writeFileSync(out, text)
  console.log('Restored App.jsx from', srcParts.length, 'parts →', fs.statSync(out).size, 'bytes')
  process.exit(0)
}

console.error('No lander pack or App.jsx parts found')
process.exit(1)
