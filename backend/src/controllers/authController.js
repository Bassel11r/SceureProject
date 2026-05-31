const User = require("../models/User");
const bcrypt = require("bcrypt");
const validator = require("validator");
const generateToken = require("../utils/generateToken");
const { encrypt } = require("../utils/encryption");
const logger = require("../utils/logger");
const env = require("../config/env");

const BCRYPT_ROUNDS = 12;        // High work factor to slow brute-force
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

// ─── REGISTER ────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // ── Input Validation ──────────────────────────────────────────────
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        // Strong password policy
        if (
            !validator.isStrongPassword(password, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
            });
        }

        if (!validator.isLength(name, { min: 2, max: 100 })) {
            return res.status(400).json({ success: false, message: "Name must be between 2 and 100 characters" });
        }

        // ── Check duplicate ───────────────────────────────────────────────
        const existingUser = await User.findOne({ email: validator.normalizeEmail(email) });
        if (existingUser) {
            // Generic message — don't reveal whether email exists (user enumeration prevention)
            return res.status(409).json({ success: false, message: "Registration failed. Please try a different email." });
        }

        // ── Hash password with bcrypt (NEVER store plaintext) ────────────
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // ── Encrypt sensitive optional field with AES ────────────────────
        const encryptedPhone = phone ? encrypt(phone) : null;

        const user = await User.create({
            name: validator.escape(name),
            email: validator.normalizeEmail(email),
            password: hashedPassword,
            phone: encryptedPhone,
        });

        logger.info(`New user registered: ${user._id}`);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        logger.error("Register error: " + err.message);
        return res.status(500).json({ success: false, message: "Registration failed" });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ── Input Validation ──────────────────────────────────────────────
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        // ── Fetch user including security fields ──────────────────────────
        const user = await User.findOne({ email: validator.normalizeEmail(email) })
            .select("+password +loginAttempts +lockUntil");

        // ── Use constant-time check to prevent timing attacks ─────────────
        // Always run bcrypt.compare even if user not found (dummy hash)
        const DUMMY_HASH = "$2b$12$KIXtNbklAuSXNXmUJAVMjuXkHJF6sMmCiHqeaBW7bP3WrlfH26V52";
        const hashToCompare = user ? user.password : DUMMY_HASH;
        const isMatch = await bcrypt.compare(password, hashToCompare);

        if (!user || !isMatch) {
            // Increment failed attempts if user exists
            if (user) {
                user.loginAttempts = (user.loginAttempts || 0) + 1;
                if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                    user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
                    logger.warn(`Account locked due to failed attempts: ${user._id}`);
                }
                await user.save();
            }
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // ── Check account lock ────────────────────────────────────────────
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                message: `Account locked. Try again in ${minutesLeft} minute(s).`,
            });
        }

        // ── Reset failed attempts on successful login ─────────────────────
        if (user.loginAttempts > 0) {
            user.loginAttempts = 0;
            user.lockUntil = null;
            await user.save();
        }

        // ── Generate JWT ──────────────────────────────────────────────────
        const token = generateToken(user);

        // ── Set HttpOnly, Secure, SameSite cookie (prevents XSS theft) ───
        res.cookie("token", token, {
            httpOnly: true,                          // JS cannot read this cookie
            secure: env.NODE_ENV === "production",   // HTTPS only in production
            sameSite: "strict",                      // Prevents CSRF
            maxAge: 2 * 60 * 60 * 1000,             // 2 hours (matches JWT expiry)
        });

        logger.info(`User logged in: ${user._id}`);

        return res.json({
            success: true,
            message: "Login successful",
            data: {
                token, // Also return token for API clients (e.g. Postman)
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            },
        });
    } catch (err) {
        logger.error("Login error: " + err.message);
        return res.status(500).json({ success: false, message: "Login failed" });
    }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

exports.logout = (req, res) => {
    // Clear the HttpOnly cookie — prevents session hijacking after logout
    res.clearCookie("token", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.json({ success: true, message: "Logged out successfully" });
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
};
