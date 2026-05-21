const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('roles', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: 'roles' });

Role.associate = (models) => {
  Role.hasMany(models.UserRole, { foreignKey: 'role_id', as: 'user_roles' });
  Role.belongsToMany(models.Permission, {
    through: models.RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions',
  });
};

module.exports = Role;
