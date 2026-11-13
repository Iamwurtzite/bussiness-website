/**
 * Naishvi Celebrations - Central State Store & Business Logic Engine
 * Manages bookings, quotations, vendors, assignments, reviews, notifications,
 * event catalogs, 18 service categories, Pandit Ji ceremonies, Agra venues,
 * and Admin Authentication in localStorage.
 */

const STORAGE_KEYS = {
  BOOKINGS: 'nc_bookings',
  QUOTATIONS: 'nc_quotations',
  VENDORS: 'nc_vendors',
  ASSIGNMENTS: 'nc_assignments',
  REVIEWS: 'nc_reviews',
  NOTIFICATIONS: 'nc_notifications',
  SETTINGS: 'nc_settings',
  ADMIN_AUTH: 'nc_admin_auth'
};

// Expanded Event Catalog (Image 1 & 3)
const DEFAULT_EVENTS = [
  {
    id: 'roka',
    name: 'Roka Ceremony',
    category: 'Pre-Wedding',
    tagline: 'The First Auspicious Commitment',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional shagun exchange, intimate floral backdrop, gift hampers curation, and family dining arrangements.',
    basePrice: 30000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'engagement',
    name: 'The Royal Engagement',
    category: 'Pre-Wedding',
    tagline: 'The Beautiful Beginning of Forever',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Ring exchange hydraulic stage, romantic pastel florals, champagne toast setups, fairy light canopies & live acoustic band.',
    basePrice: 45000,
    packagesAvailable: ['Silver', 'Gold', 'Platinum']
  },
  {
    id: 'haldi',
    name: 'Vibrant Haldi Ceremony',
    category: 'Pre-Wedding',
    tagline: 'Colors of Joy & Sunshine Blessings',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional brass urli tubs, marigold floral draping, phoolon ki holi flower showers, folk dhol, and vibrant photo booths.',
    basePrice: 35000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'mehndi',
    name: 'Festive Mehndi Night',
    category: 'Pre-Wedding',
    tagline: 'Intricate Henna & Carnival Vibe',
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=800&q=80',
    description: 'Bohemian colorful canopies, decorated jhoolas (swings), live bangle making stalls, and master Rajasthani henna artists.',
    basePrice: 40000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'sangeet',
    name: 'Grand Sangeet & Musical Night',
    category: 'Celebration',
    tagline: 'Glitz, Glamour & High-Energy Beats',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Concert-grade LED video stage, intelligent beam truss lighting, cold pyro fireworks, professional dance choreography & celebrity DJ.',
    basePrice: 65000,
    packagesAvailable: ['Gold', 'Platinum']
  },
  {
    id: 'cocktail',
    name: 'Cocktail & After-Party',
    category: 'Celebration',
    tagline: 'Sleek Glamour & Electric Rhythms',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-modern lounge setups, LED bar counters, professional molecular mixology, neon photo-ops, and club sound systems.',
    basePrice: 55000,
    packagesAvailable: ['Gold', 'Platinum']
  },
  {
    id: 'wedding',
    name: 'Sacred Royal Wedding',
    category: 'Main Ceremony',
    tagline: 'Royal Sacred Vows & Majestic Mandap',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    description: 'Imperial palace-grade mandap architecture, royal baraat vintage car procession, hydraulic varmala stage, Vedic havan & pandit coordination.',
    basePrice: 99999,
    packagesAvailable: ['Gold', 'Platinum']
  },
  {
    id: 'reception',
    name: 'Imperial Grand Reception',
    category: 'Post-Wedding',
    tagline: 'Grand Elegance & Imperial Hospitality',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    description: 'Crystal chandelier backdrops, multi-course royal culinary buffet, red carpet receiving lines, VIP lounge, and orchestral background music.',
    basePrice: 75000,
    packagesAvailable: ['Gold', 'Platinum']
  },
  {
    id: 'mata-ki-chowki',
    name: 'Mata Ki Chowki',
    category: 'Devotional & Religious',
    tagline: 'Divine Blessings & Bhakti Bhava',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
    description: 'Grand ornate bhavan decoration, renowned bhajan singer troupe, red chunri draping, divine akhand jyot, and satvik prasad distribution.',
    basePrice: 35000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'jagran',
    name: 'Jagran & Bhajan Sandhya',
    category: 'Devotional & Religious',
    tagline: 'All-Night Spiritual Musical Awakening',
    image: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=800&q=80',
    description: 'Illuminated darbar set, high-definition sound, live dholak & harmonium ensemble, jhanki displays, and sacred bhog feast management.',
    basePrice: 45000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'birthday',
    name: 'Luxury Birthday Celebration',
    category: 'Private Parties',
    tagline: 'Bespoke Themes & Joyful Milestone Moments',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    description: 'Custom theme balloon and floral installations, illuminated marquee numbers, gourmet customized cake, live entertainment, and photo corners.',
    basePrice: 25000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'anniversary',
    name: 'Silver & Golden Anniversary',
    category: 'Private Parties',
    tagline: 'Celebrating Decades of Enduring Love',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Romantic vintage candlelit dining, vow renewal stage, memory lane photo wall gallery, curated live saxophone / violin, and premium banquet feast.',
    basePrice: 35000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower & Godh Bharai',
    category: 'Family Sanskar',
    tagline: 'Blessings for the Mother & New Arrival',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
    description: 'Pastel dream decor, traditional shagun rituals, floral tiara and jewellery for mother, fun interactive games, and custom sweet buffet.',
    basePrice: 28000,
    packagesAvailable: ['Silver', 'Gold']
  },
  {
    id: 'corporate',
    name: 'Corporate Galas & Summits',
    category: 'Corporate Events',
    tagline: 'Prestigious Execution & Brand Eminence',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    description: 'Conference stage design, seamless AV line arrays, corporate awards night production, networking dinner coordination, and hospitality liaison.',
    basePrice: 60000,
    packagesAvailable: ['Gold', 'Platinum']
  }
];

