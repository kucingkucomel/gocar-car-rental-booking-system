/**
 * History View
 * Displays customer's personal booking history, reservation status, and payment outcomes.
 * Implements FR-07 and enforces customer data isolation (BR-05).
 */

import { authService } from '../services/auth-service.js';
import { bookingService } from '../services/booking-service.js';
import { notifications } from '../components/notifications.js';
import { formatDisplayDateTime } from '../utils/date-utils.js';
import { formatCurrencyRM, escapeHtml } from '../utils/formatters.js';
import { $, $$ } from '../utils/dom-utils.js';

export class HistoryView {
  /**
   * @param {HTMLElement} container
   * @param {Function} onNavigate
   */
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.selectedBookingDetails = null;
  }

  /**
   * Renders customer booking history.
   */
  render() {
    const user = authService.getCurrentUser();
    if (!user) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please sign in to view your reservation history and booking status.</p>
          <button class="btn btn-primary" id="btn-history-login">Sign In</button>
        </div>
      `;
      $('#btn-history-login', this.container)?.addEventListener('click', () => {
        this.onNavigate('auth');
      });
      return;
    }

    // Strict customer isolation (BR-05 & FR-07): Only retrieve this customer's bookings
    const bookings = bookingService.getCustomerBookings(user.id);
    // Sort descending by creation date
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.container.innerHTML = `
      <section class="history-section">
        <div class="history-header">
          <div class="history-title-wrap">
            <h1 class="history-title">My Bookings</h1>
            <p class="history-subtitle">Manage your car rentals, check payment statuses, and review receipts.</p>
          </div>
          <button type="button" class="btn btn-primary" id="btn-history-new-booking">
            + New Reservation
          </button>
        </div>

        ${bookings.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>No Bookings Yet</h3>
            <p>You have not made any car rental reservations yet. Browse our fleet to book your first GoCar!</p>
            <button class="btn btn-primary mt-3" id="btn-empty-browse">Explore Vehicles</button>
          </div>
        ` : `
          <div class="bookings-list">
            ${bookings.map(b => this._renderBookingCard(b)).join('')}
          </div>
        `}
      </section>

      <!-- Receipt / Breakdown Modal -->
      <div class="modal-backdrop ${this.selectedBookingDetails ? 'is-active' : ''}" id="booking-detail-modal">
        <div class="modal-dialog modal-lg">
          ${this.selectedBookingDetails ? this._renderDetailModal(this.selectedBookingDetails) : ''}
        </div>
      </div>
    `;

    this._attachListeners();
  }

  /**
   * Renders an individual booking record card.
   * @private
   * @param {import('../models/booking.js').Booking} b
   * @returns {string}
   */
  _renderBookingCard(b) {
    let bBadge = 'badge-pending';
    if (b.bookingStatus === 'Confirmed') bBadge = 'badge-success';
    else if (b.bookingStatus === 'Cancelled') bBadge = 'badge-danger';

    let pBadge = 'badge-pending';
    if (b.paymentStatus === 'Successful') pBadge = 'badge-success';
    else if (b.paymentStatus === 'Failed') pBadge = 'badge-danger';

    const canPay = b.bookingStatus !== 'Cancelled' && b.paymentStatus !== 'Successful';
    const canCancel = b.bookingStatus !== 'Cancelled';

    return `
      <div class="booking-item-card" data-ref="${escapeHtml(b.reference)}">
        <div class="booking-item-top">
          <div class="booking-item-ref-group">
            <span class="booking-ref-label">Reference</span>
            <strong class="booking-ref-number">${escapeHtml(b.reference)}</strong>
          </div>
          <div class="booking-item-badges">
            <span class="badge ${bBadge}">Booking: ${escapeHtml(b.bookingStatus)}</span>
            <span class="badge ${pBadge}">Payment: ${escapeHtml(b.paymentStatus)}</span>
          </div>
        </div>

        <div class="booking-item-body">
          <div class="booking-car-info">
            <h3 class="booking-car-title">${escapeHtml(b.vehicleDetails.name || 'Vehicle')}</h3>
            <span class="booking-car-specs">
              ${escapeHtml(b.vehicleDetails.category || '')} • ${b.vehicleDetails.capacity || 5} Seats • ${escapeHtml(b.vehicleDetails.transmission || 'Automatic')}
            </span>
          </div>

          <div class="booking-dates-summary">
            <div class="date-col">
              <span class="date-lbl">Pick-up:</span>
              <span class="date-val">${formatDisplayDateTime(b.startTime)}</span>
            </div>
            <div class="date-col">
              <span class="date-lbl">Drop-off:</span>
              <span class="date-val">${formatDisplayDateTime(b.endTime)}</span>
            </div>
            <div class="date-col">
              <span class="date-lbl">Duration:</span>
              <span class="date-val">${b.billableHours} billable hr(s)</span>
            </div>
          </div>

          <div class="booking-packages-summary">
            <span class="package-pill">🛡️ CDW: ${escapeHtml(b.cdwPackage ? b.cdwPackage.name : 'None')}</span>
            <span class="package-pill">⚡ Flex: ${escapeHtml(b.flexPackage ? b.flexPackage.name : 'None')}</span>
          </div>

          <div class="booking-price-summary">
            <span class="price-lbl">Total Paid / Due:</span>
            <strong class="price-val">${formatCurrencyRM(b.totalPrice)}</strong>
          </div>
        </div>

        <div class="booking-item-actions">
          <button type="button" class="btn btn-outline-secondary btn-sm btn-view-receipt" data-ref="${escapeHtml(b.reference)}">
            View Details &amp; Receipt
          </button>

          ${canPay ? `
            <button type="button" class="btn btn-success btn-sm btn-pay-now" data-ref="${escapeHtml(b.reference)}">
              💳 Pay Now
            </button>
          ` : ''}

          ${canCancel ? `
            <button type="button" class="btn btn-outline-danger btn-sm btn-cancel-booking" data-ref="${escapeHtml(b.reference)}">
              Cancel Booking
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Renders the receipt & breakdown modal for a specific booking.
   * @private
   * @param {import('../models/booking.js').Booking} b
   * @returns {string}
   */
  _renderDetailModal(b) {
    const p = b.pricingBreakdown || {};
    return `
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Booking Confirmation &amp; Breakdown</h3>
            <span class="modal-id-sub">Reference: <strong>${escapeHtml(b.reference)}</strong></span>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-receipt-modal" aria-label="Close modal">×</button>
        </div>

        <div class="modal-body">
          <div class="receipt-statuses mb-3">
            <span class="badge ${b.bookingStatus === 'Confirmed' ? 'badge-success' : 'badge-pending'}">
              Status: ${escapeHtml(b.bookingStatus)}
            </span>
            <span class="badge ${b.paymentStatus === 'Successful' ? 'badge-success' : 'badge-danger'}">
              Payment: ${escapeHtml(b.paymentStatus)}
            </span>
          </div>

          <div class="receipt-box">
            <h4 class="receipt-section-title">Vehicle &amp; Schedule</h4>
            <div class="receipt-row">
              <span>Vehicle:</span>
              <strong>${escapeHtml(b.vehicleDetails.name)} (${escapeHtml(b.vehicleDetails.category)})</strong>
            </div>
            <div class="receipt-row">
              <span>Rental Period:</span>
              <strong>${formatDisplayDateTime(b.startTime)} to ${formatDisplayDateTime(b.endTime)}</strong>
            </div>
            <div class="receipt-row">
              <span>Billable Duration:</span>
              <strong>${b.billableHours} hours</strong>
            </div>

            <hr class="summary-divider my-2" />

            <h4 class="receipt-section-title">Itemized Charges (RM)</h4>
            <div class="receipt-row">
              <span>Base Rental (${b.billableHours} hrs × ${formatCurrencyRM(b.vehicleDetails.hourlyRate)}):</span>
              <span>${formatCurrencyRM(p.basePrice || (b.billableHours * b.vehicleDetails.hourlyRate))}</span>
            </div>
            <div class="receipt-row">
              <span>Collision Damage Waiver (${escapeHtml(b.cdwPackage.name)}):</span>
              <span>${formatCurrencyRM(b.cdwPackage.price)}</span>
            </div>
            <div class="receipt-row">
              <span>Flex Package (${escapeHtml(b.flexPackage.name)}):</span>
              <span>${formatCurrencyRM(b.flexPackage.price)}</span>
            </div>

            <hr class="summary-divider summary-divider-total my-2" />

            <div class="receipt-row receipt-total-row">
              <strong>Total Amount:</strong>
              <strong class="price-highlight">${formatCurrencyRM(b.totalPrice)}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-close-receipt-footer">Close</button>
        </div>
      </div>
    `;
  }

  /**
   * Attaches event listeners.
   * @private
   */
  _attachListeners() {
    $('#btn-history-new-booking', this.container)?.addEventListener('click', () => {
      this.onNavigate('vehicles');
    });

    $('#btn-empty-browse', this.container)?.addEventListener('click', () => {
      this.onNavigate('vehicles');
    });

    // View Receipt buttons
    $$('.btn-view-receipt', this.container).forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        this.selectedBookingDetails = bookingService.getBooking(ref);
        this.render();
      });
    });

    // Pay Now buttons
    $$('.btn-pay-now', this.container).forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        const booking = bookingService.getBooking(ref);
        if (booking) {
          // Open booking view in payment simulation stage
          this.onNavigate('booking', { payBookingRef: ref });
        }
      });
    });

    // Cancel Booking buttons
    $$('.btn-cancel-booking', this.container).forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        const confirmed = window.confirm(`Are you sure you want to cancel booking ${ref}?`);
        if (confirmed) {
          try {
            const user = authService.getCurrentUser();
            bookingService.cancelBooking(ref, user.id, user.isAdmin());
            notifications.success(`Booking ${ref} was cancelled successfully.`);
            this.render();
          } catch (err) {
            notifications.error(err.message);
          }
        }
      });
    });

    // Modal close
    const closeModal = () => {
      this.selectedBookingDetails = null;
      this.render();
    };

    $('#btn-close-receipt-modal', this.container)?.addEventListener('click', closeModal);
    $('#btn-close-receipt-footer', this.container)?.addEventListener('click', closeModal);
  }
}
