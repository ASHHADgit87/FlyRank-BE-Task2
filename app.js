const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");
const { errorResponse, successResponse } = require("./utils/response");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }),
);
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    errorResponse(res, 429, "Too many requests, please try again later"),
});

app.use(limiter);

app.get("/", (req, res, next) => {
  if (req.headers.accept && req.headers.accept.includes("text/html")) {
    return next();
  }
  return successResponse(res, 200, "FlyRank BE Task 2 API", {
    name: "FlyRank BE Task 2",
    endpoints: [
      "GET /tasks",
      "GET /tasks/:id",
      "POST /tasks",
      "PUT /tasks/:id",
      "DELETE /tasks/:id",
      "GET /stats",
    ],
  });
});

app.use(taskRoutes);
app.use(express.static(path.join(__dirname, "public")));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
