const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating objectSchema
const priceGroup = new Schema({
  name: {
    type: String,
    min: 5,
    max: 15,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Draft", "Archived"],
    default: "Draft",
  },
  type: {
    type: String,
    required: true,
    enum: ["percentage", "flat"],
    default: "percentage",
  },
  description: {
    type: String,
    min: 5,
    max: 500,
  },
  limits: {
    type: String,
    required: true,
    default: "Unlimited",
  },
  amountOfOrders: {
    type: Number,
  },
  base_price: {
    type: Boolean,
    default: false,
  },
  products: [
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
  ],
  createdAt: {
    type: String,
    default: new Date(),
  },
  updatedAt: {
    type: String,
    default: new Date(),
  },
});

const Pricegroup = mongoose.model("Pricegroup", priceGroup);
module.exports = Pricegroup;
