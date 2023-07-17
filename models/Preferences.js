// const mongoose = require("mongoose");

// const preferencesSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//     },
//     orderType: {
//       type: String,
//       required: false,
//     },
//     shirt: {
//       type: String,
//       enum: ["HANGER", "FOLDED"],
//       required: false,
//     },
//     dryerSheet: {
//       type: Boolean,
//       required: false,
//     },
//     dryerSheetInstructions : {
//       type: String,
//       required: false,
//     },
//     detergentType: {
//       type: String,
//       enum: ["STANDARD", "SPECIAL"],
//       required: false,
//     },
//     pants: {
//       type: String,
//       enum: ["HANGER", "FOLDED"],
//       required:false
//     },
//     fabricSoftnerType: {
//       type: Boolean,
//       required: false,
//     },
//     whitesWashTemperature: {
//       type: String,
//       enum: ["COLD", "WARM", "HOT"],
//       required: false,
//     },
//     whitesDryerHeat: {
//       type: String,
//       enum: ["LOW", "MEDIUM", "HIGH"],
//       required: false,
//     },
//     colorsWashTemperature: {
//       type: String,
//       enum: ["COLD", "WARM", "HOT"],
//       required: false,
//     },
//     colorsDryerHeat: {
//       type: String,
//       enum: ["COLD", "WARM", "HOT"],
//       required: false,
//     },
//   },
//   {
//     // Make Mongoose use Unix time (seconds since Jan 1, 1970)
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Preferences", preferencesSchema);

const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: false,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  options: {
    type: [String],
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  specialInstruction: {
    type: Boolean,
    required: false,
  },
});

const Preference = mongoose.model("Preference", preferenceSchema);
module.exports = { Preference };
