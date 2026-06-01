const express = require("express");
const Joi = require("joi");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const faqController = require("../controllers/faqController");

const faqSchema = Joi.object({
  question: Joi.string().max(500).required(),
  answer: Joi.string().required(),
  category_id: Joi.number().integer().allow(null, ""),
  is_published: Joi.boolean().default(true),
  sort_order: Joi.number().integer().default(0),
});

const partialFaqSchema = Joi.object({
  question: Joi.string().max(500).optional(),
  answer: Joi.string().optional(),
  category_id: Joi.number().integer().allow(null, "").optional(),
  is_published: Joi.boolean().optional(),
  sort_order: Joi.number().integer().optional(),
});

const publishSchema = Joi.object({
  is_published: Joi.boolean().required(),
});

router.use(authMiddleware);

router.get("/", paginationMiddleware, faqController.getAll);
router.get("/:id", faqController.getById);
router.post("/", validate(faqSchema), faqController.create);
router.put("/:id", validate(faqSchema), faqController.update);
router.patch("/:id", validate(partialFaqSchema), faqController.partialUpdate);
router.patch("/:id/publish", validate(publishSchema), faqController.updatePublishStatus);
router.delete("/:id", faqController.delete);

module.exports = router;