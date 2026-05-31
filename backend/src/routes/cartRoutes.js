const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

// All cart routes require authentication
router.post("/add", authMiddleware, cartController.addToCart);
router.get("/", authMiddleware, cartController.getCart);
router.post("/remove", authMiddleware, cartController.removeFromCart);
router.delete("/clear", authMiddleware, cartController.clearCart);

module.exports = router;
