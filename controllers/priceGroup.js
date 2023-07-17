const Pricegroup = require("../models/Pricegroup");

const createPriceGroup = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const { name, discount, status, type, description, limits, products } =
        req.body;

      const priceGroupToSave = new Pricegroup({
        name,
        discount,
        status,
        type,
        description,
        limits,
        products,
      });
      let saved = await priceGroupToSave.save();

      if (saved) {
        res.status(200).send(saved);
      } else {
        res.status(400).send("Something went wrong");
      }
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

const getAllPriceGroup = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const priceGroup = await Pricegroup.find();
      if (priceGroup) {
        res.status(200).send(priceGroup);
      } else {
        res.status(200).send({ error: "price Group not found" });
      }
    } else {
      res.status(404).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

const editPriceGroup = async (req, res) => {
  try {
    console.log("111");
    if (req.role === "ADMINISTRATOR") {
      const { name, discount, status, type, description, limits, products } =
        req.body;

      let pricegroupDetails = await Pricegroup.findById(req.params.id);
      pricegroupDetails.name = name ? name : pricegroupDetails.name;
      pricegroupDetails.discount = discount
        ? discount
        : pricegroupDetails.discount;
      pricegroupDetails.status = status ? status : pricegroupDetails.status;
      pricegroupDetails.type = type ? type : pricegroupDetails.type;
      pricegroupDetails.description = description
        ? description
        : pricegroupDetails.description;
      pricegroupDetails.limits = limits ? limits : pricegroupDetails.limits;
      pricegroupDetails.products = products
        ? products
        : pricegroupDetails.products;
      let updated = await pricegroupDetails.save();
      res.status(200).send(updated);
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};

const deletePriceGroup = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const pgId = req.params.id;
      const deletedPG = await Pricegroup.findOneAndDelete({ _id: pgId });
      res.send({ deleted: true, deletedPG });
    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ error: err.message });
  }
};

module.exports = {
  createPriceGroup,
  getAllPriceGroup,
  editPriceGroup,
  deletePriceGroup,
};
