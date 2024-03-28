const Sequelize = require("sequelize");
const db = require("../utils/database");
const User = require("./userModel");
const moment = require("moment");

const taskModel = db.define(
    "tasks",
    {
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
        status: {
            type: Sequelize.ENUM("TODO", "IN-PROGRESS", "DONE"),
            defaultValue: "TODO",
        },
        task_frequency: {
            type: Sequelize.ENUM(
                "daily",
                "weekly",
                "weekDays",
                "monthly",
                "quarterly",
                "yearly",
                "custom"
            ),
        },
        selectedDays: {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: true,
        },
        // duration: {
        //     type: Sequelize.JSON, // JSON type for storing an object
        //     allowNull: true,
        // },
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
            //     defaultValue: Sequelize.NOW,
            //     get() {
            //         return moment(this.getDataValue("dueDate"))
            //             .tz("Asia/Kolkata")
            //             .format("DD/MM/YYYY");
            //     },
            // },
        },
        deletedAt: {
            type: Sequelize.DATE,
            allowNull: true, // Allow null to enable soft delete
        },
    },
    {
        paranoid: true, // Enable soft delete
    }
);

User.hasMany(taskModel, { foreignKey: "userId" });
taskModel.belongsTo(User, { foreignKey: "userId" });

module.exports = taskModel;
