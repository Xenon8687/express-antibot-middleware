/*
* Made as a middleware due to improve performance albeit a little.
* */

var geoip = require('geoip-lite');

module.exports = (req, res, next) => {
  if(req.clientIP != "0.0.0.0") req.geo = geoip.lookup(req.clientIP);
  else req.geo = "l";
  next();
}