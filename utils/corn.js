const cron = require("node-cron");
const { createDailyTask } = require("../controller/repeatTaskController");
const dotenv = require("dotenv");
dotenv.config();
// console.log(process.env.WEBHOOK_URL);
const webhookUrl = process.env.WEBHOOK_URL;

// Schedule daily task at 10:00 AM every day
cron.schedule(
    "0 10 * * *",
    async () => {
        await createDailyTask("Daily", webhookUrl);
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// Schedule weekly task at 10:00 AM every Monday
cron.schedule(
    "0 10 * * 1",
    async () => {
        await createDailyTask("weekly", webhookUrl);
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// Schedule monthly task at 10:00 AM on the 1st day of each month
cron.schedule(
    "0 10 * 1-12 1",
    async () => {
        await createDailyTask("monthly", webhookUrl);
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// Schedule quarterly task at 10:00 AM on the 1st day of every 3rd month
cron.schedule(
    "0 10 1 */3 *",
    async () => {
        await createDailyTask("Quarterly", webhookUrl);
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// Schedule yearly task at 10:00 AM on the 1st day of January
cron.schedule(
    "0 10 1 1 *",
    async () => {
        await createDailyTask("yearly", webhookUrl);
    },
    {
        timezone: "Asia/Kolkata",
    }
);

// min
// cron.schedule("* * * * *", createDailyTask, {
//     timezone: "Asia/Kolkata",
// });
