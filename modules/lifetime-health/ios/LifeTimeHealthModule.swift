import ExpoModulesCore
import HealthKit

/// Read-only HealthKit access for LifeTime: sleep, workouts and mindful sessions, the three
/// families that are labelled intervals (docs/DATA-SOURCES.md, "HealthKit turns sleep and
/// workouts into labelled intervals"). Spike 5, docs/spikes/05-healthkit.md.
///
/// Built like `LifeTimeCalendar` (docs/slices/4/README.md) rather than on
/// `@kingstinct/react-native-healthkit`: three sample types and one change signal are a
/// hundred lines of Swift, with no Nitro runtime to carry; and the write functions Maestro
/// seeds the simulator with are compiled into E2E builds only (see the podspec), so a
/// shipped build cannot write to Health.
public class LifeTimeHealthModule: Module {
  private let store = HKHealthStore()
  private var observers: [HKObserverQuery] = []

  private static let sleep = HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
  private static let mindful = HKObjectType.categoryType(forIdentifier: .mindfulSession)!
  private static let workout = HKObjectType.workoutType()

  private static var sampleTypes: [HKSampleType] { [sleep, workout, mindful] }
  private static var readTypes: Set<HKObjectType> { Set(sampleTypes) }

  /// What LifeTime asks to write: nothing, except in E2E builds, which seed the simulator.
  private static var shareTypes: Set<HKSampleType> {
    #if LIFETIME_E2E
      return Set(sampleTypes)
    #else
      return []
    #endif
  }

  public func definition() -> ModuleDefinition {
    Name("LifeTimeHealth")

    Events("onChange")

    /// False on a device without Health (some iPads).
    Function("isAvailable") { HKHealthStore.isHealthDataAvailable() }

    /// "shouldRequest" while iOS still has something to ask, "unnecessary" once the sheet has
    /// been answered, whatever the answer: HealthKit never tells an app that reading was
    /// refused, it returns no samples instead.
    AsyncFunction("getRequestStatus") { (promise: Promise) in
      self.store.getRequestStatusForAuthorization(toShare: Self.shareTypes, read: Self.readTypes) {
        status, error in
        if let error {
          promise.reject("E_HEALTH_STATUS", error.localizedDescription)
          return
        }
        switch status {
        case .shouldRequest: promise.resolve("shouldRequest")
        case .unnecessary: promise.resolve("unnecessary")
        default: promise.resolve("unknown")
        }
      }
    }

    /// Shows iOS's Health sheet once. Resolves true when the sheet was answered, which says
    /// nothing about what was allowed.
    AsyncFunction("requestAccess") { (promise: Promise) in
      self.store.requestAuthorization(toShare: Self.shareTypes, read: Self.readTypes) {
        answered, error in
        if let error {
          promise.reject("E_HEALTH_ACCESS", error.localizedDescription)
          return
        }
        // Observer queries started before the sheet was answered never fire (spike 5):
        // start them again now that HealthKit knows what LifeTime may read.
        if self.observing {
          self.stopObservers()
          self.startObservers()
        }
        promise.resolve(answered)
      }
    }

    /// Sleep, workout and mindful samples overlapping [start, end), times in milliseconds
    /// since 1970, oldest first.
    AsyncFunction("listSamples") { (start: Double, end: Double) async throws -> [[String: Any]] in
      let predicate = HKQuery.predicateForSamples(
        withStart: Date(timeIntervalSince1970: start / 1000),
        end: Date(timeIntervalSince1970: end / 1000),
        options: []
      )
      var rows: [[String: Any]] = []
      for type in Self.sampleTypes {
        for sample in try await self.samples(of: type, matching: predicate) {
          rows.append(Self.row(sample))
        }
      }
      return rows.sorted { ($0["start"] as! Double) < ($1["start"] as! Double) }
    }

    /// HealthKit's change signal (HKObserverQuery), one per type, while JS listens. In the
    /// foreground only: background delivery needs its own entitlement and does not run in
    /// the simulator (docs/DATA-SOURCES.md).
    OnStartObserving {
      self.observing = true
      self.startObservers()
    }

    OnStopObserving {
      self.observing = false
      self.stopObservers()
    }

    #if LIFETIME_E2E
      // Writes, for Maestro's seeding only: compiled into E2E builds alone (see the podspec).
      // Every seeded sample carries the metadata key below, so a reset removes those alone.

      AsyncFunction("e2eDeleteSeeded") { () async throws -> Int in
        let predicate = HKQuery.predicateForObjects(
          withMetadataKey: Self.e2eKey, allowedValues: [true])
        var deleted = 0
        for type in Self.sampleTypes {
          deleted += try await self.store.deleteObjects(of: type, predicate: predicate)
        }
        return deleted
      }

      /// value: HKCategoryValueSleepAnalysis's raw value (0 in bed, 1 asleep unspecified,
      /// 2 awake, 3 core, 4 deep, 5 REM).
      AsyncFunction("e2eSaveSleep") { (start: Double, end: Double, value: Int) async throws in
        let sample = HKCategorySample(
          type: Self.sleep, value: value,
          start: Date(timeIntervalSince1970: start / 1000),
          end: Date(timeIntervalSince1970: end / 1000),
          metadata: [Self.e2eKey: true])
        try await self.store.save(sample)
      }

      AsyncFunction("e2eSaveMindful") { (start: Double, end: Double) async throws in
        let sample = HKCategorySample(
          type: Self.mindful, value: HKCategoryValue.notApplicable.rawValue,
          start: Date(timeIntervalSince1970: start / 1000),
          end: Date(timeIntervalSince1970: end / 1000),
          metadata: [Self.e2eKey: true])
        try await self.store.save(sample)
      }

      /// activityType: HKWorkoutActivityType's raw value (37 running, 50 traditional strength
      /// training, 57 yoga, 13 cycling).
      AsyncFunction("e2eSaveWorkout") { (activityType: UInt, start: Double, end: Double) async throws in
        guard let type = HKWorkoutActivityType(rawValue: activityType) else {
          throw Exception(name: "E_ACTIVITY", description: "Unknown activity \(activityType)")
        }
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = type
        let builder = HKWorkoutBuilder(
          healthStore: self.store, configuration: configuration, device: .local())
        try await builder.beginCollection(at: Date(timeIntervalSince1970: start / 1000))
        try await builder.addMetadata([Self.e2eKey: true])
        try await builder.endCollection(at: Date(timeIntervalSince1970: end / 1000))
        _ = try await builder.finishWorkout()
      }
    #endif
  }

