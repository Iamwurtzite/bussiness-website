/**
 * Naishvi Celebrations - Vendor Portal Controller
 * Powers Steps 9 & 10 from the Vendor's operational perspective.
 */

document.addEventListener('DOMContentLoaded', () => {
  populateVendorSelector();
  initVendorFilterListener();
  loadVendorDashboard('VND-101'); // Default to first vendor
});

function populateVendorSelector() {
  const select = document.getElementById('vendorSelectDropdown');
  if (!select || !window.ncStore) return;

  const vendors = window.ncStore.getVendors();
  select.innerHTML = vendors.map(v => `<option value="${v.id}">${v.name} (${v.category})</option>`).join('');
}

function initVendorFilterListener() {
  const select = document.getElementById('vendorSelectDropdown');
  if (!select) return;

  select.addEventListener('change', () => {
    loadVendorDashboard(select.value);
  });
}

function loadVendorDashboard(vendorId) {
  if (!window.ncStore) return;

  const vendors = window.ncStore.getVendors();
  const vendor = vendors.find(v => v.id === vendorId);
  if (!vendor) return;

  // Update Vendor Profile Card
  const profileCard = document.getElementById('vendorProfileCard');
  if (profileCard) {
    profileCard.innerHTML = `
      <div style="display: flex; gap: 18px; align-items: center; flex-wrap: wrap;">
        <img src="${vendor.avatar}" alt="${vendor.name}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-gold);">
        <div>
          <h2 style="font-size: 1.5rem; color: #fff; margin-bottom: 2px;">${vendor.name}</h2>
          <div style="font-size: 0.85rem; color: var(--primary-gold-light);"><i class="fa-solid fa-certificate"></i> Verified Partner • ${vendor.category}</div>
          <div style="font-size: 0.8rem; color: #a0a5b5; margin-top: 4px;">
            <i class="fa-solid fa-user"></i> ${vendor.contactPerson} • <i class="fa-solid fa-phone"></i> ${vendor.phone} • <i class="fa-solid fa-location-dot"></i> ${vendor.city}
          </div>
        </div>
      </div>
    `;
  }

  // Load Vendor's Assigned Orders
  const container = document.getElementById('vendorAssignmentsList');
  if (!container) return;

  const assignments = window.ncStore.getAssignments(vendorId);

  // If no assignments in localStorage for this vendor, show default sample assignment from active bookings
  if (assignments.length === 0) {
    const booking = window.ncStore.getBookings()[0];
    container.innerHTML = `
      <div class="vendor-assignment-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span class="status-badge badge-confirmed">Step 9: Assigned by Admin</span>
            <h3 style="font-size: 1.3rem; color: #fff; margin-top: 6px;">${booking.customerName}'s Wedding Celebration</h3>
            <div style="font-size: 0.85rem; color: var(--primary-gold-light);">Task: <strong>${vendor.category} Setup & Management</strong></div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: #a0a5b5;">Ref Booking: ${booking.id}</div>
            <div style="font-size: 1rem; font-weight: 700; color: #fff; margin-top: 2px;">
              <i class="fa-solid fa-calendar-day text-gold"></i> ${booking.eventDate}
            </div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 16px; margin: 16px 0; font-size: 0.85rem; line-height: 1.7; color: #d1d5db;">
          <div><i class="fa-solid fa-location-dot text-gold"></i> <strong>Venue:</strong> ${booking.location}</div>
          <div><i class="fa-solid fa-users text-gold"></i> <strong>Guest Count:</strong> ${booking.guests} Guests</div>
          <div><i class="fa-solid fa-clipboard-list text-gold"></i> <strong>Scope:</strong> Theme Mandap, Floral Stage Pillars, Entrance Gate & Photobooth</div>
          <div><i class="fa-solid fa-clock text-gold"></i> <strong>Deadline:</strong> All arrangements to be fully ready by 3:00 PM on event date.</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <a href="https://api.whatsapp.com/send?phone=${booking.mobile.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Namaste ${booking.customerName}, this is ${vendor.name} (${vendor.category}) from Naishvi Celebrations regarding your wedding on ${booking.eventDate}.`)}" target="_blank" class="btn btn-outline-gold btn-sm">
            <i class="fa-brands fa-whatsapp text-success"></i> WhatsApp Wedding Family
          </a>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-outline-gold" onclick="alert('Arrangements verified & ready on site!')">
              <i class="fa-solid fa-clipboard-check"></i> Step 10: Mark Arrangements Ready
            </button>
            <button class="btn btn-sm btn-gold" onclick="alert('Congratulations! Event marked completed.')">
              <i class="fa-solid fa-check"></i> Mark Completed
            </button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = assignments.map(a => `
    <div class="vendor-assignment-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <div>
          <span class="status-badge badge-confirmed">${a.status}</span>
          <h3 style="font-size: 1.3rem; color: #fff; margin-top: 6px;">${a.customerName}'s Wedding</h3>
          <div style="font-size: 0.85rem; color: var(--primary-gold-light);">Deliverable: <strong>${a.serviceName}</strong></div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; color: #a0a5b5;">Booking ID: ${a.bookingId}</div>
          <div style="font-size: 1rem; font-weight: 700; color: #fff; margin-top: 2px;">
            <i class="fa-solid fa-calendar-day text-gold"></i> ${a.eventDate}
          </div>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 16px; margin: 16px 0; font-size: 0.85rem; line-height: 1.7; color: #d1d5db;">
        <div><i class="fa-solid fa-location-dot text-gold"></i> <strong>Venue:</strong> ${a.location}</div>
        <div><i class="fa-solid fa-note-sticky text-gold"></i> <strong>Special Instructions:</strong> ${a.notes || 'Ensure on-time setup & royal finish.'}</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <button class="btn btn-outline-gold btn-sm" onclick="alert('Step 10: Pre-event arrangements verified!')">
          <i class="fa-solid fa-clipboard-check"></i> Step 10: Check Arrangements
        </button>
        <button class="btn btn-gold btn-sm" onclick="alert('Event marked complete by vendor!')">
          <i class="fa-solid fa-champagne-glasses"></i> Event Complete
        </button>
      </div>
    </div>
  `).join('');
}
