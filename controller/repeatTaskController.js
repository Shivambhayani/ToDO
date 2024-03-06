const User = require('../model/userModel')
const repetedTasks = require('../model/repetedTaskModel')
const { getLastUserIdFromDatabase } = require('./taskController')

const findTaskByUserId = async (userId, id) => {
    return await repetedTasks.findOne({ where: { userId, id } });
};


const createTask = async (req, res) => {

    try {
        const { title, description, task_frequency, status } = req.body;
        // const userId = req.user.id;
        const userId = await getLastUserIdFromDatabase()

        const data = await repetedTasks.create({
            title, description, task_frequency, status, userId
        })

        res.status(201).json({
            status: 'success',
            data: data
        })
    } catch (error) {
        return res.status(403).json({ error: 'Not Authorized !' })
    }

}

const updateTask = async (req, res) => {
    try {
        const userId = req.user.id;

        const task = await repetedTasks.findOne({ where: { userId } })
        if (!task) {
            return res.status(404).json({ message: 'Task not found for authorized user ' });
        }

        // const userId = task.userId;
        const { title, description, task_frequency, status } = req.body;
        // Update task fields if res.body provided
        if (title !== undefined) {
            task.title = title;
        }
        if (description !== undefined) {
            task.description = description;
        }
        if (task_frequency !== undefined) {
            task.task_frequency = task_frequency
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

const getAllTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await repetedTasks.findAll({ where: { userId } })
        if (data.length === 0) {
            return res.status(404).json({ message: 'No tasks found. Create a new task' });
        }
        res.status(200).json({ status: 'success', data: data })
    }
    catch (error) {
        return res.status(400).json(error.message)
    }
};

const deleteTask = async (req, res) => {
    try {
        const userId = req.user.id;

        const task = await repetedTasks.findOne({ where: { userId } })
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.destroy();

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        return res.status(400).json(error.message);
    }
};

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

        const { title, description, task_frequency, status } = req.body;

        if (title !== undefined) {
            task.title = title;
        }
        if (description !== undefined) {
            task.description = description;
        }
        if (task_frequency !== undefined) {
            task.task_frequency = task_frequency
        }
        if (status !== undefined) {
            task.status = status;
        }

        await task.save();

        res.status(200).json({ status: 'success', data: task });
    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const relationship = async (req, res) => {
    try {
        const data = await repetedTasks.findAll({
            attributes: ['title', 'description', 'task_frequency', 'status'],
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
        return res.status(400).json(error.message)
    }
}



module.exports = {
    createTask,
    updateTask,
    getAllTask,
    updateTaskById,
    deleteTask,
    deleteTaskById,
    relationship
}