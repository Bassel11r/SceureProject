const Product = require("../models/Product");
const validator = require("validator");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

// ─── Helper ────────────────────────────────────────────────────────────────────

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── CREATE PRODUCT (Admin only) ──────────────────────────────────────────────

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ success: false, message: "Name and price are required" });
        }

        if (!validator.isLength(String(name), { min: 1, max: 200 })) {
            return res.status(400).json({ success: false, message: "Name must be between 1 and 200 characters" });
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ success: false, message: "Price must be a non-negative number" });
        }

        const parsedStock = stock !== undefined ? parseInt(stock) : 0;
        if (isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).json({ success: false, message: "Stock must be a non-negative integer" });
        }

        const product = await Product.create({
            name,
            price: parsedPrice,
            description: description || "",
            stock: parsedStock,
        });

        logger.info(`Product created by admin ${req.user.id}: ${product._id}`);

        return res.status(201).json({ success: true, message: "Product created", data: product });
    } catch (err) {
        logger.error("createProduct error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to create product" });
    }
};

// ─── GET ALL PRODUCTS (Public) ────────────────────────────────────────────────

exports.getAllProducts = async (req, res) => {
    try {
        // Limit fields returned; paginate to avoid data dumps
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find().select("name price description stock createdAt").skip(skip).limit(limit),
            Product.countDocuments(),
        ]);

        return res.json({
            success: true,
            data: products,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        logger.error("getAllProducts error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

// ─── GET SINGLE PRODUCT (Public) ──────────────────────────────────────────────

exports.getProductById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, data: product });
    } catch (err) {
        logger.error("getProductById error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch product" });
    }
};

// ─── UPDATE PRODUCT (Admin only) ──────────────────────────────────────────────

exports.updateProduct = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // Whitelist allowed update fields — prevent mass assignment
        const { name, price, description, stock } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (!validator.isLength(String(name), { min: 1, max: 200 })) {
                return res.status(400).json({ success: false, message: "Name must be between 1 and 200 characters" });
            }
            updates.name = name;
        }

        if (price !== undefined) {
            const p = parseFloat(price);
            if (isNaN(p) || p < 0) {
                return res.status(400).json({ success: false, message: "Invalid price" });
            }
            updates.price = p;
        }

        if (description !== undefined) updates.description = description;

        if (stock !== undefined) {
            const s = parseInt(stock);
            if (isNaN(s) || s < 0) {
                return res.status(400).json({ success: false, message: "Invalid stock value" });
            }
            updates.stock = s;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,    // Run Mongoose schema validators on update
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        logger.info(`Product updated by admin ${req.user.id}: ${product._id}`);

        return res.json({ success: true, message: "Product updated", data: product });
    } catch (err) {
        logger.error("updateProduct error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to update product" });
    }
};

// ─── DELETE PRODUCT (Admin only) ──────────────────────────────────────────────

exports.deleteProduct = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        logger.info(`Product deleted by admin ${req.user.id}: ${req.params.id}`);

        return res.json({ success: true, message: "Product deleted" });
    } catch (err) {
        logger.error("deleteProduct error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to delete product" });
    }
};
