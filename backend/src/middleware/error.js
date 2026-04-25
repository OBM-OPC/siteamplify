function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }
  
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Already exists' });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Invalid reference' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}

module.exports = { errorHandler };
