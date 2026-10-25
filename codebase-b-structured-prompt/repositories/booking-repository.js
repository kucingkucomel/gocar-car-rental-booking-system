/**
 * Booking Repository
 * Data access layer for customer bookings and reservations.
 */

import { STORAGE_KEYS } from '../config/constants.js';
import { Booking } from '../models/booking.js';
import { storageRepository } from './storage-repository.js';

class BookingRepository {
  /**
   * Retrieves all bookings stored.
   * @returns {Booking[]}
   */
  getAll() {
    const rawList = storageRepository.getItem(STORAGE_KEYS.BOOKINGS, []);
    return rawList.map(raw => Booking.fromJSON(raw)).filter(Boolean);
  }

  /**
   * Finds a booking by unique reference.
   * @param {string} reference
   * @returns {Booking|null}
   */
  getByReference(reference) {
    if (!reference) return null;
    const all = this.getAll();
    const found = all.find(b => b.reference.toUpperCase() === reference.toUpperCase());
    return found || null;
  }

  /**
   * Retrieves all bookings for a specific customer ID.
   * @param {string} customerId
   * @returns {Booking[]}
   */
  getByCustomerId(customerId) {
    if (!customerId) return [];
    const all = this.getAll();
    return all.filter(b => b.customerId === customerId);
  }

  /**
   * Retrieves all bookings for a specific vehicle ID.
   * @param {string} vehicleId
   * @returns {Booking[]}
   */
  getByVehicleId(vehicleId) {
    if (!vehicleId) return [];
    const all = this.getAll();
    return all.filter(b => b.vehicleId === vehicleId);
  }

  /**
   * Persists a new booking.
   * @param {Booking} booking
   * @returns {Booking}
   */
  create(booking) {
    const all = this.getAll();
    if (this.getByReference(booking.reference)) {
      throw new Error(`Booking reference "${booking.reference}" already exists.`);
    }

    all.push(booking);
    storageRepository.setItem(
      STORAGE_KEYS.BOOKINGS,
      all.map(b => b.toJSON())
    );
    return booking;
  }

  /**
   * Updates an existing booking.
   * @param {Booking} booking
   * @returns {Booking}
   */
  update(booking) {
    const all = this.getAll();
    const index = all.findIndex(b => b.reference === booking.reference);
    if (index === -1) {
      throw new Error(`Booking with reference "${booking.reference}" not found.`);
    }

    booking.updatedAt = new Date().toISOString();
    all[index] = booking;
    storageRepository.setItem(
      STORAGE_KEYS.BOOKINGS,
      all.map(b => b.toJSON())
    );
    return booking;
  }

  /**
   * Clears all booking records.
   */
  clear() {
    storageRepository.setItem(STORAGE_KEYS.BOOKINGS, []);
  }
}

export const bookingRepository = new BookingRepository();
