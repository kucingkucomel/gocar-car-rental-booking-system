/**
 * User Repository
 * Data access layer for user accounts.
 */

import { STORAGE_KEYS, SEED_USERS } from '../config/constants.js';
import { User } from '../models/user.js';
import { storageRepository } from './storage-repository.js';

class UserRepository {
  constructor() {
    this._initializeSeedData();
  }

  /**
   * Initializes seed users if none exist in storage.
   * @private
   */
  _initializeSeedData() {
    const existing = storageRepository.getItem(STORAGE_KEYS.USERS, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageRepository.setItem(STORAGE_KEYS.USERS, SEED_USERS);
    }
  }

  /**
   * Resets users to initial seed data.
   */
  resetToSeed() {
    storageRepository.setItem(STORAGE_KEYS.USERS, SEED_USERS);
  }

  /**
   * Retrieves all users.
   * @returns {User[]}
   */
  getAll() {
    const rawUsers = storageRepository.getItem(STORAGE_KEYS.USERS, []);
    return rawUsers.map(raw => User.fromJSON(raw)).filter(Boolean);
  }

  /**
   * Finds a user by ID.
   * @param {string} id
   * @returns {User|null}
   */
  getById(id) {
    if (!id) return null;
    const all = this.getAll();
    const found = all.find(u => u.id === id);
    return found || null;
  }

  /**
   * Finds a user by email address (case-insensitive).
   * @param {string} email
   * @returns {User|null}
   */
  getByEmail(email) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    const all = this.getAll();
    const found = all.find(u => u.email.toLowerCase() === normalized);
    return found || null;
  }

  /**
   * Persists a new user. Rejects duplicate emails.
   * @param {User} user
   * @returns {User}
   */
  create(user) {
    if (this.getByEmail(user.email)) {
      throw new Error(`A user with email "${user.email}" already exists.`);
    }

    const all = this.getAll();
    all.push(user);
    storageRepository.setItem(
      STORAGE_KEYS.USERS,
      all.map(u => u.toJSON(true))
    );
    return user;
  }

  /**
   * Updates an existing user record.
   * @param {User} user
   * @returns {User}
   */
  update(user) {
    const all = this.getAll();
    const index = all.findIndex(u => u.id === user.id);
    if (index === -1) {
      throw new Error(`User with ID ${user.id} not found.`);
    }

    all[index] = user;
    storageRepository.setItem(
      STORAGE_KEYS.USERS,
      all.map(u => u.toJSON(true))
    );
    return user;
  }
}

export const userRepository = new UserRepository();
