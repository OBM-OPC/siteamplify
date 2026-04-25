const express = require('express');
const { authenticate } = require('../middleware/auth');
const { get } = require('../db');

const router = express.Router();

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const row = await get(
      'SELECT id, email, name, plan, analyses_used, analyses_limit, briefs_used, briefs_limit, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const row = await get(
      'SELECT analyses_used, analyses_limit, briefs_used, briefs_limit FROM users WHERE id = ?',
      [req.user.id]
    );
    
    res.json(row);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
