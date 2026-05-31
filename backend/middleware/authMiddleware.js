const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

const getBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

exports.protect = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Authorization token is missing." });
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found for this token." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    return next(error);
  }
};
