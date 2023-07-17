const Order = require("../models/Orders");
const Rating = require("../models/Ratings");

const getOrdersData = async (id, role, owner = 0) => {
  let orderHistory;
  if (role === "LAUNDRY_HERO") {
    orderHistory = await Order.find({
      $and: [
        { hero: id },
        { status: { $ne: "WAITING_FOR_HERO" } },
        { status: { $ne: "PAYMENT_PENDING" } },
      ],
    })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "customer",
          select: "firstName lastName _id email status profilePicture",
        },
        {
          path: "hero",
          select: "firstName lastName _id email status profilePicture",
        },
      ]);
  }
  if (role === "CONSUMER") {
    if (owner) {
      console.log("inside owner");
      orderHistory = await Order.find({ customer: id, businessOwner: owner })
        .sort({ createdAt: -1 })
        .populate([
          {
            path: "customer",
            select: "firstName lastName _id email status profilePicture",
          },
          {
            path: "hero",
            select: "firstName lastName _id email status profilePicture",
          },
        ]);
    } else {
      orderHistory = await Order.find({ customer: id })
        .sort({ createdAt: -1 })
        .populate([
          {
            path: "customer",
            select: "firstName lastName _id email status profilePicture",
          },
          {
            path: "hero",
            select: "firstName lastName _id email status profilePicture",
          },
        ]);
    }
  }
  for (let order of orderHistory) {
    let rating = await Rating.findOne({ orderId: order._id, ratedBy: id });
    if (rating) {
      order.AvgRating = rating.AvgRating;
    }
  }
  return orderHistory;
};

module.exports = getOrdersData;
