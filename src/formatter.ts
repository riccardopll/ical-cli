import chalk from "chalk";
import dayjs from "dayjs";
import type { Calendar, CalendarEvent } from "./types";

export function formatCalendars(calendars: Calendar[]): string {
  if (calendars.length === 0) {
    return chalk.yellow("No calendars found");
  }

  return calendars.map((cal) => `• ${chalk.bold(cal.name)}`).join("\n");
}

export function formatEvents(events: CalendarEvent[]): string {
  if (events.length === 0) {
    return chalk.yellow("No events found");
  }

  const grouped = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const dateKey = dayjs(event.startDate).format("YYYY-MM-DD");
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  }

  const lines: string[] = [];

  for (const [dateKey, dayEvents] of grouped) {
    const date = dayjs(dateKey);
    lines.push("");
    lines.push(chalk.bold.blue(date.format("dddd, MMMM D, YYYY")));

    for (const event of dayEvents) {
      const timeStr = event.allDay
        ? chalk.dim("all-day")
        : chalk.dim(
            `${dayjs(event.startDate).format("HH:mm")} - ${dayjs(event.endDate).format("HH:mm")}`,
          );

      lines.push(`  ${timeStr}  ${event.title}`);
      lines.push(chalk.dim(`           [${event.calendarName}] ${event.id}`));

      if (event.location) {
        lines.push(chalk.dim(`           📍 ${event.location}`));
      }
    }
  }

  return lines.join("\n");
}
