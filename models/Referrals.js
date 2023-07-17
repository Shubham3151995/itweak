const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    RefralCode: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    useremail: {
      type: String,
      required: true,
    },
    Date: {
      type: Date,
      required: true,
    },
    Status: {
      type: String,
      enum: ["PENDING", "JOINED"],
      default: "PENDING",
      required: false,
    },
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Referral", referralSchema);
