const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            maxlength: [200, "Name must not exceed 200 characters"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, "Description must not exceed 2000 characters"],
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
