/**
 * GoCar Car Rental Booking System - Booking & Pricing Business Logic Module
 * Implements FR-03, FR-04, FR-05, FR-06, FR-07 and BR-01, BR-02, BR-03, BR-04
 */

const BookingService = {
  /**
   * Format currency in Malaysian Ringgit (RM) with 2 decimal places (BR-01)
   */
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    return `RM ${num.toFixed(2)}`;
  },

  /**
   * Format date for readable display (e.g., "24 Oct 2026, 10:00 AM")
   */
  formatDateTime(isoOrDateString) {
    if (!isoOrDateString) return 'N/A';
    try {
      const date = new Date(isoOrDateString);
      if (isNaN(date.getTime())) return isoOrDateString;
      return date.toLocaleString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoOrDateString;
    }
  },

  /**
   * Validates rental period and calculates billable duration (FR-03, BR-01)
   * Whole hours, rounded up when the duration contains a partial hour.
   * @param {string} startStr ISO or date-time string
   * @param {string} endStr ISO or date-time string
   * @returns {Object} { isValid: boolean, message?: string, billableHours: number, rawHours: number }
   */
  calculateRentalDuration(startStr, endStr) {
    if (!startStr || !endStr) {
      return {
        isValid: false,
        message: 'Both rental start and end date/time must be specified.',
        billableHours: 0,
        rawHours: 0
      };
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        isValid: false,
        message: 'Invalid date format selected.',
        billableHours: 0,
        rawHours: 0
      };
    }

    const diffMs = endDate.getTime() - startDate.getTime();

    // Check: End time must be later than start time
    if (diffMs <= 0) {
      return {
        isValid: false,
        message: 'Rental end time must be later than the start time.',
        billableHours: 0,
        rawHours: 0
      };
    }

    // Minimum billable time is 1 hour
    const rawHours = diffMs / (1000 * 60 * 60);
    // Billable hours: Whole hours, rounded up when the duration contains a partial hour (FR-03)
    const billableHours = Math.ceil(rawHours);

    return {
      isValid: true,
      message: null,
      billableHours,
      rawHours: parseFloat(rawHours.toFixed(2))
    };
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

    const selectedCDW = CDW_PACKAGES.find(p => p.id === cdwId) || null;
    const cdwCharge = selectedCDW ? selectedCDW.price : 0;

    const selectedFlex = FLEX_PACKAGES.find(p => p.id === flexId) || null;
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
      // Formatted representations
      formattedHourlyRate: this.formatCurrency(rate),
      formattedBaseCharge: this.formatCurrency(baseCharge),
      formattedCdwCharge: this.formatCurrency(cdwCharge),
      formattedFlexCharge: this.formatCurrency(flexCharge),
      formattedTotalPrice: this.formatCurrency(totalPrice)
    };
  },

  /**
   * Check vehicle availability against existing confirmed or pending bookings (BR-03)
   * Overlap rule: (startA < endB) and (endA > startB)
   * @param {string} vehicleId 
   * @param {string} startStr 
   * @param {string} endStr 
   * @param {string} [excludeBookingId] Optional booking ID to ignore (e.g. for updates)
   * @returns {Object} { isAvailable: boolean, message?: string, conflictingBooking?: Object }
   */
  checkVehicleAvailability(vehicleId, startStr, endStr, excludeBookingId = null) {
    const newStart = new Date(startStr).getTime();
    const newEnd = new Date(endStr).getTime();

    if (isNaN(newStart) || isNaN(newEnd) || newEnd <= newStart) {
      return { isAvailable: false, message: 'Invalid rental date range for availability check.' };
    }

    const bookings = DataStore.getBookings();

    // Check all existing bookings for this vehicle
    // Active bookings that block availability: "Confirmed" or "Pending Payment" (BR-03, BR-04)
    // Cancelled or Failed bookings do NOT block availability
    const conflictingBooking = bookings.find(booking => {
      if (booking.id === excludeBookingId) return false;
      if (booking.vehicleId !== vehicleId) return false;

      // Active booking status check
      const blocksAvailability = (
        booking.bookingStatus === 'Confirmed' ||
        booking.bookingStatus === 'Pending Payment'
      );
      if (!blocksAvailability) return false;

      const existingStart = new Date(booking.startDateTime).getTime();
      const existingEnd = new Date(booking.endDateTime).getTime();

      // Overlap condition:
      const overlaps = (newStart < existingEnd) && (newEnd > existingStart);
      return overlaps;
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
   * Creates a new booking in localStorage (FR-05)
   * Initial statuses per BR-04:
   * bookingStatus: 'Pending Payment'
   * paymentStatus: 'Pending'
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

    // 2. Validate CDW and Flex selections (Section 4 SRS)
    const selectedCDW = CDW_PACKAGES.find(p => p.id === cdwId);
    if (!selectedCDW) {
      return { success: false, message: 'Please select a Collision Damage Waiver (CDW) protection package.' };
    }

    const selectedFlex = FLEX_PACKAGES.find(p => p.id === flexId);
    if (!selectedFlex) {
      return { success: false, message: 'Please select a Flex package.' };
    }

    // 3. Overlap check against existing confirmed or pending payment bookings (BR-03)
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
      // Statuses per BR-04
      bookingStatus: 'Pending Payment',
      paymentStatus: 'Pending',
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
   * @returns {Object} { success: boolean, message: string, booking?: Object }
   */
  processSimulatedPayment(bookingId, outcome) {
    const bookings = DataStore.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index === -1) {
      return { success: false, message: 'Booking reference not found.' };
    }

    const booking = bookings[index];

    if (booking.bookingStatus === 'Cancelled') {
      return { success: false, message: 'Cannot process payment for a cancelled booking.' };
    }

    if (outcome === 'success') {
      // BR-04: "A booking shall only become Confirmed when its simulated payment succeeds."
      booking.paymentStatus = 'Successful';
      booking.bookingStatus = 'Confirmed';
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
      // BR-04: Failed payment outcome
      // Failed payment shall not be treated as a completed payment.
      // Interface shall clearly distinguish pending, successful and failed payments.
      booking.paymentStatus = 'Failed';
      // Booking status remains 'Pending Payment' to allow customer to re-attempt or cancel
      booking.bookingStatus = 'Pending Payment';
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
   * Cancel an existing booking
   * @param {string} bookingId 
   * @param {Object} requestingUser 
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

    // Authorization check (BR-05: Customer can only cancel their own)
    if (requestingUser.role !== 'admin' && booking.userId !== requestingUser.id) {
      return { success: false, message: 'You are not authorized to cancel this booking.' };
    }

    if (booking.bookingStatus === 'Cancelled') {
      return { success: false, message: 'This booking is already cancelled.' };
    }

    booking.bookingStatus = 'Cancelled';
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
   * Only returns bookings for given customer.
   */
  getCustomerBookings(userId) {
    if (!userId) return [];
    const allBookings = DataStore.getBookings();
    return allBookings
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Get single booking by ID
   */
  getBooking(bookingId) {
    const bookings = DataStore.getBookings();
    return bookings.find(b => b.id === bookingId) || null;
  }
};
