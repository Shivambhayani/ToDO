const User = require("../model/userModel");
const repetedTasks = require("../model/repetedTaskModel");
const userModel = require("../model/userModel");
const taskModel = require("../model/taskModel");
const { Op } = require("sequelize");
const { IncomingWebhook } = require("@slack/webhook");
const moment = require("moment");
const TurndownService = require("turndown");
const cronWeekDays = require("../utils/corn");
const repeatedTasks = require("../model/repetedTaskModel");

// // htmal praser
// function removeHTMLTags(html) {
//     return html.replace(/<[^>]*>/g, "");
// }

const findTaskByUserId = async (userId, id) => {
    return await repetedTasks.findOne({ where: { id, userId } });
};

/* create tasks */
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
        const data = await repetedTasks.create({
            title,
            description,
            task_frequency,
            status,
            userId,
            selectedDays,
            dueDate: parsedDueDate ? parsedDueDate.toDate() : null,
        });

        /* send data in normal task table */
        await taskModel.create({
            title,
            description,
            status,
            userId,
            task_frequency,
            selectedDays,
            dueDate: parsedDueDate ? parsedDueDate.toDate() : null,
        });

        // If selectedDays are provided, schedule the weekdays task
        // if (selectedDays && selectedDays.length > 0) {
        //     console.log("Scheduling weekdays task...");
        //     const daysArray = selectedDays.split(",").map((day) => day.trim());
        //     await cronWeekDays.scheduleWeekDays(daysArray);
        // }
        res.status(201).json({
            status: "success",
            data: { ...data.toJSON(), dueDate: formattedDueDate },
        });
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            // Check if the error is for the description field
            const descriptionError = error.errors.find(
                (err) => err.path === "description"
            );
            // If there's a validation error for the description field, return its custom error message
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
const getAllAndFilterTask = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId || userId.length === 0) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorize",
            });
        }

        const { status, task_frequency } = req.query;
        const queryObj = {};

        if (status) {
            queryObj.status = status;
        }
        if (task_frequency) {
            queryObj.task_frequency = task_frequency;
        }
        let data;
        if (Object.keys(queryObj).length === 0) {
            data = await repetedTasks.findAll({ where: { userId } });
        } else {
            data = await repetedTasks.findAll({
                where: {
                    userId: userId,
                    ...queryObj,
                },
            });
        }
        const formattedData = data.map((task) => {
            return {
                ...task.toJSON(),
                // Format the dueDate to "DD/MM/YYYY"
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
// const getAllTask = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         //if userId -> null then 400, user is required
//         if (!userId || userId.length === 0) {
//             return res.status(401).json({
//                 status: "fail",
//                 message: "Unauthorize",
//             });
//         }
//         const data = await repetedTasks.findAll({ where: { userId } });

//         // data => undefined/null/ {} or [] then data not found

//         // if (data.length === 0) {
//         //     return res.status(404).json({
//         //         status: "fail",
//         //         message: "No tasks found. Create a new task",
//         //     });
//         // }
//         res.status(200).json({ status: "success", data: data });
//     } catch (error) {
//         return res.status(400).json({
//             status: "fail",
//             message: error.message,
//             stack: error.stack,
//         });
//     }
// };

/* Update Tasks*/
const updateTaskById = async (req, res) => {
    try {
        const userId = req.user.id;

        const taskId = req.params.id;
        let repeatedTask = await findTaskByUserId(userId, taskId);

        if (!repeatedTask) {
            return res.status(404).json({
                status: "fail",
                message: "Task not found ",
            });
        }

        const { title, description, task_frequency, status, dueDate } =
            req.body;

        if (title !== undefined) {
            repeatedTask.title = title;
        }
        if (description !== undefined) {
            repeatedTask.description = description;
        }
        if (task_frequency !== undefined) {
            repeatedTask.task_frequency = task_frequency;
        }
        if (status !== undefined) {
            repeatedTask.status = status;
        }
        if (dueDate !== undefined) {
            repeatedTask.dueDate = moment(dueDate, "DD/MM/YYYY").toDate();
        }

        // Save the updated repeatedTask in the repeated tasks table
        await repeatedTask.save();

        const normalTask = await taskModel.findOne({
            where: {
                userId: userId,
                title: repeatedTask.title,
            },
        });
        if (normalTask) {
            // if (title !== undefined) {
            //     normalTask.title = title;
            // }
            if (description !== undefined) {
                normalTask.description = description;
            }
            if (task_frequency !== undefined) {
                normalTask.task_frequency = task_frequency;
            }
            if (status !== undefined) {
                normalTask.status = status;
            }
            if (dueDate !== undefined) {
                normalTask.dueDate = moment(dueDate, "DD/MM/YYYY").toDate();
            }
            await normalTask.save();
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
        await task.save();

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
        const taskId = req.params.id.split(",").map((id) => parseInt(id));
        if (!taskId || taskId.length === 0) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorized",
            });
        }

        await repetedTasks.destroy({
            where: {
                userId: userId,
                id: taskId,
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
async function createDailyTask(frequency, webhookUrl, selectedDays) {
    try {
        console.log(`Starting createDailyTask for frequency: ${frequency}`);
        //  get today creatd task
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tenAMToday = new Date(today);
        tenAMToday.setHours(10, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const repeatTask = await repetedTasks.findAll({
            where: {
                task_frequency: frequency,
            },
        });

        if (!repeatTask || repeatTask.length === 0) {
            throw new Error("No users found in the database.");
        }

        // Create a new daily task for each tasks
        for (const Task of repeatTask) {
            // Check if a task has already been created for this user today
            const existingTask = await taskModel.findOne({
                where: {
                    userId: Task.userId,
                    createdAt: {
                        [Op.gte]: today, // Find tasks created today or later
                        // [Op.lt]: tenAMToday, //  before 10:00 AM today
                    },
                },
            });

            /*  if task not created today or not exists than creat e new task */
            if (!existingTask) {
                const user = await userModel.findByPk(Task.userId);

                let title = Task.title;
                let description = Task.description;

                const createdTask = await taskModel.create({
                    title: title,
                    description: description,
                    task_frequency: Task.task_frequency,
                    userId: Task.userId,
                });

                console.log(
                    `${frequency} task created for task id:`,
                    Task.id,
                    createdTask
                );
                // Convert description to Slack-compatible format
                const descriptionMarkdown =
                    turndownService.turndown(description);
                // Send message to Slack channel
                const webhook = new IncomingWebhook(webhookUrl);
                await webhook.send({
                    text: `${frequency}Task schedular:`,
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `*${user.name}*\n*${Task.updatedAt}*\n\n*Title*: ${createdTask.title}\n*Description*:\n${descriptionMarkdown}`,
                            },
                        },
                    ],
                });
            } else {
                console.log(`${frequency} task alredy created:`, Task.id);
            }
        }

        console.log(`${frequency} tasks created for all users.`);
    } catch (error) {
        console.error(`Error creating ${frequency}task:`, error.message);
    }
}

async function fetchSelectedDays() {
    try {
        // Fetch selected days from the database
        const repeatedTask = await repeatedTasks.findAll({
            where: {
                task_frequency: "weekDays",
            },
        });

        const selectedDays = new Set();
        // Extract unique selected days from the fetched data
        repeatedTask.forEach((task) => {
            if (task.selectedDays && task.selectedDays.length > 0) {
                task.selectedDays.forEach((day) => {
                    selectedDays.add(day.toLowerCase());
                });
            }
        });

        return Array.from(selectedDays);
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
