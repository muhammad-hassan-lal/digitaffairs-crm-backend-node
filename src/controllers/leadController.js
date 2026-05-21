const { Op } = require('sequelize');
const { Lead, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const leadInclude = [
  {
    model: User,
    as: 'assignedUser',
    attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
    required: false,
  },
];

const allowedUpdateFields = [
  'name', 'email', 'phone', 'company_name', 'service', 'message', 'source',
  'status', 'priority', 'assigned_to', 'last_contacted_at', 'next_followup_at', 'admin_note',
];

exports.createPublic = async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      source: req.body.source || 'website',
      status: 'new',
      ip_address: req.ip || null,
      user_agent: req.headers['user-agent'] || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return successResponse(res, lead, 'Your consultation request has been submitted successfully.', 201);
  } catch (err) {
    console.error('Public lead creation error:', err);
    return errorResponse(res, 'Failed to submit consultation request', 500);
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = req.pagination;
    const { search, status, source, service, priority, assigned_to, start_date, end_date } = req.query;

    const where = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (service) where.service = service;
    if (priority) where.priority = priority;
    if (assigned_to) where.assigned_to = assigned_to === 'unassigned' ? null : Number(assigned_to);

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { company_name: { [Op.like]: `%${search}%` } },
        { service: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Lead.findAndCountAll({
      where,
      include: leadInclude,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return successResponse(res, rows, 'Leads fetched successfully', 200, {
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error('Lead fetch error:', err);
    return errorResponse(res, err.message || 'Failed to fetch leads', 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, { include: leadInclude });
    if (!lead) return errorResponse(res, 'Lead not found', 404);
    return successResponse(res, lead, 'Lead fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch lead', 500);
  }
};

exports.create = async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, created_at: new Date(), updated_at: new Date() });
    const createdLead = await Lead.findByPk(lead.id, { include: leadInclude });
    return successResponse(res, createdLead, 'Lead created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to create lead', 500);
  }
};

exports.update = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return errorResponse(res, 'Lead not found', 404);

    const data = {};
    allowedUpdateFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) data[field] = req.body[field];
    });
    data.updated_at = new Date();

    await lead.update(data);
    const updatedLead = await Lead.findByPk(lead.id, { include: leadInclude });
    return successResponse(res, updatedLead, 'Lead updated successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to update lead', 500);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return errorResponse(res, 'Lead not found', 404);

    await lead.update({ status: req.body.status, updated_at: new Date() });
    return successResponse(res, lead, 'Lead status updated successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to update status', 500);
  }
};

exports.assign = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return errorResponse(res, 'Lead not found', 404);

    if (req.body.assigned_to) {
      const user = await User.findByPk(req.body.assigned_to);
      if (!user) return errorResponse(res, 'Assigned user not found', 404);
    }

    await lead.update({ assigned_to: req.body.assigned_to || null, updated_at: new Date() });
    const updatedLead = await Lead.findByPk(lead.id, { include: leadInclude });
    return successResponse(res, updatedLead, 'Lead assigned successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to assign lead', 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return errorResponse(res, 'Lead not found', 404);

    await lead.destroy();
    return successResponse(res, null, 'Lead deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to delete lead', 500);
  }
};
