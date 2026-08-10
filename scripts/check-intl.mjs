/**
 * Refuse to ship an `Intl` constructor Hermes does not have.
 *
 * Hermes implements only part of `Intl`. Its Apple layer
 * (`lib/Platform/Intl/PlatformIntlApple.mm`) and its Android layer provide `Collator`,
 * `DateTimeFormat`, `NumberFormat` and `getCanonicalLocales`. Everything else —
 * `RelativeTimeFormat`, `PluralRules`, `ListFormat`, `DisplayNames`, `Segmenter`,
 * `DurationFormat` — is simply absent.
 *
 * Absent does not degrade: `new Intl.RelativeTimeFormat(...)` is a `TypeError` thrown
 * during render, which React Native escalates to a fatal exception, and the app dies at
 * launch with a crash log that names none of this. Node has the full set, so nothing in
 * `tsc` or Jest notices — the difference between the development engine and the shipping
 * engine is invisible until it is a build on a device.
 *
 * A guarded use is fine and is what `formatRelative` does: feature-detect, and fall back
 * to a constructor that exists. This script allows exactly that shape and flags the rest.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const SEARCH_DIRS = ['src', 'app']
const EXTENSIONS = ['.ts', '.tsx']

/** What Hermes actually ships. */
const SUPPORTED = new Set([
  'Collator',
  'DateTimeFormat',
  'NumberFormat',
  'getCanonicalLocales',
])

/**
 * Tests are exempt: they run on Node, which has the full `Intl`, and the fallback path
 * can only be exercised by naming the constructor that is missing on Hermes.
 */
const isTest = (path) => path.includes('__tests__') || /\.test\.tsx?$/.test(path)

const walk = (dir) => {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (!isTest(full)) out.push(...walk(full))
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext)) && !isTest(full)) {
      out.push(full)
    }
  }
  return out
}

const files = SEARCH_DIRS.flatMap((dir) => walk(join(root, dir)))

const problems = []

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const lines = source.split('\n')

  // A file may declare it feature-detects; that is the only sanctioned escape.
  const guarded = /typeof \(?Intl[^)]*\)?\.?\w*\s*(as[^)]*)?\)?\.\w+ === 'function'/.test(
    source,
  )

  lines.forEach((line, index) => {
    for (const match of line.matchAll(/\bIntl\.(\w+)/g)) {
      const name = match[1]
      if (SUPPORTED.has(name)) continue
      // The feature-detection line itself, and type positions, are not calls.
      if (line.includes('typeof')) continue
      if (/^\s*(\*|\/\/)/.test(line)) continue
      if (/:\s*Intl\./.test(line)) continue
      if (guarded) continue

      problems.push({
        file: relative(root, file),
        line: index + 1,
        name,
        text: line.trim(),
      })
    }
  })
}

if (problems.length > 0) {
  console.error('✘ Intl APIs Hermes does not implement, used without a guard:\n')
  for (const problem of problems) {
    console.error(`  ${problem.file}:${problem.line}  Intl.${problem.name}`)
    console.error(`      ${problem.text}`)
  }
  console.error(
    `\nHermes ships only: ${[...SUPPORTED].join(', ')}.\n` +
      'Calling anything else throws a TypeError at render time and kills the app at\n' +
      'launch. Either use a supported constructor, or feature-detect with\n' +
      "`typeof (Intl as { X?: unknown }).X === 'function'` and provide a fallback.",
  )
  process.exit(1)
}

console.log(`✔ ${files.length} files use only Intl APIs Hermes implements`)
