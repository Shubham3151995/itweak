const User = require("../models/Users");
const Order = require("../models/Orders");
const Content = require("../models/Content");
const Territory = require("../models/Territory");
const Agora = require("agora-token");
const axios = require("axios");
const BusinessAccount = require("../models/BusinessAccount");
const bcrypt = require("bcrypt");
const { nodeEnv, messagebirdkey } = require("../config/appConfig");
const { otpSendHandler } = require("../services/otpHandler");
const { uploadImage, getImage, deleteImage } = require("../services/S3");
const NodeGeocoder = require("node-geocoder");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const fs = require("fs");
const util = require("util");
const deleteProperty = require("../utils/deleteProperty");
const unlinkFile = util.promisify(fs.unlink);
const Hero = require("../models/Heros");
const { getAccessToken, getRefreshToken } = require("../utils/createJWT");
const mongoose = require("mongoose");
const ObjectID = mongoose.Types.ObjectId;
const { ObjectId } = require("mongodb");
const Rating = require("../models/Ratings");
const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);
const template = require("./handleTemplates");

const {
  sendEmailNotification,
  sendInAppNotification,
  sendSmsNotification,
} = require("../utils/sendNotifications");
const Heros = require("../models/Heros");

const getAllUsers = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const user = await User.find({
        $or: [
          { "verification.emailVerified": true },
          { "verification.phoneVerified": true },
        ],
      }).select("-password -otp");
      let order_detail;
      if (user && user.length > 0) {
        for (let obj of user) {
          if (obj.role == "CONSUMER") {
            order_detail = await Order.find({ customer: obj._id });
            obj.totalOrders = order_detail.length;
          } else if (obj.role == "LAUNDRY_HERO") {
            order_detail = await Order.find({ hero: obj._id });
            obj.totalOrders = order_detail.length;
          } else {
            obj.totalOrders = 0;
          }
        }
        res.status(200).json(user);
      } else {
        res.send(404).send({ error: "No user found" });
      }
    } else {
      res.send(400).send({ error: "Administrator access required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const getUserById = async (req, res) => {
  try {
    let userId;
    let isMember = req.query.member;
    if (req.role === "ADMINISTRATOR" || isMember) {
      console.log("true");
      userId = req.params.id;
      console.log(userId, "true");
    } else {
      userId = req.id;
    }
    let user;
    const busnssAccOwner = await BusinessAccount.findOne({
      userId,
      role: "OWNER",
    });
    let foreignKy;
    if (busnssAccOwner) {
      foreignKy = "userId";
      user = await getUserDetail(userId, foreignKy);
      if (!user) return res.status(200).send({ message: "user not found" });
    } else {
      user = await User.findOne({ _id: userId }).select("-password -otp");
      if (user.isBusinessMember == true) {
        foreignKy = "members.Id";
        user = await getUserDetail(userId, foreignKy);
        if (!user) return res.status(200).send({ message: "user not found" });
      }
    }
    // if (user.role === "LAUNDRY_HERO")
    //   await user.strictPopulate([
    //     { path: "hero", select: "heroStatus status" },
    //   ]);
    const hero_rating = await Rating.find({ ratedTo: userId });
    let sum = 0;
    let hero_avg_rating;
    if (hero_rating && hero_rating.length > 0) {
      hero_rating.map((items) => {
        sum = sum + items.AvgRating;
      });
      let total_ratings = hero_rating.length;
      hero_avg_rating = sum / total_ratings;
      user.hero_avg_rating = Math.round(hero_avg_rating);
    } else {
      user.hero_avg_rating = 0;
    }
    user.paymentMethod = user.paymentMethod.filter(
      (element) => element !== null
    );
    if (user && user.paymentMethod && user.paymentMethod.length > 0) {
      let defaultStatus = true;
      for (let methdod of user.paymentMethod) {
        if (methdod?.defaultCard == true) {
          defaultStatus = false;
        }
      }
      if (defaultStatus) {
        await User.updateOne(
          { _id: req.id, "paymentMethod._id": user.paymentMethod[0]._id },
          {
            $set: { "paymentMethod.$.defaultCard": true },
          },
          {
            upsert: true,
          }
        );
      }
    }
    if (user) {
      /*need to check with Kajal*/ // getImage(user.profilePicture.public_id).pipe(res);

      // user = await User.findOne({ _id: userId }).select("-password -otp");
      res.status(200).json(user);
      // To call image from the AwS Server
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

const updateContact = async (req, res) => {
  try {
    let user = await User.findById(req.id);

    // console.log(req.body.phoneOTP, req.body.emailOTP);

    if (user) {
      // If user is only sending email and/or phone
      if (!req.body.phoneOTP && !req.body.emailOTP) {
        const { email, phone } = req.body;
        if (email) {
          user.tempInfo.email = email;
          const otp = await otpSendHandler("email", email);
          user.otp.emailOTP = otp;
        }
        if (phone) {
          user.tempInfo.phone = req.body.phone || user.tempInfo.phone;
          const otp = await otpSendHandler("phone", phone);
          user.otp.phoneOTP = otp;
        }
        await user.save();
        res.json({ message: "OTP has been sent to your email / phone" });
      } else {
        // If user is sending otp
        const { phoneOTP, emailOTP } = req.body;

        let userData;
        if (phoneOTP) {
          if (Number(phoneOTP) === Number(user.otp.phoneOTP)) {
            user.phone = user.tempInfo.phone;
            // user.tempInfo.phone = null;
            user.otp.phoneOTP = null;
            userData = user.phone;
          }
        }
        if (emailOTP) {
          if (Number(emailOTP) === Number(user.otp.emailOTP)) {
            user.email = user.tempInfo.email;
            // user.tempInfo.email = null;
            user.otp.emailOTP = null;
            userData = user.email;
          }
        }

        const savedUser = await user.save();
        // Set Refresh Token to http cookie

        const refreshToken = getRefreshToken(userData, savedUser.role);

        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          sameSite: "none",
          secure: nodeEnv !== "development",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({ refreshToken });
      }
    } else {
      res.status(401);
      throw new Error("User not Found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
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
const handleRole = async (req, res) => {
  try {
    const role = req.body;
    const userId = req.params.id;
    const checkUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: role,
      },
      { new: true }
    );

    if (checkUser.role === "LAUNDRY_HERO") {
      let checkHero = await Hero.findOne({ email: checkUser.email });
      if (!checkHero) {
        const hero = new Hero({
          userId: checkUser?._id.toHexString(),
          verified: false,
          heroStatus: "NONE",
          email: checkUser?.email,
          availability: [
            {
              day: "Monday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Tuesday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Wednesday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Thursday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Friday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Saturday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Sunday",
              from: "800",
              to: "2300",
              bags: 1,
            },
          ],
        });

        await hero.save();
      }
    }
    if (checkUser.email) {
      userContact = checkUser.email;
    } else {
      checkUser = checkUser.phone;
    }
    const accessToken = getAccessToken(
      userContact,
      checkUser.role,
      checkUser._id
    );
    const refreshToken = getRefreshToken(userContact, checkUser.role);

    res.status(200).json({ accessToken, refreshToken, checkUser });
  } catch (error) {
    console.log(error);
  }
};

const getContentPages = async (req, res) => {
  try {
    {
      const allContent = await Content.find();
      res.status(200).send(allContent);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const getUsersList = async (req, res) => {
  try {
    let userId;
    let user = req.query.type;
    //if (req.role === "ADMINISTRATOR") {
    userId = req.id;
    // } else {
    //   res.status(400).send({ msg: "only admin can access user list" });
    // }

    if (user == "consumer") {
      user = await User.find({
        _id: { $ne: userId },
        role: "CONSUMER",
        status: "ACTIVE",
        $or: [
          { "verification.emailVerified": true },
          { "verification.phoneVerified": true },
        ],
        isBusinessMember: false,
        businessOwner: false,
      });
    }
    if (user == "hero") {
      user = await Hero.aggregate([
        { $match: { _id: { $ne: userId } } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user" } },
        { $match: { "user.businessAccountOwner": { $exists: false } } },
      ]);
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const getTerritoryStatus = async (req, res) => {
  try {
    let name = req.params.name.toLowerCase();
    let user = await User.findById(req.id);
    let status = false;
    let response;
    if (user) {
      let territory = await Territory.findOne({ name });
      if (territory) {
        status = true;
        return res.status(200).json({ response: status });
      } else {
        return res.status(200).json({ response: status });
      }
    } else {
      res.status(400).send({ msg: "user is not present " });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const favoriteHerosAdd = async (req, res) => {
  try {
    if (req.role === "CONSUMER") {
      console.log("inside");
      const heroId = req.params.id;
      let user = await User.findById({ _id: req.id });
      let checkHero = user.favoriteHeros.filter((hero) => hero == heroId);
      if (checkHero.length > 0)
        return res
          .status(400)
          .send({ message: "This Hero is already in your Favorite Hero list" });
      user.favoriteHeros = user.favoriteHeros.concat(heroId);
      const userData = await user.save();
      if (userData) {
        res.status(200).send(userData);
      } else {
        res.status(400).send("Something went wrong");
      }
    } else {
      res.status(400).send({ error: "consumer Permission required" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};
const favoriteHerosDelete = async (req, res) => {
  try {
    if (req.role === "CONSUMER") {
      const heroId = req.params.id;
      let user = await User.updateOne(
        { _id: req.id },
        {
          $pull: {
            favoriteHeros: heroId,
          },
        }
      );
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(400).send("Somthing went wrong");
      }
    } else {
      res.status(400).send({ error: "Consumer Permission required" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};
const favoriteHerosList = async (req, res) => {
  try {
    if (req.role === "CONSUMER") {
      let user_data = await User.aggregate([
        {
          $match: {
            _id: req.id,
          },
        },
        {
          $lookup: {
            from: "heros",
            localField: "favoriteHeros",
            foreignField: "userId",
            as: "heroData",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "heroData.userId",
            foreignField: "_id",
            as: "user",
          },
        },
      ]);
      // return res.status(200).send(user);
      let latestOrder;
      for (item of user_data[0].heroData) {
        latestOrder = await Order.find({
          customer: ObjectId(req.id),
          hero: ObjectId(item.userId),
          status: "DELIVERED",
        }).sort({ orderDeliveredDate: -1 });
        console.log(latestOrder, "latestOrder");
        latestOrder =
          latestOrder[0] && latestOrder[0].orderDeliveredDate
            ? latestOrder[0].orderDeliveredDate
            : "";
        item.latestOrder = latestOrder;
      }
      if (user_data[0].heroData.length == user_data[0].user.length) {
        for (let item of user_data[0].heroData) {
          for (let obj of user_data[0].user) {
            if (obj._id.equals(item.userId)) {
              obj.availabilityStatus = item.availabilityStatus;
            }
          }
        }
      }
      if (user_data) {
        res.status(200).send(user_data[0]);
      } else {
        res.status(200).send("consumer is not present");
      }
    } else {
      res.status(200).send("Only consumer can see his favorite heros");
    }
  } catch (err) {
    console.log("333");
    res.status(400).send(err);
  }
};

const getAllTemplates = async (req, res) => {
  try {
    const queryParams = {
      generations: "legacy",
      page_size: 18,
    };

    const request = {
      url: `http://localhost:3000/user/getAllTemplates`,
      method: "GET",
      qs: queryParams,
    };

    client
      .request(request)
      .then(([response, body]) => {
        console.log("res", response.statusCode);
        console.log("resbody", response.body);
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (err) {
    console.log("333");
    res.status(400).send(err);
  }
};
const defaultCardStatus = async (req, res) => {
  try {
    let id = req.id;
    let businessAcc = req.query.accountId;
    const cardId = req.params.cardId;
    if (!cardId) return res.status(400).send({ error: "cardId is required" });
    let user, key;
    if (businessAcc) {
      key = "paymentInfo";
      user = await BusinessAccount.findOne({ _id: businessAcc });
    } else {
      key = "paymentMethod";
      user = await User.findOne({ _id: req.id });
    }
    if (!user)
      return res
        .status(400)
        .send({ error: "User or Business account not found" });
    if (user && user[key].length && user[key].length > 0) {
      user[key] = user[key].map((method) => {
        if (method.methodId == cardId) {
          method.defaultCard = true;
          return method;
        } else {
          method.defaultCard = false;
          return method;
        }
      });
    }
    user = await user.save();
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(400).send("Somthing went wrong");
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

// const getAgoraToken = async (req, res) => {
//   const appID = AGORA_APP_ID;
//   const appCertificate = AGORA_APP_CERTIFICATE;
//   const expirationTimeInSeconds = 86400;
//   const currentTimestamp = Math.floor(Date.now() / 1000);
//   const expirationTimestamp = (
//     currentTimestamp + expirationTimeInSeconds
//   ).toString();
//   let userwithoutEmail;
//   let user = await User.findOne({ _id: req.id });
//   let userEmailName =user && user.email && user.email.substring(0, user.email.lastIndexOf("@"));
//   console.log(userEmailName,"@@@")
//   if (user && user.phone)
//     userwithoutEmail = (Math.random() + 1).toString(36).substring(5);
//   if (!user)
//     return res.status(400).send({
//       status: "failed",
//       message: "This user is not present in the DB",
//     });

//   try {
//     if (user && user.agora_uuid && user.agora_username && user.agora_nickname) {
//       const token = Agora.ChatTokenBuilder.buildUserToken(
//         appID,
//         appCertificate,
//         user.agora_uuid,
//         expirationTimestamp
//       );
//       if (token) {
//         return res.status(200).send({
//           status: "sucess",
//           token: token,
//           userId: user.agora_username,
//           uuid: user.agora_uuid,
//         });
//       } else {
//         return res
//           .status(400)
//           .send({ status: "failed", message: "Somthing went wrong" });
//       }
//     } else {
//       let userDetail = {};
//       userDetail["username"] =
//         user.firstName || userEmailName || userwithoutEmail;
//       userDetail["password"] = (Math.random() + 1).toString(36).substring(5);
//       userDetail["nickname"] = userDetail.username;
//       const result = await userToken(
//         appID,
//         appCertificate,
//         expirationTimestamp,
//         userDetail
//       );
//       if (result && result.data) {
//         user.agora_uuid = result.data.uuid;
//         user.agora_nickname = result.data.nickname;
//         user.agora_username = result.data.username;
//         await user.save();
//       }
//       return res.status(200).send({
//         status: "sucess",
//         token: result.token,
//         userId: result.data.username,
//         uuid: result.data.uuid,
//       });
//     }
//   } catch (err) {
//     res.status(400).send(err);
//   }
// };

const getAgoraToken = async (req, res) => {
  const appID = AGORA_APP_ID;
  const appCertificate = AGORA_APP_CERTIFICATE;
  const expirationTimeInSeconds = 86400;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = (
    currentTimestamp + expirationTimeInSeconds
  ).toString();
  let userwithoutEmail;
  let user = await User.findOne({ _id: req.id });
  let userEmailName =
    user && user.email && user.email.substring(0, user.email.lastIndexOf("@"));
  if (user && user.phone)
    userwithoutEmail = (Math.random() + 1).toString(36).substring(5);
  if (!user)
    return res.status(400).send({
      status: "failed",
      message: "This user is not present in the DB",
    });

  try {
    if (user && user.agora_uuid && user.agora_username && user.agora_nickname) {
      const token = Agora.ChatTokenBuilder.buildUserToken(
        appID,
        appCertificate,
        user.agora_uuid,
        expirationTimestamp
      );
      if (token) {
        return res.status(200).send({
          status: "success",
          token: token,
          userId: user.agora_username,
          uuid: user.agora_uuid,
        });
      } else {
        return res
          .status(400)
          .send({ status: "failed", message: "Somthing went wrong" });
      }
    } else {
      let userName;
      let userDetail = {},
        adminAgroDetail;
      if (user.firstName) {
        userName = user.firstName + Math.random().toString(36).substring(2, 7);
      }
      userDetail["username"] = userEmailName || userName || userwithoutEmail;
      userDetail["password"] = (Math.random() + 1).toString(36).substring(5);
      userDetail["nickname"] = userDetail.username;
      if (req.role == "ADMINISTRATOR") {
        adminAgroDetail = await User.find({
          role: "ADMINISTRATOR",
          agora_uuid: { $exists: true },
          agora_username: { $exists: true },
        });
        if (adminAgroDetail.length > 0) {
          userDetail.username = adminAgroDetail[0].agora_username;
          userDetail.password = adminAgroDetail[0].agora_password;
          userDetail.nickname = adminAgroDetail[0].agora_nickname;
          let data = await User.updateMany(
            { role: "ADMINISTRATOR" },
            {
              $set: {
                agora_uuid: adminAgroDetail[0].agora_uuid,
                agora_username: adminAgroDetail[0].agora_username,
                agora_nickname: adminAgroDetail[0].agora_nickname,
              },
            },
            { multi: true }
          );
          if (data) {
            return res.status(200).send({
              status: "success",
              userId: adminAgroDetail[0].agora_username,
              uuid: adminAgroDetail[0].agora_uuid,
            });
          }
        }
      }
      const result = await userToken(
        appID,
        appCertificate,
        expirationTimestamp,
        userDetail
      );
      if (result && result.data) {
        user.agora_uuid = result.data.uuid;
        user.agora_nickname = result.data.nickname;
        user.agora_username = result.data.username;
        user.agora_password = userDetail.password;
        await user.save();
      }
      return res.status(200).send({
        status: "success",
        token: result.token,
        userId: result.data.username,
        uuid: result.data.uuid,
      });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

const userToken = async (
  appID,
  appCertificate,
  expirationTimestamp,
  userData
) => {
  try {
    const appKey = process.env.AGORA_APP_Key;
    const appkey2 = process.env.AGORA_APP_Key2;
    const genAppToken = Agora.ChatTokenBuilder.buildAppToken(
      appID,
      appCertificate,
      expirationTimestamp
    );
    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${genAppToken}`,
      },
    };
    const uri = `https://a41.chat.agora.io/${appKey}/${appkey2}/users`;
    const response = await axios.post(uri, userData, options);
    if (response && response.data) {
      const uuid = response.data.entities[0].uuid;
      const nickName = response.data.entities[0].nickname;
      const userName = response.data.entities[0].username;
      const data = {
        uuid: uuid,
        nickname: nickName,
        username: userName,
      };
      const token = Agora.ChatTokenBuilder.buildUserToken(
        appID,
        appCertificate,
        uuid,
        expirationTimestamp
      );
      if (token) {
        let result = {
          token: token,
          data: data,
        };
        return result;
      }
    }
  } catch (err) {
    console.log(err, "error");
    res.status(400).send(err);
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
  getUsersList,
  getAllUsers,
  getUserById,
  updateUser,
  updateContact,
  deleteUser,
  handleRole,
  getContentPages,
  getTerritoryStatus,
  favoriteHerosAdd,
  favoriteHerosDelete,
  favoriteHerosList,
  deleteAddress,
  getAllTemplates,
  defaultCardStatus,
  getAgoraToken,
};
