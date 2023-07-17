// Set the connected Stripe Account to collect payments on behalf of that account
const { stripeTestSecretKey } = require("../config/appConfig");
const stripe = require("stripe")(stripeTestSecretKey);
const { promoCodeValidate } = require("../services/promoCodeValidate");
const User = require("../models/Users");
const businessSchema = require("../models/BusinessAccount");
const HeroSchema = require("../models/Heros");
const { stripeTestPublicKey } = require("../config/appConfig");
const {
  createCustomer,
  getCustomer,
  getPaymentMethods,
  payoutFunc,
  createBankAccount,
  getBankAccounts,
  updateStripeAccount,
} = require("../services/stripe");
const { savePayment } = require("../services/savePayment");
const { savePayout } = require("../services/savePayout");
const Order = require("../models/Orders");
const Payment = require("../models/Payment");
const Payout = require("../models/Payout");
const mongoose = require("mongoose");
const { castObject } = require("../models/BusinessAccount");
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   apiVersion: '2020-08-27',
//   typescript: true,
// });
const {
  sendEmailNotification,
  sendInAppNotification,
  sendSmsNotification,
} = require("../utils/sendNotifications");
const template = require("./handleTemplates");

const createCustomerAccount = async (req, res) => {
  try {
    if (req.role === "LAUNDRY_HERO") {
      return res.status(400).send({ error: "API not allowed for Hero" });
    }
    const user = await User.findOne({ _id: req.id });
    const { email, address } = user;
    const metadata = { _id: req.id };
    // if (!email || !firstName) {
    //   return res
    //     .status(400)
    //     .send({ message: "Email and First Name is required" });
    // }
    let stripeCustomerId = user.stripeCustomerId;
    let customer;
    if (stripeCustomerId) {
      customer = await getCustomer(stripeCustomerId);
      if (customer) {
        return res.send({ message: "Customer already exists", customer });
      }
    } else {
      customer = await createCustomer({
        name: address[0].name,
        email: email ? email : "",
        address: {
          city: address[0].city,
          line1: `Street Name - ${address[0].streetName}, Street No - ${address[0].streetNumber}`,
          country: "US",
          postal_code: address[0].zipCode,
        },
        metadata,
      });
      const { id } = customer;
      user.stripeCustomerId = id;
      user.save();
      res.send(customer);
    }
  } catch (error) {
    console.log("error", error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const getCustomerAccount = async (req, res) => {
  try {
    let customerId;
    customerId = req.id;
    if (req.role === "ADMINISTRATOR") {
      customerId = req.params.id;
    }
    const user = await User.findOne({ _id: customerId });
    if (user.stripeCustomerId) {
      const customer = await getCustomer(stripeCustomerId);
      res.send(customer);
    } else {
      res.status(400).send("User Account doesn't exist");
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
};

const updateCustomerAccount = async (req, res) => {};

const publicKey = async (req, res) => {
  res.json({ publishableKey: stripeTestPublicKey });
};

const addCard = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ _id: req.id });
    const metadata = { _id: req.id };
    const { stripeCustomerId, address, email, paymentMethod, firstName } = user;
    if (!stripeCustomerId) {
      if (address.length < 1) {
        return res
          .status(400)
          .send({ message: "Address is necessary for adding a card." });
      }
      let newCutomer = await createCustomer({
        name: firstName ? firstName : "",
        email: email ? email : "",
        address: {
          city: address[0].city,
          line1: `Street Name - ${address[0].streetName}, Street No - ${address[0].streetNumber}`,
          country: "US",
          postal_code: address[0].zipCode,
        },
        metadata,
      });
      const { id } = newCutomer;
      user.stripeCustomerId = id;
    }
    const customer = await getCustomer(user.stripeCustomerId);
    const card = await stripe.customers.createSource(customer.id, {
      source: token.id,
    });
    if (req.query.busninessId) {
      let card_name = token && token.card && token.card.name;
      let card_phone = token && token.card && token.card.phone;
      let card_payment_method =
        token && token.card && token.card.payment_method;
      const bussAccount = await businessSchema.findOne({
        _id: req.query.busninessId,
      });
      if (!bussAccount)
        return res
          .status(400)
          .send({ error: "Business account is not present" });
      bussAccount.paymentInfo.push({
        name: card_name ? card_name : "",
        phone: card_phone ? card_phone : "",
        payment_method: card_payment_method ? card_payment_method : "",
        cardNumber: card.last4,
        expiry: `${card.exp_month}/${card.exp_year}`,
        methodId: card.id,
        brand: card.brand,
      });
      let data = await bussAccount.save();
      if (card && data) {
        return res.send({ card });
      } else {
        return res.status(400).send({ error: "something went wrong" });
      }
    }
    paymentMethod.push({
      cardNumber: card.last4,
      expiry: `${card.exp_month}/${card.exp_year}`,
      methodId: card.id,
      brand: card.brand,
    });
    user.paymentMethod = paymentMethod;
    console.log(user.paymentMethod);
    user.save();
    res.send({ card });
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
};

const pay = async (req, res) => {
  try {
    let { orderId, paymentMethod } = req.body;
    let userId, memebrId;
    memebrId = req.query.memberId;
    if (memebrId) {
      userId = memebrId;
    } else {
      userId = req.id;
    }
    const order = await Order.findOne({ _id: orderId });
    const { stripeCustomerId, firstName } = await User.findOne({
      _id: userId,
    });

    if (!paymentMethod) {
      const allPaymentMethods = await getPaymentMethods(stripeCustomerId);
      paymentMethod = allPaymentMethods.data[0].id;
    }
    if (order.status === "PAYMENT_PENDING") {
      if (order.customer.equals(userId) || memebrId) {
        // const intent = await setupIntent(stripeCustomerId)
        let totalAmmount = order.subTotal.toFixed(2);
        // return res.status(200).send({totalAmmount})
        let discount = order && order.discount ? order.discount : 0;
        let tip = order && order.tip ? order.tip : 0;
        let plateformFee =
          order && order.platformFee ? Math.round(order.platformFee) : 0;
        let paymentIntent = await paymentIntentFun(
          totalAmmount,
          stripeCustomerId,
          paymentMethod
        );
        // console.log(paymentIntent, "paymentIntent");
        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount: totalAmmount * 100,
        //   currency: "usd",
        //   customer: stripeCustomerId,
        //   payment_method: paymentMethod,
        //   // off_session: true,
        //   confirm: true,
        //   description: "Laundry",
        // });
        if (paymentIntent && paymentIntent.id) {
          order.status = "WAITING_FOR_HERO";
          order.transactionDetails = {
            transactionId: paymentIntent.id,
            paymentGateway: "stripe",
            transactionAmount: paymentIntent.amount / 100,
            paymentStatus: paymentIntent.status,
          };
        }
        let status, paymentAmount;
        if (paymentIntent && paymentIntent.id) {
          status = "PROCESSED";
          paymentAmount = paymentIntent.amount / 100;
        } else {
          order.status = "PAYMENT_PENDING";
          status = "PENDING";
          paymentAmount = totalAmmount;
        }
        const payment_data = await savePayment(
          order._id,
          order.customer,
          status,
          "stripe",
          paymentAmount,
          0,
          plateformFee,
          discount,
          tip,
          paymentMethod,
          order.promoCodeDiscount,
          order.bags
        );
        const savedOrder = await order.save();
        if (status == "PROCESSED") {
          let template_data = await template.getTemplate({
            templateType: "PAYMENT_RECEIVED",
          });
          let templateId;
          if (
            template_data &&
            template_data.length > 0 &&
            template_data[0].status == true
          ) {
            templateId = template_data[0].template_id;
            let link = `https://laundryadmin.freshify.io/orders-and-deliveries/${orderId}`;
            let data = {
              email: "tech@laundryhero.co",
              transaction_amount: paymentAmount,
              transaction_id: payment_data._id,
              firstName: firstName,
              link: link,
            };
            let msg = "";
            sendEmailNotification(data, msg, templateId);
          }
        }
        res.send(savedOrder);
      }
    } else {
      res.status(400).send({ error: "Error in order data" });
    }
  } catch (err) {
    console.log("error", err);
    res.status(500).send({ error: err.message });
  }
};

const paymentIntentFun = async (
  totalAmmount,
  stripeCustomerId,
  paymentMethod
) => {
  let result = {},
    paymentDetail;
  try {
    paymentDetail = await stripe.paymentIntents.create({
      amount: totalAmmount * 100,
      currency: "usd",
      customer: stripeCustomerId,
      payment_method: paymentMethod,
      // off_session: true,
      confirm: true,
      description: "Laundry",
    });
    return (result.payment = paymentDetail);
  } catch (e) {
    console.log(e, "false");
    if (e.statusCode !== 200) {
      result["status"] = false;
      return result;
    }
  }
};

const createHeroBankAccount = async (req, res) => {
  try {
    const {
      accountHolderName,
      accountHolderType,
      routingNumber,
      accountNumber,
    } = req.body;
    const hero = await HeroSchema.findOne({
      userId: req.id,
    });
    if (!hero) {
      return res.status(404).send({ message: "Hero not found" });
    }
    if (!hero.stripeAccountId) {
      return res.status(400).send({ message: "Bad account" });
    }
    if (!["individual", "company"].includes(accountHolderType)) {
      return res.status(400).send({
        message:
          "Account Holder Type should be either 'individual' or 'company'",
      });
    }
    const bankAccount = await createBankAccount({
      connectAccountId: hero.stripeAccountId,
      accountHolderName,
      accountHolderType,
      routingNumber,
      accountNumber,
    });
    res.status(200).send(bankAccount);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
};
const addDebitCard = async (req, res) => {
  try {
    const { token } = req.body;
    const hero = await HeroSchema.findOne({
      userId: req.id,
    });
    if (!hero) {
      return res.status(404).send({ message: "Hero not found" });
    }
    if (!hero.stripeAccountId) {
      return res.status(400).send({ message: "Bad account" });
    }
    const user = await User.findOne({ _id: req.id });
    // if (user.paymentMethod.length) {
    //   return res
    //     .status(400)
    //     .send({ message: "yor are not allowed to add more then one card" });
    // }
    const card = await stripe.accounts.createExternalAccount(
      hero.stripeAccountId,
      { external_account: token.id }
    );
    if (card) {
      user &&
        user.paymentMethod &&
        user.paymentMethod.push({
          cardNumber: card.last4,
          expiry: `${card.exp_month}/${card.exp_year}`,
          methodId: card.id,
          brand: card.brand,
        });
      user.save();
    }
    res.status(200).send(card);
  } catch (error) {
    res.status(500).send({ error: "Something went wrong" });
  }
};

const payout = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      let { orderId } = req.body;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order.status === "DELIVERED" || order.status === "COMPLETED") {
          if (order.hero && order.payoutStatus !== "DONE") {
            const hero = await HeroSchema.findOne({
              userId: order.hero,
            });
            if (hero.stripeAccountId) {
              let data = await payoutFunc(
                Number(order.subTotal) - Number(order.plateformFee || 0),
                hero?.stripeAccountId
              );
              console.log(data, "data");
              if (data) {
                await savePayout(
                  order._id,
                  order.hero,
                  "PROCESSED",
                  data.amount,
                  order.plateformFee
                );
                await Order.findOneAndUpdate(
                  { _id: order._id },
                  { payoutStatus: "DONE" }
                );
                res.status(400).send("Payout Done");
              }
            } else {
              res.status(400).send("Hero Does not have stripe Account");
            }
          } else {
            res
              .status(400)
              .send("Hero is not assign to order or payout is already done");
          }
        } else {
          res.status(400).send("Order is not complete yet");
        }
      } else {
        res.status(400).send("OrdersId is required");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: error.message });
  }
};
const getPayments = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const page = req.query.page ? req.query.page : 1;
      const limit = req.query.limit ? req.query.limit : 10;

      let allPayments;
      let total_transactions = [];
      let totalPayments = 0;
      let totalStripePayment = 0;
      let totalApplePayment = 0;
      let totalGooglePayemnt = 0;
      // filter on the bases of transaction_id
      /*if (req.query.transaction_id != undefined) {
        allPayments = await Payment.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(req.query.transaction_id) } },
          { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerId' } },
        ]);
      } else if (req.query.status != undefined) {  // filter on the bases of transaction_status
        allPayments = await Payment.aggregate([
          { $match: { status: req.query.status } },
          { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerId' } },
          { $skip: parseInt(limit) * parseInt(page) },
          { $limit: parseInt(limit) }
        ]);
      } else if (req.query.orderId != undefined) {  // filter on the bases of order-id
        allPayments = await Payment.aggregate([
          { $match: { orderId: mongoose.Types.ObjectId(req.query.orderId) } },
          { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerId' } },
        ]);
      } else if (req.query.processor != undefined) {  // filter on the bases of processor
        allPayments = await Payment.aggregate([
          { $match: { processor: req.query.processor } },
          { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerId' } },
          { $skip: parseInt(limit) * parseInt(page) },
          { $limit: parseInt(limit) }
        ]);
      } else if (req.query.processor != undefined && req.query.status != undefined) {  // filter on the bases of processor
        allPayments = await Payment.aggregate([
          {
            $match: {
              $and: [
                { processor: req.query.processor },
                { status: req.query.status }
              ]
            }
          },
          { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerId' } },
          { $skip: parseInt(limit) * parseInt(page) },
          { $limit: parseInt(limit) }
        ]);
      } else {
        allPayments = await Payment.aggregate([
          { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerId' } },
          { $skip: parseInt(limit) * parseInt(page) },
          { $limit: parseInt(limit) }
        ]);
      }*/
      let filter = {};
      let filterQuery = 0;
      let customerSearch = {};
      let filter_arr = [];
      if (req.query.transaction_id != undefined) {
        filterQuery = 1;

        if (mongoose.Types.ObjectId.isValid(req.query.transaction_id)) {
          /* let transaction_id = {
            _id: mongoose.Types.ObjectId(req.query.transaction_id),
          }; */
          let transaction_id = {
            $or: [
              { _id: mongoose.Types.ObjectId(req.query.transaction_id) },
              { orderId: mongoose.Types.ObjectId(req.query.transaction_id) },
            ],
          };
          filter_arr.push(transaction_id);
        } else {
          customerSearch.firstName = {
            $regex: req.query.transaction_id,
            $options: "i",
          };
        }
      }
      if (req.query.status != undefined) {
        filterQuery = 1;
        let status = { status: req.query.status };
        filter_arr.push(status);
      }
      if (req.query.orderId != undefined) {
        filterQuery = 1;
        let orderId = { orderId: mongoose.Types.ObjectId(req.query.orderId) };
        filter_arr.push(orderId);
      }
      if (req.query.processor != undefined) {
        filterQuery = 1;
        let processor = { processor: req.query.processor };
        filter_arr.push(processor);
      }

      if (filterQuery === 1) {
        if (filter_arr.length > 0) {
          filter["$and"] = filter_arr;
        }
        total_transactions = await Payment.aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "users",
              pipeline: [{ $match: customerSearch }],
              localField: "customerId",
              foreignField: "_id",
              as: "customerId",
            },
          },
          {
            $match: { customerId: { $ne: [] } },
          },
        ]);

        if (total_transactions.length > 0) {
          for (var i = 0; i < total_transactions.length; i++) {
            totalPayments += total_transactions[i].amount;
            if (total_transactions[i].processor === "stripe") {
              totalStripePayment += total_transactions[i].amount;
            }
            if (total_transactions[i].processor === "apple") {
              totalApplePayment += total_transactions[i].amount;
            }
            if (total_transactions[i].processor === "google") {
              totalGooglePayemnt += total_transactions[i].amount;
            }
          }
        }

        allPayments = await Payment.aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "users",
              pipeline: [{ $match: customerSearch }],
              localField: "customerId",
              foreignField: "_id",
              as: "customerId",
            },
          },
          {
            $match: { customerId: { $ne: [] } },
          },
          {
            $unwind: {
              path: "$customerId",
              preserveNullAndEmptyArrays: true,
            },
          },
          { $skip: parseInt(limit) * parseInt(page - 1) },
          { $limit: parseInt(limit) },
        ]);
      } else {
        total_transactions = await Payment.find();

        if (total_transactions.length > 0) {
          for (var i = 0; i < total_transactions.length; i++) {
            totalPayments += total_transactions[i].amount;
            if (total_transactions[i].processor === "stripe") {
              totalStripePayment += total_transactions[i].amount;
            }
            if (total_transactions[i].processor === "apple") {
              totalApplePayment += total_transactions[i].amount;
            }
            if (total_transactions[i].processor === "google") {
              totalGooglePayemnt += total_transactions[i].amount;
            }
          }
        }

        allPayments = await Payment.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "customerId",
              foreignField: "_id",
              as: "customerId",
            },
          },
          {
            $unwind: {
              path: "$customerId",
              preserveNullAndEmptyArrays: true,
            },
          },
          { $skip: parseInt(limit) * parseInt(page - 1) },
          { $limit: parseInt(limit) },
        ]);
      }

      if (allPayments) {
        res.status(200).send({
          total_records: total_transactions.length,
          data: allPayments,
          totalPayments: totalPayments.toFixed(3),
          totalStripePayment: totalStripePayment.toFixed(3),
          totalApplePayment: totalApplePayment.toFixed(3),
          totalGooglePayemnt: totalGooglePayemnt.toFixed(3),
        });
      } else {
        res.status(200).send({ error: "payments not found" });
      }
    } else {
      res.status(404).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

const getCustomerPayments = async (req, res) => {
  try {
    if (req.role === "CONSUMER") {
      const customerPayments = await Payment.find({
        customerId: req.id,
      }).populate([
        {
          path: "orderId",
          select: "bags",
        },
      ]);
      if (customerPayments) {
        res.status(200).send(customerPayments);
      } else {
        res.status(200).send({ error: "promo codes not found" });
      }
    } else {
      res.status(404).send({ error: "Consumer Permission required" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};
const getPayouts = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;

    let allPayouts;
    let total_payouts = [];
    let totalPayoutAmount = 0;
    let totalPlateformFee = 0;
    if (req.role === "ADMINISTRATOR") {
      /*if (req.query.transaction_id != undefined) {
        allPayouts = await Payout.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(req.query.transaction_id) } }
        ]);
      }else if (req.query.orderId != undefined) {
        allPayouts = await Payout.aggregate([
          { $match: { orderId: mongoose.Types.ObjectId(req.query.orderId) }}
        ]);
      } else if (req.query.status != undefined) {  // filter on the bases of transaction_status
        allPayouts = await Payout.aggregate([
          { $match: { status: req.query.status } },
          { $skip: parseInt(limit) * parseInt(page) },
          { $limit: parseInt(limit) }
        ]);
      } else {
        allPayouts = await Payout.find();
      }*/
      let filter = {};
      let filterQuery = 0;
      let filter_arr = [];

      if (req.query.transaction_id != undefined) {
        filterQuery = 1;
        if (mongoose.Types.ObjectId.isValid(req.query.transaction_id)) {
          var transaction_id = {
            _id: mongoose.Types.ObjectId(req.query.transaction_id),
          };
        } else {
          var transaction_id = {
            "hero_data.hero_name": {
              $regex: req.query.transaction_id,
              $options: "i",
            },
          };
        }

        filter_arr.push(transaction_id);
      }
      if (req.query.status != undefined) {
        filterQuery = 1;
        let status = { status: req.query.status };
        filter_arr.push(status);
      }
      if (req.query.orderId != undefined) {
        filterQuery = 1;
        let orderId = { orderId: mongoose.Types.ObjectId(req.query.orderId) };
        filter_arr.push(orderId);
      }
      if (filterQuery === 1) {
        filter["$and"] = filter_arr;

        total_payouts = await Payout.aggregate([{ $match: filter }]);

        allPayouts = await Payout.aggregate([
          { $match: filter },
          { $skip: parseInt(limit) * parseInt(page - 1) },
          { $limit: parseInt(limit) },
        ]);

        if (total_payouts.length > 0) {
          for (var i = 0; i < total_payouts.length; i++) {
            totalPayoutAmount += total_payouts[i].payout_amount;
            totalPlateformFee += total_payouts[i].plateformFee;
          }
        }
      } else {
        total_payouts = await Payout.find();
        allPayouts = await Payout.aggregate([
          { $skip: parseInt(limit) * parseInt(page - 1) },
          { $limit: parseInt(limit) },
        ]);

        if (total_payouts.length > 0) {
          for (var i = 0; i < total_payouts.length; i++) {
            totalPayoutAmount += total_payouts[i].payout_amount;
            totalPlateformFee += total_payouts[i].plateformFee;
          }
        }
      }
      if (allPayouts) {
        res.status(200).send({
          total_records: total_payouts.length,
          data: allPayouts,
          totalPayoutAmount: totalPayoutAmount,
          totalPlateformFee: totalPlateformFee,
        });
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
const getHeroPayout = async (req, res) => {
  try {
    if (req.role === "LAUNDRY_HERO") {
      const heroPayouts = await Payout.find({ heroId: req.id });
      if (heroPayouts) {
        res.status(200).send(heroPayouts);
      } else {
        res.status(404).send({ error: "Hero not Found" });
      }
    } else {
      res.status(404).send({ error: "Hero Permission required" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};
const getHeroBankAccounts = async (req, res) => {
  try {
    const hero = await HeroSchema.findOne({
      userId: req.id,
    });
    if (!hero) {
      return res.status(404).send({ message: "Hero not found" });
    }
    if (!hero.stripeAccountId) {
      return res.status(400).send({ message: "Bad account" });
    }
    const bankAccounts = await getBankAccounts({
      connectAccountId: hero.stripeAccountId,
    });
    res.status(200).send(bankAccounts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
};
const getPayoutDetail = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const payout = await Payout.find({ _id: req.params.id });
      if (payout && payout.length > 0) {
        res.status(200).send(payout[0]);
      } else {
        res.status(404).send({ error: "payout not Found" });
      }
    } else {
      res.status(404).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};
const updateHeroStripeAccount = async (req, res) => {
  try {
    const { accountId } = req.body;

    const hero = await HeroSchema.findOne({
      userId: req.id,
    });
    if (!hero) {
      return res.status(404).send({ message: "Hero not found" });
    }
    if (!hero.stripeAccountId) {
      return res.status(400).send({ message: "Bad account" });
    }

    await updateStripeAccount(hero.stripeAccountId, accountId);
    res.status(200).send({ message: "Updated Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const deleteCard = async (req, res) => {
  try {
    // const user_id = req.id
    const user_id = req.id;
    const card_id = req.body.card_id;
    if (card_id != undefined || card_id == "") {
      const user = await User.findOne({ _id: user_id });
      if (user) {
        const paymentMethod = await stripe.paymentMethods.detach(card_id);
        let index = user.paymentMethod.findIndex(
          (item) => item.methodId == card_id
        );
        user.paymentMethod.splice(index, 1);
        if (index != -1) {
          await User.updateOne(
            { _id: user_id },
            { $set: { paymentMethod: user.paymentMethod } },
            {
              new: true,
            }
          );
          return res.status(200).send({ message: "Card deleted Successfully" });
        } else {
          return res.status(200).json({ message: "No card found" });
        }
      } else {
        return res
          .status(200)
          .send({ message: "Card not related to any user" });
      }
      // const paymentMethod = await stripe.paymentMethods.detach(card_id);
      //   res.status(200).send({ message: "Card deleted Successfully" });
    } else {
      return res.status(400).send({ message: "Please enter card details" });
    }
  } catch (e) {
    if (e.type == "StripeInvalidRequestError") {
      const obj = {
        message: e.raw.message,
        statusCode: e.statusCode,
      };
      return res.status(obj.statusCode).send(obj);
    }
  }
};
const deleteBusinessCard = async (req, res) => {
  try {
    // const user_id = req.id
    const businessId = req.params.businessId;
    const card_id = req.params.card_id;
    if (card_id != undefined || card_id == "") {
      const businessAccount = await businessSchema.findOne({ _id: businessId });
      if (businessAccount) {
        const paymentMethod = await stripe.paymentMethods.detach(card_id);
        businessAccount.paymentInfo =
          businessAccount &&
          businessAccount.paymentInfo.filter(
            (info) => info.methodId !== card_id
          );
        await businessAccount.save();
        res.status(200).send({ message: "Card deleted Successfully" });
      } else {
        res.status(200).send({ message: "Card not related to any user" });
      }
    } else {
      res.status(400).send({ message: "Please enter card details" });
    }
  } catch (e) {
    if (e.type == "StripeInvalidRequestError") {
      console.log("insidecatch");
      const obj = {
        message: e.raw.message,
        statusCode: e.statusCode,
      };
      res.status(obj.statusCode).send(obj);
    }
  }
};

const deleteHeroCard = async (req, res) => {
  try {
    const card_id = req.params.card_id;
    if (!card_id)
      return res.status(400).send({ message: "card detail is missing" });
    const hero = await HeroSchema.findOneAndUpdate({ userId: req.id }).populate(
      { path: "userId" }
    );
    if (!hero) {
      return res.status(404).send({ message: "user not found" });
    }
    if (
      hero.userId &&
      hero.userId.paymentMethod &&
      hero.userId.paymentMethod.length == 1
    )
      return res.status(400).send({
        message: "please add another account before deleting this account",
      });
    const deleted = await stripe.accounts.deleteExternalAccount(
      `${hero.stripeAccountId}`,
      `${card_id}`
    );
    if (!deleted)
      return res.status(400).send({ message: "Something went wrong" });
    const user = await User.findOne({ _id: req.id });
    if (!user)
      return res.status(400).send({ error: "user data is not present" });
    user.paymentMethod =
      user.paymentMethod &&
      user.paymentMethod.length > 1 &&
      user.paymentMethod.filter((method) => method.methodId !== card_id);
    let result = await user.save();
    if (!result) {
      return res.status(400).send({ message: "something went wrong" });
    }
    res.status(200).send({ message: "card removed Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
};
/**/
const getTotalPayment = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      let totalPayments,
        totalStripePayment,
        totalApplePayment,
        totalGooglePayemnt;
      let total_transactions = await Payment.aggregate([
        { $match: { status: "PROCESSED" } },
        {
          $group: {
            _id: "$processor",
            totalAmount: { $sum: "$amount" },
            totalDisccount: { $sum: "$discount" },
            totaltaxes: { $sum: "$taxes" },
            totalplateformFee: { $sum: "$plateformFee" },
          },
        },
      ]);
      if (total_transactions.length < 1)
        return res
          .status(200)
          .send({ status: "failed", message: "Transections are not found" });
      for (trans of total_transactions) {
        if (trans && trans._id == "stripe") {
          totalStripePayment =
            (trans && trans.totalAmount) +
            (trans && trans.totaltaxes) +
            (trans && trans.totalDisccount) +
            (trans && trans.totalplateformFee);
        }
        if (trans && trans._id == "apple") {
          totalApplePayment =
            (trans && trans.totalAmount) +
            (trans && trans.totaltaxes) +
            (trans && trans.totalDisccount) +
            (trans && trans.totalplateformFee);
        }
        if (trans && trans._id == "google") {
          totalGooglePayemnt =
            (trans && trans.totalAmount) +
            (trans && trans.totaltaxes) +
            (trans && trans.totalDisccount) +
            (trans && trans.totalplateformFee);
        }
      }
      totalPayments =
        (totalStripePayment ? totalStripePayment : 0) +
        (totalApplePayment ? totalApplePayment : 0) +
        (totalGooglePayemnt ? totalGooglePayemnt : 0);
      totalPayments = totalPayments ? totalPayments : 0;
      let data = {
        totalPayments,
        totalStripePayment,
        totalApplePayment,
        totalGooglePayemnt,
      };
      return res.status(200).send(data);
    } else {
      return res.status(404).send({ message: "Admin Permission required" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
};
const getPayoutDeatail = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      let data = await Payout.aggregate([
        { $match: { status: "OK_TO_PAY" } },
        {
          $group: {
            _id: "$processor",
            totalPayoutAmount: { $sum: "$payout_amount" },
            totalPlateformFee: { $sum: "$plateformFee" },
          },
        },
      ]);
      data = data[0];
      if (!data)
        return res
          .status(200)
          .send({ status: "failed", message: "Payouts are not found" });
      return res.status(200).send(data);
    } else {
      return res.status(404).send({ message: "Admin Permission required" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "Something went wrong" });
  }
};
module.exports = {
  publicKey,
  createCustomerAccount,
  getCustomerAccount,
  updateCustomerAccount,
  createHeroBankAccount,
  addCard,
  pay,
  payout,
  getPayments,
  getPayouts,
  getCustomerPayments,
  getHeroPayout,
  getHeroBankAccounts,
  addDebitCard,
  updateHeroStripeAccount,
  getPayoutDetail,
  deleteCard,
  deleteHeroCard,
  deleteBusinessCard,
  getTotalPayment,
  getPayoutDeatail,
};
