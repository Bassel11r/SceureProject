const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter — applies to all routes.
 * Prevents abuse and DoS attacks.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 200,                   // max 200 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
});

/**
 * Strict limiter for authentication endpoints.
 * Defends against brute-force credential stuffing.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,                    // max 10 login/register attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many auth attempts. Please try again in 15 minutes." },
    skipSuccessfulRequests: true, // Don't count successful logins against the limit
});

module.exports = { globalLimiter, authLimiter };
