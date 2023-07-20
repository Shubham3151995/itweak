const { uploadImage, getImage, deleteImage } = require("../services/S3");
var crypto = require("crypto");
const User = require("../models/Users");

const uploadFile = async (req, res) => {
  if (req.files) {
    var name = crypto.randomBytes(12).toString("hex");
    const image = req.files.image;
    image.name = name.concat(".", image.name.split(".")[1]);
    const result = await uploadImage(image);
    let profilePicture = {
      public_id: result.key,
      url: result.Location,
      bucket: result.Bucket,
    };
    await User.findOneAndUpdate(
      { _id: req.id },
      {
        $set: {
          profilePicture: profilePicture,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).send(result);
  }
};

const getFile = async (req, res) => {
  let key = req.params.id
  const result = await getImage(key);
  return res.status(200).send(result);
}

const deleteFile = async (req, res) => {
  let id = req.params.id
  await deleteImage(id);
  return res.status(200).json({ message: "File deleted successfully" });
}


module.exports = {
  uploadFile,
  getFile,
  deleteFile
};
