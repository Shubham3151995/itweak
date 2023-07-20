const mongoose = require("mongoose");
const validator = require("validator");
const validatePhone = require("../utils/validatePhone");
const { boolean } = require("joi");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid e-mail"],
      required: false,
    },
    phone: {
      type: String,
      validate: [validatePhone, "Invalid Phone"],
      required: false,
    },
    password: {
      type: String,
      required: false,
      minLength: [8, "Password must be at least 8 characters"],
    },
    confirm_password: {
      type: String,
      required: false,
      minLength: [8, "Password must be at least 8 characters"],
    },
    dob: {
      type: Date,
      required: false,
    },
    about: {
      type: String,
      required: false,
    },
    address: {
      type: Object,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    stripeCustomerId: {
      type: String,
      required: false,
    },
    reset_password_otp: {
      type: Number,
      required: false,
    },
    profilePicture: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
      bucket: {
        type: String,
        required: false,
      },
    },
    paymentMethod: [
      {
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
        cardNumber: {
          type: String,
          required: true,
        },
        expiry: {
          type: String,
          required: true,
        },
        methodId: {
          type: String,
          required: true,
        },
        brand: {
          type: String,
          required: true,
        },
        defaultCard: {
          type: Boolean,
        },
      },
    ],
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
  },

  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
// address: [
//   {
//     addressName: {
//       type: String,
//       required: true,
//     },
//     city: {
//       type: String,
//       required: true,
//     },
//     zipCode: {
//       type: Number,
//       required: true,
//     },
//     streetAddress: {
//       type: String,
//       required: true,
//     },
//     apartmentNo: {
//       type: Number,
//       required: false,
//     },
//     specialNote: {
//       type: String,
//       required: false,
//     },
//     state: {
//       type: String,
//       required: true,
//     },
//     latitude: {
//       type: Number,
//       default: 0,
//     },
//     longitude: {
//       type: Number,
//       default: 0,
//     },
//   },
// ],
// role: {
//   type: String,
//   enum: ["ADMINISTRATOR", "CONSUMER", "LAUNDRY_HERO"],
//   required: false,
// },
// preferences: [
//   {
//     preferenceId: mongoose.Schema.Types.ObjectId,
//     name: { type: String, required: false },
//     option: { type: String, required: false },
//     specialInstruction: { type: String, required: false },
//   },
// ],
// address: [
//   {
//     addressName: {
//       type: String,
//       required: true,
//     },
//     city: {
//       type: String,
//       required: true,
//     },
//     zipCode: {
//       type: Number,
//       required: true,
//     },
//     streetAddress: {
//       type: String,
//       required: true,
//     },
//     apartmentNo: {
//       type: Number,
//       required: false,
//     },
//     specialNote: {
//       type: String,
//       required: false,
//     },
//     state: {
//       type: String,
//       required: true,
//     },
//     latitude: {
//       type: Number,
//       default: 0,
//     },
//     longitude: {
//       type: Number,
//       default: 0,
//     },
//   },
// ],

// notification: {
//   app: {
//     type: Boolean,
//     required: false,
//     default: true,
//   },
//   sms: {
//     type: Boolean,
//     required: false,
//     default: true,
//   },
//   email: {
//     type: Boolean,
//     required: false,
//     default: true,
//   },
// },

// is_welcome_email_sent: {
//   type: Boolean,
//   default:false
// },

// referralCode: {
//   type: String,
//   required: false,
// },
// favoriteHeros: {
//   type: [mongoose.Schema.Types.ObjectId],
//   ref: "User",
//   required: false,
// },
// additionalInstruction: {
//   type: [String],
//   required: false,
// },
// pronouns: {
//   type: String,
//   enum: ["HE", "SHE", "PREFER_NOT_TO_SAY"],
//   required: false,
// },

// resend_otp_count: {
//   type: Number,
//   default: 0,
// },
// status: {
//   type: String,
//   enum: [
//     "ACTIVE",
//     "SUSPENDED",
//     "ARCHIVED",
//     "MARKED_FOR_DELETION",
//     "SIGNED_UP",
//   ],
//   default: "ACTIVE",
//   required: false,
// },
// otp: {
//   emailOTP: {
//     type: Number,
//     required: false,
//     default: null,
//   },
//   phoneOTP: {
//     type: Number,
//     required: false,
//     default: null,
//   },
// },
// verification: {
//   type: {
//     emailVerified: {
//       type: Boolean,
//       default: false,
//       required: true,
//     },
//     phoneVerified: {
//       type: Boolean,
//       default: false,
//       required: true,
//     },
//   },
//   required: true,
// },
// totalOrders: {
//   type: Number,
//   required: false,
// },
// hero_avg_rating: {
//   type: Number,
// },

// stripe_Tokn_verify: {
//   type: String,
//   required: false,
//   default: false,
// },
// heroAccountId: {
//   type: String,
//   required: false,
// },
// laundryHeroStatus: {
//   type: String,
//   enum: ["PENDING", "VERIFIED"],
//   required: false,
// },
// referralCode: {
//   type: String,
//   required: false,
// },
// referredTo: [
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: false,
//     },
//     email: {
//       type: String,
//       required: false,
//     },
//     referralCode: {
//       type: String,
//       required: false,
//     },
//     referralDateAndTime: {
//       type: Date,
//       required: false,
//     },
//     status: {
//       type: String,
//       enum: ["PENDING", "JOINED"],
//       default: "PENDING",
//       required: false,
//     },
//     activationDateAndTime: {
//       type: Date,
//       required: false,
//     },
//   },
// ],

// tempInfo: {
//   email: {
//     type: String,
//     trim: true,
//     lowercase: true,
//     validate: [validator.isEmail, "Invalid e-mail"],
//     required: false,
//   },
//   phone: {
//     type: String,
//     validate: [validatePhone, "Invalid Phone"],
//     required: false,
//   },
// },
// businessAccountOwner: {
//   ownerBusinessId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Business",
//   },
// },
// businessAccount: {
//   bussinessId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Business",
//     required: false,
//   },
//   bussinessOwnerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: false,
//   },
//   manageOrder: {
//     type: Boolean,
//     default: false,
//     required: false,
//   },
//   managePayment: {
//     type: Boolean,
//     default: false,
//     required: false,
//   },
//   maxBags: {
//     type: String,
//     default: 0,
//     required: false,
//   },
//   bagCount: {
//     type: Number,
//     default: 0,
//     required: false,
//   },
//   maxBagDuration: {
//     type: String,
//     enum: ["week", "month", "year"],
//     default: "week",
//     required: false,
//   },
// },
// businessOwner: {
//   type: Boolean,
//   default: false,
// },
// isBusinessMember: {
//   type: Boolean,
//   default: false,
// },
// promoCode: [
//   {
//     name: {
//       type: String,
//     },
//   },
// ],
// socialMediaId: {
//   type: String,
//   required: false,
// },
// socialMediaType: {
//   type: String,
//   required: false,
// },
// isAddedByAdmin: {
//   type: Boolean,
//   required: false,
// },
// isFirstTime: {
//   type: Boolean,
//   required: false,
// },
// agora_uuid: {
//   type: String,
//   required: false,
// },
// agora_nickname: {
//   type: String,
//   required: false,
// },
// agora_username: {
//   type: String,
//   required: false,
// },
// agora_password: {
//   type: String,
//   required: false,
// },
