const express = require("express");

const router = express.Router();

const publicFaqController = require("../controllers/publicFaqController.js");

router.get("/", publicFaqController.getPublishedFaqs);
router.get("/category/:slug", publicFaqController.getPublishedFaqsByCategorySlug);
router.get(
    "/service/:slug",
    publicFaqController.getPublishedFaqsByServiceSlug
  );
  
module.exports = router;