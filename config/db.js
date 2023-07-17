const mongoose = require('mongoose');
const { dbString } = require('./appConfig');

// Function to connect to database
const connectDB = async () => {
  try {
    console.log("db connected")
    await mongoose.connect(dbString);
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;
