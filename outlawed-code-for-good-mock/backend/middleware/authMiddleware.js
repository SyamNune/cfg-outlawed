const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
        return res.status(401).json({ error: { message: 'Not authorized, invalid token provided' } });
      }

      const decoded = jwt.verify(
        token,
        process.env.AUTH_SECRET || 'nyaayasetu_super_secret_jwt_key_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        // Fallback user if token is valid demo token
        req.user = {
          _id: decoded.id,
          name: decoded.name || 'Demo User',
          role: decoded.role || 'nyaaya_mitra',
          district: decoded.district || 'Bengaluru Urban'
        };
      }
      return next();
    } catch (error) {
      return res.status(401).json({ 
        error: { 
          message: error.name === 'TokenExpiredError' 
            ? 'Session expired. Please log in again.' 
            : 'Authentication token is invalid or malformed. Please log in again.' 
        } 
      });
    }
  }

  // If no token
  return res.status(401).json({ error: { message: 'Not authorized, no token provided' } });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: `User role '${req.user?.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
        }
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
