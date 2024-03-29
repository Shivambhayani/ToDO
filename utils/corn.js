const cron = require("node-cron");
const {
    fetchSelectedDays,
    createDailyTask,
} = require("../controller/repeatTaskController");
const dotenv = require("dotenv");
dotenv.config();
const webhookUrl = process.env.WEBHOOK_URL;

const schedules = [
    { frequency: "Daily", pattern: "0 10 * * *" }, // Daily task at 10:00 AM every day
    { frequency: "Weekly", pattern: "05 10 * * 1" }, // Weekly task at 10:00 AM every Monday
    { frequency: "Monthly", pattern: "10 10 1-31 * *" }, // Monthly task at 10:00 AM on the 1st day of each month
    { frequency: "Quarterly", pattern: "2 10 1 */3 *" }, // Quarterly task at 10:00 AM on the 1st day of every 3rd month
    { frequency: "Yearly", pattern: "3 10 1 1 *" }, // Yearly task at 10:00 AM on the 1st day of January
];

// Function to create a scheduled task
const scheduleTask = ({ frequency, pattern }) => {
    cron.schedule(
        pattern,
        async () => {
            await createDailyTask(frequency.toLowerCase(), webhookUrl);
        },
        {
            timezone: "Asia/Kolkata",
        }
    );
};

// Schedule tasks
schedules.forEach(scheduleTask);

