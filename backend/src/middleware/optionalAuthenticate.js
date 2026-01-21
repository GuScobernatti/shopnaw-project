const jwt = require("jsonwebtoken");

function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return next();
    req.user = payload || {};
    if (!req.user.userId && req.user.user_id)
      req.user.userId = req.user.user_id;
    next();
  });
}

module.exports = optionalAuthenticate;
