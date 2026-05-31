/**
 * AES Encryption Utility
 * Used to encrypt sensitive data stored in the database (e.g. phone numbers, addresses).
 * Passwords are hashed with bcrypt — never encrypt passwords, always hash them.
 */
const CryptoJS = require("crypto-js");
const env = require("../config/env");

const SECRET = env.AES_SECRET_KEY;

/**
 * Encrypt a plaintext string with AES-256.
 * @param {string} plaintext
 * @returns {string} ciphertext (base64)
 */
const encrypt = (plaintext) => {
    if (!plaintext) return plaintext;
    const ciphertext = CryptoJS.AES.encrypt(String(plaintext), SECRET).toString();
    return ciphertext;
};

/**
 * Decrypt an AES-encrypted ciphertext string.
 * @param {string} ciphertext
 * @returns {string} plaintext
 */
const decrypt = (ciphertext) => {
    if (!ciphertext) return ciphertext;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        return null; // Return null if decryption fails
    }
};

module.exports = { encrypt, decrypt };
