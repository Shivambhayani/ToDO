const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs')
const db = require('../utils/database')

const userModel = db.define('users', {

    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        set(value) {
            const hash = bcrypt.hashSync(value, 10);
            this.setDataValue('password', hash);
        }
    },
    tokens: {
        type: Sequelize.STRING
    }

})
module.exports = userModel;