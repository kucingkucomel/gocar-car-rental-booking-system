/**
 * Main Application Orchestrator
 * Bootstraps repositories, services, views, navigation, and client-side routing.
 */

import { NavigationComponent } from './components/navigation.js';
import { notifications } from './components/notifications.js';
import { AuthView } from './views/auth-view.js';
import { VehicleView } from './views/vehicle-view.js';
import { BookingView } from './views/booking-view.js';
import { HistoryView } from './views/history-view.js';
import { AdminView } from './views/admin-view.js';
import { authService } from './services/auth-service.js';
import { bookingService } from './services/booking-service.js';
import { $ } from './utils/dom-utils.js';

class App {
  constructor() {
    this.currentRoute = 'vehicles';
    this.navComponent = null;
    this.views = {};
  }

  /**
   * Initializes application components and router.
   */
  init() {
    const headerEl = $('#app-header');
    const mainEl = $('#app-main');

    if (!headerEl || !mainEl) {
      console.error('[App] Required layout containers #app-header or #app-main missing.');
      return;
    }

    // Initialize Navigation Component
    this.navComponent = new NavigationComponent(headerEl, (route, params) => {
      this.navigate(route, params);
    });
    this.navComponent.init();

    // Initialize Views
    this.views = {
      vehicles: new VehicleView(mainEl, (route, params) => this.navigate(route, params)),
      booking: new BookingView(mainEl, (route, params) => this.navigate(route, params)),
      history: new HistoryView(mainEl, (route, params) => this.navigate(route, params)),
      admin: new AdminView(mainEl, (route, params) => this.navigate(route, params)),
      auth: new AuthView(mainEl, (route, params) => this.navigate(route, params))
    };

    // Listen to browser hash changes
    window.addEventListener('hashchange', () => this._handleHashRoute());

    // Route to initial URL hash
    this._handleHashRoute();

    console.log('[GoCar App] CSEB5213 Codebase B application initialized successfully.');
  }

  /**
   * Navigates programmatically to a route with optional parameters.
   * @param {string} route
   * @param {Object} [params={}]
   */
  navigate(route, params = {}) {
    let hash = `#${route}`;
    const queryParts = [];
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      }
    }
    if (queryParts.length > 0) {
      hash += `?${queryParts.join('&')}`;
    }

    window.location.hash = hash;
  }

  /**
   * Handles hash changes and renders the matching view.
   * @private
   */
  _handleHashRoute() {
    const rawHash = window.location.hash.slice(1) || 'vehicles';
    const [routePart, queryPart] = rawHash.split('?');
    const route = routePart.toLowerCase();

    const params = {};
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      for (const [key, val] of searchParams.entries()) {
        params[key] = val;
      }
    }

    // Auth gate for admin route
    if (route === 'admin' && !authService.isAdmin()) {
      notifications.warning('Administrator credentials required to access the admin portal.');
    }

    // Pass parameters to booking view if needed
    if (route === 'booking') {
      if (params.vehicleId) {
        this.views.booking.setVehicleId(params.vehicleId);
      }
      if (params.payBookingRef) {
        const existing = bookingService.getBooking(params.payBookingRef);
        if (existing) {
          this.views.booking.createdBooking = existing;
          this.views.booking.paymentResult = null;
        }
      }
    }

    const view = this.views[route] || this.views.vehicles;
    this.currentRoute = this.views[route] ? route : 'vehicles';

    if (this.navComponent) {
      this.navComponent.setActiveRoute(this.currentRoute);
    }

    view.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
