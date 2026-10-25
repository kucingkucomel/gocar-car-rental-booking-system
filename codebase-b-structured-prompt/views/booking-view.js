/**
 * Booking View
 * Handles the rental period selection, CDW & Flex package selection,
 * dynamic pricing preview, booking creation, and payment simulation.
 * Implements FR-03, FR-04, FR-05, and FR-06.
 */

import { CDW_PACKAGES, FLEX_PACKAGES } from '../config/constants.js';
import { vehicleService } from '../services/vehicle-service.js';
import { pricingService } from '../services/pricing-service.js';
import { bookingService } from '../services/booking-service.js';
import { paymentService } from '../services/payment-service.js';
import { authService } from '../services/auth-service.js';
import { notifications } from '../components/notifications.js';
import { BookingSummaryComponent } from '../components/booking-summary.js';
import {
  getDefaultStartDateTime,
  getDefaultEndDateTime,
  parseDate
} from '../utils/date-utils.js';
import { formatCurrencyRM, escapeHtml } from '../utils/formatters.js';
import { $, $$ } from '../utils/dom-utils.js';

export class BookingView {
  /**
   * @param {HTMLElement} container
   * @param {Function} onNavigate
   */
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.selectedVehicleId = 'CAR001'; // Default to first seed car
    this.startTime = getDefaultStartDateTime();
    this.endTime = getDefaultEndDateTime(this.startTime, 5); // 5 hours default
    this.selectedCdwId = 'standard'; // Default to Standard (RM10.00)
    this.selectedFlexId = 'basic_flex'; // Default to Basic Flex (RM8.00)

