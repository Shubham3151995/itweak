const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    page: {
      pageName: {
        type: String,
        required: false,
      },
      screenNumber: {
        type: String,
        required: false,
      },
      picture: {
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
      content: {
        title: {
          type: String,
          required: false,
        },
        text: {
          type: String,
          required: false,
        },
      },
    },
    slider: [
      {
        title: {
          type: String,
        },
        status: {
          type: String,
          enum: ["PUBLISHED", "ARCHIVED", "DRAFT"],
          required: false,
        },
        linkType: {
          type: String,
          enum: ["IN-APP", "URL"],
          required: false,
        },
        target: {
          type: String,
          required: false,
        },
        picture: {
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
      },
    ],
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: true,
  }
);

module.exports = mongoose.model("Content", contentSchema);

// {"title": "Promo Code",
// "status": "PUBLISHED",
// "linkType": "IN-APP",
// "target": "HP-009-Hero Profiles"}
