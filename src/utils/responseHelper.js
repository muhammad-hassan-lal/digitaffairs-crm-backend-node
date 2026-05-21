exports.successResponse = (res, data = null, message = 'Success', status = 200, meta = undefined) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

exports.errorResponse = (res, message = 'Something went wrong', status = 500, errors = undefined) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};
