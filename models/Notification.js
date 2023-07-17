const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    msg: {
      title: {
        type: String,
        required: true,
      },
      body: {
        type: String,
        required: true,
      },
    },
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
