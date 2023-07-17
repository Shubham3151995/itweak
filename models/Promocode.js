const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating objectSchema

const promoCode = new Schema({
  promoCode: {
    type: String,
    min: 5,
    max: 15,
    trim: true,
    required: true,
    unique: true,
  },
  // productId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "product",
  //   required: false,
  // },
  discount: {
    type: String,
  },
  discountStatus: {
    type: String,
    required: true,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
  },
  type: {
    type: String,
    required: true,
    enum: ["percentage", "flat"],
    default: "percentage",
  },
  promoType: {
    type: String,
    required: false,
    enum: ["one order only", "Two order"],
    default: "one order only",
  },
  timeUsed: {
    type: Number,
    required: true,
    default: 0,
  },
  limits: {
    type: String,
    required: false,
    // enum: ["max uses", "one time", "two time", "three time"],
    // default: "max uses",
  },
  createdAt: {
    type: String,
    default: new Date(),
  },
  validForUsers:{
    type: Array,
  },
  updatedAt: {
    type: String,
    default: new Date(),
  },
  perCustomerLimit:{
    type: Boolean,
    default: false

  },
  purchaseLimit:{
    type: Boolean,
    default: false

  },
  expirationTime: {
    type: String,
    required: false,
  },
  expirationDate:{
    type: String
 },
  expiration: {
    type: Boolean,
    required: false,
  },
  showBanner: {
    type: Boolean,
    required: false,
  },
});

const CouponCodeDiscount = mongoose.model("Promocode", promoCode);
module.exports = CouponCodeDiscount;
