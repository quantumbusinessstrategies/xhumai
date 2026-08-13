import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'frontend', 'src')
const out = path.join(dir, 'App.jsx')
const cssOut = path.join(dir, 'App.css')
const cssFull = path.join(dir, 'App.css.full')
const MIN_APP_BYTES = 50000

const maybeRestoreFullCss = () => {
  if (fs.existsSync(cssFull)) {
    fs.copyFileSync(cssFull, cssOut)
    console.log('Restored App.css from App.css.full →', fs.statSync(cssOut).size, 'bytes')
  }
}

const hasFullApp = () => fs.existsSync(out) && fs.statSync(out).size > MIN_APP_BYTES

if (hasFullApp()) {
  console.log('Using existing App.jsx →', fs.statSync(out).size, 'bytes')
  maybeRestoreFullCss()
  process.exit(0)
}

const packParts = fs.readdirSync(dir).filter(f => /^lander\.pack\.b64\.\d+$/.test(f))
  .sort((a,b) => parseInt(a.split('.').pop(), 10) - parseInt(b.split('.').pop(), 10))
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
  if (hasFullApp()) {
    console.log('Restored from lander.pack →', fs.statSync(out).size, 'bytes')
    maybeRestoreFullCss()
    process.exit(0)
  }
  console.warn('lander.pack restore did not produce a full App.jsx, falling back to split parts')
}

const srcParts = fs.readdirSync(dir)
  .filter(f => /^App\.jsx\.part\d+$/.test(f))
  .sort((a, b) => parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10))
if (srcParts.length) {
  const text = srcParts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('')
  if (Buffer.byteLength(text, 'utf8') <= MIN_APP_BYTES) {
    console.error('Split App.jsx parts are too small to be a full lander build')
    process.exit(1)
  }
  fs.writeFileSync(out, text)
  console.log('Restored App.jsx from', srcParts.length, 'parts →', fs.statSync(out).size, 'bytes')
  maybeRestoreFullCss()
  process.exit(0)
}

console.error('No App.jsx parts or lander pack found')
process.exit(1)
