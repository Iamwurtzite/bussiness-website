/**
 * Naishvi Celebrations - Central State Store
 * Manages bookings, quotations, vendors, assignments, reviews, and notifications in localStorage.
 */

const STORAGE_KEYS = {
  BOOKINGS: 'nc_bookings',
  QUOTATIONS: 'nc_quotations',
  VENDORS: 'nc_vendors',
  ASSIGNMENTS: 'nc_assignments',
  REVIEWS: 'nc_reviews',
  NOTIFICATIONS: 'nc_notifications',
  SETTINGS: 'nc_settings'
};

// Default Initial Seed Data matching the project requirements
const DEFAULT_EVENTS = [
  {
    id: 'engagement',
    name: 'Engagement',
    hindi: 'सगाई समारोह',
    tagline: 'The Beautiful Beginning of Forever',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    description: 'Ring ceremonies, intimate ring exchange setups, floral backdrops, and romantic lighting.',
    basePrice: 35000
  },
  {
    id: 'haldi',
    name: 'Haldi',
    hindi: 'हल्दी उत्सव',
    tagline: 'Colors of Joy & Sunshine Blessings',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Marigold & yellow draping, traditional urli setups, phoolon ki holi & festive folk vibes.',
    basePrice: 25000
  },
  {
    id: 'mehndi',
    name: 'Mehndi',
    hindi: 'मेहंदी की रात',
    tagline: 'Intricate Henna & Vibrant Festivities',
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=800&q=80',
    description: 'Bohemian & colorful canopies, swings (jhoola), live bangles stalls & henna artists corner.',
    basePrice: 30000
  },
  {
    id: 'sangeet',
    name: 'Sangeet',
    hindi: 'संगीत संध्या',
    tagline: 'Glitz, Glamour & High-Energy Beats',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Concert-grade LED stage, intelligent truss lighting, cold pyro effects, and celebrity DJ setups.',
    basePrice: 55000
  },
  {
    id: 'wedding',
    name: 'Wedding',
    hindi: 'शुभ विवाह',
    tagline: 'Royal Sacred Vows & Majestic Mandaps',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    description: 'Grand floral mandap, royal baraat entry, varmala hydraulic stage, pandit arrangements & sacred havan.',
    basePrice: 95000
  },
  {
    id: 'reception',
    name: 'Reception',
    hindi: 'भव्य स्वागत समारोह',
    tagline: 'Grand Elegance & Unforgettable Hospitality',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    description: 'Crystal chandeliers, imperial dining setup, luxury stage backdrop, red carpet guest welcome.',
    basePrice: 75000
  }
];

const DEFAULT_SERVICES = [
  { id: 'wedding-decor', name: 'Wedding Decoration', icon: 'fa-wand-magic-sparkles', defaultCost: 50000, desc: 'Theme mandaps, royal stages, pathway floral pillars & luxury entrance gates.' },
  { id: 'catering', name: 'Catering & Feasts', icon: 'fa-utensils', defaultCost: 100000, desc: 'Multi-cuisine royal buffets, live counters, welcome drinks & traditional desserts.' },
  { id: 'photography', name: 'Photography & Cinema', icon: 'fa-camera-retro', defaultCost: 30000, desc: 'Candid photography, 4K cinematic teasers, drone coverage & traditional albums.' },
  { id: 'makeup', name: 'Bridal Makeup & Styling', icon: 'fa-spa', defaultCost: 20000, desc: 'HD airbrush makeup, hairstyling, saree/lehenga draping & pre-bridal care.' },
  { id: 'dj-music', name: 'DJ & Sound / Music', icon: 'fa-compact-disc', defaultCost: 15000, desc: 'Top club & wedding DJs, line-array sound systems, moving heads & LED screens.' },
  { id: 'venue-booking', name: 'Venue Booking & Negotiation', icon: 'fa-landmark', defaultCost: 25000, desc: 'Palaces, 5-star hotels, luxury farmhouses & heritage destination banquet spaces.' },
  { id: 'flower-decor', name: 'Exotic Flower Decoration', icon: 'fa-seedling', defaultCost: 35000, desc: 'Fresh imported Dutch roses, orchids, carnations, jasmine & marigold floral installations.' },
  { id: 'bridal-entry', name: 'Bridal Entry & Special Effects', icon: 'fa-gem', defaultCost: 18000, desc: 'Phoolon ki chadar, sparkler cold pyro entry, dry ice smoke clouds & vintage palki.' },
  { id: 'guest-transportation', name: 'Guest Transportation & Logistics', icon: 'fa-car-side', defaultCost: 22000, desc: 'Luxury vintage cars for baraat, AC coach shuttles & airport/station pick & drops.' }
];