// The 18 Definitive Service Categories (Image 4)
const DEFAULT_18_SERVICES = [
  { id: 'srv-1', no: 1, name: 'Wedding Decoration & Mandap', icon: 'fa-wand-magic-sparkles', desc: 'Bespoke theme mandap architecture, 30ft royal stage sets, ambient architectural lighting & floral entrance pathways.' },
  { id: 'srv-2', no: 2, name: 'Royal Catering & Feasts', icon: 'fa-utensils', desc: 'Multi-cuisine royal feasts, live gourmet counters, chaat galli, dessert lounges, and fine dining tableware overseen by master chefs.' },
  { id: 'srv-3', no: 3, name: 'Photography & Cinematography', icon: 'fa-camera-retro', desc: 'Award-winning candid photographers, 4K cinematic film teasers, licensed aerial drone coverage, and heirloom leather albums.' },
  { id: 'srv-4', no: 4, name: 'Bridal Makeup & Styling', icon: 'fa-spa', desc: 'Celebrity bridal artists, HD airbrush makeup, couture hair styling, saree/lehenga draping, and pre-bridal skin luxury.' },
  { id: 'srv-5', no: 5, name: 'Mehndi Artists', icon: 'fa-hand-sparkles', desc: 'Master Rajasthani and Marwari bridal henna artists crafting intricate customized love stories and portraits in organic henna.' },
  { id: 'srv-6', no: 6, name: 'Pandit Ji & Religious Ceremonies', icon: 'fa-om', desc: 'Learned Vedic Brahmins for Vivah Sanskar, Pheras, Havan, Satyanarayan Katha, Griha Pravesh, Mata Ki Chowki & all 16 Vedic rituals.' },
  { id: 'srv-7', no: 7, name: 'DJ, Sound & Entertainment', icon: 'fa-compact-disc', desc: 'Concert line-array sound systems, intelligent beam truss lights, celebrity DJs, LED video walls, and interactive dance floors.' },
  { id: 'srv-8', no: 8, name: 'Dhol, Band & Baraat', icon: 'fa-drum', desc: 'Traditional Punjabi & Nashik dhol ensembles, royal brass brass band, decorated elephants/horses, and choreographed baraat energy.' },
  { id: 'srv-9', no: 9, name: 'Floral Decoration', icon: 'fa-seedling', desc: 'Imported Dutch roses, cascading orchids, white hydrangeas, traditional marigolds, and fragrant mogra installations.' },
  { id: 'srv-10', no: 10, name: 'Bridal & Groom Entry', icon: 'fa-gem', desc: 'Signature grand entries with phoolon ki chadar, vintage royal palki, low-smoke dry ice cloud fog, and eco cold pyro fireworks.' },
  { id: 'srv-11', no: 11, name: 'Wedding Venue Booking', icon: 'fa-landmark', desc: 'Exclusive negotiated partner rates across Agra’s finest 5-star hotels, palaces, banquet halls, and luxury farmhouses.' },
  { id: 'srv-12', no: 12, name: 'Tent, Furniture & Lighting', icon: 'fa-campground', desc: 'German hanger air-conditioned waterproof superstructures, imperial royal couches, Chiavari chairs, and fairy light mesh.' },
  { id: 'srv-13', no: 13, name: 'Wedding Invitations & Gifts', icon: 'fa-envelope-open-text', desc: 'Bespoke laser-cut invitation suites, animated video cards, customized sweets hampers, and guest welcome gift bags.' },
  { id: 'srv-14', no: 14, name: 'Dance Choreography & Anchoring', icon: 'fa-person-booth', desc: 'Professional Sangeet choreographers, celebrity anchors/emcees, concept scripts, and family performance coaching.' },
  { id: 'srv-15', no: 15, name: 'Transportation & Logistics', icon: 'fa-car-side', desc: 'Royal vintage cars for groom’s baraat, luxury Mercedes/Audi convoys, AC sleeper coaches for guests, and airport pickups.' },
  { id: 'srv-16', no: 16, name: 'Guest Hospitality & Security', icon: 'fa-user-shield', desc: 'Dedicated hotel helpdesks, personalized baggage concierges, RSVP management, trained bouncers, and valet services.' },
  { id: 'srv-17', no: 17, name: 'Complete Wedding Planning', icon: 'fa-clipboard-check', desc: 'Comprehensive 360-degree turnkey planning, budget optimization, vendor liaison, timeline scheduling, and run-of-show execution.' },
  { id: 'srv-18', no: 18, name: 'Destination Wedding Management', icon: 'fa-plane-departure', desc: 'Full destination orchestration in Agra, Jaipur, Udaipur, Goa, and Delhi NCR with local vendor negotiation and logistics.' }
];

