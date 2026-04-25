const { z } = require('zod');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(plans) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!plans.includes(req.user.plan)) {
      return res.status(403).json({ error: 'Plan upgrade required' });
    }
    
    next();
  };
}

// Validation schemas
const schemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional()
  }),
  
  login: z.object({
    email: z.string().email(),
    password: z.string()
  }),
  
  createAnalysis: z.object({
    url: z.string().url(),
    options: z.object({
      include_competitors: z.boolean().default(true),
      competitor_count: z.number().int().min(1).max(10).default(3),
      check_ki_readiness: z.boolean().default(true)
    }).optional()
  }),
  
  createBrief: z.object({
    suggestion_id: z.string().uuid()
  })
};

function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors
      });
    }
  };
}

module.exports = {
  generateTokens,
  authenticate,
  authorize,
  schemas,
  validate
};