// weekdays
fetchSelectedDays()
    .then((selectedDaysMap) => {
        if (selectedDaysMap.size === 0) {
            // console.log(
            //     "No selected days found in the database. Skipping cron job scheduling."
            // );
            return;
        }

        // console.log(
        //     "Selected days fetched from the database:",
        //     selectedDaysMap
        // );

        const today = new Date();
        const todayAbbreviation = today
            .toLocaleString("en-us", { weekday: "short" })
            .toLowerCase();

        // console.log("Today:", todayAbbreviation);

        // Iterate over the selectedDaysMap
        for (const [taskId, selectedDays] of selectedDaysMap) {
            // console.log("Selected days for task", taskId + ":", selectedDays);

            // Check if today's abbreviation is included in the selected days
            const isValidDay = selectedDays.some(
                (day) => day.toLowerCase() === todayAbbreviation
            );

            // If today's abbreviation is not included, skip scheduling for this task
            if (!isValidDay) {
                console.log(
                    `No valid days found for task ${taskId}. Skipping scheduling.`
                );
                continue;
            }

            // Construct cron expression for 10:10 AM today
            const cronExpression = `10 10 * * ${todayAbbreviation}`;

            // Schedule cron job
            cron.schedule(
                cronExpression,
                async () => {
                    await createDailyTask("weekDays", webhookUrl);
                },
                {
                    timezone: "Asia/Kolkata",
                }
            );

            console.log(
                `Cron job scheduled for task ${taskId} on ${todayAbbreviation}.`
            );
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });

// Define a function to create custom cron schedules
//
// async function createCustomCronSchedules() {
//     try {
//         console.log("custom");
//         const tasks = await repeatedTasks.findAll({
//             where: {
//                 task_frequency: "custom",
//                 duration: { [Op.not]: null },
//             },
//         });

//         // Iterate over the tasks
//         for (const task of tasks) {
//             if (!task.duration) {
//                 continue; // Skip tasks without duration
//             }

//             // Filter tasks based on the custom frequency and duration type
//             const filteredTasks = task.duration.filter((durationObj) => {
//                 return (
//                     durationObj.durationType.toLowerCase().trim() ===
//                     task.task_frequency.toLowerCase().trim()
//                 );
//             });

//             // Iterate over the filtered tasks
//             for (const durationObj of filteredTasks) {
//                 const { durationCount, durationType } = durationObj;

//                 // Calculate the end date of the duration
//                 let endDate;
//                 switch (durationType.toLowerCase().trim()) {
//                     case "daily":
//                         endDate = moment().add(durationCount, "days").toDate();
//                         break;
//                     case "weekly":
//                         endDate = moment()
//                             .add(durationCount * 7, "days")
//                             .toDate();
//                         break;
//                     case "monthly":
//                         endDate = moment()
//                             .add(durationCount, "months")
//                             .toDate();
//                         break;
//                     case "yearly":
//                         endDate = moment().add(durationCount, "years").toDate();
//                         break;
//                     default:
//                         throw new Error("Invalid duration type");
//                 }

//                 // Check if the current date is before the end date
//                 if (moment().toDate() <= endDate) {
//                     // Define a cron expression based on the duration count and type
//                     let cronExpression = "";
//                     switch (durationType.toLowerCase().trim()) {
//                         case "daily":
//                             cronExpression = `* * */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         case "weekly":
//                             cronExpression = `* * */${Math.ceil(
//                                 30 / (durationCount * 7)
//                             )} * * `;
//                             break;
//                         case "monthly":
//                             cronExpression = `10 10 */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         case "yearly":
//                             cronExpression = `0 10 */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         default:
//                             throw new Error("Invalid duration type");
//                     }

//                     // Schedule the cron job based on the custom frequency
//                     cron.schedule(
//                         cronExpression,
//                         async () => {
//                             await createDailyTask(
//                                 task.task_frequency,
//                                 webhookUrl
//                             ); // Pass durationType as frequency
//                         },
//                         {
//                             timezone: "Asia/Kolkata",
//                         }
//                     );

//                     console.log(
//                         `Cron job scheduled for task ${task.id}, taskType: ${durationType}: ${cronExpression}`
//                     );
//                 } else {
//                     console.log(`Task ${task.id} duration has ended.`);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Error creating custom cron schedules:", error.message);
//     }
// }
// createCustomCronSchedules();
// async function createCustomCronSchedules() {
//     try {
//         // Fetch tasks with multiple duration objects
//         const tasks = await repeatedTasks.findAll({
//             where: {
//                 duration: {
//                     [Op.not]: null, // Ensure duration field is not null
//                 },
//             },
//         });

//         // Iterate over the tasks
//         for (const task of tasks) {
//             const { duration } = task;

//             // Iterate over the duration objects for the current task
//             for (const durationObj of duration) {
//                 const { durationCount, durationType } = durationObj;

//                 // Calculate the end date of the duration
//                 let endDate;
//                 switch (durationType.toLowerCase()) {
//                     case "daily":
//                         endDate = moment().add(durationCount, "days").toDate();
//                         break;
//                     case "weekly":
//                         endDate = moment().add(durationCount, "weeks").toDate();
//                         break;
//                     case "monthly":
//                         endDate = moment()
//                             .add(durationCount, "months")
//                             .toDate();
//                         break;
//                     case "yearly":
//                         endDate = moment().add(durationCount, "years").toDate();
//                         break;
//                     // Add cases for other duration types as needed
//                     default:
//                         throw new Error("Invalid duration type");
//                 }

//                 // Check if the current date is before the end date
//                 if (moment().toDate() <= endDate) {
//                     // Define a cron expression based on the duration count and type
//                     let cronExpression = "";
//                     switch (durationType.toLowerCase()) {
//                         case "daily":
//                             cronExpression = `* * */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         case "weekly":
//                             cronExpression = `* * */${Math.ceil(
//                                 30 / (durationCount * 7)
//                             )} * * `;
//                             break;
//                         case "monthly":
//                             cronExpression = `10 10 */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         case "yearly":
//                             cronExpression = `0 10 */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         // Add cases for other duration types as needed
//                         default:
//                             throw new Error("Invalid duration type");
//                     }

//                     // Schedule the cron job
//                     cron.schedule(
//                         cronExpression,
//                         async () => {
//                             await createDailyTask(
//                                 task.task_frequency,
//                                 webhookUrl
//                             );
//                         },
//                         {
//                             timezone: "Asia/Kolkata",
//                         }
//                     );

//                     console.log(
//                         `Cron job scheduled for task ${task.id}: ${cronExpression}`
//                     );
//                 } else {
//                     console.log(`Task ${task.id} duration has ended.`);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Error creating custom cron schedules:", error);
//     }
// }

// Call the function to schedule cron jobs
// scheduleCronJobs();

// createCustomCronSchedules();

// async function createCustomCronSchedules() {
//     try {
//         // Fetch tasks with custom frequency and non-null duration
//         const tasks = await repeatedTasks.findAll({
//             where: {
//                 task_frequency: "custom",
//                 duration: {
//                     [Op.not]: null, // Ensure duration field is not null
//                 },
//             },
//         });

//         // Iterate over the tasks with custom frequency
//         for (const task of tasks) {
//             const { duration } = task;

//             // Filter duration objects for the current task based on desired duration types
//             const filteredDuration = duration.filter((durationObj) => {
//                 const allowedTypes = ["daily", "weekly", "monthly", "yearly"]; // Add other allowed types if needed
//                 return allowedTypes.includes(
//                     durationObj.durationType.toLowerCase()
//                 );
//             });

//             // Iterate over the filtered duration objects
//             for (const durationObj of filteredDuration) {
//                 const { durationCount, durationType } = durationObj;

//                 // Calculate the end date of the duration
//                 let endDate;
//                 switch (durationType.toLowerCase()) {
//                     case "daily":
//                         endDate = moment().add(durationCount, "days").toDate();
//                         break;
//                     case "weekly":
//                         endDate = moment().add(durationCount, "weeks").toDate();
//                         break;
//                     case "monthly":
//                         endDate = moment()
//                             .add(durationCount, "months")
//                             .toDate();
//                         break;
//                     case "yearly":
//                         endDate = moment().add(durationCount, "years").toDate();
//                         break;
//                     // Add cases for other duration types as needed
//                     default:
//                         throw new Error("Invalid duration type");
//                 }

//                 // Check if the current date is before the end date
//                 if (moment().toDate() <= endDate) {
//                     // Define a cron expression based on the duration count and type
//                     let cronExpression = "";
//                     switch (durationType.toLowerCase()) {
//                         case "daily":
//                             cronExpression = `* * */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         case "weekly":
//                             cronExpression = `* * */${Math.ceil(
//                                 30 / (durationCount * 7)
//                             )} * * `;
//                             break;
//                         case "monthly":
//                             cronExpression = `10 10 */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         case "yearly":
//                             cronExpression = `0 10 */${Math.ceil(
//                                 30 / durationCount
//                             )} * * `;
//                             break;
//                         // Add cases for other duration types as needed
//                         default:
//                             throw new Error("Invalid duration type");
//                     }

//                     // Schedule the cron job
//                     cron.schedule(
//                         cronExpression,
//                         async () => {
//                             await createDailyTask(
//                                 task.task_frequency,
//                                 webhookUrl
//                             );
//                         },
//                         {
//                             timezone: "Asia/Kolkata",
//                         }
//                     );

//                     console.log(
//                         `Cron job scheduled for task ${task.id}: ${cronExpression}`
//                     );
//                 } else {
//                     console.log(`Task ${task.id} duration has ended.`);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Error creating custom cron schedules:", error);
//     }
// }

// async function createCustomCronSchedules() {
//     try {
//         // Fetch tasks with multiple duration objects
//         const tasks = await repeatedTasks.findAll({
//             where: {
//                 duration: {
//                     [Op.not]: null, // Ensure duration field is not null
//                 },
//                 task_frequency: "custom", // Ensure custom frequency
//             },
//         });

//         // Iterate over the tasks
//         for (const task of tasks) {
//             let taskScheduled = false; // Flag to track if task has been scheduled

//             // Check if the task frequency is custom
//             if (task.task_frequency === "custom") {
//                 // Iterate over the duration objects for the current task
//                 for (const durationObj of task.duration) {
//                     const { durationCount, durationType } = durationObj;

//                     // Check if duration type matches the desired types (daily, weekly, monthly, yearly)
//                     if (
//                         ["daily", "weekly", "monthly", "yearly"].includes(
//                             durationType.toLowerCase()
//                         )
//                     ) {
//                         // Calculate the end date of the duration
//                         let endDate;
//                         switch (durationType.toLowerCase()) {
//                             case "daily":
//                                 endDate = moment()
//                                     .add(durationCount, "days")
//                                     .toDate();
//                                 break;
//                             case "weekly":
//                                 endDate = moment()
//                                     .add(durationCount, "weeks")
//                                     .toDate();
//                                 break;
//                             case "monthly":
//                                 endDate = moment()
//                                     .add(durationCount, "months")
//                                     .toDate();
//                                 break;
//                             case "yearly":
//                                 endDate = moment()
//                                     .add(durationCount, "years")
//                                     .toDate();
//                                 break;
//                             // Add cases for other duration types as needed
//                             default:
//                                 throw new Error("Invalid duration type");
//                         }

//                         // Check if the current date is before the end date
//                         if (moment().toDate() <= endDate) {
//                             // Define a cron expression based on the duration count and type
//                             let cronExpression = "";
//                             switch (durationType.toLowerCase()) {
//                                 case "daily":
//                                     cronExpression = `* * */${Math.ceil(
//                                         30 / durationCount
//                                     )} * * `;
//                                     break;
//                                 case "weekly":
//                                     cronExpression = `* * */${Math.ceil(
//                                         30 / (durationCount * 7)
//                                     )} * * `;
//                                     break;
//                                 case "monthly":
//                                     cronExpression = `10 10 */${Math.ceil(
//                                         30 / durationCount
//                                     )} * * `;
//                                     break;
//                                 case "yearly":
//                                     cronExpression = `0 10 */${Math.ceil(
//                                         30 / durationCount
//                                     )} * * `;
//                                     break;
//                                 // Add cases for other duration types as needed
//                                 default:
//                                     throw new Error("Invalid duration type");
//                             }

//                             // Schedule the cron job
//                             cron.schedule(
//                                 cronExpression,
//                                 async () => {
//                                     await createCutomeTask(
//                                         "custom", // Pass custom frequency
//                                         durationType, // Pass duration type
//                                         durationCount, // Pass duration count
//                                         webhookUrl
//                                     );
//                                 },
//                                 {
//                                     timezone: "Asia/Kolkata",
//                                 }
//                             );

//                             console.log(
//                                 `Cron job scheduled for task ${task.id}: ${cronExpression}`
//                             );

//                             taskScheduled = true; // Set flag to true as task has been scheduled
//                             break; // Exit the loop as task has been scheduled
//                         }
//                     }
//                 }
//             }

//             // Log if the task was not scheduled
//             if (!taskScheduled) {
//                 console.log(
//                     `Task ${task.id} duration has ended or not matching desired duration type.`
//                 );
//             }
//         }
//     } catch (error) {
//         console.error("Error creating custom cron schedules:", error);
//     }
// }
// createCustomCronSchedules();
