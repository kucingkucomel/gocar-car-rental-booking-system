/**
 * GoCar Car Rental Booking System - Authentication & Session Module
 * Implements FR-01 (Registration, Login, Logout) and BR-05 (Role Restrictions)
 */

const Auth = {
  /**
   * Helper to validate email format using standard RFC compliant regex
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  },

  /**
   * Register a new customer
   * @param {Object} param0 { name, email, password }
   * @returns {Object} { success: boolean, message: string, user?: Object }
   */
  register({ name, email, password }) {
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    // Validation 1: Required fields
    if (!trimmedName) {
      return { success: false, message: 'Full name is required.' };
    }
    if (trimmedName.length < 2) {
      return { success: false, message: 'Name must be at least 2 characters.' };
    }
    if (!trimmedEmail) {
      return { success: false, message: 'Email address is required.' };
    }
    // Validation 2: Email format
    if (!this.isValidEmail(trimmedEmail)) {
      return { success: false, message: 'Please enter a valid email address (e.g., user@example.com).' };
    }
    // Validation 3: Password length
    if (!trimmedPassword || trimmedPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const users = DataStore.getUsers();

    // Validation 4: Duplicate email check (case-insensitive)
    const existingUser = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existingUser) {
      return { success: false, message: `An account with email "${trimmedEmail}" is already registered. Please log in instead.` };
    }

    // Create new customer account
    const newUser = {
      id: 'USR' + Date.now().toString().slice(-6),
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: 'customer',
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
   * @returns {Object} { success: boolean, message: string, user?: Object }
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

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return DataStore.getCurrentUser();
  },

  /**
   * Check if current user is logged in
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Check if current user has administrator role
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'admin';
  }
};
