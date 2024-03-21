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

// fetchSelectedDays()
//     .then((selectedDaysMap) => {
//         if (selectedDaysMap.size === 0) {
//             console.log(
//                 "No selected days found in the database. Skipping cron job scheduling."
//             );
//             return;
//         }

//         console.log(
//             "Selected days fetched from the database:",
//             selectedDaysMap
//         );

//         const today = new Date().getDay(); // Get the current day (0-6)

//         // Iterate over the selectedDaysMap
//         for (const [taskId, selectedDays] of selectedDaysMap) {
//             // Map of abbreviated day names to full names
//             const dayAbbreviations = {
//                 su: "sunday",
//                 mo: "monday",
//                 tu: "tuesday",
//                 we: "wednesday",
//                 th: "thursday",
//                 fr: "friday",
//                 sa: "saturday",
//             };

//             // Filter selected days to include only the ones that match today
//             const validDays = selectedDays.filter((day) => {
//                 const fullName = dayAbbreviations[day.toLowerCase()];
//                 return today === new Date(fullName).getDay();
//             });

//             // If no valid days found, skip scheduling for this task
//             if (validDays.length === 0) {
//                 console.log(
//                     `No valid days found for task ${taskId}. Skipping scheduling.`
//                 );
//                 continue;
//             }

//             // Construct cron expression based on the selected days
//             const cronExpression = `* * * * ${validDays.join(",")}`;

//             // Schedule cron job
//             cron.schedule(
//                 cronExpression,
//                 async () => {
//                     await createDailyTask("weekDays", webhookUrl, validDays);
//                 },
//                 {
//                     timezone: "Asia/Kolkata",
//                 }
//             );

//             console.log(
//                 `Cron job scheduled for task ${taskId} on ${validDays.join(
//                     ", "
//                 )}.`
//             );
//         }
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });

// fetchSelectedDays()
//     .then((selectedDaysMap) => {
//         if (selectedDaysMap.size === 0) {
//             console.log(
//                 "No selected days found in the database. Skipping cron job scheduling."
//             );
//             return;
//         }

//         console.log(
//             "Selected days fetched from the database:",
//             selectedDaysMap
//         );

//         const today = new Date()
//             .toLocaleString("en-US", { weekday: "short" })
//             .toLowerCase(); // Get the current day (e.g., "sun")
//         console.log("Today:", today);

//         // Iterate over the selectedDaysMap
//         for (const [taskId, selectedDays] of selectedDaysMap) {
//             console.log("Selected days for task", taskId + ":", selectedDays);
//             // Filter selected days to include only the ones that match today
//             const validDays = selectedDays.filter((day) => {
//                 return today === day.toLowerCase();
//             });

//             // If no valid days found, skip scheduling for this task
//             if (validDays.length === 0) {
//                 console.log(
//                     `No valid days found for task ${taskId}. Skipping scheduling.`
//                 );
//                 continue;
//             }

//             // Construct cron expression based on the selected days
//             const cronExpression = `* * * * ${validDays.join(",")}`;

//             // Schedule cron job
//             cron.schedule(
//                 cronExpression,
//                 async () => {
//                     await createDailyTask("weekDays", webhookUrl, validDays);
//                 },
//                 {
//                     timezone: "Asia/Kolkata",
//                 }
//             );

//             console.log(
//                 `Cron job scheduled for task ${taskId} on ${validDays.join(
//                     ", "
//                 )}.`
//             );
//         }
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });

// fetchSelectedDays()
//     .then((selectedDaysMap) => {
//         if (selectedDaysMap.size === 0) {
//             console.log(
//                 "No selected days found in the database. Skipping cron job scheduling."
//             );
//             return;
//         }

//         console.log(
//             "Selected days fetched from the database:",
//             selectedDaysMap
//         );

//         const dayAbbreviations = ["su", "mo", "tu", "we", "th", "fr", "sa"];
//         const todayIndex = new Date().getDay();
//         const todayAbbreviation = dayAbbreviations[todayIndex];

//         console.log("Today:", todayAbbreviation);

//         // Iterate over the selectedDaysMap
//         for (const [taskId, selectedDays] of selectedDaysMap) {
//             console.log("Selected days for task", taskId + ":", selectedDays);

//             // Filter selected days to include only the ones that match today
//             const validDays = selectedDays.filter((day) => {
//                 return todayAbbreviation === day.toLowerCase();
//             });

