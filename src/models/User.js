const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('users', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  first_name: { type: DataTypes.STRING(50), allowNull: true },
  last_name: { type: DataTypes.STRING(50), allowNull: true },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  profile_image: { type: DataTypes.STRING(255), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  reset_password_code: { type: DataTypes.STRING(255), allowNull: true },
  reset_password_expires: { type: DataTypes.DATE, allowNull: true },
  last_login: { type: DataTypes.DATE, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: 'users' });

User.associate = (models) => {
  User.hasMany(models.UserRole, { foreignKey: 'user_id', as: 'user_roles' });
  User.hasMany(models.Lead, { foreignKey: 'assigned_to', as: 'assigned_leads' });
};

module.exports = User;
