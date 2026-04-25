const express = require('express');
const { authenticate } = require('../middleware/auth');
const { run, get } = require('../db');
const aiService = require('../services/ai.service');

const router = express.Router();

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const row = await get('SELECT * FROM content_briefs WHERE id = ?', [req.params.id]);
    
    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Parse JSON fields
    row.outline = JSON.parse(row.outline || '[]');
    row.key_points = JSON.parse(row.key_points || '[]');
    row.internal_link_suggestions = JSON.parse(row.internal_link_suggestions || '[]');
    row.generated_schema = JSON.parse(row.generated_schema || '{}');
    
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/generate', authenticate, async (req, res, next) => {
  try {
    const brief = await get('SELECT * FROM content_briefs WHERE id = ?', [req.params.id]);
    
    if (!brief) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Generate content
    const generatedContent = await aiService.generateContent({
      target_audience: brief.target_audience,
      tone_of_voice: brief.tone_of_voice,
      word_count_target: brief.word_count_target,
      outline: JSON.parse(brief.outline || '[]'),
      key_points: JSON.parse(brief.key_points || '[]')
    });
    
    // Save
    await run(
      `UPDATE content_briefs SET 
        generated_content = ?,
        generated_title = ?,
        generated_meta = ?,
        generated_at = datetime('now')
      WHERE id = ?`,
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
    const suggestion = await get(
      `SELECT ps.*, a.raw_data, a.url 
       FROM page_suggestions ps 
       JOIN analyses a ON ps.analysis_id = a.id 
       WHERE ps.id = ?`,
      [suggestion_id]
    );
    
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    const analysisData = JSON.parse(suggestion.raw_data || '{}');
    
    // Generate brief
    const brief = await aiService.generateBrief(analysisData, [], suggestion);
    
    // Save brief
    const result = await run(
      `INSERT INTO content_briefs 
       (suggestion_id, analysis_id, target_audience, tone_of_voice, word_count_target,
        outline, key_points, title_suggestion, meta_description_suggestion, internal_link_suggestions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        suggestion_id,
        suggestion.analysis_id,
        brief.target_audience,
        brief.tone_of_voice,
        brief.word_count_target,
        JSON.stringify(brief.outline || []),
        JSON.stringify(brief.key_points || []),
        brief.title_suggestion,
        brief.meta_description_suggestion,
        JSON.stringify(brief.internal_link_suggestions || [])
      ]
    );
    
    // Update suggestion status
    await run(
      "UPDATE page_suggestions SET status = 'brief_created' WHERE id = ?",
      [suggestion_id]
    );
    
    // Return created brief
    const createdBrief = await get('SELECT * FROM content_briefs WHERE id = ?', [result.id]);
    createdBrief.outline = JSON.parse(createdBrief.outline || '[]');
    createdBrief.key_points = JSON.parse(createdBrief.key_points || '[]');
    createdBrief.internal_link_suggestions = JSON.parse(createdBrief.internal_link_suggestions || '[]');
    
    res.status(201).json(createdBrief);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
