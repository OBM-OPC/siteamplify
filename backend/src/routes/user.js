const express = require('express');
const { authenticate } = require('../middleware/auth');
const pool = require('../db');

const router = express.Router();

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, plan, analyses_used, analyses_limit, briefs_used, briefs_limit, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT analyses_used, analyses_limit, briefs_used, briefs_limit FROM users WHERE id = $1',
      [req.user.id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
