const express = require('express');
const { authenticate } = require('../middleware/auth');
const { all, get } = require('../db');

const router = express.Router({ mergeParams: true });

router.get('/:id/suggestions', authenticate, async (req, res, next) => {
  try {
    const rows = await all(
      'SELECT * FROM page_suggestions WHERE analysis_id = ? ORDER BY priority_score DESC',
      [req.params.id]
    );
    
    // Parse JSON fields
    const suggestions = rows.map(row => ({
      ...row,
      secondary_keywords: JSON.parse(row.secondary_keywords || '[]'),
      status: row.status
    }));
    
    res.json(suggestions);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/suggestions/:suggestionId', authenticate, async (req, res, next) => {
  try {
    const row = await get(
      'SELECT * FROM page_suggestions WHERE id = ? AND analysis_id = ?',
      [req.params.suggestionId, req.params.id]
    );
    
    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    row.secondary_keywords = JSON.parse(row.secondary_keywords || '[]');
    res.json(row);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
