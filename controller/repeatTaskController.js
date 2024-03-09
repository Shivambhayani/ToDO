const User = require("../model/userModel");
const repetedTasks = require("../model/repetedTaskModel");
const userModel = require("../model/userModel");
const taskModel = require("../model/taskModel");
const { verifyToken } = require("../middleware/authMiddleware");

const findTaskByUserId = async (userId, id) => {
    return await repetedTasks.findOne({ where: { id, userId } });
};

const createTask = async (req, res) => {
    try {
        const { title, description, task_frequency, status } = req.body;
        const userId = req.user.id;
        // const userId = await getLastUserIdFromDatabase()

        const data = await repetedTasks.create({
            title,
            description,
            task_frequency,
            status,
            userId,
        });
        // send data in normal task table
        await taskModel.create({ title, description, status, userId });
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

const getAllTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await repetedTasks.findAll({ where: { userId } });
        if (data.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "No tasks found. Create a new task",
            });
        }
        res.status(200).json({ status: "success", data: data });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

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

const getTaskById = async (req, res) => {
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

async function handleTasks(frequency) {
    try {
        // Logic to handle tasks based on frequency
        const tasks = await repetedTasks.findAll({
            where: { task_frequency: frequency },
        });
        console.log(`${frequency} tasks:`, tasks);
    } catch (error) {
        console.error(`Error handling ${frequency} tasks:`, error);
    }
}
//  daily task
// async function getAllUsers() {
//     try {
//         const users = await userModel.findAll();
//         return users;
//     } catch (error) {
//         throw new Error(`Error fetching users: ${error.message}`);
//     }
// }
async function createDailyTask(frequency) {
    try {
        console.log(`Starting createDailyTask for frequency: ${frequency}`);
        const repeatTask = await repetedTasks.findAll({
            where: { task_frequency: frequency },
        });

        if (!repeatTask || repeatTask.length === 0) {
            throw new Error("No users found in the database.");
        }

        // Create a new daily task for each user
        for (const Task of repeatTask) {
            const task = await taskModel.create({
                title: Task.title,
                description: Task.description,
                userId: Task.userId,
            });

            console.log("Daily task created for Daily Task:", Task.id, task);
        }

        console.log("Daily tasks created for all users.");
    } catch (error) {
        console.error("Error creating daily task:", error.message);
    }
}

module.exports = {
    createTask,
    getAllTask,
    updateTaskById,
    deleteTaskById,
    relationship,
    getTaskById,
    createDailyTask,
};
