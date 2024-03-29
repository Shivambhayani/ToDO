const User = require("../model/userModel");
const repetedTasks = require("../model/repetedTaskModel");
const userModel = require("../model/userModel");
const taskModel = require("../model/taskModel");
const { Op, fn } = require("sequelize");
const { IncomingWebhook } = require("@slack/webhook");
const moment = require("moment");
const TurndownService = require("turndown");
const repeatedTasks = require("../model/repetedTaskModel");

const findTaskByUserId = async (userId, id) => {
    return await repetedTasks.findOne({ where: { id, userId } });
};

/* create tasks */
// const createTask = async (req, res) => {
//     try {
//         const {
//             title,
//             description,
//             task_frequency,
//             status,
//             dueDate,
//             selectedDays,
//             duration,
//         } = req.body;

//         // req.body.task_frequency = (req?.body?.task_frequency === "custome": (req?.body?.duration[0]?.durationType): req?.body?.task_frequecy)

//         // req.body.durationCount = (req?.body?.task_frequency === "custome": (req?.body?.duration[0]?.durationCount): null)

//         const userId = req.user.id;

//         let parsedDueDate = null;
//         let formattedDueDate = null;

//         if (dueDate) {
//             parsedDueDate = moment.utc(dueDate, "DD/MM/YYYY", true);
//             if (!parsedDueDate.isValid()) {
//                 return res.status(400).json({
//                     status: "fail",
//                     message:
//                         "Invalid dueDate format. Please provide date in DD/MM/YYYY format.",
//                 });
//             }
//             formattedDueDate = parsedDueDate
//                 .clone()
//                 .tz("Asia/Kolkata")
//                 .format("DD/MM/YYYY");
//         }
//         const data = await repetedTasks.create({
//             title,
//             description,
//             task_frequency,
//             status,
//             userId,
//             selectedDays,
//             duration,
//             dueDate: parsedDueDate ? parsedDueDate.toDate() : null,
//         });

//         /* send data in normal task table */
//         await taskModel.create({
//             title,
//             description,
//             status,
//             userId,
//             task_frequency,
//             selectedDays,
//             duration,
//             dueDate: parsedDueDate ? parsedDueDate.toDate() : null,
//         });

//         // If selectedDays are provided, schedule the weekdays task
//         // if (selectedDays && selectedDays.length > 0) {
//         //     console.log("Scheduling weekdays task...");
//         //     const daysArray = selectedDays.split(",").map((day) => day.trim());
//         //     await cronWeekDays.scheduleWeekDays(daysArray);
//         // }
//         res.status(201).json({
//             status: "success",
//             data: { ...data.toJSON(), dueDate: formattedDueDate },
//         });
//     } catch (error) {
//         if (error.name === "SequelizeValidationError") {
//             // Check if the error is for the description field
//             const descriptionError = error.errors.find(
//                 (err) => err.path === "description"
//             );
//             // If there's a validation error for the description field, return its custom error message
//             if (descriptionError) {
//                 return res.status(400).json({
//                     status: "fail",
//                     message: descriptionError.message,
//                 });
//             }
//         }

//         return res.status(500).json({
//             status: "fail",
//             messages: "An error occurred while creating the task.",
//             error: error.message,
//         });
//     }
// };

