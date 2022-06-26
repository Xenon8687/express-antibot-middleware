const config = {
  sensitivity: 2, /* Large values are more secure. But also more strict.  */
  timeout: 300000
}
/*
* request:
*   timesetamp: Number,
*   GEO:
*     range: Array<number>,
*     country: String,
*     region: String,
*     eu: String,
*     timezone: String,
*     city: String,
*     ll: Array<number>,
*     metro: Number,
*     area: Number
* */
var requesters = new Map();
/*
* requesters<IP: requester>
* */
/*
* requester:
*   requests: Array<request>
*   timeout: Number
*   sus: Boolean
* */
function resetTimeout(req, res) {
  const requester = requesters.get(req.clientIP);
  if(typeof requester.timeout !== 'undefined') clearTimeout(requester.timeout);
  requesters.get(req.clientIP).sus = true;
  requesters.get(req.clientIP).timeout = setTimeout(() => {
    requesters.get(req.clientIP).requests = [];
    requesters.get(req.clientIP).sus = false;
  }, config.timeout);
  return res.json({error: "You sent requests very suspiciously. Please wait a bit. Over again. (About 5 minutes. You can try not to send requests this time.)"}).status(401).end();
}
module.exports = (req, res, next) => {
  //if(req.originalUrl.includes("/api")) {
    var requester = requesters.get(req.clientIP);
    if(requesters.has(req.clientIP)) {
      if(requester.sus) return resetTimeout(req, res);
      var reqs = requester.requests;
      if(reqs.length >= 3) {
        if(reqs.every((x) => req.geo.country == x.GEO.country && req.geo.region == x.GEO.region && req.geo.city == x.GEO.city)) {
          var newRequester = requester;
          newRequester.requests = reqs.concat([{timesetamp: new Date().getTime(), GEO: req.geo}])
          requesters.set(req.clientIP, newRequester);
          reqs = requesters.get(req.clientIP).requests;
          requester = requesters.get(req.clientIP);
        }else {
          requesters.delete(req.clientIP);
          return next();
        }
        var timeIntervals = [];
        for(var i = 0;i<reqs.length;i++) {
          if(i === 0 || i === reqs.length) continue;
          var r = reqs[i];
          var pr = reqs[i - 1];
          timeIntervals[timeIntervals.length + 1] = r.timesetamp - pr.timesetamp;
        }
        var a = timeIntervals.reduce((partialSum, b) => partialSum + b, 0) / timeIntervals.length;
        if(a / 1000 < config.sensitivity) {
          return resetTimeout(req, res);
        }
      }else {
        var newRequester = requester;
        newRequester.requests = reqs.concat([{timesetamp: new Date().getTime(), GEO: req.geo}])
        requesters.set(req.clientIP, newRequester);
      }
    }else {
      requesters.set(req.clientIP, {sus: false, timeout: undefined, requests: [{timesetamp: new Date().getTime(), GEO: req.geo}]});
    }
  //}
  next();
}