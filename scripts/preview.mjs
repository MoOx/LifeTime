/**
 * Render every screen and photograph it, without a device.
 *
 * The slowest thing about this rewrite has not been writing code — it has been that a
 * layout mistake costs a twenty-minute TestFlight build and a person to look at the
 * result. Three separate rounds were spent that way on bugs a screenshot would have shown
 * in a second.
 *
 * So: export the app for web, serve it, drive it with a headless browser, and save a
 * picture of each route. What this catches is exactly the class of bug that has been
 * expensive — layout, spacing, type hierarchy, list grammar, chart geometry, empty
 * states, and any JavaScript error thrown during render.
 *
 * **What it cannot catch, and must not be trusted for:** anything native. The large-title
 * header, Liquid Glass, `Picker` menus, SF Symbols, the tab bar, Dynamic Type and the
 * Skia rings are either absent or approximated on web. This is a preview of *our* layout,
 * not of the platform's chrome. A screen that looks right here can still be wrong on a
 * phone — but a screen that looks wrong here is definitely wrong.
 *
 *     npm run preview            export, shoot every route, report errors
 *     npm run preview -- --keep  leave the server up on :8321
 */

import { spawn } from 'node:child_process'
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, '.preview/web')
const shots = join(root, '.preview/shots')
const PORT = 8321

/**
 * Some screens only exist once there is data — an empty Goals tab never shows a goal
 * card, so the card cannot be checked at all. The web build persists settings to
 * `localStorage`, so a route can be given a seed that is written before the app boots.
 *
 * This is the same document shape `domain/settings.ts` parses, so a malformed seed fails
 * the same way a malformed backup would.
 */
const SETTINGS_KEY = 'lifetime.settings.v2'

const withGoals = {
  version: 2,
  goals: [
    {
      id: 'seed-rest',
      title: '',
      createdAt: 0,
      mode: 'goal',
      days: [false, true, true, true, true, true, false],
      durationPerDay: 480,
      categoryIds: ['rest'],
      activityIds: [],
      period: 'week',
    },
    {
      id: 'seed-fun',
      title: 'Screen time',
      createdAt: 0,
      mode: 'limit',
      days: [true, true, true, true, true, true, true],
      durationPerDay: 90,
      categoryIds: ['fun'],
      activityIds: [],
      period: 'week',
    },
  ],
}

/** Every route worth looking at, and what it is meant to show. */
const ROUTES = [
  ['summary', '/'],
  ['goals', '/goals'],
  ['goals-filled', '/goals', withGoals],
  ['goal-editor', '/goals/new'],
  ['settings', '/settings'],
  ['filters', '/filters'],
  ['categorize', '/categorize'],
  ['privacy', '/privacy'],
  ['welcome', '/welcome'],
  ['reminders', '/reminders'],
  ['backup', '/backup'],
  ['activity', '/activity/Deep%20work'],
]

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
}

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit' })
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)),
    )
  })

/**
 * A static server with a single-page fallback. Without the fallback every route but `/`
 * is a 404 from the *server*, which looks exactly like a broken route in the app — a
 * false alarm that cost a few minutes the first time.
 */
const serve = () =>
  new Promise((resolve) => {
    const server = createServer((request, response) => {
      const url = new URL(request.url, 'http://localhost')
      const candidate = join(dist, normalize(decodeURIComponent(url.pathname)))
      const file =
        existsSync(candidate) && statSync(candidate).isFile()
          ? candidate
          : join(dist, 'index.html')
      response.writeHead(200, {
        'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
      })
      createReadStream(file).pipe(response)
    })
    server.listen(PORT, () => resolve(server))
  })

console.log('▸ exporting for web…')
await run('npx', ['expo', 'export', '--platform', 'web', '--output-dir', dist])

const server = await serve()
console.log(`▸ serving ${dist} on http://localhost:${PORT}`)

const { chromium } = await import('playwright')
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
})

mkdirSync(shots, { recursive: true })

let failures = 0

for (const [name, route, seed] of ROUTES) {
  const page = await browser.newPage({
    // iPhone 16 Pro logical size.
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 2,
  })

  if (seed !== undefined) {
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [SETTINGS_KEY, JSON.stringify(seed)],
    )
  }

  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle' })
  // The router mounts, then the settings store loads, then the report resolves.
  await page.waitForTimeout(2000)
  await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true })

  /**
   * A second shot at the bottom, when there is one. A floating sheet or a tab bar sits
   * over the content at rest, so anything wrong at the *end* of a screen is invisible in
   * the first shot — which is how a permission sheet came to be covering the last row of
   * the activity list without anyone noticing.
   */
  const scrollable = await page.evaluate(() => {
    const el = document.scrollingElement ?? document.body
    const overflow = el.scrollHeight - el.clientHeight
    if (overflow > 40) {
      el.scrollTop = el.scrollHeight
      return true
    }
    // React Native Web often scrolls an inner element rather than the document.
    const inner = [...document.querySelectorAll('div')].find(
      (d) => d.scrollHeight - d.clientHeight > 40,
    )
    if (inner === undefined) return false
    inner.scrollTop = inner.scrollHeight
    return true
  })

  if (scrollable) {
    await page.waitForTimeout(500)
    await page.screenshot({ path: join(shots, `${name}-bottom.png`) })
  }

  const body = await page.evaluate(() => document.body.innerText)
  const unmatched = body.includes('Unmatched Route')
  const blank = body.trim().length < 20

  if (errors.length > 0 || unmatched || blank) {
    failures += 1
    console.log(`✘ ${name.padEnd(14)} ${route}`)
    if (unmatched) console.log('     route did not match')
    if (blank) console.log('     rendered nothing')
    for (const error of errors.slice(0, 3)) console.log(`     ${error}`)
  } else {
    console.log(`✔ ${name.padEnd(14)} ${route}`)
  }

  await page.close()
}

await browser.close()

console.log(`\n▸ screenshots in ${shots}`)

if (process.argv.includes('--keep')) {
  console.log(`▸ server still up on http://localhost:${PORT} — ctrl-c to stop`)
} else {
  server.close()
  process.exit(failures > 0 ? 1 : 0)
}
