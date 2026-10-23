/**
 * Shared badge styling helpers.
 * Used by customer booking history and administrator booking views.
 */
const BadgeUtils = {
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
