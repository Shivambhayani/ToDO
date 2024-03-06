const { where } = require('sequelize');
const tasks = require('../model/taskModel')
const User = require('../model/userModel')

//  new user cerated 
const getLastUserIdFromDatabase = async () => {
    try {

        const lastUser = await User.findOne({ order: [['id', 'DESC']] });
        if (lastUser) {
            return lastUser.id;
        } else {

            return
        }
    } catch (error) {
        throw error;
    }
};

const findTaskByUserId = async (userId, id) => {
    return await tasks.findOne({ where: { id, userId } });
};

const createTask = async (req, res) => {

    try {
        const { title, description, status } = req.body;
        const userId = await getLastUserIdFromDatabase()

        const data = await tasks.create({
            title, description, status, userId
        })

        res.status(201).json({
            status: 'success',
            data: data
        })

    } catch (error) {
        return res.status(403).json({ error: 'Not Authoziation !' })
    }
}

const relationship = async (req, res) => {
    try {
        const data = await tasks.findAll({
            attributes: ['title', 'description', 'status'],
            include: [
                {
                    model: User,
                    attributes: ['name', 'email']
                }
            ]
        })
        res.status(200).json({
            status: 'success',
            data: data
        })

    } catch (error) {
        return res.status(500).json(error.message)
    }
}

const getTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const task = await findTaskByUserId(userId, taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ data: task })
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const getAllTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await tasks.findAll({ where: { userId } })
        if (data.length === 0) {
            return res.status(404).json({ message: 'No tasks found. Create a new task' });
        }
        res.status(200).json({ status: 'success', data: data })
    }
    catch (error) {
        return res.status(500).json(error.message)
    }
}


const deleteTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const task = await findTaskByUserId(userId, taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.destroy();

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const updateTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        let task = await findTaskByUserId(userId, taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found for authorized user' });
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

        res.status(200).json({ status: 'success', data: task });
    } catch (error) {
        return res.status(500).json(error.message);
    }
};

module.exports = {
    createTask,
    relationship,
    getAllTask,
    getTaskById,
    updateTaskById,
    deleteTaskById,
    findTaskByUserId,
    getLastUserIdFromDatabase
}
























// const updateTask = async (req, res) => {
//     try {
//         const userId = req.user.id;


//         const task = await tasks.findOne({ where: { userId } })
//         if (!task) {
//             return res.status(404).json({ message: 'Task not found for authorized user ' });
//         }

//         // const userId = task.userId;
//         const { title, description, status } = req.body;
//         // Update task fields if res.body provided
//         if (title !== undefined) {
//             task.title = title;
//         }
//         if (description !== undefined) {
//             task.description = description;
//         }
//         if (status !== undefined) {
//             task.status = status;
//         }


//         await task.save();

//         res.status(200).json({ status: 'success', data: task });
//     } catch (error) {
//         return res.status(500).json(error.message);
//     }
// };

// const deleteTask = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         const task = await tasks.findOne({ where: { userId } })
//         if (!task) {
//             return res.status(404).json({ message: 'Task not found' });
//         }

//         await task.destroy();

//         res.status(200).json({ message: 'Task deleted successfully' });
//     } catch (error) {
//         return res.status(500).json(error.message);
//     }
// };