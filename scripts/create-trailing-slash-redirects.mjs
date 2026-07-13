import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const distDir = join(process.cwd(), 'docs', '.vitepress', 'dist')
const rootEntries = await readdir(distDir, { withFileTypes: true })
let created = 0

for (const entry of rootEntries) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue
  if (entry.name === 'index.html' || entry.name === '404.html') continue

  const routeName = basename(entry.name, '.html')
  const routeDir = join(distDir, routeName)
  const redirectPath = join(routeDir, 'index.html')

  if (await exists(redirectPath)) continue

  await mkdir(routeDir, { recursive: true })
  await writeFile(redirectPath, redirectHtml(routeName), 'utf8')
  created += 1
}

console.log(`Created ${created} trailing-slash redirect page(s).`)

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch (error) {
    if (error && error.code === 'ENOENT') return false
    throw error
  }
}

function redirectHtml(routeName) {
  const target = `../${routeName}`
  const label = escapeHtml(target)
  return `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <link rel="canonical" href="${label}">
    <meta http-equiv="refresh" content="0; url=${label}">
    <script>
      const target = ${JSON.stringify(target)};
      location.replace(target + location.search + location.hash);
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="${label}">${label}</a>.</p>
  </body>
</html>
`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
