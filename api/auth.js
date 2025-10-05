// Simple JWT authentication backend (Node.js/Express)
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Development-only users (do not use in production). Remove before publishing production systems.
const USERS = [
  // To run locally, set JWT_SECRET in your environment and use secure passwords.
];

if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. For local development, set JWT_SECRET in your environment. Do NOT use default secrets in production.');
}

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, role: user.role });
});

// Middleware to protect routes
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = { router, authenticateJWT };