const DEFAULT_PACKAGES = [
  {
    id: 'silver',
    name: 'Silver Package',
    badge: 'Essential Charm',
    price: 49999,
    priceLabel: '₹49,999 onwards',
    tagline: 'Small functions and basic elegant arrangements',
    features: [
      'Single event focus (Haldi / Mehndi / Engagement)',
      'Elegant floral stage backdrop (up to 16 ft)',
      'Basic sound system with wireless microphones',
      'Entry gate décor & ambient fairy lights',
      'Standard photography (1 Candid + 1 Traditional)',
      'Dedicated on-site coordinator on event day'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Package',
    badge: 'Most Popular',
    popular: true,
    price: 99999,
    priceLabel: '₹99,999 onwards',
    tagline: 'Premium decoration and complete event arrangements',
    features: [
      'Full coverage for 2 Main Events (e.g. Sangeet + Wedding)',
      'Custom theme mandap & grand stage décor (up to 30 ft)',
      'Concert-grade DJ setup with intelligent light truss',
      'Drone coverage + Cinematic wedding film teaser',
      'Special cold-fire pyro entry for Bride & Groom',
      'Fresh flower installations & themed photo booth',
      '2 Dedicated event coordinators & hospitality desk'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Package',
    badge: 'Royal Extravaganza',
    price: 199999,
    priceLabel: '₹1,99,999 onwards',
    tagline: 'Luxury royal wedding experience and bespoke services',
    features: [
      'Multi-day 360° wedding planning (All 6 ceremonies)',
      'Imperial palace-grade mandap & imported floral canopy',
      'Celebrity DJ setup, LED video walls & hydraulic stage',
      'Full cinematic crew, pre-wedding shoot & hardbound albums',
      'Signature bridal entry concept (Palki / Cloud Fog / Pyro)',
      'Vintage royal car for groom’s baraat procession',
      'VIP lounge styling, guest concierge & 5 senior planners'
    ]
  }
];

const DEFAULT_VENDORS = [
  {
    id: 'VND-101',
    name: 'Royal Heritage Decorators',
    contactPerson: 'Suresh Verma',
    phone: '+91 98765 43210',
    category: 'Wedding Decoration',
    city: 'Jaipur & Delhi NCR',
    rating: 4.9,
    status: 'Active',
    experience: '12 Years',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'VND-102',
    name: 'Maharaja Caterers & Banquets',
    contactPerson: 'Chef Kuldeep Rawat',
    phone: '+91 98223 11445',
    category: 'Catering & Feasts',
    city: 'Mumbai & Udaipur',
    rating: 4.8,
    status: 'Active',
    experience: '15 Years',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'VND-103',
    name: 'The Wedding Storytellers (Cinema)',
    contactPerson: 'Karan Mehra',
    phone: '+91 97112 88990',
    category: 'Photography & Cinema',
    city: 'Delhi, Goa & Destination',
    rating: 5.0,
    status: 'Active',
    experience: '8 Years',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'VND-104',
    name: 'SoundWave Productions & DJ Night',
    contactPerson: 'DJ Neil',
    phone: '+91 99887 66554',
    category: 'DJ & Sound / Music',
    city: 'Pan-India',
    rating: 4.9,
    status: 'Active',
    experience: '10 Years',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'VND-105',
    name: 'Glamour & Glow Bridal Studio',
    contactPerson: 'Pooja Singhania',
    phone: '+91 98111 22334',
    category: 'Bridal Makeup & Styling',
    city: 'Delhi & Lucknow',
    rating: 4.9,
    status: 'Active',
    experience: '9 Years',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: 'NC-2026-001',
    customerName: 'Aditi Sharma & Rohan Kapoor',
    mobile: '+91 9719136364',
    email: 'aditi.kapoor@example.com',
    events: ['Haldi', 'Sangeet', 'Wedding'],
    eventDate: '2026-12-18',
    location: 'Taj Jai Mahal Palace, Jaipur',
    guests: '350',
    packageId: 'gold',
    packageName: 'Gold Package',
    budget: '₹2,00,000+',
    services: ['Wedding Decoration', 'Catering & Feasts', 'Photography & Cinema', 'DJ & Sound / Music', 'Bridal Makeup & Styling'],
    specialNotes: 'Require royal Rajputana mandap with gold and ivory theme.',
    status: 'Confirmed', // Pending, Quoted, Confirmed, Completed, Cancelled
    createdAt: '2026-11-08T10:30:00Z',
    advancePaid: 65000,
    totalQuoted: 215000,
    quotationId: 'QUO-2026-001'
  },
  {
    id: 'NC-2026-002',
    customerName: 'Priya Patel & Siddharth Verma',
    mobile: '+91 98765 43219',
    email: 'priya.patel@example.com',
    events: ['Wedding', 'Reception'],
    eventDate: '2026-11-28',
    location: 'JW Marriott Resort, Goa',
    guests: '200',
    packageId: 'platinum',
    packageName: 'Platinum Package',
    budget: '₹2,00,000+',
    services: ['Wedding Decoration', 'Photography & Cinema', 'DJ & Sound / Music', 'Exotic Flower Decoration', 'Bridal Entry & Special Effects'],
    specialNotes: 'Beachside sunset wedding mandap with pastel flowers.',
    status: 'Quoted',
    createdAt: '2026-11-09T14:15:00Z',
    advancePaid: 0,
    totalQuoted: 195000,
    quotationId: 'QUO-2026-002'
  },
  {
    id: 'NC-2026-003',
    customerName: 'Neha Gupta & Aarav Singhania',
    mobile: '+91 99554 11223',
    email: 'neha.gupta@example.com',
    events: ['Engagement'],
    eventDate: '2026-12-05',
    location: 'The Leela Palace, New Delhi',
    guests: '120',
    packageId: 'silver',
    packageName: 'Silver Package',
    budget: '₹50,000 - ₹1,00,000',
    services: ['Wedding Decoration', 'Photography & Cinema'],
    specialNotes: 'Intimate ring ceremony with fairy light canopy.',
    status: 'Pending',
    createdAt: '2026-11-10T16:20:00Z',
    advancePaid: 0,
    totalQuoted: 0,
    quotationId: null
  }
];

const DEFAULT_QUOTATIONS = [
  {
    id: 'QUO-2026-001',
    bookingId: 'NC-2026-001',
    customerName: 'Aditi Sharma & Rohan Kapoor',
    mobile: '+91 9719136364',
    date: '2026-11-09',
    items: [
      { service: 'Theme Mandap & Royal Stage Decoration', amount: 55000 },
      { service: 'Catering Supervision & Luxury Banquet Setup', amount: 85000 },
      { service: 'Candid Photography & 4K Cinema Teaser', amount: 35000 },
      { service: 'Sangeet DJ, Truss Lighting & Pyro Effects', amount: 20000 },
      { service: 'Bridal HD Makeup & Styling', amount: 20000 }
    ],
    subtotal: 215000,
    discount: 10000,
    totalAmount: 205000,
    advanceRequired: 65000,
    advancePaid: 65000,
    remainingBalance: 140000,
    status: 'Approved', // Draft, Sent, Approved, Paid
    paymentMethod: 'UPI (PhonePe)',
    paymentDate: '2026-11-09T18:40:00Z',
    txnId: 'UPI-TXN-998823145'
  },
  {
    id: 'QUO-2026-002',
    bookingId: 'NC-2026-002',
    customerName: 'Priya Patel & Siddharth Verma',
    mobile: '+91 98765 43219',
    date: '2026-11-10',
    items: [
      { service: 'Decoration (Beachside Floral Mandap)', amount: 50000 },
      { service: 'Catering Management', amount: 100000 },
      { service: 'Photography & Pre-Wedding Cinema', amount: 30000 },
      { service: 'DJ & Sound / Acoustic Setup', amount: 15000 }
    ],
    subtotal: 195000,
    discount: 0,
    totalAmount: 195000,
    advanceRequired: 50000,
    advancePaid: 0,
    remainingBalance: 195000,
    status: 'Sent',
    paymentMethod: null,
    paymentDate: null,
    txnId: null
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'REV-01',
    customerName: 'Simran & Kabir Bhalla',
    event: 'Jaipur Destination Wedding',
    rating: 5,
    date: 'October 2026',
    quote: 'Naishvi Celebrations turned our dream palace wedding into reality! From Haldi flowers to the royal Baraat, every single detail was breathtaking. Our guests are still talking about the décor!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'REV-02',
    customerName: 'Tanvi & Manav Saxena',
    event: 'Delhi Grand Sangeet & Wedding',
    rating: 5,
    date: 'September 2026',
    quote: 'The level of professionalism and luxury design Naishvi brings is unmatched. The quotation was 100% transparent with no last-minute surprises. Truly trusted wedding planners!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'REV-03',
    customerName: 'Meghna & Arjun Rao',
    event: 'Udaipur Lakeside Wedding',
    rating: 5,
    date: 'August 2026',
    quote: 'Their vendor coordination was flawless. I did not have to worry about a single vendor on my wedding day. They handled everything with warmth and regal elegance.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  }
];

class Store {
  constructor() {
    this.initStore();
  }

  initStore() {
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUOTATIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(DEFAULT_QUOTATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) {
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(DEFAULT_VENDORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([
        {
          id: 'NOTIF-01',
          type: 'booking',
          title: 'New Booking Request',
          message: 'Neha Gupta requested a booking for Engagement on 2026-12-05.',
          timestamp: '2026-11-10T16:20:00Z',
          read: false
        },
        {
          id: 'NOTIF-02',
          type: 'payment',
          title: 'Advance Payment Received',
          message: 'Aditi Sharma paid ₹65,000 via UPI (PhonePe). Booking Confirmed!',
          timestamp: '2026-11-09T18:40:00Z',
          read: true
        }
      ]));
    }
  }

  // --- Static Catalogs ---
  getEvents() { return DEFAULT_EVENTS; }
  getServices() { return DEFAULT_SERVICES; }
  getPackages() { return DEFAULT_PACKAGES; }

  // --- Bookings ---
  getBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  }

  getBookingById(id) {
    const list = this.getBookings();
    return list.find(b => b.id.toLowerCase() === id.toLowerCase() || b.mobile === id);
  }

  createBooking(data) {
    const list = this.getBookings();
    const newId = `NC-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const newBooking = {
      id: newId,
      customerName: data.customerName,
      mobile: data.mobile,
      email: data.email || '',
      events: data.events || [],
      eventDate: data.eventDate || '',
      location: data.location || '',
      guests: data.guests || '100-250',
      packageId: data.packageId || 'gold',
      packageName: data.packageName || 'Gold Package',
      budget: data.budget || '₹1,00,000 - ₹2,00,000',
      services: data.services || [],
      specialNotes: data.specialNotes || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      advancePaid: 0,
      totalQuoted: 0,
      quotationId: null
    };

    list.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));

    // Also trigger notification
    this.addNotification({
      type: 'booking',
      title: 'New Wedding Booking!',
      message: `${newBooking.customerName} submitted an enquiry for ${newBooking.events.join(', ')} in ${newBooking.location}.`
    });

    return newBooking;
  }

  updateBookingStatus(id, newStatus, extraData = {}) {
    const list = this.getBookings();
    const index = list.findIndex(b => b.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], status: newStatus, ...extraData };
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
      return list[index];
    }
    return null;
  }

  // --- Quotations ---
  getQuotations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');
  }

  getQuotationById(id) {
    const list = this.getQuotations();
    return list.find(q => q.id.toLowerCase() === id.toLowerCase() || q.bookingId.toLowerCase() === id.toLowerCase());
  }

  createQuotation(quoteData) {
    const list = this.getQuotations();
    const newId = `QUO-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    
    const subtotal = quoteData.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const discount = Number(quoteData.discount || 0);
    const totalAmount = subtotal - discount;
    const advanceRequired = Math.round(totalAmount * 0.3); // default 30% advance

    const newQuote = {
      id: newId,
      bookingId: quoteData.bookingId,
      customerName: quoteData.customerName,
      mobile: quoteData.mobile,
      date: new Date().toISOString().split('T')[0],
      items: quoteData.items,
      subtotal,
      discount,
      totalAmount,
      advanceRequired: quoteData.advanceRequired || advanceRequired,
      advancePaid: 0,
      remainingBalance: totalAmount,
      status: 'Sent',
      paymentMethod: null,
      paymentDate: null,
      txnId: null
    };

    list.unshift(newQuote);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(list));

    // Update the booking record with quotation reference
    this.updateBookingStatus(quoteData.bookingId, 'Quoted', {
      totalQuoted: totalAmount,
      quotationId: newId
    });

    this.addNotification({
      type: 'quotation',
      title: 'Quotation Dispatched',
      message: `Quotation ${newId} (₹${totalAmount.toLocaleString('en-IN')}) sent to ${quoteData.customerName}.`
    });

    return newQuote;
  }

  recordPayment(quoteId, paymentDetails) {
    const quotations = this.getQuotations();
    const qIndex = quotations.findIndex(q => q.id === quoteId);
    if (qIndex === -1) return null;

    const q = quotations[qIndex];
    const amountPaid = Number(paymentDetails.amount);
    q.advancePaid = (q.advancePaid || 0) + amountPaid;
    q.remainingBalance = Math.max(0, q.totalAmount - q.advancePaid);
    q.status = q.remainingBalance === 0 ? 'Fully Paid' : 'Approved';
    q.paymentMethod = paymentDetails.method;
    q.paymentDate = new Date().toISOString();
    q.txnId = paymentDetails.txnId || `TXN-${Date.now()}`;

    quotations[qIndex] = q;
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));

    // Update booking status to Confirmed
    this.updateBookingStatus(q.bookingId, 'Confirmed', {
      advancePaid: q.advancePaid
    });

    this.addNotification({
      type: 'payment',
      title: 'Payment Received!',
      message: `Received ₹${amountPaid.toLocaleString('en-IN')} via ${paymentDetails.method} for Booking ${q.bookingId}.`
    });

    return q;
  }

  // --- Vendors ---
  getVendors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
  }

  assignVendor(bookingId, vendorId, serviceName, customNotes = '') {
    const vendors = this.getVendors();
    const vendor = vendors.find(v => v.id === vendorId);
    const booking = this.getBookingById(bookingId);
    if (!vendor || !booking) return null;

    const assignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]');
    const newAssignment = {
      id: `ASG-${Date.now()}`,
      bookingId,
      vendorId,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      serviceName,
      customerName: booking.customerName,
      eventDate: booking.eventDate,
      location: booking.location,
      notes: customNotes,
      status: 'Assigned', // Assigned, Accepted, In Preparation, Ready, Completed
      assignedAt: new Date().toISOString()
    };

    assignments.unshift(newAssignment);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));

    this.addNotification({
      type: 'vendor',
      title: 'Vendor Assigned',
      message: `${vendor.name} assigned to ${booking.customerName}'s event for ${serviceName}.`
    });

    return newAssignment;
  }

  getAssignments(filterVendorId = null) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]');
    if (filterVendorId) {
      return list.filter(a => a.vendorId === filterVendorId);
    }
    return list;
  }

  updateAssignmentStatus(assignmentId, newStatus) {
    const assignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]');
    const idx = assignments.findIndex(a => a.id === assignmentId);
    if (idx !== -1) {
      assignments[idx].status = newStatus;
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
      return assignments[idx];
    }
    return null;
  }

  // --- Reviews ---
  getReviews() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  }

  addReview(reviewData) {
    const list = this.getReviews();
    const newRev = {
      id: `REV-${Date.now()}`,
      customerName: reviewData.customerName,
      event: reviewData.event,
      rating: Number(reviewData.rating) || 5,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      quote: reviewData.quote,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    };
    list.unshift(newRev);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));
    return newRev;
  }

  // --- Notifications ---
  getNotifications() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  }

  addNotification(notif) {
    const list = this.getNotifications();
    list.unshift({
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list.slice(0, 30)));
  }

  markNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }
}

// Global instance
window.ncStore = new Store();
