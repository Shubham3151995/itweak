const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      immutable: true,
      unique: true,
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    niceSmell: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    folding: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    friendliness: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    remarks: {
      type: String,
      required: false,
    },
    ratedOn: {
      type: Date,
      required: true,
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    AvgRating: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: [
        "PAYMENT_PENDING",
        "RECEIVED",
        "OUT_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "COLLECTED",
        "COMPLETED",
        "CANCELLED",
        "DELIVERED",
      ],
      default: "COMPLETED",
      required: true,
    },
    remark: {
      type: String,
      required: false,
    },
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Rating", ratingSchema);
