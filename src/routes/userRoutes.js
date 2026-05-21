const express = require('express');
const Joi = require('joi');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const paginationMiddleware = require('../middlewares/paginationMiddleware');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();
router.use(authMiddleware);

const userSchema = Joi.object({
  username: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().max(50).allow('', null),
  last_name: Joi.string().max(50).allow('', null),
  phone: Joi.string().max(30).allow('', null),
  role_ids: Joi.array().items(Joi.number().integer()).default([]),
});

const updateUserSchema = userSchema.fork(['password'], (schema) => schema.optional()).append({ is_active: Joi.boolean().optional() });

router.get('/', checkPermission('users.view'), paginationMiddleware, userController.getAll);
router.get('/:id', checkPermission('users.view'), userController.getById);
router.post('/', checkPermission('users.create'), validate(userSchema), userController.create);
router.put('/:id', checkPermission('users.edit'), validate(updateUserSchema), userController.update);
router.delete('/:id', checkPermission('users.delete'), userController.delete);

module.exports = router;
