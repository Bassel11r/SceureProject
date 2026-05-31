const xss = require("xss");

/**
 * Input Sanitization Middleware
 *
 * - Strips XSS payloads from all string fields in req.body
 * - express-mongo-sanitize (applied in app.js) blocks NoSQL injection ($, .)
 * - validator.js is used in controllers for type/format validation
 */
const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === "string") {
            obj[key] = xss(obj[key].trim());
        } else if (typeof obj[key] === "object") {
            sanitize(obj[key]); // Recurse for nested objects
        }
    }
};

module.exports = (req, res, next) => {
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
};
