/**
 * Naishvi Celebrations - Main Frontend Interaction Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBookingWizard();
  initQuickBookingForm();
  renderEvents();
  renderServices();
  renderPackages();
  renderReviews();
});

// Mobile Menu Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const navMenu = document.getElementById('navMenu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when link clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

// Render Events in Section
function renderEvents() {
  const container = document.getElementById('eventsContainer');
  if (!container || !window.ncStore) return;

  const events = window.ncStore.getEvents();
  container.innerHTML = events.map(evt => `
    <div class="event-card" onclick="selectEventAndScroll('${evt.name}')">
      <img src="${evt.image}" alt="${evt.name} - Naishvi Celebrations" loading="lazy">
      <div class="event-card-overlay">
        <span class="event-badge">${evt.hindi}</span>
        <h3 class="event-title">${evt.name}</h3>
        <p class="event-tagline">${evt.tagline}</p>
        <p class="event-details">${evt.description}</p>
        <div class="event-select-trigger">
          <span>Plan This Ceremony</span>
          <i class="fa-solid fa-arrow-right"></i>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Services in Section
function renderServices() {
  const container = document.getElementById('servicesContainer');
  if (!container || !window.ncStore) return;

  const services = window.ncStore.getServices();
  container.innerHTML = services.map(srv => `
    <div class="service-card" onclick="selectServiceAndScroll('${srv.name}')">
      <div>
        <div class="service-icon-wrap">
          <i class="fa-solid ${srv.icon}"></i>
        </div>
        <h3 class="service-title">${srv.name}</h3>
        <p class="service-desc">${srv.desc}</p>
      </div>
      <div class="service-price-tag">
        <i class="fa-solid fa-tag"></i> Starting from ₹${srv.defaultCost.toLocaleString('en-IN')}
      </div>
    </div>
  `).join('');
}

// Render Packages in Section
function renderPackages() {
  const container = document.getElementById('packagesContainer');
  if (!container || !window.ncStore) return;

  const packages = window.ncStore.getPackages();
  container.innerHTML = packages.map(pkg => `
    <div class="package-card ${pkg.popular ? 'popular' : ''}">
      ${pkg.popular ? '<div class="popular-badge"><i class="fa-solid fa-crown"></i> Most Popular</div>' : ''}
      <h3 class="package-tier-name">${pkg.name}</h3>
      <p class="package-tagline">${pkg.tagline}</p>
      
      <div class="package-price-wrap">
        <div class="package-price">${pkg.priceLabel}</div>
        <div class="package-note">*Customized to your guest count & city</div>
      </div>

      <ul class="package-features">
        ${pkg.features.map(f => `<li><i class="fa-solid fa-circle-check"></i> ${f}</li>`).join('')}
      </ul>

      <button type="button" class="btn ${pkg.popular ? 'btn-gold' : 'btn-outline-gold'} btn-lg" onclick="selectPackageAndOpenWizard('${pkg.id}')">
        Choose ${pkg.name}
      </button>
    </div>
  `).join('');
}

// Render Client Reviews
function renderReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container || !window.ncStore) return;

  const reviews = window.ncStore.getReviews();
  container.innerHTML = reviews.map(rev => `
    <div class="testimonial-card">
      <div>
        <div class="stars-rating">
          ${Array(rev.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
        </div>
        <p class="testimonial-text">"${rev.quote}"</p>
      </div>
      <div class="testimonial-author">
        <img src="${rev.avatar}" alt="${rev.customerName}" class="author-avatar">
        <div class="author-info">
          <h5>${rev.customerName}</h5>
          <p>${rev.event} • ${rev.date}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// -----------------------------------------------------------------------------
// Interactive 5-Step Customer Wedding Planning & Booking Engine (Steps 1 to 5)
// -----------------------------------------------------------------------------
let wizardState = {
  selectedEvents: ['Wedding'],
  selectedServices: ['Wedding Decoration', 'Catering & Feasts', 'Photography & Cinema', 'DJ & Sound / Music'],
  selectedPackage: 'gold',
  packageName: 'Gold Package',
  customerName: '',
  mobile: '',
  email: '',
  eventDate: '',
  location: '',
  guests: '200-500',
  budget: '₹99,999 onwards'
};

function initBookingWizard() {
  const wizardForm = document.getElementById('weddingWizardForm');
  if (!wizardForm) return;

  // Listen to event checkboxes
  const eventPills = document.querySelectorAll('.event-pill-checkbox');
  eventPills.forEach(pill => {
    pill.addEventListener('change', () => {
      const parent = pill.closest('.event-pill-item');
      if (parent) parent.classList.toggle('selected', pill.checked);
      updateWizardState();
    });
  });

  // Listen to service checkboxes
  const serviceCards = document.querySelectorAll('.service-checkbox-input');
  serviceCards.forEach(chk => {
    chk.addEventListener('change', () => {
      const card = chk.closest('.service-checkbox-card');
      if (card) card.classList.toggle('selected', chk.checked);
      updateWizardState();
    });
  });

  // Package select radio buttons
  const pkgRadios = document.querySelectorAll('input[name="selectedPackageRadio"]');
  pkgRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      wizardState.selectedPackage = radio.value;
      const pkg = window.ncStore.getPackages().find(p => p.id === radio.value);
      if (pkg) {
        wizardState.packageName = pkg.name;
        wizardState.budget = pkg.priceLabel;
      }
    });
  });

  // Form Submit
  wizardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleWizardSubmission();
  });
}

function updateWizardState() {
  // Collect events
  const selectedEvts = [];
  document.querySelectorAll('.event-pill-checkbox:checked').forEach(cb => selectedEvts.push(cb.value));
  wizardState.selectedEvents = selectedEvts.length > 0 ? selectedEvts : ['Wedding'];

  // Collect services
  const selectedSrvs = [];
  document.querySelectorAll('.service-checkbox-input:checked').forEach(cb => selectedSrvs.push(cb.value));
  wizardState.selectedServices = selectedSrvs;
}

function handleWizardSubmission() {
  updateWizardState();

  const nameInput = document.getElementById('custName');
  const mobileInput = document.getElementById('custMobile');
  const emailInput = document.getElementById('custEmail');
  const dateInput = document.getElementById('custDate');
  const locationInput = document.getElementById('custLocation');
  const guestsSelect = document.getElementById('custGuests');
  const budgetSelect = document.getElementById('custBudget');
  const notesInput = document.getElementById('custNotes');

  if (!nameInput.value.trim() || !mobileInput.value.trim()) {
    alert('Please enter your full name and WhatsApp mobile number.');
    return;
  }

  const bookingData = {
    customerName: nameInput.value.trim(),
    mobile: mobileInput.value.trim(),
    email: emailInput ? emailInput.value.trim() : '',
    events: wizardState.selectedEvents,
    eventDate: dateInput.value || '2026-12-20',
    location: locationInput.value.trim() || 'Jaipur / Delhi NCR',
    guests: guestsSelect ? guestsSelect.value : '200-500',
    packageId: wizardState.selectedPackage,
    packageName: wizardState.packageName,
    budget: budgetSelect ? budgetSelect.value : wizardState.budget,
    services: wizardState.selectedServices,
    specialNotes: notesInput ? notesInput.value.trim() : ''
  };

  const newBooking = window.ncStore.createBooking(bookingData);

  // Show Success Modal / Step 6 preview
  showBookingSuccessModal(newBooking);
}

function showBookingSuccessModal(booking) {
  const modal = document.getElementById('bookingSuccessModal');
  const modalBody = document.getElementById('bookingSuccessBody');
  if (!modal || !modalBody) return;

  const waText = encodeURIComponent(
    `Namaste Naishvi Celebrations! 🙏\nI have just submitted a wedding booking request on your website.\n\n` +
    `📋 Booking ID: ${booking.id}\n` +
    `👤 Name: ${booking.customerName}\n` +
    `💍 Events: ${booking.events.join(', ')}\n` +
    `📅 Date: ${booking.eventDate}\n` +
    `📍 Venue/City: ${booking.location}\n` +
    `👥 Guests: ${booking.guests}\n` +
    `✨ Selected Services: ${booking.services.join(', ')}\n` +
    `💎 Package: ${booking.packageName}\n\n` +
    `Please share the formal quotation and consultation details.`
  );

  modalBody.innerHTML = `
    <div style="text-align: center; padding: 10px 0;">
      <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(212, 175, 55, 0.15); border: 2px solid var(--primary-gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: var(--primary-gold); font-size: 32px;">
        <i class="fa-solid fa-check"></i>
      </div>
      <h3 style="font-size: 1.8rem; color: #fff; margin-bottom: 6px;">Booking Enquiry Received!</h3>
      <p style="color: var(--primary-gold-light); font-size: 0.95rem; margin-bottom: 20px;">
        Booking ID: <strong>${booking.id}</strong> • Status: <strong>Enquiry Logged in Admin Dashboard</strong>
      </p>

      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 20px; text-align: left; margin-bottom: 24px;">
        <h4 style="color: #eeddb0; font-size: 1rem; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
          <i class="fa-solid fa-bell text-gold"></i> Real-Time Notifications Dispatched
        </h4>
        <div style="font-size: 0.88rem; color: #d1d5db; line-height: 1.7;">
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Central Dashboard:</strong> Order alert received & registered.</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Customer:</strong> ${booking.customerName} (${booking.mobile})</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Events:</strong> ${booking.events.join(', ')}</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Location:</strong> ${booking.location} | Date: ${booking.eventDate}</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Services:</strong> ${booking.services.join(', ')}</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="https://api.whatsapp.com/send?phone=919719136364&text=${waText}" target="_blank" class="btn btn-gold btn-lg">
          <i class="fa-brands fa-whatsapp" style="font-size: 1.3rem;"></i> Connect Directly on WhatsApp
        </a>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
          <a href="admin.html" class="btn btn-maroon">
            <i class="fa-solid fa-shield-halved"></i> Open Admin Portal
          </a>
          <a href="customer-portal.html?bookingId=${booking.id}" class="btn btn-outline-gold">
            <i class="fa-solid fa-file-invoice-dollar"></i> View Custom Quotation
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Helper shortcuts for clicks from cards
function selectEventAndScroll(eventName) {
  const pill = document.querySelector(`.event-pill-checkbox[value="${eventName}"]`);
  if (pill) {
    pill.checked = true;
    const parent = pill.closest('.event-pill-item');
    if (parent) parent.classList.add('selected');
  }
  const planner = document.getElementById('weddingPlannerEngine');
  if (planner) planner.scrollIntoView({ behavior: 'smooth' });
}

function selectServiceAndScroll(serviceName) {
  const chk = document.querySelector(`.service-checkbox-input[value="${serviceName}"]`);
  if (chk) {
    chk.checked = true;
    const parent = chk.closest('.service-checkbox-card');
    if (parent) parent.classList.add('selected');
  }
  const planner = document.getElementById('weddingPlannerEngine');
  if (planner) planner.scrollIntoView({ behavior: 'smooth' });
}

function selectPackageAndOpenWizard(packageId) {
  const radio = document.querySelector(`input[name="selectedPackageRadio"][value="${packageId}"]`);
  if (radio) {
    radio.checked = true;
    wizardState.selectedPackage = packageId;
  }
  const planner = document.getElementById('weddingPlannerEngine');
  if (planner) planner.scrollIntoView({ behavior: 'smooth' });
}

// Quick footer consultation form
function initQuickBookingForm() {
  const form = document.getElementById('quickConsultForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="quickName"]').value;
    const phone = form.querySelector('[name="quickPhone"]').value;
    const city = form.querySelector('[name="quickCity"]').value;

    const b = window.ncStore.createBooking({
      customerName: name,
      mobile: phone,
      location: city,
      events: ['Full Wedding Package'],
      packageId: 'gold',
      packageName: 'Gold Package'
    });

    alert(`Thank you, ${name}! Your consultation request has been received. Our senior wedding planner will call you on ${phone}.`);
    form.reset();
  });
}
