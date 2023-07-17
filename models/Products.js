const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    amountOfBags: {
      type: Number,
      required: true,
    },
    heroFee: {
      type: Number,
      required: true,
    },
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
