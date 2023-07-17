const Promocode = require("../models/Promocode");
const User = require("../models/Users");
const Order = require("../models/Orders");
const mongoose = require("mongoose");
const { Code } = require("bson");
const ObjectID = mongoose.Types.ObjectId;

const createPromoCode = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      let {
        promoCode,
        //  productId,
        discount,
        discountStatus,
        type,
        expiration,
        expirationDate,
        expirationTime,
        purchaseLimit,
        perCustomerLimit,
        validForUsers,
      } = req.body;
      let unixTimeForExpire = new Date(
        `${expirationDate}T${expirationTime}Z`
      ).valueOf();
      if (!expirationDate) {
        expiration = false;
      }
      if (req.body.limits == 0) {
        limits = "unlimited";
      } else {
        limits = req.body.limits;
      }
      const promoCodeToSave = new Promocode({
        promoCode,
        // productId,
        discount,
        discountStatus,
        type,
        timeUsed: 0,
        limits,
        expirationTime: unixTimeForExpire,
        expiration,
        purchaseLimit,
        perCustomerLimit,
        validForUsers,
        expirationDate,
      });
      let saved = await promoCodeToSave.save();
      if (saved) {
        res.status(200).send(saved);
      } else {
        res.status(400).send("Something went wrong");
      }
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

const getAllPromoCode = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const promoCode = await Promocode.find();
      if (promoCode) {
        res.status(200).send(promoCode);
      } else {
        res.status(200).send({ error: "promo codes not found" });
      }
    } else {
      res.status(404).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

const editPromoCode = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      let {
        promoCode,
        discount,
        discountStatus,
        type,
        maxUsed,
        expirationDate,
        expirationTime,
        expiration,
        showBanner,
        limits,
        purchaseLimit,
        perCustomerLimit,
        validForUsers,
      } = req.body;

      let unixTimeForExpire = new Date(
        `${expirationDate}T${expirationTime}Z`
      ).valueOf();
      let promocodeDetails = await Promocode.findById(req.params.id);

      promocodeDetails.promoCode = promoCode
        ? promoCode
        : promocodeDetails.promoCode;

      if (purchaseLimit != undefined && purchaseLimit == 0) {
        promocodeDetails.purchaseLimit = purchaseLimit;
      } else if (purchaseLimit != undefined && purchaseLimit != 0) {
        promocodeDetails.purchaseLimit = purchaseLimit;
      } else {
        promocodeDetails.purchaseLimit = promocodeDetails.purchaseLimit;
      }

      if (perCustomerLimit != undefined && perCustomerLimit == 0) {
        promocodeDetails.perCustomerLimit = perCustomerLimit;
      } else if (perCustomerLimit != undefined && perCustomerLimit != 0) {
        promocodeDetails.perCustomerLimit = perCustomerLimit;
      } else {
        promocodeDetails.perCustomerLimit = promocodeDetails.perCustomerLimit;
      }
      promocodeDetails.limits = limits ? limits : promocodeDetails.limits;

      promocodeDetails.validForUsers = validForUsers
        ? validForUsers
        : promocodeDetails.validForUsers;
      promocodeDetails.discount = discount
        ? discount
        : promocodeDetails.discount;
      promocodeDetails.discountStatus = discountStatus
        ? discountStatus
        : promocodeDetails.discountStatus;
      promocodeDetails.type = type ? type : promocodeDetails.type;
      promocodeDetails.expirationDate = expirationDate
        ? expirationDate
        : promocodeDetails.expirationDate;

      promocodeDetails.maxUsed = maxUsed ? maxUsed : promocodeDetails.maxUsed;
      promocodeDetails.expirationTime = unixTimeForExpire
        ? unixTimeForExpire
        : promocodeDetails.expirationTime;
      if (expirationDate) {
        expiration = true;
      }
      promocodeDetails.expiration = expiration
        ? expiration
        : promocodeDetails.expiration;
      promocodeDetails.showBanner = showBanner;

      let updated = await promocodeDetails.save();
      res.status(200).send(updated);
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};

const deletePromoCode = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const promoId = req.params.id;
      const deletedPromo = await Promocode.findOneAndDelete({ _id: promoId });
      res.send({ deleted: true, deletedPromo });
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};
const getNewUserPromoCode = async (req, res) => {
  try {
    if (req.role === "CONSUMER") {
      const promoCode = await Promocode.findOne({
        promoCode: "NEWUSER",
      });

      res.send({ code: promoCode.promoCode });
    } else {
      res.status(400).send({ error: "Consumer  Permission required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};
const promocodedisscount = async (req, res) => {
  try {
    let code = req.params.code;
    let userId = req.id.toHexString();
    let promoCode = await Promocode.findOne({
      promoCode: { $regex: code, $options: "i" },
      discountStatus: "ACTIVE",
    });
    if (!promoCode) {
      return res.status(200).send({ message: "Promocode is invalid" });
    }
    let date = new Date();
    if (promoCode && promoCode.expiration && promoCode.expiration == true) {
      if (promoCode.expirationTime <= date.valueOf()) {
        return res
          .status(200)
          .send({ status: false, message: "Promocode is invalid" });
      }
    }

    if (
      promoCode &&
      promoCode.validForUsers &&
      promoCode.validForUsers.length
    ) {
      let validUser = promoCode.validForUsers.find((x) => x._id == userId);
      if (!validUser) {
        return res.status(200).send({
          status: false,
          message: "Promocode is invalid",
        });
      }
    }
    if (promoCode && promoCode.limits !== 0) {
      if (promoCode && promoCode.timeUsed >= promoCode.limits) {
        return res
          .status(200)
          .send({ status: false, message: "Promocode is invalid" });
      }
    }
    let user;
    if (
      (promoCode && promoCode.perCustomerLimit == true) ||
      promoCode.purchaseLimit == "true"
    ) {
      user = await User.findOne({ _id: ObjectID(req.id) });
      console.log(
        user.promoCode.find((code) => code.name == promoCode.promoCode)
      );
      if (
        user &&
        user.promoCode &&
        user.promoCode.length &&
        user.promoCode.find((code) => code.name == promoCode.promoCode)
      ) {
        return res
          .status(200)
          .send({ status: false, message: "Promocode is invalid" });
      }
    }
    if (
      (promoCode && promoCode.purchaseLimit == true) ||
      promoCode.purchaseLimit == "true"
    ) {
      let order = await Order.findOne({ customer: ObjectID(req.id) });
      if (order)
        return res.status(200).send({
          status: false,
          message: "Promocode is invalid",
        });
    }
    res.status(200).send({
      status: true,
      discountType: promoCode.type,
      discountValue: promoCode.discount,
      limit: promoCode.limits,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ status: false, error: err.message });
  }
};
const promoUsedCountUpdate = async (req, res) => {
  try {
    let code = req.params.name;
    console.log("inside");
    let promoCode = await Promocode.findOne({
      promoCode: { $regex: `^${code}$` },
      discountStatus: "ACTIVE",
    });
    if (!promoCode) {
      return res.status(200).send({ message: "Promocode is invalid" });
    }
    promoCode.timeUsed = promoCode.timeUsed + 1;

    let result = await promoCode.save();
    if (result) {
      return res
        .status(200)
        .send({ message: "promo code used count updated successfully" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};
module.exports = {
  createPromoCode,
  getAllPromoCode,
  editPromoCode,
  deletePromoCode,
  getNewUserPromoCode,
  promocodedisscount,
  promoUsedCountUpdate,
};
