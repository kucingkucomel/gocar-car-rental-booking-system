/**
 * Payment Service
 * Handles simulated payment processing, status transitions, and receipt generation
 * according to FR-06 and BR-04.
 * 
 * Note: Educational prototype - strictly simulated; no actual card/bank details are collected.
 */

import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';
import { bookingRepository } from '../repositories/booking-repository.js';

class PaymentService {
  /**
   * Processes a simulated payment attempt.
   * 
   * @param {string} bookingReference - The reference of the booking to pay for
   * @param {boolean} shouldSucceed - Whether to simulate a successful or failed payment
   * @returns {Object} Result of simulation with updated booking
   */
  processSimulatedPayment(bookingReference, shouldSucceed = true) {
    const booking = bookingRepository.getByReference(bookingReference);
    if (!booking) {
      throw new Error(`Booking reference "${bookingReference}" was not found.`);
    }

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
      throw new Error('Cannot process payment for a cancelled booking.');
    }

    if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED && booking.paymentStatus === PAYMENT_STATUS.SUCCESSFUL) {
      throw new Error('This booking has already been paid and confirmed.');
    }

    if (shouldSucceed) {
      // Successful simulated payment
      booking.paymentStatus = PAYMENT_STATUS.SUCCESSFUL;
      booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
      bookingRepository.update(booking);

      return {
        success: true,
        message: 'Payment simulation succeeded. Your booking is now Confirmed!',
        booking
      };
    } else {
      // Failed simulated payment
      booking.paymentStatus = PAYMENT_STATUS.FAILED;
      // Booking remains unconfirmed (pending or failed)
      bookingRepository.update(booking);

      return {
        success: false,
        message: 'Payment simulation failed. Your card or payment method was declined in the simulation.',
        booking
      };
    }
  }
}

export const paymentService = new PaymentService();