//             // If no valid days found, skip scheduling for this task
//             if (validDays.length === 0) {
//                 console.log(
//                     `No valid days found for task ${taskId}. Skipping scheduling.`
//                 );
//                 continue;
//             }

//             // Construct cron expression based on the selected days
//             const cronExpression = `0 10 * * ${validDays.join(",")}`;

//             // Schedule cron job
//             cron.schedule(
//                 cronExpression,
//                 async () => {
//                     await createDailyTask("weekDays", webhookUrl, validDays);
//                 },
//                 {
//                     timezone: "Asia/Kolkata",
//                 }
//             );

//             console.log(
//                 `Cron job scheduled for task ${taskId} on ${validDays.join(
//                     ", "
//                 )}.`
//             );
//         }
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });

// fetchSelectedDays()
//     .then((selectedDaysMap) => {
//         if (selectedDaysMap.size === 0) {
//             console.log(
//                 "No selected days found in the database. Skipping cron job scheduling."
//             );
//             return;
//         }

//         console.log(
//             "Selected days fetched from the database:",
//             selectedDaysMap
//         );

//         const dayAbbreviations = {
//             su: "sun",
//             mo: "mon",
//             tu: "tue",
//             we: "wed",
//             th: "thu",
//             fr: "fri",
//             sa: "sat",
//         };
//         const todayIndex = new Date().getDay();
//         const todayAbbreviation = Object.keys(dayAbbreviations)[todayIndex];

//         console.log("Today:", todayAbbreviation);

//         // Iterate over the selectedDaysMap
//         for (const [taskId, selectedDays] of selectedDaysMap) {
//             console.log("Selected days for task", taskId + ":", selectedDays);

//             // Convert selected days to full names
//             const fullNames = selectedDays.map(
//                 (day) => dayAbbreviations[day.toLowerCase()]
//             );

//             // Filter selected days to include only the ones that match today
//             const validDays = fullNames.filter(
//                 (day) => day.toLowerCase() === todayAbbreviation.toLowerCase()
//             );

//             // If no valid days found, skip scheduling for this task
//             if (validDays.length === 0) {
//                 console.log(
//                     `No valid days found for task ${taskId}. Skipping scheduling.`
//                 );
//                 continue;
//             }

//             // Construct cron expression based on the selected days
//             const cronExpression = `0 10 * * ${validDays.join(",")}`;

//             // Schedule cron job
//             cron.schedule(
//                 cronExpression,
//                 async () => {
//                     await createDailyTask("weekDays", webhookUrl, validDays);
//                 },
//                 {
//                     timezone: "Asia/Kolkata",
//                 }
//             );

//             console.log(
//                 `Cron job scheduled for task ${taskId} on ${validDays.join(
//                     ", "
//                 )}.`
//             );
//         }
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });

// fetchSelectedDays()
//     .then((selectedDaysMap) => {
//         if (selectedDaysMap.size === 0) {
//             console.log(
//                 "No selected days found in the database. Skipping cron job scheduling."
//             );
//             return;
//         }

//         console.log(
//             "Selected days fetched from the database:",
//             selectedDaysMap
//         );

//         const dayAbbreviations = {
//             su: "sun",
//             mo: "mon",
//             tu: "tue",
//             we: "wed",
//             th: "thu",
//             fr: "fri",
//             sa: "sat",
//         };
//         const todayIndex = new Date().getDay();
//         const todayAbbreviation = Object.keys(dayAbbreviations)[todayIndex];

//         console.log("Today:", todayAbbreviation);

//         // Iterate over the selectedDaysMap
//         for (const [taskId, selectedDays] of selectedDaysMap) {
//             console.log("Selected days for task", taskId + ":", selectedDays);

//             // Convert selected days to full names
//             const fullNames = selectedDays.map(
//                 (day) => dayAbbreviations[day.toLowerCase()]
//             );

//             // Filter selected days to include only the ones that match today
//             const validDays = fullNames.filter(
//                 (day) => day.toLowerCase() === todayAbbreviation.toLowerCase()
//             );

//             // If no valid days found, skip scheduling for this task
//             if (validDays.length === 0) {
//                 console.log(
//                     `No valid days found for task ${taskId}. Skipping scheduling.`
//                 );
//                 continue;
//             }

//             // Construct cron expression based on the selected days
//             const cronExpression = `0 10 * * ${validDays.join(",")}`;

