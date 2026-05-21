const { S3Client } = require("@aws-sdk/client-s3");

const usePathStyle =
  process.env.AWS_USE_PATH_STYLE_ENDPOINT === "true" ||
  process.env.AWS_USE_PATH_STYLE_ENDPOINT === "1";

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  forcePathStyle: usePathStyle,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3;