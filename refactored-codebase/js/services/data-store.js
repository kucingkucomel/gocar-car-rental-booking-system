/**
 * GoCar Car Rental Booking System - Data Persistence Service
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Encapsulates localStorage persistence with defensive exception handling,
 * seed data fallback, and session management.
 */

const DataStore = {
  // In-memory fallback if localStorage is disabled or throws quota errors
  _memoryFallback: {},

  _getItem(key) {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[DataStore] LocalStorage read failed for key "${key}", using in-memory store:`, e);
    }
    return this._memoryFallback[key] || null;
  },

  _setItem(key, value) {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[DataStore] LocalStorage write failed for key "${key}", falling back to memory:`, e);
    }
    this._memoryFallback[key] = value;
  },

  _removeItem(key) {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[DataStore] LocalStorage remove failed for key "${key}":`, e);
    }
    delete this._memoryFallback[key];
  },

  /**
   * Initializes storage with default seed data if not present.
   */
  init() {
    const keys = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS : {
      VEHICLES: 'gocar_vehicles',
      USERS: 'gocar_users',
      BOOKINGS: 'gocar_bookings',
      CURRENT_USER: 'gocar_current_user'
    };

    if (!this._getItem(keys.VEHICLES)) {
      this.saveVehicles(typeof DEFAULT_VEHICLES !== 'undefined' ? DEFAULT_VEHICLES : []);
    }
    if (!this._getItem(keys.USERS)) {
      this.saveUsers(typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);
    }
    if (!this._getItem(keys.BOOKINGS)) {
      this.saveBookings([]);
    }
  },

  getVehicles() {
    try {
      const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.VEHICLES : 'gocar_vehicles';
      const data = this._getItem(key);
      return data ? JSON.parse(data) : (typeof DEFAULT_VEHICLES !== 'undefined' ? DEFAULT_VEHICLES : []);
    } catch (e) {
      console.error('[DataStore] Error parsing vehicles data:', e);
      return typeof DEFAULT_VEHICLES !== 'undefined' ? DEFAULT_VEHICLES : [];
    }
  },

  saveVehicles(vehicles) {
    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.VEHICLES : 'gocar_vehicles';
    this._setItem(key, JSON.stringify(vehicles));
  },

  getUsers() {
    try {
      const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.USERS : 'gocar_users';
      const data = this._getItem(key);
      return data ? JSON.parse(data) : (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);
    } catch (e) {
      console.error('[DataStore] Error parsing users data:', e);
      return typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : [];
    }
  },

  saveUsers(users) {
    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.USERS : 'gocar_users';
    this._setItem(key, JSON.stringify(users));
  },

  getBookings() {
    try {
      const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.BOOKINGS : 'gocar_bookings';
      const data = this._getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[DataStore] Error parsing bookings data:', e);
      return [];
    }
  },

  saveBookings(bookings) {
    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.BOOKINGS : 'gocar_bookings';
    this._setItem(key, JSON.stringify(bookings));
  },

  getCurrentUser() {
    try {
      const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.CURRENT_USER : 'gocar_current_user';
      const data = this._getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[DataStore] Error reading current user:', e);
      return null;
    }
  },

  setCurrentUser(user) {
    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.CURRENT_USER : 'gocar_current_user';
    if (user) {
      this._setItem(key, JSON.stringify(user));
    } else {
      this._removeItem(key);
    }
  },

  /**
   * Resets all storage back to default seed state (BR-06, Criterion 14)
   */
  resetToDefaults() {
    const defaultVehicles = typeof DEFAULT_VEHICLES !== 'undefined' ? DEFAULT_VEHICLES : [];
    const defaultUsers = typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : [];

    this.saveVehicles(defaultVehicles);
    this.saveUsers(defaultUsers);
    this.saveBookings([]);

    const current = this.getCurrentUser();
    if (current) {
      const exists = defaultUsers.find(u => u.email === current.email);
      if (!exists) {
        this.setCurrentUser(null);
      }
    }
    return true;
  }
};

// Initialize immediately
DataStore.init();

if (typeof globalThis !== 'undefined') {
  globalThis.DataStore = DataStore;
}
