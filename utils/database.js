const Sequelize = require('sequelize');
const sequelize = Sequelize;



const db = new sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
})


db.sync({ alter: false, force: false })
    .then(() => console.log('sync succesfully'))
    .catch((e) => console.log('Error in syncing', e))



module.exports = db;
