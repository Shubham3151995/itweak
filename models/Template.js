const mongoose = require("mongoose");
const validator = require("validator");

const templateSchema = new mongoose.Schema(
  {
    template_id: {
      type: String,
      required: true,
    },
    templateType: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["ADMINISTRATOR", "CONSUMER", "LAUNDRY_HERO"],
      required: false,
    },
    status:{
      type: Boolean,
      default:false
    }
    },

  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Template", templateSchema);
