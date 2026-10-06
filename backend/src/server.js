import "dotenv/config";
import cron from "node-cron";

import app from "./app.js";
import { runFollowUpReminderJob } from "./jobs/followUpReminder.js";
import { runMeetingReminderJob } from "./jobs/meetingReminder.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Cyvora CRM backend running on http://localhost:${PORT}`);
});

cron.schedule(
  "*/10 * * * *",
  () => {
    console.log("Running follow-up reminder job...");

    runFollowUpReminderJob().catch((err) =>
      console.error("Follow-up reminder job failed:", err)
    );
  },
  {
    timezone: "Asia/Kolkata",
  }
);

runFollowUpReminderJob().catch((err) =>
  console.error("Follow-up reminder job (startup run) failed:", err)
);
cron.schedule("*/5 * * * *", () => runMeetingReminderJob().catch((err) => console.error("Meeting reminder job failed:", err)), { timezone: "Asia/Kolkata" });
runMeetingReminderJob().catch((err) => console.error("Meeting reminder startup failed:", err));
