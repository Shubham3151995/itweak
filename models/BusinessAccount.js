const mongoose = require("mongoose");
const validator = require("validator");

const businessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  hero: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  bussinessName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["OWNER", "MEMBER"],
    default: "OWNER",
    required: false,
  },
  // subscription: {
  //   type: String,
  //   //  enum: ["BRONZE", "SILVER", "GOLD", "ENTERPRISE", "NON_PROFIT"],
  //   // default: "BRONZE",
  //   required: false,
  // },
  subscription_name: {
    type: String,
    required: false,
    // enum: ["Bronze", "Silver", "Gold", "Enterprise", "Non-Profit"],
    // default: "Bronze",
  },
  subsriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: false,
  },
  subscription_price: {
    type: Number,
  },
  subscribedAt: {
    type: String,
    default: new Date(),
  },
  subscription_expire_at: {
    type: String,
    default: null,
  },
  is_subscription_buy: {
    type: Boolean,
    default: false,
  },
  subscription_plan_type: {
    type: String,
  },
  stripSupcriptionId: {
    type: String,
  },
  subscriptionPlanStatus: {
    type: Boolean,
  },
  inviteId: {
    type: String,
    required: false,
  },
  Bags: {
    type: Number,
    required: false,
  },
  bagUsed: {
    type: Number,
    required: false,
    default: 0,
  },
  streetName: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  zipCode: {
    type: Number,
    required: false,
  },
  streetNumber: {
    type: Number,
    required: false,
  },
  floor: {
    type: Number,
    required: false,
  },
  apartment: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
    required: false,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid e-mail"],
    required: true,
  },
  stripeCustomerId: {
    type: String,
    required: false,
  },
  notification: {
    app: {
      type: Boolean,
      required: false,
      default: false,
    },
    sms: {
      type: Boolean,
      required: false,
      default: false,
    },
    email: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  paymentInfo: [
    {
      cardNumber: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      phone: {
        type: Number,
        required: false,
      },
      payment_method: {
        type: String,
        required: false,
      },
      expiry: {
        type: String,
        required: true,
      },
      methodId: {
        type: String,
        required: true,
        unique: true,
      },
      defaultCard: {
        type: Boolean,
        default: false,
      },
      brand: {
        type: String,
        required: true,
      },
    },
  ],
  members: [
    {
      Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: false,
      },
      manageOrder: {
        type: Boolean,
        default: false,
      },
      managePayment: {
        type: Boolean,
        default: false,
      },
      canShedule: {
        type: Boolean,
        default: false,
      },
      maxBags: {
        type: String,
        default: 0,
      },
      maxBagDuration: {
        type: String,
        enum: ["week", "month", "year"],
        required: false,
      },
      // repeating: {
      //   type: Boolean,
      //   default: true,
      // },
      repeat: {
        type: String,
        enum: ["day", "week", "month", "year"],
        default: "week",
        required: false,
      },
      payable: {
        type: String,
        enum: ["Representative", "Member"],
        default: "Representative",
        required: false,
      },
      orderCount: {
        type: Number,
        required: false,
      },
      bagCount: {
        type: Number,
        required: false,
      },
      createdAt: {
        type: String,
        default: new Date(),
      },
    },
  ],
  orders: {
    type: Array,
    default: [],
  },
  payments: {
    type: Array,
    default: [],
  },
  memberAllowed: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model("bussinesses", businessSchema);
