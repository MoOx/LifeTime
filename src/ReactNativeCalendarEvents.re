// ReasonML bindings for react-native-calendar v1.7.0

type isoDateString = string;

[@bs.deriving {jsConverter: newType}]
type authorizationStatus = [
  | `denied
  | `restricted
  | `authorized
  | `undetermined
];

[@bs.deriving {jsConverter: newType}]
type recurrenceFrequency = [ | `daily | `weekly | `monthly | `yearly];

type coords = {
  latitude: float,
  longitude: float,
};

/* iOS ONLY - GeoFenced alarm location */
type alarmStructuredLocation = {
  /* The title of the location. */
  title: string,
  /* A value indicating how a location-based alarm is triggered. */
  proximity: string, // [@bs.string] [ | `enter | `leave | `none],
  /* A minimum distance from the core location that would trigger the calendar event's alarm. */
  radius: float,
  /* The geolocation coordinates, as an object with latitude and longitude properties. */
  coords,
};

type options = {
  /* The start date of a recurring event's exception instance. Used for updating single event in a recurring series. */
  exceptionDate: isoDateString,
  /* iOS ONLY - If true the update will span all future events. If false it only update the single instance. */
  futureEvents: option(bool),
};

type alarm = {
  /* When saving an event, if a Date is given, an alarm will be set with an absolute date. If a float is given, an alarm will be set with a relative offset (in minutes) from the start date. When reading an event this will always be an ISO Date string */
  date: isoDateString,
  /* iOS ONLY - The location to trigger an alarm. */
  structuredLocation: option(alarmStructuredLocation),
};

type recurrenceRule = {
  /* Event recurring frequency. */
  frequency: recurrenceFrequency,
  /* Event recurring end date. This overrides occurrence. */
  endDate: isoDateString,
  /* float of event occurrences */
  occurrence: float,
  /* The interval between events of this recurrence. */
  interval: float,
};

type attendee = {
  /* The name of the attendee. */
  name: string,
  /* The email address of the attendee. */
  email: string,
  /* iOS ONLY - The The phone float of the attendee. */
  phone: option(string),
};

type calendar = {
  /* Unique calendar ID. */
  id: string,
  /* The calendar’s title. */
  title: string,
  /* The calendar’s type. */
  [@bs.as "type"]
  type_: string,
  /* The source object representing the account to which this calendar belongs. */
  source: string,
  /* Indicates if the calendar is assigned as primary. */
  isPrimary: bool,
  /* Indicates if the calendar allows events to be written, edited or removed. */
  allowsModifications: bool,
  /* The color assigned to the calendar represented as a hex value. */
  color: string,
  /* The event availability settings supported by the calendar. */
  allowedAvailabilities: array(string),
};

type calendarEventReadable = {
  // base
  /* The start date of the calendar event in ISO format */
  startDate: isoDateString,
  /* The end date of the calendar event in ISO format. */
  endDate: isoDateString,
  /* Unique id for the calendar where the event will be saved. Defaults to the device's default  calendar. */
  calendarId: option(string),
  /* Indicates whether the event is an all-day event. */
  allDay: option(bool),
  /* The simple recurrence frequency of the calendar event. */
  recurrence: option(abs_recurrenceFrequency),
  /* The location associated with the calendar event. */
  location: option(string),
  /* iOS ONLY - Indicates whether an event is a detached instance of a repeating event. */
  isDetached: option(bool),
  /* iOS ONLY - The url associated with the calendar event. */
  url: option(string),
  /* iOS ONLY - The notes associated with the calendar event. */
  notes: option(string),
  /* ANDROID ONLY - The description associated with the calendar event. */
  description: option(string),
  // read-only
  /* Unique id for the calendar event */
  id: string,
  /* The title for the calendar event. */
  title: string,
  /* The attendees of the event, including the organizer. */
  attendees: option(array(attendee)),
  /* The calendar containing the event */
  calendar: option(calendar),
  /* iOS ONLY - The original occurrence date of an event if it is part of a recurring series. */
  occurrenceDate: option(isoDateString),
  /* The alarms associated with the calendar event, as an array of alarm objects. */
  alarms: option(array(alarm)),
};

