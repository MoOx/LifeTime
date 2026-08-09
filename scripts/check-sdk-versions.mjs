#!/usr/bin/env node
/**
 * Fails when a native dependency drifts from the version this Expo SDK was built against.
 *
 * This exists because of two real failures, one after the other:
 *
 *  1. Build 2 uploaded cleanly and segfaulted on launch, inside Fabric's
 *     `RCTComponentViewFactory createComponentViewWithComponentHandle:` — a native
 *     component the factory had no registration for. Cause: react-native-screens 4.27 and
 *     react-native-safe-area-context 5.8 shipped against an SDK expecting 4.26 and 5.7.
 *     React Native 0.86 ships React as a *prebuilt* framework, so a third-party Fabric
 *     component compiled against different codegen output never registers at all, and you
 *     find out at runtime rather than at build time.
 *
 *  2. The fix for (1) then broke `npm ci`: react-native-worklets resolved to 0.11.3 while
 *     expo-modules-core peer-requires <= 0.10.x. That one was *transitive* — nothing in
 *     package.json mentioned it — which is why this script checks the installed tree too,
 *     not just what is declared.
 *
 * `npx expo install --check` does the same job but needs network. This works offline, from
 * the reference list `expo` already ships, so it runs everywhere — including in CI before
 * a 20-minute signed build.
 */

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const semver = require('semver')

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const bundled = require('expo/bundledNativeModules.json')

const declared = { ...pkg.dependencies, ...pkg.devDependencies }

/** Declared range differs from the SDK's. */
const declaredDrift = []
/** Installed version does not satisfy the SDK's range — includes transitive packages. */
const installedDrift = []

for (const [name, expected] of Object.entries(bundled)) {
  const range = declared[name]
  if (range !== undefined && range !== expected) {
    declaredDrift.push({ name, actual: range, expected })
  }

  let installed
  try {
    installed = require(`${name}/package.json`).version
  } catch {
    continue // not installed: not our problem
  }
  if (!semver.satisfies(installed, expected, { includePrerelease: true })) {
    installedDrift.push({ name, actual: installed, expected, transitive: range === undefined })
  }
}

if (declaredDrift.length === 0 && installedDrift.length === 0) {
  const checked = Object.keys(bundled).filter((n) => {
    try {
      require(`${n}/package.json`)
      return true
    } catch {
      return false
    }
  }).length
  console.log(`✔ ${checked} SDK-managed packages installed, none drifting`)
  process.exit(0)
}

console.error('✘ Versions do not match what this Expo SDK expects:\n')

for (const { name, actual, expected } of declaredDrift) {
  console.error(`  ${name}  (declared in package.json)`)
  console.error(`      declared: ${actual}`)
  console.error(`      expected: ${expected}\n`)
}

for (const { name, actual, expected, transitive } of installedDrift) {
  console.error(`  ${name}  (installed${transitive ? ', pulled in transitively' : ''})`)
  console.error(`      installed: ${actual}`)
  console.error(`      expected:  ${expected}\n`)
}

const toFix = [...new Set([...declaredDrift, ...installedDrift].map((d) => d.name))]
console.error(`Fix with:  npx expo install ${toFix.join(' ')}`)
if (installedDrift.some((d) => d.transitive)) {
  console.error(
    'A transitive package needs pinning as a direct dependency at the expected version,\n' +
      'then a clean reinstall (rm -rf node_modules package-lock.json && npm install).',
  )
}
process.exit(1)
