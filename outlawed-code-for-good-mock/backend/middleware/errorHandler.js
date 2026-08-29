/**
 * Global Error Handling Middleware
 * Catch-all for routing/controller errors. Excludes internal stack traces in non-dev environments.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  
  // Log detailed error internally
  console.error(`[Error Handler] ${err.stack || err.message || err}`);

  res.status(statusCode).json({
    error: {
      message: err.message || 'Something went wrong. Please try again.',
      status: statusCode,
      // Only include stack trace during development to avoid leaking security details
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
}

module.exports = errorHandler;
