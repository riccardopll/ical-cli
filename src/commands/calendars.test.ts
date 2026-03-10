import { beforeEach, describe, expect, it, mock, vi } from "bun:test";
import type { Mock } from "bun:test";
import type { Calendar } from "../types";

vi.mock("../sqlite/calendar", () => ({
  listCalendars: vi.fn(),
}));

vi.mock("../formatter", () => ({
  formatCalendars: vi.fn(),
}));

import { calendarsCommand } from "./calendars";
import { formatCalendars } from "../formatter";
import { listCalendars } from "../sqlite/calendar";

const listCalendarsMock = listCalendars as Mock<typeof listCalendars>;
const formatCalendarsMock = formatCalendars as Mock<typeof formatCalendars>;

describe("calendarsCommand", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prints the formatted calendar list", async () => {
    const calendars: Calendar[] = [
      { id: "cal-1", name: "Personal", color: "#ff0000" },
      { id: "cal-2", name: "Work", color: "#00ff00" },
    ];

    listCalendarsMock.mockResolvedValue(calendars);
    formatCalendarsMock.mockReturnValue("formatted calendars");

    await calendarsCommand();

    expect(listCalendars).toHaveBeenCalledTimes(1);
    expect(formatCalendars).toHaveBeenCalledWith(calendars);
    expect(logSpy).toHaveBeenCalledWith("formatted calendars");
  });
});