//             // Schedule cron job
//             cron.schedule(
//                 cronExpression,
//                 async () => {
//                     await createDailyTask("weekDays", webhookUrl, validDays);
//                 },
//                 {
//                     timezone: "Asia/Kolkata",
//                 }
//             );

//             console.log(
//                 `Cron job scheduled for task ${taskId} on ${validDays.join(
//                     ", "
//                 )}.`
//             );
//         }
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });

// fetchSelectedDays()
//     .then((selectedDaysMap) => {
//         if (selectedDaysMap.size === 0) {
//             console.log(
//                 "No selected days found in the database. Skipping cron job scheduling."
//             );
//             return;
//         }

//         console.log(
//             "Selected days fetched from the database:",
//             selectedDaysMap
//         );

//         const todayIndex = new Date().getDay();
//         const dayAbbreviations = ["su", "mo", "tu", "we", "th", "fr", "sa"];
//         const todayAbbreviation = dayAbbreviations[todayIndex];

//         console.log("Today:", todayAbbreviation);

//         // Iterate over the selectedDaysMap
//         for (const [taskId, selectedDays] of selectedDaysMap) {
//             console.log("Selected days for task", taskId + ":", selectedDays);

//             // Filter selected days to include only the ones that match today
//             const validDays = selectedDays.filter(
//                 (day) => day.toLowerCase() === todayAbbreviation.toLowerCase()
//             );

//             // If no valid days found, skip scheduling for this task
//             if (validDays.length === 0) {
//                 console.log(
//                     `No valid days found for task ${taskId}. Skipping scheduling.`
//                 );
//                 continue;
//             }

//             // Construct cron expression based on the selected days
//             const cronExpression = `0 10 * * ${validDays.join(",")}`;

//             // Schedule cron job
//             cron.schedule(
//                 cronExpression,
//                 async () => {
//                     await createDailyTask("weekDays", webhookUrl, validDays);
//                 },
//                 {
//                     timezone: "Asia/Kolkata",
//                 }
//             );

//             console.log(
//                 `Cron job scheduled for task ${taskId} on ${validDays.join(
//                     ", "
//                 )}.`
//             );
//         }
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });

// fetchSelectedDays()
//     .then((selectedDaysMap) => {
//         if (selectedDaysMap.size === 0) {
//             console.log(
//                 "No selected days found in the database. Skipping cron job scheduling."
//             );
//             return;
//         }

//         console.log(
//             "Selected days fetched from the database:",
//             selectedDaysMap
//         );

//         // Map of abbreviated day names to full names
//         const dayAbbreviations = {
//             su: "sunday",
//             mo: "monday",
//             tu: "tuesday",
//             we: "wednesday",
//             th: "thursday",
//             fr: "friday",
//             sa: "saturday",
//         };

//         const today = new Date();
//         const todayAbbreviation = today
//             .toLocaleString("en-us", { weekday: "short" })
//             .toLowerCase();

//         console.log("Today:", todayAbbreviation);

//         // Iterate over the selectedDaysMap
//         for (const [taskId, selectedDays] of selectedDaysMap) {
//             console.log("Selected days for task", taskId + ":", selectedDays);

//             // Filter selected days to include only the ones that match today
//             const validDays = selectedDays.filter(
//                 (day) =>
//                     dayAbbreviations[day.toLowerCase()] === todayAbbreviation
//             );

//             // If no valid days found, skip scheduling for this task
//             if (validDays.length === 0) {
//                 console.log(
//                     `No valid days found for task ${taskId}. Skipping scheduling.`
//                 );
//                 continue;
//             }

//             // Construct cron expression based on the selected days
//             const cronExpression = `0 10 * * ${validDays.join(",")}`;

//             // Schedule cron job
//             cron.schedule(
//                 cronExpression,
//                 async () => {
//                     await createDailyTask("weekDays", webhookUrl, validDays);
//                 },
//                 {
//                     timezone: "Asia/Kolkata",
//                 }
//             );

//             console.log(
//                 `Cron job scheduled for task ${taskId} on ${validDays.join(
//                     ", "
//                 )}.`
//             );
//         }
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });

fetchSelectedDays()
    .then((selectedDaysMap) => {
        if (selectedDaysMap.size === 0) {
            console.log(
                "No selected days found in the database. Skipping cron job scheduling."
            );
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
            console.log("Selected days for task", taskId + ":", selectedDays);

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

            // Construct cron expression for 10:00 AM today
            const cronExpression = ` 0 10 * * ${todayAbbreviation}`;

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
