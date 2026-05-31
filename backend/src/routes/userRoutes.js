const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// All user management routes: admin only
router.get("/", authMiddleware, roleMiddleware("admin"), userController.getAllUsers);
router.get("/:id", authMiddleware, roleMiddleware("admin"), userController.getUserById);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), userController.deleteUser);
router.patch("/:id/role", authMiddleware, roleMiddleware("admin"), userController.updateRole);

module.exports = router;
