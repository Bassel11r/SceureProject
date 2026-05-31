const User = require("../models/User");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET ALL USERS (Admin only) ───────────────────────────────────────────────

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("name email role createdAt");
        return res.json({ success: true, data: users });
    } catch (err) {
        logger.error("getAllUsers error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

// ─── GET USER BY ID (Admin only) ──────────────────────────────────────────────

exports.getUserById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const user = await User.findById(req.params.id).select("name email role createdAt");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, data: user });
    } catch (err) {
        logger.error("getUserById error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
};

// ─── DELETE USER (Admin only) ─────────────────────────────────────────────────

exports.deleteUser = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        // Prevent admin from deleting themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        logger.info(`User ${req.params.id} deleted by admin ${req.user.id}`);

        return res.json({ success: true, message: "User deleted" });
    } catch (err) {
        logger.error("deleteUser error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};

// ─── UPDATE USER ROLE (Admin only) ────────────────────────────────────────────

exports.updateRole = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const { role } = req.body;
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select("name email role");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        logger.info(`User ${req.params.id} role updated to '${role}' by admin ${req.user.id}`);

        return res.json({ success: true, message: "User role updated", data: user });
    } catch (err) {
        logger.error("updateRole error: " + err.message);
        return res.status(500).json({ success: false, message: "Failed to update role" });
    }
};
