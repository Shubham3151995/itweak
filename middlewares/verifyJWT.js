const jwt = require("jsonwebtoken");
const User = require("../models/Users");
// const { accessTokenSecret } = require("../config/appConfig");

const verifyJWT = (req, res, next) => {
  // Get auth header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // If no auth header found
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("Unauthorized call");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract access token from auth header
  const token = authHeader.split(" ")[1];

  // Verify extracted access token
  jwt.verify(token, "secret", async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    const userData = decoded.data.contact;
    if (!userData) return res.sendStatus(404);

    // Check for email or phone in database
    let user = await User.findOne({ email: userData });
    if (!user) user = await User.findOne({ phone: userData });
    if (!user) return res.sendStatus(403);

    req.id = user._id;
    req.email = user.email;
    req.role = user.role;
    next();
  });
};

module.exports = verifyJWT;
