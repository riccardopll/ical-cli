import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  setSystemTime,
  vi,
} from "bun:test";
import type { Mock } from "bun:test";
import dayjs from "dayjs";
import type { CalendarEvent } from "../types";

vi.mock("../sqlite/calendar", () => ({
  listEvents: vi.fn(),
}));

vi.mock("../formatter", () => ({
  formatEvents: vi.fn(),
}));

import { listCommand } from "./list";
import { formatEvents } from "../formatter";
import { listEvents } from "../sqlite/calendar";

const listEventsMock = listEvents as Mock<typeof listEvents>;
const formatEventsMock = formatEvents as Mock<typeof formatEvents>;

describe("listCommand", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    setSystemTime(new Date("2026-03-10T12:00:00Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    setSystemTime();
  });

  it("uses the current day window when days is provided", async () => {
    const events: CalendarEvent[] = [
      {
        id: "evt-1",
        calendarId: "cal-1",
        calendarName: "Personal",
        title: "Morning",
        startDate: new Date("2026-03-10T07:45:00Z"),
        endDate: new Date("2026-03-10T08:30:00Z"),
        location: "",
        notes: "",
        allDay: false,
      },
    ];

    listEventsMock.mockResolvedValue(events);
    formatEventsMock.mockReturnValue("formatted events");

    await listCommand({ days: 2 });

    expect(listEvents).toHaveBeenCalledTimes(1);
    expect(listEvents).toHaveBeenCalledWith(
      dayjs().startOf("day").toDate(),
      dayjs().add(2, "day").endOf("day").toDate(),
      undefined,
    );
    expect(formatEvents).toHaveBeenCalledWith(events);
    expect(logSpy).toHaveBeenCalledWith("formatted events");
  });

  it("uses explicit from/to dates and forwards the calendar filter", async () => {
    listEventsMock.mockResolvedValue([]);
    formatEventsMock.mockReturnValue("no events");

    await listCommand({
      from: "2026-04-01",
      to: "2026-04-03",
      calendar: "Work",
    });

    expect(listEvents).toHaveBeenCalledWith(
      dayjs("2026-04-01").startOf("day").toDate(),
      dayjs("2026-04-03").endOf("day").toDate(),
      "Work",
    );
    expect(logSpy).toHaveBeenCalledWith("no events");
  });
});
