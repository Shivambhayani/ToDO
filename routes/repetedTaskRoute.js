const express = require("express");
const router = express.Router();
const repeatTaskController = require("../controller/repeatTaskController.js");

const { verifyToken } = require("../middleware/authMiddleware.js");

//  routes
router.route("/create").post(verifyToken, repeatTaskController.createTask);

router.route("/getall").get(verifyToken, repeatTaskController.getAllTask);

router.route("/:id").patch(verifyToken, repeatTaskController.updateTaskById);

router.route("/:id").delete(verifyToken, repeatTaskController.deleteTaskById);

router.route("/relation").get(repeatTaskController.relationship);

router.route("/:id").get(verifyToken, repeatTaskController.getTaskById);

module.exports = router;
