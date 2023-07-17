const Order = require("../models/Orders");
const HeroSchema = require("../models/Heros");
const { savePayout } = require("./savePayout");
const { payoutFunc } = require("./stripe");
const moment = require("moment");
let cronJobFunc = async () => {
  let startDate = moment(new Date()).format("YYYY-MM-DD");
  let endDate = moment(startDate).subtract(7, "days").format("YYYY-MM-DD");
  console.log(startDate, endDate);
  let ordersData = await Order.find({
    payoutStatus: "PAYOUT_PENDING",
    status: "DELIVERED",
    actualDelivery: {
      $lt: new Date(new Date(endDate).setHours(23, 59, 59)),
    },
  }).populate([
    {
      path: "hero",
      select: "_id heroAccountId",
    },
  ]);

  if (ordersData.length) {
    console.log(ordersData.length);
    Promise.all(
      ordersData.map(async (ord, index) => {
        let hero = await HeroSchema.findOne({ userId: ord?.hero?._id });

        let data = await payoutFunc(
          Number(ord.subTotal) - Number(ord.plateformFee || 0),
          hero?.stripeAccountId
        );

        if (data) {
          await savePayout(
            ord._id,
            ord.hero,
            "PROCESSED",
            data.amount,
            ord.plateformFee
          );
          await Order.findOneAndUpdate(
            { _id: ord._id },
            { payoutStatus: "DONE" }
          );
        }
      })
    );
  }
};
module.exports = cronJobFunc;
