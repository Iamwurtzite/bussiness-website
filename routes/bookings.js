/**
 * ============================================================
 *  NAISHVI CELEBRATIONS — Booking Routes  (/api/bookings)
 * ============================================================
 *  POST /           — create a new booking (customer)
 *  GET  /           — list bookings (admin=all, customer=own)
 *  GET  /:id        — booking details
 *  PUT  /:id/status — update booking status (admin only)
 * ============================================================
 */

const express = require('express');
const { authenticate, authorizeRole } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();

  // All booking routes require authentication
  router.use(authenticate);

  // ─── POST / — Create Booking ────────────────────────────────
  router.post('/', (req, res) => {
    try {
      const { event_type, event_date, location, guest_count, budget, package_id, service_ids } = req.body;

      if (!event_type) {
        return res.status(400).json({ error: 'Event type is required.' });
      }

      const info = db.prepare(`
        INSERT INTO bookings (user_id, event_type, event_date, location, guest_count, budget, package_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        event_type,
        event_date || null,
        location || null,
        guest_count || null,
        budget || null,
        package_id || null
      );

      const bookingId = info.lastInsertRowid;

      // Attach selected services (if any)
      if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
        const insertBS = db.prepare('INSERT INTO booking_services (booking_id, service_id) VALUES (?, ?)');
        const insertMany = db.transaction((ids) => {
          for (const sid of ids) {
            insertBS.run(bookingId, sid);
          }
        });
        insertMany(service_ids);
      }

      res.status(201).json({
        message: 'Booking created successfully!',
        booking: { id: bookingId, event_type, status: 'pending' }
      });
    } catch (err) {
      console.error('Create booking error:', err);
      res.status(500).json({ error: 'Server error while creating booking.' });
    }
  });

  // ─── GET / — List Bookings ──────────────────────────────────
  router.get('/', (req, res) => {
    try {
      let bookings;

      if (req.user.role === 'admin') {
        // Admin sees all bookings with user info
        bookings = db.prepare(`
          SELECT b.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
                 p.name AS package_name, p.tier AS package_tier
          FROM bookings b
          LEFT JOIN users u ON b.user_id = u.id
          LEFT JOIN packages p ON b.package_id = p.id
          ORDER BY b.created_at DESC
        `).all();
      } else {
        // Customer sees only their own bookings
        bookings = db.prepare(`
          SELECT b.*, p.name AS package_name, p.tier AS package_tier
          FROM bookings b
          LEFT JOIN packages p ON b.package_id = p.id
          WHERE b.user_id = ?
          ORDER BY b.created_at DESC
        `).all(req.user.id);
      }

      res.json({ bookings });
    } catch (err) {
      console.error('List bookings error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── GET /:id — Booking Details ─────────────────────────────
  router.get('/:id', (req, res) => {
    try {
      const booking = db.prepare(`
        SELECT b.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
               p.name AS package_name, p.tier AS package_tier, p.price AS package_price
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN packages p ON b.package_id = p.id
        WHERE b.id = ?
      `).get(req.params.id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found.' });
      }

      // Customers can only view their own bookings
      if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden.' });
      }

      // Fetch attached services
      const services = db.prepare(`
        SELECT s.* FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id = ?
      `).all(req.params.id);

      // Fetch vendor assignments
      const vendors = db.prepare(`
        SELECT va.*, v.business_name, v.category, v.city, v.rating
        FROM vendor_assignments va
        JOIN vendors v ON va.vendor_id = v.id
        WHERE va.booking_id = ?
      `).all(req.params.id);

      // Fetch quotation (if any)
      const quotation = db.prepare(`
        SELECT * FROM quotations WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(req.params.id);

      let quotation_items = [];
      if (quotation) {
        quotation_items = db.prepare(
          'SELECT * FROM quotation_items WHERE quotation_id = ?'
        ).all(quotation.id);
      }

      res.json({
        booking,
        services,
        vendors,
        quotation: quotation ? { ...quotation, items: quotation_items } : null
      });
    } catch (err) {
      console.error('Booking detail error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── PUT /:id/status — Update Status (admin) ───────────────
  router.put('/:id/status', authorizeRole('admin'), (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      }

      const existing = db.prepare('SELECT id FROM bookings WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Booking not found.' });
      }

      db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);

      res.json({ message: `Booking #${req.params.id} updated to "${status}".` });
    } catch (err) {
      console.error('Update status error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  return router;
};
