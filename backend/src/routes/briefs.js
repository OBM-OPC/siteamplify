const express = require('express');
const { authenticate } = require('../middleware/auth');
const pool = require('../db');
const aiService = require('../services/ai.service');
const analysisModel = require('../models/analysis.model');

const router = express.Router();

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM content_briefs WHERE id = $1',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/generate', authenticate, async (req, res, next) => {
  try {
    // Get brief
    const { rows: briefRows } = await pool.query(
      'SELECT * FROM content_briefs WHERE id = $1',
      [req.params.id]
    );
    
    if (briefRows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const brief = briefRows[0];
    
    // Generate content
    const generatedContent = await aiService.generateContent({
      target_audience: brief.target_audience,
      tone_of_voice: brief.tone_of_voice,
      word_count_target: brief.word_count_target,
      outline: brief.outline,
      key_points: brief.key_points
    });
    
    // Save
    await pool.query(
      `UPDATE content_briefs SET 
        generated_content = $1,
        generated_title = $2,
        generated_meta = $3,
        generated_at = NOW()
      WHERE id = $4`,
      [generatedContent, brief.title_suggestion, brief.meta_description_suggestion, req.params.id]
    );
    
    res.json({ 
      brief_id: req.params.id,
      status: 'generated',
      content_length: generatedContent.length
    });
  } catch (err) {
    next(err);
  }
});

router.post('/create', authenticate, async (req, res, next) => {
  try {
    const { suggestion_id } = req.body;
    
    // Get suggestion + analysis data
    const { rows: suggestionRows } = await pool.query(
      `SELECT ps.*, a.raw_data, a.url 
       FROM page_suggestions ps 
       JOIN analyses a ON ps.analysis_id = a.id 
       WHERE ps.id = $1`,
      [suggestion_id]
    );
    
    if (suggestionRows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    const suggestion = suggestionRows[0];
    const analysisData = suggestion.raw_data;
    
    // Generate brief
    const brief = await aiService.generateBrief(analysisData, [], suggestion);
    
    // Save brief
    const { rows } = await pool.query(
      `INSERT INTO content_briefs 
       (suggestion_id, analysis_id, target_audience, tone_of_voice, word_count_target,
        outline, key_points, title_suggestion, meta_description_suggestion, internal_link_suggestions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        suggestion_id,
        suggestion.analysis_id,
        brief.target_audience,
        brief.tone_of_voice,
        brief.word_count_target,
        JSON.stringify(brief.outline),
        JSON.stringify(brief.key_points),
        brief.title_suggestion,
        brief.meta_description_suggestion,
        JSON.stringify(brief.internal_link_suggestions || [])
      ]
    );
    
    // Update suggestion status
    await pool.query(
      "UPDATE page_suggestions SET status = 'brief_created' WHERE id = $1",
      [suggestion_id]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
