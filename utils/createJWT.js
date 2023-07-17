const jwt = require("jsonwebtoken");
const getAccessToken = (userData, userId) => {
  const data = {
    contact: userData,
    userId,
  };
  const accessToken = jwt.sign({ data }, "secret", {
    expiresIn: "365d",
  });
  return accessToken;
};

const getRefreshToken = (userData, userId) => {
  const data = {
    contact: userData,
    userId,
  };
  const refreshToken = jwt.sign({ data }, "secret", {
    expiresIn: "365d",
  });
  return refreshToken;
};

module.exports = { getAccessToken, getRefreshToken };
