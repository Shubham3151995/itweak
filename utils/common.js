// const push = require("./push");
// const path = require("path");
// const { sign } = require("jsonwebtoken");
const util = require("util");
const fs = require("fs");
const handlebars = require("handlebars");
class Common {
  static async editEmailTemplate(path, editableData) {
    const readFile = util.promisify(fs.readFile);
    try {
      const content = await readFile(path, {
        encoding: "utf-8",
      });
      const template = handlebars.compile(content);
      return template(editableData);
    } catch (err) {
      console.log("Error==>", err);
      throw err;
    }
  }
}

module.exports = Common;
