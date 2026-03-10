import { program } from "commander";
import { calendarsCommand } from "./commands/calendars";
import { listCommand } from "./commands/list";

program
  .name("ical")
  .description("Read-only macOS Calendar CLI")
  .version("0.0.1");

program
  .command("calendars")
  .description("List all calendars")
  .action(calendarsCommand);

program
  .command("list")
  .description("List events")
  .option("-d, --days <number>", "Number of days to show", "1")
  .option("-f, --from <date>", "Start date (YYYY-MM-DD)")
  .option("-t, --to <date>", "End date (YYYY-MM-DD)")
  .option("-c, --calendar <name>", "Filter by calendar name")
  .action(listCommand);

program.parse();
