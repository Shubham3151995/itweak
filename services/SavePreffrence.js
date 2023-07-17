const { Preference } = require("../models/Preferences");
const dataJson = require("../defaultData/preferences.json");
const saveDefaultPreffrence = async () => {
  let data = await Preference.find({});
  if (data.length === 0) {
    dataJson.forEach(async (item) => {
      let result = await new Preference(item);
      await result.save();
    });
  }
};
module.exports = saveDefaultPreffrence;