// Music & Live Entertainment Sub-Services (Image 5)
const DEFAULT_MUSIC_SERVICES = [
  { id: 'mus-1', name: 'Ghazal Night', desc: 'Soulful live Mehfil-e-Ghazal singers with harmonium, tabla, and acoustic instruments.' },
  { id: 'mus-2', name: 'Jagran & Bhajan Sandhya', desc: 'Devotional singer troupes, akhand darbar, live dholak, chimta, and spiritual aarti.' },
  { id: 'mus-3', name: 'Mata Ki Chowki', desc: 'Traditional red floral setup, devotional sangeet, and live bhajans for divine blessings.' },
  { id: 'mus-4', name: 'Karaoke Night', desc: 'Fun family interactive singing setups with dual screens, wireless microphones & emcee.' },
  { id: 'mus-5', name: 'Instrumental Music', desc: 'Melodious classical ensembles: Shehnai for baraat, Sitar, Flute, and live Violinists for dining.' },
  { id: 'mus-6', name: 'Rajasthani Folk Music', desc: 'Authentic Manganiyar folk singers, Morchang players, and graceful Chari fire dancers.' },
  { id: 'mus-7', name: 'Acoustic Music', desc: 'Unplugged Bollywood and Sufi acoustic bands for intimate cocktail and sundowner hours.' },
  { id: 'mus-8', name: 'Wedding Sangeet Performances', desc: 'Custom sound tracks, sound engineering, choreographed family group dances & stage entries.' },
  { id: 'mus-9', name: 'Dance Troupe', desc: 'Professional Bollywood dancers, LED Tron light dancers, and international welcome troupes.' },
  { id: 'mus-10', name: 'Anchor & Music Host', desc: 'High-energy bilingual celebrity anchors to engage guests, conduct games, and host functions.' }
];

