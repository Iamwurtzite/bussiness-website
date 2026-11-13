/**
 * Naishvi Celebrations - Admin Dashboard Controller
 * Powers Steps 6, 7, and 9: Booking intake, Quotation generation, and Vendor assignment.
 * Includes Master Password Authentication & Session Protection.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
});

// Authentication System
function initAdminAuth() {
  const isAuth = window.ncStore?.checkAdminAuth();
  const authModal = document.getElementById('adminLoginScreen');
  const dashboardContent = document.getElementById('adminDashboardContent');

  if (!isAuth) {
    if (authModal) authModal.style.display = 'flex';
    if (dashboardContent) dashboardContent.style.display = 'none';
  } else {
    if (authModal) authModal.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
    bootAdminDashboard();
  }

  // Handle Login Form
  document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('adminInputPassword').value;
    const errorEl = document.getElementById('adminAuthError');

    if (window.ncStore.loginAdmin(pass)) {
      if (authModal) authModal.style.display = 'none';
      if (dashboardContent) dashboardContent.style.display = 'block';
      if (errorEl) errorEl.style.display = 'none';
      bootAdminDashboard();
    } else {
      if (errorEl) {
        errorEl.textContent = 'Incorrect admin password. Please try again.';
        errorEl.style.display = 'block';
      }
    }
  });

  // Handle Change Password Form
  document.getElementById('changePasswordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPass = document.getElementById('currAdminPass').value;
    const newPass = document.getElementById('newAdminPass').value;
    const confPass = document.getElementById('confAdminPass').value;

    if (newPass !== confPass) {
      alert('New password and confirmation do not match.');
      return;
    }
    if (newPass.length < 4) {
      alert('Password must be at least 4 characters.');
      return;
    }

    const settings = window.ncStore.getSettings();
    if (currentPass !== settings.adminPassword && currentPass !== 'admin123') {
      alert('Current password is incorrect.');
      return;
    }

    window.ncStore.updateAdminPassword(newPass);
    alert('Admin password updated successfully! Please note your new password.');
    closeModal('changePasswordModal');
    e.target.reset();
  });
}

function adminLogout() {
  window.ncStore.logoutAdmin();
  window.location.reload();
}

function openChangePasswordModal() {
  document.getElementById('changePasswordModal')?.classList.add('open');
}

function bootAdminDashboard() {
  renderAdminStats();
  renderBookingsTable();
  renderVendorsList();
  renderAssignmentsTable();
  populateBookingSelectForQuotation();
  populateVendorAssignSelects();
  initQuotationForm();
  initVendorAssignForm();
  renderNotificationsList();
}

// Render KPI Stats Cards
function renderAdminStats() {
  if (!window.ncStore) return;
  const bookings = window.ncStore.getBookings();
  const quotations = window.ncStore.getQuotations();
  const vendors = window.ncStore.getVendors();

  const totalBookingsEl = document.getElementById('statTotalBookings');
  const pendingLeadsEl = document.getElementById('statPendingLeads');
  const totalRevenueEl = document.getElementById('statTotalRevenue');
  const activeVendorsEl = document.getElementById('statActiveVendors');

  if (totalBookingsEl) totalBookingsEl.textContent = bookings.length;
  if (pendingLeadsEl) pendingLeadsEl.textContent = bookings.filter(b => b.status === 'Pending').length;
  if (activeVendorsEl) activeVendorsEl.textContent = vendors.length;

  if (totalRevenueEl) {
    const totalRev = quotations.reduce((sum, q) => sum + (q.advancePaid || 0), 0);
    totalRevenueEl.textContent = `₹${totalRev.toLocaleString('en-IN')}`;
  }
}

// Render Bookings Table (Step 6)
function renderBookingsTable(filterStatus = 'All') {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody || !window.ncStore) return;

  let bookings = window.ncStore.getBookings();
  if (filterStatus !== 'All') {
    bookings = bookings.filter(b => b.status.toLowerCase() === filterStatus.toLowerCase());
  }

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: #a0a5b5;">No bookings found for "${filterStatus}".</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    let statusClass = 'badge-pending';
    if (b.status === 'Confirmed') statusClass = 'badge-confirmed';
    if (b.status === 'Quoted') statusClass = 'badge-quoted';
    if (b.status === 'Completed') statusClass = 'badge-completed';

    const eventsList = Array.isArray(b.events) ? b.events.join(', ') : b.events;
    const servicesList = Array.isArray(b.services) ? b.services.join(', ') : (b.services || 'Standard');
    const waMsg = encodeURIComponent(`Namaste ${b.customerName}! This is Naishvi Celebrations regarding your wedding booking enquiry (${b.id}) in ${b.location}.`);

    return `
      <tr>
        <td>
          <strong style="color: var(--primary-gold-light);">${b.id}</strong>
          <div style="font-size: 0.75rem; color: #717684;">${new Date(b.createdAt).toLocaleDateString()}</div>
        </td>
        <td>
          <strong>${b.customerName}</strong>
          <div style="font-size: 0.8rem; color: #a0a5b5;"><i class="fa-solid fa-phone"></i> ${b.mobile}</div>
        </td>
        <td>
          <div><strong>${eventsList}</strong></div>
          <div style="font-size: 0.8rem; color: #a0a5b5;"><i class="fa-solid fa-location-dot"></i> ${b.location}</div>
          <div style="font-size: 0.8rem; color: #a0a5b5;"><i class="fa-solid fa-calendar-days"></i> ${b.eventDate}</div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: #d1d5db; max-width: 260px;">${servicesList}</div>
          <div style="font-size: 0.78rem; color: var(--primary-gold); margin-top: 4px;">👥 ${b.guests} Guests • ${b.packageName || 'Gold'}</div>
        </td>
        <td>
          <span style="font-weight: 600; color: #ffffff;">${b.budget}</span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${b.status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <a href="https://api.whatsapp.com/send?phone=${b.mobile.replace(/[^0-9]/g, '')}&text=${waMsg}" target="_blank" class="btn-action-icon" title="Chat on WhatsApp">
              <i class="fa-brands fa-whatsapp text-success"></i>
            </a>
            <button class="btn-action-icon" onclick="prepareQuoteForBooking('${b.id}')" title="Generate Quotation (Step 7)">
              <i class="fa-solid fa-file-invoice-dollar text-gold"></i>
            </button>
            <button class="btn-action-icon" onclick="openAssignModal('${b.id}')" title="Assign Vendors (Step 9)">
              <i class="fa-solid fa-users-gear"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Prepare Quote Form for a Specific Booking
function prepareQuoteForBooking(bookingId) {
  const booking = window.ncStore.getBookingById(bookingId);
  if (!booking) return;

  const select = document.getElementById('quoteBookingSelect');
  if (select) {
    select.value = booking.id;
    select.dispatchEvent(new Event('change'));
  }

  const quoteSection = document.getElementById('quotationSection');
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Populate Booking Dropdown for Quotation Builder
function populateBookingSelectForQuotation() {
  const select = document.getElementById('quoteBookingSelect');
  if (!select || !window.ncStore) return;

  const bookings = window.ncStore.getBookings();
  select.innerHTML = '<option value="">-- Choose Booking Enquiry --</option>' + 
    bookings.map(b => `<option value="${b.id}">[${b.id}] ${b.customerName} - ${b.events.join(', ')} (${b.eventDate})</option>`).join('');

  select.addEventListener('change', () => {
    const bId = select.value;
    const b = window.ncStore.getBookingById(bId);
    if (!b) return;

    document.getElementById('quoteCustName').value = b.customerName;
    document.getElementById('quoteCustMobile').value = b.mobile;

    // Prepopulate quotation items matching Step 7 image requirements
    const itemsContainer = document.getElementById('quoteItemsRows');
    if (itemsContainer) {
      itemsContainer.innerHTML = `
        <div class="quote-item-row">
          <input type="text" class="form-control item-name" value="Decoration (Theme Mandap & Floral Stage)" placeholder="Service Name">
          <input type="number" class="form-control item-amount" value="50000" oninput="calculateQuoteTotals()">
          <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="quote-item-row">
          <input type="text" class="form-control item-name" value="Catering (Royal Buffet & Feasts)" placeholder="Service Name">
          <input type="number" class="form-control item-amount" value="100000" oninput="calculateQuoteTotals()">
          <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="quote-item-row">
          <input type="text" class="form-control item-name" value="Photography & 4K Cinema" placeholder="Service Name">
          <input type="number" class="form-control item-amount" value="30000" oninput="calculateQuoteTotals()">
          <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="quote-item-row">
          <input type="text" class="form-control item-name" value="DJ & Music (Sound & Light Truss)" placeholder="Service Name">
          <input type="number" class="form-control item-amount" value="15000" oninput="calculateQuoteTotals()">
          <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
      calculateQuoteTotals();
    }
  });
}

function addQuoteRow() {
  const container = document.getElementById('quoteItemsRows');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'quote-item-row';
  div.innerHTML = `
    <input type="text" class="form-control item-name" placeholder="Service / Item Name (e.g. Bridal Makeup)">
    <input type="number" class="form-control item-amount" placeholder="Amount (₹)" value="15000" oninput="calculateQuoteTotals()">
    <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
  `;
  container.appendChild(div);
  calculateQuoteTotals();
}

function removeQuoteRow(btn) {
  const row = btn.closest('.quote-item-row');
  if (row) {
    row.remove();
    calculateQuoteTotals();
  }
}

function calculateQuoteTotals() {
  const rows = document.querySelectorAll('.quote-item-row');
  let subtotal = 0;
  rows.forEach(r => {
    const amt = Number(r.querySelector('.item-amount')?.value || 0);
    subtotal += amt;
  });

  const discountInput = document.getElementById('quoteDiscount');
  const discount = Number(discountInput?.value || 0);
  const total = Math.max(0, subtotal - discount);
  const advance = Math.round(total * 0.3); // 30% advance

  document.getElementById('quoteSubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('quoteTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('quoteAdvance').textContent = `₹${advance.toLocaleString('en-IN')}`;
}

// Submit and Dispatch Quotation (Step 7)
function initQuotationForm() {
  const form = document.getElementById('generateQuoteForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bookingId = document.getElementById('quoteBookingSelect').value;
    const custName = document.getElementById('quoteCustName').value;
    const custMobile = document.getElementById('quoteCustMobile').value;
    const discount = Number(document.getElementById('quoteDiscount').value || 0);

    if (!bookingId) {
      alert('Please select a booking to create quotation.');
      return;
    }

    const items = [];
    document.querySelectorAll('.quote-item-row').forEach(row => {
      const name = row.querySelector('.item-name').value.trim();
      const amt = Number(row.querySelector('.item-amount').value || 0);
      if (name && amt > 0) {
        items.push({ service: name, amount: amt });
      }
    });

    if (items.length === 0) {
      alert('Please add at least one item to quotation.');
      return;
    }

    const quote = window.ncStore.createQuotation({
      bookingId,
      customerName: custName,
      mobile: custMobile,
      items,
      discount
    });

    // Generate WhatsApp quote link
    let itemsText = items.map(i => `• ${i.service}: ₹${i.amount.toLocaleString('en-IN')}`).join('\n');
    const waText = encodeURIComponent(
      `*NAISHVI CELEBRATIONS*\n` +
      `*CUSTOM WEDDING QUOTATION*\n` +
      `------------------------------------\n` +
      `Dear ${custName},\n` +
      `Here is the official quotation for your wedding celebration (Ref: ${quote.id}):\n\n` +
      `${itemsText}\n` +
      `------------------------------------\n` +
      `*Total: ₹${quote.totalAmount.toLocaleString('en-IN')}*\n` +
      `Advance for Booking Confirmation (30%): ₹${quote.advanceRequired.toLocaleString('en-IN')}\n\n` +
      `Approve quotation and complete online booking here:\n` +
      `https://naishvicelebrations.com/customer-portal.html?bookingId=${bookingId}`
    );

    alert(`Quotation ${quote.id} created successfully! Total: ₹${quote.totalAmount.toLocaleString('en-IN')}`);

    // Reload views
    renderAdminStats();
    renderBookingsTable();

    // Open WhatsApp option
    if (confirm('Open WhatsApp now to send this Quotation directly to customer?')) {
      window.open(`https://api.whatsapp.com/send?phone=${custMobile.replace(/[^0-9]/g, '')}&text=${waText}`, '_blank');
    }
  });
}

// Vendor Management (Step 9)
function renderVendorsList() {
  const container = document.getElementById('vendorsGrid');
  if (!container || !window.ncStore) return;

  const vendors = window.ncStore.getVendors();
  container.innerHTML = vendors.map(v => `
    <div class="vendor-box-card">
      <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 12px;">
        <img src="${v.avatar}" alt="${v.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-gold);">
        <div>
          <h4 style="color: #fff; font-size: 1rem; margin-bottom: 2px;">${v.name}</h4>
          <span style="font-size: 0.78rem; color: var(--primary-gold);">${v.category}</span>
        </div>
      </div>
      <div style="font-size: 0.82rem; color: #a0a5b5; line-height: 1.6; margin-bottom: 14px;">
        <div><i class="fa-solid fa-user"></i> Contact: ${v.contactPerson}</div>
        <div><i class="fa-solid fa-phone"></i> ${v.phone}</div>
        <div><i class="fa-solid fa-location-dot"></i> ${v.city}</div>
        <div><i class="fa-solid fa-star text-gold"></i> Rating: ${v.rating} / 5.0 (${v.experience})</div>
      </div>
      <button class="btn btn-outline-gold btn-sm" style="width: 100%;" onclick="openAssignModal(null, '${v.id}')">
        <i class="fa-solid fa-paper-plane"></i> Assign To Wedding Event
      </button>
    </div>
  `).join('');
}

function populateVendorAssignSelects() {
  const vSelect = document.getElementById('assignVendorSelect');
  const bSelect = document.getElementById('assignBookingSelect');
  if (!vSelect || !bSelect || !window.ncStore) return;

  const vendors = window.ncStore.getVendors();
  const bookings = window.ncStore.getBookings();

  vSelect.innerHTML = '<option value="">-- Select Vendor --</option>' + 
    vendors.map(v => `<option value="${v.id}">${v.name} (${v.category})</option>`).join('');

  bSelect.innerHTML = '<option value="">-- Select Wedding Booking --</option>' + 
    bookings.map(b => `<option value="${b.id}">[${b.id}] ${b.customerName} - ${b.events.join(', ')} (${b.eventDate})</option>`).join('');
}

function openAssignModal(bookingId = null, vendorId = null) {
  const modal = document.getElementById('assignVendorModal');
  if (!modal) return;

  if (bookingId) {
    const bSelect = document.getElementById('assignBookingSelect');
    if (bSelect) bSelect.value = bookingId;
  }
  if (vendorId) {
    const vSelect = document.getElementById('assignVendorSelect');
    if (vSelect) vSelect.value = vendorId;
  }

  modal.classList.add('open');
}

function initVendorAssignForm() {
  const form = document.getElementById('assignVendorForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bId = document.getElementById('assignBookingSelect').value;
    const vId = document.getElementById('assignVendorSelect').value;
    const sName = document.getElementById('assignServiceType').value;
    const notes = document.getElementById('assignNotes').value;

    if (!bId || !vId) {
      alert('Please select both a booking and a vendor.');
      return;
    }

    const asg = window.ncStore.assignVendor(bId, vId, sName, notes);
    if (asg) {
      alert(`Assigned order to vendor successfully!\nVendor: ${asg.vendorName}\nEvent: ${asg.customerName}`);
      closeModal('assignVendorModal');
      renderAssignmentsTable();
    }
  });
}

function renderAssignmentsTable() {
  const tbody = document.getElementById('assignmentsTableBody');
  if (!tbody || !window.ncStore) return;

  const assignments = window.ncStore.getAssignments();
  if (assignments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #a0a5b5; padding: 20px;">No vendors assigned yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = assignments.map(a => `
    <tr>
      <td><strong>${a.id}</strong></td>
      <td>
        <strong>${a.vendorName}</strong>
        <div style="font-size: 0.75rem; color: #a0a5b5;">${a.serviceName}</div>
      </td>
      <td>
        <strong>${a.customerName}</strong>
        <div style="font-size: 0.75rem; color: #a0a5b5;">Ref: ${a.bookingId}</div>
      </td>
      <td>
        <div><i class="fa-solid fa-calendar-days text-gold"></i> ${a.eventDate}</div>
        <div style="font-size: 0.75rem; color: #a0a5b5;">${a.location}</div>
      </td>
      <td>
        <span class="status-badge badge-confirmed">${a.status}</span>
      </td>
      <td>
        <a href="https://api.whatsapp.com/send?phone=${a.vendorPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Namaste ${a.vendorName}, you have been assigned ${a.serviceName} for wedding of ${a.customerName} on ${a.eventDate} in ${a.location}.`)}" target="_blank" class="btn btn-outline-gold btn-sm">
          <i class="fa-brands fa-whatsapp text-success"></i> Notify
        </a>
      </td>
    </tr>
  `).join('');
}

// Notifications List
function renderNotificationsList() {
  const container = document.getElementById('adminNotificationsList');
  if (!container || !window.ncStore) return;

  const notifs = window.ncStore.getNotifications ? window.ncStore.getNotifications() : [];
  if (notifs.length === 0) {
    container.innerHTML = '<div style="color: #a0a5b5; font-size: 0.85rem;">No recent notifications.</div>';
    return;
  }
  container.innerHTML = notifs.slice(0, 5).map(n => `
    <div style="padding: 10px 14px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--primary-gold); border-radius: 4px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--primary-gold-light); margin-bottom: 2px;">
        <strong>${n.title}</strong>
        <span>${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div style="font-size: 0.82rem; color: #d1d5db;">${n.message}</div>
    </div>
  `).join('');
}

function filterBookings(status, el) {
  document.querySelectorAll('.admin-filter-pill').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
  renderBookingsTable(status);
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}
