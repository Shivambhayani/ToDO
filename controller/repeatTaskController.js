const User = require("../model/userModel");
const repetedTasks = require("../model/repetedTaskModel");
const userModel = require("../model/userModel");
const taskModel = require("../model/taskModel");
const { Op } = require("sequelize");
const { verifyToken } = require("../middleware/authMiddleware");
const { IncomingWebhook } = require("@slack/webhook");
const cheerio = require("cheerio");

// htmal praser
function removeHTMLTags(html) {
    return html.replace(/<[^>]*>/g, "");
}

const findTaskByUserId = async (userId, id) => {
    return await repetedTasks.findOne({ where: { id, userId } });
};

/* create tasks */
const createTask = async (req, res) => {
    try {
        const { title, description, task_frequency, status } = req.body;
        const userId = req.user.id;
        let cleartitle = removeHTMLTags(title);
        let cleardescription = removeHTMLTags(description);

        const data = await repetedTasks.create({
            title: cleartitle,
            description: cleardescription,
            task_frequency,
            status,
            userId,
        });

        /* send data in normal task table */
        await taskModel.create({
            title: cleardescription,
            description: cleardescription,
            status,
            userId,
            task_frequency,
        });
        res.status(201).json({
            status: "success",
            data: data,
        });
    } catch (error) {
        return res.status(403).json({
            status: "fail",
            error: error.message,
        });
    }
};

/*  get Tasks */
const getTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        // const userId = await getLastUserIdFromDatabase()
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
        res.status(200).json({ status: "success", data: data });
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
        // const userId = await getLastUserIdFromDatabase()
        const taskId = req.params.id;
        let task = await findTaskByUserId(userId, taskId);

        if (!task) {
            return res.status(404).json({
                status: "fail",
                message: "Task not found for authorized user",
            });
        }

        const { title, description, task_frequency, status } = req.body;

        if (title !== undefined) {
            task.title = title;
        }
        if (description !== undefined) {
            task.description = description;
        }
        if (task_frequency !== undefined) {
            task.task_frequency = task_frequency;
        }
        if (status !== undefined) {
            task.status = status;
        }

        await task.save();

        res.status(200).json({
            status: "success",
            data: task,
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
        // const userId = await getLastUserIdFromDatabase()
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

        // const tasks = await repetedTasks.findAll({
        //     where: {
        //         userId: userId,
        //         id: taskId,
        //     },
        // });
        // for (const task of tasks) {
        //     await task.destroy();
        // }

        // await tasks.save();

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
async function createDailyTask(frequency, webhookUrl) {
    try {
        console.log(`Starting createDailyTask for frequency: ${frequency}`);
        const repeatTask = await repetedTasks.findAll({
            where: { task_frequency: frequency },
        });

        if (!repeatTask || repeatTask.length === 0) {
            throw new Error("No users found in the database.");
        }

        //  get today creatd task
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tenAMToday = new Date(today);
        tenAMToday.setHours(10, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Create a new daily task for each tasks
        for (const Task of repeatTask) {
            // Check if a task has already been created for this user today
            const existingTask = await taskModel.findOne({
                where: {
                    userId: Task.userId,
                    createdAt: {
                        [Op.gte]: today, // Find tasks created today or later
                        [Op.lt]: tenAMToday, // Find tasks created before 10:00 AM today
                    },
                },
            });

            /*  if task not created today or not exists than creat e new task */
            if (!existingTask) {
                // let title = Task.title.replace(/<\/?p>/g, "").trim(); // Remove <p> tags
                // let description = Task.description
                //     .replace(/<\/?p>/g, "")
                //     .trim();

                let title = removeHTMLTags(Task.title);
                let description = removeHTMLTags(Task.description);

                const task = await taskModel.create({
                    title: title,
                    description: description,
                    task_frequency: Task.task_frequency,
                    userId: Task.userId,
                });

                console.log(
                    `${frequency} task created for task id:`,
                    Task.id,
                    task
                );

                // Send message to Slack channel
                const webhook = new IncomingWebhook(webhookUrl);
                await webhook.send({
                    text: `${frequency}Task schedular:`,
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `${task.title}\n${task.description}`,
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

module.exports = {
    createTask,
    updateTaskById,
    deleteTaskById,
    relationship,
    getTaskById,
    createDailyTask,
    deleteAllTasks,
    getAllAndFilterTask,
};
