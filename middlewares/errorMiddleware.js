/**
 * Express error handler middleware.
 * Add at the end of your middleware stack: app.use(errorHandler)
 */
export const errorHandler = (err, req, res, next) => {
  // log server-side
  console.error(err);

  // normalize status & message
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  const payload = { error: message };

  // include validation details if present (useful when throwing custom errors)
  if (err.details) payload.details = err.details;

  // include stack trace in non-production for debugging
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
