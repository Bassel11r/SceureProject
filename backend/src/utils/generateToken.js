const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Generate a signed JWT for a user.
 * Only embed non-sensitive, immutable claims: id and role.
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        env.JWT_SECRET,
        {
            expiresIn: "2h",        // Short-lived access token
            algorithm: "HS256",
            issuer: "online-store",
            audience: "online-store-client",
        }
    );
};

module.exports = generateToken;
