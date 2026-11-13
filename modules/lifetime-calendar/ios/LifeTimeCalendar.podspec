Pod::Spec.new do |s|
  s.name           = 'LifeTimeCalendar'
  s.version        = '1.0.0'
  s.summary        = 'Read-only calendar access for LifeTime, created on first use'
  s.author         = 'LifeTime'
  s.homepage       = 'https://github.com/MoOx/LifeTime'
  s.license        = 'MIT'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks     = 'EventKit'
  s.source_files   = '**/*.swift'
  # The write functions Maestro seeds the simulator with exist only in E2E builds
  # (EXPO_PUBLIC_E2E=1 when `pod install` runs); a shipped build cannot write.
  conditions = ENV['EXPO_PUBLIC_E2E'] == '1' ? '$(inherited) LIFETIME_E2E' : '$(inherited)'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => conditions,
  }
end
