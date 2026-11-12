# NAISHVI CELEBRATIONS
### WEDDINGS • EVENTS • DESTINATIONS
**"Your Dream Wedding, Our Responsibility."**

A complete, ultra-luxury, production-ready website and end-to-end wedding management platform built to fulfill all 10 steps of your business workflow.

---

## 🌟 Quick Start Guide (Run Instantly)

You do **not** need to install anything! The platform is designed with a reactive, client-side data store (`store.js`) using browser LocalStorage.

Simply open the files directly in your web browser (Google Chrome, Microsoft Edge, Brave, Firefox, etc.):

1. **Customer Website**: Double click `index.html`
2. **Admin Dashboard (Business Desk)**: Double click `admin.html`
3. **Customer Quotation & Online Payment Portal**: Double click `customer-portal.html`
4. **Vendor Partner Operations Desk**: Double click `vendor-portal.html`

*(If you ever install Node.js in the future, the repository also includes a complete Express/SQLite backend in `server.js` and `routes/` ready for deployment).*

---

## 📋 Complete 10-Step Workflow Implementation

### Step 1: Customer Website Open Karega (`index.html`)
- **Branding**: NAISHVI CELEBRATIONS with tagline *WEDDINGS • EVENTS • DESTINATIONS*.
- **Navigation**: Home, Wedding Events, Services, Packages, Book Event, Gallery, About Us, Contact.
- **Hero Banner**: *"Your Dream Wedding, Our Responsibility"* & *"From dreamy beginnings to forever memories — we make it perfect."*
- **Live Stats Bar**:
  - `250+` Weddings Planned
  - `98%` Happy Clients
  - `4.9/5` Client Rating
  - `20+` Cities Across India
- **Press Strip**: Featured in *VOGUE*, *WedMeGood*, *WeddingSutra*, *BRIDES TODAY*.
- **Value Propositions**: Personalized Planning, Premium Décor & Design, Handpicked Vendors, End-to-End Management, Budget-Friendly & Trust & Transparency badges.

### Step 2: Customer Apna Event Select Karega (`#events`)
Interactive multi-select ceremony options with royal imagery:
1. **Engagement** (सगाई समारोह)
2. **Haldi** (हल्दी उत्सव)
3. **Mehndi** (मेहंदी की रात)
4. **Sangeet** (संगीत संध्या)
5. **Wedding** (शुभ विवाह)
6. **Reception** (स्वागत समारोह)
*(Customer can select a single ceremony or bundle multiple ceremonies together).*

### Step 3: Customer Services Select Karega (`#services`)
Customer adds required services to their customized package:
- **Wedding Decoration** (Mandaps, royal stage & lighting)
- **Catering & Feasts** (Multi-cuisine luxury feasts)
- **Photography & Cinema** (Candid, 4K film & drone coverage)
- **Bridal Makeup & Styling** (HD airbrush & hair styling)
- **DJ & Sound / Music** (Concert-grade line array & intelligent truss)
- **Venue Booking & Negotiation** (Palaces, resorts & banquet spaces)
- **Exotic Flower Decoration** (Imported fresh floral installations)
- **Bridal Entry & Special Effects** (Cold pyro, cloud smoke & vintage palki)
- **Guest Transportation & Logistics** (Vintage baraat cars & guest coaches)

### Step 4: Customer Budget Aur Package Select Karega (`#packages`)
Three transparent packages matching your exact pricing specifications:
- **Silver Package**: ₹49,999 onwards (Small functions and basic elegant arrangements)
- **Gold Package (Popular)**: ₹99,999 onwards (Premium decoration and complete event arrangements)
- **Platinum Package**: ₹1,99,999 onwards (Luxury royal wedding experience and bespoke custom services)

### Step 5: Customer Apni Details Fill Karega (`#weddingPlannerEngine`)
Clean, dark luxury booking form capturing:
- Customer Full Name
- Mobile / WhatsApp Number
- Event Type(s)
- Event Date (Datepicker)
- Event Location / City
- Number of Guests (50-100, 100-250, 250-500, 500-1000, 1000+)
- Approximate Budget
- Special preferences / notes
- **"Submit Booking & Receive Instant Quotation"** button.

