const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI, {
            // Disable deprecated options; mongoose 7+ uses these defaults
            serverSelectionTimeoutMS: 5000,
        });
        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error("Database connection failed: " + error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
