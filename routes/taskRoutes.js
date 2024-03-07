const express = require("express");
const router = express.Router();
const taskController = require("../controller/taskController");
const { verifyToken } = require("../middleware/authMiddleware");

router.route("/create").post(verifyToken, taskController.createTask);

router.route("/relation").get(taskController.relationship);

router.route("/gettasks").get(verifyToken, taskController.getAllTask);

router.route("/:id").get(verifyToken, taskController.getTaskById);

router.route("/:id").patch(verifyToken, taskController.updateTaskById);

router.route("/:id").delete(verifyToken, taskController.deleteTaskById);

module.exports = router;
