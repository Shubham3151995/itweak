const Rating = require("../models/Ratings");
const Order = require("../models/Orders");
const User = require("../models/Users");

const getRating = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId });
    console.log(order.customer, req.id);
    if (
      order.customer.equals(req.id) ||
      order.hero.equals(req.id) ||
      req.role === "ADMINISTRATOR"
    ) {
      const rating = await Rating.findOne({ orderId });
      if (!rating) {
        return res.status(400).send({ error: "Not rated" });
      }
      res.send(rating);
    } else {
      res.status(400).send({ error: "User not allowed to view rating" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const addRating = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId });
    const user = await User.findOne({ _id: req.id });
    const hero = await User.findOne({ _id: order.hero });
    if (order.customer.equals(req.id)) {
      const {
        punctuality,
        cleanliness,
        niceSmell,
        folding,
        friendliness,
        remarks,
      } = req.body;
      const AvgRating =
        (punctuality + cleanliness + niceSmell + folding + friendliness) / 5;
      console.log(order.status);
      if (order.status === "DELIVERED") {
        const rating = new Rating({
          punctuality,
          cleanliness,
          niceSmell,
          folding,
          friendliness,
          remarks,
          orderId,
          ratedOn: new Date(),
          status: order.status,
          ratedBy: user._id,
          ratedTo: hero._id,
          AvgRating,
        });

        const savedRating = await rating.save();
        res.status(200).json(savedRating);
      } else {
        res
          .status(400)
          .send({ error: "Order status should be complete to rate" });
      }
    } else {
      res.status(400).send({ error: "Only relevant customer can rate" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ error: "Cannot rate twice" });
  }
};

const updateRating = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId });
    if (order.customer.equals(req.id) || req.role === "ADMINISTRATOR") {
      const {
        punctuality,
        cleanliness,
        niceSmell,
        folding,
        friendliness,
        remarks,
      } = req.body;
      if (order.status === "COMPLETED") {
        // Find and update order
        const rating = await Rating.findOneAndUpdate(
          orderId,
          {
            $set: {
              punctuality,
              cleanliness,
              niceSmell,
              folding,
              friendliness,
              remarks,
            },
          },
          {
            new: true,
            runValidators: true,
            useFindandModify: false,
          }
        );
        res.send(rating);
      } else {
        res
          .status(400)
          .send({ error: "Order status should be complete to rate" });
      }
    } else {
      res.status(400).send({ error: "Only relevent customer can rate" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const deleteRating = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (req.role === "ADMINISTRATOR") {
      const deletedRating = await Rating.findOneAndDelete({ _id: orderId });
      res.send({ deleted: true, deletedRating });
    } else {
      res.status(400).send({ error: "Admin access required" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
  }
};

const getAllRatings = async (req, res) => {
  try {
    let data;
    if (req.query.orderId != undefined && req.query.orderId != "") {
      data = await Rating.find({ orderId: req.query.orderId }).populate([
        {
          path: "ratedBy",
          select: "firstName lastName _id email status profilePicture",
        },
        {
          path: "ratedTo",
          select: "firstName lastName _id email status profilePicture",
        },
      ]);
      return res.status(200).json(data);
    }
    if (req.query.name != undefined && req.query.name != "") {
      let user = await User.find({
        $or: [
          {
            firstName: {
              $regex: req.query.name,
              $options: "i",
            },
          },
          {
            lastName: {
              $regex: req.query.name,
              $options: "i",
            },
          },
        ],
      }).select("_id");
      user = JSON.parse(JSON.stringify(user));
      user = user.map((x) => x._id);
      data = await Rating.find({
        $or: [{ ratedBy: { $in: user } }, { ratedTo: { $in: user } }],
      }).populate([
        {
          path: "ratedBy",
          select: "firstName lastName _id email status profilePicture",
        },
        {
          path: "ratedTo",
          select: "firstName lastName _id email status profilePicture",
        },
      ]);
      return res.status(200).json(data);
    }
    data = await Rating.find({}).populate([
      {
        path: "ratedBy",
        select: "firstName lastName _id email status profilePicture",
      },
      {
        path: "ratedTo",
        select: "firstName lastName _id email status profilePicture",
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getRating,
  addRating,
  updateRating,
  deleteRating,
  getAllRatings,
};
