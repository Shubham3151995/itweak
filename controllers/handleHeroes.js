const User = require("../models/Users");
const Hero = require("../models/Heros");
const Order = require("../models/Orders");
const { stripeTestSecretKey } = require("../config/appConfig");
const stripe = require("stripe")(stripeTestSecretKey);
const uploadFile = require("../services/uploadFileService");
const { uploadImage, getImage, deleteImage } = require("../services/S3");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const NodeGeocoder = require("node-geocoder");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const template = require("./handleTemplates");
const { createConnectAccount } = require("../services/stripe");
const {
  sendEmailNotification,
  sendInAppNotification,
  sendSmsNotification,
} = require("../utils/sendNotifications");
const { NetworkContext } = require("twilio/lib/rest/supersim/v1/network");
const { getHeroPayout } = require("./handleTransaction");

const getAllHeroes = async (req, res) => {
  try {
    // Join both users and heros collections to get data
    const heroData = await Hero.find({ status: "ACTIVE" }).populate([
      { path: "userId", select: "-password -otp" },
    ]);
    res.status(200).json(heroData);
  } catch (err) {
    res.status(400).send(err);
  }
};

const getHeroById = async (req, res) => {
  try {
    console.log("insidethis");
    let heroId;

    if (req.role === "ADMINISTRATOR") {
      heroId = req.params.id;
    } else {
      heroId = req.id;
    }

    const herodetails = await Hero.find({ userId: heroId });
    const hero = await User.findOne({ _id: heroId });
    // if(req.role === "ADMINISTRATOR"){
    //   let order;
    //   order.Completed = await Order.find({hero:ObjectId(heroId),status:"DELIVERED"}).count();
    //   order.inprogress = await Order.find({hero:ObjectId(heroId),status:"DELIVERED"}).count()
    // }

    if (hero) {
      res.status(200).json({
        userdetails: hero,
        herodetails: herodetails[0],
      });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

const updateHero = async (req, res) => {
  try {
    let userId;
    const {
      dl,
      ssn,
      heroStatus,
      status,
      availability,
      dlImg,
      territory,
      firstName,
      lastName,
    } = req.body;
    userId = req.id.toHexString();
    let user = await User.findById(userId);
    if ((user && firstName) || lastName) {
      console.log("abc");
      user.firstName = firstName ? firstName : user.firstName;
      user.lastName = lastName ? lastName : user.lastName;
      user.save();
    }

    let hero;
    hero = await Hero.findOne({ userId });
    if (!hero) {
      const hero = new Hero({
        userId: user?._id.toHexString(),
        verified: false,
        heroStatus: "PENDING_VERIFICATION",
        email: user?.email,
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
    hero = await Hero.findOne({ userId });
    hero.dl = dl || hero.dl;
    hero.ssn = ssn || hero.ssn;
    hero.territory = territory || hero.territory || "";
    hero.heroStatus = heroStatus || hero.heroStatus;
    hero.status = status || hero.status;
    hero.availability = availability || hero.availability;
    hero.dlImg = dlImg || hero.dlImg;
    if (req.body.address) {
      const options = {
        provider: "google",

        // Optional depending on the providers
        // fetch: customFetchImplementation,
        apiKey: GOOGLE_MAPS_API_KEY, // for Mapquest, OpenCage, Google Premier
        formatter: null, // 'gpx', 'string', ...
      };

      const geocoder = NodeGeocoder(options);

      // Using callback ${req.body.address.streetNumber}${req.body.address.streetName}${req.body.address.zipCode}

      // console.log(res[0], "%%%%%%%%");
      let address = [];

      for (let item of req.body.address) {
        console.log("here");
        let addrs = {};
        const res = await geocoder.geocode(
          `${item.zipCode},${item.streetAddress}${item.city}`
        );
        addrs = item;
        addrs.latitude =
          res.length > 0 && res[0].latitude ? res[0].latitude : 0;
        addrs.longitude =
          res.length > 0 && res[0].longitude ? res[0].longitude : 0;
        address.push(addrs);
      }
      hero.address = address;
    }
    let heroData = await hero.save();
    hero = await Hero.findOne({ userId });
    user.address = hero.address;
    await user.save();
    return res.status(200).send({ heroData, message: "Details Saved" });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

const updateHeroAdmin = async (req, res) => {
  try {
    let dynamic_template_data = {};
    let template_data, templateId;

    if (req.role === "ADMINISTRATOR") {
      const { _id, heroStatus, dl, ssn, dlImg } = req.body;

      let existingHeroDetails = await Hero.findOne({ _id: _id });

      if (!existingHeroDetails)
        return res.status(400).send({ error: "This Hero is not present " });
      if (
        existingHeroDetails.heroStatus !== "VERIFIED" &&
        heroStatus === "VERIFIED"
      ) {
        // send hero Status Notification
        let user = await User.findOne({ _id: existingHeroDetails.userId });
        template_data = await template.getTemplate({
          templateType: "APPROVED_HERO_ACCOUNT",
        });

        let msg = {
          title: `Your Hero Status has been changed`,
          body: `<h6 style="margin-top:20px;margin-bottom:20px;padding:20px 0px;font-weight:400;text-align:center"> Hey ${
            user.firstName || "Hero"
          } <br><br></br></br> Delighted to inform you that your hero account with heroId: ${_id} has been verified. Now you can log in sendEmailNotificationand start reaching out to consumers and pick up orders. <br><br></br></br><i>For any further query, contact our support team.</i> <br><br></br></br> Thanks <br><br></br></br> Have a Great Day!</h6>`,
        };
        if (
          template_data &&
          template_data.length > 0 &&
          template_data[0].status == true
        ) {
          templateId = template_data[0].template_id;
          if (user.notification.email == true) {
            user.user_status = "VERIFIED";
            sendEmailNotification(user, msg, templateId);
          }
        }
      }
      if (
        existingHeroDetails.heroStatus !== "VERIFIED" &&
        heroStatus === "NONE" &&
        existingHeroDetails.heroStatus != heroStatus
      ) {
        // send hero Status Notification
        let user = await User.findOne({ _id: existingHeroDetails.userId });
        template_data = await template.getTemplate({
          templateType: "DECLINED_HERO_ACCOUNT",
        });

        let msg = {
          title: `<strong>Your Hero Status has been changed</strong>`,
          body: `<h6 style="margin-top:20px;margin-bottom:20px;padding:20px 0px;font-weight:400;text-align:center"> Hey ${
            user.firstName || "Hero"
          } <br><br></br></br> We are sorry that due to some issues with your application, your hero application has been declined.  You can re-fill your application and reach out to our ADMINISTRATOR or support team to re-apply <br><br></br></br><i>For any further query, contact our support team.</i> <br><br></br></br> Thanks <br><br></br></br> Have a Good Day!</h6>`,
        };
        if (
          template_data &&
          template_data.length > 0 &&
          template_data[0].status == true
        ) {
          templateId = template_data[0].template_id;
          if (user.notification.email == true) {
            user.user_status = "DECLINED";
            sendEmailNotification(user, msg, templateId);
          }
        }
      }

      existingHeroDetails.heroStatus = heroStatus
        ? heroStatus
        : existingHeroDetails.heroStatus;
      existingHeroDetails.dl = dl || existingHeroDetails.dl;
      existingHeroDetails.ssn = ssn || existingHeroDetails.ssn;
      existingHeroDetails.dlImg = dlImg || existingHeroDetails.dlImg;

      let updated = await existingHeroDetails.save();
      res.status(200).send(updated);
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};

const applyHero = async (req, res) => {
  try {
    let hero;
    let user = await User.findOne({ _id: req.id });

    if (req.files.image) {
      let heroid = req.id.toHexString();
      hero = await Hero.findOne({ userId: heroid });
      if (!hero) {
        const hero = new Hero({
          userId: user?._id.toHexString(),
          verified: false,
          heroStatus: "PENDING_VERIFICATION",
          email: user?.email,
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
        const heroData = await hero.save();
        await User.findByIdAndUpdate(
          { _id: req.id },
          {
            $set: {
              role: "LAUNDRY_HERO",
            },
          },
          {
            new: true,
          }
        );

        const file = req.files.image;

        // Delete the Previous File
        if (hero.dlImg) {
          await deleteImage(hero.dlImg);
        }
        // upload
        const result = await uploadImage(file);
        // console.log(" result ", result);
        await unlinkFile(file.tempFilePath);
        // console.log(result);
        // Save image
        hero.dlImg = {
          public_id: result.key,
          url: result.Location,
          bucket: result.Bucket,
        };
        const returnedData = await Hero.findOneAndUpdate(
          { userId: heroid },
          hero,
          {
            new: true,
            runValidators: true,
            useFindandModify: false,
          }
        );

        return res.status(200).json({
          message: "Hero Data has been Modified",
          returnedData,
        });
      } else {
        const file = req.files.image;

        // Delete the Previous File
        if (hero.dlImg) {
          await deleteImage(hero.dlImg);
        }
        // upload
        const result = await uploadImage(file);
        // console.log(" result ", result);
        await unlinkFile(file.tempFilePath);
        // console.log(result);
        // Save image
        hero.dlImg = {
          public_id: result.key,
          url: result.Location,
          bucket: result.Bucket,
        };
        // console.log("hero", hero)
        const returnedData = await Hero.findOneAndUpdate(
          { userId: heroid },
          hero,
          {
            new: true,
            runValidators: true,
            useFindandModify: false,
          }
        );
        return res.status(200).json({
          message: "Hero Data has been Modified",
          returnedData,
        });
      }
    }
  } catch (err) {
    res.status(500).send({
      message: `Could not upload the file. ${err}`,
    });
  }
};

const createConnectAccounts = async (req, res) => {
  try {
    const {
      city,
      dobDay,
      dobMonth,
      dobYear,
      line1,
      line2,
      postalCode,
      state,
      gender,
    } = req.body;
    const userId = req.id.toHexString();
    console.log(userId);
    const user = await User.findById(userId);
    const hero = await Hero.findOne({ userId: ObjectId(req.id) });
    if (!user.email) {
      return res.status(400).send({
        message: "Your email id is required to proceed with this step",
      });
    }
    if (!user.firstName || !user.lastName) {
      return res.status(400).send({
        message:
          "Your first name & last name are required to proceed with this step",
      });
    }
    if (!user.phone) {
      return res.status(400).send({
        message: "Your mobile number is required to proceed with this step",
      });
    }
    if (!hero.ssn) {
      return res.status(400).send({
        message: "Your SSN number is required to proceed with this step",
      });
    }
    //
    if (hero.stripeAccountId) {
      return res.status(400).send({
        message: "Your stripe connect is already set up",
      });
    }

    if (hero.heroStatus !== "VERIFIED") {
      return res.status(400).send({
        message:
          "Your account must be verified by Laundry Hero team before we set up connect account for you",
      });
    }

    const account = await createConnectAccount({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      ssnLast4: hero.ssn.slice(-4),
      phone: user.phone,
      city,
      dobDay,
      dobMonth,
      dobYear,
      country: "US",
      line1,
      line2,
      postalCode,
      state,
      gender,
      clientIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });

    await Promise.all([
      Hero.updateOne(
        { _id: hero._id },
        {
          stripeAccountId: account.id,
        }
      ),
      User.updateOne(
        {
          _id: userId,
        },
        {
          dob: new Date(dobYear, dobMonth - 1, dobDay),
        }
      ),
    ]);
    res.status(200).send({
      message: "Account created successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const availabilityStatus = async (req, res) => {
  try {
    let heroId;
    heroId = req.id;
    let status = req.params.status;
    let heroData = await Hero.findOneAndUpdate(
      { userId: heroId },
      { availabilityStatus: status },
      { new: true }
    );
    return res.send(heroData);
  } catch (err) {
    res.status(400).send(err);
  }
};

const verifyStripeToken = async (req, res) => {
  try {
    let heroId = req.id;
    let code_id = req.body.code_id;
    // const herodetails = await Hero.find({ userId: heroId });
    let hero = await Hero.findOne({ userId: heroId });
    if (!hero) return res.status(400).send({ message: "user not found" });
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code: code_id,
    });
    hero.stripeAccountId = response.stripe_user_id;
    hero.stripe_Tokn_verify = true;
    hero = await hero.save();
    return res.status(200).send({ data: getHeroPayout });
  } catch (e) {
    console.log(e);
    if (e) res.status(400).send({ e });
  }
};
module.exports = {
  availabilityStatus,
  getAllHeroes,
  getHeroById,
  updateHero,
  updateHeroAdmin,
  applyHero,
  createConnectAccounts,
  verifyStripeToken,
};
