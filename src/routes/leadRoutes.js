const express = require('express');
const Joi = require('joi');
const leadController = require('../controllers/leadController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/permissionMiddleware');
const validate = require('../middlewares/validationMiddleware');
const paginationMiddleware = require('../middlewares/paginationMiddleware');

const router = express.Router();

const leadSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(30).allow('', null),
  company_name: Joi.string().max(150).allow('', null),
  service: Joi.string().max(150).required(),
  message: Joi.string().allow('', null),
  source: Joi.string().valid('website', 'contact_form', 'newsletter', 'facebook', 'instagram', 'google', 'whatsapp', 'referral', 'other').default('website'),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'closed', 'spam').default('new'),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  assigned_to: Joi.number().integer().allow(null),
  last_contacted_at: Joi.date().allow(null),
  next_followup_at: Joi.date().allow(null),
  admin_note: Joi.string().allow('', null),
});

const publicLeadSchema = leadSchema.fork(['status', 'priority', 'assigned_to', 'last_contacted_at', 'next_followup_at', 'admin_note'], (schema) => schema.optional()).unknown(false);
const publicCampaignFields = {
  reference: Joi.string().max(255).allow('', null),
  utm_source: Joi.string().max(255).allow('', null),
  utm_medium: Joi.string().max(255).allow('', null),
  utm_campaign: Joi.string().max(255).allow('', null),
  utm_term: Joi.string().max(255).allow('', null),
};

router.post('/public', validate(publicLeadSchema.keys(publicCampaignFields)), leadController.createPublic);

router.use(authMiddleware);
router.get('/', checkPermission('leads.view'), paginationMiddleware, leadController.getAll);
router.get('/:id', checkPermission('leads.view'), leadController.getById);
router.post('/', checkPermission('leads.create'), validate(leadSchema), leadController.create);
router.put('/:id', checkPermission('leads.edit'), validate(leadSchema), leadController.update);
router.patch('/:id/status', checkPermission('leads.edit'), validate(Joi.object({ status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'closed', 'spam').required() })), leadController.updateStatus);
router.patch('/:id/assign', checkPermission('leads.edit'), validate(Joi.object({ assigned_to: Joi.number().integer().allow(null).required() })), leadController.assign);
router.delete('/:id', checkPermission('leads.delete'), leadController.delete);

module.exports = router;
