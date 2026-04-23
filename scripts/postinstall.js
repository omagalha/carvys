const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build', 'generate-build-id.js')

if (!fs.existsSync(file)) process.exit(0)

let content = fs.readFileSync(file, 'utf8')

const target = 'async function generateBuildId(generate, fallback) {\n    let buildId = await generate();'
const patched = 'async function generateBuildId(generate, fallback) {\n    if (typeof generate !== \'function\') generate = async () => null;\n    let buildId = await generate();'

if (content.includes(patched)) {
  console.log('postinstall: next patch already applied')
  process.exit(0)
}

if (!content.includes(target)) {
  console.warn('postinstall: patch target not found — Next.js may have been updated. Skipping.')
  process.exit(0)
}

fs.writeFileSync(file, content.replace(target, patched))
console.log('postinstall: next generate-build-id patched successfully')
