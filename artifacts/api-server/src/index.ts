import app from "./app";
import { logger } from "./lib/logger";
import cron from "node-cron";
import { sendCheckinReminders } from "./routes/push";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Send check-in reminders every day at 7:00 PM server time.
  // Athletes who haven't checked in yet will get a push notification.
  cron.schedule("0 19 * * *", async () => {
    logger.info("Running daily check-in reminder job");
    await sendCheckinReminders((msg) => logger.info(msg));
  });

  logger.info("Check-in reminder scheduler started (daily at 19:00)");
});
