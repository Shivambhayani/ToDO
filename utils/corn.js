const cron = require("node-cron");
const { createDailyTask } = require("../controller/repeatTaskController");

// daily 10 am
cron.schedule("0 10 * * *", () => createDailyTask("Daily"), {
    timezone: "Asia/Kolkata",
});

//weekly “At 10:00 on Monday.”
cron.schedule(" 0 10 * * 1", () => createDailyTask("weekly"), {
    timezone: "Asia/Kolkata",
});

// monthly “At 10:00 on day-of-month 1 in every month from January through December.”
cron.schedule("0 10 1 1-12 *", () => createDailyTask("monthly"), {
    timezone: "Asia/Kolkata",
});
// quatrley “At 10:00 on day-of-month 1 in every 3rd month.”
cron.schedule("0 10 1 */3 *", () => createDailyTask("Quarterly"), {
    timezone: "Asia/Kolkata",
});
// yearly “At 10:00 on day-of-month 1 in January.”
cron.schedule("0 10 1 1 *", () => createDailyTask("yearly"), {
    timezone: "Asia/Kolkata",
});

// min
// cron.schedule("* * * * *", createDailyTask, {
//     timezone: "Asia/Kolkata",
// });
