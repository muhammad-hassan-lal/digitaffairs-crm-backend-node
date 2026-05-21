const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, UserRole, Role, Permission } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const userInclude = [
  {
    model: UserRole,
    as: 'user_roles',
    include: [
      {
        model: Role,
        as: 'role',
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      },
    ],
  },
];

const formatUserForAuth = (user) => {
  const roles = (user.user_roles || [])
    .map((ur) => ur.role)
    .filter(Boolean)
    .map((role) => ({ id: role.id, name: role.name, description: role.description }));

  const permissions = [
    ...new Set(
      (user.user_roles || [])
        .flatMap((ur) => ur.role?.permissions || [])
        .map((permission) => permission.name)
        .filter(Boolean)
    ),
  ];

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      profile_image: user.profile_image,
      roles,
      permissions,
    },
    roles: roles.map((role) => role.name),
    permissions,
  };
};

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOne({
      where: { [Op.or]: [{ username: login }, { email: login }] },
      include: userInclude,
    });

    if (!user || !user.is_active) {
      return errorResponse(res, 'Invalid username/email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password.replace('$2y$', '$2a$'));
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid username/email or password', 401);
    }

    const formatted = formatUserForAuth(user);
    const token = jwt.sign(
      { id: user.id, roles: formatted.roles, permissions: formatted.permissions },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await user.update({ last_login: new Date(), updated_at: new Date() });

    return successResponse(res, { token, user: formatted.user }, `Welcome back, ${user.first_name || user.username}`);
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, err.message || 'Login failed', 500);
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: userInclude });
    if (!user) return errorResponse(res, 'User not found', 404);

    return successResponse(res, formatUserForAuth(user).user, 'Profile fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch profile', 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (exists) return errorResponse(res, 'Email already in use', 400);
    }

    const updateData = { first_name, last_name, email, phone, updated_at: new Date() };
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await user.update(updateData);
    return successResponse(res, null, 'Profile updated successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to update profile', 500);
  }
};
