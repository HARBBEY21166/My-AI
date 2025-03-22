const jwt = require('jsonwebtoken');
const { users } = require('../utils/inMemoryDb');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Authenticate user using JWT
exports.authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Check if user exists
      const user = users.find(user => user.id === decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Attach user to request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };

      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  try {
    // Get user from auth middleware
    const userId = req.user.id;

    // Find user
    const user = users.find(user => user.id === userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Admin check error' });
  }
};
