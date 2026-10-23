/**
 * Administrator Service
 * Business service handling fleet management, reservation oversight,
 * status transitions, and demo data reset according to FR-08 and BR-05.
 */

import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';
import { Vehicle } from '../models/vehicle.js';
import { bookingRepository } from '../repositories/booking-repository.js';
import { userRepository } from '../repositories/user-repository.js';
import { vehicleRepository } from '../repositories/vehicle-repository.js';
import { authService } from './auth-service.js';

class AdminService {
  /**
   * Asserts that current caller possesses administrative privileges.
   * @private
   */
  _requireAdmin() {
    if (!authService.isAdmin()) {
      throw new Error('Access denied: Administrator privileges are required to perform this action.');
    }
  }

  /**
   * Adds a new vehicle to the fleet.
   * @param {Object} vehicleData
   * @returns {Vehicle}
   */
  addVehicle(vehicleData) {
    this._requireAdmin();

    const vehicle = new Vehicle({
      id: vehicleData.id || `CAR${Date.now().toString().slice(-4)}`,
      name: vehicleData.name,
      category: vehicleData.category,
      capacity: Number(vehicleData.capacity),
      transmission: vehicleData.transmission || 'Automatic',
      hourlyRate: Number(vehicleData.hourlyRate),
      imageUrl: vehicleData.imageUrl || 'assets/cars/car-generic.svg',
      isAvailable: vehicleData.isAvailable !== false
    });

    return vehicleRepository.create(vehicle);
  }

  /**
   * Updates an existing vehicle's details and rates.
   * @param {Vehicle} vehicle
   * @returns {Vehicle}
   */
  updateVehicle(vehicle) {
    this._requireAdmin();
    return vehicleRepository.update(vehicle);
  }

  /**
   * Removes a vehicle from the fleet.
   * Enforces FR-08: "Remove a vehicle when it has no conflicting active bookings."
   * Active bookings are those with bookingStatus 'Confirmed' or 'Pending Payment'.
   * 
   * @param {string} vehicleId
   * @returns {boolean}
   */
  removeVehicle(vehicleId) {
    this._requireAdmin();

    const bookings = bookingRepository.getByVehicleId(vehicleId);
    const activeBookings = bookings.filter(b => b.blocksAvailability());

    if (activeBookings.length > 0) {
      const refs = activeBookings.map(b => b.reference).join(', ');
      throw new Error(
        `Cannot remove vehicle "${vehicleId}". It has ${activeBookings.length} active reservation(s) ` +
        `(${refs}). Cancel or complete those bookings before removing this vehicle.`
      );
    }

    return vehicleRepository.delete(vehicleId);
  }

  /**
   * Retrieves all bookings across the entire system.
   * @returns {import('../models/booking.js').Booking[]}
   */
  getAllBookings() {
    this._requireAdmin();
    return bookingRepository.getAll();
  }

  /**
   * Updates the status of any booking.
   * Enforces status transition rules according to BR-04.
   * 
   * @param {string} reference
   * @param {string} newBookingStatus
   * @param {string} [newPaymentStatus]
   * @returns {import('../models/booking.js').Booking}
   */
  updateBookingStatus(reference, newBookingStatus, newPaymentStatus) {
    this._requireAdmin();

    const booking = bookingRepository.getByReference(reference);
    if (!booking) {
      throw new Error(`Booking "${reference}" not found.`);
    }

    const validBookingStatuses = Object.values(BOOKING_STATUS);
    if (!validBookingStatuses.includes(newBookingStatus)) {
      throw new Error(`Invalid booking status "${newBookingStatus}". Must be one of: ${validBookingStatuses.join(', ')}`);
    }

    booking.bookingStatus = newBookingStatus;

    if (newPaymentStatus) {
      const validPaymentStatuses = Object.values(PAYMENT_STATUS);
      if (!validPaymentStatuses.includes(newPaymentStatus)) {
        throw new Error(`Invalid payment status "${newPaymentStatus}". Must be one of: ${validPaymentStatuses.join(', ')}`);
      }
      booking.paymentStatus = newPaymentStatus;
    } else {
      // Automatic alignment: If marking Confirmed and payment was still pending, mark payment Successful
      if (newBookingStatus === BOOKING_STATUS.CONFIRMED && booking.paymentStatus === PAYMENT_STATUS.PENDING) {
        booking.paymentStatus = PAYMENT_STATUS.SUCCESSFUL;
      }
    }

    return bookingRepository.update(booking);
  }

  /**
   * Resets entire application storage to clean authoritative seed data.
   * Used for automated test isolation and interactive demonstration reset.
   */
  resetSystemDemoData() {
    vehicleRepository.resetToSeed();
    userRepository.resetToSeed();
    bookingRepository.clear();
  }
}

export const adminService = new AdminService();
