const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get } = require('../db');
const { generateTokens, schemas, validate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(schemas.register), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name || null]
    );
    
    const user = await get(
      'SELECT id, email, name, plan FROM users WHERE id = ?',
      [result.id]
    );
    
    const tokens = generateTokens(user);
    
    res.status(201).json({
      user,
      ...tokens
    });
  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }
});

router.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await get(
      'SELECT id, email, name, password_hash, plan FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    delete user.password_hash;
    const tokens = generateTokens(user);
    
    res.json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
