const express = require('express');
const Joi = require('joi');
const publicController = require('../controllers/publicController');
const leadController = require('../controllers/leadController');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/consultation', validate(Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(30).allow('', null),
  company_name: Joi.string().max(150).allow('', null),
  service: Joi.string().max(150).required(),
  message: Joi.string().allow('', null),
  reference: Joi.string().max(255).allow('', null),
  utm_source: Joi.string().max(255).allow('', null),
  utm_medium: Joi.string().max(255).allow('', null),
  utm_campaign: Joi.string().max(255).allow('', null),
  utm_term: Joi.string().max(255).allow('', null),
  gclid: Joi.string().max(255).allow('', null),
  source: Joi.string().valid('website', 'facebook', 'instagram', 'google', 'whatsapp', 'referral', 'other').default('website'),
})), leadController.createPublic);

router.post('/contact', validate(Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(30).allow('', null),
  subject: Joi.string().max(200).allow('', null),
  message: Joi.string().required(),
})), publicController.contact);

router.post('/newsletter', validate(Joi.object({
  email: Joi.string().email().required(),
  source: Joi.string().max(50).default('website'),
})), publicController.newsletter);

module.exports = router;
