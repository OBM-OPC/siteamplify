const express = require('express');
const { authenticate } = require('../middleware/auth');
const pool = require('../db');

const router = express.Router({ mergeParams: true });

router.get('/:id/suggestions', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM page_suggestions WHERE analysis_id = $1 ORDER BY priority_score DESC',
      [req.params.id]
    );
    
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/suggestions/:suggestionId', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM page_suggestions WHERE id = $1 AND analysis_id = $2',
      [req.params.suggestionId, req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
