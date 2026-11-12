/**
 * ============================================================
 *  🎊  NAISHVI CELEBRATIONS  —  Wedding Planning Platform
 * ============================================================
 *  Main Express server.  Boots the database, mounts all routes,
 *  and serves the static front-end from /public.
 *
 *  Run:  npm install && npm start
 *  URL:  http://localhost:3000
 * ============================================================
 */

const express  = require('express');
const cors     = require('cors');
const path     = require('path');

// ─── Initialize Database ──────────────────────────────────────
const initializeDatabase = require('./database/init');
const db = initializeDatabase();

// ─── Create Express App ───────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ────────────────────────────────────────
app.use(cors());                                  // Enable CORS for all origins
app.use(express.json());                           // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));   // Parse URL-encoded bodies

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ─── Import Route Factories ──────────────────────────────────
const authRoutes       = require('./routes/auth');
const bookingRoutes    = require('./routes/bookings');
const adminRoutes      = require('./routes/admin');
const vendorRoutes     = require('./routes/vendors');
const quotationRoutes  = require('./routes/quotations');
const contactRoutes    = require('./routes/contact');

// ─── Mount Routes ────────────────────────────────────────────
app.use('/api/auth',       authRoutes(db));
app.use('/api/bookings',   bookingRoutes(db));
app.use('/api/admin',      adminRoutes(db));
app.use('/api/vendors',    vendorRoutes(db));
app.use('/api/quotations', quotationRoutes(db));
app.use('/api/contact',    contactRoutes(db));

// ─── Public Data Routes (no auth required) ────────────────────

/**
 * GET /api/events — all event types
 */
app.get('/api/events', (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY id').all();
    res.json({ events });
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /api/services/:eventId — services for a specific event
 */
app.get('/api/services/:eventId', (req, res) => {
  try {
    const services = db.prepare(
      'SELECT * FROM services WHERE event_id = ? ORDER BY id'
    ).all(req.params.eventId);
    res.json({ services });
  } catch (err) {
    console.error('Services error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /api/services — all services (optionally filtered by event_id query param)
 */
app.get('/api/services', (req, res) => {
  try {
    let services;
    if (req.query.event_id) {
      services = db.prepare(
        'SELECT * FROM services WHERE event_id = ? ORDER BY id'
      ).all(req.query.event_id);
    } else {
      services = db.prepare('SELECT * FROM services ORDER BY id').all();
    }
    res.json({ services });
  } catch (err) {
    console.error('Services error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /api/packages — all packages
 */
app.get('/api/packages', (req, res) => {
  try {
    const packages = db.prepare('SELECT * FROM packages ORDER BY price ASC').all();
    res.json({ packages });
  } catch (err) {
    console.error('Packages error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /api/gallery — gallery images
 * Returns a curated list of gallery items. In production these
 * would come from a table or cloud storage; here we return
 * static placeholders that the front-end can use.
 */
app.get('/api/gallery', (req, res) => {
  const gallery = [
    { id: 1,  title: 'Royal Mandap Setup',        category: 'Decoration',  image_url: '/images/gallery/gallery-1.jpg'  },
    { id: 2,  title: 'Bridal Mehndi',             category: 'Mehndi',      image_url: '/images/gallery/gallery-2.jpg'  },
    { id: 3,  title: 'Sangeet Night',             category: 'Sangeet',     image_url: '/images/gallery/gallery-3.jpg'  },
    { id: 4,  title: 'Haldi Ceremony',            category: 'Haldi',       image_url: '/images/gallery/gallery-4.jpg'  },
    { id: 5,  title: 'Grand Reception',           category: 'Reception',   image_url: '/images/gallery/gallery-5.jpg'  },
    { id: 6,  title: 'Floral Entrance',           category: 'Decoration',  image_url: '/images/gallery/gallery-6.jpg'  },
    { id: 7,  title: 'Couple Photography',        category: 'Photography', image_url: '/images/gallery/gallery-7.jpg'  },
    { id: 8,  title: 'Traditional Wedding',       category: 'Wedding',     image_url: '/images/gallery/gallery-8.jpg'  },
    { id: 9,  title: 'Engagement Ring Ceremony',  category: 'Engagement',  image_url: '/images/gallery/gallery-9.jpg'  },
    { id: 10, title: 'Catering Spread',           category: 'Catering',    image_url: '/images/gallery/gallery-10.jpg' },
    { id: 11, title: 'Bridal Entry',              category: 'Wedding',     image_url: '/images/gallery/gallery-11.jpg' },
    { id: 12, title: 'Stage Decoration',          category: 'Decoration',  image_url: '/images/gallery/gallery-12.jpg' },
  ];
  res.json({ gallery });
});

/**
 * GET /api/reviews — approved customer reviews
 */
app.get('/api/reviews', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `).all();
    res.json({ reviews });
  } catch (err) {
    console.error('Reviews error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Naishvi Celebrations API', timestamp: new Date().toISOString() });
});

// ─── Catch-All: Serve index.html for SPA routing ─────────────
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Page not found.' });
    }
  });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🎊 ════════════════════════════════════════════════ 🎊');
  console.log('  ║                                                    ║');
  console.log('  ║       NAISHVI CELEBRATIONS — Server Running        ║');
  console.log('  ║                                                    ║');
  console.log(`  ║       🌐  http://localhost:${PORT}                    ║`);
  console.log('  ║       📧  admin@naishvi.com / admin123             ║');
  console.log('  ║                                                    ║');
  console.log('  🎊 ════════════════════════════════════════════════ 🎊');
  console.log('');
});

// ─── Graceful Shutdown ────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n🛑  Shutting down gracefully …');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});
