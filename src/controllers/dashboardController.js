const { Op } = require('sequelize');
const { Lead, User, ContactSubmission, NewsletterSubscription } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

exports.getDashboard = async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      todayLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      convertedLeads,
      totalUsers,
      contactMessages,
      newsletterSubscribers,
      recentLeads,
    ] = await Promise.all([
      Lead.count(),
      Lead.count({ where: { created_at: { [Op.gte]: today } } }),
      Lead.count({ where: { status: 'new' } }),
      Lead.count({ where: { status: 'contacted' } }),
      Lead.count({ where: { status: 'qualified' } }),
      Lead.count({ where: { status: 'converted' } }),
      User.count(),
      ContactSubmission.count(),
      NewsletterSubscription.count({ where: { is_active: true } }),
      Lead.findAll({
        limit: 8,
        order: [['created_at', 'DESC']],
        include: [{ model: User, as: 'assignedUser', attributes: ['id', 'first_name', 'last_name'] }],
      }),
    ]);

    return successResponse(res, {
      total_leads: totalLeads,
      today_leads: todayLeads,
      new_leads: newLeads,
      contacted_leads: contactedLeads,
      qualified_leads: qualifiedLeads,
      converted_leads: convertedLeads,
      total_users: totalUsers,
      contact_messages: contactMessages,
      newsletter_subscribers: newsletterSubscribers,
      recent_leads: recentLeads,
    }, 'Dashboard data fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch dashboard', 500);
  }
};
