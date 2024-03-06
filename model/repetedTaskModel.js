const Sequelize = require('sequelize');
const db = require('../utils/database')
const User = require('./userModel')

const repeatedTasks = db.define('repeat_Tasks', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
    },
    task_frequency: {
        type: Sequelize.ENUM('Daily', 'weekly', 'monthly', 'Quarterly', 'yearly'),
        defaultValue: 'Daily'
    }
    ,
    status: {
        type: Sequelize.ENUM('TODO', 'IN-PROGRESS', 'DONE'),
        defaultValue: 'TODO'
    },
    userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
});
User.hasMany(repeatedTasks, { foreignKey: 'userId' })
repeatedTasks.belongsTo(User, { foreignKey: 'userId' })

module.exports = repeatedTasks