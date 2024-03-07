const express = require('express');
const userController = require('../controller/userController')
const { verifyToken } = require('../middleware/authMiddleware')


const router = express.Router();


router
    .route('/signup')
    .post(userController.signUp)

router
    .route('/login')
    .post(userController.login)

router
    .route('/:id')
    .delete(verifyToken, userController.deletedUser)

module.exports = router;