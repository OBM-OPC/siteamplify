const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { generateTokens, schemas, validate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(schemas.register), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, plan',
      [email, hashedPassword, name || null]
    );
    
    const tokens = generateTokens(rows[0]);
    
    res.status(201).json({
      user: rows[0],
      ...tokens
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const { rows } = await pool.query(
      'SELECT id, email, name, password_hash, plan FROM users WHERE email = $1',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = rows[0];
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
