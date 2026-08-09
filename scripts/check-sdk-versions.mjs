#!/usr/bin/env node
/**
 * Fails when a dependency drifts from the version Expo SDK 57 was built against.
 *
 * This exists because of a real crash: the first TestFlight build shipped
 * react-native-screens 4.27 and react-native-safe-area-context 5.8 against an SDK
 * expecting 4.26 and 5.7, and the app died on launch inside Fabric's
 * `RCTComponentViewFactory createComponentViewWithComponentHandle:` — a native component
 * the factory had no registration for. React Native 0.86 ships React as a *prebuilt*
 * framework, so a third-party Fabric component compiled against different codegen output
 * simply never registers, and you find out at runtime rather than at build time.
 *
 * `npx expo install --check` does the same job, but it needs network. This works offline,
 * from the reference list `expo` already ships, so it runs everywhere — including in CI
 * before a 20-minute signed build.
 */

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const bundled = require('expo/bundledNativeModules.json')

const declared = { ...pkg.dependencies, ...pkg.devDependencies }
const mismatches = []

for (const [name, expected] of Object.entries(bundled)) {
  const actual = declared[name]
  if (actual !== undefined && actual !== expected) {
    mismatches.push({ name, actual, expected })
  }
}

if (mismatches.length === 0) {
  console.log(`✔ ${Object.keys(declared).length} dependencies, none drifting from Expo SDK expectations`)
  process.exit(0)
}

console.error('✘ Versions do not match what this Expo SDK expects:\n')
for (const { name, actual, expected } of mismatches) {
  console.error(`  ${name}\n      declared: ${actual}\n      expected: ${expected}`)
}
console.error(
  `\nFix with:  npx expo install ${mismatches.map((m) => m.name).join(' ')}` +
    '\nor edit package.json to the expected versions and reinstall.',
)
process.exit(1)
