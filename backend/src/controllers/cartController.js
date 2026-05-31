const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── ADD TO CART ───────────────────────────────────────────────────────────────

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!productId || !isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const qty = parseInt(quantity) || 1;
        if (qty < 1 || qty > 100) {
            return res.status(400).json({ success: false, message: "Quantity must be between 1 and 100" });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check stock availability
        if (product.stock < qty) {
            return res.status(400).json({ success: false, message: "Insufficient stock" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [{ product: productId, quantity: qty }] });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += qty;
                if (cart.items[itemIndex].quantity > 100) {
                    cart.items[itemIndex].quantity = 100;
                }
            } else {
                cart.items.push({ product: productId, quantity: qty });
            }

            await cart.save();
        }

        const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price stock");

        return res.json({ success: true, message: "Item added to cart", data: populatedCart });
    } catch (err) {
        logger.error("addToCart error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to update cart" });
    }
};

// ─── GET USER'S CART ───────────────────────────────────────────────────────────

exports.getCart = async (req, res) => {
    try {
        // Authorization: users can only see their own cart
        const cart = await Cart.findOne({ user: req.user.id })
            .populate("items.product", "name price stock description");

        if (!cart) {
            return res.json({ success: true, data: { items: [] } });
        }

        return res.json({ success: true, data: cart });
    } catch (err) {
        logger.error("getCart error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch cart" });
    }
};

// ─── REMOVE ITEM FROM CART ─────────────────────────────────────────────────────

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId || !isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // Authorization: can only modify own cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const sizeBefore = cart.items.length;
        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        if (cart.items.length === sizeBefore) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        await cart.save();

        return res.json({ success: true, message: "Item removed from cart", data: cart });
    } catch (err) {
        logger.error("removeFromCart error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to remove item" });
    }
};

// ─── CLEAR CART ────────────────────────────────────────────────────────────────

exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return res.json({ success: true, message: "Cart cleared" });
    } catch (err) {
        logger.error("clearCart error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to clear cart" });
    }
};
