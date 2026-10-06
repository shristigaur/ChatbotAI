const jwt = require('jsonwebtoken');

// Middleware to protect routes and verify the JWT token
const auth = (req, res, next) => {
  try {
    // Look for the Authorization header
    const authHeader = req.header('Authorization');
    
    // Check if header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    // Extract the token ("Bearer <token>" -> "<token>")
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the profileId from the decoded token to the request object
    req.profileId = decoded.profileId;
    
    // Move on to the next function (the actual route handler)
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = auth;
