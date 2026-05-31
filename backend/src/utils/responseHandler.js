/**
 * Standardized API response helpers.
 * Prevents leaking stack traces or internal error details to clients.
 */

exports.success = (res, data = {}, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
};

exports.error = (res, message = "An error occurred", statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
};