    // Payment simulation stage state
    this.createdBooking = null;
    this.paymentResult = null;
  }

  /**
   * Sets vehicle from route navigation parameter.
   * @param {string} vehicleId
   */
  setVehicleId(vehicleId) {
    if (vehicleId) {
      this.selectedVehicleId = vehicleId;
      this.createdBooking = null;
      this.paymentResult = null;
    }
  }

  /**
   * Renders the booking and payment screen.
   */
  render() {
    const user = authService.getCurrentUser();
    const allVehicles = vehicleService.getAllVehicles();
    const currentVehicle = vehicleService.getVehicleById(this.selectedVehicleId) || allVehicles[0];

    // If customer is already on payment simulation screen for a created booking
    if (this.createdBooking) {
      this._renderPaymentSimulationScreen(this.createdBooking);
      return;
    }

    // Calculate current pricing preview safely
    let currentPricing = null;
    let pricingError = null;
    try {
      if (currentVehicle) {
        currentPricing = pricingService.calculateRentalPrice({
          hourlyRate: currentVehicle.hourlyRate,
          startTime: this.startTime,
          endTime: this.endTime,
          cdwPackageId: this.selectedCdwId,
          flexPackageId: this.selectedFlexId
        });
      }
    } catch (err) {
      pricingError = err.message;
    }

    this.container.innerHTML = `
      <section class="booking-section">
        <div class="booking-header">
          <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-back-catalog">
            ← Back to Fleet
          </button>
          <h1 class="booking-page-title">Configure Your GoCar Reservation</h1>
        </div>

        ${!user ? `
          <div class="alert alert-warning mb-4">
            <strong>Notice:</strong> You are not logged in. You can configure your booking and preview prices, 
            but you must <a href="#auth" class="alert-link">Sign In or Register</a> before confirming your reservation.
          </div>
        ` : ''}

        <div class="booking-layout-grid">
          <!-- Left Column: Configuration Forms -->
          <div class="booking-config-col">
            <!-- Step 1: Vehicle Selection -->
            <div class="config-card">
              <h3 class="config-step-title">
                <span class="step-num">1</span> Select Vehicle
              </h3>
              <div class="form-group">
                <label for="select-vehicle">Choose from available fleet:</label>
                <select id="select-vehicle" class="form-control">
                  ${allVehicles.map(v => `
                    <option value="${v.id}" ${v.id === this.selectedVehicleId ? 'selected' : ''}>
                      ${escapeHtml(v.name)} (${escapeHtml(v.category)} - ${v.capacity} seats) — ${formatCurrencyRM(v.hourlyRate)}/hr
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Step 2: Rental Period Selection (FR-03) -->
            <div class="config-card">
              <h3 class="config-step-title">
                <span class="step-num">2</span> Select Rental Period
              </h3>
              <div class="rental-times-grid">
                <div class="form-group">
                  <label for="input-start-time">Pick-up Date &amp; Time</label>
                  <input type="datetime-local" id="input-start-time" class="form-control" value="${this.startTime}" required />
                </div>
                <div class="form-group">
                  <label for="input-end-time">Drop-off Date &amp; Time</label>
                  <input type="datetime-local" id="input-end-time" class="form-control" value="${this.endTime}" required />
                </div>
              </div>
              <div class="form-text">
                ℹ Rental duration is rounded up to the nearest whole hour (BR-01).
              </div>
              ${pricingError ? `
                <div class="alert alert-danger mt-2" id="period-error-box">${escapeHtml(pricingError)}</div>
              ` : ''}
            </div>

            <!-- Step 3: Collision Damage Waiver (CDW) Selection (FR-04) -->
            <div class="config-card">
              <h3 class="config-step-title">
                <span class="step-num">3</span> Select Collision Damage Waiver (CDW)
              </h3>
              <p class="config-desc">Charged once per booking. Protection against unexpected damage.</p>
              
              <div class="package-options-grid" role="radiogroup" aria-label="CDW Packages">
                ${Object.values(CDW_PACKAGES).map(pkg => `
                  <label class="package-card ${this.selectedCdwId === pkg.id ? 'package-selected' : ''}">
                    <div class="package-radio-wrap">
                      <input type="radio" name="cdw-package" value="${pkg.id}" ${this.selectedCdwId === pkg.id ? 'checked' : ''} />
                      <strong class="package-name">${escapeHtml(pkg.name)}</strong>
                    </div>
                    <div class="package-price">${formatCurrencyRM(pkg.price)}</div>
                    <p class="package-desc">${escapeHtml(pkg.description)}</p>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Step 4: Flex Package Selection (FR-04) -->
            <div class="config-card">
              <h3 class="config-step-title">
                <span class="step-num">4</span> Select Flex Package
              </h3>
              <p class="config-desc">Charged once per booking. Trip cancellation and rescheduling freedom.</p>
              
              <div class="package-options-grid" role="radiogroup" aria-label="Flex Packages">
                ${Object.values(FLEX_PACKAGES).map(pkg => `
                  <label class="package-card ${this.selectedFlexId === pkg.id ? 'package-selected' : ''}">
                    <div class="package-radio-wrap">
                      <input type="radio" name="flex-package" value="${pkg.id}" ${this.selectedFlexId === pkg.id ? 'checked' : ''} />
                      <strong class="package-name">${escapeHtml(pkg.name)}</strong>
                    </div>
                    <div class="package-price">${formatCurrencyRM(pkg.price)}</div>
                    <p class="package-desc">${escapeHtml(pkg.description)}</p>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Column: Live Booking Summary and Submission -->
          <div class="booking-summary-col">
            <div class="sticky-summary-wrap">
              ${BookingSummaryComponent.renderHtml({
                vehicle: currentVehicle,
                startTime: this.startTime,
                endTime: this.endTime,
                pricing: currentPricing
              })}

              <div class="booking-action-box">
                <button type="button" class="btn btn-primary btn-lg btn-block" id="btn-submit-booking" ${pricingError ? 'disabled' : ''}>
                  Confirm &amp; Proceed to Payment ➔
                </button>
                <div class="submission-error alert alert-danger mt-3" id="booking-submission-error" hidden></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this._attachListeners();
  }

  /**
   * Renders the payment simulation stage (FR-06).
   * @private
   * @param {import('../models/booking.js').Booking} booking
   */
  _renderPaymentSimulationScreen(booking) {
    const isSuccess = this.paymentResult && this.paymentResult.success;
    const isFailed = this.paymentResult && !this.paymentResult.success;

    this.container.innerHTML = `
      <section class="payment-simulation-section">
        <div class="payment-container">
          <div class="payment-header">
            <span class="badge badge-info mb-2">Simulated Gateway</span>
            <h2>Complete Simulated Payment</h2>
            <p class="text-muted">Booking Reference: <strong>${escapeHtml(booking.reference)}</strong></p>
          </div>

          ${this.paymentResult ? `
            <div class="payment-result-box ${isSuccess ? 'result-success' : 'result-failure'}">
              <div class="result-icon">${isSuccess ? '✅' : '❌'}</div>
              <h3>${isSuccess ? 'Payment Successful!' : 'Payment Failed / Declined'}</h3>
              <p>${escapeHtml(this.paymentResult.message)}</p>
            </div>
          ` : `
            <div class="payment-instruction-box">
              <p>
                As required by <strong>FR-06</strong>, this educational prototype allows you to test both 
                <strong>Successful</strong> and <strong>Failed</strong> simulated payment outcomes.
              </p>
              <div class="payment-amount-display">
                <span>Amount to Pay:</span>
                <strong>${formatCurrencyRM(booking.totalPrice)}</strong>
              </div>
            </div>
          `}

          <!-- Summary Breakdown for Payment Review -->
          <div class="payment-summary-embed">
            ${BookingSummaryComponent.renderHtml({
              vehicle: booking.vehicleDetails,
              startTime: booking.startTime,
              endTime: booking.endTime,
              pricing: booking.pricingBreakdown,
              reference: booking.reference,
              bookingStatus: booking.bookingStatus,
              paymentStatus: booking.paymentStatus
            })}
          </div>

          <!-- Simulation Actions -->
          <div class="payment-simulation-actions">
            ${!isSuccess ? `
              <div class="sim-buttons-group">
                <button type="button" class="btn btn-success btn-lg btn-sim-pay" id="btn-sim-success">
                  ✓ Simulate Successful Payment
                </button>
                <button type="button" class="btn btn-outline-danger btn-lg btn-sim-pay" id="btn-sim-fail">
                  ✗ Simulate Failed Payment
                </button>
              </div>
            ` : ''}

            <div class="payment-nav-actions mt-4">
              <button type="button" class="btn btn-secondary" id="btn-view-history">
                View My Bookings (${booking.reference})
              </button>
              <button type="button" class="btn btn-outline-primary" id="btn-book-another">
                Book Another Car
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    this._attachPaymentListeners(booking);
  }

  /**
   * Attaches listeners for booking configuration inputs.
   * @private
   */
  _attachListeners() {
    // Back button
    $('#btn-back-catalog', this.container)?.addEventListener('click', () => {
      this.onNavigate('vehicles');
    });

    // Vehicle change
    const vehicleSelect = $('#select-vehicle', this.container);
    vehicleSelect?.addEventListener('change', (e) => {
      this.selectedVehicleId = e.target.value;
      this.render();
    });

    // Start & End time changes
    const startInput = $('#input-start-time', this.container);
    const endInput = $('#input-end-time', this.container);

    startInput?.addEventListener('change', (e) => {
      this.startTime = e.target.value;
      this.render();
    });

    endInput?.addEventListener('change', (e) => {
      this.endTime = e.target.value;
      this.render();
    });

    // CDW radio selection
    $$('input[name="cdw-package"]', this.container).forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.selectedCdwId = e.target.value;
          this.render();
        }
      });
    });

    // Flex radio selection
    $$('input[name="flex-package"]', this.container).forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.selectedFlexId = e.target.value;
          this.render();
        }
      });
    });

    // Submit Booking
    $('#btn-submit-booking', this.container)?.addEventListener('click', () => {
      this._handleSubmitBooking();
    });
  }

  /**
   * Handles booking creation submission.
   * @private
   */
  _handleSubmitBooking() {
    const errorBox = $('#booking-submission-error', this.container);
    if (errorBox) errorBox.hidden = true;

    // Check if user is logged in
    const user = authService.getCurrentUser();
    if (!user) {
      notifications.warning('Please log in or register before confirming a reservation.');
      this.onNavigate('auth');
      return;
    }

    try {
      const newBooking = bookingService.createBooking({
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        vehicleId: this.selectedVehicleId,
        startTime: this.startTime,
        endTime: this.endTime,
        cdwPackageId: this.selectedCdwId,
        flexPackageId: this.selectedFlexId
      });

      notifications.success(`Reservation created! Reference: ${newBooking.reference}`);
      this.createdBooking = newBooking;
      this.paymentResult = null;
      this.render();
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message;
        errorBox.hidden = false;
      }
      notifications.error(err.message);
    }
  }

  /**
   * Attaches listeners on simulated payment screen.
   * @private
   * @param {import('../models/booking.js').Booking} booking
   */
  _attachPaymentListeners(booking) {
    // Simulate Success
    $('#btn-sim-success', this.container)?.addEventListener('click', () => {
      try {
        const result = paymentService.processSimulatedPayment(booking.reference, true);
        this.paymentResult = result;
        this.createdBooking = result.booking;
        notifications.success('Simulated payment succeeded! Booking Confirmed.');
        this.render();
      } catch (err) {
        notifications.error(err.message);
      }
    });

    // Simulate Failure
    $('#btn-sim-fail', this.container)?.addEventListener('click', () => {
      try {
        const result = paymentService.processSimulatedPayment(booking.reference, false);
        this.paymentResult = result;
        this.createdBooking = result.booking;
        notifications.error('Simulated payment failed as requested.');
        this.render();
      } catch (err) {
        notifications.error(err.message);
      }
    });

    // Navigate to history
    $('#btn-view-history', this.container)?.addEventListener('click', () => {
      this.createdBooking = null;
      this.paymentResult = null;
      this.onNavigate('history');
    });

    // Book another car
    $('#btn-book-another', this.container)?.addEventListener('click', () => {
      this.createdBooking = null;
      this.paymentResult = null;
      this.onNavigate('vehicles');
    });
  }
}
