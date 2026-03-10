# ical-cli

Read-only macOS Calendar CLI built with Bun.

The CLI opens the Calendar database in read-only mode and queries it directly.

## Usage

| Command                                                             | Description                                       | Example                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `ical calendars`                                                    | List all available calendars.                     | `bun run src/index.ts calendars`                                              |
| `ical list --days <number>`                                         | List events from today through the next `N` days. | `bun run src/index.ts list --days 7`                                          |
| `ical list --from <YYYY-MM-DD> --to <YYYY-MM-DD>`                   | List events within an explicit date range.        | `bun run src/index.ts list --from 2026-03-10 --to 2026-03-12`                 |
| `ical list --calendar <name>`                                       | List events for one calendar, case-insensitive.   | `bun run src/index.ts list --calendar Personal`                               |
| `ical list --from <YYYY-MM-DD> --to <YYYY-MM-DD> --calendar <name>` | Combine date range and calendar filtering.        | `bun run src/index.ts list --from 2026-03-10 --to 2026-03-12 --calendar Work` |
