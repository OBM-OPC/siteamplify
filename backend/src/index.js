require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { initDB } = require('./db/init');

const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analyses');
const suggestionRoutes = require('./routes/suggestions');
const briefRoutes = require('./routes/briefs');
const userRoutes = require('./routes/user');
const webhookRoutes = require('./routes/webhook');

const { errorHandler } = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize DB
initDB().then(() => {
  console.log('📦 Database ready');
}).catch(err => {
  console.error('❌ Database init failed:', err);
  process.exit(1);
});

// Security middleware
app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stripe webhook needs raw body
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbPath: process.env.DATABASE_URL || process.env.SQLITE_PATH || '/data/siteamplify.db'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/analyses', suggestionRoutes);
app.use('/api/briefs', briefRoutes);
app.use('/api/user', userRoutes);
app.use('/webhooks', webhookRoutes);

// Error handler
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});

module.exports = app;
