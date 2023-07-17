const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const htmlPDF = require("puppeteer-html-pdf");
const readFile = require("util").promisify(fs.readFile);
const Order = require("../models/Orders");
const User = require("../models/Users");
const Hero = require("../models/Heros");
const BusinessAccount = require("../models/BusinessAccount");
const Payout = require("../models/Payout");
const { Preference } = require("../models/Preferences");
const Product = require("../models/Products");
const Territory = require("../models/Territory");
const Pricegroup = require("../models/Pricegroup");
const mongoose = require("mongoose");
const ObjectID = mongoose.Types.ObjectId;
const { ObjectId } = require("mongodb");
const Promocode = require("../models/Promocode");
const Payment = require("../models/Payment");
const template = require("./handleTemplates");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const NodeGeocoder = require("node-geocoder");
const Rating = require("../models/Ratings");
const moment = require("moment");
const getOrdersData = require("../services/getOrdersData");
const {
  sendEmailNotification,
  sendInAppNotification,
  sendSmsNotification,
} = require("../utils/sendNotifications");
const { payout } = require("./handleTransaction");
const { resourceUsage } = require("process");

const createOrder = async (req, res) => {
  try {
    // Extract userId, heroId
    // console.log(req.id);
    const memberId = req.params.id;
    let userId;
    if (memberId) {
      userId = req.params.id;
    } else {
      userId = req.id.toHexString();
    }
    const { heroId, address } = req.body;
    if (!address)
      return res.status(400).send({ error: "Address Detail is Required" });
    const options = {
      provider: "google",

      // Optional depending on the providers
      // fetch: customFetchImplementation,
      apiKey: GOOGLE_MAPS_API_KEY, // for Mapquest, OpenCage, Google Premier
      formatter: null, // 'gpx', 'string', ...
    };

    const geocoder = NodeGeocoder(options);
    let acceptanceContr, odrResToHeros, businessOwner;
    // Using callback ${req.body.address.streetNumber}${req.body.address.streetName}${req.body.address.zipCode}

    const orderData = req.body;
    const userData = await User.findOne({ _id: userId });
    let bunsinessId =
      userData &&
      userData.businessAccount &&
      userData.businessAccount.bussinessId;
    // if(memberId&&userId!==req.id.toHexString()){
    //   let ownerId =req.id.toHexString();
    //   businessOwner = await User.findOne({ _id:ownerId});
    //   if(parseInt(businessOwner&&businessOwner.businessAccount&&businessOwner.businessAccount.maxBags)==parseInt(businessOwner&&businessOwner.businessAccount&&businessOwner.businessAccount.bagCount))
    //   {
    //   return res.status(400).send({"status":"failed","message":"order could nt be placessed due order limit is over"})
    //  }}
    let territory = await Territory.find({});
    if (territory.length > 0) {
      acceptanceContr = territory[0].heroResponse;
    }
    let assignedHero;
    let heroData, territoryName;
    if (heroId) {
      heroData = await User.findOne({ _id: heroId, role: "LAUNDRY_HERO" });
    } else {
      // let orderday = orderData.orderDate.getDay()
      // let expectedDelvryDate = orderData.expectedDelvryDate.getDay()
      odrResToHeros = await Hero.aggregate([
        { $match: { availabilityStatus: "AVAILABLE", heroStatus: "VERIFIED" } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user" } },
      ]);
    }
    //
    let selectedAddress = {};
    selectedAddress = userData.address.find((e) => e._id.equals(address));
    // console.log(selectedAddress,"@@@@@")
    let territoryData = await findterritories(territory, selectedAddress);
    if (territoryData) territoryName = territoryData;
    if (!selectedAddress)
      return res.status(400).send({ error: "Address not found" });

    if (userData.preferences.length === 0)
      return res.status(400).send({ error: "Preference not found" });

    // If hero doesn't exist
    // if (!heroData) {
    //   return res.status(400).send({ error: "Hero not found" });
    // }

    let { bags, tip, discount } = orderData;
    let subTotal = orderData.subTotal;
    let heroFee, platformFee, product_detail;
    let productId = req.body.productId;
    if (productId != "") {
      product_detail = await Product.find({ _id: productId });
      if (product_detail.length > 0) {
        heroFee = product_detail[0].heroFee;
        tip = tip ? tip : 0;
        // console.log(Number(heroFee).toFixed(2), "111");
        // console.log(Number(tip).toFixed(2), "222");
        heroFee = +Number(heroFee).toFixed(2) + +Number(tip).toFixed(2);
        heroFee = heroFee.toFixed(2);
        platformFee = subTotal - heroFee;
        if (platformFee < 0) {
          platformFee = 0;
        }
      } else {
        heroFee = 0;
        platformFee = 0;
      }
    } else {
      heroFee = 0;
      platformFee = 0;
    }
    orderData.platformFee = platformFee;
    orderData.heroFee = heroFee;
    // Initialize mongoose order schema
    const order = new Order({
      ...orderData,
      // pickoffDate : req.body.pickoffDate,
      orderDate: orderData.orderDate ? orderData.orderDate : new Date(),
      address: selectedAddress,
      customer: userData._id,
      addressId: selectedAddress._id,
      customerName: userData.address[0].name,
      hero: heroData?._id,
      promoCodeDiscount: orderData.promoCodeDiscount
        ? orderData.promoCodeDiscount
        : 0,
      acceptanceContr: acceptanceContr ? acceptanceContr : "3 hours",
      odrResToHeros: odrResToHeros?._id,
      preferences: orderData.preferences
        ? orderData.preferences
        : userData.preferences,
      businessOwnerId:
        userData.businessAccountOwner &&
        userData.businessAccountOwner.ownerBusinessId
          ? userData.businessAccount.ownerBusinessId
          : undefined,
      orderCreatedBy: orderData.orderCreatedBy
        ? orderData.orderCreatedBy
        : "Self",
      paymentBy: orderData.paymentBy ? orderData.paymentBy : "Self",
      subTotal,
      territoryName: territoryName ? territoryName : "",
      discount: discount ? discount : 0,
    });
    const result = await order.save();
    const promode_name = req.body.promoCode;
    if (promode_name) {
      let promocodeExist = userData.promoCode.find((promoc) => {
        promoc.name == promode_name;
      });
      if (!promocodeExist) {
        userData.promoCode.push({ name: promode_name });
        await userData.save();
      }
    }
    if (Object.keys(result).length != 0 && promode_name != "") {
      const product_detail = await Promocode.find({ promoCode: promode_name });
      if (product_detail && product_detail.length > 0) {
        let promocode_id = product_detail[0]._id;
        await Promocode.findByIdAndUpdate(
          promocode_id,
          {
            $set: {
              timeUsed: product_detail[0].timeUsed + 1,
            },
          },
          {
            new: true,
            runValidators: true,
            useFindandModify: false,
          }
        );
      }
    }

    if (memberId /*&& req.id.toHexString() !== userId*/) {
      // let ownerId = req.id.toHexString();
      // businessOwner = await User.findOne({ _id: ownerId });
      if (
        parseInt(
          userData &&
            userData.businessAccount &&
            userData.businessAccount.bagCount
        ) <
        parseInt(
          userData &&
            userData.businessAccount &&
            userData.businessAccount.maxBags
        )
      ) {
        // id = req.id.toHexString();
        if (bunsinessId) {
          await updateBagUsed(bunsinessId, bags);
          await updateUsersBagPermisstion(memberId, bags);
        }
      }
    }
    // if (
    //   memberId &&
    //   req.id.toHexString() == userId &&
    //   parseInt(
    //     userData && userData.businessAccount && userData.businessAccount.maxBags
    //   ) >
    //     parseInt(
    //       userData &&
    //         userData.businessAccount &&
    //         userData.businessAccount.bagCount
    //     )
    // ) {
    //   if (bunsinessId) {
    //     await updateBagUsed(bunsinessId, bags);
    //     await updateUsersBagPermisstion(userId, bags);
    //   }
    // }
    /*if supcripplan active hoga tbhi memmer or owner order create krpaynge*/
    if (!memberId) {
      if (
        userData.isBusinessMember &&
        parseInt(
          userData &&
            userData.businessAccount &&
            userData.businessAccount.maxBags
        ) >
          parseInt(
            userData &&
              userData.businessAccount &&
              userData.businessAccount.bagCount
          )
      ) {
        await updateBagUsed(bunsinessId, bags);
        await updateUsersBagPermisstion(userId, bags);
      }
    }
    const msg = {
      title: "Order Successfully Placed",
      body: `Your Order of ${result.bags.number} Laundry Bags is succesfully Placed`,
    };
    let templateId = "";
    if (userData.notification.email)
      sendEmailNotification(userData, msg, templateId);
    if (userData.notification.app) sendInAppNotification(userData, msg);
    if (userData.notification.sms) sendSmsNotification(userData, msg);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const findterritories = async (territory, address) => {
  let territoryName;
  for (let territo of territory) {
    if (territo.zipCode.find((zip) => zip == address.zipCode)) {
      territoryName = territo.name;
    }
  }
  if (territoryName) return territoryName;
};
const updateOrder = async (req, res) => {
  try {
    // Extract userId, heroId
    const userId = req.id;
    const orderId = req.params.id;
    // Extract all the values from body
    const {
      status,
      orderDeliveryDate,
      bags,
      orderDeliveredDate,
      outForPickUpDate,
      hero,
      timeSlot,
      repeat,
      address,
      expectedDelivery,
      actualDelivery,
      chatUpdatedAt,
      pic,
      readyToDelivryDate,
      orderCollectedDate,
      dropOffPictureDate,
      pickupPictureDate,
      acceptedDate,
      pickoffDate,
      dropoffDate,
      hero_data,
    } = req.body;
    const heroData = await User.findOne({ _id: userId });
    if (req.role == "LAUNDRY_HERO") {
      const heroDetail = await Hero.findOne({ userId });
      // If HeroData doesn't exist
      if (
        (heroDetail && heroDetail.heroStatus === "PENDING_VERIFICATION") ||
        heroDetail.heroStatus === "NONE"
      ) {
        return res.status(200).send({
          msg: "Only VERIFIED Heros can accept or Declined the orders",
        });
      }
    }

    if (heroData.role === "CONSUMER") {
      return res
        .status(400)
        .send({ error: "Only Hero or Admin can edit the order" });
    }

    // If Hero is not same as assigned
    const found = await Order.findById(orderId);
    if (!found) {
      return res.status(400).send({ error: "Order not assigned to the hero" });
    }

    // Set update data based on role
    let data;
    let declined = req.body.dStatus ? req.body.dStatus : false;
    let declineMsg = req.body.msg ? req.body.msg : "";
    let result;
    if (declined == "DECLINE") {
      let detail = {};
      detail.declineMsg = declineMsg;
      detail.userId = mongoose.Types.ObjectId(userId);
      detail.status = declined;
      detail.name = `${heroData.firstName} ${heroData.lastName}`;
      result = await Order.findByIdAndUpdate(
        orderId,
        { $push: { declineByHeros: detail } },
        { new: true, upsert: true }
      );
    } else {
      if (heroData.role === "LAUNDRY_HERO") {
        data = {
          status,
          hero,
          orderDeliveryDate,
          bags,
          timeSlot,
          address,
          expectedDelivery,
          actualDelivery,
          chatUpdatedAt,
          dropOffPicture: pic?.dropOffPicture,
          pickupPicture: pic?.pickupPicture,
          pickupPictureDate: pickupPictureDate,
          dropOffPictureDate: dropOffPictureDate,
          orderCollectedDate: orderCollectedDate,
          orderDeliveredDate: orderDeliveredDate,
          outForPickUpDate: outForPickUpDate,
          acceptedDate,
          readyToDelivryDate: readyToDelivryDate,
          pickoffDate,
          dropoffDate,
        };
      }
      if (heroData.role === "ADMINISTRATOR") {
        data = {
          status,
          orderDeliveryDate,
          bags,
          hero,
          timeSlot,
          repeat,
          address,
          expectedDelivery,
          actualDelivery,
          chatUpdatedAt,
          acceptedDate,
          pickoffDate,
          dropoffDate,
          readyToDelivryDate,
          orderCollectedDate,
          outForPickUpDate,
          orderDeliveredDate,
        };
      }
      // Find and update order
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: data,
        },

        {
          new: true,
          runValidators: true,
          useFindandModify: false,
        }
      );
      result = await order.save();
    }
    if (status == "OK_TO_PAY" && hero_data && result) {
      const newPayout = {
        orderId: result._id,
        heroId: result.hero,
        status: "OK_TO_PAY",
        hero_data: hero_data,
        amount: result.subTotal,
        order_amount: result.subTotal,
        plateformFee: result.platformFee,
        payout_amount: result.heroFee,
      };

      let output = await Payout.findOneAndUpdate(
        { orderId: result._id },
        {
          $set: newPayout,
        },

        {
          upsert: true,
          runValidators: true,
          useFindandModify: false,
        }
      );
    }
    res.status(200).send(result);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    if (req.role === "ADMINISTRATOR") {
      const order = await Order.find({ _id: orderId });
      if (order && order.length > 0) {
        if (order && order[0].status == "DELIVERED") {
          let hero_id = order[0].hero;
          let hero = await User.findOne({ _id: hero_id });
          //updating order status
          let saved = await Order.updateOne(
            { _id: orderId },
            {
              $set: {
                status: "OK_TO_PAY",
              },
            }
          );
          let user = await User.findById(order[0].customer);
          let user_id = user && user.length > 0 ? user[0]._id : "";
          let user_email = user && user.length > 0 ? user[0].email : "";

          console.log(hero, "hero");
          let hero_data = {};
          if (hero) {
            hero_data = {
              hero_email: hero.email,
              hero_name: hero.firstName + " " + hero.lastName,
              hero_image: hero.profilePicture,
              userId: hero._id,
            };
          } else {
            hero_data = {};
          }
          //create new payout
          console.log(hero_data, "hero_data");
          const payout = new Payout({
            orderId: orderId,
            plateformFee: order[0].platformFee,
            status: "OK_TO_PAY",
            amount: order[0].subTotal,
            payout_amount: order[0].heroFee,
            order_amount: order[0].subTotal,
            hero_data: hero_data,
          });
          const result = await payout.save();
          return res.status(200).send({
            data: "Order status updated successfully",
          });
        } else {
          return res.status(400).send({
            error: "You can mark only delivered order status to OK to Pay",
          });
        }
      } else {
        return res.status(400).send({ error: "No order found" });
      }
    } else {
      return res
        .status(400)
        .send({ error: "Only Admin can update the order status" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error);
  }
};

const getOrder = async (req, res) => {
  try {
    // Extract userId, heroId
    const userId = req.id;
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    // Check for valid hero or user or admin to view the order
    if (
      String(order.hero) === String(userId) ||
      String(order.customer) === String(userId) ||
      req.role === "ADMINISTRATOR"
    ) {
      await order.populate([
        {
          path: "customer",
          select: "firstName lastName _id email status paymentMethod",
        },
        {
          path: "hero",
          select: "firstName lastName _id email status profilePicture",
        },
      ]);
      let rating = await Rating.findOne({ orderId: orderId });
      if (rating) {
        order.AvgRating = rating.AvgRating;
      }
      return res.status(200).send(order);
    }

    res.status(400).send({ error: "User is not allowed to view the order" });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const checkAddress = async (req, res) => {
  try {
    let userId;
    if (req.query.memberId) {
      userId = req.query.memberId;
    } else {
      userId = req.id;
    }

    const addressId = req.params.id;
    let user_addresses, zipCode, territory_zip_code;
    const user_data = await User.find({ _id: userId });
    if (user_data.length > 0) {
      user_addresses = user_data[0].address;
      const is_address_exist = user_addresses.filter(
        (items) => items._id == addressId
      );
      if (is_address_exist && is_address_exist.length > 0) {
        zipCode = is_address_exist[0].zipCode;
        const allTerritories = await Territory.find();
        if (allTerritories && allTerritories.length > 0) {
          territory_zip_code = allTerritories[0].zipCode;
          for (let obj of allTerritories) {
            if (obj.zipCode.includes(zipCode)) {
              return res.status(200).send({
                status: true,
                message: "Address belongs to the territory",
              });
            } else {
              return res.status(404).json({
                status: false,
                message:
                  "Sorry. This address is not within the valid service range covered by Laundry Hero",
              });
            }
          }
        } else {
          return res.status(200).send({
            status: false,
            message: "No territory found",
          });
        }
      } else {
        return res.status(404).send({
          status: false,
          message:
            "Sorry. This address is not within the valid service range covered by Laundry Hero",
        });
      }
    } else {
      return res.status(200).send("No data found");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const getOrderByHero = async (req, res) => {
  try {
    console.log(req.id, req.body.id);
    // Extract userId, heroId
    const userId = req.id;
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    // Check for valid hero or user or admin to view the order
    if (
      String(order.hero) === String(userId) ||
      String(order.customer) === String(userId) ||
      req.role === "ADMINISTRATOR"
    ) {
      await order.populate([
        { path: "customer", select: "firstName lastName _id email status" },
        { path: "hero", select: "firstName lastName _id email status" },
      ]);

      return res.status(200).send(order);
    }

    res.status(400).send({ error: "User is not allowed to view the order" });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const total_orders = await Order.find();
    let allOrders;
    if (req.role === "ADMINISTRATOR") {
      if (page != undefined && limit != undefined) {
        allOrders = await Order.find()
          .populate([
            {
              path: "customer",
              select:
                "firstName lastName _id email status profilePicture phone",
            },
            {
              path: "hero",
              select:
                "firstName lastName _id email status profilePicture phone",
            },
          ])
          .skip(page * limit)
          .limit(limit);
        res
          .status(200)
          .send({ total_orders: total_orders.length, data: allOrders });
      } else {
        allOrders = await Order.find().populate([
          {
            path: "customer",
            select: "firstName lastName _id email status profilePicture phone",
          },
          {
            path: "hero",
            select: "firstName lastName _id email status profilePicture phone",
          },
        ]);
        res
          .status(200)
          .send({ total_orders: total_orders.length, data: allOrders });
      }
    } else {
      res.status(400).send({ error: "Not an admin" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

const getOrderHistory = async (req, res) => {
  try {
    // Extract user or hero from params or req
    let userId;
    var data;
    // let result;
    if (req.role === "ADMINISTRATOR") {
      userId = req.params.id;
      const userData = await User.findById(userId);
      data = await getOrdersData(userId, userData.role);
    }
    if (req.role === "LAUNDRY_HERO") {
      userId = req.id;
      const herodetails = await Hero.findOne({ userId: userId });
      if (herodetails?.heroStatus === "VERIFIED") {
        data = await getOrdersData(userId, req.role);
      }
      if (
        herodetails?.heroStatus === "PENDING_VERIFICATION" ||
        herodetails?.heroStatus === "NONE"
      ) {
        res
          .status(200)
          .send({ msg: "You Can't view the Orders Without Being Verified." });
      }
      // res.status(403).send({msg: "You Can't see the Orders Without Being Verified."})
    }
    if (req.role === "CONSUMER") {
      const userData = await User.findById(req.id);
      let owner = (userData && userData.businessOwner == true) || "true";
      if (owner) {
        data = await getOrdersData(req.id, req.role, owner);
      } else {
        data = await getOrdersData(req.id, req.role);
      }
      // res.status(403).send({msg: "You Can't see the Orders Without Being Verified."})
    }
    if (data.length < 1) {
      return res.status(200).send({ message: "No order history found" });
    }
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const updateMultplOrder = async (req, res) => {
  try {
    // Extract userId, heroId
    const userId = req.id;
    let result = [];
    const heroData = await User.findOne({ _id: userId });
    const heroDetail = await Hero.findOne({ userId: userId });
    // If HeroData doesn't exist
    if (
      (heroDetail && heroDetail.heroStatus === "PENDING_VERIFICATION") ||
      heroDetail.heroStatus === "NONE"
    ) {
      return res
        .status(400)
        .send({ message: "Only VERIFIED Heros can accept the orders" });
    }
    if (heroData.role === "CONSUMER") {
      return res
        .status(400)
        .send({ error: "Only Hero or Admin can edit the order" });
    }
    let odrArray = req.body;
    for (let odr of odrArray) {
      let order = await Order.findOneAndUpdate(
        { _id: ObjectID(odr.orderid), status: "WAITING_FOR_HERO" },
        {
          $set: odr,
        },

        {
          new: true,
          runValidators: true,
          useFindandModify: false,
        }
      );
      if (order) {
        let data = await order.save();
        if (data) {
          let orderDetail = {};
          orderDetail.orderid = order._id;
          orderDetail.status = "created";
          result.push(orderDetail);
        }
      } else {
        let orderDetail = {};
        orderDetail.orderid = odr.orderid;
        orderDetail.status = "not_created";
        result.push(orderDetail);
      }
    }
    return res.status(200).send({ data: result });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const repeatOrder = async (req, res) => {
  try {
    //console.log(req.id, req.params.id);
    const userId = req.id;
    const orderId = req.params.id;
    const allPreference = await Preference.find();
    const orderDetail = await Order.findById(orderId, {
      _id: 1,
      customerName: 1,
      preferences: 1,
      address: 1,
      bags: 1,
      anySpecialInstructions: 1,
      promoCode: 1,
      tip: 1,
      deliveryCharge: 1,
      platformFee: 1,
      addressId: 1,
    });
    for (pref of allPreference) {
      for (item of orderDetail.preferences) {
        if (item.name == pref.name) {
          item.allOption = pref.options;
        }
      }
    }
    console.log(orderDetail.preferences);
    return res.status(200).send(orderDetail);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const getPriceGroupDiscount = async (req, res) => {
  try {
    let businessAcc = req.query.status;
    let memberId = req.query.memberId;
    const addressId = req.body.addressId;
    const productId = req.body.productId;
    let bags, product_detail;
    if (productId != "" && productId != undefined) {
      product_detail = await Product.find({});
      if (product_detail.length > 0) {
        let currentProd = product_detail.find((prod) => prod._id == productId);
        bags = currentProd.amountOfBags;
      }
    }
    let userId;
    if (businessAcc) {
      let bagDifferenc;
      if (memberId) {
        userId = memberId;
      } else {
        userId = req.id;
      }
      const userData = await User.aggregate([
        { $match: { _id: ObjectId(userId) } },
        {
          $project: {
            address: {
              $filter: {
                input: "$address",
                as: "item",
                cond: { $eq: ["$$item._id", ObjectId(addressId)] },
              },
            },
            role: 1,
            email: 1,
            firstName: 1,
            businessAccount: 1,
            isBusinessMember: 1,
            businessOwner: 1,
          },
        },
        {
          $lookup: {
            from: "bussinesses",
            localField: "businessAccount.bussinessId",
            foreignField: "_id",
            as: "businessDetails",
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "businessDetails.subsriptionId",
            foreignField: "_id",
            as: "subscriptionDetail",
          },
        },
      ]);
      if (userData.length <= 0)
        return res.status(400).send({ error: "user not found" });
      let zipCode =
        userData[0] && userData[0].address[0] && userData[0].address[0].zipCode;
      let activePlan = false;
      let priceGroup,
        discount,
        normalDiscount,
        bag_permission,
        bagLeft,
        totalBagLeft,
        Owneruser,
        withoutDisconprice,
        subscriptPrice;
      if (userData[0] && userData[0].businessDetails[0]) {
        //  let todayDate = new Date();
        //  let subscription_expire_at =  userData[0].businessDetails[0].subscription_expire_at ;
        //  subscription_expire_at = new Date(subscription_expire_at)
        // let subscriptionIsActive = subscription_expire_at >= todayDate
        let subscriptionIsActive =
          userData[0] &&
          userData[0].businessDetails[0] &&
          userData[0].businessDetails[0].subscriptionPlanStatus;
        //  let orderLimit =userData[0]&&userData[0].businessAccount&&userData[0].subscriptionDetail[0].bags > userData[0].businessDetails[0].bagCount ;
        bag_permission =
          (userData[0] &&
            userData[0].businessAccount &&
            parseInt(userData[0].businessAccount.maxBags)) -
          (userData[0] &&
            userData[0].businessAccount &&
            parseInt(userData[0].businessAccount.bagCount));
        totalBagLeft =
          (userData[0] &&
            userData[0].subscriptionDetail &&
            userData[0].subscriptionDetail[0].bags) >
          (userData[0] &&
            userData[0].businessDetails &&
            userData[0].businessDetails[0].bagUsed);
        if (!(bag_permission && bag_permission >= bags)) {
          if (!memberId && bag_permission == 0) {
            let user = await User.findOne({ _id: ObjectId(req.id) });
            let addrss = user.address.filter(
              (address) => address._id == addressId
            );
            let zipcode = addrss.length && addrss[0].zipCode;
            let priceGroup = await getPriceGroup(zipcode);
            discount = await getDiscount(priceGroup, bags, req.id);
            let totalDiscount = {};
            totalDiscount.discount = discount;
            totalDiscount.subcripDiscount = 0;
            return res.status(200).send({ totalDiscount: totalDiscount });
          }
          return res
            .status(400)
            .send({ message: `You have ${bag_permission} Bags left` });
        }
        if (subscriptionIsActive && bag_permission && totalBagLeft)
          activePlan = true;
      }
      // let activePlan =userData[0]&&userData[0].businessDetails[0]&&userData[0].businessDetails[0].subscriptionPlanStatus
      if (activePlan) {
        let priceGroupProd =
          userData[0].subscriptionDetail[0].priceGroup &&
          userData[0].subscriptionDetail[0].priceGroup.products.filter(
            (prod) => prod._id == productId
          );
        if (priceGroupProd) {
          priceGroup = userData[0].subscriptionDetail[0].priceGroup;
        } else {
          priceGroup = getPriceGroup(zipCode);
        }

        discount = await getDiscount(priceGroup, bags);
        let subcripDiscount;
        if (
          (userData[0] &&
            userData[0].businessDetails[0] &&
            userData[0].businessDetails[0].bagUsed) >=
            (userData[0] &&
              userData[0].subscriptionDetail[0] &&
              userData[0].subscriptionDetail[0].minimumOrder) &&
          (userData[0] &&
            userData[0].businessDetails[0] &&
            userData[0].businessDetails[0].bagUsed) <=
            (userData[0].subscriptionDetail[0] &&
              userData[0].subscriptionDetail[0].bags)
        ) {
          subcripDiscount =
            (userData[0].subscriptionDetail[0] &&
              userData[0].subscriptionDetail[0].discount) +
            (userData[0].subscriptionDetail[0] &&
              userData[0].subscriptionDetail[0].minimumOrderDiscount);
          // subcripDiscount = (subcripDiscount*product_detail.price)/100;
        } else {
          subcripDiscount =
            userData[0].subscriptionDetail[0] &&
            userData[0].subscriptionDetail[0].discount;
          // subcripDiscount =  (subcripDiscount*product_detail.price)/100;
        }

        let totalDiscount = {};
        totalDiscount.discount = discount;
        // totalDiscount.normalDiscount = normalDiscount ? normalDiscount : 0;
        totalDiscount.subcripDiscount = subcripDiscount;
        // totalDiscount.withoutDisconprice = withoutDisconprice
        //   ? withoutDisconprice
        //   : 0;
        // totalDiscount.subscriptPrice = subscriptPrice ? subscriptPrice : 0;
        return res.status(200).send({ totalDiscount: totalDiscount });
      } else {
        let priceGroup = await getPriceGroup(zipCode);
        if (memberId) {
          discount = await getDiscount(priceGroup, bags, req.id);
        } else {
          discount = await getDiscount(priceGroup, bags, userId);
        }
        let totalDiscount = {};
        totalDiscount.discount = discount;
        totalDiscount.subcripDiscount = 0;
        // totalDiscount.normalDiscount = 0;
        // totalDiscount.withoutDisconprice = 0;
        // totalDiscount.subscriptPrice = 0;
        return res.status(200).send({ totalDiscount: totalDiscount });
      }
    } else {
      let user = await User.findOne({ _id: ObjectId(req.id) });
      let addrss = user.address.filter((address) => address._id == addressId);
      let zipcode = addrss.length && addrss[0].zipCode;
      let priceGroup = await getPriceGroup(zipcode);
      discount = await getDiscount(priceGroup, bags, req.id);
      let totalDiscount = {};
      totalDiscount.discount = discount;
      totalDiscount.subcripDiscount = 0;
      return res.status(200).send({ totalDiscount: totalDiscount });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

const getPricePerBag = async (req, res) => {
  try {
    //console.log(req.id, req.params.id);
    const userId = req.id;
    const bags = req.params.bags;
    let price;
    const productList = await Product.find({});
    if (!productList.length) {
      return res.status(400).json({ error: "No product found" });
    } else {
      for (let product of productList) {
        if (product.amountOfBags == bags) {
          price = product.price;
        }
      }
      if (!price) {
        return res
          .status(400)
          .json({ error: "Sorry, we're not able to add more bags" });
      } else {
        return res.status(200).json({ price: price });
      }
    }

    // if (!bagCondition) {
    //   res.status(200).send("Disscount not ablicalbe Due to Number of Bags");
    // }
    // if (bagCondition && priceGroup.limits === "Unlimited") {
    //   res.status(200).json({ discount: priceGroup.discount });
    // } else {
    //   let orderCount = await Order.find({ customer: ObjectID(req.id) }).count();
    //   if (priceGroup&&priceGroup.limits > orderCount) {
    //     res.status(200).json({ discount: priceGroup.discount });
    //   } else {
    //     res.status(200).send("Disscount not ablicalbe Due to orderLimits");
    //   }
    // }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const assignHero = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      let assignedByAdmin = true;
      let type = req.query.type;
      if (type == "unassign" && !req.body.data) {
        return res
          .status(400)
          .send({ message: "Body data is needed for unassign a Hero" });
      }
      let orderId = req.params.orderId;
      let heroId = req.params.heroId;
      const hero = await Hero.findOne({ userId: heroId });
      const user = await User.findOne({ _id: heroId });
      if (!hero)
        return res.status(400).send({ message: "Hero is not present" });
      if (type == "assign") {
        if (hero) {
          // confirm(`assign ${hero.name} to order ${orderId}`)
          let order = await Order.findOneAndUpdate(
            { _id: orderId },
            {
              hero: heroId,
              assignedByAdmin: assignedByAdmin,
              status: "ACCEPTED",
              acceptedDate: new Date(),
            },
            {
              new: true,
              runValidators: true,
            }
          );
          if (!order) {
            return res
              .status(400)
              .send({ error: "order is not present in the DB" });
          }
          let template_data = await template.getTemplate({
            templateType: "IMPORTANT_UPDATE_TO_HERO",
          });
          let order_data = await Order.findOne({ _id: orderId });
          let templateId;
          if (
            template_data &&
            template_data.length > 0 &&
            template_data[0].status == true
          ) {
            templateId = template_data[0].template_id;
            let link = `https://consumer.freshify.io/hero-orders`;
            let address =
              order_data.address.addressName +
              "," +
              order_data.address.streetAddress +
              "," +
              order_data.address.city +
              "," +
              order_data.address.zipCode +
              "," +
              order_data.address.state;
            let data = {
              email: hero.email,
              order_ID: order_data._id,
              pickup_address: address,
              pickup_dateandtime: order_data.orderDate,
              delivery_dateandtime: order_data.orderDeliveryDate,
              firstName: hero.firstName,
              link: link,
            };
            let msg = "";
            if (user.notification && user.notification.email) {
              sendEmailNotification(data, msg, templateId);
            }
          }
          return res.status(200).json({
            message: "Hero assigned to the order successfully",
            status: true,
          });
        }
      } else if (type == "unassign" && req.body.data) {
        let order = await Order.findOne({ _id: orderId });
        order.hero = null;
        order.status = "WAITING_FOR_HERO";
        order.assignedByAdmin = false;
        order.unassignByAdmin = req.body.data;
        order.acceptedDate = null;
        await order.save();
        return res.status(200).json({
          message: "Hero un-assigned from the order successfully",
          status: true,
        });
      }
    } else {
      return res
        .status(400)
        .send({ error: "Only Admin can update the order status" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const exportUnpaidOrders = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const businessId = req.params.businessId;
      const allPayments = await BusinessAccount.findOne({
        _id: businessId,
      }).populate(["userId"]);
      if (allPayments) {
        let payments = await Payment.find({
          customerId: allPayments.userId._id,
          status: "PENDING",
        }).populate(["orderId", "customerId"]);

        /* ejs.renderFile(path.join(__dirname, '../views/', "invoice-template.ejs"), {businessAccount :allPayments ,payments: payments, 'moment':moment}, (err, data) => {
          if (err) {
            res.status(400).send({ error: err.message });
          } else {
            let options = {
                "height": "33.11in",
                "width": "46.81in",
                "header": {
                    "height": "20mm"
                },
                "footer": {
                    "height": "20mm",
                },
            };
            const $date =moment().format("d-M-Y-h-mm-ss"); 
            
            const $filename ='UnpaidInvoice-'+$date+'.pdf';
            const $filePath = "public/Invoice/"+$filename+"";
           
            pdf.create(data, options).toFile($filePath, function (err, data) {
              if (err) {
                res.status(400).send({ error: err.message });
              } else {
                
                res.status(200).send({
                  "success":"File created successfully",
                  "filename":req.headers.host+'/'+$filePath
                });
              }
            });
          }
        }) */
        const $date = moment().format("DD-MM-Y-hh-mm-ss");
        const $filename = "UnpaidInvoice-" + $date + ".pdf";
        const $filePath = baseUrl + "/public/Invoice/" + $filename + "";

        const options = {
          format: "A4",
        };
        const html = await readFile("views/invoice-template.ejs", "utf8");
        const template = ejs.compile(html);
        const content = template({
          businessAccount: allPayments,
          payments: payments,
          moment: moment,
        });
        const buffer = await htmlPDF.create(content, options);
        res.attachment($filename);
        res.end(buffer);
      } else {
        res.status(200).send({ error: "Business not found" });
      }
    } else {
      res.status(404).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};
const updateBagUsed = async (bunsinessId, bags) => {
  let data = await BusinessAccount.findOne({ _id: bunsinessId });
  data.bagUsed = data.bagUsed + bags.number;
  await data.save();
};
const updateUsersBagPermisstion = async (id, bags) => {
  let data = await User.findOne({ _id: id });
  data.businessAccount.bagCount = data.businessAccount.bagCount + bags.number;
  await data.save();
};
const getPriceGroup = async (zipCode) => {
  let pricegropname, priceGname, pricegname;
  console.log(zipCode, "zipCode");
  const allTerritories = await Territory.find();
  if (allTerritories && allTerritories.length > 0) {
    territory_zip_code = allTerritories[0].zipCode;
    for (let obj of allTerritories) {
      if (obj.zipCode.includes(zipCode)) {
        pricegropname = obj.priceGroup.name;
        console.log(pricegropname, "888");
        pricegropname = pricegropname.split("");
      }
    }
  }
  if (pricegropname[0]) {
    pricegname = pricegropname[0];
    priceGname = await Pricegroup.findOne({
      name: { $regex: pricegname },
    });
    if (!priceGname) {
      priceGname = await Pricegroup.findOne({
        $and: [{ base_price: true }, { status: "Active" }],
      });
    }
    return priceGname;
  }
};

const getDiscount = async (priceGroup, bags, userId) => {
  let bagCondition, discount;
  bagCondition = priceGroup.products.filter(
    (prod) => prod.amountOfBags == bags
  );
  discount = bagCondition.length > 0 ? priceGroup.discount : 0;
  console.log(discount, "discount");
  if (bagCondition.length > 0) {
    if (priceGroup && priceGroup.limits.toLowerCase() == "unlimited") {
      discount = priceGroup.discount ? priceGroup.discount : 0;
      console.log(discount, "discount1");
    } else {
      let orderCount = await Order.find({ customer: ObjectID(userId) }).count();
      if (priceGroup && parseInt(priceGroup.limits) > orderCount) {
        console.log(discount, "discount2");
        discount = priceGroup.discount ? priceGroup.discount : 0;
      } else {
        discount = 0;
      }
    }
  }
  return discount;
};

const getAllPendingOrder = async (req, res) => {
  try {
    let pending_Orders = await Order.find({ status: "WAITING_FOR_HERO" });
    // pending_Orders = pending_Orders.filter((order)=>{
    //   if(order.hero&&order.hero.equals(req.id)){
    //     return order
    //   }
    //   if(!order.hero){
    //     return order
    //   }
    // })
    if (pending_Orders.length <= 0) {
      return res.status(200).send({ message: "pending orders are not found" });
    }
    return res.status(200).send({ pending_Orders });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports = {
  repeatOrder,
  createOrder,
  updateOrder,
  getOrder,
  getAllOrders,
  updateMultplOrder,
  getOrderHistory,
  updateOrderStatus,
  getPriceGroupDiscount,
  getPricePerBag,
  checkAddress,
  assignHero,
  exportUnpaidOrders,
  getAllPendingOrder,
};
