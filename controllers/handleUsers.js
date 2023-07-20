const User = require("../models/Users");
const axios = require("axios");
const bcrypt = require("bcrypt");
const { nodeEnv, messagebirdkey } = require("../config/appConfig");
const { otpSendHandler } = require("../services/otpHandler");
const { uploadImage, getImage, deleteImage } = require("../services/S3");
const fs = require("fs");
const util = require("util");
const deleteProperty = require("../utils/deleteProperty")
const unlinkFile = util.promisify(fs.unlink);
const { getAccessToken, getRefreshToken } = require("../utils/createJWT");
const mongoose = require("mongoose");
const ObjectID = mongoose.Types.ObjectId;
const { ObjectId } = require("mongodb");
const {
  sendEmailNotification,
  sendInAppNotification,
  sendSmsNotification,
} = require("../utils/sendNotifications");

const getUserById = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id }).select("-password -reset_password_otp -confirm_password");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400).send({ error: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const updateUser = async (req, res) => {
  try {
    let user;
    if (req.body) {
      user = await User.findById(req.params.id);

      if (req.body.email != user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        console.log("emailExists", emailExists);
        if (emailExists)
          return res.status(409).json({ message: "Email already registered" });
      }
      if (user) {
        user.name = req.body.name || user.name;
        user.dob = req.body.dob || user.dob;
        user.phone = req.body.phone != undefined ? req.body.phone : user.phone;
        user.email = req.body.email || user.email;
        user.address = req.body.address || user.address;

        const updatedData = await user.save();
        const newData = deleteProperty(updatedData, ["password"]);
        res.status(200).send(newData);
      } else {
        res.status(401);
        throw new Error("User not Found");
      }
    }
  } catch (error) {
    res.status(500).send({ error: "Something went wrong" });
    console.log(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    let user = await User.find({ _id: req.params.id });
    if (user && user.length > 0) {
      await User.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "User Deleted Successfully" });
    } else {
      res.status(500).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ error: "Something went wrong" });
    console.log(err);
  }
};

const deleteAddress = async (req, res) => {
  try {
    let _id = req.id;
    let address_id = req.params.id;
    if (!_id) return res.status(400).json({ error: "User not found" });
    let user = await User.find({ _id });
    if (user && user.length > 0) {
      let index = user[0].address.findIndex((item) => item._id == address_id);
      user[0].address.splice(index, 1);
      if (index != -1) {
        console.log(index);
        await User.updateOne(
          { _id },
          { $set: { address: user[0].address } },
          {
            new: true,
          }
        );
        res.status(200).json({ message: "User Address Deleted Successfully" });
      } else {
        res.status(200).json({ message: "No address found" });
      }
    } else {
      res.status(500).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ error: "Something went wrong" });
    console.log(err);
  }
};

const getUserDetail = async (userId, foreignKey) => {
  let user = await User.aggregate([
    { $match: { _id: ObjectID(userId) } },
    {
      $lookup: {
        from: "bussinesses",
        localField: "_id",
        foreignField: foreignKey,
        as: "BusinessAccDetail",
      },
    },
    { $unwind: { path: "$BusinessAccDetail" } },
  ]);
  user = user[0];
  if (user) {
    return user;
  }
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
  deleteAddress,
};
