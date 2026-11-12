/**
 * ============================================================
 *  NAISHVI CELEBRATIONS — Contact Routes  (/api/contact)
 * ============================================================
 *  POST /  — submit a contact form message (public)
 *  GET  /  — list all messages (admin only)
 * ============================================================
 */

const express = require('express');
const { authenticate, authorizeRole } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();

  // ─── POST / — Submit Contact Form (public) ──────────────────
  router.post('/', (req, res) => {
    try {
      const { name, email, phone, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
      }

      // Basic email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      db.prepare(`
        INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)
      `).run(name, email, phone || null, message);

      res.status(201).json({
        message: 'Thank you for contacting us! We will get back to you soon.'
      });
    } catch (err) {
      console.error('Contact form error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── GET / — List Messages (admin only) ────────────────────
  router.get('/', authenticate, authorizeRole('admin'), (req, res) => {
    try {
      const messages = db.prepare(
        'SELECT * FROM contact_messages ORDER BY created_at DESC'
      ).all();

      res.json({ messages });
    } catch (err) {
      console.error('List messages error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  return router;
};
