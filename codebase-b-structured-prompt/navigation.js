/**
 * Navigation Component
 * Renders the top application header, branding, dynamic role-based navigation links,
 * and user session controls.
 */

import { authService } from '../services/auth-service.js';
import { adminService } from '../services/admin-service.js';
import { notifications } from './notifications.js';
import { $, createElement } from '../utils/dom-utils.js';

export class NavigationComponent {
  /**
   * @param {HTMLElement} container
   * @param {Function} onNavigate
   */
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this._unsubscribeAuth = null;
  }

  /**
   * Initializes and renders navigation.
   */
  init() {
    this.render();
    this._unsubscribeAuth = authService.onAuthStateChanged(() => {
      this.render();
    });
  }

  /**
   * Destroys listeners.
   */
  destroy() {
    if (this._unsubscribeAuth) {
      this._unsubscribeAuth();
    }
  }

  /**
   * Renders the navigation bar HTML and attaches event listeners.
   */
  render() {
    const user = authService.getCurrentUser();
    const isAdmin = authService.isAdmin();

    this.container.innerHTML = `
      <nav class="navbar" aria-label="Main Navigation">
        <div class="nav-brand">
          <a href="#vehicles" class="brand-link" id="nav-brand-logo">
            <span class="brand-badge">GoCar</span>
            <span class="brand-sub">Rental Prototype</span>
          </a>
        </div>

        <button class="nav-toggle" id="nav-toggle-btn" aria-expanded="false" aria-label="Toggle navigation menu">
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
        </button>

        <div class="nav-menu" id="nav-menu">
          <ul class="nav-links">
            <li>
              <a href="#vehicles" class="nav-link" id="nav-link-vehicles">
                <span class="nav-icon">🚗</span> Browse Fleet
              </a>
            </li>
            ${user ? `
              <li>
                <a href="#history" class="nav-link" id="nav-link-history">
                  <span class="nav-icon">📋</span> My Bookings
                </a>
              </li>
            ` : ''}
            ${isAdmin ? `
              <li>
                <a href="#admin" class="nav-link nav-link-admin" id="nav-link-admin">
                  <span class="nav-icon">⚙️</span> Admin Portal
                </a>
              </li>
            ` : ''}
          </ul>

          <div class="nav-actions">
            <button type="button" class="btn btn-outline-danger btn-sm" id="btn-reset-seed" title="Reset sample vehicles, users, and bookings">
              <span>↻</span> Reset Seed Data
            </button>

            ${user ? `
              <div class="user-profile-badge">
                <span class="user-role-tag ${isAdmin ? 'role-admin' : 'role-customer'}">
                  ${isAdmin ? 'Admin' : 'Customer'}
                </span>
                <span class="user-display-name" title="${user.email}">${user.name}</span>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-logout">
                  Logout
                </button>
              </div>
            ` : `
              <a href="#auth" class="btn btn-primary btn-sm" id="btn-nav-login">
                Log In / Register
              </a>
            `}
          </div>
        </div>
      </nav>
    `;

    this._attachListeners();
  }

  /**
   * Attaches event handlers to navigation elements.
   * @private
   */
  _attachListeners() {
    const toggleBtn = $('#nav-toggle-btn', this.container);
    const navMenu = $('#nav-menu', this.container);

    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', String(!expanded));
        navMenu.classList.toggle('nav-menu-open');
      });
    }

    const logoutBtn = $('#btn-logout', this.container);
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        authService.logout();
        notifications.info('You have been logged out.');
        if (typeof this.onNavigate === 'function') {
          this.onNavigate('vehicles');
        }
      });
    }

    const resetBtn = $('#btn-reset-seed', this.container);
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const confirmed = window.confirm(
          'Reset demo data?\n\nThis will restore the 4 default seed vehicles, seed users, and clear existing reservations for testing.'
        );
        if (confirmed) {
          adminService.resetSystemDemoData();
          notifications.success('Application demo data has been reset to initial seed values.');
          if (typeof this.onNavigate === 'function') {
            this.onNavigate('vehicles');
          } else {
            window.location.hash = '#vehicles';
            window.location.reload();
          }
        }
      });
    }
  }

  /**
   * Highlights the active route in navigation.
   * @param {string} route
   */
  setActiveRoute(route) {
    const links = this.container.querySelectorAll('.nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${route}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
