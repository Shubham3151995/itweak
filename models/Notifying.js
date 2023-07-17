const mongoose = require("mongoose");

const notifyingSchema = new mongoose.Schema(
  {
    notification_name: {
      type: String,
      required: false,
    },
    send: {
      type: Boolean,
      required: false,
    },
    reciever_type: {
      type: String,
      enum: ["ADMINISTRATOR", "CONSUMER", "LAUNDRY_HERO"],
      required: false,
    },
    notification_type: {
      type: String,
      enum: ["SMS", "EMAIL", "PUSH"],
      required: false,
    },
    options: [
      {
        name: {
          type: String,
          required: false,
        },
        value: {
          type: Boolean,
          required: false,
        },
      },
    ],
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Notifying", notifyingSchema);
