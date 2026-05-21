const express = require("express");
const Joi = require("joi");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const blogUpload = require("../middlewares/blogUploadMiddleware");

const blogController = require("../controllers/blogController");
const blogCommentController = require("../controllers/blogCommentController");

const blogSchema = Joi.object({
  title: Joi.string().max(255).required(),
  short_description: Joi.string().allow("", null),
  long_description: Joi.string().required(),
  category_id: Joi.number().integer().allow(null),
  status: Joi.string().valid("draft", "published", "archived").default("draft"),
  is_featured: Joi.boolean().default(false),
  meta_title: Joi.string().max(255).allow("", null),
  meta_description: Joi.string().allow("", null),
  meta_keywords: Joi.string().allow("", null),
});

const statusSchema = Joi.object({
  status: Joi.string().valid("draft", "published", "archived").required(),
});

const commentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "approved", "rejected", "spam")
    .required(),
});

router.use(authMiddleware);

router.get("/", paginationMiddleware, blogController.getAll);
router.get("/:id", blogController.getById);

router.post(
  "/",
  blogUpload.single("featured_image"),
  validate(blogSchema),
  blogController.create
);

router.put(
  "/:id",
  blogUpload.single("featured_image"),
  validate(blogSchema),
  blogController.update
);

router.patch("/:id/status", validate(statusSchema), blogController.updateStatus);
router.delete("/:id", blogController.delete);

router.get("/:blogId/comments", blogCommentController.getAllByBlog);
router.patch(
  "/comments/:commentId/status",
  validate(commentStatusSchema),
  blogCommentController.updateStatus
);
router.delete("/comments/:commentId", blogCommentController.delete);

module.exports = router;