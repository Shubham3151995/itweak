const mongoose = require("mongoose");
const validatePhone = require("../utils/validatePhone");

const heroSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  address: [
    {
      addressName: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      zipCode: {
        type: Number,
        required: true,
      },
      streetAddress: {
        type: String,
        required: true,
      },
      apartmentNo: {
        type: Number,
        required: false,
      },
      specialNote: {
        type: String,
        required: false,
      },
      state: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        default: 0,
      },
      longitude: {
        type: Number,
        default: 0,
      },
    },
  ],
  stripeAccountId: {
    type: String,
    required: false,
  },
  stripe_Tokn_verify: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    validate: [validatePhone, "Invalid Phone"],
    required: false,
  },
  dl: {
    type: String,
    required: false,
  },
  dlImg: {
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
  ssn: {
    type: String,
    required: false,
  },
  itt: {
    type: String,
    required: false,
  },
  taxId: {
    type: String,
    required: false,
  },
  w9Form: {
    type: String,
    required: false,
  },
  cv: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  heroStatus: {
    type: String,
    enum: ["PENDING_VERIFICATION", "NONE", "VERIFIED"],
    default: "NONE",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "INACTIVE",
      "ACTIVE",
      "SUSPENDED",
      "ARCHIVED",
      "MARKED_FOR_DELETION",
      "SIGNED_UP",
    ],
    default: "ACTIVE",
    required: false,
  },
  availability: [
    {
      day: {
        type: String,
        required: false,
      },
      from: {
        type: String,
        required: false,
      },
      to: {
        type: String,
        required: false,
      },
      bags: {
        type: Number,
        required: false,
      },
      status: {
        type: String,
        enum: ["AVAILABLE", "NOT_AVAILABLE"],
        default: "AVAILABLE",
        required: false,
      },
    },
  ],
  availabilityStatus: {
    type: String,
    enum: ["AVAILABLE", "NOT_AVAILABLE"],
    default: "AVAILABLE",
    required: false,
  },
  territory: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Hero", heroSchema);
