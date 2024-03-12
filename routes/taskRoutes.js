const express = require("express");
const router = express.Router();
const taskController = require("../controller/taskController");
const { verifyToken } = require("../middleware/authMiddleware");

router.route("/create").post(verifyToken, taskController.createTask);

router.route("/relation").get(taskController.relationship);

//  get all task and filter
router.route("/").get(verifyToken, taskController.getAllAndFilterTask);

router.route("/:id").get(verifyToken, taskController.getTaskById);

router.route("/:id").patch(verifyToken, taskController.updateTaskById);

router.route("/:id").delete(verifyToken, taskController.deleteTaskById);

// router.route("/").get(verifyToken, taskController.filterTask);

/*  Delete tasks */
router
    .route("/bulkDelete/:id")
    .delete(verifyToken, taskController.deleteAllTasks);

module.exports = router;
