const { errorResponse } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${message}`);

  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  return errorResponse(res, statusCode, message);
};

module.exports = errorHandler;
