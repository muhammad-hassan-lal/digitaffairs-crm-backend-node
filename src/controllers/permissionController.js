const { Role, Permission, RolePermission } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

exports.getRoles = async (_req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      order: [['id', 'ASC']],
    });
    return successResponse(res, roles, 'Roles fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch roles', 500);
  }
};

exports.createRole = async (req, res) => {
  try {
    const role = await Role.create({ ...req.body, created_at: new Date(), updated_at: new Date() });
    return successResponse(res, role, 'Role created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to create role', 500);
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return errorResponse(res, 'Role not found', 404);
    await role.update({ ...req.body, updated_at: new Date() });
    return successResponse(res, role, 'Role updated successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to update role', 500);
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return errorResponse(res, 'Role not found', 404);
    await role.destroy();
    return successResponse(res, null, 'Role deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to delete role', 500);
  }
};

exports.getPermissions = async (_req, res) => {
  try {
    const permissions = await Permission.findAll({ order: [['name', 'ASC']] });
    return successResponse(res, permissions, 'Permissions fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch permissions', 500);
  }
};

exports.assignPermissionsToRole = async (req, res) => {
  try {
    const { role_id, permission_ids } = req.body;
    const role = await Role.findByPk(role_id);
    if (!role) return errorResponse(res, 'Role not found', 404);

    await RolePermission.destroy({ where: { role_id } });
    if (permission_ids.length) {
      await RolePermission.bulkCreate(permission_ids.map((permission_id) => ({ role_id, permission_id })));
    }

    return successResponse(res, null, 'Permissions assigned successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to assign permissions', 500);
  }
};
