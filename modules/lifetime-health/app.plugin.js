// HealthKit's entitlement and purpose strings, in E2E builds only while HealthKit is a spike
// (docs/spikes/05-healthkit.md). A shipped build must not carry the entitlement before the
// App ID has the HealthKit capability and the provisioning profile includes it, or the
// TestFlight build fails at signing. Slice 12 makes this unconditional.
const { withEntitlementsPlist, withInfoPlist } = require('expo/config-plugins')

const READ =
  'LifeTime reads your sleep, workouts and mindful minutes to show how your week was spent. They stay on this device.'

module.exports = function withLifeTimeHealth(config) {
  if (process.env.EXPO_PUBLIC_E2E !== '1') return config
  config = withEntitlementsPlist(config, (c) => {
    c.modResults['com.apple.developer.healthkit'] = true
    c.modResults['com.apple.developer.healthkit.access'] = []
    return c
  })
  return withInfoPlist(config, (c) => {
    c.modResults.NSHealthShareUsageDescription = READ
    // E2E builds write a seeded week to the simulator's Health; shipped builds never write.
    c.modResults.NSHealthUpdateUsageDescription =
      'Test builds only: LifeTime writes a sample week to Health so its flows can be checked.'
    return c
  })
}
