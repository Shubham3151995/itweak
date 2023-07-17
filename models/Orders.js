const mongoose = require("mongoose");
// const m2s = require('mongoose-to-swagger');

const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "PAYMENT_PENDING",
        "RECEIVED",
        "ACCEPTED",
        "DECLINE",
        "OUT_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "COLLECTED",
        "COMPLETED",
        "DELIVERED",
        "CANCELLED",
        "WAITING_FOR_HERO",
        "OK_TO_PAY",
      ],
      default: "PAYMENT_PENDING",
      required: false,
    },
    orderCreatedBy: {
      type: String,
      enum: ["Self", "Account_Manager"],
      default: "Self",
    },
    orderDate: {
      type: Date,
      required: true,
      immutable: true,
    },
    orderDeliveryDate: {
      type: Date,
      required: true,
    },
    orderDeliveredDate: {
      type: Date,
      required: false,
    },
    acceptedDate: {
      type: Date,
      required: false,
    },
    pickupPictureDate: {
      type: Date,
      required: false,
    },
    orderCollectedDate: {
      type: Date,
      required: false,
    },
    pickoffDate: {
      type: Date,
      required: false,
    },
    dropoffDate: {
      type: Date,
      required: false,
    },
    readyToDelivryDate: {
      type: Date,
      required: false,
    },
    dropOffPictureDate: {
      type: Date,
      required: false,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    customerName: {
      type: String,
      required: false,
    },
    AvgRating: {
      type: String,
      required: false,
    },
    hero: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    businessOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bussinesses",
      required: false,
    },
    odrResToHeros: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    territory: {
      type: String,
      required: false,
    },
    transactionDetails: {
      transactionId: {
        type: String,
        required: false,
      },
      paymentGateway: {
        type: String,
        required: false,
      },
      transactionAmount: {
        type: Number,
        required: false,
      },
      paymentStatus: {
        type: String,
        required: false,
      },
    },
    bags: {
      number: {
        type: Number,
        required: true,
      },
      charge: {
        type: Number,
        required: false,
      },
    },
    pickupTimeSlot: {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
    deliveryTimeSlot: {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
    pickupPicture: {
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
    dropOffPicture: {
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
    preferences: {
      type: Array,
      required: false,
    },
    repeat: {
      type: String,
      enum: ["WEEKLY", "MONTHLY", "DAILY", "DO_NOT_REPEAT"],
      default: "WEEKLY",
      required: false,
    },
    address: {
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
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    expectedDelivery: {
      type: Date,
      required: false,
    },
    actualDelivery: {
      //ref: hero,
      type: Date,
      required: false,
    },
    // preferences: {
    //   // ref: Preferences,
    // },
    anySpecialInstructions: {
      type: String,
      required: false,
    },
    promoCode: {
      type: String,
      required: false,
    },

    tip: {
      type: String,
      required: false,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    promoCodeDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    heroFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxes: [
      {
        taxName: {
          type: String,
          requred: true,
          default: 0,
          min: 0,
        },
        amount: {
          type: Number,
          requred: true,
          default: 0,
          min: 0,
        },
      },
    ],
    declineByHeros: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        declineMsg: {
          type: String,
        },
        decliendDate: {
          type: Date,
          default: new Date(),
        },
        status: {
          type: String,
        },
        name: {
          type: String,
        },
      },
    ],
    payoutStatus: {
      type: String,
      enum: ["PAYOUT_PENDING", "DONE"],
      default: "PAYOUT_PENDING",
      required: true,
    },
    subTotal: {
      type: Number,
      required: false,
    },
    chatUpdatedAt: {
      type: Date,
      default: new Date(),
    },
    acceptanceContr: {
      type: String,
    },
    outForPickUpDate: {
      type: Date,
      required: false,
    },
    paymentMethod: {
      cardNumer: String,
      expiry: String,
      methodId: String,
      brand: String,
    },
    productId: {
      type: String,
    },
    assignedByAdmin: {
      type: Boolean,
    },
    unassignByAdmin: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        name: {
          type: String,
        },
        unassignDate: {
          type: Date,
          default: new Date(),
        },
        email: {
          type: String,
        },
        name: {
          type: String,
        },
        phone: {
          type: String,
        },
      },
    ],
  },

  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
// console.log(JSON.stringify(m2s(mongoose.model("Order", orderSchema))));
