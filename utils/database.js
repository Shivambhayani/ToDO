const Sequelize = require("sequelize");
const sequelize = Sequelize;

const db = new Sequelize("to_do", "shivam01.tst", "wUaMup0x2hoG", {
    host: "ep-shiny-term-a1i65k6f-pooler.ap-southeast-1.aws.neon.tech",
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    sslmode: "require",
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
});

module.exports = db;
