const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ContactSubmission = sequelize.define('contact_submissions', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: true },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  subject: { type: DataTypes.STRING(200), allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('new', 'read', 'replied', 'spam'), allowNull: false, defaultValue: 'new' },
  ip_address: { type: DataTypes.STRING(100), allowNull: true },
  user_agent: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: 'contact_submissions' });

module.exports = ContactSubmission;
