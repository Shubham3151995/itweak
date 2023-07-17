const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating objectSchema

const subscription = new Schema({
  name: {
    type: String,
    required: true,
    // enum: ["Bronze", "Silver", "Gold", "Enterprise", "Non-Profit"],
    // default: "Bronze",
  },
  // productId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "product",
  //   required: false,
  // },
  price: {
    type: Number,
  },
  priceGroup: {
    type: Object,
  },
  bags: {
    type: Number,
  },
  description: {
    type: String,
    min: 5,
    max: 500,
  },
  duration: {
    type: String,
    enum: ["month", "year"],
    default: "month",
  },
  nestedAcc: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  minimumOrder: {
    type: Number,
  },
  minimumOrderDiscount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Draft", "Archived"],
    default: "Active",
  },
  subscribedAt: {
    type: String,
    default: new Date(),
  },
  subscription_expire_at: {
    type: String,
    default: new Date(),
  },
  stripeProductId: {
    type: String,
  },
  stripeProductPriceId: {
    type: String,
  },
  createdAt: {
    type: String,
    default: new Date(),
  },
  updatedAt: {
    type: String,
    default: new Date(),
  },
});

const Subscription = mongoose.model("Subscription", subscription);
module.exports = Subscription;