const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            task_frequency,
            status,
            dueDate,
            selectedDays,
        } = req.body;

        const userId = req.user.id;

        let parsedDueDate = null;
        let formattedDueDate = null;

        if (dueDate) {
            parsedDueDate = moment.utc(dueDate, "DD/MM/YYYY", true);
            if (!parsedDueDate.isValid()) {
                return res.status(400).json({
                    status: "fail",
                    message:
                        "Invalid dueDate format. Please provide date in DD/MM/YYYY format.",
                });
            }
            formattedDueDate = parsedDueDate
                .clone()
                .tz("Asia/Kolkata")
                .format("DD/MM/YYYY");
        }

        // Create task in both repeatedTasks and taskModel simultaneously
        const [repeatedTask, normalTask] = await Promise.all([
            repetedTasks.create({
                title,
                description,
                task_frequency,
                status,
                userId,
                selectedDays,

                dueDate: parsedDueDate ? parsedDueDate.toDate() : null,
            }),
            taskModel.create({
                title,
                description,
                status,
                userId,
                task_frequency,
                selectedDays,

                dueDate: parsedDueDate ? parsedDueDate.toDate() : null,
            }),
        ]);

        res.status(201).json({
            status: "success",
            data: { ...repeatedTask.toJSON(), dueDate: formattedDueDate },
        });
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            const descriptionError = error.errors.find(
                (err) => err.path === "description"
            );
            if (descriptionError) {
                return res.status(400).json({
                    status: "fail",
                    message: descriptionError.message,
                });
            }
        }

        return res.status(500).json({
            status: "fail",
            messages: "An error occurred while creating the task.",
            error: error.message,
        });
    }
};

/*  get Tasks */
const getTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const task = await findTaskByUserId(userId, taskId);

        if (!task) {
            return res.status(404).json({
                status: "fail",
                message: "Unauthorize",
            });
        }
        res.status(200).json({
            status: "success",
            data: task,
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

/*   filter tasks  */
// const getAllAndFilterTask = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         if (!userId || userId.length === 0) {
//             return res.status(401).json({
//                 status: "fail",
//                 message: "Unauthorize",
//             });
//         }

//         const { status, task_frequency } = req.query;
//         const queryObj = {};

//         if (status) {
//             queryObj.status = status;
//         }
//         if (task_frequency) {
//             queryObj.task_frequency = task_frequency;
//         }
//         let data;
//         if (Object.keys(queryObj).length === 0) {
//             data = await repetedTasks.findAll({ where: { userId } });
//         } else {
//             data = await repetedTasks.findAll({
//                 where: {
//                     userId: userId,
//                     ...queryObj,
//                 },
//             });
//         }
//         const formattedData = data.map((task) => {
//             return {
//                 ...task.toJSON(),
//                 // Format the dueDate to "DD/MM/YYYY"
//                 dueDate: task.dueDate
//                     ? moment(task.dueDate).format("DD/MM/YYYY")
//                     : null,
//             };
//         });
//         res.status(200).json({ status: "success", data: formattedData });
//     } catch (error) {
//         return res.status(500).json({
//             status: "fail",
//             message: error.message,
//         });
//     }
// };
const getAllTask = async (req, res) => {
    try {
        const userId = req.user.id;

        //if userId -> null then 400, user is required
        if (!userId || userId.length === 0) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorize",
            });
        }
        const data = await repetedTasks.findAll({ where: { userId } });

        // data => undefined/null/ {} or [] then data not found

        // if (data.length === 0) {
        //     return res.status(404).json({
        //         status: "fail",
        //         message: "No tasks found. Create a new task",
        //     });
        // }
        res.status(200).json({ status: "success", data: data });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: error.message,
            stack: error.stack,
        });
    }
};

const getAllAndFilterTask = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if userId is valid
        if (!userId || userId.length === 0) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorized",
            });
        }

        const { status, task_frequency } = req.query;
        const whereClause = { userId: userId };

        // Add status and task_frequency conditions to the where clause if provided
        if (status) {
            whereClause.status = status;
        }
        if (task_frequency) {
            whereClause.task_frequency = task_frequency;
        }

        // Retrieve tasks based on the where clause
        const data = await repetedTasks.findAll({ where: whereClause });

        // Format the dueDate and return the formatted data
        const formattedData = data.map((task) => {
            return {
                ...task.toJSON(),
                dueDate: task.dueDate
                    ? moment(task.dueDate).format("DD/MM/YYYY")
                    : null,
            };
        });

        res.status(200).json({ status: "success", data: formattedData });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message,
        });
    }
};

/* Update Tasks*/
// const updateTaskById = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const taskId = req.params.id;
//         let repeatedTask = await findTaskByUserId(userId, taskId);

//         if (!repeatedTask) {
//             return res.status(404).json({
//                 status: "fail",
//                 message: "Task not found ",
//             });
//         }

