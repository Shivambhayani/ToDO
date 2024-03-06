const Sequelize = require('sequelize');
const sequelize = Sequelize;



const db = new sequelize('to_do', 'root', 'password$1', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
})






module.exports = db;
