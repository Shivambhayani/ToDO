const express = require('express');
const router = express.Router();
const repeatTaskController = require('../controller/repeatTaskController.js');

const { verifyToken } = require('../middleware/authMiddleware.js');

router
    .route('/create')
    .post(verifyToken, repeatTaskController.createTask)

router
    .route('/me')
    .patch(verifyToken, repeatTaskController.updateTask)


router
    .route('/getall')
    .get(verifyToken, repeatTaskController.getAllTask)



router
    .route('/me')
    .delete(verifyToken, repeatTaskController.deleteTask)

router
    .route('/:id')
    .patch(verifyToken, repeatTaskController.updateTaskById)

router
    .route('/:id')
    .delete(verifyToken, repeatTaskController.deleteTaskById)

router
    .route('/relation')
    .get(repeatTaskController.relationship)

module.exports = router;