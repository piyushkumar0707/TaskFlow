/**
 * Send a standard success response
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Send a standard error response
 */
const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
  });
};

module.exports = { sendSuccess, sendError };
