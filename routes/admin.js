/**
 * ============================================================
 *  NAISHVI CELEBRATIONS — Admin Routes  (/api/admin)
 * ============================================================
 *  All routes here require admin role.
 *
 *  GET  /dashboard            — aggregate stats
 *  GET  /bookings             — all bookings with filters
 *  POST /quotations           — create quotation for a booking
 *  GET  /quotations/:bookingId — get quotation for a booking
 * ============================================================
 */

const express = require('express');
const { authenticate, authorizeRole } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();

  // All admin routes require authentication + admin role
  router.use(authenticate, authorizeRole('admin'));

  // ─── GET /dashboard — Dashboard Stats ───────────────────────
  router.get('/dashboard', (req, res) => {
    try {
      const totalBookings    = db.prepare('SELECT COUNT(*) AS count FROM bookings').get().count;
      const pendingBookings  = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE status = 'pending'").get().count;
      const confirmedBookings = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE status = 'confirmed'").get().count;
      const completedBookings = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE status = 'completed'").get().count;
      const cancelledBookings = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE status = 'cancelled'").get().count;

      const totalRevenue = db.prepare(`
        SELECT COALESCE(SUM(q.total_amount), 0) AS revenue
        FROM quotations q
        WHERE q.status = 'approved'
      `).get().revenue;

      const totalCustomers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'").get().count;
      const totalVendors   = db.prepare('SELECT COUNT(*) AS count FROM vendors').get().count;
      const totalMessages  = db.prepare('SELECT COUNT(*) AS count FROM contact_messages').get().count;

      // Recent bookings (last 5)
      const recentBookings = db.prepare(`
        SELECT b.*, u.name AS user_name, u.email AS user_email
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC LIMIT 5
      `).all();

      res.json({
        stats: {
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          totalRevenue,
          totalCustomers,
          totalVendors,
          totalMessages
        },
        recentBookings
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── GET /bookings — All Bookings with Filters ──────────────
  router.get('/bookings', (req, res) => {
    try {
      const { status, event_type, page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let where = '1 = 1';
      const params = [];

      if (status) {
        where += ' AND b.status = ?';
        params.push(status);
      }
      if (event_type) {
        where += ' AND b.event_type = ?';
        params.push(event_type);
      }

      const bookings = db.prepare(`
        SELECT b.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
               p.name AS package_name, p.tier AS package_tier
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN packages p ON b.package_id = p.id
        WHERE ${where}
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, parseInt(limit), offset);

      const total = db.prepare(`
        SELECT COUNT(*) AS count FROM bookings b WHERE ${where}
      `).all(...params)[0].count;

      res.json({ bookings, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
      console.error('Admin bookings error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── POST /quotations — Create Quotation ────────────────────
  router.post('/quotations', (req, res) => {
    try {
      const { booking_id, items } = req.body;

      if (!booking_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'booking_id and items[] are required.' });
      }

      // Verify the booking exists
      const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(booking_id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found.' });
      }

      // Calculate total
      const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

      // Insert quotation
      const qInfo = db.prepare(`
        INSERT INTO quotations (booking_id, total_amount, status) VALUES (?, ?, 'draft')
      `).run(booking_id, totalAmount);

      const quotationId = qInfo.lastInsertRowid;

      // Insert quotation items
      const insertItem = db.prepare(`
        INSERT INTO quotation_items (quotation_id, service_name, amount) VALUES (?, ?, ?)
      `);
      const insertAll = db.transaction((rows) => {
        for (const item of rows) {
          insertItem.run(quotationId, item.service_name, item.amount || 0);
        }
      });
      insertAll(items);

      res.status(201).json({
        message: 'Quotation created successfully!',
        quotation: {
          id: quotationId,
          booking_id,
          total_amount: totalAmount,
          status: 'draft',
          items
        }
      });
    } catch (err) {
      console.error('Create quotation error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });

  // ─── GET /quotations/:bookingId — Get Quotation ─────────────
  router.get('/quotations/:bookingId', (req, res) => {
    try {
      const quotation = db.prepare(`
        SELECT * FROM quotations WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(req.params.bookingId);

      if (!quotation) {
        return res.status(404).json({ error: 'No quotation found for this booking.' });
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

  return router;
};
