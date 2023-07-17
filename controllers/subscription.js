const Subscription = require("../models/Subscription");
const BusinessAccount = require("../models/BusinessAccount");
const { ObjectId } = require("mongodb");
const moment = require("moment");
const { stripeTestSecretKey } = require("../config/appConfig");
const stripe = require("stripe")(stripeTestSecretKey);
const {
  createStripeProduct,
  createStripeProductPrice,
  deleteStripeProduct,
} = require("../services/stripe");

const createSubscription = async (req, res) => {
  try {
    console.log("inside");
    if (req.role === "ADMINISTRATOR") {
      const {
        name,
        price,
        priceGroup,
        bags,
        description,
        duration,
        nestedAcc,
        discount,
        minimumOrder,
        minimumOrderDiscount,
        status,
      } = req.body;

      let subscription = new Subscription({
        name,
        price,
        priceGroup,
        bags,
        description,
        duration,
        nestedAcc,
        discount,
        minimumOrder,
        minimumOrderDiscount,
        status,
      });
      let stripeProduct = await createStripeProduct(name);
      let stripeProductPrice = await createStripeProductPrice(
        price,
        duration,
        stripeProduct.id
      );
      if (stripeProduct && stripeProductPrice) {
        subscription.stripeProductId = stripeProduct.id;
        subscription.stripeProductPriceId = stripeProductPrice.id;
        let result = await subscription.save();
        if (!result) {
          res.status(400).send("Something went wrong");
        }
        res.status(200).send(result);
      } else {
        res.status(400).send("Something went wrong");
      }
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

const subscriptiondetail = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      let subscriptionDetails = await Subscription.find({ _id: req.params.id });
      if (subscriptionDetails && subscriptionDetails.length > 0) {
        res.status(200).send(subscriptionDetails[0]);
      } else {
        res.status(400).send("No subscription found");
      }
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

const getAllSubscription = async (req, res) => {
  try {
    let subscription;
    if (req.role === "ADMINISTRATOR") {
      if (req.query.status != undefined && req.query.name != undefined) {
        subscription = await Subscription.find({
          $and: [{ name: req.query.name }, { status: req.query.status }],
        });
      } else if (req.query.status != undefined) {
        subscription = await Subscription.find({ status: req.query.status });
      } else if (req.query.name != undefined) {
        subscription = await Subscription.find({ name: req.query.name });
      } else {
        subscription = await Subscription.find();
      }
      if (subscription) {
        return res.status(200).send(subscription);
      } else {
        return res.status(200).send({ error: "subscription not found" });
      }
    }
    if (req.role === "CONSUMER") {
      subscription = await Subscription.find();
      if (subscription && subscription.length > 0) {
        return res.status(200).send(subscription);
      } else {
        return res.status(200).send({ error: "subscription not found" });
      }
    }
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
};

const editSubscription = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const {
        name,
        price,
        priceGroup,
        description,
        duration,
        nestedAcc,
        discount,
        minimumOrder,
        minimumOrderDiscount,
        status,
        bags,
      } = req.body;
      let subscription_data = await Subscription.find({ _id: req.params.id });
      if (subscription_data && subscription_data.length > 0) {
        let subscriptionDetails = subscription_data[0];

        subscriptionDetails.name = name ? name : subscriptionDetails.name;

        if (price != undefined && price == 0) {
          subscriptionDetails.price = price;
        } else if (price != undefined && price != 0) {
          subscriptionDetails.price = price;
        } else {
          subscriptionDetails.price = subscriptionDetails.price;
        }

        if (priceGroup != undefined && priceGroup == "") {
          subscriptionDetails.priceGroup = priceGroup;
        } else if (priceGroup != undefined && priceGroup != "") {
          subscriptionDetails.priceGroup = priceGroup;
        } else {
          subscriptionDetails.priceGroup = subscriptionDetails.priceGroup;
        }

        if (bags != undefined && bags == 0) {
          subscriptionDetails.bags = bags;
        } else if (bags != undefined && bags != 0) {
          subscriptionDetails.bags = bags;
        } else {
          subscriptionDetails.bags = subscriptionDetails.bags;
        }

        if (description != undefined && description == "") {
          subscriptionDetails.description = description;
        } else if (description != undefined && description != "") {
          subscriptionDetails.description = description;
        } else {
          subscriptionDetails.description = subscriptionDetails.description;
        }

        if (duration != undefined && duration == "") {
          subscriptionDetails.duration = duration;
        } else if (duration != undefined && duration != "") {
          subscriptionDetails.duration = duration;
        } else {
          subscriptionDetails.duration = subscriptionDetails.duration;
        }

        //if nestedAcc is 0
        if (nestedAcc != undefined && nestedAcc == 0) {
          subscriptionDetails.nestedAcc = nestedAcc;
        } else if (nestedAcc != undefined && nestedAcc != 0) {
          subscriptionDetails.nestedAcc = nestedAcc;
        } else {
          subscriptionDetails.nestedAcc = subscriptionDetails.nestedAcc;
        }

        //if discount is 0
        if (discount != undefined && discount == 0) {
          subscriptionDetails.discount = discount;
        } else if (discount != undefined && discount != 0) {
          subscriptionDetails.discount = discount;
        } else {
          subscriptionDetails.discount = subscriptionDetails.discount;
        }

        //if minimum order is 0
        if (minimumOrder != undefined && minimumOrder == 0) {
          subscriptionDetails.minimumOrder = minimumOrder;
        } else if (minimumOrder != undefined && minimumOrder != 0) {
          subscriptionDetails.minimumOrder = minimumOrder;
        } else {
          subscriptionDetails.minimumOrder = subscriptionDetails.minimumOrder;
        }
        //if minimumOrderDiscount is 0
        if (minimumOrderDiscount != undefined && minimumOrderDiscount == 0) {
          subscriptionDetails.minimumOrderDiscount = minimumOrderDiscount;
        } else if (
          minimumOrderDiscount != undefined &&
          minimumOrderDiscount != 0
        ) {
          subscriptionDetails.minimumOrderDiscount = minimumOrderDiscount;
        } else {
          subscriptionDetails.minimumOrderDiscount =
            subscriptionDetails.minimumOrderDiscount;
        }

        subscriptionDetails.status = status
          ? status
          : subscriptionDetails.status;
        let updated = await subscriptionDetails.save();
        res.status(200).send(updated);
      } else {
        res.status(400).send("No subscription found");
      }
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const subsId = req.params.id;
      let subscriptionDetails = await Subscription.find({ _id: subsId });
      let stripProductId = subscriptionDetails.stripeProductId;
      if (subscriptionDetails && subscriptionDetails.length > 0) {
        const deletedSubs = await Subscription.deleteOne({ _id: subsId });
        let deleteStripePro = await deleteStripeProduct(stripProductId);
        if (deletedSubs && deleteStripePro) {
          res.status(200).send("Subscription deleted successfully");
        }
      } else {
        res.status(400).send({ error: "No subscription found" });
      }
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};

const buySubscription = async (req, res) => {
  try {
    const {
      subsriptionId,
      subscription_name,
      buisness_owner_id,
      subscription_plan_type,
    } = req.body;
    let subscriptionDetails = await Subscription.findById(subsriptionId);
    subscriptionDetails.price = subscriptionDetails.price
      ? subscriptionDetails.price
      : 0;
    req.body.subscription_price = subscriptionDetails.price;
    const subscription_price = req.body.subscription_price;
    let buisnessAccountDetail = await BusinessAccount.find({
      userId: buisness_owner_id,
    });
    if (buisnessAccountDetail.length > 0) {
      let saved = await BusinessAccount.updateOne(
        { _id: buisnessAccountDetail[0]._id },
        {
          $set: {
            subsriptionId: subsriptionId,
            subscription_price: subscription_price,
            subscription_name: subscription_name,
            subscription_plan_type: subscription_plan_type,
            subscribedAt: moment().format("YYYY-MM-DD"),
            subscription_expire_at: "2023-04-13",
          },
        }
      );
      if (saved) {
        res.status(200).send({ data: "Subscription buy successfully" });
      } else {
        res.status(400).send("Something went wrong");
      }
    } else {
      res
        .status(200)
        .send({ data: "Only buisness account owner can buy a subscription" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

module.exports = {
  createSubscription,
  getAllSubscription,
  editSubscription,
  deleteSubscription,
  buySubscription,
  subscriptiondetail,
};
