const cors = require("cors");
const env = require("../config/env");

const allowedOrigins = [env.CLIENT_URL];

/**
 * CORS configuration — only allows the known frontend origin.
 * credentials: true allows cookies/sessions to be sent cross-origin.
 */
module.exports = cors({
    origin: function (origin, callback) {
        // Allow server-to-server (no origin header) only in development
        if (!origin && env.NODE_ENV !== "production") {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS policy"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: [],
    maxAge: 600, // Cache preflight response for 10 minutes
});
