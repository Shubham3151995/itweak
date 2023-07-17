const { truncate } = require("fs");
const mongoose = require("mongoose");

const paymentSchme = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      immutable: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "DECLINED", "REFUND", "PROCESSED"],
      default: "PROCESSED",
      required: true,
    },
    processor: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    taxes: {
      type: Number,
      required: true,
      default: 0,
    },
    bags: {
      number: {
        type: Number,
        required: true,
      },
      charge: {
        type: Number,
        required: false,
      },
    },
    promoCodeDiscount: {
      type: Number,
      required: true,
      default: 0,
    },
    plateformFee: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    tip: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      name: {
        type: String,
        required: false,
      },
      phone: {
        type: Number,
        required: false,
      },
      payment_method: {
        type: String,
        required: false,
      },
      cardNumber: {
        type: String,
        required: true,
      },
      expiry: {
        type: String,
        required: true,
      },
      methodId: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
        required: true,
      },
      defaultCard: {
        type: Boolean,
      },
    },
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Payments", paymentSchme);
