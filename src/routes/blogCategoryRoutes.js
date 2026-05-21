const express = require("express");
const Joi = require("joi");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const categoryController = require("../controllers/blogCategoryController");

const categorySchema = Joi.object({
  name: Joi.string().max(150).required(),
  description: Joi.string().allow("", null),
  is_active: Joi.boolean().default(true),
});

router.use(authMiddleware);

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", validate(categorySchema), categoryController.create);
router.put("/:id", validate(categorySchema), categoryController.update);
router.delete("/:id", categoryController.delete);

module.exports = router;