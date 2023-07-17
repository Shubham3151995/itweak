const { uploadImage, getImage, deleteImage } = require("../services/S3");
var crypto = require("crypto");

const uploadFile = async (req, res) => {
  if (req.files) {
    var name = crypto.randomBytes(12).toString("hex");
    const image = req.files.image;
    image.name = name.concat(".", image.name.split(".")[1]);
    const result = await uploadImage(image);
    console.log("result", result);

    profilePicture = {
      public_id: result.key,
      url: result.Location,
      bucket: result.Bucket,
    };
    const returnedData = await Hero.findOneAndUpdate({ userId: heroid }, hero, {
      new: true,
      runValidators: true,
      useFindandModify: false,
    });
    return res.status(200).send(result);
  }
};

module.exports = {
  uploadFile,
};
