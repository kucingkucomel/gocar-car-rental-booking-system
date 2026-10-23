/**
 * GoCar Car Rental Booking System - Booking & Pricing Business Logic Service
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Implements FR-03, FR-04, FR-05, FR-06, FR-07 and BR-01, BR-02, BR-03, BR-04.
 * Uses domain constants and unified active booking conflict detection.
 */

const BookingService = {
  /**
   * Format currency in Malaysian Ringgit (RM) (BR-01)
   */
  formatCurrency(amount) {
    if (typeof Formatters !== 'undefined') {
      return Formatters.formatCurrency(amount);
    }
    const num = Number(amount) || 0;
    return `RM ${num.toFixed(2)}`;
  },

  /**
   * Format date for readable display
   */
  formatDateTime(isoOrDateString) {
    if (typeof Formatters !== 'undefined') {
      return Formatters.formatDateTime(isoOrDateString);
    }
    return String(isoOrDateString);
  },

  /**
   * Validates rental period and calculates billable duration (FR-03, BR-01)
   */
  calculateRentalDuration(startStr, endStr) {
    if (typeof Formatters !== 'undefined') {
      return Formatters.calculateRentalDuration(startStr, endStr);
    }
    // Fallback if Formatters is not loaded
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    if (!startStr || !endStr || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { isValid: false, message: 'Invalid date format selected.', billableHours: 0, rawHours: 0 };
    }
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs <= 0) {
      return { isValid: false, message: 'Rental end time must be later than the start time.', billableHours: 0, rawHours: 0 };
    }
    const rawHours = diffMs / 3600000;
    return { isValid: true, message: null, billableHours: Math.ceil(rawHours), rawHours: parseFloat(rawHours.toFixed(2)) };
  },

  /**
   * Calculate complete rental price breakdown (BR-01)
   * Base = Billable Hours × Hourly Rate
   * Total = Base + CDW + Flex
   * @param {number} hourlyRate 
   * @param {number} billableHours 
   * @param {string} cdwId 
   * @param {string} flexId 
   */
  calculatePriceBreakdown(hourlyRate, billableHours, cdwId, flexId) {
    const rate = Number(hourlyRate) || 0;
    const hours = Number(billableHours) || 0;
    const baseCharge = hours * rate;

    const cdwPackages = typeof CDW_PACKAGES !== 'undefined' ? CDW_PACKAGES : [];
    const flexPackages = typeof FLEX_PACKAGES !== 'undefined' ? FLEX_PACKAGES : [];

    const selectedCDW = cdwPackages.find(p => p.id === cdwId) || null;
    const cdwCharge = selectedCDW ? selectedCDW.price : 0;

    const selectedFlex = flexPackages.find(p => p.id === flexId) || null;
    const flexCharge = selectedFlex ? selectedFlex.price : 0;

    const totalPrice = baseCharge + cdwCharge + flexCharge;

    return {
      hourlyRate: rate,
      billableHours: hours,
      baseCharge,
      selectedCDW,
      cdwCharge,
      selectedFlex,
      flexCharge,
      totalPrice,
      formattedHourlyRate: this.formatCurrency(rate),
      formattedBaseCharge: this.formatCurrency(baseCharge),
      formattedCdwCharge: this.formatCurrency(cdwCharge),
      formattedFlexCharge: this.formatCurrency(flexCharge),
      formattedTotalPrice: this.formatCurrency(totalPrice)
    };
  },

  /**
   * Single Source of Truth for whether a booking status blocks vehicle availability (BR-03, BR-04)
   * @param {Object} booking 
   * @returns {boolean}
   */
  isActiveBooking(booking) {
    if (!booking) return false;
    const confirmedStatus = typeof BOOKING_STATUS !== 'undefined' ? BOOKING_STATUS.CONFIRMED : 'Confirmed';
    const pendingStatus = typeof BOOKING_STATUS !== 'undefined' ? BOOKING_STATUS.PENDING_PAYMENT : 'Pending Payment';
    return booking.bookingStatus === confirmedStatus || booking.bookingStatus === pendingStatus;
  },

  /**
   * Check vehicle availability against existing confirmed or pending bookings (BR-03)
   * Overlap rule: (startA < endB) and (endA > startB)
   */
  checkVehicleAvailability(vehicleId, startStr, endStr, excludeBookingId = null) {
    const newStart = new Date(startStr).getTime();
    const newEnd = new Date(endStr).getTime();

    if (isNaN(newStart) || isNaN(newEnd) || newEnd <= newStart) {
      return { isAvailable: false, message: 'Invalid rental date range for availability check.' };
    }

    const bookings = DataStore.getBookings();

    const conflictingBooking = bookings.find(booking => {
      if (booking.id === excludeBookingId) return false;
      if (booking.vehicleId !== vehicleId) return false;
      if (!this.isActiveBooking(booking)) return false;

      const existingStart = new Date(booking.startDateTime).getTime();
      const existingEnd = new Date(booking.endDateTime).getTime();

      return (newStart < existingEnd) && (newEnd > existingStart);
    });

    if (conflictingBooking) {
      const startFormatted = this.formatDateTime(conflictingBooking.startDateTime);
      const endFormatted = this.formatDateTime(conflictingBooking.endDateTime);
      return {
        isAvailable: false,
        message: `This vehicle is already reserved from ${startFormatted} to ${endFormatted} (${conflictingBooking.bookingStatus}). Please select another time or vehicle.`,
        conflictingBooking
      };
    }

    return {
      isAvailable: true,
      message: 'Vehicle is available for the selected rental duration.'
    };
  },

  /**
   * Generates a unique, readable booking reference (e.g. GC-20261023-9F4B)
   */
  generateBookingReference() {
    const today = new Date();
    const ymd = today.getFullYear().toString() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GC-${ymd}-${randomHex}`;
  },

  /**
   * Creates a new booking in localStorage (FR-05, BR-04)
   */
  createBooking({ vehicleId, startDateTime, endDateTime, cdwId, flexId }) {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'You must be logged in as a customer to create a booking.' };
    }

    const vehicles = DataStore.getVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      return { success: false, message: 'Selected vehicle not found.' };
    }

    // 1. Validate rental period
    const durationInfo = this.calculateRentalDuration(startDateTime, endDateTime);
    if (!durationInfo.isValid) {
      return { success: false, message: durationInfo.message };
    }

    // 2. Validate CDW and Flex selections
    const cdwPackages = typeof CDW_PACKAGES !== 'undefined' ? CDW_PACKAGES : [];
    const flexPackages = typeof FLEX_PACKAGES !== 'undefined' ? FLEX_PACKAGES : [];

    const selectedCDW = cdwPackages.find(p => p.id === cdwId);
    if (!selectedCDW) {
      return { success: false, message: 'Please select a Collision Damage Waiver (CDW) protection package.' };
    }

    const selectedFlex = flexPackages.find(p => p.id === flexId);
    if (!selectedFlex) {
      return { success: false, message: 'Please select a Flex package.' };
    }

    // 3. Overlap check against existing active bookings (BR-03)
    const availability = this.checkVehicleAvailability(vehicleId, startDateTime, endDateTime);
    if (!availability.isAvailable) {
      return { success: false, message: availability.message };
    }

    // 4. Calculate final pricing breakdown
    const pricing = this.calculatePriceBreakdown(
      vehicle.hourlyRate,
      durationInfo.billableHours,
      cdwId,
      flexId
    );

    const pendingBookingStatus = typeof BOOKING_STATUS !== 'undefined' ? BOOKING_STATUS.PENDING_PAYMENT : 'Pending Payment';
    const pendingPaymentStatus = typeof PAYMENT_STATUS !== 'undefined' ? PAYMENT_STATUS.PENDING : 'Pending';

    // 5. Build booking record
    const newBooking = {
      id: this.generateBookingReference(),
      userId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleCategory: vehicle.category,
      vehicleCapacity: vehicle.capacity,
      vehicleTransmission: vehicle.transmission,
      hourlyRate: vehicle.hourlyRate,
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: new Date(endDateTime).toISOString(),
      billableHours: durationInfo.billableHours,
      rawHours: durationInfo.rawHours,
      cdwPackage: selectedCDW,
      flexPackage: selectedFlex,
      baseCharge: pricing.baseCharge,
      cdwCharge: pricing.cdwCharge,
      flexCharge: pricing.flexCharge,
      totalPrice: pricing.totalPrice,
      bookingStatus: pendingBookingStatus,
      paymentStatus: pendingPaymentStatus,
      createdAt: new Date().toISOString(),
      paymentDetails: null
    };

    const bookings = DataStore.getBookings();
    bookings.push(newBooking);
    DataStore.saveBookings(bookings);

    return {
      success: true,
      message: `Booking ${newBooking.id} created successfully! Please proceed to simulated payment.`,
      booking: newBooking
    };
  },

  /**
   * Process simulated payment outcome (FR-06, BR-04)
   * @param {string} bookingId 
   * @param {'success' | 'fail'} outcome 
   */
  processSimulatedPayment(bookingId, outcome) {
    const bookings = DataStore.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index === -1) {
      return { success: false, message: 'Booking reference not found.' };
    }

    const booking = bookings[index];
    const cancelledStatus = typeof BOOKING_STATUS !== 'undefined' ? BOOKING_STATUS.CANCELLED : 'Cancelled';

    if (booking.bookingStatus === cancelledStatus) {
      return { success: false, message: 'Cannot process payment for a cancelled booking.' };
    }

    const confirmedStatus = typeof BOOKING_STATUS !== 'undefined' ? BOOKING_STATUS.CONFIRMED : 'Confirmed';
    const pendingPaymentBookingStatus = typeof BOOKING_STATUS !== 'undefined' ? BOOKING_STATUS.PENDING_PAYMENT : 'Pending Payment';
    const successfulPaymentStatus = typeof PAYMENT_STATUS !== 'undefined' ? PAYMENT_STATUS.SUCCESSFUL : 'Successful';
    const failedPaymentStatus = typeof PAYMENT_STATUS !== 'undefined' ? PAYMENT_STATUS.FAILED : 'Failed';

    if (outcome === 'success') {
      booking.paymentStatus = successfulPaymentStatus;
      booking.bookingStatus = confirmedStatus;
      booking.paymentDetails = {
        simulatedGateway: 'GoCar Demo Sandbox Gateway',
        transactionId: 'TXN-' + Date.now().toString().slice(-8),
        timestamp: new Date().toISOString(),
        outcome: 'SUCCESS',
        amountPaid: booking.totalPrice
      };

      bookings[index] = booking;
      DataStore.saveBookings(bookings);

      return {
        success: true,
        isConfirmed: true,
        message: `Payment successful! Booking ${booking.id} is now Confirmed.`,
        booking
      };
    } else {
      booking.paymentStatus = failedPaymentStatus;
      booking.bookingStatus = pendingPaymentBookingStatus;
      booking.paymentDetails = {
        simulatedGateway: 'GoCar Demo Sandbox Gateway',
        transactionId: 'TXN-FAIL-' + Date.now().toString().slice(-6),
        timestamp: new Date().toISOString(),
        outcome: 'FAILED',
        failureReason: 'Simulated Card Declined / Insufficient Demo Funds'
      };

      bookings[index] = booking;
      DataStore.saveBookings(bookings);

      return {
        success: false,
        isConfirmed: false,
        message: `Simulated payment failed (Simulated Card Declined). Booking ${booking.id} remains Pending Payment. You may re-attempt payment or cancel.`,
        booking
      };
    }
  },

  /**
   * Cancel an existing booking (BR-05)
   */
  cancelBooking(bookingId, requestingUser) {
    if (!requestingUser) {
      return { success: false, message: 'Authentication required to cancel a booking.' };
    }

    const bookings = DataStore.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index === -1) {
      return { success: false, message: 'Booking not found.' };
    }

    const booking = bookings[index];
    const adminRole = typeof USER_ROLES !== 'undefined' ? USER_ROLES.ADMIN : 'admin';
    const cancelledStatus = typeof BOOKING_STATUS !== 'undefined' ? BOOKING_STATUS.CANCELLED : 'Cancelled';

    if (requestingUser.role !== adminRole && booking.userId !== requestingUser.id) {
      return { success: false, message: 'You are not authorized to cancel this booking.' };
    }

    if (booking.bookingStatus === cancelledStatus) {
      return { success: false, message: 'This booking is already cancelled.' };
    }

    booking.bookingStatus = cancelledStatus;
    booking.cancelledAt = new Date().toISOString();
    booking.cancelledBy = requestingUser.email;

    bookings[index] = booking;
    DataStore.saveBookings(bookings);

    return {
      success: true,
      message: `Booking ${booking.id} has been cancelled.`,
      booking
    };
  },

  /**
   * Customer booking history (FR-07, BR-05)
   */
  getCustomerBookings(userId) {
    if (!userId) return [];
    const allBookings = DataStore.getBookings();
    return allBookings
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getBooking(bookingId) {
    const bookings = DataStore.getBookings();
    return bookings.find(b => b.id === bookingId) || null;
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.BookingService = BookingService;
}
