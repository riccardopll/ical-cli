import { Database } from "bun:sqlite";
import type { Calendar, CalendarEvent } from "../types";

const APPLE_EPOCH_MS = Date.UTC(2001, 0, 1, 0, 0, 0, 0);

const DEFAULT_DB_CANDIDATES = [
  "Library/Group Containers/group.com.apple.calendar/Calendar.sqlitedb",
  "Library/Calendars/Calendar.sqlitedb",
  "Library/Calendars/Calendar Cache",
];

interface CalendarRow {
  id: string;
  name: string;
  color: string;
}

interface EventRow {
  id: string;
  calendarId: string;
  calendarName: string;
  title: string;
  startDate: number;
  endDate: number;
  location: string;
  notes: string;
  allDay: number;
}

export async function listCalendars(): Promise<Calendar[]> {
  return withCalendarDb((db) => {
    const query = db.query<CalendarRow, []>(`
      SELECT
        COALESCE(UUID, CAST(ROWID AS TEXT)) AS id,
        title AS name,
        COALESCE(color, '') AS color
      FROM Calendar
      WHERE title IS NOT NULL
        AND TRIM(title) <> ''
      ORDER BY display_order, title COLLATE NOCASE
    `);

    return query.all();
  });
}

export async function listEvents(
  startDate: Date,
  endDate: Date,
  calendarName?: string,
): Promise<CalendarEvent[]> {
  const start = dateToAppleSeconds(startDate);
  const end = dateToAppleSeconds(endDate);
  const normalizedCalendarName = calendarName?.trim().toLowerCase() ?? null;

  return withCalendarDb((db) => {
    const query = db.query<
      EventRow,
      [string | null, string | null, number, number]
    >(`
      SELECT
        CASE
          WHEN ci.has_recurrences = 1 THEN ci.unique_identifier || ':' || CAST(COALESCE(oc.occurrence_date, oc.occurrence_start_date, ci.start_date) AS INTEGER)
          ELSE ci.unique_identifier
        END AS id,
        COALESCE(c.UUID, CAST(c.ROWID AS TEXT)) AS calendarId,
        c.title AS calendarName,
        ci.summary AS title,
        COALESCE(oc.occurrence_start_date, oc.occurrence_date, ci.start_date) AS startDate,
        COALESCE(oc.occurrence_end_date, ci.end_date) AS endDate,
        COALESCE(l.title, '') AS location,
        COALESCE(ci.description, '') AS notes,
        ci.all_day AS allDay
      FROM OccurrenceCache oc
      JOIN CalendarItem ci ON ci.ROWID = oc.event_id
      JOIN Calendar c ON c.ROWID = ci.calendar_id
      LEFT JOIN Location l ON l.ROWID = ci.location_id
      WHERE c.title IS NOT NULL
        AND TRIM(c.title) <> ''
        AND ci.summary IS NOT NULL
        AND (? IS NULL OR LOWER(c.title) = ?)
        AND COALESCE(oc.occurrence_end_date, ci.end_date) > ?
        AND COALESCE(oc.occurrence_start_date, oc.occurrence_date, ci.start_date) < ?
      ORDER BY startDate, endDate, title COLLATE NOCASE
    `);

    const rows = query.all(
      normalizedCalendarName,
      normalizedCalendarName,
      start,
      end,
    );

    return rows.map((row) => ({
      id: row.id,
      calendarId: row.calendarId,
      calendarName: row.calendarName,
      title: row.title,
      startDate: appleSecondsToDate(row.startDate),
      endDate: appleSecondsToDate(row.endDate),
      location: row.location,
      notes: row.notes,
      allDay: Boolean(row.allDay),
    }));
  });
}

async function withCalendarDb<T>(run: (db: Database) => T): Promise<T> {
  const dbPath = await resolveCalendarDbPath();
  const db = new Database(dbPath, {
    readonly: true,
    readwrite: false,
    create: false,
  });

  try {
    return run(db);
  } finally {
    db.close();
  }
}

async function resolveCalendarDbPath(): Promise<string> {
  const explicitPath = Bun.env.ICAL_CALENDAR_DB_PATH?.trim();
  if (explicitPath) {
    if (await Bun.file(explicitPath).exists()) {
      return explicitPath;
    }

    throw new Error(
      `Calendar DB not found at ICAL_CALENDAR_DB_PATH=${explicitPath}`,
    );
  }

  const home = Bun.env.HOME;
  if (!home) {
    throw new Error(
      "HOME is not set; cannot locate the macOS Calendar database",
    );
  }

  for (const relativePath of DEFAULT_DB_CANDIDATES) {
    const candidate = `${home}/${relativePath}`;
    if (await Bun.file(candidate).exists()) {
      return candidate;
    }
  }

  throw new Error(
    "Could not locate the macOS Calendar database. Set ICAL_CALENDAR_DB_PATH to an existing SQLite file.",
  );
}

function dateToAppleSeconds(date: Date): number {
  return (date.getTime() - APPLE_EPOCH_MS) / 1000;
}

function appleSecondsToDate(seconds: number): Date {
  return new Date(APPLE_EPOCH_MS + seconds * 1000);
}
