const Sequelize = require('sequelize');
const sequelize = Sequelize;



// const db = new sequelize('to_do', 'root', 'password$1', {
//     host: 'localhost',
//     dialect: 'mysql',
//     port: 3306,
//     pool: {
//         max: 5,
//         min: 0,
//         idle: 10000
//     }
// })

const db = new sequelize('to_do', 'shivam01.tst', 'wUaMup0x2hoG', {
    host: 'ep-shiny-term-a1i65k6f-pooler.ap-southeast-1.aws.neon.tech',
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    sslmode: 'require',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
})


// db.sync({ alter: false, force: false })
//     .then(() => console.log('sync succesfully'))
//     .catch((e) => console.log('Error in syncing', e))



module.exports = db;