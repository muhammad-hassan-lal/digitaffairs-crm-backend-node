const express = require('express');
const Joi = require('joi');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/login', validate(Joi.object({ login: Joi.string().required(), password: Joi.string().required() })), authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, validate(Joi.object({
  first_name: Joi.string().max(50).allow('', null),
  last_name: Joi.string().max(50).allow('', null),
  email: Joi.string().email().required(),
  phone: Joi.string().max(30).allow('', null),
  password: Joi.string().min(6).allow('', null),
})), authController.updateProfile);

module.exports = router;
