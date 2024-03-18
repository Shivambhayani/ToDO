const { where } = require("sequelize");
const tasks = require("../model/taskModel");
const User = require("../model/userModel");
const Sequelize = require("sequelize");
const { sequalize, QueryTypes } = Sequelize;
const moment = require("moment");
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
        const { title, description, status, task_frequency, dueDate } =
            req.body;
        const userId = req.user.id;

        const parsedDueDate = moment.utc(dueDate, "DD/MM/YYYY").toDate();
        const formattedDueDate = moment(parsedDueDate)
            .tz("Asia/Kolkata")
            .format("DD/MM/YYYY");
        const data = await tasks.create({
            title,
            description,
            task_frequency,
            status,
            userId,
            dueDate: parsedDueDate,
        });

        res.status(201).json({
            status: "success",
            data: { ...data.toJSON(), dueDate: formattedDueDate },
        });
    } catch (error) {
        // Check if the error is a Sequelize validation error
        if (error.name === "SequelizeValidationError") {
            // Extract the first validation error message from the array
            const errorMessage = error.errors[0].message;
            return res.status(400).json({
                status: "fail",
                message: errorMessage, // Send the validation error message
            });
        } else {
            return res.status(500).json({
                status: "fail",
                message: "An error occurred while creating the task.",
            });
        }
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

        const taskId = req.params.id;
        let task = await findTaskByUserId(userId, taskId);

        if (!task) {
            return res.status(404).json({
                status: "fail",
                message: "Task not found !",
            });
        }

        const { title, description, status, dueDate } = req.body;

        if (title !== undefined) {
            task.title = title;
        }
        if (description !== undefined) {
            task.description = description;
        }
        if (status !== undefined) {
            task.status = status;
        }
        if (dueDate !== undefined) {
            task.dueDate = moment(dueDate, "DD/MM/YYYY").toDate();
        }

        await task.save();
        const formattedDueDate = moment(task.dueDate).format("DD/MM/YYYY");

        res.status(200).json({
            status: "success",
            data: { ...task.toJSON(), dueDate: formattedDueDate },
        });
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