//         const {
//             title,
//             description,
//             task_frequency,
//             status,
//             selectedDays,
//             duration,
//             dueDate,
//         } = req.body;

//         if (title !== undefined) {
//             repeatedTask.title = title;
//         }
//         if (description !== undefined) {
//             repeatedTask.description = description;
//         }
//         if (task_frequency !== undefined) {
//             repeatedTask.task_frequency = task_frequency;
//         }
//         if (status !== undefined) {
//             repeatedTask.status = status;
//         }
//         if (duration !== undefined) {
//             repeatedTask.duration = duration;
//         }
//         if (selectedDays !== undefined) {
//             repeatedTask.selectedDays = selectedDays;
//         }
//         if (dueDate !== undefined) {
//             repeatedTask.dueDate = moment(dueDate, "DD/MM/YYYY").toDate();
//         }

//         // Save the updated repeatedTask in the repeated tasks table
//         await repeatedTask.save();

//         const normalTask = await taskModel.findOne({
//             where: {
//                 userId: userId,
//                 title: repeatedTask.title,
//             },
//         });
//         if (normalTask) {
//             // if (title !== undefined) {
//             //     normalTask.title = title;
//             // }
//             if (description !== undefined) {
//                 normalTask.description = description;
//             }
//             if (task_frequency !== undefined) {
//                 normalTask.task_frequency = task_frequency;
//             }
//             if (status !== undefined) {
//                 normalTask.status = status;
//             }
//             if (duration !== undefined) {
//                 normalTask.duration = duration;
//             }
//             if (selectedDays !== undefined) {
//                 normalTask.selectedDays = selectedDays;
//             }
//             if (dueDate !== undefined) {
//                 normalTask.dueDate = moment(dueDate, "DD/MM/YYYY").toDate();
//             }
//             await normalTask.save();
//         }
//         const formattedDueDate = moment(repeatedTask.dueDate).format(
//             "DD/MM/YYYY"
//         );

//         res.status(200).json({
//             status: "success",
//             data: { ...repeatedTask.toJSON(), dueDate: formattedDueDate },
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: "fail",
//             message: error.message,
//         });
//     }
// };

// Update Tasks
const updateTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        // Find the task by ID and user
        let repeatedTask = await findTaskByUserId(userId, taskId);

        if (!repeatedTask) {
            return res.status(404).json({
                status: "fail",
                message: "Task not found",
            });
        }

        const {
            title,
            description,
            task_frequency,
            status,
            selectedDays,

            dueDate,
        } = req.body;

        // Prepare update object for repeatedTask/normal
        const updateObj = {};
        if (title !== undefined) updateObj.title = title;
        if (description !== undefined) updateObj.description = description;
        if (task_frequency !== undefined)
            updateObj.task_frequency = task_frequency;
        if (status !== undefined) updateObj.status = status;
        // if (duration !== undefined) updateObj.duration = duration;
        if (selectedDays !== undefined) updateObj.selectedDays = selectedDays;
        if (dueDate !== undefined)
            updateObj.dueDate = moment(dueDate, "DD/MM/YYYY").toDate();

        // Update repeatedTask
        await repeatedTask.update(updateObj);

        // Find and update normalTask if exists
        const normalTask = await taskModel.findOne({
            where: {
                userId: userId,
                title: repeatedTask.title,
            },
        });
        if (normalTask) {
            await normalTask.update(updateObj);
        }

        const formattedDueDate = moment(repeatedTask.dueDate).format(
            "DD/MM/YYYY"
        );

        res.status(200).json({
            status: "success",
            data: { ...repeatedTask.toJSON(), dueDate: formattedDueDate },
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message,
        });
    }
};

