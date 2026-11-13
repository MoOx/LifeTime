import EventKit
import ExpoModulesCore
import UIKit

/// Read-only access to the device's calendars for LifeTime (spec/20-sources.md, "Calendar").
///
/// Why LifeTime's own module rather than `expo-calendar` (docs/slices/4/README.md):
///   - the event store's change signal (`EKEventStoreChanged`), which the spec asks for and
///     `expo-calendar` 58 does not expose, so a change synced while LifeTime is open appears
///     without any action (D13);
///   - read-only in the binary itself: the write functions Maestro seeds the simulator with
///     are compiled into E2E builds only (see the podspec), so a shipped build cannot write;
///   - the event store is created on first use, once the user has asked.
public class LifeTimeCalendarModule: Module {
  private var store: EKEventStore?
  private var observer: NSObjectProtocol?

  private func eventStore() -> EKEventStore {
    if let store { return store }
    let created = EKEventStore()
    store = created
    return created
  }

  private static var hasFullAccess: Bool {
    if #available(iOS 17.0, *) {
      return EKEventStore.authorizationStatus(for: .event) == .fullAccess
    }
    return EKEventStore.authorizationStatus(for: .event) == .authorized
  }

  public func definition() -> ModuleDefinition {
    Name("LifeTimeCalendar")

    Events("onChange")

    /// "granted", "undetermined" or "denied". A class method: no store is created.
    Function("getAccess") { () -> String in
      let status = EKEventStore.authorizationStatus(for: .event)
      if status == .notDetermined { return "undetermined" }
      return Self.hasFullAccess ? "granted" : "denied"
    }

    /// Full access, as reading requires on iOS 17 and later. Shows iOS's prompt once.
    AsyncFunction("requestAccess") { (promise: Promise) in
      let store = self.eventStore()
      let done: EKEventStoreRequestAccessCompletionHandler = { granted, error in
        if let error {
          promise.reject("E_CALENDAR_ACCESS", error.localizedDescription)
        } else {
          promise.resolve(granted)
        }
      }
      if #available(iOS 17.0, *) {
        store.requestFullAccessToEvents(completion: done)
      } else {
        store.requestAccess(to: .event, completion: done)
      }
    }

    AsyncFunction("listCalendars") { () -> [[String: Any]] in
      guard Self.hasFullAccess else { return [] }
      return self.eventStore().calendars(for: .event).map { calendar in
        [
          "id": calendar.calendarIdentifier,
          "title": calendar.title,
          "source": calendar.source?.title ?? "",
          "color": Self.hex(calendar.cgColor),
        ]
      }
    }

    /// Events overlapping [start, end), times in milliseconds since 1970.
    AsyncFunction("listEvents") { (calendarIds: [String], start: Double, end: Double) -> [[String: Any]] in
      guard Self.hasFullAccess, !calendarIds.isEmpty else { return [] }
      let store = self.eventStore()
      let wanted = Set(calendarIds)
      let calendars = store.calendars(for: .event).filter { wanted.contains($0.calendarIdentifier) }
      if calendars.isEmpty { return [] }
      let predicate = store.predicateForEvents(
        withStart: Date(timeIntervalSince1970: start / 1000),
        end: Date(timeIntervalSince1970: end / 1000),
        calendars: calendars
      )
      return store.events(matching: predicate).map { event in
        [
          "id": event.eventIdentifier ?? "",
          "calendarId": event.calendar.calendarIdentifier,
          "title": event.title ?? "",
          "start": event.startDate.timeIntervalSince1970 * 1000,
          "end": event.endDate.timeIntervalSince1970 * 1000,
          "allDay": event.isAllDay,
        ]
      }
    }

    /// The store's change signal (EKEventStoreChanged), observed only while JS listens.
    OnStartObserving { [weak self] in
      guard let self, Self.hasFullAccess else { return }
      self.observer = NotificationCenter.default.addObserver(
        forName: .EKEventStoreChanged,
        object: self.eventStore(),
        queue: .main
      ) { [weak self] _ in
        self?.sendEvent("onChange", [:])
      }
    }

    OnStopObserving {
      if let observer = self.observer {
        NotificationCenter.default.removeObserver(observer)
        self.observer = nil
      }
    }

    #if LIFETIME_E2E
    // Writes, for Maestro's seeding only: compiled into E2E builds alone (see the podspec).

    AsyncFunction("e2eResetCalendar") { (title: String) -> String? in
      let store = self.eventStore()
      for calendar in store.calendars(for: .event) where calendar.title == title {
        try store.removeCalendar(calendar, commit: true)
      }
      return nil
    }

    AsyncFunction("e2eCreateCalendar") { (title: String) -> String in
      let store = self.eventStore()
      let calendar = EKCalendar(for: .event, eventStore: store)
      calendar.title = title
      calendar.cgColor = UIColor.systemIndigo.cgColor
      guard let source = store.defaultCalendarForNewEvents?.source
        ?? store.sources.first(where: { $0.sourceType == .local }) else {
        throw Exception(name: "E_NO_SOURCE", description: "No calendar source")
      }
      calendar.source = source
      try store.saveCalendar(calendar, commit: true)
      return calendar.calendarIdentifier
    }

    AsyncFunction("e2eCreateEvent") {
      (calendarId: String, title: String, start: Double, end: Double, allDay: Bool) -> String in
      let store = self.eventStore()
      guard let calendar = store.calendar(withIdentifier: calendarId) else {
        throw Exception(name: "E_NO_CALENDAR", description: "No calendar \(calendarId)")
      }
      let event = EKEvent(eventStore: store)
      event.calendar = calendar
      event.title = title
      event.startDate = Date(timeIntervalSince1970: start / 1000)
      event.endDate = Date(timeIntervalSince1970: end / 1000)
      event.isAllDay = allDay
      try store.save(event, span: .thisEvent, commit: true)
      return event.eventIdentifier ?? ""
    }
    #endif
  }

  private static func hex(_ color: CGColor) -> String {
    let ui = UIColor(cgColor: color)
    var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
    ui.getRed(&r, green: &g, blue: &b, alpha: &a)
    return String(format: "#%02X%02X%02X", Int(r * 255), Int(g * 255), Int(b * 255))
  }
}