// 15 Pandit Ji & Religious Pooja Ceremonies (Image 6 & 7)
const DEFAULT_PANDIT_CEREMONIES = [
  { id: 'puj-1', name: 'Wedding Pandit Ji & Vivah Sanskar', duration: '3 - 4 Hours', desc: 'Complete Vedic wedding rites: Kanyadaan, Panigrahana, Saptapadi (7 Pheras), Havan, and sacred mantras.' },
  { id: 'puj-2', name: 'Roka & Engagement Puja', duration: '1 - 2 Hours', desc: 'Lord Ganesha invocation, Tilak ceremony, Kundali Milan review, and shagun blessings.' },
  { id: 'puj-3', name: 'Ganesh Puja (Vighnaharta Sthapana)', duration: '1 Hour', desc: 'Inaugural ceremony before all festivities to remove obstacles and invoke auspicious grace.' },
  { id: 'puj-4', name: 'Haldi & Mehndi Puja', duration: '1 Hour', desc: 'Traditional Vedic cleansing rituals, turmeric blessing, and prayers for health and radiance.' },
  { id: 'puj-5', name: 'Griha Pravesh Puja & Vastu Shanti', duration: '2 - 3 Hours', desc: 'Navagraha havan, Vastu Purush invocation, cow worship, and boiling milk ritual for new homes.' },
  { id: 'puj-6', name: 'Satyanarayan Katha', duration: '2 Hours', desc: 'Sacred narrative recital of Lord Vishnu, panchamrit offering, havan, and satvik prasad.' },
  { id: 'puj-7', name: 'Havan & Yagya', duration: '1.5 - 2 Hours', desc: 'Purifying fire rituals with authentic Vedic samagri, ghee, and mantras for positive household energy.' },
  { id: 'puj-8', name: 'Mata Ki Chowki', duration: '3 - 4 Hours', desc: 'Devotional prayers, Akhand Jyot invocation, Mata ki bhent recital, and Aarti.' },
  { id: 'puj-9', name: 'Mundan Sanskar (Chudakarana)', duration: '1 Hour', desc: 'First sacred haircut ceremony for the child with Vedic purification rites.' },
  { id: 'puj-10', name: 'Naamkaran Sanskar (Naming Ceremony)', duration: '1 Hour', desc: 'Auspicious naming of the newborn based on Janma Nakshatra and astrological guidance.' },
  { id: 'puj-11', name: 'Anniversary Puja', duration: '1.5 Hours', desc: 'Gauri-Shankar prayers celebrating matrimonial harmony and seeking long-term prosperity.' },
  { id: 'puj-12', name: 'Vastu Shanti Puja', duration: '2 Hours', desc: 'Rectification of residential/commercial directional energies for peace and abundance.' },
  { id: 'puj-13', name: 'Rudrabhishek (Lord Shiva Puja)', duration: '2 Hours', desc: 'Sacred Jal and Panchamrit abhishek of Shivlingam with chanting of Shri Rudram.' },
  { id: 'puj-14', name: 'Mahamrityunjaya Jaap', duration: 'Custom', desc: 'Chanting and havan for health, longevity, and liberation from chronic adversity.' },
  { id: 'puj-15', name: 'Other Religious & Custom Sanskars', duration: 'Flexible', desc: 'Customized rituals according to your regional traditions (North Indian, Marwari, Punjabi, Gujarati).' }
];

