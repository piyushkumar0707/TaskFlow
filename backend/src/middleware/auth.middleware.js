const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token from Authorization header.
 * Attaches the full user object to req.user.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  req.user = user;
  next();
};

/**
 * Factory: returns middleware that checks if req.user.role is in allowedRoles.
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: insufficient role',
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