/*DELETE TASKS*/
const deleteTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const task = await findTaskByUserId(userId, taskId);

        if (!task) {
            return res.status(404).json({
                status: "fail",
                message: "Task not found",
            });
        }

        await task.destroy();
        res.status(200).json({
            status: "success",
            message: "Task deleted successfully",
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

const deleteAllTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskIds = req.params.id.split(",").map((id) => parseInt(id));
        if (!taskIds || taskIds.length === 0) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorized",
            });
        }

        await repetedTasks.destroy({
            where: {
                userId: userId,
                id: taskIds,
            },
        });

        return res.status(200).json({
            status: "success",
            message: "All Task deleted successfully",
        });
    } catch (error) {
        return res.status(404).json({
            status: "fail",
            message: error.message,
        });
    }
};

/* Relations */
const relationship = async (req, res) => {
    try {
        const data = await repetedTasks.findAll({
            attributes: ["title", "description", "task_frequency", "status"],
            include: [
                {
                    model: User,
                    attributes: ["name", "email"],
                },
            ],
        });
        res.status(200).json({
            status: "success",
            data: data,
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

/* cron for Daily Tasks*/

// Create a new instance of TurndownService
const turndownService = new TurndownService();
// Add custom rules to handle specific HTML elements
turndownService.addRule("bold", {
    filter: ["b", "strong"],
    replacement: (content) => `*${content.trim()}*`,
});

turndownService.addRule("italic", {
    filter: ["i", "em"],
    replacement: (content) => `_${content.trim()}_`,
});

turndownService.addRule("underline", {
    filter: ["u"],
    replacement: (content) => `_${content.trim()}_`,
});

turndownService.addRule("orderList", {
    filter: ["ol"],
    replacement: (content) => content.trim(),
});

turndownService.addRule("unorderedList", {
    filter: ["ul"],
    replacement: (content) => content.trim(),
});

// async function createDailyTask(frequency, webhookUrl) {
//     try {
//         console.log(`Starting createDailyTask for frequency: ${frequency}`);
//         //  get today creatd task
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const tenAMToday = new Date(today);
//         tenAMToday.setHours(10, 0, 0, 0);

//         const tomorrow = new Date(today);
//         tomorrow.setDate(tomorrow.getDate() + 1);

//         const repeatTask = await repetedTasks.findAll({
//             where: {
//                 task_frequency: frequency,
//             },
//         });

//         if (!repeatTask || repeatTask.length === 0) {
//             throw new Error("No users found in the database.");
//         }

//         // Create a new daily task for each tasks
//         for (const Task of repeatTask) {
//             // Check if a task has already been created for this user today
//             const existingTask = await taskModel.findOne({
//                 where: {
//                     userId: Task.userId,
//                     createdAt: {
//                         // [Op.gte]: today, // Find tasks created today or later
//                         // [Op.lt]: tenAMToday, //  before 10:00 AM today
//                     },
//                 },
//             });

//             /*  if task not created today or not exists than creat e new task */
//             if (!existingTask) {
//                 const user = await userModel.findByPk(Task.userId);

//                 let title = Task.title;
//                 let description = Task.description;

//                 const createdTask = await taskModel.create({
//                     title: title,
//                     description: description,
//                     task_frequency: Task.task_frequency,
//                     userId: Task.userId,
//                     selectedDays: Task.selectedDays,
//                     dueDate: Task.dueDate,
//                 });

//                 console.log(
//                     `${frequency} task created for task id:`,
//                     Task.id,
//                     createdTask
//                 );
//                 // Convert description to Slack-compatible format
//                 const descriptionMarkdown =
//                     turndownService.turndown(description);
//                 // Send message to Slack channel
//                 const webhook = new IncomingWebhook(webhookUrl);
//                 await webhook.send({
//                     text: `${frequency}Task schedular:`,
//                     blocks: [
//                         {
//                             type: "section",
//                             text: {
//                                 type: "mrkdwn",
//                                 text: `*${user.name}*\n*${Task.updatedAt}*\n\n*Title*: ${createdTask.title}\n*Description*:\n${descriptionMarkdown}`,
//                             },
//                         },
//                     ],
//                 });
//             } else {
//                 console.log(`${frequency} task alredy created:`, Task.id);
//             }
//         }

//         console.log(`${frequency} tasks created for all users.`);
//     } catch (error) {
//         console.error(`Error creating ${frequency}task:`, error.message);
//     }
// }

// async function fetchSelectedDays() {
//     try {
//         console.log("1");
//         // Fetch selected days from the database
//         const repeatTask = await repeatedTasks.findAll({
//             where: {
//                 task_frequency: "weekDays",
//                 selectedDays: { [Op.ne]: null }, // Filter out tasks with no selected days
//             },
//         });

//         const selectedDaysMap = new Map(); // Map to store selected days for each task

//         // Extract selected days for each task and store in the map
//         repeatTask.forEach((task) => {
//             if (task.selectedDays && task.selectedDays.length > 0) {
//                 selectedDaysMap.set(
//                     task.id,
//                     task.selectedDays.map((day) => day.toLowerCase())
//                 );
//             }
//         });

//         return selectedDaysMap;
//     } catch (error) {
//         console.error("Error fetching selected days:", error);
//         throw error; // Handle or propagate the error as needed
//     }
// }

// async function createDailyTask(frequency, webhookUrl) {
//     try {
//         console.log(`Starting createDailyTask for frequency: ${frequency}`);

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const tenAMToday = new Date(today);
//         tenAMToday.setHours(10, 0, 0, 0);

//         const tomorrow = new Date(today);
//         tomorrow.setDate(tomorrow.getDate() + 1);

//         const repeatTasks = await repetedTasks.findAll({
//             where: {
//                 task_frequency: frequency,
//             },
//         });

//         if (!repeatTasks || repeatTasks.length === 0) {
//             throw new Error(
//                 `No tasks found in the database for frequency: ${frequency}`
//             );
//         }

//         const existingTasks = await taskModel.findAll({
//             where: {
//                 userId: repeatTasks.map((task) => task.userId),
//                 createdAt: {
//                     [Op.gte]: today,
//                     [Op.lt]: tenAMToday,
//                 },
//             },
//             attributes: ["userId"], //  userId to check existence
//         });

//         const existingUserIds = existingTasks.map((task) => task.userId);

//         const tasksToCreate = repeatTasks.filter(
//             (task) => !existingUserIds.includes(task.userId)
//         );

//         if (tasksToCreate.length === 0) {
//             console.log(`No new ${frequency} tasks need to be created.`);
//             return;
//         }

//         const tasksData = tasksToCreate.map((task) => ({
//             title: task.title,
//             description: task.description,
//             task_frequency: task.task_frequency,
//             userId: task.userId,
//             selectedDays: task.selectedDays,
//             dueDate: task.dueDate,
//         }));

//         // Bulk create new tasks
//         const createdTasks = await taskModel.bulkCreate(tasksData);

//         console.log(
//             `${frequency} tasks created for ${createdTasks.length} users.`
//         );

//         // Fetch user names based on userIds
//         const userIds = tasksToCreate.map((task) => task.userId);
//         const users = await userModel.findAll({
//             where: {
//                 id: userIds,
//             },
//             attributes: ["id", "name"], // Fetching only id and name
//         });

//         // Create a map of userId to user name for quick lookup
//         const userNameMap = {};
//         users.forEach((user) => {
//             userNameMap[user.id] = user.name;
//         });

//         // Send messages to Slack for each created task
//         const webhook = new IncomingWebhook(webhookUrl);
//         for (const createdTask of createdTasks) {
//             const userName = userNameMap[createdTask.userId];
//             const descriptionMarkdown = turndownService.turndown(
//                 createdTask.description
//             );
//             await webhook.send({
//                 text: `${frequency} Task Scheduler:`,
//                 blocks: [
//                     {
//                         type: "section",
//                         text: {
//                             type: "mrkdwn",
//                             text: `*${userName || "Unknown User"}*\n*${
//                                 createdTask.updatedAt
//                             }*\n\n*Title*: ${
//                                 createdTask.title
//                             }\n*Description*:\n${descriptionMarkdown}`,
//                         },
//                     },
//                 ],
//             });
//         }
//     } catch (error) {
//         console.error(`Error creating ${frequency} task:`, error.message);
//     }
// }

//  Main function for cron Job

async function createDailyTask(frequency, webhookUrl) {
    try {
        console.log(`Starting createDailyTask for frequency: ${frequency}`);

        const todayAbbreviation = getCurrentDayAbbreviation();
        const tasksToProcess = await getTasksToProcess(
            frequency,
            todayAbbreviation
        );

        for (const task of tasksToProcess) {
            await processTask(task, frequency, webhookUrl);
        }

        console.log(`${frequency} tasks created for all users.`);
    } catch (error) {
        console.error(`Error creating ${frequency} task:`, error.message);
    }
}

//  weekday current Day function
function getCurrentDayAbbreviation() {
    return new Date()
        .toLocaleString("en-us", { weekday: "short" })
        .toLowerCase();
}

//  frequncy based task proccess
async function getTasksToProcess(frequency, todayAbbreviation) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await repetedTasks.findAll({
        where: {
            task_frequency: frequency,
        },
    });

    if (frequency === "weekDays") {
        return tasks.filter(
            (task) =>
                task.selectedDays &&
                task.selectedDays.includes(todayAbbreviation)
        );
    }

    return tasks;
}

async function processTask(task, frequency, webhookUrl) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tenAMToday = new Date(today);
    tenAMToday.setHours(10, 0, 0, 0);

    const existingTask = await taskModel.findOne({
        where: {
            userId: task.userId,
            createdAt: {
                [Op.gte]: today, // Find tasks created today or later
                [Op.lt]: tenAMToday, //  before 10:00 AM today
            },
        },
    });

    if (!existingTask) {
        const user = await userModel.findByPk(task.userId);

        const createdTask = await createNewTask(task);

        console.log(
            `${frequency} task created for task id:`,
            task.id,
            createdTask
        );
        await sendTaskNotification(
            user,
            task,
            createdTask,
            frequency,
            webhookUrl
        );
    } else {
        console.log(`${frequency} task already created:`, task.id);
    }
}

// Create A new Task
async function createNewTask(taskData) {
    const {
        title,
        description,
        task_frequency,
        userId,
        selectedDays,
        dueDate,
    } = taskData;
    return taskModel.create({
        title,
        description,
        task_frequency,
        userId,
        selectedDays,
        dueDate,
    });
}

// Send slack notification
async function sendTaskNotification(
    user,
    task,
    createdTask,
    frequency,
    webhookUrl
) {
    const descriptionMarkdown = turndownService.turndown(task.description);

    const webhook = new IncomingWebhook(webhookUrl);
    await webhook.send({
        text: `${frequency} Task scheduler:`,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${user.name}*\n*${task.updatedAt}*\n\n*Title*: ${createdTask.title}\n*Description*:\n${descriptionMarkdown}`,
                },
            },
        ],
    });
}

//  weekdays for fetch current day and store it
async function fetchSelectedDays() {
    try {
        // console.log("2");

        const todayAbbreviation = new Date()
            .toLocaleString("en-us", { weekday: "short" })
            .toLowerCase();

        // Fetch tasks with 'weekDays' frequency and selectedDays not null
        const repeatTask = await repeatedTasks.findAll({
            where: {
                task_frequency: "weekDays",
                selectedDays: { [Op.ne]: null }, // Filter out tasks with no selected days
            },
        });

        const selectedDaysMap = new Map(); // Map to store selected days for each task

        // Extract selected days for each task and store in the map
        repeatTask.forEach((task) => {
            if (
                task.selectedDays &&
                task.selectedDays.includes(todayAbbreviation)
            ) {
                selectedDaysMap.set(
                    task.id,
                    [todayAbbreviation] // Store only the current day's abbreviation
                );
            }
        });

        return selectedDaysMap;
    } catch (error) {
        console.error("Error fetching selected days:", error);
        throw error; // Handle or propagate the error as needed
    }
}

module.exports = {
    createTask,
    updateTaskById,
    deleteTaskById,
    relationship,
    getTaskById,
    createDailyTask,
    deleteAllTasks,
    getAllAndFilterTask,
    fetchSelectedDays,
};
