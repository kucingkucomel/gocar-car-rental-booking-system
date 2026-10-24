/**
 * GoCar Car Rental Booking System - Authentication & Session Service
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Implements FR-01 (Registration, Login, Session Management) and BR-05 (Role Isolation)
 * using named constants and strict input sanitization.
 */

const AuthService = {
  /**
   * RFC-compliant email format validation
   * @param {string} email 
   * @returns {boolean}
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  },

  /**
   * Register a new customer
   * @param {{ name: string, email: string, password: string }} credentials
   * @returns {{ success: boolean, message: string, user?: Object }}
   */
  register({ name, email, password }) {
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    const minName = typeof VALIDATION_RULES !== 'undefined' ? VALIDATION_RULES.MIN_NAME_LENGTH : 2;
    const minPass = typeof VALIDATION_RULES !== 'undefined' ? VALIDATION_RULES.MIN_PASSWORD_LENGTH : 6;

    if (!trimmedName) {
      return { success: false, message: 'Full name is required.' };
    }
    if (trimmedName.length < minName) {
      return { success: false, message: `Name must be at least ${minName} characters.` };
    }
    if (!trimmedEmail) {
      return { success: false, message: 'Email address is required.' };
    }
    if (!this.isValidEmail(trimmedEmail)) {
      return { success: false, message: 'Please enter a valid email address (e.g., user@example.com).' };
    }
    if (!trimmedPassword || trimmedPassword.length < minPass) {
      return { success: false, message: `Password must be at least ${minPass} characters long.` };
    }

    const users = DataStore.getUsers();

    // Duplicate email check (case-insensitive)
    const existingUser = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existingUser) {
      return {
        success: false,
        message: `An account with email "${trimmedEmail}" is already registered. Please log in instead.`
      };
    }

    const customerRole = typeof USER_ROLES !== 'undefined' ? USER_ROLES.CUSTOMER : 'customer';

    const newUser = {
      id: 'USR' + Date.now().toString().slice(-6),
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: customerRole,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    DataStore.saveUsers(users);

    // Auto-login upon successful registration
    DataStore.setCurrentUser(newUser);

    return {
      success: true,
      message: `Account created successfully! Welcome, ${newUser.name}.`,
      user: newUser
    };
  },

  /**
   * Log in user with credentials
   * @param {string} email 
   * @param {string} password 
   * @returns {{ success: boolean, message: string, user?: Object }}
   */
  login(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, message: 'Please provide both email and password.' };
    }

    const users = DataStore.getUsers();
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword);

    if (!user) {
      return { success: false, message: 'Invalid email or password. Please try again.' };
    }

    DataStore.setCurrentUser(user);

    return {
      success: true,
      message: `Welcome back, ${user.name}!`,
      user
    };
  },

  /**
   * Log out currently authenticated user
   */
  logout() {
    DataStore.setCurrentUser(null);
    return { success: true, message: 'You have been logged out successfully.' };
  },

  getCurrentUser() {
    return DataStore.getCurrentUser();
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    const adminRole = typeof USER_ROLES !== 'undefined' ? USER_ROLES.ADMIN : 'admin';
    return user !== null && user.role === adminRole;
  }
};

// Global backward compatibility aliases
const Auth = AuthService;

if (typeof globalThis !== 'undefined') {
  globalThis.AuthService = AuthService;
  globalThis.Auth = Auth;
}
