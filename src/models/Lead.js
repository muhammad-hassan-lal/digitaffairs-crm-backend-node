const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Lead = sequelize.define('leads', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: true },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  company_name: { type: DataTypes.STRING(150), allowNull: true },
  service: { type: DataTypes.STRING(150), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: true },
  reference: { type: DataTypes.STRING(255), allowNull: true },
  utm_source: { type: DataTypes.STRING(255), allowNull: true },
  utm_medium: { type: DataTypes.STRING(255), allowNull: true },
  utm_campaign: { type: DataTypes.STRING(255), allowNull: true },
  utm_term: { type: DataTypes.STRING(255), allowNull: true },
  gclid: { type: DataTypes.STRING(255), allowNull: true },
  source: {
    type: DataTypes.ENUM('website', 'contact_form', 'newsletter', 'facebook', 'instagram', 'google', 'whatsapp', 'referral', 'other'),
    allowNull: false,
    defaultValue: 'website',
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'closed', 'spam'),
    allowNull: false,
    defaultValue: 'new',
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
  },
  assigned_to: { type: DataTypes.INTEGER, allowNull: true },
  last_contacted_at: { type: DataTypes.DATE, allowNull: true },
  next_followup_at: { type: DataTypes.DATE, allowNull: true },
  admin_note: { type: DataTypes.TEXT, allowNull: true },
  ip_address: { type: DataTypes.STRING(100), allowNull: true },
  user_agent: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: 'leads' });

Lead.associate = (models) => {
  Lead.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'assignedUser', onDelete: 'SET NULL' });
};

module.exports = Lead;
