module.exports = (req, res, next) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 20;

  if (page < 1) return res.status(400).json({ success: false, message: 'Invalid page number' });
  if (limit < 1 || limit > 200) return res.status(400).json({ success: false, message: 'Invalid limit value' });

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
};
