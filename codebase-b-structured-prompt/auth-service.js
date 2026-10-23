/**
 * Authentication Service
 * Manages demo authentication, registration, session state, and role checks
 * according to FR-01 and BR-05.
 * 
 * Note: Educational prototype - authentication is client-side simulated.
 */

import { ROLES, STORAGE_KEYS } from '../config/constants.js';
import { User } from '../models/user.js';
import { storageRepository } from '../repositories/storage-repository.js';
import { userRepository } from '../repositories/user-repository.js';
import { validateEmail, validatePassword, validateRequired } from '../utils/validators.js';

class AuthService {
  constructor() {
    this._listeners = new Set();
  }

  /**
   * Registers a callback for authentication state changes.
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /**
   * Emits authentication state change event.
   * @private
   */
  _notifyListeners(user) {
    for (const callback of this._listeners) {
      try {
        callback(user);
      } catch (err) {
        console.error('[AuthService] Error in auth listener:', err);
      }
    }
  }

  /**
   * Returns currently logged-in user or null.
   * @returns {User|null}
   */
  getCurrentUser() {
    const raw = storageRepository.getItem(STORAGE_KEYS.CURRENT_USER, null);
    if (!raw) return null;
    return User.fromJSON(raw);
  }

  /**
   * Checks if a user is currently authenticated.
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  /**
   * Checks if current user is an administrator.
   * @returns {boolean}
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user !== null && user.isAdmin();
  }

  /**
   * Registers a new customer account.
   * 
   * @param {Object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} [params.role=ROLES.CUSTOMER]
   * @returns {User}
   */
  register({ name, email, password, role = ROLES.CUSTOMER }) {
    // 1. Validate required fields
    const nameVal = validateRequired(name, 'Full name');
    if (!nameVal.isValid) throw new Error(nameVal.error);

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) throw new Error(emailVal.error);

    const passVal = validatePassword(password);
    if (!passVal.isValid) throw new Error(passVal.error);

    // 2. Reject duplicate email (FR-01)
    const existing = userRepository.getByEmail(email);
    if (existing) {
      throw new Error(`An account with email "${email.trim()}" is already registered. Please log in instead.`);
    }

    // 3. Create user ID
    const newId = `USR${Date.now().toString(36).toUpperCase()}`;
    const user = new User({
      id: newId,
      name: name.trim(),
      email: email.trim(),
      password,
      role: role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CUSTOMER
    });

    userRepository.create(user);

    // Auto log in after registration
    this._setCurrentUser(user);
    return user;
  }

  /**
   * Authenticates user credentials.
   * 
   * @param {string} email
   * @param {string} password
   * @returns {User}
   */
  login(email, password) {
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) throw new Error(emailVal.error);

    if (!password) {
      throw new Error('Password is required.');
    }

    const user = userRepository.getByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials or register a demo account.');
    }

    if (user.password !== password) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    this._setCurrentUser(user);
    return user;
  }

  /**
   * Logs out the current user session.
   */
  logout() {
    storageRepository.removeItem(STORAGE_KEYS.CURRENT_USER);
    this._notifyListeners(null);
  }

  /**
   * Sets current user session.
   * @private
   * @param {User} user
   */
  _setCurrentUser(user) {
    storageRepository.setItem(STORAGE_KEYS.CURRENT_USER, user.toJSON(false));
    this._notifyListeners(user);
  }
}

export const authService = new AuthService();
