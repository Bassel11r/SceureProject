const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authLimiter } = require("../middlewares/rateLimitMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
