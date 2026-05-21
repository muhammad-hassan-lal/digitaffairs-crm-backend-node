const { ContactSubmission, NewsletterSubscription } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

exports.contact = async (req, res) => {
  try {
    const submission = await ContactSubmission.create({
      ...req.body,
      ip_address: req.ip || null,
      user_agent: req.headers['user-agent'] || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return successResponse(res, submission, 'Your message has been sent successfully.', 201);
  } catch (err) {
    console.error('Contact submission error:', err);
    return errorResponse(res, 'Failed to send message', 500);
  }
};

exports.newsletter = async (req, res) => {
  try {
    const [subscription, created] = await NewsletterSubscription.findOrCreate({
      where: { email: req.body.email },
      defaults: { email: req.body.email, source: req.body.source || 'website' },
    });

    if (!created && subscription.is_active) {
      return errorResponse(res, 'Email already subscribed', 409);
    }

    if (!subscription.is_active) {
      await subscription.update({ is_active: true, updated_at: new Date() });
    }

    return successResponse(res, subscription, 'Subscribed successfully.', 201);
  } catch (err) {
    console.error('Newsletter error:', err);
    return errorResponse(res, 'Failed to subscribe', 500);
  }
};
