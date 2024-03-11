const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const { generateToken, sendToken } = require("../middleware/authMiddleware");

const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                status: "fail",
                message: "Email already exists!",
            });
        }

        const data = await User.create({
            name,
            email,
            password, // store token in databse
        });
        // if (name.length === 0) {
        //     return res.status(400).json({
        //         status: 'fail',
        //         message: 'name required'
        //     })
        // }
        const token = generateToken(data.id);

        const userWithoutPassword = { ...data.toJSON(), password: undefined };

        // res.status(201).json({
        //     status: 'success',
        //     data: {
        //         userWithoutPassword
        //     }
        // })
        sendToken(userWithoutPassword, token, 200, res);
        // sendToken(data, token, 201, res)
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "email or password required",
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user || user.length === 0) {
            return res.status(400).json({
                status: "fail",
                message: "user not found!",
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Wrong password" });
        }
        // Generate new token
        const token = generateToken(user.id);

        // Store new token in the database
        // user.tokens = token;
        // await user.save();

        const userWithoutPassword = {
            ...user.toJSON(),
            password: undefined,
            updatedAt: undefined,
            createdAt: undefined,
        };
        sendToken(userWithoutPassword, token, 200, res);
        // sendToken(user, token, 200, res)
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message,
        });
    }
};

const deletedUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }

        // Delete the user
        await user.destroy();

        user.tokens = null; // Remove the token from the user object
        await user.save();

        res.status(200).json({
            status: "success",
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message,
        });
    }
};

module.exports = { signUp, login, deletedUser };
