require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");
const aws = require("aws-sdk");

const bucket = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION_NAME;
const access_key = process.env.AWS_ACCESS_KEY;
const secret_key = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  region,
  access_key,
  secret_key,
});

// upload image to S3
exports.uploadImage = (file) => {
  const fileStream = fs.createReadStream(file.tempFilePath);
  const uploadParams = {
    Bucket: bucket,
    Body: fileStream,
    Key: file.name,
    ACL: "public-read",
  };
  return s3.upload(uploadParams).promise();
};
exports.getImage = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucket,
  };
  return s3.getObject(downloadParams).createReadStream();
};

exports.deleteImage = async (file) => {
  // console.log(file, "File came");
  if (file) {
    const image = {
      Bucket: bucket,
      Key: file,
    };
    // console.log(image, "image")
    const response = await s3.deleteObject(image, (err, data) => {
      if (err) {
        console.log(err);
      }
    });
    return response;
  }
  console.log("no image to be deleted");
};
