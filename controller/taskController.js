const { where } = require("sequelize");
const tasks = require("../model/taskModel");
const User = require("../model/userModel");
const Sequelize = require("sequelize");
const { sequalize, QueryTypes } = Sequelize;
//  new user cerated
const getLastUserIdFromDatabase = async () => {
    try {
        const lastUser = await User.findOne({ order: [["id", "DESC"]] });
        if (lastUser) {
            return lastUser.id;
        } else {
            return;
        }
    } catch (error) {
        throw error;
    }
};

const findTaskByUserId = async (userId, id) => {
    return await tasks.findOne({ where: { id, userId } });
};

/*  create new task */
const createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const userId = req.user.id;
        // console.log(userId);
        const data = await tasks.create({
            title,
            description,
            status,
            userId,
        });

        res.status(201).json({
            status: "success",
            data: data,
        });
    } catch (error) {
        return res.status(403).json({
            status: "fail",
            message: error.message,
        });
    }
};

const relationship = async (req, res) => {
    try {
        const data = await tasks.findAll({
            attributes: ["title", "description", "status"],
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

/*  get task by id */

const getTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId || userId.length === 0) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorize",
            });
        }
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

/*  get All tasks */
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
            data = await tasks.findAll({ where: { userId } });
        } else {
            data = await tasks.findAll({
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
//         // console.log(userId);
//         if (!userId || userId.length === 0) {
//             return res.status(401).json({
//                 status: "fail",
//                 message: "Unauthorize",
//             });
//         }
//         const data = await tasks.findAll({ where: { userId } });

//         res.status(200).json({ status: "success", data: data });
//     } catch (error) {
//         return res.status(500).json({
//             status: "fail",
//             message: error.message,
//         });
//     }
// };

/* updated by id */
const updateTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId || userId.length === 0) {
            return res.status(401).json({
                status: "fail",
                message: "Token not found",
            });
        }
        // const userId = await getLastUserIdFromDatabase()
        const taskId = req.params.id;
        let task = await findTaskByUserId(userId, taskId);

        if (!task) {
            return res.status(404).json({
                status: "fail",
                message: "Task not found !",
            });
        }

        const { title, description, status } = req.body;

        if (title !== undefined) {
            task.title = title;
        }
        if (description !== undefined) {
            task.description = description;
        }
        if (status !== undefined) {
            task.status = status;
        }

        await task.save();

        res.status(200).json({ status: "success", data: task });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message,
        });
    }
};

// const statusFilter = ["TO-DO", "IN-PROGRESS", "DONE"];

/* delete multiple task */
const deleteAllTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId || userId.length === 0) {
            return res.status(400).json({
                status: "fail",
                message: "User id required",
            });
        }
        const taskId = req.params.id.split(",").map((id) => parseInt(id));
        if (!taskId || taskId.length === 0) {
            return res.status(400).json({
                status: "fail",
                message: "task id not found",
            });
        }

        // const multiTasks = await tasks.findAll({
        //     where: {
        //         userId: userId,
        //         ...req.query,
        //     },
        // });
        // for (const task of multiTasks) {
        //     await task.destroy();
        // }

        await tasks.destroy({
            where: {
                userId: userId,
                id: taskId,
            },
        });
        // Check if the number of retrieved tasks matches the number of requested task IDs
        // if (tasks.length !== taskId.length) {
        //     return res.status(403).json({
        //         status: "fail",
        //         message:
        //             "Some task IDs do not belong to the authenticated user",
        //     });
        // }

        return res.status(200).json({
            status: "success",
            message: "All Task deleted successfully",
        });
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            // message: error.message,
            message: "id provide",
            // stack: error.stack,
        });
    }
};

/*  Delete by id */
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

module.exports = {
    createTask,
    relationship,
    getTaskById,
    updateTaskById,
    deleteTaskById,
    findTaskByUserId,
    getLastUserIdFromDatabase,
    getAllAndFilterTask,
    deleteAllTasks,
};
