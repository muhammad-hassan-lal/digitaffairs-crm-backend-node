const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NewsletterSubscription = sequelize.define('newsletter_subscriptions', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  source: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'website' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: 'newsletter_subscriptions' });

module.exports = NewsletterSubscription;