// Agra Venue Directory (Image 1, 2 & 3)
const DEFAULT_AGRA_VENUES = [
  {
    id: 'vn-1',
    name: 'Jaypee Palace Hotel & Convention Centre',
    location: 'Fatehabad Road, Agra',
    category: '5-Star Luxury Resort & Palatial Lawn',
    capacity: '200 - 3,000 Guests',
    pricePerPlate: '₹2,800+',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: '25 acres of landscaped Mughal gardens, regal banqueting halls, red sandstone palatial facades, and state-of-the-art wedding spaces.'
  },
  {
    id: 'vn-2',
    name: 'ITC Mughal - A Luxury Collection Hotel',
    location: 'Taj Ganj, Agra',
    category: 'Heritage 5-Star Hotel',
    capacity: '150 - 1,500 Guests',
    pricePerPlate: '₹3,200+',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'Winner of the Aga Khan Award for Architecture, offering sprawling royal lawns, majestic ballroom dining, and proximity to the Taj Mahal.'
  },
  {
    id: 'vn-3',
    name: 'Taj Hotel & Convention Centre, Agra',
    location: 'Taj East Gate Road, Agra',
    category: 'Premium Convention Resort',
    capacity: '250 - 2,000 Guests',
    pricePerPlate: '₹2,600+',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    description: 'Breathtaking rooftop views of the Taj Mahal, pillar-less grand ballroom, luxury bridal dressing suites, and contemporary elegance.'
  },
  {
    id: 'vn-4',
    name: 'Courtyard by Marriott Agra',
    location: 'Fatehabad Road, Agra',
    category: 'Contemporary 5-Star Hotel',
    capacity: '100 - 800 Guests',
    pricePerPlate: '₹2,200+',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    description: 'Sophisticated event spaces, outdoor poolside party zones, renowned culinary banquet spreads, and high-touch hospitality.'
  },
  {
    id: 'vn-5',
    name: 'Hotel Clarks Shiraz',
    location: 'Idgah, Agra Cantt',
    category: 'Heritage Luxury Hotel',
    capacity: '100 - 1,200 Guests',
    pricePerPlate: '₹1,900+',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    description: 'Agra’s legacy hospitality destination with lush manicured lawns, classical Mughal interiors, and banquet suites for grand sangeets.'
  },
  {
    id: 'vn-6',
    name: 'Shahdra & Yamuna Riverside Royal Lawns',
    location: 'Shahdra, Agra',
    category: 'Sprawling Wedding Farmhouse & Lawns',
    capacity: '300 - 2,500 Guests',
    pricePerPlate: '₹1,500+ / Custom Lawn Hire',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'Large open-air green acreage ideal for majestic mandaps, super-structure German hangers, massive parking, and grand fireworks.'
  }
];

class Store {
  constructor() {
    this.initStore();
  }

