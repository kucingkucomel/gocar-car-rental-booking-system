/**
 * GoCar Car Rental Booking System - Shared Badge Styling Utility Module
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Provides centralized status-to-CSS-class mapping functions for booking and payment statuses.
 * Eliminates duplicated conditional styling blocks across customer history and administrator views.
 */

const BadgeUtils = {
  /**
   * Maps payment status to CSS badge class
   * @param {string} paymentStatus 
   * @returns {string} CSS class name
   */
  getPaymentBadgeClass(paymentStatus) {
    switch (paymentStatus) {
      case 'Successful':
        return 'badge-success';
      case 'Failed':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  },

  /**
   * Maps booking status to CSS badge class
   * @param {string} bookingStatus 
   * @returns {string} CSS class name
   */
  getBookingBadgeClass(bookingStatus) {
    switch (bookingStatus) {
      case 'Confirmed':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-secondary';
      default:
        return 'badge-warning';
    }
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.BadgeUtils = BadgeUtils;
}
