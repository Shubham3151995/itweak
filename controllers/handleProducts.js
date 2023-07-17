const User = require("../models/Users");
const Product = require("../models/Products");
const Pricegroup = require("../models/Pricegroup");

const addProduct = async (req, res) => {
  try {
    const { productName, status, price, amountOfBags, heroFee } = req.body;
    if (!productName || !status || !price || !amountOfBags || !heroFee) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const checkProductName = await Product.findOne({
      productName: productName,
    });
    if (checkProductName) {
      return res.status(400).json({ error: "Productname already exists" });
    }
    const product = new Product({
      productName,
      status,
      price,
      amountOfBags,
      heroFee,
    });
    const result = await product.save();
    res.status(200).json(result);
  } catch (err) {
    console.log(err.message);
  }
};

const getProduct = async (req, res) => {
  try {
    const result = await Product.find({});
    if (!result) {
      return res.status(400).json({ error: "No product found" });
    } else {
      return res.status(200).json(result);
    }
  } catch (err) {
    console.log(err.message);
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await Product.findOne({ _id: productId });
    if (!result) {
      return res.status(400).json({ error: "No product found" });
    } else {
      return res.status(200).json(result);
    }
  } catch (err) {
    console.log(err.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { productName, status, price, amountOfBags, heroFee } = req.body;
    const result = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          productName,
          status,
          price,
          amountOfBags,
          heroFee,
        },
      },
      {
        new: true,
        runValidators: true,
        useFindandModify: false,
      }
    );

    if (!result) {
      return res.status(400).json({ error: "No product found" });
    } else {
      return res.status(200).json(result);
    }
  } catch (err) {
    console.log(err.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await Product.findByIdAndDelete({ _id: productId });
    let all_price_groups = await Pricegroup.find();
    if (all_price_groups && all_price_groups.length > 0) {
      for (let obj of all_price_groups) {
        let is_product_exist = obj.products.filter(
          (prod) => prod._id == productId
        );
        if (is_product_exist && is_product_exist.length > 0) {
          let index = obj.products.findIndex((prod) => prod._id == productId);
          obj.products.splice(index, 1);
          await Pricegroup.findByIdAndUpdate(
            obj._id,
            {
              $set: {
                products: obj.products,
              },
            },
            {
              new: true,
            }
          );
        }
      }
    }
    if (!result) {
      return res.status(400).json({ error: "No product found" });
    } else {
      return res.status(200).json({status : true,message:"Product deleted successfully"});
    }
  } catch (err) {
    console.log(err.message);
  }
};

const productListing = async (req, res) => {
  try {
    if (req.role === "CONSUMER") {
      const priceGroup = await Product.find({ status: "ACTIVE" });
      if (priceGroup) {
        res.status(200).send(priceGroup);
      } else {
        res.status(200).send({ error: "price Group not found" });
      }
    } else {
      res.status(404).send({ error: "Consumer Permission required" });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports = {
  addProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  productListing,
};
