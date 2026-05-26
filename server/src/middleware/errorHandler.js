module.exports = function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const payload = {
    error: err.publicMessage || err.message || 'Internal server error',
  };
  if (err.code) payload.code = err.code;

  if (status >= 500) {
    console.error('[error]', err);
    payload.error = 'Internal server error';
  }

  res.status(status).json(payload);
};
