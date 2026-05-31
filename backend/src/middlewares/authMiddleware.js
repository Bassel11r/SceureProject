const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Authentication Middleware
 *
 * Verifies JWT from:
 *   1. HttpOnly cookie (preferred — immune to XSS)
 *   2. Authorization: Bearer header (for API clients)
 *
 * Session fixation is prevented by regenerating token after login.
 * Token expiry is enforced by jwt.verify().
 */
const authMiddleware = (req, res, next) => {
    try {
        let token = null;

        // 1. Try HttpOnly cookie first (most secure)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // 2. Fall back to Bearer header (API clients / Postman)
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const decoded = jwt.verify(token, env.JWT_SECRET, {
            algorithms: ["HS256"],
            issuer: "online-store",
            audience: "online-store-client",
        });

        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
        }
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

module.exports = authMiddleware;
