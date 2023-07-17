const mongoose = require("mongoose");

const territorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: Array,
      required: true,
    },
    heroResponse: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DRAFT", "ARCHIVED"],
      default: "ACTIVE",
      required: false,
    },
    modifier: {
      modifytype: {
        type: String,
        required: false,
        enum: ["ADD", "REDUCE", "NONE"],
      },
      price: {
        type: Number,
        required: false,
      },
      status: {
        type: String,
        enum: ["ACTIVE", "DISABLED"],
        default: "ACTIVE",
        required: false,
      },
    },
    priceGroup: {
      name: {
        type: String,
        min: 5,
        max: 15,
        required: true,
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
    },
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Territory", territorySchema);
