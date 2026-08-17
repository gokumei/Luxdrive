const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authorization = req.get("Authorization");

  if (typeof authorization !== "string") {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const match = /^Bearer ([^\s]+)$/.exec(authorization);

  if (!match) {
    return res.status(401).json({
      message: "Invalid authorization header",
    });
  }

  try {
    const claims = jwt.verify(
      match[1],
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    if (
      typeof claims !== "object" ||
      claims === null
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = claims;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Administrator access required",
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
};
