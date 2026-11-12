/**
 * ============================================================
 *  NAISHVI CELEBRATIONS — Quotation Routes  (/api/quotations)
 * ============================================================
 *  Additional quotation endpoints available outside admin scope.
 *
 *  GET  /:id         — get a quotation by its own ID
 *  PUT  /:id/status  — update quotation status (admin)
 * ============================================================
 */

const express = require('express');
const { authenticate, authorizeRole } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();

  // All routes need auth
  router.use(authenticate);

  // ─── GET /:id — Get Quotation by ID ─────────────────────────
  router.get('/:id', (req, res) => {
    try {
      const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id);

      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found.' });
      }

      // Customers can only see quotations for their own bookings
      if (req.user.role !== 'admin') {
        const booking = db.prepare('SELECT user_id FROM bookings WHERE id = ?').get(quotation.booking_id);
        if (!booking || booking.user_id !== req.user.id) {
          return res.status(403).json({ error: 'Forbidden.' });
        }
      }

      const items = db.prepare(
        'SELECT * FROM quotation_items WHERE quotation_id = ?'
      ).all(quotation.id);

      res.json({ quotation: { ...quotation, items } });
    } catch (err) {
      console.error('Get quotation error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── PUT /:id/status — Update Quotation Status ─────────────
  router.put('/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['draft', 'sent', 'approved', 'rejected'];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      }

      const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found.' });
      }

      // Only admin can change to draft/sent; customer can approve/reject
      if (['draft', 'sent'].includes(status) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can set this status.' });
      }

      if (['approved', 'rejected'].includes(status) && req.user.role === 'vendor') {
        return res.status(403).json({ error: 'Forbidden.' });
      }

      db.prepare('UPDATE quotations SET status = ? WHERE id = ?').run(status, req.params.id);

      res.json({ message: `Quotation #${req.params.id} updated to "${status}".` });
    } catch (err) {
      console.error('Update quotation status error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  return router;
};
