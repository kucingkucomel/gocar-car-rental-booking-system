/**
 * GoCar Car Rental Booking System - Authentication View Module
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Manages authentication modal dialogs, tab switching, demo autofill,
 * and header session status rendering.
 */

const AuthView = {
  openModal(tab = 'login') {
    this.switchTab(tab);
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.remove('active');
  },

  switchTab(tab) {
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tab === 'login') {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
    } else {
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabRegister) tabRegister.classList.add('active');
      if (formLogin) formLogin.style.display = 'none';
      if (formRegister) formRegister.style.display = 'block';
    }
  },

  updateSessionUI() {
    const user = AuthService.getCurrentUser();
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

      adminNavLinks.forEach(el => el.style.display = user.role === 'admin' ? 'inline-block' : 'none');
      customerNavLinks.forEach(el => el.style.display = user.role === 'customer' ? 'inline-block' : 'none');
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (authNav) authNav.style.display = 'none';
      adminNavLinks.forEach(el => el.style.display = 'none');
      customerNavLinks.forEach(el => el.style.display = 'none');
    }
  },

  bindEvents(onLoginSuccess, onRegisterSuccess, onLogout) {
    const btnOpenLogin = document.getElementById('btn-open-login');
    const btnOpenRegister = document.getElementById('btn-open-register');
    const btnLogout = document.getElementById('btn-logout');

    if (btnOpenLogin) {
      btnOpenLogin.addEventListener('click', () => this.openModal('login'));
    }
    if (btnOpenRegister) {
      btnOpenRegister.addEventListener('click', () => this.openModal('register'));
    }
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        AuthService.logout();
        NotificationUI.showToast('You have been logged out.', 'info');
        this.updateSessionUI();
        if (typeof onLogout === 'function') onLogout();
      });
    }

    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => this.switchTab('login'));
      tabRegister.addEventListener('click', () => this.switchTab('register'));
    }

    // Demo Autofill Buttons
    const btnAutofillCustomer = document.getElementById('btn-autofill-customer');
    const btnAutofillAdmin = document.getElementById('btn-autofill-admin');
    if (btnAutofillCustomer) {
      btnAutofillCustomer.addEventListener('click', () => {
        const emailEl = document.getElementById('login-email');
        const passEl = document.getElementById('login-password');
        if (emailEl) emailEl.value = 'customer@gocar.demo';
        if (passEl) passEl.value = 'password123';
      });
    }
    if (btnAutofillAdmin) {
      btnAutofillAdmin.addEventListener('click', () => {
        const emailEl = document.getElementById('login-email');
        const passEl = document.getElementById('login-password');
        if (emailEl) emailEl.value = 'admin@gocar.demo';
        if (passEl) passEl.value = 'admin123';
      });
    }

    // Form Submissions
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        const result = AuthService.login(email, password);

        if (result.success) {
          NotificationUI.showToast(result.message, 'success');
          this.closeModal();
          this.updateSessionUI();
          if (typeof onLoginSuccess === 'function') onLoginSuccess(result.user);
        } else {
          NotificationUI.showToast(result.message, 'error');
        }
      });
    }

    const formRegister = document.getElementById('form-register');
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name')?.value;
        const email = document.getElementById('reg-email')?.value;
        const password = document.getElementById('reg-password')?.value;
        const result = AuthService.register({ name, email, password });

        if (result.success) {
          NotificationUI.showToast(result.message, 'success');
          this.closeModal();
          this.updateSessionUI();
          if (typeof onRegisterSuccess === 'function') onRegisterSuccess(result.user);
        } else {
          NotificationUI.showToast(result.message, 'error');
        }
      });
    }
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.AuthView = AuthView;
}
