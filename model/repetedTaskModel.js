const Sequelize = require("sequelize");
const db = require("../utils/database");
const User = require("./userModel");
const moment = require("moment");
const repeatedTasks = db.define("repeat_Tasks", {
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
        type: Sequelize.STRING(1023),
        validate: {
            len: {
                args: [0, 1023], // Allow up to 1000 characters
                msg: "Description cannot exceed 1000 characters",
            },
        },
    },
    task_frequency: {
        type: Sequelize.ENUM(
            "Daily",
            "weekly",
            "weekDays",
            "monthly",
            "Quarterly",
            "yearly",
            "custom"
        ),
        defaultValue: "Daily",
    },
    selectedDays: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
    },
    duration: {
        type: Sequelize.JSON, // JSON type for storing an object
        allowNull: true,
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
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue("createdAt"))
                .tz("Asia/Kolkata")
                .format("lll");
        },
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue("updatedAt"))
                .tz("Asia/Kolkata")
                .format("lll");
        },
    },
    dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
        // defaultValue: Sequelize.NOW,
        // get() {
        //     return moment(this.getDataValue("dueDate"))
        //         .tz("Asia/Kolkata")
        //         .format("DD/MM/YYYY");
        // },
    },
});
User.hasMany(repeatedTasks, { foreignKey: "userId" });
repeatedTasks.belongsTo(User, { foreignKey: "userId" });

module.exports = repeatedTasks;
