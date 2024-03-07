const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const User = require('../model/userModel');
const { where } = require('sequelize');

const generateToken = (id) => {

    return jwt.sign({ id: id }, process.env.ACESS_TOKEN, {
        expiresIn: process.env.EXPIRE
    });
}

const sendToken = (user, token, statusCode, res) => {
    // const token = generateToken(user.id);
    res.status(statusCode).json({
        status: 'success',
        tokens: { token }
        , data: {
            user
        }
    })

}

const verifyToken = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer', '').trim()
        if (!token) {
            return res.status(403).json({ message: "No token provided!" });
        }
        // console.log('token =>>>>', token);
        const decoded = jwt.verify(token, process.env.ACESS_TOKEN);
        // console.log('decode===>', decoded);
        const user = await User.findOne({ where: { id: decoded.id } })
        // console.log("user=>>>>>>", user);
        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        console.log(err);
        return res.status(401).json({ message: "Unauthorized!" });

        // next(err)
    }
}


module.exports = { generateToken, sendToken, verifyToken }