### Step 6: Order Aapke Paas Aayega (Admin Dashboard - `admin.html`)
When the customer submits their booking:
- The lead automatically appears in the **Admin Dashboard** in real time.
- All enquiry details are captured: customer name, mobile number, event date, venue location, selected services, budget, guest count.
- Dispatch notifications:
  - **WhatsApp Notification** pre-formatted message button
  - **Email Notification**
  - **Website Admin Dashboard** real-time alert badge

### Step 7: Aap Customer Ko Quotation Bhejoge (`admin.html#quotationSection`)
Admin can generate a custom itemized **Custom Wedding Quotation**:
- Pre-populated example breakdown:
  - Decoration: ₹50,000
  - Catering: ₹1,00,000
  - Photography: ₹30,000
  - DJ & Music: ₹15,000
  - **Total**: ₹1,95,000
- Ability to add/remove custom line items, change costs, and apply festival discounts.
- Automatically calculates the **30% Advance Payment** required for booking confirmation.
- One-click button to send the formatted quotation to the customer via WhatsApp!

### Step 8: Online Payment Aur Booking Confirmation (`customer-portal.html`)
- Customer enters their Booking ID or phone number to view their official **Naishvi Celebrations Quotation**.
- Customer clicks **"Approve & Pay Advance Online"**:
  - **UPI**: Google Pay, PhonePe, Paytm, BHIM (with dynamic QR code & UPI ID)
  - **Cards**: Debit Card & Credit Card
  - **Net Banking**: HDFC, ICICI, SBI, Axis, Kotak
- On payment completion:
  - Booking status automatically switches to **"Confirmed"**.
  - Generates official payment confirmation receipt with Transaction ID.
  - Printable / PDF download ready.

### Step 9: Vendors Ko Order Assign Hoga (`admin.html` & `vendor-portal.html`)
Platform has verified vendor partners:
1. **Royal Heritage Decorators** (Decoration)
2. **Maharaja Caterers & Banquets** (Catering)
3. **The Wedding Storytellers** (Photography & Cinema)
4. **SoundWave Productions & DJ** (DJ & Sound)
5. **Glamour & Glow Studio** (Makeup Artist)
- Admin assigns any vendor to a wedding with custom event deliverables and notes.
- The vendor opens `vendor-portal.html` to see their assigned wedding bookings, dates, venue locations, and deliverables.

### Step 10: Event Complete Aur Final Payment (`vendor-portal.html` & `customer-portal.html`)
- Pre-event checklist: Vendor marks *"Arrangements Checked & Ready on Site"*.
- Event completes successfully.
- Remaining balance settlement option.
- Final tax invoice generated.
- Customer submits a 5-star rating & review on `customer-portal.html#reviewSection`, which immediately publishes to the homepage testimonials!

---

## 🌐 Recommended Website Domains
As requested in your project notes:
- `naishvicelebrations.com`
- `naishviweddings.com`
- `naishvievents.com`

---

## 📁 Project Structure
```
c:\Rishik Workstation\SHYAM\
├── index.html                  # Main Customer Website (Steps 1 to 5)
├── admin.html                  # Admin Dashboard (Steps 6, 7 & 9)
├── customer-portal.html        # Quotation View & Online Payment (Steps 8 & 10)
├── vendor-portal.html          # Vendor Operations Desk (Steps 9 & 10)
├── assets/
│   ├── css/
│   │   └── style.css           # Ultra-luxury Indian wedding styling
│   ├── js/
│   │   ├── store.js            # Central reactive localStorage store & sample data
│   │   ├── main.js             # Customer website interactions & booking engine
│   │   ├── admin.js            # Admin dashboard logic, quotes & vendor assignment
│   │   ├── customer.js         # Quotation viewer, payment gateway & reviews
│   │   └── vendor.js           # Vendor dashboard controller
│   └── images/
│       └── requirements/       # 12 original reference images from your upload
├── server.js                   # Node/Express backend server
├── database/                   # SQLite database schema & seed data
├── routes/                     # Express REST API routes
└── README.md                   # This project guide
```
