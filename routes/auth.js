/**
 * ============================================================
 *  NAISHVI CELEBRATIONS — Auth Routes  (/api/auth)
 * ============================================================
 *  POST /register  — customer sign-up
 *  POST /login     — email + password → JWT
 *  GET  /me        — return current user profile (requires token)
 * ============================================================
 */

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();

  // ─── POST /register ─────────────────────────────────────────
  router.post('/register', (req, res) => {
    try {
      const { name, email, phone, password } = req.body;

      // Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      // Check for duplicate email
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      // Hash the password
      const password_hash = bcrypt.hashSync(password, 10);

      // Insert new customer
      const info = db.prepare(`
        INSERT INTO users (name, email, phone, password_hash, role)
        VALUES (?, ?, ?, ?, 'customer')
      `).run(name, email, phone || null, password_hash);

      // Generate a JWT
      const token = jwt.sign(
        { id: info.lastInsertRowid, email, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Registration successful!',
        token,
        user: { id: info.lastInsertRowid, name, email, role: 'customer' }
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Server error during registration.' });
    }
  });

  // ─── POST /login ────────────────────────────────────────────
  router.post('/login', (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const validPassword = bcrypt.compareSync(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful!',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error during login.' });
    }
  });

  // ─── GET /me ────────────────────────────────────────────────
  router.get('/me', authenticate, (req, res) => {
    try {
      const user = db.prepare(
        'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?'
      ).get(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.json({ user });
    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  return router;
};
