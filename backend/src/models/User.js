const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name must not exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v) => validator.isEmail(v),
                message: "Invalid email address",
            },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            // Password is bcrypt-hashed; minimum raw length enforced in controller
        },
        role: {
            type: String,
            enum: {
                values: ["user", "admin"],
                message: "Role must be user or admin",
            },
            default: "user",
        },
        // AES-encrypted sensitive field (example: phone)
        phone: {
            type: String,
            default: null,
        },
        // Track failed login attempts to detect brute-force
        loginAttempts: {
            type: Number,
            default: 0,
            select: false,
        },
        lockUntil: {
            type: Date,
            default: null,
            select: false,
        },
    },
    { timestamps: true }
);

// Never return password or security fields in API responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.loginAttempts;
    delete obj.lockUntil;
    return obj;
};

// Virtual: is account currently locked?
userSchema.virtual("isLocked").get(function () {
    return this.lockUntil && this.lockUntil > Date.now();
});

module.exports = mongoose.model("User", userSchema);
