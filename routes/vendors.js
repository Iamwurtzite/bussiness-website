/**
 * ============================================================
 *  NAISHVI CELEBRATIONS — Vendor Routes  (/api/vendors)
 * ============================================================
 *  GET  /                       — list all vendors (public)
 *  POST /assign                 — assign vendor to booking (admin)
 *  GET  /assignments/:vendorId  — vendor's assignments
 * ============================================================
 */

const express = require('express');
const { authenticate, authorizeRole } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();

  // ─── GET / — List All Vendors (public) ──────────────────────
  router.get('/', (req, res) => {
    try {
      const { category, city } = req.query;

      let where = '1 = 1';
      const params = [];

      if (category) {
        where += ' AND v.category = ?';
        params.push(category);
      }
      if (city) {
        where += ' AND v.city = ?';
        params.push(city);
      }

      const vendors = db.prepare(`
        SELECT v.*, u.email, u.phone
        FROM vendors v
        LEFT JOIN users u ON v.user_id = u.id
        WHERE ${where}
        ORDER BY v.rating DESC
      `).all(...params);

      res.json({ vendors });
    } catch (err) {
      console.error('List vendors error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── POST /assign — Assign Vendor to Booking (admin) ───────
  router.post('/assign', authenticate, authorizeRole('admin'), (req, res) => {
    try {
      const { booking_id, vendor_id, service_type } = req.body;

      if (!booking_id || !vendor_id) {
        return res.status(400).json({ error: 'booking_id and vendor_id are required.' });
      }

      // Verify booking exists
      const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(booking_id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found.' });
      }

      // Verify vendor exists
      const vendor = db.prepare('SELECT id, business_name FROM vendors WHERE id = ?').get(vendor_id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found.' });
      }

      // Check for duplicate assignment
      const existing = db.prepare(`
        SELECT id FROM vendor_assignments WHERE booking_id = ? AND vendor_id = ?
      `).get(booking_id, vendor_id);

      if (existing) {
        return res.status(409).json({ error: 'This vendor is already assigned to this booking.' });
      }

      const info = db.prepare(`
        INSERT INTO vendor_assignments (booking_id, vendor_id, service_type, status)
        VALUES (?, ?, ?, 'assigned')
      `).run(booking_id, vendor_id, service_type || null);

      res.status(201).json({
        message: `${vendor.business_name} assigned to booking #${booking_id}.`,
        assignment: { id: info.lastInsertRowid, booking_id, vendor_id, service_type }
      });
    } catch (err) {
      console.error('Assign vendor error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── GET /assignments/:vendorId — Vendor's Assignments ─────
  router.get('/assignments/:vendorId', authenticate, (req, res) => {
    try {
      // Vendors can see their own; admins can see anyone's
      if (req.user.role === 'vendor') {
        const vendor = db.prepare('SELECT id FROM vendors WHERE user_id = ?').get(req.user.id);
        if (!vendor || vendor.id !== parseInt(req.params.vendorId)) {
          return res.status(403).json({ error: 'Forbidden.' });
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden.' });
      }

      const assignments = db.prepare(`
        SELECT va.*, b.event_type, b.event_date, b.location, b.guest_count,
               u.name AS customer_name, u.phone AS customer_phone
        FROM vendor_assignments va
        JOIN bookings b ON va.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        WHERE va.vendor_id = ?
        ORDER BY b.event_date DESC
      `).all(req.params.vendorId);

      res.json({ assignments });
    } catch (err) {
      console.error('Vendor assignments error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  return router;
};
