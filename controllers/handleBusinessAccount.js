const BusinessAccount = require("../models/BusinessAccount");
const User = require("../models/Users");
const subcription = require("../models/Subscription");
const { stripeTestSecretKey } = require("../config/appConfig");
const stripe = require("stripe")(stripeTestSecretKey);
const moment = require("moment");
const momentTimeZone = require("moment-timezone");
const Territory = require("../models/Territory");
const Uuid = require("uuid");
const {
  createCustomer,
  getCustomer,
  stripeSubcription,
} = require("../services/stripe");
const Order = require("../models/Orders");
const Payment = require("../models/Payment");
const { ObjectId } = require("mongodb");
const { object } = require("joi");
// const uuidV4 = Uuid.v4();

const createBusinessAccountOwner = async (req, res) => {
  try {
    const userId = req.id;
    const { token, details, subscriptionData } = req.body;
    subscrip = await subcription.findOne({ _id: subscriptionData._id });
    const emailExists = await BusinessAccount.findOne({ email: details.email });
    if (emailExists) {
      return res.status(409).json({ error: "Email already exists" });
    } else {
      const metadata = { _id: userId };
      const dataParam = new BusinessAccount({
        ...details,
        userId,
        inviteId: Uuid.v4(),
        members: [
          {
            Id: req.id,
          },
        ],
      });
      let newCutomer = await createCustomer({
        name: details.name,
        email: details.email,
        address: {
          city: details.city,
          line1: `Street Name - ${details.streetName}, Street No - ${details.streetNumber}`,
          country: "US",
          postal_code: details.zipCode,
        },
        metadata,
      });
      const { id } = newCutomer;
      dataParam.stripeCustomerId = id;
      // await user.save();
      // const customer = await getCustomer(user.stripeCustomerId);
      const card = await stripe.customers.createSource(id, {
        source: token.token.id,
      });
      let result, subscrip;
      if (card) {
        subscrip = await subcription.findOne({ _id: subscriptionData._id });
        let stripeDataDetail = await stripeSubcription(
          dataParam.stripeCustomerId,
          subscriptionData.stripeProductPriceId
        );
        if (stripeDataDetail && stripeDataDetail.id) {
          dataParam.stripSupcriptionId = stripeDataDetail.id;
          dataParam.subscription_price = subscrip && subscrip.price;
          dataParam.subscription_plan_type = subscrip && subscrip.duration;
          dataParam.subsriptionId = subscrip && subscrip._id;
          dataParam.is_subscription_buy = true;
          dataParam.subscriptionPlanStatus = true;
          dataParam.subscription_name = subscrip && subscrip.name;
          // dataParam.Bags = subscrip && subscrip.bags;
          let date = new Date();
          let dateTz = date.toLocaleString("en-US", {
            timeZone: "America/New_York",
          });
          dataParam.subscribedAt = dateTz;
          // dataParam.memberAllowed = subscrip && subscrip.nestedAcc;
        }
        let paymentInfo = [];
        paymentInfo.push({
          cardNumber: card.last4,
          expiry: `${card.exp_month}/${card.exp_year}`,
          methodId: card.id,
          brand: card.brand,
          name: details.cardName,
          method: details.method,
        });
        dataParam.paymentInfo = paymentInfo;
        result = await dataParam.save();
      } else {
        return res
          .status(400)
          .send({ message: "something went wrong ,card couldnt get saved" });
      }
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            businessAccountOwner: {
              ownerBusinessId: result && result._id,
            },
            businessAccount: {
              bussinessId: dataParam._id,
              bussinessOwnerId: userId,
              manageOrder: false,
              managePayment: false,
              maxBags: 0,
            },
            isBusinessMember: true,
            businessOwner: true,
          },
        }
      );
      res.status(200).send({ key: dataParam.inviteId, result: result });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getBusinessAccount = async (req, res) => {
  try {
    if (req.role == "ADMINISTRATOR") {
      const data = await BusinessAccount.find({}).populate(
        "members.Id",
        "hero"
      );

      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(400).json({ error: "Bussiness Account Not Found" });
      }
    } else {
      return res.status(400).json({ error: "Not Allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

const getBusinessAccountById = async (req, res) => {
  try {
    const data = await BusinessAccount.findOne({
      _id: new ObjectId(req.params.id),
      status: "ACTIVE",
    }).populate([
      {
        path: "members",
        populate: {
          path: "Id",
          model: "User",
        },
      },
      { path: "subsriptionId", model: "Subscription" },
    ]);
    if (!data)
      return res.status(400).json({ error: "Bussiness Account Not Found" });
    let territory = await Territory.find({});
    let territoryName;
    if (territory.length > 0) {
      let data1 = await findterritories(territory, data && data.zipCode);
      territoryName = data1 ? data1 : "Not a Valid";
    }
    data.subsriptionId.subscribedAt = data && data.subscribedAt;
    if (data) {
      if (data.paymentInfo.length > 0) {
        let defaultStatus = true;
        for (let methdod of data.paymentInfo) {
          if (methdod.defaultCard == true) defaultStatus = false;
        }
        if (defaultStatus) {
          data.paymentInfo[0].defaultCard = true;
          await data.save();
        }
      }
      let ownerDetail = data.members.find((member) =>
        member.Id.equals(data.userId)
      );
      let representativeData = {};
      representativeData.firstName = ownerDetail?.Id?.firstName
        ? ownerDetail?.Id?.firstName
        : "";
      representativeData.lastName = ownerDetail?.Id?.lastName
        ? ownerDetail?.Id?.lastName
        : "";
      representativeData.email = ownerDetail?.Id?.email
        ? ownerDetail?.Id?.email
        : "";
      representativeData.profilePicture = ownerDetail?.Id?.profilePicture
        ? ownerDetail?.Id?.profilePicture
        : "";
      let result1 = JSON.parse(JSON.stringify(data));
      result1["territoryName"] = territoryName;
      result1["representativeData"] = representativeData;
      return res.status(200).send(result1);
    } else {
      return res.status(400).json({ error: "Bussiness Account Not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};
const findterritories = async (territory, address) => {
  let territoryName;
  for (let territo of territory) {
    if (territo.zipCode.find((zip) => zip == address)) {
      territoryName = territo.name;
    }
  }
  if (territoryName) return territoryName;
};

const getAllBussiness = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      let a = false;
      const allOrders = await BusinessAccount.find()
        .populate(["members.Id", "userId", "subsriptionId", "hero"])
        .lean();
      let array = [];
      for (let i = 0; i < allOrders.length; i++) {
        let orders = await Order.find({
          customer: allOrders[i].userId?._id,
        }).lean();
        let payments = await Payment.find({
          customerId: allOrders[i].userId?._id,
        })
          .populate(["orderId", "customerId"])
          .lean();
        allOrders[i].userOrder = orders;
        allOrders[i].payments = payments;
      }

      res.status(200).send(allOrders);
    } else {
      res.status(400).send({ error: "Not an admin" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error);
  }
};

const updatetBusinessAccount = async (req, res) => {
  try {
    // const data = req.body;
    const Id = req.params.id;
    let heroId = req.query.id;
    let subscriptionDetail = req.query.subscription;
    let data, subsData;
    if (subscriptionDetail) {
      subsData = req.body;
    } else {
      data = req.body;
    }
    if (Object.keys(data).length) {
      let result = await BusinessAccount.findByIdAndUpdate(
        Id,
        {
          $set: data,
        },
        {
          new: true,
          runValidators: true,
          useFindandModify: false,
        }
      ).populate("hero");
      res.status(200).json(result);
    } else if (heroId) {
      let result = await BusinessAccount.updateOne(
        { _id: Id },
        { $unset: { hero: 1 } }
      );
      if (result)
        return res
          .status(200)
          .json({ message: "Hero is unassigned from the BusinessAccount." });
    } else if (subscriptionDetail && subsData) {
      let result = await BusinessAccount.findOne({ _id: Id });
      if (!result)
        return res.status(400).json({ error: "Bussiness Account Not Found" });
      let subscrip = await subcription.findOne({ _id: subsData._id });
      let stripeDataDetail = await stripeSubcription(
        result.stripeCustomerId,
        subsData.stripeProductPriceId
      );
      if (stripeDataDetail && stripeDataDetail.id) {
        result.stripSupcriptionId = stripeDataDetail.id;
        result.subscription_price = subscrip && subscrip.price;
        result.subscription_plan_type = subscrip && subscrip.duration;
        result.subsriptionId = subscrip && subscrip._id;
        result.is_subscription_buy = true;
        result.bagUsed = 0;
        result.subscriptionPlanStatus = true;
      }
      result.members = result.members.map((member) => {
        (member.manageOrder = true),
          (member.managePayment = true),
          (member.canShedule = true),
          (member.maxBags = 0),
          (member.maxBagDuration = result.subscription_plan_type),
          (member.managePayment = false),
          (member.bagCount = 0);
        return member;
      });

      let data = await result.save();
      if (data) {
        await User.updateMany(
          { "businessAccountOwner.ownerBusinessId": Id },
          {
            $set: {
              "businessAccount.manageOrder": true,
              "businessAccount.managePayment": true,
              "businessAccount.canShedule": true,
              "businessAccount.maxBags": 0,
              "businessAccount.maxBagDuration": result.subscription_plan_type,
            },
          }
        );
      }
      if (result)
        return res
          .status(200)
          .json({ message: "Hero is unassigned from the BusinessAccount." });
    } else {
      return res.status(400).json({ error: "Bussiness Account Not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

const deleteBusinessAccount = async (req, res) => {
  try {
    let userId = req.id;
    const Id = req.params.id;
    if (Id && userId) {
      const user = await User.findOne({ _id: userId });
      user.businessAccount = [];
      user.isBusinessMember = false;
      user.businessOwner = false;
      user.businessAccountOwner = undefined;
      await user.save();
      let result = await BusinessAccount.findOne({ _id: Id });

      result.status = "INACTIVE";
      await result.save();
      res.status(200).json({ data: "data" });
    } else {
      return res.status(400).json({ error: "Bussiness Account Not Found" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const Id = req.params.id;
    const { userId } = req.body;
    if (Id && userId) {
      let bussinessAccount = await BusinessAccount.findOne({ _id: Id });
      let user = await User.findOne({ _id: new ObjectId(userId) });
      if (
        bussinessAccount &&
        bussinessAccount.userId.toHexString() == user._id.toHexString()
      ) {
        return res
          .status(400)
          .json({ error: "Business owner is not allowed to be removed" });
      }
      if (!bussinessAccount) {
        return res.status(400).json({ error: "Bussiness Account Not Found" });
      } else {
        let membersFilter =
          bussinessAccount &&
          bussinessAccount.members.filter(
            (item) => item.Id.toHexString() !== user._id.toHexString()
          );
        bussinessAccount.members = membersFilter;
        let saved = await bussinessAccount.save();

        await User.updateOne(
          { _id: userId },
          {
            $set: {
              businessAccountOwner: {},
              businessAccount: {
                manageOrder: false,
                managePayment: false,
                maxBags: 0,
                maxBagDuration: "week",
              },
              isBusinessMember: false,
            },
          }
        );
        return res.status(200).json({ message: "Member Removed Successfully" });
      }
    } else {
      return res.status(400).json({ error: "one of the id is missing" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { businessId, userId } = req.body;
    if (!businessId || !userId) {
      return res
        .status(400)
        .json({ error: "businessId & user id is required " });
    }
    const user = await User.findOne({ _id: userId });
    const businessData = await BusinessAccount.findOne({ _id: businessId });
    if (!businessData)
      return res.status(400).json({ message: "Business Account not found" });
    let membersFilter = businessData.members.filter(
      (item) =>
        item && item.Id && item.Id.toString() == new ObjectId(userId).toString()
    );
    user.businessAccount.maxBagDuration = businessData?.subscription_plan_type;
    user.businessAccount.manageOrder = false;
    user.businessAccount.managePayment = false;
    user.businessAccount.maxBags = 0;
    if (membersFilter.length > 0) {
      return res.status(400).json({ message: "already a member" });
    } else {
      let result = await BusinessAccount.findByIdAndUpdate(
        { _id: ObjectId(businessId) },
        {
          $push: {
            members: {
              Id: userId,
              maxBagDuration: businessData?.subscription_plan_type,
            },
          },
        },
        { new: true }
      );
      if (result) {
        user.isBusinessMember = true;
        (user.businessAccount.bussinessId = businessData._id),
          (user.businessAccount.bussinessOwnerId = businessData.userId);
      }
      await user.save();
      res.status(200).json({ result, message: "member added" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const setPermissions = async (req, res) => {
  try {
    const Id = req.params.id;
    const { bussinessAccount } = req.body;

    if (bussinessAccount) {
      let user = await User.findOne({ _id: new ObjectId(Id) });
      if (!user) {
        return res.status(400).json({ error: "User not Found" });
      } else {
        const businessData = await BusinessAccount.findOne({
          _id: bussinessAccount.bussinessId,
        });
        bussinessAccount.maxBagDuration = businessData.subscription_plan_type;
        user.businessAccount = bussinessAccount;
        let updateUser = await user.save();
        if (updateUser) {
          let memberDetail =
            businessData &&
            businessData.members.find(
              (member) => member.Id.toHexString() == user._id.toHexString()
            );
          if (memberDetail) {
            await BusinessAccount.updateOne(
              {
                _id: bussinessAccount.bussinessId,
                "members.Id": Id,
              },
              {
                $set: {
                  "members.$.maxBags": bussinessAccount.maxBags,
                  "members.$.manageOrder": bussinessAccount.manageOrder,
                  "members.$.managePayment": bussinessAccount.managePaymen,
                  "members.$.maxBagDuration":
                    businessData.subscription_plan_type,
                },
              }
            );
          }
        }
        return res.status(200).json({ data: updateUser });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getBusinessMember = async (req, res) => {
  try {
    const busId = req.params.id;
    const result = await BusinessAccount.findById({ _id: busId }).populate([
      {
        path: "members.Id",
      },
      {
        path: "hero",
      },
    ]);
    if (!result) {
      return res.status(400).json({
        mesaage: "BusinessAccount not found",
      });
    }
    for (let member of result && result.members) {
      let orderCount = await Order.find({ customer: member._id }).count();
      //  Object.assign(member, {key3: orderCount});
      member["orderCount"] = orderCount;
    }
    res.status(200).json({
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

// const updateSubscription = async (req, res) => {
//   try {
//     if (req.role === "ADMINISTRATOR") {
//       const busId = req.params.id;
//       const busSubs = await BusinessAccount.findOne({ busId });
//   //   busSubs.subscriptionId = req.body.subscriptionId ?  req.body.subscriptionId : busSubs.subscriptionId
//     } else {
//       res.status(400).send({ error: "Admin Permission required" });
//     }
//   } catch (err) {
//     console.log(err.message);
//     res.status(400).send({ error: err.message });
//   }
// };
const getBusinessInfo = async (req, res) => {
  try {
    const { businessId } = req.params;

    let result = await BusinessAccount.findOne({ _id: businessId }).populate([
      {
        path: "members.Id",
      },
      {
        path: "hero",
      },
      { path: "subsriptionId", model: "Subscription" },
    ]);
    let territory = await Territory.find({});
    let territoryName;
    if (territory.length > 0) {
      let data1 = await findterritories(territory, result && result.zipCode);
      territoryName = data1 ? data1 : "Not a Valid";
    }

    if (!result) {
      return res.status(400).send({ mesaage: "BusinessAccount not found" });
    } else {
      let users = [];
      if (result.members && result.members.length > 0) {
        for (let i = 0; i < result.members.length; i++) {
          const userId = result.members[i].Id._id;
          let orderCount = await Order.find({ customer: userId });
          result.members[i]["orderCount"] = orderCount.length;
          users.push(userId);
        }
        const orders = await Order.find({ customer: { $in: users } });
        const payments = await Payment.find({
          customerId: { $in: users },
        }).populate(["orderId", "customerId"]);
        result["orders"] = orders;
        result["payments"] = payments;
      }
      let ownerDetail = result.members.find((member) =>
        member.Id.equals(result.userId)
      );
      let representativeData = {};
      representativeData.firstName = ownerDetail?.Id?.firstName
        ? ownerDetail?.Id?.firstName
        : "";
      representativeData.lastName = ownerDetail?.Id?.lastName
        ? ownerDetail?.Id?.lastName
        : "";
      representativeData.email = ownerDetail?.Id?.email
        ? ownerDetail?.Id?.email
        : "";
      representativeData.profilePicture = ownerDetail?.Id?.profilePicture
        ? ownerDetail?.Id?.profilePicture
        : "";
      let result1 = JSON.parse(JSON.stringify(result));
      result1["territoryName"] = territoryName;
      result1["representativeData"] = representativeData;
      res.status(200).send(result1);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports = {
  createBusinessAccountOwner,
  getBusinessAccount,
  getBusinessAccountById,
  updatetBusinessAccount,
  deleteBusinessAccount,
  removeMember,
  setPermissions,
  getAllBussiness,
  getBusinessMember,
  addMember,
  // updateSubscription
  // createBusinessAccountReferByOwner,
  getBusinessInfo,
};
