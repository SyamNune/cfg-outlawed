module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[AI service error]', err.message);

  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'The AI service could not complete the request.'
    }
  });
};
