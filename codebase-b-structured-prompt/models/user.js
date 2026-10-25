/**
 * User Model
 * Represents system users (Customers and Administrators).
 */

import { ROLES } from '../config/constants.js';

export class User {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} data.password
   * @param {string} [data.role=ROLES.CUSTOMER]
   * @param {string} [data.createdAt]
   */
  constructor({ id, name, email, password, role = ROLES.CUSTOMER, createdAt }) {
    this.id = id;
    this.name = name;
    this.email = email ? email.toLowerCase().trim() : '';
    this.password = password; // Educational prototype: stored for local demo verification
    this.role = role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CUSTOMER;
    this.createdAt = createdAt || new Date().toISOString();
  }

  /**
   * Checks if user is an administrator.
   * @returns {boolean}
   */
  isAdmin() {
    return this.role === ROLES.ADMIN;
  }

  /**
   * Serializes user to JSON (omitting password if sanitized).
   * @param {boolean} [includePassword=true]
   * @returns {Object}
   */
  toJSON(includePassword = true) {
    const obj = {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt
    };
    if (includePassword) {
      obj.password = this.password;
    }
    return obj;
  }

  /**
   * Instantiates a User from plain storage object.
   * @param {Object} raw
   * @returns {User}
   */
  static fromJSON(raw) {
    if (!raw) return null;
    return new User(raw);
  }
}
