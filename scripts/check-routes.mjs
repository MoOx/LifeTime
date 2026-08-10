/**
 * Build the router's route tree the way the app does, without a device.
 *
 * Expo Router discovers routes at runtime from a Metro `require.context` over `app/`, so
 * a mistake in the file layout is invisible to `tsc` and to Jest — it surfaces as a
 * JavaScript exception a quarter of a second after launch, which on a device means a
 * crash log and a twenty-minute build to test the fix.
 *
 * That is exactly what happened: three route groups each containing an `index` file all
 * resolve to the same URL, and the app died at mount. This script fakes the context
 * module, runs Expo Router's own `getRoutes`, and fails on:
 *
 *   • two routes claiming the same URL,
 *   • a `<NativeTabs.Trigger name>` that does not match a child route of the tabs layout.
 *
 * It runs in about a second, offline, and is wired into `npm run check`.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = fileURLToPath(new URL('..', import.meta.url))
const appDir = join(root, 'app')

const ROUTE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js']

const walk = (dir) => {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (ROUTE_EXTENSIONS.some((ext) => entry.endsWith(ext))) out.push(full)
  }
  return out
}

const files = walk(appDir).map((file) => `./${relative(appDir, file).split('\\').join('/')}`)

/**
 * Metro's `require.context` shape. The modules only need a default export for the tree to
 * build — this checks the *layout*, not what the screens render.
 */
const context = Object.assign(
  (key) => ({ default: () => null }),
  {
    keys: () => files,
    resolve: (key) => key,
    id: 'app',
  },
)

const { getRoutes } = require('expo-router/build/getRoutes.js')

let tree
try {
  tree = getRoutes(context, { platform: 'ios', preserveRedirectAndRewrites: true })
} catch (error) {
  console.error('✘ Expo Router refused to build the route tree:\n')
  console.error(`  ${error.message}`)
  process.exit(1)
}

if (tree === null) {
  console.error('✘ Expo Router produced no route tree at all.')
  process.exit(1)
}

/** Every leaf, with the URL it answers on and the file it came from. */
const leaves = []
const visit = (node, segments) => {
  const next = node.route === '' ? segments : [...segments, node.route]
  if (node.children.length === 0) {
    leaves.push({ url: urlOf(next), file: node.contextKey })
    return
  }
  for (const child of node.children) visit(child, next)
}

/** Groups and index files are transparent in the URL — which is what makes them clash. */
const urlOf = (segments) =>
  '/' +
  segments
    .flatMap((segment) => segment.split('/'))
    .filter((segment) => segment !== '' && segment !== 'index' && !/^\(.*\)$/.test(segment))
    .join('/')

for (const child of tree.children) visit(child, [])

const byUrl = new Map()
for (const leaf of leaves) {
  if (leaf.file.startsWith('./+') || leaf.file.includes('_layout')) continue
  byUrl.set(leaf.url, [...(byUrl.get(leaf.url) ?? []), leaf.file])
}

const clashes = [...byUrl].filter(([, fileList]) => fileList.length > 1)

if (clashes.length > 0) {
  console.error('✘ Two or more routes answer on the same URL:\n')
  for (const [url, fileList] of clashes) {
    console.error(`  ${url || '/'}`)
    for (const file of fileList) console.error(`      ${file}`)
  }
  console.error(
    '\nRoute groups "(name)" do not appear in the URL, so two groups each holding an\n' +
      'index file both answer on the parent path. Give the directories real names, or\n' +
      'share one file across groups with the "(a,b)" syntax.',
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Tab triggers must name a real child route
// ---------------------------------------------------------------------------

const tabsLayout = join(appDir, '(tabs)', '_layout.tsx')
let triggerProblems = []
try {
  const source = readFileSync(tabsLayout, 'utf8')
  const declared = [...source.matchAll(/NativeTabs\.Trigger\s+name="([^"]+)"/g)].map(
    (match) => match[1],
  )
  const available = new Set(
    readdirSync(join(appDir, '(tabs)'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() || ROUTE_EXTENSIONS.some((e) => entry.name.endsWith(e)))
      .map((entry) =>
        entry.isDirectory() ? entry.name : entry.name.replace(/\.[jt]sx?$/, ''),
      )
      .filter((name) => name !== '_layout'),
  )
  triggerProblems = declared.filter((name) => !available.has(name))
  if (triggerProblems.length > 0) {
    console.error('✘ Tab triggers naming routes that do not exist:\n')
    for (const name of triggerProblems) console.error(`  name="${name}"`)
    console.error(`\nAvailable under app/(tabs): ${[...available].join(', ')}`)
    process.exit(1)
  }
} catch {
  // No native tabs layout: nothing to check.
}

console.log(`✔ ${byUrl.size} routes, no URL claimed twice`)
for (const [url, [file]] of [...byUrl].sort()) {
  console.log(`    ${(url || '/').padEnd(32)} ${file}`)
}
