const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.isAuthenticated = async (req, res, next) => {
  let token = req.cookies.token;

// Also check Authorization header if token not found in cookies
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
