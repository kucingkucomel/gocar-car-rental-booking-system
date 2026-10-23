/**
 * GoCar Car Rental Booking System - Main Application Controller
 * Handles UI interactions, view switching, modal management, and event binding
 */

// Global App State
const App = {
  currentView: 'vehicles',
  selectedVehicleForBooking: null,
  activeFilterCategory: 'all',
  editingVehicleId: null,

  init() {
    this.setupDatePickersDefault();
    this.bindEvents();
    this.updateUserSessionUI();
    this.renderCurrentView();
  },

  /**
   * Set default start and end times for rental pickers (Current + 1 hour, duration 4 hours)
   */
  setupDatePickersDefault() {
    const now = new Date();
    // Round to next whole hour
    now.setHours(now.getHours() + 1, 0, 0, 0);

    const startLocal = this.toLocalISOString(now);
    const end = new Date(now.getTime() + 4 * 60 * 60 * 1000); // +4 hours default
    const endLocal = this.toLocalISOString(end);

    const bookingStart = document.getElementById('booking-start-time');
    const bookingEnd = document.getElementById('booking-end-time');
    const heroStart = document.getElementById('hero-start-time');
    const heroEnd = document.getElementById('hero-end-time');

    if (bookingStart) bookingStart.value = startLocal;
    if (bookingEnd) bookingEnd.value = endLocal;
    if (heroStart) heroStart.value = startLocal;
    if (heroEnd) heroEnd.value = endLocal;
  },

  toLocalISOString(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  },

  /**
   * Bind DOM event listeners
   */
  bindEvents() {
    // Navigation Links
    document.querySelectorAll('[data-view-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view-target');
        this.switchView(targetView);
      });
    });

    // Auth Buttons
    const btnOpenLogin = document.getElementById('btn-open-login');
    const btnOpenRegister = document.getElementById('btn-open-register');
    const btnLogout = document.getElementById('btn-logout');

    if (btnOpenLogin) {
      btnOpenLogin.addEventListener('click', () => this.openAuthModal('login'));
    }
    if (btnOpenRegister) {
      btnOpenRegister.addEventListener('click', () => this.openAuthModal('register'));
    }
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.handleLogout());
    }

    // Auth Modal tab switching
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => this.switchAuthTab('login'));
      tabRegister.addEventListener('click', () => this.switchAuthTab('register'));
    }

    // Auth Forms Submission
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    if (formLogin) {
      formLogin.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
    }

    // Quick Autofill Buttons for Demo
    const btnAutofillCustomer = document.getElementById('btn-autofill-customer');
    const btnAutofillAdmin = document.getElementById('btn-autofill-admin');
    if (btnAutofillCustomer) {
      btnAutofillCustomer.addEventListener('click', () => {
        document.getElementById('login-email').value = 'customer@gocar.demo';
        document.getElementById('login-password').value = 'password123';
      });
    }
    if (btnAutofillAdmin) {
      btnAutofillAdmin.addEventListener('click', () => {
        document.getElementById('login-email').value = 'admin@gocar.demo';
        document.getElementById('login-password').value = 'admin123';
      });
    }

    // Category filter tabs
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeFilterCategory = pill.getAttribute('data-category');
        this.renderVehiclesList();
      });
    });

    // Hero search button
    const btnHeroSearch = document.getElementById('btn-hero-search');
    if (btnHeroSearch) {
      btnHeroSearch.addEventListener('click', () => this.handleHeroSearch());
    }

    // Booking modal inputs change (recalculate price live)
    const bookingStart = document.getElementById('booking-start-time');
    const bookingEnd = document.getElementById('booking-end-time');
    if (bookingStart) bookingStart.addEventListener('input', () => this.updateBookingPriceSummary());
    if (bookingEnd) bookingEnd.addEventListener('input', () => this.updateBookingPriceSummary());

    document.querySelectorAll('input[name="booking-cdw"]').forEach(input => {
      input.addEventListener('change', () => this.updateBookingPriceSummary());
    });
    document.querySelectorAll('input[name="booking-flex"]').forEach(input => {
      input.addEventListener('change', () => this.updateBookingPriceSummary());
    });

    // Booking Form Submit
    const formBooking = document.getElementById('form-booking');
    if (formBooking) {
      formBooking.addEventListener('submit', (e) => this.handleBookingSubmit(e));
    }

    // Simulated Payment Buttons
    const btnPaySuccess = document.getElementById('btn-pay-simulate-success');
    const btnPayFail = document.getElementById('btn-pay-simulate-fail');
    if (btnPaySuccess) {
      btnPaySuccess.addEventListener('click', () => this.handleSimulatedPayment('success'));
    }
    if (btnPayFail) {
      btnPayFail.addEventListener('click', () => this.handleSimulatedPayment('fail'));
    }

    // Admin Vehicle Form
    const formAdminVehicle = document.getElementById('form-admin-vehicle');
    if (formAdminVehicle) {
      formAdminVehicle.addEventListener('submit', (e) => this.handleAdminVehicleSubmit(e));
    }

    const btnAdminAddCar = document.getElementById('btn-admin-add-car');
    if (btnAdminAddCar) {
      btnAdminAddCar.addEventListener('click', () => this.openVehicleFormModal(null));
    }

    // Reset Demo Data buttons
    const btnResetDemo = document.getElementById('btn-reset-demo-data');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => this.handleResetDemoData());
    }

    // Close Modal buttons
    document.querySelectorAll('.modal-close, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Close modal on background click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  },

  /**
   * Switch Active View
   */
  switchView(viewName) {
    const user = Auth.getCurrentUser();

    // Guard view permissions
    if (viewName === 'admin-fleet' || viewName === 'admin-bookings') {
      if (!Auth.isAdmin()) {
        this.showToast('Administrator privileges are required to access this area.', 'error');
        this.openAuthModal('login');
        return;
      }
    }

    if (viewName === 'my-bookings') {
      if (!user) {
        this.showToast('Please log in as a customer to view your bookings.', 'warning');
        this.openAuthModal('login');
        return;
      }
    }

    this.currentView = viewName;

    // Update nav links active status
    document.querySelectorAll('[data-view-target]').forEach(link => {
      if (link.getAttribute('data-view-target') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Hide all views, show target view
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    // Hero banner only on vehicles view
    const heroSection = document.getElementById('hero-banner');
    if (heroSection) {
      heroSection.style.display = (viewName === 'vehicles') ? 'block' : 'none';
    }

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Render content based on active view
   */
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

  /**
   * Update header UI elements based on authentication status
   */
  updateUserSessionUI() {
    const user = Auth.getCurrentUser();
    const guestNav = document.getElementById('nav-guest-actions');
    const authNav = document.getElementById('nav-user-actions');
    const userNameSpan = document.getElementById('user-display-name');
    const userRoleBadge = document.getElementById('user-role-badge');
    const adminNavLinks = document.querySelectorAll('.admin-nav-item');
    const customerNavLinks = document.querySelectorAll('.customer-nav-item');

    if (user) {
      if (guestNav) guestNav.style.display = 'none';
      if (authNav) authNav.style.display = 'flex';
      if (userNameSpan) userNameSpan.textContent = user.name;
      if (userRoleBadge) {
        userRoleBadge.textContent = user.role === 'admin' ? 'Administrator' : 'Customer';
        userRoleBadge.className = `role-badge ${user.role}`;
      }

      // Show/hide role-specific navigation
      adminNavLinks.forEach(el => el.style.display = user.role === 'admin' ? 'inline-block' : 'none');
      customerNavLinks.forEach(el => el.style.display = user.role === 'customer' ? 'inline-block' : 'none');
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (authNav) authNav.style.display = 'none';
      adminNavLinks.forEach(el => el.style.display = 'none');
      customerNavLinks.forEach(el => el.style.display = 'none');
    }

    this.updateBookingsBadges();
  },

  /**
   * Update badge counts in navigation
   */
  updateBookingsBadges() {
    const user = Auth.getCurrentUser();
    const myBookingsBadge = document.getElementById('badge-my-bookings');
    const adminBookingsBadge = document.getElementById('badge-admin-bookings');

    if (user && user.role === 'customer') {
      const myBookings = BookingService.getCustomerBookings(user.id);
      const activeCount = myBookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending Payment').length;
      if (myBookingsBadge) {
        myBookingsBadge.textContent = activeCount;
        myBookingsBadge.style.display = activeCount > 0 ? 'inline-flex' : 'none';
      }
    }

    if (user && user.role === 'admin') {
      const allBookings = DataStore.getBookings();
      const pendingOrConfirmed = allBookings.filter(b => b.bookingStatus === 'Pending Payment' || b.bookingStatus === 'Confirmed').length;
      if (adminBookingsBadge) {
        adminBookingsBadge.textContent = pendingOrConfirmed;
        adminBookingsBadge.style.display = pendingOrConfirmed > 0 ? 'inline-flex' : 'none';
      }
    }
  },

  /**
   * Render vehicles grid in Browse Vehicles view (FR-02)
   */
  renderVehiclesList() {
    const container = document.getElementById('vehicles-grid');
    if (!container) return;

    const vehicles = DataStore.getVehicles();
    const filtered = this.activeFilterCategory === 'all'
      ? vehicles
      : vehicles.filter(v => v.category.toLowerCase() === this.activeFilterCategory.toLowerCase());

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No vehicles found in the "${this.activeFilterCategory}" category.</p>
        </div>
      `;
      return;
    }

    // Check availability against currently entered hero search dates if valid
    const heroStart = document.getElementById('hero-start-time')?.value;
    const heroEnd = document.getElementById('hero-end-time')?.value;
    const hasSearchDates = heroStart && heroEnd && new Date(heroEnd) > new Date(heroStart);

    container.innerHTML = filtered.map(car => {
      let availabilityBadge = `<span class="badge badge-success">Available</span>`;
      let isAvailableForPeriod = true;

      if (hasSearchDates) {
        const check = BookingService.checkVehicleAvailability(car.id, heroStart, heroEnd);
        if (!check.isAvailable) {
          isAvailableForPeriod = false;
          availabilityBadge = `<span class="badge badge-warning" title="${check.message}">Reserved for Selected Dates</span>`;
        }
      }

      return `
        <div class="vehicle-card" data-vehicle-id="${car.id}">
          <div class="vehicle-card-image-wrap">
            ${this.getCarSvgIllustration(car.image, car.name)}
            <span class="category-pill">${car.category}</span>
          </div>
          <div class="vehicle-card-body">
            <div class="vehicle-card-header">
              <h3 class="vehicle-name">${car.name}</h3>
              <div class="vehicle-price-tag">
                <span class="currency">RM</span>
                <span class="rate">${car.hourlyRate.toFixed(2)}</span>
                <span class="unit">/ hr</span>
              </div>
            </div>

            <p class="vehicle-desc">${car.description || 'Reliable car sharing vehicle.'}</p>

            <div class="vehicle-specs-list">
              <div class="spec-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>${car.capacity} Seats</span>
              </div>
              <div class="spec-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                <span>${car.transmission}</span>
              </div>
              <div class="spec-item">
                ${availabilityBadge}
              </div>
            </div>

            <div class="vehicle-card-actions">
              <button class="btn btn-secondary btn-sm" onclick="App.openVehicleDetailsModal('${car.id}')">
                Details
              </button>
              <button class="btn btn-primary btn-sm btn-book" onclick="App.openBookingModal('${car.id}')">
                Book Now
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Generates clean SVG illustrations for each vehicle model (no external asset dependencies)
   */
  getCarSvgIllustration(imageType, carName) {
    // Distinct vibrant color accents for each model
    let bodyColor = '#da291c'; // GoCar Red
    let carShape = 'hatchback';

    if (imageType === 'axia') {
      bodyColor = '#e02424'; // Red Axia
      carShape = 'compact';
    } else if (imageType === 'myvi') {
      bodyColor = '#1f2937'; // Modern Granite Grey Myvi
      carShape = 'hatchback';
    } else if (imageType === 'saga') {
      bodyColor = '#2563eb'; // Royal Blue Proton Saga
      carShape = 'sedan';
    } else if (imageType === 'alza') {
      bodyColor = '#059669'; // Emerald MPV Alza
      carShape = 'mpv';
    }

    return `
      <svg class="car-illustration" viewBox="0 0 320 160" width="100%" height="150" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#bae6fd"/>
            <stop offset="100%" stop-color="#38bdf8"/>
          </linearGradient>
        </defs>

        <!-- Ground Shadow -->
        <ellipse cx="160" cy="142" rx="130" ry="10" fill="#cbd5e1" opacity="0.6"/>

        <!-- Car Body -->
        ${carShape === 'sedan' ? `
          <!-- Sedan Silhouette -->
          <path d="M 45 125 L 35 110 Q 40 95 65 92 L 105 88 L 140 50 L 220 50 L 255 88 L 290 92 Q 305 95 295 120 L 280 125 Z" fill="${bodyColor}"/>
          <!-- Windows -->
          <path d="M 112 85 L 143 54 L 175 54 L 175 85 Z" fill="url(#glassGrad)" opacity="0.9"/>
          <path d="M 182 85 L 182 54 L 217 54 L 246 85 Z" fill="url(#glassGrad)" opacity="0.9"/>
        ` : carShape === 'mpv' ? `
          <!-- MPV Silhouette (Alza) -->
          <path d="M 40 125 L 32 105 Q 38 90 60 88 L 100 82 L 130 42 L 260 42 L 285 88 L 295 115 L 280 125 Z" fill="${bodyColor}"/>
          <!-- Windows -->
          <path d="M 108 80 L 134 47 L 175 47 L 175 80 Z" fill="url(#glassGrad)" opacity="0.9"/>
          <path d="M 182 80 L 182 47 L 225 47 L 225 80 Z" fill="url(#glassGrad)" opacity="0.9"/>
          <path d="M 232 80 L 232 47 L 255 47 L 275 80 Z" fill="url(#glassGrad)" opacity="0.9"/>
        ` : `
          <!-- Compact / Hatchback (Axia / Myvi) -->
          <path d="M 45 125 L 36 108 Q 42 92 65 90 L 110 86 L 145 46 L 240 46 L 270 88 L 290 105 L 280 125 Z" fill="${bodyColor}"/>
          <!-- Windows -->
          <path d="M 116 83 L 148 51 L 185 51 L 185 83 Z" fill="url(#glassGrad)" opacity="0.9"/>
          <path d="M 192 83 L 192 51 L 234 51 L 260 83 Z" fill="url(#glassGrad)" opacity="0.9"/>
        `}

        <!-- Headlight and Taillight -->
        <path d="M 35 106 Q 32 114 42 116 Z" fill="#fef08a"/>
        <path d="M 292 102 Q 295 110 286 112 Z" fill="#ef4444"/>

        <!-- Door seam and handle -->
        <line x1="180" y1="84" x2="180" y2="122" stroke="rgba(0,0,0,0.25)" stroke-width="2"/>
        <rect x="190" y="93" width="16" height="4" rx="2" fill="#ffffff" opacity="0.8"/>

        <!-- Wheels -->
        <!-- Rear Wheel -->
        <g transform="translate(85, 125)">
          <circle cx="0" cy="0" r="22" fill="#1e293b"/>
          <circle cx="0" cy="0" r="14" fill="#94a3b8"/>
          <circle cx="0" cy="0" r="6" fill="#334155"/>
        </g>
        <!-- Front Wheel -->
        <g transform="translate(245, 125)">
          <circle cx="0" cy="0" r="22" fill="#1e293b"/>
          <circle cx="0" cy="0" r="14" fill="#94a3b8"/>
          <circle cx="0" cy="0" r="6" fill="#334155"/>
        </g>
      </svg>
    `;
  },

  /**
   * Handle Hero quick search / availability check
   */
  handleHeroSearch() {
    const heroStart = document.getElementById('hero-start-time').value;
    const heroEnd = document.getElementById('hero-end-time').value;

    const durationInfo = BookingService.calculateRentalDuration(heroStart, heroEnd);
    if (!durationInfo.isValid) {
      this.showToast(durationInfo.message, 'error');
      return;
    }

    this.showToast(`Search applied: ${durationInfo.billableHours} billable hours. Checking fleet availability...`, 'info');
    this.renderVehiclesList();

    // Smooth scroll down to fleet section
    const fleetSection = document.getElementById('fleet-section-heading');
    if (fleetSection) {
      fleetSection.scrollIntoView({ behavior: 'smooth' });
    }
  },

  /**
   * Open Booking Wizard Modal for a vehicle (FR-03, FR-04, FR-05)
   */
  openBookingModal(vehicleId) {
    const user = Auth.getCurrentUser();
    if (!user) {
      this.showToast('Please log in or register an account before booking a vehicle.', 'info');
      this.openAuthModal('login');
      return;
    }

    if (user.role === 'admin') {
      this.showToast('You are logged in as Administrator. To experience the customer booking flow, please switch to a Customer account.', 'warning');
    }

    const vehicles = DataStore.getVehicles();
    const car = vehicles.find(v => v.id === vehicleId);
    if (!car) {
      this.showToast('Vehicle not found.', 'error');
      return;
    }

    this.selectedVehicleForBooking = car;

    // Fill vehicle info in booking modal
    document.getElementById('booking-vehicle-id').value = car.id;
    document.getElementById('booking-vehicle-name').textContent = car.name;
    document.getElementById('booking-vehicle-category').textContent = car.category;
    document.getElementById('booking-vehicle-rate').textContent = `RM ${car.hourlyRate.toFixed(2)} / hour`;

    // Inherit hero dates if already set, or default
    const heroStart = document.getElementById('hero-start-time')?.value;
    const heroEnd = document.getElementById('hero-end-time')?.value;
    if (heroStart && heroEnd) {
      document.getElementById('booking-start-time').value = heroStart;
      document.getElementById('booking-end-time').value = heroEnd;
    }

    // Default package selections (Standard CDW, Basic Flex)
    const cdwStandard = document.getElementById('cdw_standard');
    const flexBasic = document.getElementById('flex_basic');
    if (cdwStandard) cdwStandard.checked = true;
    if (flexBasic) flexBasic.checked = true;

    this.updateBookingPriceSummary();

    const modal = document.getElementById('modal-booking');
    if (modal) modal.classList.add('active');
  },

  /**
   * Dynamically calculate and update booking price summary (BR-01, FR-03, FR-04)
   */
  updateBookingPriceSummary() {
    if (!this.selectedVehicleForBooking) return;

    const startStr = document.getElementById('booking-start-time').value;
    const endStr = document.getElementById('booking-end-time').value;
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

    const durationInfo = BookingService.calculateRentalDuration(startStr, endStr);

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
    const availability = BookingService.checkVehicleAvailability(this.selectedVehicleForBooking.id, startStr, endStr);
    if (overlapAlertEl) {
      if (!availability.isAvailable) {
        overlapAlertEl.textContent = availability.message;
        overlapAlertEl.style.display = 'block';
      } else {
        overlapAlertEl.style.display = 'none';
      }
    }

    // Compute pricing breakdown
    const pricing = BookingService.calculatePriceBreakdown(
      this.selectedVehicleForBooking.hourlyRate,
      durationInfo.billableHours,
      cdwId,
      flexId
    );

    if (basePriceEl) {
      basePriceEl.textContent = `${pricing.formattedBaseCharge} (${durationInfo.billableHours} hrs × RM ${this.selectedVehicleForBooking.hourlyRate.toFixed(2)})`;
    }
    if (cdwPriceEl) cdwPriceEl.textContent = pricing.formattedCdwCharge;
    if (flexPriceEl) flexPriceEl.textContent = pricing.formattedFlexCharge;
    if (totalPriceEl) totalPriceEl.textContent = pricing.formattedTotalPrice;
  },

  /**
   * Handle booking submission (FR-05)
   */
  handleBookingSubmit(e) {
    e.preventDefault();

    if (!this.selectedVehicleForBooking) return;

    const startDateTime = document.getElementById('booking-start-time').value;
    const endDateTime = document.getElementById('booking-end-time').value;
    const cdwInput = document.querySelector('input[name="booking-cdw"]:checked');
    const flexInput = document.querySelector('input[name="booking-flex"]:checked');

    if (!cdwInput || !flexInput) {
      this.showToast('Please select both a CDW protection package and a Flex package.', 'error');
      return;
    }

    const result = BookingService.createBooking({
      vehicleId: this.selectedVehicleForBooking.id,
      startDateTime,
      endDateTime,
      cdwId: cdwInput.value,
      flexId: flexInput.value
    });

    if (!result.success) {
      this.showToast(result.message, 'error');
      return;
    }

    // Close booking modal
    document.getElementById('modal-booking').classList.remove('active');

    this.showToast(result.message, 'success');
    this.updateBookingsBadges();

    // Immediately open Simulated Payment modal (FR-06)
    this.openSimulatedPaymentModal(result.booking.id);
  },

  /**
   * Open Simulated Payment Modal (FR-06)
   */
  openSimulatedPaymentModal(bookingId) {
    const booking = BookingService.getBooking(bookingId);
    if (!booking) {
      this.showToast('Booking not found.', 'error');
      return;
    }

    this.currentPaymentBookingId = booking.id;

    document.getElementById('pay-booking-ref').textContent = booking.id;
    document.getElementById('pay-car-name').textContent = booking.vehicleName;
    document.getElementById('pay-duration').textContent = `${booking.billableHours} Billable Hours (${BookingService.formatDateTime(booking.startDateTime)} → ${BookingService.formatDateTime(booking.endDateTime)})`;
    document.getElementById('pay-total-amount').textContent = BookingService.formatCurrency(booking.totalPrice);
    document.getElementById('pay-status-current').textContent = `Current Status: ${booking.bookingStatus} (Payment: ${booking.paymentStatus})`;

    const modal = document.getElementById('modal-payment');
    if (modal) modal.classList.add('active');
  },

  /**
   * Handle simulated payment trigger (FR-06, BR-04)
   * @param {'success' | 'fail'} outcome 
   */
  handleSimulatedPayment(outcome) {
    if (!this.currentPaymentBookingId) return;

    const result = BookingService.processSimulatedPayment(this.currentPaymentBookingId, outcome);

    // Close payment modal
    document.getElementById('modal-payment').classList.remove('active');

    if (result.success) {
      this.showToast(result.message, 'success');
    } else {
      this.showToast(result.message, 'warning');
    }

    this.updateBookingsBadges();

    // Navigate to customer bookings to view status
    this.switchView('my-bookings');
  },

  /**
   * Render customer personal bookings view (FR-07, BR-05)
   */
  renderMyBookingsList() {
    const user = Auth.getCurrentUser();
    const container = document.getElementById('my-bookings-list');
    if (!container) return;

    if (!user) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Authentication Required</h3>
          <p>Please log in to view your personal booking records.</p>
          <button class="btn btn-primary" onclick="App.openAuthModal('login')">Log In Now</button>
        </div>
      `;
      return;
    }

    const bookings = BookingService.getCustomerBookings(user.id);

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚗</div>
          <h3>No Bookings Yet</h3>
          <p>You haven't made any GoCar bookings yet. Browse our available fleet and hit the road!</p>
          <button class="btn btn-primary" onclick="App.switchView('vehicles')">Browse Vehicles</button>
        </div>
      `;
      return;
    }

    container.innerHTML = bookings.map(b => {
      // Use shared badge styling utilities
const payBadgeClass =
  BadgeUtils.getPaymentBadgeClass(b.paymentStatus);

const bookBadgeClass =
  BadgeUtils.getBookingBadgeClass(b.bookingStatus);

      const canPay = b.bookingStatus === 'Pending Payment';
      const canCancel = b.bookingStatus !== 'Cancelled';

      return `
        <div class="booking-card">
          <div class="booking-card-header">
            <div>
              <span class="booking-ref">${b.id}</span>
              <span class="booking-date">Created on ${BookingService.formatDateTime(b.createdAt)}</span>
            </div>
            <div class="badge-group">
              <span class="badge ${payBadgeClass}">Payment: ${b.paymentStatus}</span>
              <span class="badge ${bookBadgeClass}">${b.bookingStatus}</span>
            </div>
          </div>

          <div class="booking-card-body">
            <div class="booking-info-col">
              <h4>Vehicle</h4>
              <p class="strong">${b.vehicleName} (${b.vehicleCategory})</p>
              <p class="small text-muted">Transmission: ${b.vehicleTransmission} | Capacity: ${b.vehicleCapacity} Seats</p>
            </div>

            <div class="booking-info-col">
              <h4>Rental Period</h4>
              <p class="small"><strong>Start:</strong> ${BookingService.formatDateTime(b.startDateTime)}</p>
              <p class="small"><strong>End:</strong> ${BookingService.formatDateTime(b.endDateTime)}</p>
              <p class="small text-muted">${b.billableHours} Billable Hours</p>
            </div>

            <div class="booking-info-col">
              <h4>Selected Packages</h4>
              <p class="small"><strong>CDW:</strong> ${b.cdwPackage ? b.cdwPackage.name : 'N/A'} (RM ${b.cdwCharge.toFixed(2)})</p>
              <p class="small"><strong>Flex:</strong> ${b.flexPackage ? b.flexPackage.name : 'N/A'} (RM ${b.flexCharge.toFixed(2)})</p>
            </div>

            <div class="booking-info-col total-col">
              <h4>Total Price</h4>
              <p class="price-highlight">RM ${b.totalPrice.toFixed(2)}</p>
              <p class="small text-muted">Base: RM ${b.baseCharge.toFixed(2)}</p>
            </div>
          </div>

          <div class="booking-card-footer">
            <div class="footer-left">
              ${b.paymentDetails && b.paymentDetails.transactionId ? `
                <span class="txn-ref">Txn: ${b.paymentDetails.transactionId}</span>
              ` : ''}
            </div>
            <div class="btn-group">
              ${canPay ? `
                <button class="btn btn-primary btn-sm" onclick="App.openSimulatedPaymentModal('${b.id}')">
                  Simulate Payment
                </button>
              ` : ''}
              ${canCancel ? `
                <button class="btn btn-outline-danger btn-sm" onclick="App.handleCancelBooking('${b.id}')">
                  Cancel Booking
                </button>
              ` : ''}
              <button class="btn btn-secondary btn-sm" onclick="App.showBookingReceiptModal('${b.id}')">
                View Receipt
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Cancel booking handler
   */
  handleCancelBooking(bookingId) {
    if (!confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
      return;
    }

    const user = Auth.getCurrentUser();
    const result = BookingService.cancelBooking(bookingId, user);

    if (result.success) {
      this.showToast(result.message, 'success');
      this.updateBookingsBadges();
      this.renderCurrentView();
    } else {
      this.showToast(result.message, 'error');
    }
  },

  /**
   * Render Administrator Fleet Management (FR-08)
   */
  renderAdminFleet() {
    const container = document.getElementById('admin-fleet-table-body');
    if (!container) return;

    const vehicles = DataStore.getVehicles();
    const allBookings = DataStore.getBookings();
    const now = Date.now();

    container.innerHTML = vehicles.map(v => {
      // Count active bookings for this vehicle
      const activeBookings = allBookings.filter(b => {
        if (b.vehicleId !== v.id) return false;
        const isActive = b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending Payment';
        return isActive && new Date(b.endDateTime).getTime() >= now;
      });

      return `
        <tr>
          <td><strong>${v.id}</strong></td>
          <td>${v.name}</td>
          <td><span class="badge badge-secondary">${v.category}</span></td>
          <td>${v.capacity} Seats</td>
          <td>${v.transmission}</td>
          <td><strong>RM ${v.hourlyRate.toFixed(2)}</strong></td>
          <td>
            ${activeBookings.length > 0 
              ? `<span class="badge badge-warning">${activeBookings.length} Active Booking(s)</span>`
              : `<span class="badge badge-success">Available</span>`
            }
          </td>
          <td>
            <div class="btn-group">
              <button class="btn btn-secondary btn-sm" onclick="App.openVehicleFormModal('${v.id}')">Edit</button>
              <button class="btn btn-outline-danger btn-sm" onclick="App.handleAdminDeleteVehicle('${v.id}')">Remove</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Render Administrator All Bookings (FR-08)
   */
  renderAdminBookings() {
    const container = document.getElementById('admin-bookings-table-body');
    if (!container) return;

    const bookings = AdminService.getAllBookings();

    // Summary Statistics
    const totalCount = bookings.length;
    const confirmedCount = bookings.filter(b => b.bookingStatus === 'Confirmed').length;
    const pendingCount = bookings.filter(b => b.bookingStatus === 'Pending Payment').length;
    const cancelledCount = bookings.filter(b => b.bookingStatus === 'Cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.bookingStatus === 'Confirmed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const statTotal = document.getElementById('stat-total-bookings');
    const statConfirmed = document.getElementById('stat-confirmed-bookings');
    const statPending = document.getElementById('stat-pending-bookings');
    const statCancelled = document.getElementById('stat-cancelled-bookings');
    const statRevenue = document.getElementById('stat-total-revenue');

    if (statTotal) statTotal.textContent = totalCount;
    if (statConfirmed) statConfirmed.textContent = confirmedCount;
    if (statPending) statPending.textContent = pendingCount;
    if (statCancelled) statCancelled.textContent = cancelledCount;
    if (statRevenue) statRevenue.textContent = `RM ${totalRevenue.toFixed(2)}`;

    if (bookings.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding: 2rem;">No bookings found across the system.</td>
        </tr>
      `;
      return;
    }

    container.innerHTML = bookings.map(b => {
      let bookBadgeClass = 'badge-warning';
      if (b.bookingStatus === 'Confirmed') bookBadgeClass = 'badge-success';
      if (b.bookingStatus === 'Cancelled') bookBadgeClass = 'badge-secondary';

      let payBadgeClass = 'badge-warning';
      if (b.paymentStatus === 'Successful') payBadgeClass = 'badge-success';
      if (b.paymentStatus === 'Failed') payBadgeClass = 'badge-danger';

      return `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td>
            <div>${b.customerName}</div>
            <div class="small text-muted">${b.customerEmail}</div>
          </td>
          <td>${b.vehicleName} (${b.vehicleId})</td>
          <td>
            <div class="small">${BookingService.formatDateTime(b.startDateTime)}</div>
            <div class="small text-muted">to ${BookingService.formatDateTime(b.endDateTime)} (${b.billableHours} hrs)</div>
          </td>
          <td><strong>RM ${b.totalPrice.toFixed(2)}</strong></td>
          <td><span class="badge ${payBadgeClass}">${b.paymentStatus}</span></td>
          <td><span class="badge ${bookBadgeClass}">${b.bookingStatus}</span></td>
          <td>
            <select class="admin-status-select" onchange="App.handleAdminStatusChange('${b.id}', this.value)">
              <option value="Pending Payment" ${b.bookingStatus === 'Pending Payment' ? 'selected' : ''}>Pending Payment</option>
              <option value="Confirmed" ${b.bookingStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Cancelled" ${b.bookingStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Handle Admin Booking Status Update (FR-08)
   */
  handleAdminStatusChange(bookingId, newStatus) {
    try {
      const result = AdminService.updateBookingStatus(bookingId, newStatus);
      if (result.success) {
        this.showToast(result.message, 'success');
        this.updateBookingsBadges();
        this.renderAdminBookings();
      } else {
        this.showToast(result.message, 'error');
      }
    } catch (e) {
      this.showToast(e.message, 'error');
    }
  },

  /**
   * Open Admin Vehicle Form Modal (Add / Edit)
   */
  openVehicleFormModal(vehicleId = null) {
    this.editingVehicleId = vehicleId;
    const modal = document.getElementById('modal-admin-vehicle');
    const title = document.getElementById('modal-admin-vehicle-title');
    const idInput = document.getElementById('admin-car-id');
    const nameInput = document.getElementById('admin-car-name');
    const catInput = document.getElementById('admin-car-category');
    const capInput = document.getElementById('admin-car-capacity');
    const transInput = document.getElementById('admin-car-transmission');
    const rateInput = document.getElementById('admin-car-rate');
    const descInput = document.getElementById('admin-car-description');

    if (vehicleId) {
      // Edit mode
      const vehicles = DataStore.getVehicles();
      const car = vehicles.find(v => v.id === vehicleId);
      if (!car) return;

      title.textContent = `Edit Vehicle: ${car.name} (${car.id})`;
      idInput.value = car.id;
      idInput.readOnly = true;
      nameInput.value = car.name;
      catInput.value = car.category;
      capInput.value = car.capacity;
      transInput.value = car.transmission;
      rateInput.value = car.hourlyRate;
      descInput.value = car.description || '';
    } else {
      // Add mode
      title.textContent = 'Add New Vehicle to Fleet';
      const vehicles = DataStore.getVehicles();
      idInput.value = `CAR00${vehicles.length + 1}`;
      idInput.readOnly = false;
      nameInput.value = '';
      catInput.value = 'Compact';
      capInput.value = '5';
      transInput.value = 'Automatic';
      rateInput.value = '10.00';
      descInput.value = '';
    }

    modal.classList.add('active');
  },

  /**
   * Handle Admin Vehicle Add/Edit Form submission
   */
  handleAdminVehicleSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('admin-car-id').value;
    const name = document.getElementById('admin-car-name').value;
    const category = document.getElementById('admin-car-category').value;
    const capacity = document.getElementById('admin-car-capacity').value;
    const transmission = document.getElementById('admin-car-transmission').value;
    const hourlyRate = document.getElementById('admin-car-rate').value;
    const description = document.getElementById('admin-car-description').value;

    let result;
    if (this.editingVehicleId) {
      result = AdminService.editVehicle(this.editingVehicleId, {
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
      this.showToast(result.message, 'success');
      document.getElementById('modal-admin-vehicle').classList.remove('active');
      this.renderAdminFleet();
      this.renderVehiclesList();
    } else {
      this.showToast(result.message, 'error');
    }
  },

  /**
   * Handle vehicle deletion with active booking enforcement (FR-08)
   */
  handleAdminDeleteVehicle(vehicleId) {
    if (!confirm(`Are you sure you want to remove vehicle ${vehicleId} from the fleet?`)) {
      return;
    }

    try {
      const result = AdminService.removeVehicle(vehicleId);
      if (result.success) {
        this.showToast(result.message, 'success');
        this.renderAdminFleet();
        this.renderVehiclesList();
      } else {
        this.showToast(result.message, 'error');
      }
    } catch (e) {
      this.showToast(e.message, 'error');
    }
  },

  /**
   * Open vehicle details modal
   */
  openVehicleDetailsModal(vehicleId) {
    const vehicles = DataStore.getVehicles();
    const car = vehicles.find(v => v.id === vehicleId);
    if (!car) return;

    document.getElementById('modal-details-name').textContent = car.name;
    document.getElementById('modal-details-category').textContent = car.category;
    document.getElementById('modal-details-rate').textContent = `RM ${car.hourlyRate.toFixed(2)} / hour`;
    document.getElementById('modal-details-capacity').textContent = `${car.capacity} Passengers`;
    document.getElementById('modal-details-transmission').textContent = car.transmission;
    document.getElementById('modal-details-desc').textContent = car.description || 'Reliable and comfortable car sharing vehicle.';

    const imageWrap = document.getElementById('modal-details-image');
    if (imageWrap) {
      imageWrap.innerHTML = this.getCarSvgIllustration(car.image, car.name);
    }

    const btnBookFromDetails = document.getElementById('btn-details-book-now');
    if (btnBookFromDetails) {
      btnBookFromDetails.onclick = () => {
        document.getElementById('modal-vehicle-details').classList.remove('active');
        this.openBookingModal(car.id);
      };
    }

    document.getElementById('modal-vehicle-details').classList.add('active');
  },

  /**
   * Show booking receipt summary modal
   */
  showBookingReceiptModal(bookingId) {
    const booking = BookingService.getBooking(bookingId);
    if (!booking) return;

    document.getElementById('receipt-ref').textContent = booking.id;
    document.getElementById('receipt-date').textContent = BookingService.formatDateTime(booking.createdAt);
    document.getElementById('receipt-customer').textContent = `${booking.customerName} (${booking.customerEmail})`;
    document.getElementById('receipt-car').textContent = `${booking.vehicleName} (${booking.vehicleCategory})`;
    document.getElementById('receipt-period').textContent = `${BookingService.formatDateTime(booking.startDateTime)} to ${BookingService.formatDateTime(booking.endDateTime)}`;
    document.getElementById('receipt-hours').textContent = `${booking.billableHours} billable hours`;
    document.getElementById('receipt-base').textContent = BookingService.formatCurrency(booking.baseCharge);
    document.getElementById('receipt-cdw').textContent = `${booking.cdwPackage ? booking.cdwPackage.name : 'N/A'}: ${BookingService.formatCurrency(booking.cdwCharge)}`;
    document.getElementById('receipt-flex').textContent = `${booking.flexPackage ? booking.flexPackage.name : 'N/A'}: ${BookingService.formatCurrency(booking.flexCharge)}`;
    document.getElementById('receipt-total').textContent = BookingService.formatCurrency(booking.totalPrice);
    document.getElementById('receipt-status').textContent = `Booking: ${booking.bookingStatus} | Payment: ${booking.paymentStatus}`;

    document.getElementById('modal-receipt').classList.add('active');
  },

  /**
   * Authentication Modal management
   */
  openAuthModal(tab = 'login') {
    this.switchAuthTab(tab);
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.add('active');
  },

  switchAuthTab(tab) {
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tab === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
    } else {
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
      formLogin.style.display = 'none';
      formRegister.style.display = 'block';
    }
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const result = Auth.login(email, password);

    if (result.success) {
      this.showToast(result.message, 'success');
      document.getElementById('modal-auth').classList.remove('active');
      this.updateUserSessionUI();

      if (result.user.role === 'admin') {
        this.switchView('admin-fleet');
      } else {
        this.switchView('vehicles');
      }
    } else {
      this.showToast(result.message, 'error');
    }
  },

  handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const result = Auth.register({ name, email, password });

    if (result.success) {
      this.showToast(result.message, 'success');
      document.getElementById('modal-auth').classList.remove('active');
      this.updateUserSessionUI();
      this.switchView('vehicles');
    } else {
      this.showToast(result.message, 'error');
    }
  },

  handleLogout() {
    Auth.logout();
    this.showToast('You have been logged out.', 'info');
    this.updateUserSessionUI();
    this.switchView('vehicles');
  },

  /**
   * Reset system demo data (BR-06)
   */
  handleResetDemoData() {
    if (!confirm('Reset all demo data back to default baseline seed data? This will restore the initial 4 vehicles and demo users, and clear existing reservations.')) {
      return;
    }

    DataStore.resetToDefaults();
    this.showToast('System data successfully restored to default seed state.', 'success');
    this.updateUserSessionUI();
    this.renderCurrentView();
  },

  /**
   * Toast notification display
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-indicator"></span>
        <span class="toast-message">${message}</span>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 400);
    }, 4500);
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
