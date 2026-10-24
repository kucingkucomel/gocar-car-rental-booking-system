/**
 * GoCar Car Rental Booking System - Main Application Orchestrator
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * High-cohesion application coordinator. Coordinates views, routes,
 * lifecycle initialization, and global navigation.
 */

const App = {
  currentView: 'vehicles',

  init() {
    this.setupDatePickersDefault();
    this.bindEvents();
    AuthView.updateSessionUI();
    this.updateBookingsBadges();
    this.renderCurrentView();
  },

  /**
   * Set default start and end times for rental pickers
   */
  setupDatePickersDefault() {
    const now = new Date();
    const defaultAhead = typeof TIME_CONSTANTS !== 'undefined' ? TIME_CONSTANTS.DEFAULT_HOURS_AHEAD : 1;
    const defaultDuration = typeof TIME_CONSTANTS !== 'undefined' ? TIME_CONSTANTS.DEFAULT_RENTAL_HOURS : 4;

    now.setHours(now.getHours() + defaultAhead, 0, 0, 0);

    const startLocal = Formatters.toLocalISOString(now);
    const end = new Date(now.getTime() + defaultDuration * 3600000);
    const endLocal = Formatters.toLocalISOString(end);

    const bookingStart = document.getElementById('booking-start-time');
    const bookingEnd = document.getElementById('booking-end-time');
    const heroStart = document.getElementById('hero-start-time');
    const heroEnd = document.getElementById('hero-end-time');

    if (bookingStart) bookingStart.value = startLocal;
    if (bookingEnd) bookingEnd.value = endLocal;
    if (heroStart) heroStart.value = startLocal;
    if (heroEnd) heroEnd.value = endLocal;
  },

  /**
   * Bind top-level global event listeners and modal dismissals
   */
  bindEvents() {
    // Navigation routing
    document.querySelectorAll('[data-view-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view-target');
        this.switchView(targetView);
      });
    });

    // Brand click returns to vehicles view
    document.querySelector('.brand-wrap')?.addEventListener('click', () => {
      this.switchView('vehicles');
    });

    // Initialize AuthView events
    AuthView.bindEvents(
      (user) => {
        if (user.role === 'admin') {
          this.switchView('admin-fleet');
        } else {
          this.switchView('vehicles');
        }
        this.updateBookingsBadges();
      },
      () => {
        this.switchView('vehicles');
        this.updateBookingsBadges();
      },
      () => {
        this.switchView('vehicles');
        this.updateBookingsBadges();
      }
    );

    // Category filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        VehicleView.activeCategory = pill.getAttribute('data-category') || 'all';
        this.renderVehiclesList();
      });
    });

    // Hero search button
    document.getElementById('btn-hero-search')?.addEventListener('click', () => {
      this.handleHeroSearch();
    });

    // Booking modal inputs change triggers price update
    const bookingStart = document.getElementById('booking-start-time');
    const bookingEnd = document.getElementById('booking-end-time');
    if (bookingStart) bookingStart.addEventListener('input', () => BookingView.updatePriceSummary());
    if (bookingEnd) bookingEnd.addEventListener('input', () => BookingView.updatePriceSummary());

    document.querySelectorAll('input[name="booking-cdw"]').forEach(input => {
      input.addEventListener('change', () => BookingView.updatePriceSummary());
    });
    document.querySelectorAll('input[name="booking-flex"]').forEach(input => {
      input.addEventListener('change', () => BookingView.updatePriceSummary());
    });

    // Booking Form Submit
    document.getElementById('form-booking')?.addEventListener('submit', (e) => {
      this.handleBookingSubmit(e);
    });

    // Simulated Payment Buttons
    document.getElementById('btn-pay-simulate-success')?.addEventListener('click', () => {
      this.handleSimulatedPayment('success');
    });
    document.getElementById('btn-pay-simulate-fail')?.addEventListener('click', () => {
      this.handleSimulatedPayment('fail');
    });

    // Admin Vehicle Form Submit
    document.getElementById('form-admin-vehicle')?.addEventListener('submit', (e) => {
      this.handleAdminVehicleSubmit(e);
    });

    // Admin Add Car Button
    document.getElementById('btn-admin-add-car')?.addEventListener('click', () => {
      AdminView.openVehicleFormModal(null);
    });

    // Reset Demo Data Button
    document.getElementById('btn-reset-demo-data')?.addEventListener('click', () => {
      this.handleResetDemoData();
    });

    // Modal close triggers
    document.querySelectorAll('.modal-close, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  },

  /**
   * Switch Active View with security and role guards
   */
  switchView(viewName) {
    const user = AuthService.getCurrentUser();

    if (viewName === 'admin-fleet' || viewName === 'admin-bookings') {
      if (!AuthService.isAdmin()) {
        NotificationUI.showToast('Administrator privileges are required to access this area.', 'error');
        AuthView.openModal('login');
        return;
      }
    }

    if (viewName === 'my-bookings') {
      if (!user) {
        NotificationUI.showToast('Please log in as a customer to view your bookings.', 'warning');
        AuthView.openModal('login');
        return;
      }
    }

    this.currentView = viewName;

    // Update active nav link
    document.querySelectorAll('[data-view-target]').forEach(link => {
      if (link.getAttribute('data-view-target') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle views
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    // Hero banner display
    const heroSection = document.getElementById('hero-banner');
    if (heroSection) {
      heroSection.style.display = (viewName === 'vehicles') ? 'block' : 'none';
    }

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderCurrentView() {
    switch (this.currentView) {
      case 'vehicles':
        this.renderVehiclesList();
        break;
      case 'my-bookings':
        this.renderMyBookingsList();
        break;
      case 'admin-fleet':
        this.renderAdminFleet();
        break;
      case 'admin-bookings':
        this.renderAdminBookings();
        break;
    }
  },

  renderVehiclesList() {
    VehicleView.renderGrid(
      (vehicleId) => this.openBookingModal(vehicleId),
      (vehicleId) => this.openVehicleDetailsModal(vehicleId)
    );
  },

  renderMyBookingsList() {
    BookingView.renderCustomerBookings(
      (bookingId) => BookingView.openPaymentModal(bookingId),
      (bookingId) => this.handleCancelBooking(bookingId)
    );
  },

  renderAdminFleet() {
    AdminView.renderFleet(
      (vehicleId) => AdminView.openVehicleFormModal(vehicleId),
      (vehicleId) => this.handleAdminDeleteVehicle(vehicleId)
    );
  },

  renderAdminBookings() {
    AdminView.renderBookings(
      (bookingId, newStatus) => this.handleAdminStatusChange(bookingId, newStatus)
    );
  },

  updateBookingsBadges() {
    const user = AuthService.getCurrentUser();
    const myBookingsBadge = document.getElementById('badge-my-bookings');
    const adminBookingsBadge = document.getElementById('badge-admin-bookings');

    if (user && user.role === 'customer') {
      const myBookings = BookingService.getCustomerBookings(user.id);
      const activeCount = myBookings.filter(b => BookingService.isActiveBooking(b)).length;
      if (myBookingsBadge) {
        myBookingsBadge.textContent = activeCount;
        myBookingsBadge.style.display = activeCount > 0 ? 'inline-flex' : 'none';
      }
    }

    if (user && user.role === 'admin') {
      const allBookings = DataStore.getBookings();
      const activeCount = allBookings.filter(b => BookingService.isActiveBooking(b)).length;
      if (adminBookingsBadge) {
        adminBookingsBadge.textContent = activeCount;
        adminBookingsBadge.style.display = activeCount > 0 ? 'inline-flex' : 'none';
      }
    }
  },

  handleHeroSearch() {
    const heroStart = document.getElementById('hero-start-time')?.value;
    const heroEnd = document.getElementById('hero-end-time')?.value;

    const durationInfo = Formatters.calculateRentalDuration(heroStart, heroEnd);
    if (!durationInfo.isValid) {
      NotificationUI.showToast(durationInfo.message, 'error');
      return;
    }

    NotificationUI.showToast(`Search applied: ${durationInfo.billableHours} billable hours. Checking fleet availability...`, 'info');
    this.renderVehiclesList();

    document.getElementById('fleet-section-heading')?.scrollIntoView({ behavior: 'smooth' });
  },

  openBookingModal(vehicleId) {
    BookingView.openBookingModal(vehicleId);
  },

  openVehicleDetailsModal(vehicleId) {
    VehicleView.openDetailsModal(vehicleId, (carId) => this.openBookingModal(carId));
  },

  handleBookingSubmit(e) {
    e.preventDefault();
    if (!BookingView.selectedVehicle) return;

    const startDateTime = document.getElementById('booking-start-time')?.value;
    const endDateTime = document.getElementById('booking-end-time')?.value;
    const cdwInput = document.querySelector('input[name="booking-cdw"]:checked');
    const flexInput = document.querySelector('input[name="booking-flex"]:checked');

    if (!cdwInput || !flexInput) {
      NotificationUI.showToast('Please select both a CDW protection package and a Flex package.', 'error');
      return;
    }

    const result = BookingService.createBooking({
      vehicleId: BookingView.selectedVehicle.id,
      startDateTime,
      endDateTime,
      cdwId: cdwInput.value,
      flexId: flexInput.value
    });

    if (!result.success) {
      NotificationUI.showToast(result.message, 'error');
      return;
    }

    document.getElementById('modal-booking')?.classList.remove('active');
    NotificationUI.showToast(result.message, 'success');
    this.updateBookingsBadges();

    BookingView.openPaymentModal(result.booking.id);
  },

  handleSimulatedPayment(outcome) {
    if (!BookingView.currentPaymentBookingId) return;

    const result = BookingService.processSimulatedPayment(BookingView.currentPaymentBookingId, outcome);
    document.getElementById('modal-payment')?.classList.remove('active');

    if (result.success) {
      NotificationUI.showToast(result.message, 'success');
    } else {
      NotificationUI.showToast(result.message, 'warning');
    }

    this.updateBookingsBadges();
    this.switchView('my-bookings');
  },

  handleCancelBooking(bookingId) {
    if (!confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
      return;
    }

    const user = AuthService.getCurrentUser();
    const result = BookingService.cancelBooking(bookingId, user);

    if (result.success) {
      NotificationUI.showToast(result.message, 'success');
      this.updateBookingsBadges();
      this.renderCurrentView();
    } else {
      NotificationUI.showToast(result.message, 'error');
    }
  },

  handleAdminStatusChange(bookingId, newStatus) {
    try {
      const result = AdminService.updateBookingStatus(bookingId, newStatus);
      if (result.success) {
        NotificationUI.showToast(result.message, 'success');
        this.updateBookingsBadges();
        this.renderAdminBookings();
      } else {
        NotificationUI.showToast(result.message, 'error');
      }
    } catch (e) {
      NotificationUI.showToast(e.message, 'error');
    }
  },

  handleAdminVehicleSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('admin-car-id')?.value;
    const name = document.getElementById('admin-car-name')?.value;
    const category = document.getElementById('admin-car-category')?.value;
    const capacity = document.getElementById('admin-car-capacity')?.value;
    const transmission = document.getElementById('admin-car-transmission')?.value;
    const hourlyRate = document.getElementById('admin-car-rate')?.value;
    const description = document.getElementById('admin-car-description')?.value;

    let result;
    if (AdminView.editingVehicleId) {
      result = AdminService.editVehicle(AdminView.editingVehicleId, {
        name,
        category,
        capacity,
        transmission,
        hourlyRate,
        description
      });
    } else {
      result = AdminService.addVehicle({
        id,
        name,
        category,
        capacity,
        transmission,
        hourlyRate,
        description
      });
    }

    if (result.success) {
      NotificationUI.showToast(result.message, 'success');
      document.getElementById('modal-admin-vehicle')?.classList.remove('active');
      this.renderAdminFleet();
      this.renderVehiclesList();
    } else {
      NotificationUI.showToast(result.message, 'error');
    }
  },

  handleAdminDeleteVehicle(vehicleId) {
    if (!confirm(`Are you sure you want to remove vehicle ${vehicleId} from the fleet?`)) {
      return;
    }

    try {
      const result = AdminService.removeVehicle(vehicleId);
      if (result.success) {
        NotificationUI.showToast(result.message, 'success');
        this.renderAdminFleet();
        this.renderVehiclesList();
      } else {
        NotificationUI.showToast(result.message, 'error');
      }
    } catch (e) {
      NotificationUI.showToast(e.message, 'error');
    }
  },

  handleResetDemoData() {
    if (!confirm('Reset all demo data back to default baseline seed data? This will restore the initial 4 vehicles and demo users, and clear existing reservations.')) {
      return;
    }

    DataStore.resetToDefaults();
    NotificationUI.showToast('System data successfully restored to default seed state.', 'success');
    AuthView.updateSessionUI();
    this.updateBookingsBadges();
    this.renderCurrentView();
  },

  // Backwards compatibility helpers
  openAuthModal(tab) {
    AuthView.openModal(tab);
  },
  showToast(msg, type) {
    NotificationUI.showToast(msg, type);
  }
};

// Start application when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
}

if (typeof globalThis !== 'undefined') {
  globalThis.App = App;
}
