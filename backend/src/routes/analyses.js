const express = require('express');
const { authenticate, schemas, validate } = require('../middleware/auth');
const analysisModel = require('../models/analysis.model');
const analysisService = require('../services/analysis.service');

const router = express.Router();

router.post('/', authenticate, validate(schemas.createAnalysis), async (req, res, next) => {
  try {
    const { url, options } = req.body;
    const domain = new URL(url).hostname;
    
    // Create analysis record
    const analysis = await analysisModel.create({
      user_id: req.user.id,
      url,
      domain
    });
    
    // Start analysis in background (simplified - in production use queue)
    analysisService.runAnalysis(analysis.id).catch(console.error);
    
    res.status(202).json({
      analysis_id: analysis.id,
      status: 'queued',
      estimated_seconds: 60
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const analyses = await analysisModel.getByUser(req.user.id, req.query.limit || 50, req.query.offset || 0);
    res.json(analyses);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await analysisModel.getById(req.params.id);
    
    if (!analysis || analysis.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/status', authenticate, async (req, res, next) => {
  try {
    const analysis = await analysisModel.getById(req.params.id);
    
    if (!analysis || analysis.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json({ status: analysis.status, completed_at: analysis.completed_at });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await analysisModel.getById(req.params.id);
    
    if (!analysis || analysis.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    await analysisModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
