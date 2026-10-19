const jwt = require('jsonwebtoken');
require('dotenv').config();

// This function runs before any protected route
// It checks if the request has a valid login token
const protect = (req, res, next) => {

    // 1. Get the token from the request header
    // When frontend sends a request, it attaches the token like:
    // Authorization: Bearer eyJhbGc...
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not logged in. Please login first.' });
    }

    const token = authHeader.split(' ')[1]; // Get the part after "Bearer "

    // 2. Verify the token is valid and not expired
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to the request
        next(); // Move to the next function (the actual route)
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
    }
};

// This runs after protect — only allows admins
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = { protect, adminOnly };