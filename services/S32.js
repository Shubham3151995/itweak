// const aws = require("aws-sdk");
// require("dotenv").config();

// const crypto = require("crypto")
// const { promisify } = require("util")

// const bucket = process.env.AWS_BUCKET_NAME;
// const region = process.env.AWS_BUCKET_REGION_NAME;
// const accessKeyId = process.env.AWS_ACCESS_KEY_2;
// const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_2;

// const s3 = new aws.S3({
//     region,
//     accessKeyId,
//     secretAccessKey,
//     signatureVersion: 'v4'

// })
// const generateUploadUrl = async (req, res) => {
//     const rawBytes = await crypto.randomBytes(16);
//     const imageName = rawBytes.toString('hex')

//     const params = ({
//         Bucket: bucket,
//         Key: imageName,
//         Expires: 60
//     })
//     const uploadUrl = await s3.getSignedUrlPromise('putObject', params)

//     res.send({ uploadUrl })
// }
// module.exports = { generateUploadUrl };
