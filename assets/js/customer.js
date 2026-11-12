/**
 * Naishvi Celebrations - Customer Portal Script
 * Powers Step 7 (Quotation Review), Step 8 (Online Payment & Confirmation), and Step 10 (Review & Final Settlement)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check URL params for bookingId or quoteId
  const urlParams = new URLSearchParams(window.location.search);
  const paramBookingId = urlParams.get('bookingId') || urlParams.get('quoteId');

  if (paramBookingId) {
    const input = document.getElementById('searchQuoteInput');
    if (input) input.value = paramBookingId;
    loadQuotationDetails(paramBookingId);
  } else {
    // Default load latest quotation for quick demo
    loadQuotationDetails('NC-2026-001');
  }

  initQuoteSearch();
  initPaymentFlow();
  initReviewSubmission();
});

function initQuoteSearch() {
  const form = document.getElementById('searchQuoteForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('searchQuoteInput').value.trim();
    if (!query) {
      alert('Please enter your Booking ID or Mobile Number.');
      return;
    }
    loadQuotationDetails(query);
  });
}

let activeQuote = null;

function loadQuotationDetails(identifier) {
  if (!window.ncStore) return;

  let quote = window.ncStore.getQuotationById(identifier);
  if (!quote) {
    // Check if it's a booking
    const booking = window.ncStore.getBookingById(identifier);
    if (booking && booking.quotationId) {
      quote = window.ncStore.getQuotationById(booking.quotationId);
    } else if (booking) {
      // Mock / preview quotation based on booking services if not yet formally generated
      quote = {
        id: `QUO-TEMP-${booking.id}`,
        bookingId: booking.id,
        customerName: booking.customerName,
        mobile: booking.mobile,
        date: new Date().toISOString().split('T')[0],
        items: [
          { service: 'Decoration (Theme Mandap & Floral Stage)', amount: 50000 },
          { service: 'Catering Feasts (Multi-Cuisine Buffet)', amount: 100000 },
          { service: 'Photography & 4K Cinema Coverage', amount: 30000 },
          { service: 'DJ & Sound / Acoustic Truss System', amount: 15000 }
        ],
        subtotal: 195000,
        discount: 0,
        totalAmount: 195000,
        advanceRequired: 58500,
        advancePaid: 0,
        remainingBalance: 195000,
        status: 'Sent'
      };
    }
  }

  const container = document.getElementById('quotationDisplayArea');
  if (!container) return;

  if (!quote) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: var(--bg-card); border: 1px solid var(--border-gold); border-radius: var(--radius-lg);">
        <i class="fa-solid fa-file-circle-xmark" style="font-size: 3rem; color: #ef4444; margin-bottom: 16px;"></i>
        <h3 style="color: #fff; margin-bottom: 8px;">No Quotation Found</h3>
        <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 20px;">
          We could not find an active quotation for "${identifier}". If you recently submitted your booking enquiry, our team is preparing it right now.
        </p>
        <a href="index.html#weddingPlannerEngine" class="btn btn-gold"><i class="fa-solid fa-plus"></i> Submit New Booking</a>
      </div>
    `;
    return;
  }

  activeQuote = quote;
  renderQuotationPaper(quote);
}

function renderQuotationPaper(quote) {
  const container = document.getElementById('quotationDisplayArea');
  if (!container) return;

  const isPaid = quote.advancePaid > 0 || quote.status === 'Approved' || quote.status === 'Fully Paid';

  container.innerHTML = `
    <div class="quotation-paper">
      <!-- Printable Header -->
      <div class="quotation-header">
        <div>
          <div class="quote-brand-title">NAISHVI CELEBRATIONS</div>
          <div class="quote-brand-sub">Weddings • Events • Destinations</div>
          <div style="font-size: 0.8rem; color: #666; margin-top: 4px;">
            Shahdra, Agra • Delhi NCR • Jaipur • Goa | Ph: +91 9719136364
          </div>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; padding: 4px 12px; background: ${isPaid ? '#e6f7ed' : '#fff3cd'}; border: 1px solid ${isPaid ? '#28a745' : '#e0a800'}; color: ${isPaid ? '#155724' : '#856404'}; border-radius: 99px; font-weight: 600; font-size: 0.82rem; margin-bottom: 6px;">
            ${isPaid ? '✓ BOOKING CONFIRMED' : 'QUOTATION READY'}
          </div>
          <div style="font-weight: 700; color: #111;">Quotation #${quote.id}</div>
          <div style="font-size: 0.82rem; color: #666;">Date: ${quote.date}</div>
          <div style="font-size: 0.82rem; color: #666;">Ref: ${quote.bookingId}</div>
        </div>
      </div>

      <!-- Customer Details -->
      <div style="background: #fdfaf3; border: 1px solid #ebd9ab; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #8c7847; font-weight: 600;">Quotation Prepared For</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #222;">${quote.customerName}</div>
          <div style="font-size: 0.85rem; color: #555;"><i class="fa-solid fa-phone"></i> ${quote.mobile}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #8c7847; font-weight: 600;">Advance Payment Required</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #680d1d;">₹${quote.advanceRequired.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.78rem; color: #777;">(30% Advance for dates booking)</div>
        </div>
      </div>

      <!-- Itemized Table (Matching Step 7 Image) -->
      <h4 style="font-size: 1rem; color: #333; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        Custom Wedding Quotation Breakdown:
      </h4>
      <table class="quote-table">
        <thead>
          <tr>
            <th style="width: 70%;">Service</th>
            <th style="text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${quote.items.map(i => `
            <tr>
              <td><strong>${i.service}</strong></td>
              <td style="text-align: right; font-weight: 600;">₹${Number(i.amount).toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
          ${quote.discount > 0 ? `
            <tr style="color: #28a745;">
              <td><strong>Special Discount Applied</strong></td>
              <td style="text-align: right; font-weight: 600;">- ₹${quote.discount.toLocaleString('en-IN')}</td>
            </tr>
          ` : ''}
          <tr class="quote-total-row">
            <td>TOTAL AMOUNT</td>
            <td style="text-align: right; color: #680d1d;">₹${quote.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <!-- Payment / Settlement Status -->
      <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 18px; margin: 24px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 0.95rem; line-height: 1.8;">
          <span>Advance Paid:</span>
          <strong style="color: #28a745;">₹${(quote.advancePaid || 0).toLocaleString('en-IN')} ${quote.txnId ? `(Txn: ${quote.txnId})` : ''}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.95rem; line-height: 1.8; border-top: 1px solid #e9ecef; padding-top: 6px; margin-top: 6px;">
          <span>Remaining Balance Payable at Completion:</span>
          <strong style="color: #680d1d;">₹${(quote.remainingBalance ?? (quote.totalAmount - (quote.advancePaid || 0))).toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-top: 24px;">
        <button onclick="window.print()" class="btn btn-outline-gold" style="color: #111; border-color: #d4af37;">
          <i class="fa-solid fa-print"></i> Print Official Quotation / Receipt
        </button>

        ${!isPaid ? `
          <button class="btn btn-gold btn-lg" onclick="openPaymentModal('${quote.id}', ${quote.advanceRequired})">
            <i class="fa-solid fa-lock"></i> Step 8: Approve & Pay Advance Online (₹${quote.advanceRequired.toLocaleString('en-IN')})
          </button>
        ` : `
          <div style="display: flex; gap: 10px;">
            <a href="#reviewSection" class="btn btn-maroon">
              <i class="fa-solid fa-star"></i> Step 10: Submit Review & Feedback
            </a>
          </div>
        `}
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// STEP 8: ONLINE PAYMENT MODAL (UPI, Cards, Net Banking)
// -----------------------------------------------------------------------------
function openPaymentModal(quoteId, amount) {
  const modal = document.getElementById('paymentGatewayModal');
  const amtDisplay = document.getElementById('payModalAmount');
  if (!modal) return;

  if (amtDisplay) amtDisplay.textContent = `₹${amount.toLocaleString('en-IN')}`;
  modal.classList.add('open');
}

function initPaymentFlow() {
  const payForm = document.getElementById('onlinePaymentForm');
  if (!payForm) return;

  // Listen to payment tabs
  const tabBtns = document.querySelectorAll('.pay-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.tab;
      document.querySelectorAll('.pay-tab-pane').forEach(p => p.style.display = 'none');
      const pane = document.getElementById(target);
      if (pane) pane.style.display = 'block';
    });
  });

  payForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeQuote) return;

    // Determine chosen method
    const activeTab = document.querySelector('.pay-tab-btn.active')?.dataset.tab || 'payUpi';
    let methodName = 'UPI (Google Pay / PhonePe)';
    if (activeTab === 'payCard') methodName = 'Credit/Debit Card';
    if (activeTab === 'payNet') methodName = 'Net Banking';

    const payButton = payForm.querySelector('button[type="submit"]');
    if (payButton) {
      payButton.disabled = true;
      payButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Payment...`;
    }

    setTimeout(() => {
      const txnId = `TXN-NC-${Math.floor(10000000 + Math.random() * 90000000)}`;
      window.ncStore.recordPayment(activeQuote.id, {
        amount: activeQuote.advanceRequired,
        method: methodName,
        txnId
      });

      closeModal('paymentGatewayModal');
      alert(`🎉 PAYMENT SUCCESSFUL!\n\nTransaction ID: ${txnId}\nPayment Method: ${methodName}\nAmount Paid: ₹${activeQuote.advanceRequired.toLocaleString('en-IN')}\n\nYour wedding booking is officially CONFIRMED!`);

      // Reload quotation paper
      loadQuotationDetails(activeQuote.id);
    }, 1200);
  });
}

// -----------------------------------------------------------------------------
// STEP 10: CUSTOMER REVIEW & FEEDBACK
// -----------------------------------------------------------------------------
function initReviewSubmission() {
  const form = document.getElementById('customerReviewForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('revName').value.trim();
    const event = document.getElementById('revEvent').value.trim();
    const rating = document.getElementById('revRating').value;
    const text = document.getElementById('revText').value.trim();

    if (!name || !text) {
      alert('Please fill out your name and review message.');
      return;
    }

    window.ncStore.addReview({
      customerName: name,
      event: event || 'Destination Wedding',
      rating,
      quote: text
    });

    alert('🙏 Thank you for your heartfelt review! It has been published on the Naishvi Celebrations website.');
    form.reset();
  });
}
