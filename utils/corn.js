const cron = require("node-cron");
const {
    fetchSelectedDays,
    createDailyTask,
} = require("../controller/repeatTaskController");
const dotenv = require("dotenv");
dotenv.config();

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

const scheduleCronJob = (cronExpression, taskFunction) => {
    try {
        cron.schedule(cronExpression, taskFunction, {
            timezone: "Asia/Kolkata",
        });

        console.log("Cron job scheduled with expression:", cronExpression);
    } catch (error) {
        console.error("Error scheduling cron job:", error.message);
    }
};

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

fetchSelectedDays()
    .then((selectedDays) => {
        if (selectedDays.length === 0) {
            console.log(
                "No selected days found in the database. Skipping cron job scheduling."
            );
            return;
        }

        // console.log("Selected days fetched from the database:", selectedDays);
        // Schedule cron job based on fetched selected days
        const cronExpression = `0 10 * * ${selectedDays.join(",")}`;
        cron.schedule(
            cronExpression,
            async () => {
                await createDailyTask("weekDays", webhookUrl, selectedDays);
            },
            {
                timezone: "Asia/Kolkata",
            }
        );
    })
    .catch((error) => {
        console.error("Error:", error);
    });
