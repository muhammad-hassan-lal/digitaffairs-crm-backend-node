module.exports = (permissionName) => (req, res, next) => {
  const roles = req.user?.roles || [];
  const permissions = req.user?.permissions || [];

  if (roles.includes('admin') || permissions.includes(permissionName)) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Permission denied' });
};
