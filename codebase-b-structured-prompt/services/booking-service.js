/**
 * Booking Service
 * Authoritative business service for reservations, availability checking,
 * overlap conflict detection, and booking lifecycle management.
 */

import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';
import { Booking } from '../models/booking.js';
import { bookingRepository } from '../repositories/booking-repository.js';
import { vehicleRepository } from '../repositories/vehicle-repository.js';
import { isDateRangeOverlapping } from '../utils/date-utils.js';
import { pricingService } from './pricing-service.js';

class BookingService {
  /**
   * Generates a unique, professional booking reference.
   * Format: GC-YYYYMMDD-XXXX (e.g. GC-20261023-K7F2)
   * @private
   * @returns {string}
   */
  _generateReference() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    let ref = '';
    let attempts = 0;
    do {
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      ref = `GC-${dateStr}-${rand}`;
      attempts++;
    } while (bookingRepository.getByReference(ref) && attempts < 100);

    return ref;
  }

  /**
   * Checks whether a vehicle is available for the given rental window.
   * Enforces BR-03:
   * - Only bookings with status 'Confirmed' or 'Pending Payment' block availability.
   * - 'Cancelled' or 'Failed' bookings do NOT block availability.
   * 
   * @param {string} vehicleId
   * @param {string|Date} startTime
   * @param {string|Date} endTime
   * @param {string} [excludeReference=null] - Optional reference to exclude (e.g. when updating)
   * @returns {{ isAvailable: boolean, conflictingBooking?: Booking }}
   */
  checkAvailability(vehicleId, startTime, endTime, excludeReference = null) {
    const existingBookings = bookingRepository.getByVehicleId(vehicleId);

    for (const booking of existingBookings) {
      if (excludeReference && booking.reference === excludeReference) {
        continue;
      }

      // Check if this booking actively blocks availability
      if (booking.blocksAvailability()) {
        const overlaps = isDateRangeOverlapping(
          startTime,
          endTime,
          booking.startTime,
          booking.endTime
        );

        if (overlaps) {
          return {
            isAvailable: false,
            conflictingBooking: booking
          };
        }
      }
    }

    return { isAvailable: true };
  }

  /**
   * Creates a new booking.
   * 
   * @param {Object} params
   * @param {string} params.customerId
   * @param {string} params.customerName
   * @param {string} params.customerEmail
   * @param {string} params.vehicleId
   * @param {string|Date} params.startTime
   * @param {string|Date} params.endTime
   * @param {string} params.cdwPackageId
   * @param {string} params.flexPackageId
   * @returns {Booking} Newly created booking
   */
  createBooking({
    customerId,
    customerName,
    customerEmail,
    vehicleId,
    startTime,
    endTime,
    cdwPackageId,
    flexPackageId
  }) {
    if (!customerId) {
      throw new Error('Customer ID is required to create a booking.');
    }

    const vehicle = vehicleRepository.getById(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID "${vehicleId}" was not found.`);
    }

    if (!vehicle.isAvailable) {
      throw new Error(`Vehicle "${vehicle.name}" is currently marked unavailable by administration.`);
    }

    // Check availability against existing bookings (BR-03)
    const availability = this.checkAvailability(vehicleId, startTime, endTime);
    if (!availability.isAvailable) {
      const conflict = availability.conflictingBooking;
      throw new Error(
        `Vehicle "${vehicle.name}" is already reserved during this period ` +
        `(Conflicting booking: ${conflict.reference}). Please choose another time or vehicle.`
      );
    }

    // Calculate authoritative pricing (BR-01)
    const pricing = pricingService.calculateRentalPrice({
      hourlyRate: vehicle.hourlyRate,
      startTime,
      endTime,
      cdwPackageId,
      flexPackageId
    });

    // Create booking record
    const reference = this._generateReference();
    const booking = new Booking({
      reference,
      customerId,
      customerName,
      customerEmail,
      vehicleId: vehicle.id,
      vehicleDetails: {
        id: vehicle.id,
        name: vehicle.name,
        category: vehicle.category,
        capacity: vehicle.capacity,
        transmission: vehicle.transmission,
        hourlyRate: vehicle.hourlyRate,
        imageUrl: vehicle.imageUrl
      },
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      billableHours: pricing.billableHours,
      cdwPackage: pricing.cdwPackage,
      flexPackage: pricing.flexPackage,
      pricingBreakdown: pricing,
      totalPrice: pricing.totalPrice,
      bookingStatus: BOOKING_STATUS.PENDING_PAYMENT,
      paymentStatus: PAYMENT_STATUS.PENDING
    });

    return bookingRepository.create(booking);
  }

  /**
   * Retrieves a booking by its reference.
   * @param {string} reference
   * @returns {Booking|null}
   */
  getBooking(reference) {
    return bookingRepository.getByReference(reference);
  }

  /**
   * Retrieves all bookings for a customer.
   * @param {string} customerId
   * @returns {Booking[]}
   */
  getCustomerBookings(customerId) {
    return bookingRepository.getByCustomerId(customerId);
  }

  /**
   * Retrieves all bookings in the system (for admin).
   * @returns {Booking[]}
   */
  getAllBookings() {
    return bookingRepository.getAll();
  }

  /**
   * Cancels a booking.
   * @param {string} reference
   * @param {string} requestedByUserId
   * @param {boolean} [isAdmin=false]
   * @returns {Booking}
   */
  cancelBooking(reference, requestedByUserId, isAdmin = false) {
    const booking = bookingRepository.getByReference(reference);
    if (!booking) {
      throw new Error(`Booking "${reference}" not found.`);
    }

    if (!isAdmin && booking.customerId !== requestedByUserId) {
      throw new Error('Access denied: You can only cancel your own bookings.');
    }

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
      throw new Error('This booking is already cancelled.');
    }

    booking.bookingStatus = BOOKING_STATUS.CANCELLED;
    return bookingRepository.update(booking);
  }
}

export const bookingService = new BookingService();
