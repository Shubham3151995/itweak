const Referral = require("../models/Referrals");
const User = require("../models/Users");
const Rating = require("../models/Ratings");

const addReferral = async (req, res) => {
  try {
    function makeid(length) {
      var result = "";
      var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }
    let referalCode = await makeid(6);
    const user = await User.findById(req.id);
    if (user.referralCode) {
      return res.status(500).json({ error: "you already have refer code" });
    }
    let referrals = new Referral({
      RefralCode: referalCode,
      userId: user._id,
      useremail: user.email,
      Date: Date.now(),
    });
    let referralData = await referrals.save();
    await User.findByIdAndUpdate(
      req.id,
      {
        $set: {
          referralCode: referralData.RefralCode,
        },
      },
      {
        new: true,
        runValidators: true,
        useFindandModify: false,
      }
    );
    res.status(200).json(referralData);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const checkRating = async (req, res) => {
  try {
    const { orderId } = req.body;
    const data = await Rating.findOne({ orderId: orderId });
    if (data) {
      res.status(200).json({ error: "Already Rated" });
    } else {
      res.status(200).json({ error: "Not Rated" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addReferral,
  checkRating,
};
