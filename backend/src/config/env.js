require("dotenv").config();

const required = ["MONGO_URI", "JWT_SECRET", "SESSION_SECRET", "AES_SECRET_KEY"];
for (const key of required) {
    if (!process.env[key]) {
        console.error(`FATAL: Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

module.exports = {
    PORT: parseInt(process.env.PORT) || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    AES_SECRET_KEY: process.env.AES_SECRET_KEY,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:8080",
    NODE_ENV: process.env.NODE_ENV || "development",
};
