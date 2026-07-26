const logger = (req, res, next) => {
  const start = process.hrtime.bigint();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    const { statusCode } = res;
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${method} ${originalUrl} ${statusCode} - ${durationMs.toFixed(2)}ms`,
    );
  });

  next();
};

module.exports = logger;