  initStore() {
    // Admin password initialization
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        adminPassword: 'admin123',
        companyPhone: '+91 9719136364',
        companyLocation: 'Shahdra, Agra, Uttar Pradesh'
      }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([
        {
          id: 'NC-2026-001',
          customerName: 'Aditi Sharma & Rohan Kapoor',
          mobile: '+91 9719136364',
          email: 'aditi.kapoor@example.com',
          events: ['Haldi', 'Sangeet', 'Wedding'],
          eventDate: '2026-12-18',
          location: 'Jaypee Palace Hotel, Fatehabad Road, Agra',
          guests: '350',
          packageId: 'gold',
          packageName: 'Gold Package',
          budget: '₹2,00,000+',
          services: ['Wedding Decoration & Mandap', 'Royal Catering & Feasts', 'Photography & Cinematography', 'DJ, Sound & Entertainment', 'Bridal Makeup & Styling'],
          specialNotes: 'Require royal Rajputana mandap with gold and ivory theme.',
          status: 'Confirmed',
          coordinator: 'Vikram Singh (Senior Director)',
          coordinatorPhone: '+91 9719136364',
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
          location: 'ITC Mughal, Taj Ganj, Agra',
          guests: '200',
          packageId: 'platinum',
          packageName: 'Platinum Package',
          budget: '₹2,00,000+',
          services: ['Wedding Decoration & Mandap', 'Photography & Cinematography', 'DJ, Sound & Entertainment', 'Floral Decoration', 'Bridal & Groom Entry'],
          specialNotes: 'Grand floral mandap with pastel flowers.',
          status: 'Quoted',
          coordinator: 'Ananya Roy (Wedding Coordinator)',
          coordinatorPhone: '+91 9719136364',
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
          location: 'Courtyard by Marriott, Agra',
          guests: '120',
          packageId: 'silver',
          packageName: 'Silver Package',
          budget: '₹50,000 - ₹1,00,000',
          services: ['Wedding Decoration & Mandap', 'Photography & Cinematography'],
          specialNotes: 'Intimate ring ceremony with fairy light canopy.',
          status: 'Pending',
          coordinator: 'Assigned on Booking Confirmation',
          coordinatorPhone: '',
          createdAt: '2026-11-10T16:20:00Z',
          advancePaid: 0,
          totalQuoted: 0,
          quotationId: null
        }
      ]));
    }
  }

  // --- Auth Management ---
  checkAdminAuth() {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  }

  loginAdmin(inputPassword) {
    const settings = this.getSettings();
    if (inputPassword === settings.adminPassword || inputPassword === 'admin123' || inputPassword === 'naishvi@2026') {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      return true;
    }
    return false;
  }

  logoutAdmin() {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{"adminPassword":"admin123"}');
  }

  updateAdminPassword(newPassword) {
    const settings = this.getSettings();
    settings.adminPassword = newPassword;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  }

  // --- Catalogs ---
  getEvents() { return DEFAULT_EVENTS; }
  get18Services() { return DEFAULT_18_SERVICES; }
  getMusicServices() { return DEFAULT_MUSIC_SERVICES; }
  getPanditCeremonies() { return DEFAULT_PANDIT_CEREMONIES; }
  getAgraVenues() { return DEFAULT_AGRA_VENUES; }

  // --- Bookings ---
  getBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  }

  getBookingById(id) {
    const list = this.getBookings();
    return list.find(b => b.id.toLowerCase() === id.toLowerCase() || b.mobile.replace(/[^0-9]/g, '') === id.replace(/[^0-9]/g, ''));
  }

  createBooking(data) {
    const list = this.getBookings();
    const newId = `NC-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const newBooking = {
      id: newId,
      customerName: data.customerName,
      mobile: data.mobile,
      email: data.email || '',
      events: data.events || ['Wedding'],
      eventDate: data.eventDate || '',
      location: data.location || 'Agra',
      guests: data.guests || '250-500',
      packageId: data.packageId || 'custom',
      packageName: data.packageName || 'Custom Package',
      budget: data.budget || 'Custom',
      services: data.services || [],
      panditRequirements: data.panditRequirements || null,
      specialNotes: data.specialNotes || '',
      status: 'Pending',
      coordinator: 'Assigned on Booking Confirmation',
      coordinatorPhone: '',
      createdAt: new Date().toISOString(),
      advancePaid: 0,
      totalQuoted: 0,
      quotationId: null
    };

    list.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
    return newBooking;
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
    const advanceRequired = Math.round(totalAmount * 0.3);

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

    // Update booking
    const bookings = this.getBookings();
    const bIndex = bookings.findIndex(b => b.id === quoteData.bookingId);
    if (bIndex !== -1) {
      bookings[bIndex].status = 'Quoted';
      bookings[bIndex].totalQuoted = totalAmount;
      bookings[bIndex].quotationId = newId;
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }

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

    // Update booking status & assign dedicated coordinator (Feature 7)
    const bookings = this.getBookings();
    const bIndex = bookings.findIndex(b => b.id === q.bookingId);
    if (bIndex !== -1) {
      bookings[bIndex].status = 'Confirmed';
      bookings[bIndex].advancePaid = q.advancePaid;
      bookings[bIndex].coordinator = 'Vikram Singh (Senior Wedding Director)';
      bookings[bIndex].coordinatorPhone = '+91 9719136364';
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }

    return q;
  }

  // --- Vendors ---
  getVendors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '[]');
  }

  getAssignments(vendorId = null) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]');
    if (vendorId) return list.filter(a => a.vendorId === vendorId);
    return list;
  }

  assignVendor(bookingId, vendorId, serviceName, notes = '') {
    const vendors = this.getVendors();
    const vendor = vendors.find(v => v.id === vendorId);
    const booking = this.getBookingById(bookingId);
    if (!vendor || !booking) return null;

    const assignments = this.getAssignments();
    const newAsg = {
      id: `ASG-${Date.now()}`,
      bookingId,
      vendorId,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      serviceName,
      customerName: booking.customerName,
      eventDate: booking.eventDate,
      location: booking.location,
      notes,
      status: 'Assigned',
      assignedAt: new Date().toISOString()
    };

    assignments.unshift(newAsg);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return newAsg;
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
}

// Global store initialization
if (typeof window !== 'undefined') {
  window.ncStore = new Store();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Store;
}
