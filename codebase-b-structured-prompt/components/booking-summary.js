/**
 * Booking Summary Component
 * Reusable component for rendering the itemized pricing breakdown,
 * vehicle specs, and reservation details.
 */

import { formatDisplayDateTime } from '../utils/date-utils.js';
import { escapeHtml, formatCurrencyRM } from '../utils/formatters.js';

export class BookingSummaryComponent {
  /**
   * Generates HTML markup for an itemized price breakdown.
   * 
   * @param {Object} params
   * @param {Object} params.vehicle - Vehicle object
   * @param {string|Date} params.startTime - Start date/time
   * @param {string|Date} params.endTime - End date/time
   * @param {Object} params.pricing - Calculated pricing object from PricingService
   * @param {string} [params.reference] - Optional booking reference
   * @param {string} [params.bookingStatus] - Optional booking status
   * @param {string} [params.paymentStatus] - Optional payment status
   * @returns {string} HTML string
   */
  static renderHtml({
    vehicle,
    startTime,
    endTime,
    pricing,
    reference = null,
    bookingStatus = null,
    paymentStatus = null
  }) {
    if (!vehicle || !pricing) {
      return '<div class="alert alert-info">Select rental dates and packages to see the price breakdown.</div>';
    }

    const {
      billableHours,
      rawHours,
      hourlyRate,
      basePrice,
      cdwPackage,
      flexPackage,
      totalPrice
    } = pricing;

    const formattedStart = formatDisplayDateTime(startTime);
    const formattedEnd = formatDisplayDateTime(endTime);

    // Status badges
    let statusBadgesHtml = '';
    if (reference) {
      let bStatusClass = 'badge-pending';
      if (bookingStatus === 'Confirmed') bStatusClass = 'badge-success';
      else if (bookingStatus === 'Cancelled') bStatusClass = 'badge-danger';

      let pStatusClass = 'badge-pending';
      if (paymentStatus === 'Successful') pStatusClass = 'badge-success';
      else if (paymentStatus === 'Failed') pStatusClass = 'badge-danger';

      statusBadgesHtml = `
        <div class="summary-reference-banner">
          <div class="summary-ref-item">
            <span class="ref-label">Booking Reference:</span>
            <strong class="ref-code">${escapeHtml(reference)}</strong>
          </div>
          <div class="summary-status-badges">
            <span class="badge ${bStatusClass}">Booking: ${escapeHtml(bookingStatus || 'Pending')}</span>
            <span class="badge ${pStatusClass}">Payment: ${escapeHtml(paymentStatus || 'Pending')}</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="booking-summary-card">
        ${statusBadgesHtml}

        <div class="summary-header">
          <h4 class="summary-title">Rental Summary &amp; Breakdown</h4>
          <span class="summary-category-badge">${escapeHtml(vehicle.category)}</span>
        </div>

        <div class="summary-vehicle-info">
          <div class="summary-vehicle-meta">
            <h5 class="summary-car-name">${escapeHtml(vehicle.name)}</h5>
            <span class="summary-car-specs">${vehicle.capacity} Seats • ${escapeHtml(vehicle.transmission)} • ${formatCurrencyRM(vehicle.hourlyRate)}/hr</span>
          </div>
        </div>

        <div class="summary-schedule">
          <div class="schedule-point">
            <span class="schedule-label">Pick-up:</span>
            <strong class="schedule-val">${formattedStart}</strong>
          </div>
          <div class="schedule-arrow">➔</div>
          <div class="schedule-point">
            <span class="schedule-label">Drop-off:</span>
            <strong class="schedule-val">${formattedEnd}</strong>
          </div>
        </div>

        <div class="summary-duration-note">
          <span class="calc-note">
            ⏱ Duration: <strong>${rawHours} hr(s)</strong> → Billable: <strong>${billableHours} hr(s)</strong>
            <small class="text-muted">(rounded up to next whole hour)</small>
          </span>
        </div>

        <hr class="summary-divider" />

        <div class="summary-line-items">
          <div class="summary-line">
            <span class="line-label">
              Base Rental (${billableHours} hrs × ${formatCurrencyRM(hourlyRate)})
            </span>
            <span class="line-value">${formatCurrencyRM(basePrice)}</span>
          </div>

          <div class="summary-line">
            <span class="line-label">
              CDW Protection (<strong>${escapeHtml(cdwPackage.name)}</strong>)
            </span>
            <span class="line-value">${formatCurrencyRM(cdwPackage.price)}</span>
          </div>

          <div class="summary-line">
            <span class="line-label">
              Flex Package (<strong>${escapeHtml(flexPackage.name)}</strong>)
            </span>
            <span class="line-value">${formatCurrencyRM(flexPackage.price)}</span>
          </div>
        </div>

        <hr class="summary-divider summary-divider-total" />

        <div class="summary-total-line">
          <span class="total-label">Estimated Total:</span>
          <span class="total-amount">${formatCurrencyRM(totalPrice)}</span>
        </div>

        <p class="summary-academic-note">
          <small>* Academic prototype: All prices and transactions are simulated.</small>
        </p>
      </div>
    `;
  }
}
