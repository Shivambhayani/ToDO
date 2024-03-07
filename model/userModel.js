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
        // allowNull: false,
        // validate: {
        //     notNull: {
        //         args: true,
        //         msg: "name must be required!"
        //     }
        // }

    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,

        set(value) {
            if (!/^[\w-\.]+\+?[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value.trim())) {
                throw new Error('Provide a valide email address !')
            }
            this.setDataValue('email', value)

        }

    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,

        set(value) {
            if (value.length > 6) {
                const hash = bcrypt.hashSync(value, 10);
                this.setDataValue('password', hash);
            } else {
                throw new Error('Password must be more than 6 letter')
            }
        }
    },
})
module.exports = userModel;