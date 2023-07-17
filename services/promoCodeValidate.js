const Promocode = require("../models/Promocode");

const promoCodeValidate = async (promoCode, totalAmmount) => {
  let uniqueTimeStamp = new Date().valueOf();
  let promocodeDetails = await Promocode.findOne({ promoCode: promoCode });

  if (promocodeDetails) {
    if (uniqueTimeStamp <= promocodeDetails.expirationTime) {
      if (
        promocodeDetails.type === "percentage" &&
        promocodeDetails.timeUsed <= promocodeDetails.maxUsed
      ) {
        let discount = (promocodeDetails.discount / 100) * totalAmmount;
        promocodeDetails.timeUsed = promocodeDetails.timeUsed + 1;
        await promocodeDetails.save();
        return { valid: true, payAmmount: totalAmmount - discount };
      }
      if (promocodeDetails.type === "flat") {
        promocodeDetails.timeUsed = promocodeDetails.timeUsed + 1;
        await promocodeDetails.save();
        return {
          valid: true,
          payAmmount: totalAmmount - promocodeDetails.discount,
        };
      }
    } else {
      return { valid: false, payAmmount: totalAmmount };
    }
  } else {
    return { valid: false, payAmmount: totalAmmount };
  }
};

module.exports = { promoCodeValidate };
