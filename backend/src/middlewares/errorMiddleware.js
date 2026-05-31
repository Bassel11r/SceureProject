const logger = require("../utils/logger");

/**
 * Global Error Handler Middleware
 *
 * - Logs full error internally (stack trace, details)
 * - Returns generic, safe message to client in production
 * - Prevents stack trace / internal info leakage to the client
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
    logger.error(`${req.method} ${req.path} — ${err.stack || err.message}`);

    // Handle Mongoose validation errors explicitly
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    // Handle MongoDB duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res.status(409).json({ success: false, message: `${field} already exists` });
    }

    // Handle CORS errors
    if (err.message && err.message.includes("CORS")) {
        return res.status(403).json({ success: false, message: "CORS policy violation" });
    }

    const statusCode = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message;

    return res.status(statusCode).json({ success: false, message });
};

module.exports = errorMiddleware;
