// Load and validate environment variables first
require("./config/env");

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const env = require("./config/env");

// Graceful shutdown handler
const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Unhandled rejection / exception safety nets
process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection: " + reason);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception: " + err.message);
    process.exit(1);
});

// Start server after DB is connected
connectDB().then(() => {
    app.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
});
