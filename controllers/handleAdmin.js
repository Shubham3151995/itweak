const User = require("../models/Users");
const Hero = require("../models/Heros");
const Territory = require("../models/Territory");

const Content = require("../models/Content");
const priceGroup = require("../models/Pricegroup");
const { ObjectId } = require("mongodb");
// const uploadFile = require("../controllers/handleImage");
const { uploadImage, getImage, deleteImage } = require("../services/S3");
const uploadFile = require("../services/uploadFileService");
const template = require("./handleTemplates");
const NodeGeocoder = require("node-geocoder");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const {
  sendEmailNotification,
  sendInAppNotification,
  sendSmsNotification,
} = require("../utils/sendNotifications");
const bcrypt = require("bcrypt");
const Notifying = require("../models/Notifying");

const addUser = async (req, res) => {
  let hashedPwd, newpassword;
  try {
    let newuser = req.body;
    if (req.body.password == "") {
      return res.status(200).send("Please enter password.");
    } else {
      newpassword = req.body.password;
      hashedPwd = await bcrypt.hash(newpassword, 10);
    }

    if (req.role == "ADMINISTRATOR") {
      // Fnd if the user already exists or not
      // { $or: [ { email: newuser['email'] }, { phone: newuser['phone'] } ]}
      let query = {};
      if (newuser.email || newuser.phone) {
        if (newuser.email) {
          query = {
            $and: [{ email: { $exists: true } }, { email: newuser.email }],
          };
        } else {
          query = {
            $and: [{ phone: { $exists: true } }, { phone: newuser.phone }],
          };
        }
      } else if (newuser.email && newuser.phone) {
        query = {
          $or: [
            { $and: [{ email: { $exists: true } }, { email: newuser.email }] },
            { $and: [{ phone: { $exists: true } }, { phone: newuser.phone }] },
          ],
        };
      }
      const userExists = await User.findOne(query);
      if (userExists)
        return res
          .status(400)
          .json({ message: "Email/phone already exist, please login" });

      // set User Data
      let address = [];
      if (newuser.address) {
        const options = {
          provider: "google",

          // Optional depending on the providers
          // fetch: customFetchImplementation,
          apiKey: GOOGLE_MAPS_API_KEY, // for Mapquest, OpenCage, Google Premier
          formatter: null, // 'gpx', 'string', ...
        };

        const geocoder = NodeGeocoder(options);

        // Using callback ${newuser.address.streetNumber}${newuser.address.streetName}${newuser.address.zipCode}

        // console.log(res[0], "%%%%%%%%");

        for (let item of newuser.address) {
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
      }
      const user = new User({
        email: newuser.email,
        password: hashedPwd,
        role: newuser.role,
        firstName: newuser.firstName,
        lastName: newuser.lastName,
        phone: newuser.phone,
        dob: newuser.dob,
        pronouns: newuser.pronouns,
        profilePicture: newuser.profilePicture,
        address: address ? address : [],
        notification: {
          sms: newuser?.notification?.sms,
          email: newuser?.notification?.email,
        },
        status: newuser.status,
        verification: {
          emailVerified: false,
          phoneVerified: false,
        },
        preferences: newuser?.preferences ? newuser?.preferences : [],
        isAddedByAdmin: newuser.isAddedByAdmin
          ? newuser.isAddedByAdmin
          : undefined,
        isFirstTime: newuser?.isFirstTime ? newuser?.isFirstTime : undefined,
      });

      // Change verification status to true and set OTP to null
      if (newuser.phone) {
        user.verification.phoneVerified = true;
        user.otp.phoneOTP = null;
      }
      if (newuser.email) {
        user.verification.emailVerified = true;
        user.otp.emailOTP = null;
      }
      // Save user
      const savedUser = await user.save();

      // Check if signed up user is Hero
      if (newuser.role === "LAUNDRY_HERO") {
        // Save the id of hero in Hero model
        const hero = new Hero({
          userId: savedUser?._id.toHexString(),
          verified: false,
          heroStatus: newuser.heroStatus,
          email: savedUser?.email,
          address: address ? address : [],
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
              status: "AVAILABLE",
            },
            {
              day: "Thursday",
              from: "800",
              to: "2300",
              bags: 1,
              status: "AVAILABLE",
            },
            {
              day: "Friday",
              from: "800",
              to: "2300",
              bags: 1,
              status: "AVAILABLE",
            },
            {
              day: "Saturday",
              from: "800",
              to: "2300",
              bags: 1,
              status: "AVAILABLE",
            },
            {
              day: "Sunday",
              from: "800",
              to: "2300",
              bags: 1,
              status: "AVAILABLE",
            },
          ],
        });
        let savedHero = await hero.save();

        const userId = savedUser._id;

        await User.findByIdAndUpdate(
          userId,
          {
            heroId: savedHero._id,
          },
          { new: true }
        );
      }
      let template_data, templateId;
      template_data = await template.getTemplate({
        templateType: "WELCOME_USER",
      });

      // send Notifications
      const msg = {
        title: "Welcome To Laundry Hero",
        body: `Hey ${savedUser.firstName}, your account has been created by one of our administrators.Please use your email or phonenumber with password: ${newpassword} to login. `,
      };

      if (
        template_data &&
        template_data.length > 0 &&
        template_data[0].status == true
      ) {
        templateId = template_data[0].template_id;
        if (savedUser.notification.email)
          sendEmailNotification(
            savedUser,
            msg,
            templateId,
            savedUser.role,
            savedUser.email
          );
      }
      if (savedUser.notification.sms) sendSmsNotification(savedUser, msg);

      res.status(200).send(savedUser);
    } else {
      res.status(405).send("You are Not Allowed to access This Route.");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const addTerritory = async (req, res) => {
  try {
    if (req.role == "ADMINISTRATOR") {
      if (
        req.body.priceGroup == undefined ||
        req.body.priceGroup == "" ||
        Object.keys(req.body.priceGroup).length === 0
      ) {
        let active_price_group = await priceGroup.find({ status: "Active" });
        if (active_price_group && active_price_group.length > 0) {
          req.body.priceGroup = active_price_group[0];
        }
      } else {
        req.body.priceGroup = req.body.priceGroup;
      }

      let new_territory = req.body;
      const territory = new Territory({
        name: new_territory.name.toLowerCase(),
        country: new_territory.country,
        state: new_territory.state,
        zipCode: new_territory.zipCode,
        heroResponse: new_territory.heroResponse,
        modifier: new_territory.modifier,
        priceGroup: new_territory.priceGroup,
      });
      // Save territory
      const savedTerritory = await territory.save();
      res.status(200).send(savedTerritory);
    } else {
      res.status(405).send("You are Not Allowed to access This Route.");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const editTerritory = async (req, res) => {
  try {
    const territoryId = req.params.id || req.body._id;

    if (!territoryId) {
      return res.status(409).json({ message: "Territory not found" });
    }
    if (req.role == "ADMINISTRATOR") {
      // console.log(priceGroup,"priceGroup")
      const newdata = {
        name: req.body.name,
        country: req.body.country,
        state: req.body.state,
        zipCode: req.body.zipCode,
        heroResponse: req.body.heroResponse,
        status: req.body.status,
        modifier: req.body.modifier,
        priceGroup: req.body.priceGroup,
      };
      const savedTerritory = await Territory.findOneAndUpdate(
        territoryId,
        {
          $set: newdata,
        },
        {
          new: true,
          runValidators: true,
          useFindandModify: false,
        }
      );
      // console.log(savedTerritory, "savedTerritory");
      // const result = await savedTerritory.save();
      res.status(200).send(savedTerritory);
    } else {
      res.status(405).send("You are Not Allowed to access This Route.");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const getAllTerritory = async (req, res) => {
  try {
    const allTerritories = await Territory.find();
    if (allTerritories) {
      res.status(200).send(allTerritories);
    } else {
      res.status(200).send({ message: "Territory not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const deleteTerritory = async (req, res) => {
  try {
    const territoryId = req.params.id || req.body.id;

    if (req.role == "ADMINISTRATOR") {
      const response = await Territory.findByIdAndDelete(territoryId);

      res.status(200).send("Territory Deleted Successfully");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const addContent = async (req, res) => {
  // console.log(req.body, "request");
  if (req.role == "ADMINISTRATOR") {
    let newContent = null;
    let contentDetail = null;

    if (req.body.page) {
      newContent = req.body.page;

      contentDetail = new Content({
        page: {
          pageName: newContent.pageName,
          screenNumber: newContent.screenNumber,
          picture: newContent.picture,
          content: newContent.content,
        },
      });
      const savedContent = await contentDetail.save();
      // console.log(savedContent);
      res.status(200).send(savedContent);
    } else if (req.body.slider) {
      newContent = req.body.slider;

      let slider = {
        title: newContent.title,
        status: newContent.status,
        picture: newContent.picture,
        linkType: newContent.linkType,
        target: newContent.target,
      };

      // console.log(contentDetail)
      let sliders = await Content.findOne({
        _id: ObjectId(newContent.sliderId),
      });
      sliders.slider.push(slider);
      await sliders.save();
      res.status(200).send("slider saved successfully");
    }
  }
};

const getAllContent = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const allContent = await Content.find();
      res.status(200).send(allContent);
    } else {
      res.status(400).send({ error: "Not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

// const updateContent = async (req, res) => {
//   try {
//     const contentId = req.params.id || req.body._id;
//     const currentContent = await Content.findById(contentId);
//     let content;
//     let newContent;
//     if (req.role == "ADMINISTRATOR") {
//       // console.log(req.body, "req")

//       if (req.files) {
//         console.log("2222222")
//         let content = await Content.findById(contentId);
//         const file = req.files.image;

//         if (JSON.stringify(content.page.picture) !== "{}") {
//           // console.log("he", content.page.picture)
//           deleteImage(content.page.picture);
//         } else if (JSON.stringify(content.slider.picture) !== "{}") {
//           // console.log("be", content.slider.picture)
//           deleteImage(content.slider.picture);
//         }
//         // upload
//         const result = await uploadImage(file);
//         // console.log(result);
//         // Save image
//         newPicture = {
//           public_id: result.key,
//           url: result.Location,
//           bucket: result.Bucket,
//         };
//       }

//       // if any new picture comes
//       if (
//         req.body?.page?.picture?.url &&
//         req.body?.page?.picture?.url !== currentContent?.page?.picture?.url
//       ) {
//         deleteImage(currentContent?.page?.picture);
//       } else if (
//         req.body?.slider?.picture?.url &&
//         req.body?.slider?.picture?.url !== currentContent?.slider?.picture?.url
//       ) {
//         deleteImage(currentContent?.slider?.picture);
//       }

//       if (req.body.page) {
//         newContent = req.body.page;

//         content = {
//           page: {
//             pageName: newContent.pageName,
//             screenNumber: newContent.screenNumber,
//             picture: newContent.picture,
//             content: newContent.content,
//           },
//         };
//       } else if (req.body.slider) {
//         let sliderid = req.query.sliderId;
//         console.log(sliderid,"11111")
//         newContent = req.body.slider;

//         content = {
//             title: newContent.title,
//             status: newContent.status,
//             picture: newContent.picture,
//             linkType: newContent.linkType,
//             target: newContent.target,
//         };
//       }
//       // console.log(contentId, "contentId")
//       // console.log(content, "content")

//       const returnedData = await Content.findOne(
//         { slider: { $exists: true }},
//       );

// console.log(returnedData,"@@@@")
//       return res.status(200).json({
//         message: "Data has been Modified",
//         returnedData,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(400).send(error);
//   }
// };

const updateContent = async (req, res) => {
  try {
    const contentId = req.params.id || req.body._id;
    let currentContent = await Content.findById(contentId);
    let sliderId = req.query.sliderId;
    // console.log(currentContent)
    if (sliderId) {
      currentContent = currentContent.slider.find(
        (item) => item._id == sliderId
      );
      // console.log("https://lhero-assets.s3.ap-northeast-1.amazonaws.com/b9758e06449b40000c5dd9a0.gif"!=="https://lhero-assets.s3.ap-northeast-1.amazonaws.com/b9758e06449b40000c5dd9a0.gif")
    }

    let content;
    let newContent;
    if (req.role == "ADMINISTRATOR") {
      //   // console.log(req.body, "req")

      if (req.files) {
        let content = await Content.findById(contentId);
        const file = req.files.image;

        if (JSON.stringify(content.page.picture) !== "{}") {
          // console.log("he", content.page.picture)
          deleteImage(content.page.picture);
        } else if (JSON.stringify(content.slider.picture) !== "{}") {
          // console.log("be", content.slider.picture)
          deleteImage(content.slider.picture);
        }
        // upload
        const result = await uploadImage(file);
        // console.log(result);
        // Save image
        newPicture = {
          public_id: result.key,
          url: result.Location,
          bucket: result.Bucket,
        };
      }

      // if any new picture comes
      if (
        req.body?.page?.picture?.url &&
        req.body?.page?.picture?.url !== currentContent?.page?.picture?.url
      ) {
        deleteImage(currentContent?.page?.picture);
      } else if (
        req.body?.slider?.picture?.url &&
        req.body?.slider?.picture?.url !== currentContent?.picture?.url
      ) {
        deleteImage(currentContent?.slider?.picture);
      }

      if (req.body.page) {
        newContent = req.body.page;

        content = {
          page: {
            pageName: newContent.pageName,
            screenNumber: newContent.screenNumber,
            picture: newContent.picture,
            content: newContent.content,
          },
        };
        const returnedData = await Content.findByIdAndUpdate(
          contentId,
          content,
          {
            new: true,
            runValidators: true,
            useFindandModify: false,
          }
        );

        return res.status(200).json({
          message: "Data has been Modified",
          returnedData,
        });
      } else if (req.body.slider) {
        newContent = req.body.slider;

        content = {
          title: newContent.title,
          status: newContent.status,
          picture: newContent.picture,
          linkType: newContent.linkType,
          target: newContent.target,
        };
        let result = await Content.findById(contentId);
        let data = result.slider.map((item) => {
          if (item._id == sliderId) {
            (item.title = newContent.title),
              (item.status = newContent.status),
              (item.picture = newContent.picture),
              (item.linkType = newContent.linkType),
              (item.target = newContent.target);
          }
          return item;
        });
        result.slider = data;
        result = await result.save();
        return res.status(200).json({
          message: "Data has been Modified",
          result,
        });
      }
      // console.log(contentId, "contentId")
      // console.log(content, "content")
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const deleteContent = async (req, res) => {
  try {
    const contentId = req.params.id || req.body.id;

    if (req.role == "ADMINISTRATOR") {
      const response = await Content.findByIdAndDelete(contentId);

      res.status(200).send("Content Deleted Successfully");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const addNotifier = async (req, res) => {
  try {
    let newnotifier = new Notifying({
      notification_name: req.body.notification_name,
      send: req.body.send,
      reciever_type: req.body.reciever_type,
      notification_type: req.body.notification_type,
    });

    const savedNotification = await newnotifier.save();
    console.log(savedNotification);
    res.status(200).send(savedNotification);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const updateNotifier = async (req, res) => {
  try {
    const notifierId = req.params.id || req.body._id;
    const currentnotifier = await Notifier.findById(notifierId);

    if (!currentnotifier)
      return res
        .status(409)
        .json({ message: "This notification type doesn't exists" });

    let notifier = {
      send: req.body.send,
      // reciever_type: req.body.reciever_type,
      // notification_type: req.body.notification_type
    };

    // const savedNotification = await newnotifier.save();
    const savedNotification = await Notifying.findByIdAndUpdate(
      notifierId,
      notifier,
      {
        new: true,
        runValidators: true,
        useFindandModify: false,
      }
    );
    console.log(savedNotification);
    res.status(200).send(savedNotification);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const getAllNotifier = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const allNotifiers = await Notifying.find();
      res.status(200).send(allNotifiers);
    } else {
      res.status(400).send({ error: "Not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
const getSlider = async (req, res) => {
  try {
    const slider = await Content.find({ slider: { $exists: true } });
    if (slider.length > 0) {
      res.status(200).send(slider);
    } else {
      res.status(404).send({
        message: "silder no found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const dragDropSlider = async (req, res) => {
  try {
    let id = req.params.id;
    let newContent = req.body.slider;
    const slider = await Content.findOne({ _id: ObjectId(id) });
    slider.slider = newContent;
    slider.save();
    res.status(200).send("saved");
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
module.exports = {
  addUser,
  editTerritory,
  addTerritory,
  getAllTerritory,
  deleteTerritory,
  addContent,
  updateContent,
  deleteContent,
  getAllContent,
  updateNotifier,
  addNotifier,
  getAllNotifier,
  getSlider,
  dragDropSlider,
};
