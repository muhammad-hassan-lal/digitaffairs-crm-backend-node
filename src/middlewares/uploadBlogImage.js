const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const s3 = require("../config/s3");

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const uploadBlogImage = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: function (_req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();

      const fileName = `digitaffairs-blogs/${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`;

      cb(null, fileName);
    },
  }),

  fileFilter: function (_req, file, cb) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadBlogImage;