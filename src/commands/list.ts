import dayjs from "dayjs";
import { listEvents } from "../sqlite/calendar";
import { formatEvents } from "../formatter";
import type { ListOptions } from "../types";

export async function listCommand(options: ListOptions): Promise<void> {
  let startDate: Date;
  let endDate: Date;

  if (options.from && options.to) {
    startDate = dayjs(options.from).startOf("day").toDate();
    endDate = dayjs(options.to).endOf("day").toDate();
  } else {
    const days = options.days ? parseInt(String(options.days), 10) : 1;
    startDate = dayjs().startOf("day").toDate();
    endDate = dayjs().add(days, "day").endOf("day").toDate();
  }

  const events = await listEvents(startDate, endDate, options.calendar);
  console.log(formatEvents(events));
}
