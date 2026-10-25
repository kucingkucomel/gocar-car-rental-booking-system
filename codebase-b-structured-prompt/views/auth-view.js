/**
 * Authentication View
 * Handles user registration, login, and demo quick-credential actions according to FR-01.
 */

import { authService } from '../services/auth-service.js';
import { notifications } from '../components/notifications.js';
import { $, $$ } from '../utils/dom-utils.js';
import { ROLES } from '../config/constants.js';

export class AuthView {
  /**
   * @param {HTMLElement} container
   * @param {Function} onNavigate
   */
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.activeTab = 'login'; // 'login' | 'register'
  }

  /**
   * Renders the authentication screen.
   */
  render() {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      this.container.innerHTML = `
        <div class="auth-card">
          <h2>Already Signed In</h2>
          <p>You are currently logged in as <strong>${currentUser.name}</strong> (${currentUser.email}).</p>
          <div class="button-group">
            <button class="btn btn-primary" id="btn-goto-vehicles">Browse Vehicles</button>
            <button class="btn btn-outline-secondary" id="btn-auth-logout">Logout</button>
          </div>
        </div>
      `;

      $('#btn-goto-vehicles', this.container)?.addEventListener('click', () => {
        this.onNavigate('vehicles');
      });
      $('#btn-auth-logout', this.container)?.addEventListener('click', () => {
        authService.logout();
        this.render();
      });
      return;
    }

    this.container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-tabs" role="tablist">
            <button type="button" class="auth-tab ${this.activeTab === 'login' ? 'active' : ''}" id="tab-login" role="tab">
              Sign In
            </button>
            <button type="button" class="auth-tab ${this.activeTab === 'register' ? 'active' : ''}" id="tab-register" role="tab">
              Register Demo Account
            </button>
          </div>

          <!-- Quick Fill Demo Bar -->
          <div class="demo-quick-bar">
            <span class="quick-title">Quick Demo Logins:</span>
            <button type="button" class="btn btn-xs btn-outline-primary" id="btn-quick-customer">
              Demo Customer
            </button>
            <button type="button" class="btn btn-xs btn-outline-warning" id="btn-quick-admin">
              Demo Admin
            </button>
          </div>

          <!-- Login Form -->
          <form id="form-login" class="auth-form ${this.activeTab === 'login' ? '' : 'is-hidden'}">
            <h3 class="form-title">Welcome to GoCar</h3>
            <p class="form-subtitle">Enter your demo credentials to continue.</p>

            <div class="form-group">
              <label for="login-email">Email Address</label>
              <input type="email" id="login-email" class="form-control" placeholder="customer@demo.com" required autocomplete="email" />
            </div>

            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" class="form-control" placeholder="••••••••" required autocomplete="current-password" />
            </div>

            <div class="form-error" id="login-error" hidden></div>

            <button type="submit" class="btn btn-primary btn-block" id="btn-submit-login">
              Sign In
            </button>
          </form>

          <!-- Register Form -->
          <form id="form-register" class="auth-form ${this.activeTab === 'register' ? '' : 'is-hidden'}">
            <h3 class="form-title">Create Demo Account</h3>
            <p class="form-subtitle">Register a simulated account to book vehicles.</p>

            <div class="form-group">
              <label for="reg-name">Full Name</label>
              <input type="text" id="reg-name" class="form-control" placeholder="e.g. Ali bin Ahmad" required />
            </div>

            <div class="form-group">
              <label for="reg-email">Email Address</label>
              <input type="email" id="reg-email" class="form-control" placeholder="e.g. ali@example.my" required autocomplete="email" />
            </div>

            <div class="form-group">
              <label for="reg-password">Password (min 6 characters)</label>
              <input type="password" id="reg-password" class="form-control" placeholder="••••••••" required autocomplete="new-password" />
            </div>

            <div class="form-group">
              <label for="reg-role">Demo Account Role</label>
              <select id="reg-role" class="form-control">
                <option value="${ROLES.CUSTOMER}">Customer (Default)</option>
                <option value="${ROLES.ADMIN}">Administrator (Demo fleet manager)</option>
              </select>
            </div>

            <div class="form-error" id="reg-error" hidden></div>

            <button type="submit" class="btn btn-primary btn-block" id="btn-submit-register">
              Register &amp; Continue
            </button>
          </form>

          <div class="auth-footer-notice">
            <small>🔒 Educational prototype. No real identities or passwords are encrypted or sent to a remote server.</small>
          </div>
        </div>
      </div>
    `;

    this._attachListeners();
  }

  /**
   * Attaches event listeners to authentication forms.
   * @private
   */
  _attachListeners() {
    const tabLogin = $('#tab-login', this.container);
    const tabRegister = $('#tab-register', this.container);
    const formLogin = $('#form-login', this.container);
    const formRegister = $('#form-register', this.container);

    tabLogin?.addEventListener('click', () => {
      this.activeTab = 'login';
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.remove('is-hidden');
      formRegister.classList.add('is-hidden');
    });

    tabRegister?.addEventListener('click', () => {
      this.activeTab = 'register';
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.remove('is-hidden');
      formLogin.classList.add('is-hidden');
    });

    // Quick demo autofill buttons
    $('#btn-quick-customer', this.container)?.addEventListener('click', () => {
      this.activeTab = 'login';
      tabLogin.click();
      $('#login-email', this.container).value = 'customer@demo.com';
      $('#login-password', this.container).value = 'Password123';
      notifications.info('Filled credentials for Demo Customer.');
    });

    $('#btn-quick-admin', this.container)?.addEventListener('click', () => {
      this.activeTab = 'login';
      tabLogin.click();
      $('#login-email', this.container).value = 'admin@gocar.my';
      $('#login-password', this.container).value = 'AdminPassword123';
      notifications.info('Filled credentials for Demo Admin.');
    });

    // Handle Login submission
    formLogin?.addEventListener('submit', (e) => {
      e.preventDefault();
      const errBox = $('#login-error', this.container);
      errBox.hidden = true;

      const email = $('#login-email', this.container).value;
      const password = $('#login-password', this.container).value;

      try {
        const user = authService.login(email, password);
        notifications.success(`Welcome back, ${user.name}!`);
        if (user.isAdmin()) {
          this.onNavigate('admin');
        } else {
          this.onNavigate('vehicles');
        }
      } catch (err) {
        errBox.textContent = err.message;
        errBox.hidden = false;
      }
    });

    // Handle Register submission
    formRegister?.addEventListener('submit', (e) => {
      e.preventDefault();
      const errBox = $('#reg-error', this.container);
      errBox.hidden = true;

      const name = $('#reg-name', this.container).value;
      const email = $('#reg-email', this.container).value;
      const password = $('#reg-password', this.container).value;
      const role = $('#reg-role', this.container).value;

      try {
        const user = authService.register({ name, email, password, role });
        notifications.success(`Account created successfully! Welcome, ${user.name}.`);
        if (user.isAdmin()) {
          this.onNavigate('admin');
        } else {
          this.onNavigate('vehicles');
        }
      } catch (err) {
        errBox.textContent = err.message;
        errBox.hidden = false;
      }
    });
  }
}
