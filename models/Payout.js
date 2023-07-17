const { truncate } = require("fs");
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      immutable: true,
    },
    heroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      immutable: true,
    },
    status: {
      type: String,
      enum: ["DECLINED", , "PROCESSED","OK_TO_PAY"],
      default: "OK_TO_PAY",
      required: true,
    },
   hero_data: {
      type: Object,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    plateformFee: {
      type: Number,
      required: true,
      default: 0,
    },
    payout_amount: {
      type: Number,
      required: true,
      default: 0,
    },
    order_amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Payout", paymentSchema);
