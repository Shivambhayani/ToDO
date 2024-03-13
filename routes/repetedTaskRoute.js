const express = require("express");
const router = express.Router();
const repeatTaskController = require("../controller/repeatTaskController.js");

const { verifyToken } = require("../middleware/authMiddleware.js");

//  routes
router.route("/create").post(verifyToken, repeatTaskController.createTask);

router.route("/").get(verifyToken, repeatTaskController.getAllAndFilterTask);

router.route("/:id").patch(verifyToken, repeatTaskController.updateTaskById);

router.route("/:id").delete(verifyToken, repeatTaskController.deleteTaskById);

router.route("/relation").get(repeatTaskController.relationship);

router.route("/:id").get(verifyToken, repeatTaskController.getTaskById);

/* delete all tasks */

router
    .route("/bulkDelete/:id")
    .delete(verifyToken, repeatTaskController.deleteAllTasks);

// router.route("/").get(verifyToken, repeatTaskController.filterTask);

module.exports = router;