  private static let e2eKey = "LifeTimeE2E"

  private var observing = false

  private func startObservers() {
    observers = Self.sampleTypes.map { type in
      let query = HKObserverQuery(sampleType: type, predicate: nil) { [weak self] _, done, error in
        if error == nil { self?.sendEvent("onChange", ["type": type.identifier]) }
        done()
      }
      store.execute(query)
      return query
    }
  }

  private func stopObservers() {
    observers.forEach { store.stop($0) }
    observers = []
  }

  private func samples(of type: HKSampleType, matching predicate: NSPredicate) async throws
    -> [HKSample]
  {
    try await withCheckedThrowingContinuation { continuation in
      let query = HKSampleQuery(
        sampleType: type, predicate: predicate, limit: HKObjectQueryNoLimit,
        sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
      ) { _, samples, error in
        // Before the sheet has been answered HealthKit fails the query rather than returning
        // nothing; to LifeTime that is simply no data yet.
        if let error = error as? HKError, error.code == .errorAuthorizationNotDetermined {
          continuation.resume(returning: [])
        } else if let error {
          continuation.resume(throwing: error)
        } else {
          continuation.resume(returning: samples ?? [])
        }
      }
      store.execute(query)
    }
  }

  /// One sample as LifeTime's observation: kind, interval, label, and who wrote it (the
  /// source decides which copy wins when two writers record the same thing, D23).
  private static func row(_ sample: HKSample) -> [String: Any] {
    var row: [String: Any] = [
      "id": sample.uuid.uuidString,
      "start": sample.startDate.timeIntervalSince1970 * 1000,
      "end": sample.endDate.timeIntervalSince1970 * 1000,
      "source": sample.sourceRevision.source.bundleIdentifier,
      "sourceName": sample.sourceRevision.source.name,
    ]
    if let workout = sample as? HKWorkout {
      row["kind"] = "workout"
      row["activityType"] = workout.workoutActivityType.rawValue
    } else if let category = sample as? HKCategorySample {
      if category.categoryType == sleep {
        row["kind"] = "sleep"
        row["sleepValue"] = category.value
      } else {
        row["kind"] = "mindful"
      }
    }
    return row
  }
}
