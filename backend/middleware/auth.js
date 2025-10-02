// backend/middleware/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];  // Bearer token
  if (!token) return res.status(403).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, "satyam");
    req.userId = decoded.id;  // Save user ID in request for further use
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { auth };
