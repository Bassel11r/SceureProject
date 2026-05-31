const express = require("express");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const helmetConfig = require("./security/helmetConfig");
const corsConfig = require("./security/corsConfig");
const sanitizer = require("./security/sanitizer");
const { globalLimiter } = require("./middlewares/rateLimitMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ── 1. Security headers (must be first) ──────────────────────────────────────
app.use(helmetConfig);

// ── 2. CORS ───────────────────────────────────────────────────────────────────
app.use(corsConfig);

// ── 3. Global rate limiter ────────────────────────────────────────────────────
app.use(globalLimiter);

// ── 4. Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));       // Prevent large payload DoS
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());

// ── 5. NoSQL injection prevention (strips $ and . from req.body/query/params) ─
app.use(mongoSanitize({ replaceWith: "_" }));

// ── 6. XSS sanitization ───────────────────────────────────────────────────────
app.use(sanitizer);

// ── 7. Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);

// ── 8. Health check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ success: true, message: "Secure Online Store API is running" });
});

// ── 9. 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ── 10. Global error handler (must be last) ───────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
