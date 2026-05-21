const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Role, UserRole } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const includeRoles = [{ model: UserRole, as: 'user_roles', include: [{ model: Role, as: 'role' }] }];

const formatUser = (user) => {
  const json = user.toJSON();
  delete json.password;
  json.roles = (json.user_roles || []).map((ur) => ur.role).filter(Boolean);
  delete json.user_roles;
  return json;
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = req.pagination;
    const { search, is_active } = req.query;
    const where = {};

    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === '1';
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      include: includeRoles,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return successResponse(res, rows.map(formatUser), 'Users fetched successfully', 200, {
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit),
    });
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch users', 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: includeRoles });
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, formatUser(user), 'User fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch user', 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, role_ids = [] } = req.body;

    const exists = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (exists) return errorResponse(res, 'Username or email already exists', 400);

    const user = await User.create({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      first_name,
      last_name,
      phone,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (role_ids.length) {
      await UserRole.bulkCreate(role_ids.map((role_id) => ({ user_id: user.id, role_id })));
    }

    const createdUser = await User.findByPk(user.id, { include: includeRoles });
    return successResponse(res, formatUser(createdUser), 'User created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to create user', 500);
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    const { username, email, password, first_name, last_name, phone, is_active, role_ids } = req.body;

    if ((username && username !== user.username) || (email && email !== user.email)) {
      const exists = await User.findOne({
        where: {
          id: { [Op.ne]: user.id },
          [Op.or]: [{ username: username || user.username }, { email: email || user.email }],
        },
      });
      if (exists) return errorResponse(res, 'Username or email already exists', 400);
    }

    const data = { username, email, first_name, last_name, phone, is_active, updated_at: new Date() };
    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
    if (password) data.password = await bcrypt.hash(password, 10);

    await user.update(data);

    if (Array.isArray(role_ids)) {
      await UserRole.destroy({ where: { user_id: user.id } });
      if (role_ids.length) await UserRole.bulkCreate(role_ids.map((role_id) => ({ user_id: user.id, role_id })));
    }

    const updatedUser = await User.findByPk(user.id, { include: includeRoles });
    return successResponse(res, formatUser(updatedUser), 'User updated successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to update user', 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    await user.destroy();
    return successResponse(res, null, 'User deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to delete user', 500);
  }
};
