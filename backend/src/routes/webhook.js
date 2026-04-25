const express = require('express');

const router = express.Router();

router.post('/stripe', (req, res) => {
  // Stripe webhook handling would go here
  // For now, just acknowledge
  res.json({ received: true });
});

module.exports = router;
