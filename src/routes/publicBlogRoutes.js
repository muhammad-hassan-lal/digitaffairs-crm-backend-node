const express = require("express");
const Joi = require("joi");

const router = express.Router();

const validate = require("../middlewares/validationMiddleware");
const publicBlogController = require("../controllers/publicBlogController");
const blogCommentController = require("../controllers/blogCommentController");

const commentSchema = Joi.object({
  blog_id: Joi.number().integer().required(),
  name: Joi.string().max(120).required(),
  email: Joi.string().email().max(150).required(),
  website: Joi.string().uri().allow("", null),
  comment: Joi.string().required(),
});

router.get("/", publicBlogController.getPublishedBlogs);
router.get("/categories", publicBlogController.getPublicCategories);
router.get("/:slug", publicBlogController.getPublishedBlogBySlug);
router.post("/comments", validate(commentSchema), blogCommentController.createPublic);

module.exports = router;