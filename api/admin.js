const express = require('express');
const router = express.Router();

// Middleware: require admin role (JWT must have role: 'admin')
function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// GET /api/admin/health
router.get('/admin/health', requireAdmin, (req, res) => {
  res.json({
    VERTEX_AI_KEY: !!process.env.VERTEX_AI_KEY,
    AZURE_OPENAI_KEY: !!process.env.AZURE_OPENAI_KEY,
    GPT5_MINI_KEY: !!process.env.GPT5_MINI_KEY,
    JWT_SECRET: !!process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    ZOOM_CLIENT_ID: !!process.env.ZOOM_CLIENT_ID,
    NODE_ENV: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
