const { errorResponse } = require("../utils/response");

const notFound = (req, res) => {
  return errorResponse(res, 404, `Route ${req.originalUrl} not found`);
};

module.exports = notFound;