type calendarEventWritable = {
  // base
  /* The start date of the calendar event in ISO format */
  startDate: isoDateString,
  /* The end date of the calendar event in ISO format. */
  endDate: isoDateString,
  /* Unique id for the calendar where the event will be saved. Defaults to the device's default  calendar. */
  calendarId: option(string),
  /* Indicates whether the event is an all-day event. */
  allDay: option(bool),
  /* The simple recurrence frequency of the calendar event. */
  recurrence: option(recurrenceFrequency),
  /* The location associated with the calendar event. */
  location: option(string),
  /* iOS ONLY - Indicates whether an event is a detached instance of a repeating event. */
  isDetached: option(bool),
  /* iOS ONLY - The url associated with the calendar event. */
  url: option(string),
  /* iOS ONLY - The notes associated with the calendar event. */
  notes: option(string),
  /* ANDROID ONLY - The description associated with the calendar event. */
  description: option(string),
  // write-only
  /* Unique id for the calendar event, used for updating existing events */
  id: option(string),
  /* The event's recurrence settings */
  recurrenceRule: option(recurrenceRule),
  /* The alarms associated with the calendar event, as an array of alarm objects. */
  alarms: option(array(alarm)),
};

[@bs.deriving jsConverter]
type calendarEntityTypeiOS = [ | `event | `reminder];

[@bs.deriving jsConverter]
type calendarAccessLevelAndroid = [
  | `contributor
  | `editor
  | `freebusy
  | `override
  | `owner
  | `read
  | `respond
  | `root
];

type calendarAccountSourceAndroid = {
  /* The Account name */
  name: string,
  /* The Account type */
  [@bs.as "type"]
  type_: option(string),
  /* The source (required if source.type is not used) */
  isLocalAccount: option(bool),
};

type calendarOptions = {
  /* The calendar title */
  title: string,
  /* The calendar color */
  color: string,
  /* iOS ONLY - Entity type for the calendar */
  entityType: calendarEntityTypeiOS,
  /* Android ONLY - The calendar name */
  name: string,
  /* Android ONLY - Defines how the event shows up for others when the calendar is shared */
  accessLevel: calendarAccessLevelAndroid,
  /* Android ONLY - The owner account for this calendar, based on the calendar feed */
  ownerAccount: string,
  /* Android ONLY - The calendar Account source */
  source: calendarAccountSourceAndroid,
};

/* Get calendar authorization status. */
[@bs.module "react-native-calendar-events"] [@bs.scope "default"]
external authorizationStatus: unit => Js.Promise.t(abs_authorizationStatus) =
  "authorizationStatus";

/* Request calendar authorization. Authorization must be granted before accessing calendar events. */
[@bs.module "react-native-calendar-events"] [@bs.scope "default"]
external authorizeEventStore: unit => Js.Promise.t(abs_authorizationStatus) =
  "authorizeEventStore";

/* Finds all the calendars on the device. */
[@bs.module "react-native-calendar-events"] [@bs.scope "default"]
external findCalendars: unit => Js.Promise.t(array(calendar)) =
  "findCalendars";

/* Create a calendar.
 * @param calendar - Calendar to create
 */
[@bs.module "react-native-calendar-events"] [@bs.scope "default"]
external saveCalendar: calendarOptions => Js.Promise.t(string) =
  "saveCalendar";

/**
 * Find calendar event by id.
 * @param id - Event ID
 */
[@bs.module "react-native-calendar-events"] [@bs.scope "default"]
external findEventById:
  string => Js.Promise.t(Js.Nullable.t(calendarEventReadable)) =
  "findEventById";

/**
 * Fetch all calendar events.
 * @param startDate - Date string in ISO format
 * @param endDate - Date string in ISO format
 * @param [calendarIds] - List of calendar id strings to specify calendar events. Defaults to all calendars if empty.
 */
[@bs.module "react-native-calendar-events"] [@bs.scope "default"]
external fetchAllEvents:
  (isoDateString, isoDateString, option(array(string))) =>
  Js.Promise.t(array(calendarEventReadable)) =
  "fetchAllEvents";

/**
 * Creates or updates a calendar event. To update an event, the event id must be defined.
 * @param title - The title of the event
 * @param details - Event details
 * @param [options] - Options specific to the saved event.
 * @returns - Promise resolving to saved event's ID.
 */
[@bs.module "react-native-calendar-events"] [@bs.scope "default"]
external saveEvent:
  (string, calendarEventWritable, option(options)) => Js.Promise.t(string) =
  "saveEvent";

/**
 * Removes calendar event.
 * @param id - The event id
 * @param [options] - Options specific to the saved event.
 * @returns - Promise resolving to bool to indicate if removal succeeded.
 */
[@bs.module "react-native-calendar-events"] [@bs.scope "default"]
external removeEvent: (string, option(options)) => Js.Promise.t(bool) =
  "removeEvent";
