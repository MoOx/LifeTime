#!/usr/bin/env node
/**
 * Keep `src/domain` pure (docs/spec/50-architecture.md, "Layout").
 *
 * The domain is plain TypeScript tested on Node. A runtime import of React Native or Expo
 * would make those tests lie (Node has no native modules) and would tie the logic to one
 * platform. Type-only imports are allowed: they vanish at compile time.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const domain = join(root, 'src', 'domain')

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : /\.tsx?$/.test(entry) ? [full] : []
  })

const FORBIDDEN = /^(react-native|react-native-.*|expo|expo-.*|@expo\/.*|react)$/
const IMPORT = /^\s*import\s+(type\s+)?[^'"]*?from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)/gm

const offences = []
for (const file of walk(domain)) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(IMPORT)) {
    const typeOnly = Boolean(match[1])
    const spec = match[2] ?? match[3] ?? match[4]
    const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
    if (!typeOnly && FORBIDDEN.test(pkg)) offences.push(`${relative(root, file)}: ${spec}`)
  }
}

if (offences.length) {
  console.error('✘ src/domain imports React Native or Expo at runtime:')
  for (const line of offences) console.error(`    ${line}`)
  process.exit(1)
}
console.log(`✔ ${walk(domain).length} domain files, no runtime React Native or Expo import`)
