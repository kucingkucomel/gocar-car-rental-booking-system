/**
 * GoCar Car Rental Booking System - Booking View Module
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Manages booking modal interactions, live price calculation updates,
 * simulated payment outcomes, receipt rendering, and customer booking history.
 */

const BookingView = {
  selectedVehicle: null,
  currentPaymentBookingId: null,

  openBookingModal(vehicleId) {
    const user = AuthService.getCurrentUser();
    if (!user) {
      NotificationUI.showToast('Please log in or register an account before booking a vehicle.', 'info');
      AuthView.openModal('login');
      return;
    }

    if (user.role === (typeof USER_ROLES !== 'undefined' ? USER_ROLES.ADMIN : 'admin')) {
      NotificationUI.showToast('You are logged in as Administrator. To experience the customer booking flow, please switch to a Customer account.', 'warning');
    }

    const vehicles = DataStore.getVehicles();
    const car = vehicles.find(v => v.id === vehicleId);
    if (!car) {
      NotificationUI.showToast('Vehicle not found.', 'error');
      return;
    }

    this.selectedVehicle = car;

    // Fill vehicle info in booking modal
    const vehicleIdInput = document.getElementById('booking-vehicle-id');
    if (vehicleIdInput) vehicleIdInput.value = car.id;
    DOMUtils.setText('booking-vehicle-name', car.name);
    DOMUtils.setText('booking-vehicle-category', car.category);
    DOMUtils.setText('booking-vehicle-rate', `${Formatters.formatCurrency(car.hourlyRate)} / hour`);

    // Inherit hero dates if already set, or default
    const heroStart = document.getElementById('hero-start-time')?.value;
    const heroEnd = document.getElementById('hero-end-time')?.value;
    const bookingStart = document.getElementById('booking-start-time');
    const bookingEnd = document.getElementById('booking-end-time');

    if (heroStart && heroEnd && bookingStart && bookingEnd) {
      bookingStart.value = heroStart;
      bookingEnd.value = heroEnd;
    }

    // Default package selections (Standard CDW, Basic Flex)
    const cdwStandard = document.getElementById('cdw_standard');
    const flexBasic = document.getElementById('flex_basic');
    if (cdwStandard) cdwStandard.checked = true;
    if (flexBasic) flexBasic.checked = true;

    this.updatePriceSummary();

    const modal = document.getElementById('modal-booking');
    if (modal) modal.classList.add('active');
  },

  updatePriceSummary() {
    if (!this.selectedVehicle) return;

    const startStr = document.getElementById('booking-start-time')?.value;
    const endStr = document.getElementById('booking-end-time')?.value;
    const cdwInput = document.querySelector('input[name="booking-cdw"]:checked');
    const flexInput = document.querySelector('input[name="booking-flex"]:checked');

    const durationBadge = document.getElementById('booking-duration-badge');
    const basePriceEl = document.getElementById('summary-base-price');
    const cdwPriceEl = document.getElementById('summary-cdw-price');
    const flexPriceEl = document.getElementById('summary-flex-price');
    const totalPriceEl = document.getElementById('summary-total-price');
    const overlapAlertEl = document.getElementById('booking-overlap-warning');

    const cdwId = cdwInput ? cdwInput.value : 'cdw_standard';
    const flexId = flexInput ? flexInput.value : 'flex_basic';

    const durationInfo = Formatters.calculateRentalDuration(startStr, endStr);

    if (!durationInfo.isValid) {
      if (durationBadge) {
        durationBadge.textContent = 'Invalid duration';
        durationBadge.className = 'duration-indicator invalid';
      }
      if (totalPriceEl) totalPriceEl.textContent = 'RM 0.00';
      if (overlapAlertEl) overlapAlertEl.style.display = 'none';
      return;
    }

    if (durationBadge) {
      durationBadge.textContent = `${durationInfo.billableHours} Billable Hours (Duration: ${durationInfo.rawHours} hrs)`;
      durationBadge.className = 'duration-indicator valid';
    }

    // Overlap availability check (BR-03)
    const availability = BookingService.checkVehicleAvailability(this.selectedVehicle.id, startStr, endStr);
    if (overlapAlertEl) {
      if (!availability.isAvailable) {
        overlapAlertEl.textContent = availability.message;
        overlapAlertEl.style.display = 'block';
      } else {
        overlapAlertEl.style.display = 'none';
      }
    }

    const pricing = BookingService.calculatePriceBreakdown(
      this.selectedVehicle.hourlyRate,
      durationInfo.billableHours,
      cdwId,
      flexId
    );

    if (basePriceEl) {
      basePriceEl.textContent = `${pricing.formattedBaseCharge} (${durationInfo.billableHours} hrs × ${Formatters.formatCurrency(this.selectedVehicle.hourlyRate)})`;
    }
    if (cdwPriceEl) cdwPriceEl.textContent = pricing.formattedCdwCharge;
    if (flexPriceEl) flexPriceEl.textContent = pricing.formattedFlexCharge;
    if (totalPriceEl) totalPriceEl.textContent = pricing.formattedTotalPrice;
  },

  openPaymentModal(bookingId) {
    const booking = BookingService.getBooking(bookingId);
    if (!booking) {
      NotificationUI.showToast('Booking not found.', 'error');
      return;
    }

    this.currentPaymentBookingId = booking.id;

    DOMUtils.setText('pay-booking-ref', booking.id);
    DOMUtils.setText('pay-car-name', booking.vehicleName);
    DOMUtils.setText(
      'pay-duration',
      `${booking.billableHours} Billable Hours (${Formatters.formatDateTime(booking.startDateTime)} → ${Formatters.formatDateTime(booking.endDateTime)})`
    );
    DOMUtils.setText('pay-total-amount', Formatters.formatCurrency(booking.totalPrice));
    DOMUtils.setText(
      'pay-status-current',
      `Current Status: ${booking.bookingStatus} (Payment: ${booking.paymentStatus})`
    );

    const modal = document.getElementById('modal-payment');
    if (modal) modal.classList.add('active');
  },

  showReceiptModal(bookingId) {
    const booking = BookingService.getBooking(bookingId);
    if (!booking) return;

    DOMUtils.setText('receipt-ref', booking.id);
    DOMUtils.setText('receipt-date', Formatters.formatDateTime(booking.createdAt));
    DOMUtils.setText('receipt-customer', `${booking.customerName} (${booking.customerEmail})`);
    DOMUtils.setText('receipt-car', `${booking.vehicleName} (${booking.vehicleCategory})`);
    DOMUtils.setText(
      'receipt-period',
      `${Formatters.formatDateTime(booking.startDateTime)} to ${Formatters.formatDateTime(booking.endDateTime)}`
    );
    DOMUtils.setText('receipt-hours', `${booking.billableHours} billable hours`);
    DOMUtils.setText('receipt-base', Formatters.formatCurrency(booking.baseCharge));
    DOMUtils.setText(
      'receipt-cdw',
      `${booking.cdwPackage ? booking.cdwPackage.name : 'N/A'}: ${Formatters.formatCurrency(booking.cdwCharge)}`
    );
    DOMUtils.setText(
      'receipt-flex',
      `${booking.flexPackage ? booking.flexPackage.name : 'N/A'}: ${Formatters.formatCurrency(booking.flexCharge)}`
    );
    DOMUtils.setText('receipt-total', Formatters.formatCurrency(booking.totalPrice));
    DOMUtils.setText('receipt-status', `Booking: ${booking.bookingStatus} | Payment: ${booking.paymentStatus}`);

    const modal = document.getElementById('modal-receipt');
    if (modal) modal.classList.add('active');
  },

  renderCustomerBookings(onSimulatePayment, onCancelBooking) {
    const user = AuthService.getCurrentUser();
    const container = document.getElementById('my-bookings-list');
    if (!container) return;

    if (!user) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Authentication Required</h3>
          <p>Please log in to view your personal booking records.</p>
          <button type="button" class="btn btn-primary" id="btn-login-from-bookings">Log In Now</button>
        </div>
      `;
      document.getElementById('btn-login-from-bookings')?.addEventListener('click', () => {
        AuthView.openModal('login');
      });
      return;
    }

    const bookings = BookingService.getCustomerBookings(user.id);

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚗</div>
          <h3>No Bookings Yet</h3>
          <p>You haven't made any GoCar bookings yet. Browse our available fleet and hit the road!</p>
          <button type="button" class="btn btn-primary" id="btn-browse-from-empty">Browse Vehicles</button>
        </div>
      `;
      document.getElementById('btn-browse-from-empty')?.addEventListener('click', () => {
        if (typeof App !== 'undefined' && typeof App.switchView === 'function') {
          App.switchView('vehicles');
        }
      });
      return;
    }

    container.innerHTML = bookings.map(b => {
      let payBadgeClass = 'badge-warning';
      if (b.paymentStatus === 'Successful') payBadgeClass = 'badge-success';
      if (b.paymentStatus === 'Failed') payBadgeClass = 'badge-danger';

      let bookBadgeClass = 'badge-warning';
      if (b.bookingStatus === 'Confirmed') bookBadgeClass = 'badge-success';
      if (b.bookingStatus === 'Cancelled') bookBadgeClass = 'badge-secondary';

      const canPay = b.bookingStatus === 'Pending Payment';
      const canCancel = b.bookingStatus !== 'Cancelled';

      const safeId = DOMUtils.escapeHTML(b.id);
      const safeCarName = DOMUtils.escapeHTML(b.vehicleName);
      const safeCategory = DOMUtils.escapeHTML(b.vehicleCategory);
      const safeTransmission = DOMUtils.escapeHTML(b.vehicleTransmission);
      const safeCapacity = DOMUtils.escapeHTML(b.vehicleCapacity);
      const safeCdwName = DOMUtils.escapeHTML(b.cdwPackage ? b.cdwPackage.name : 'N/A');
      const safeFlexName = DOMUtils.escapeHTML(b.flexPackage ? b.flexPackage.name : 'N/A');
      const safeTxnId = b.paymentDetails && b.paymentDetails.transactionId
        ? DOMUtils.escapeHTML(b.paymentDetails.transactionId)
        : '';

      return `
        <div class="booking-card">
          <div class="booking-card-header">
            <div>
              <span class="booking-ref">${safeId}</span>
              <span class="booking-date">Created on ${Formatters.formatDateTime(b.createdAt)}</span>
            </div>
            <div class="badge-group">
              <span class="badge ${payBadgeClass}">Payment: ${DOMUtils.escapeHTML(b.paymentStatus)}</span>
              <span class="badge ${bookBadgeClass}">${DOMUtils.escapeHTML(b.bookingStatus)}</span>
            </div>
          </div>

          <div class="booking-card-body">
            <div class="booking-info-col">
              <h4>Vehicle</h4>
              <p class="strong">${safeCarName} (${safeCategory})</p>
              <p class="small text-muted">Transmission: ${safeTransmission} | Capacity: ${safeCapacity} Seats</p>
            </div>

            <div class="booking-info-col">
              <h4>Rental Period</h4>
              <p class="small"><strong>Start:</strong> ${Formatters.formatDateTime(b.startDateTime)}</p>
              <p class="small"><strong>End:</strong> ${Formatters.formatDateTime(b.endDateTime)}</p>
              <p class="small text-muted">${b.billableHours} Billable Hours</p>
            </div>

            <div class="booking-info-col">
              <h4>Selected Packages</h4>
              <p class="small"><strong>CDW:</strong> ${safeCdwName} (${Formatters.formatCurrency(b.cdwCharge)})</p>
              <p class="small"><strong>Flex:</strong> ${safeFlexName} (${Formatters.formatCurrency(b.flexCharge)})</p>
            </div>

            <div class="booking-info-col total-col">
              <h4>Total Price</h4>
              <p class="price-highlight">${Formatters.formatCurrency(b.totalPrice)}</p>
              <p class="small text-muted">Base: ${Formatters.formatCurrency(b.baseCharge)}</p>
            </div>
          </div>

          <div class="booking-card-footer">
            <div class="footer-left">
              ${safeTxnId ? `<span class="txn-ref">Txn: ${safeTxnId}</span>` : ''}
            </div>
            <div class="btn-group">
              ${canPay ? `
                <button type="button" class="btn btn-primary btn-sm" data-action="pay" data-booking-id="${safeId}">
                  Simulate Payment
                </button>
              ` : ''}
              ${canCancel ? `
                <button type="button" class="btn btn-outline-danger btn-sm" data-action="cancel" data-booking-id="${safeId}">
                  Cancel Booking
                </button>
              ` : ''}
              <button type="button" class="btn btn-secondary btn-sm" data-action="receipt" data-booking-id="${safeId}">
                View Receipt
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Event delegation on customer bookings container
    container.onclick = (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const bookingId = btn.getAttribute('data-booking-id');

      if (action === 'pay') {
        if (typeof onSimulatePayment === 'function') {
          onSimulatePayment(bookingId);
        } else {
          this.openPaymentModal(bookingId);
        }
      } else if (action === 'cancel') {
        if (typeof onCancelBooking === 'function') {
          onCancelBooking(bookingId);
        }
      } else if (action === 'receipt') {
        this.showReceiptModal(bookingId);
      }
    };
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.BookingView = BookingView;
}
