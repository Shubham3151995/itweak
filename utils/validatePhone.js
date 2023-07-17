const validatePhone = (phone) => {
//  var number = phone.replaceAll("[()\\s-]+", "");
  if (isNaN(Number(phone))) {
    return false;
  }
  if (phone.toString().length < 10) {
    return false;
  } else {
    return true;
  }
};

module.exports = validatePhone;
