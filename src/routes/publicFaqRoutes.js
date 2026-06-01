const express = require("express");

const router = express.Router();

const publicFaqController = require("../controllers/publicFaqController.js");

router.get("/", publicFaqController.getPublishedFaqs);
router.get("/category/:slug", publicFaqController.getPublishedFaqsByCategorySlug);

module.exports = router;