// Set the connected Stripe Account to collect payments on behalf of that account
const { stripeTestSecretKey } = require("../config/appConfig");
const stripe = require("stripe")(stripeTestSecretKey);
const User = require("../models/Users");
const { stripeTestPublicKey } = require("../config/appConfig");
const {
  createCustomer,
  getCustomer,
} = require("../services/stripe");
// const Payment = require("../models/Payment");
const mongoose = require("mongoose");

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

const updateCustomerAccount = async (req, res) => { };

const publicKey = async (req, res) => {
  res.json({ publishableKey: stripeTestPublicKey });
};

const addCard = async (req, res) => {
  try {
    //let { token } = req.body;
    // const token = await createToken()
    const user = await User.findOne({ _id: req.id });
    // const metadata = { _id: req.id };
    const { stripeCustomerId, paymentMethod } = user;
    if (user.address == "" || user.address == undefined) {
      return res
        .status(400)
        .send({ message: "Address is necessary for adding a card." });
    }

    // const customer = await getCustomer(user.stripeCustomerId);
    // const card = await stripe.customers.createSource(stripeCustomerId, {
    //   source: token.id,
    // });
    paymentMethod.push({
      cardNumber: req.body.last4,
      expiry: `${req.body.exp_month}/${req.body.exp_year}`,
      methodId: req.body.card_id,
      brand: req.body.brand,
    });
    user.paymentMethod = paymentMethod;
    user.save();
    res.send({ message: "Card added successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
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

module.exports = {
  publicKey,
  createCustomerAccount,
  getCustomerAccount,
  updateCustomerAccount,
  addCard,
  deleteCard,
};
