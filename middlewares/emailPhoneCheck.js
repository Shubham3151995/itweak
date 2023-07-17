const emailPhoneCheck = (req, res, next) => {
  const { email, phone } = req.body;

  let userContact = {};
  if (phone) {
    userContact.phone = phone;
    req.userContact = userContact;
  } else if (email) {
    userContact.email = email;
    req.userContact = userContact;
  } else {
    return res.status(400).send({ message: "Email or phone is required" });
  }
  next();
};

module.exports = emailPhoneCheck;
