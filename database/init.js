/**
 * ============================================================
 *  NAISHVI CELEBRATIONS — Database Initialization & Seed Data
 * ============================================================
 *  Uses better-sqlite3 (synchronous SQLite driver for Node.js).
 *  Creates all tables and seeds them with starter data on first run.
 * ============================================================
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'naishvi.db');

/**
 * Open (or create) the database and return the db handle.
 * Called once when the server boots.
 */
function initializeDatabase() {
  const db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // ─── CREATE TABLES ──────────────────────────────────────────

  db.exec(`
    -- Users: customers, admins, vendors
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      phone         TEXT,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin','vendor')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Event types (Engagement, Haldi, Wedding …)
    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      image_url   TEXT,
      description TEXT
    );

    -- Services offered per event
    CREATE TABLE IF NOT EXISTS services (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id    INTEGER NOT NULL,
      name        TEXT    NOT NULL,
      description TEXT,
      base_price  REAL    NOT NULL DEFAULT 0,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    -- Pre-built packages (Silver / Gold / Platinum)
    CREATE TABLE IF NOT EXISTS packages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      price       REAL NOT NULL,
      description TEXT,
      tier        TEXT NOT NULL CHECK(tier IN ('silver','gold','platinum'))
    );

    -- Bookings placed by customers
    CREATE TABLE IF NOT EXISTS bookings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      event_type  TEXT    NOT NULL,
      event_date  TEXT,
      location    TEXT,
      guest_count INTEGER,
      budget      REAL,
      package_id  INTEGER,
      status      TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
    );

    -- Many-to-many: selected services for a booking
    CREATE TABLE IF NOT EXISTS booking_services (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    -- Quotations generated for bookings
    CREATE TABLE IF NOT EXISTS quotations (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id   INTEGER NOT NULL,
      total_amount REAL    NOT NULL DEFAULT 0,
      status       TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','approved','rejected')),
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );

    -- Line items inside a quotation
    CREATE TABLE IF NOT EXISTS quotation_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id INTEGER NOT NULL,
      service_name TEXT    NOT NULL,
      amount       REAL    NOT NULL DEFAULT 0,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    );

    -- Vendor profiles
    CREATE TABLE IF NOT EXISTS vendors (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER,
      category      TEXT,
      business_name TEXT NOT NULL,
      city          TEXT,
      rating        REAL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Vendor assignments to bookings
    CREATE TABLE IF NOT EXISTS vendor_assignments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id   INTEGER NOT NULL,
      vendor_id    INTEGER NOT NULL,
      service_type TEXT,
      status       TEXT NOT NULL DEFAULT 'assigned' CHECK(status IN ('assigned','accepted','completed','cancelled')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (vendor_id)  REFERENCES vendors(id)  ON DELETE CASCADE
    );

    -- Customer reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      user_id    INTEGER NOT NULL,
      rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
    );

    -- Contact-form submissions
    CREATE TABLE IF NOT EXISTS contact_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      phone      TEXT,
      message    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── SEED DATA (only if tables are empty) ───────────────────

  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;

  if (userCount === 0) {
    console.log('🌱  Seeding database with initial data …');

    // --- Admin user ---
    const adminHash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('Admin', 'admin@naishvi.com', '9876543210', adminHash, 'admin');

    // --- Sample customer ---
    const custHash = bcrypt.hashSync('customer123', 10);
    db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('Priya Sharma', 'priya@example.com', '9123456789', custHash, 'customer');

    // --- Events ---
    const insertEvent = db.prepare(`
      INSERT INTO events (name, image_url, description) VALUES (?, ?, ?)
    `);

    const eventData = [
      ['Engagement',  '/images/events/engagement.jpg',  'A beautiful ring ceremony to celebrate the beginning of a lifelong journey together.'],
      ['Haldi',       '/images/events/haldi.jpg',       'A vibrant pre-wedding ritual filled with turmeric, laughter, and blessings.'],
      ['Mehndi',      '/images/events/mehndi.jpg',      'An artistic celebration where intricate henna designs adorn the bride and guests.'],
      ['Sangeet',     '/images/events/sangeet.jpg',      'A musical evening of dance performances, songs, and joyful celebrations.'],
      ['Wedding',     '/images/events/wedding.jpg',      'The grand ceremony — sacred vows, rituals, and the union of two souls.'],
      ['Reception',   '/images/events/reception.jpg',    'An elegant post-wedding party to welcome the newlyweds into society.'],
    ];

    const eventIds = [];
    for (const [name, img, desc] of eventData) {
      const info = insertEvent.run(name, img, desc);
      eventIds.push(info.lastInsertRowid);
    }

    // --- Services (same set offered for every event) ---
    const insertService = db.prepare(`
      INSERT INTO services (event_id, name, description, base_price) VALUES (?, ?, ?, ?)
    `);

    const serviceTemplates = [
      ['Wedding Decoration',    'Stunning mandap, stage & venue décor with flowers, drapes, and lighting.', 25000],
      ['Catering',              'Multi-cuisine menu — starters, main course, desserts & live counters.',    30000],
      ['Photography',           'Professional photo & cinematic video coverage of every precious moment.',  20000],
      ['Makeup',                'Bridal & family makeup by certified artists using premium products.',      15000],
      ['DJ & Music',            'High-energy DJ, live band, dhol, and curated playlists for every mood.',   12000],
      ['Venue Booking',         'Premium venue selection — lawns, banquet halls, palace hotels & resorts.',  50000],
      ['Flower Decoration',     'Exotic flower arrangements — entrance, stage, table centrepieces & more.', 18000],
      ['Bridal Entry',          'Grand bridal entries — palanquin, vintage car, fireworks & fog effects.',  10000],
      ['Guest Transportation',  'Fleet of luxury cars, tempo travellers & buses for guest logistics.',      15000],
    ];

    for (const eventId of eventIds) {
      for (const [name, desc, price] of serviceTemplates) {
        insertService.run(eventId, name, desc, price);
      }
    }

    // --- Packages ---
    const insertPkg = db.prepare(`
      INSERT INTO packages (name, price, description, tier) VALUES (?, ?, ?, ?)
    `);

    insertPkg.run(
      'Silver Package', 49999,
      'Essential services for an elegant celebration. Includes decoration, catering, and photography.',
      'silver'
    );
    insertPkg.run(
      'Gold Package', 99999,
      'Our most popular package! Includes decoration, catering, photography, makeup, DJ & music, and flower decoration.',
      'gold'
    );
    insertPkg.run(
      'Platinum Package', 199999,
      'The ultimate luxury experience. All services included with premium upgrades, celebrity artists, and a dedicated planner.',
      'platinum'
    );

    // --- Sample vendor users & vendor profiles ---
    const vendorData = [
      { name: 'Rajesh Studios',       email: 'rajesh@vendor.com',   phone: '9001001001', category: 'Photography',          city: 'Jaipur',    rating: 4.8 },
      { name: 'Spice Route Catering', email: 'spiceroute@vendor.com', phone: '9002002002', category: 'Catering',          city: 'Delhi',     rating: 4.6 },
      { name: 'Bloom Florists',       email: 'bloom@vendor.com',    phone: '9003003003', category: 'Flower Decoration',    city: 'Mumbai',    rating: 4.9 },
      { name: 'Beats DJ Company',     email: 'beats@vendor.com',    phone: '9004004004', category: 'DJ & Music',           city: 'Bangalore', rating: 4.5 },
      { name: 'Glamour Makeup',       email: 'glamour@vendor.com',  phone: '9005005005', category: 'Makeup',               city: 'Hyderabad', rating: 4.7 },
      { name: 'Royal Decorators',     email: 'royal@vendor.com',    phone: '9006006006', category: 'Wedding Decoration',   city: 'Udaipur',   rating: 4.9 },
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'vendor')
    `);
    const insertVendor = db.prepare(`
      INSERT INTO vendors (user_id, category, business_name, city, rating) VALUES (?, ?, ?, ?, ?)
    `);
    const vendorHash = bcrypt.hashSync('vendor123', 10);

    for (const v of vendorData) {
      const info = insertUser.run(v.name, v.email, v.phone, vendorHash);
      insertVendor.run(info.lastInsertRowid, v.category, v.name, v.city, v.rating);
    }

    // --- Sample reviews ---
    const insertReview = db.prepare(`
      INSERT INTO reviews (user_id, rating, comment) VALUES (?, ?, ?)
    `);
    insertReview.run(2, 5, 'Absolutely magical! Naishvi made our wedding day a fairy tale. Every detail was perfect.');
    insertReview.run(2, 5, 'The decoration and coordination were beyond our expectations. Highly recommended!');
    insertReview.run(2, 4, 'Great experience overall. The catering was fantastic and the team was very professional.');

    console.log('✅  Database seeded successfully.');
  }

  return db;
}

module.exports = initializeDatabase;
