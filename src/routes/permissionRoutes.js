const express = require('express');
const Joi = require('joi');
const controller = require('../controllers/permissionController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/roles', checkPermission('roles.view'), controller.getRoles);
router.post('/roles', checkPermission('roles.create'), validate(Joi.object({ name: Joi.string().required(), description: Joi.string().allow('', null) })), controller.createRole);
router.put('/roles/:id', checkPermission('roles.edit'), validate(Joi.object({ name: Joi.string().required(), description: Joi.string().allow('', null) })), controller.updateRole);
router.delete('/roles/:id', checkPermission('roles.delete'), controller.deleteRole);
router.get('/permissions', checkPermission('permissions.view'), controller.getPermissions);
router.post('/roles/assign-permissions', checkPermission('permissions.assign'), validate(Joi.object({ role_id: Joi.number().integer().required(), permission_ids: Joi.array().items(Joi.number().integer()).required() })), controller.assignPermissionsToRole);

module.exports = router;
