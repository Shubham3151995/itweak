const { Preference } = require("../models/Preferences");
const mongoose = require("mongoose");
const User = require("../models/Users");

// Only admin can access
const addPreferenceField = async (req, res) => {
  try {
    // Extract name options and status from body
    const { name, options, status, specialInstruction } = req.body;
    let index;
    let count = await Preference.countDocuments();
    index = count;

    // Required fields
    if (name && options && String(status) && String(specialInstruction)) {
      // Initialize Preference Schema
      const preference = new Preference({
        index: index,
        name,
        options,
        status,
        specialInstruction,
      });

      // Save Preference data
      const result = await preference.save();
      res.send(result);
    } else {
      res.status(400).json({ error: "All fields are required" });
    }
  } catch (error) {
    console.log(error);
    error.code === 11000
      ? res.status(400).send({ error: "Duplicate Preference name" })
      : res.sendStatus(500);
  }
};

// Only admin can access
const editPreferenceField = async (req, res) => {
  try {
    // Extract preference id from params
    const id = req.params.id;

    // Extract data from body
    const data = req.body;

    // If there is no data return 400
    if (!data) {
      return res.status(400).json({ error: "Preference field not found" });
    } else {
      // Find preference by id and update
      const result = await Preference.findByIdAndUpdate(
        id,
        {
          $set: data,
        },
        { new: true }
      );

      // If no result i.e. nothing updated and preference not found
      if (!result) {
        return res.status(400).json({ error: "Preference not found" });
      }
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
  }
};

// Only admin can access
const deletePreferenceField = async (req, res) => {
  try {
    // Extract preference id from params
    const id = req.params.id;

    // If there is no id return 400
    if (!id) {
      return res.status(400).json({ error: "Preference id is required" });
    } else {
      // Find preference by id and update
      const result = await Preference.findByIdAndDelete(id);

      // If no result i.e. nothing updated and preference not found
      if (!result) {
        return res.status(400).json({ error: "Preference not found" });
      }
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
  }
};

// Only authenticated user can access
const getAllPreferencesField = async (req, res) => {
  try {
    let result;
    if (req.query.status != undefined && req.query.status != "") {
      result = await Preference.find({ status: req.query.status }).sort({
        index: 1,
      });
    } else {
      result = await Preference.find().sort({ index: 1 });
    }
    if (result && result.length > 0) {
      res.status(200).send({ data: result });
    } else {
      res.status(400).send({ error: "No Preference found" });
    }
  } catch (error) {
    console.log(error);
  }
};

const addUserPreference = async (req, res) => {
  try {
    const userId = req.id;
    let { id, option, specialInstruction } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: "Preference Id invalid" });
    }
    if (!option) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Check whether sent preference exists or is active
    const prefMatch = await Preference.findById(id);

    // console.log(prefMatch.options, option);

    let found;
    if (prefMatch && prefMatch.status) {
      found = prefMatch.options.includes(option);
    } else {
      return res.status(400).send({ error: "Not Found" });
    }

    // Check for inclusion of special instruction
    if (!prefMatch.specialInstruction) {
      specialInstruction = undefined;
    }

    if (found) {
      const data = {
        preferenceId: id,
        name: prefMatch.name,
        option: option,
        specialInstruction: specialInstruction,
      };

      const user = await User.findById(userId);

      // Filter user preferences (if not exist then insert)
      const duplicate = user.preferences.find((e) => e.name === prefMatch.name);

      if (duplicate) {
        return res.status(400).send({ error: "Duplicate Preference found" });
      }

      user.preferences.push(data);
      const { preferences } = await user.save();

      res.status(200).send(preferences);
    } else {
      return res.status(400).send({ error: "Preference option didn't match" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getUserPreference = async (req, res) => {
  try {
    let userId;
    if (req.role === "ADMINISTRATOR") {
      userId = req.params.id;
    } else {
      userId = req.id;
    }
    if (!userId) {
      return res.status(400).send({ error: "User Id not found" });
    }

    const result = await User.findById(userId);

    const resultingPref = result.preferences.map((el) =>
      String(el.preferenceId)
    );

    const allPreference = await Preference.find();

    for (i = 0; i < allPreference.length; i++) {
      if (!resultingPref.includes(String(allPreference[i]._id))) {
        allPreference[i]["preferenceId"] = allPreference[i]._id;
        allPreference[i]["name"] = allPreference[i].name;
        allPreference[i]["option"] = allPreference[i].options[0];
        allPreference[i].specialInstruction = "";

        const pref = {
          preferenceId: allPreference[i]._id,
          name: allPreference[i].name,
          option: allPreference[i].options[0],
          specialInstruction: "",
          _id: new mongoose.Types.ObjectId(),
        };

        result.preferences.push(pref);
      }
    }

    const { preferences } = await result.save();

    if (!result) {
      return res.status(400).json({ error: "Preference not found" });
    }

    res.status(200).send(preferences);
  } catch (error) {
    throw error;
  }
};

const updateUserPreference = async (req, res) => {
  try {
    let userId;
    let isMember = req.query.member;
    // If role is administrator get user id from req.params
    // else req.id set up by verifyJWT access token
    if (req.role === "ADMINISTRATOR" || isMember) {
      userId = req.params.id;
    } else {
      userId = req.id;
    }
    if (!userId) {
      return res.status(400).send({ error: "User Id not found" });
    }

    let { id, option, specialInstruction } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: "Preference Id invalid" });
    }
    if (!option) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Check whether sent preference exists or is active
    const prefMatch = await Preference.findById(id);

    let found;
    if (prefMatch && prefMatch.status) {
      found = prefMatch.options.includes(option);
    } else {
      return res.status(400).send({ error: "Preference id not Found" });
    }

    // Check for inclusion of special instruction
    if (!prefMatch.specialInstruction) {
      specialInstruction = undefined;
    }

    if (found) {
      const user = await User.findById(userId);

      // Check and change user preference
      user.preferences.forEach((e) => {
        if (e.name === prefMatch.name) {
          e.option = option;
        }
      });

      const { preferences } = await user.save();

      res.status(200).send(preferences);
    } else {
      return res.status(400).send({ error: "Preference option didn't match" });
    }
  } catch (error) {
    throw error;
  }
};

const deleteUserPreference = async (req, res) => {
  try {
    let userId;
    if (req.role === "ADMINISTRATOR") {
      userId = req.params.id;
    } else {
      userId = req.id;
    }
    if (!userId) {
      return res.status(400).send({ error: "User Id not found" });
    }
    const { id } = req.body;
    const user = await User.findById(userId);

    user.preferences.every((e, i, a) => {
      if (String(e.preferenceId) === id) {
        a.splice(i, 1);
        return false;
      }
      return true;
    });
    const { preferences } = await user.save();
    res.status(200).json(preferences);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addPreferenceField,
  editPreferenceField,
  deletePreferenceField,
  getAllPreferencesField,
  addUserPreference,
  updateUserPreference,
  deleteUserPreference,
  getUserPreference,
};
