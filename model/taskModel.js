const Sequelize = require("sequelize");
const db = require("../utils/database");
const User = require("./userModel");

const taskModel = db.define("tasks", {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.ENUM("TODO", "IN-PROGRESS", "DONE"),
        defaultValue: "TODO",
    },
    userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
});

User.hasMany(taskModel, { foreignKey: "userId" });
taskModel.belongsTo(User, { foreignKey: "userId" });

module.exports = taskModel;
