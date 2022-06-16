module.exports = (req, res, next) => {
  req.clientIP = typeof req.ipInfo.error != "undfined" ? "0.0.0.0" : req.ipInfo.ip;
  next();
}