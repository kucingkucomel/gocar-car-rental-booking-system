/**
 * GoCar Car Rental Booking System - Administrator Module
 * Implements FR-08 (Vehicle and Booking Administration) and BR-05 (Role Restrictions)
 */

const AdminService = {
  /**
   * Verify that current user has administrative rights
   */
  requireAdmin() {
    if (!Auth.isAdmin()) {
      throw new Error('Access denied. Administrator privileges are required.');
    }
  },

  /**
   * Add a new vehicle to fleet
   * @param {Object} vehicleData { id, name, category, capacity, transmission, hourlyRate, description }
   * @returns {Object} { success: boolean, message: string, vehicle?: Object }
   */
  addVehicle(vehicleData) {
    this.requireAdmin();

    const id = (vehicleData.id || '').trim().toUpperCase();
    const name = (vehicleData.name || '').trim();
    const category = (vehicleData.category || '').trim();
    const capacity = parseInt(vehicleData.capacity, 10);
    const transmission = (vehicleData.transmission || '').trim();
    const hourlyRate = parseFloat(vehicleData.hourlyRate);
    const description = (vehicleData.description || '').trim();

    // Validations
    if (!id) {
      return { success: false, message: 'Vehicle ID is required (e.g. CAR005).' };
    }
    if (!name) {
      return { success: false, message: 'Vehicle name/model is required.' };
    }
    if (!category) {
      return { success: false, message: 'Vehicle category is required.' };
    }
    if (isNaN(capacity) || capacity < 1 || capacity > 15) {
      return { success: false, message: 'Passenger capacity must be a positive number between 1 and 15.' };
    }
    if (!transmission) {
      return { success: false, message: 'Transmission type is required.' };
    }
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      return { success: false, message: 'Rental rate per hour must be a valid positive number.' };
    }

    const vehicles = DataStore.getVehicles();

    // Prevent duplicate vehicle ID
    if (vehicles.some(v => v.id === id)) {
      return { success: false, message: `Vehicle with ID "${id}" already exists.` };
    }

    const newVehicle = {
      id,
      name,
      category,
      capacity,
      transmission,
      hourlyRate: parseFloat(hourlyRate.toFixed(2)),
      status: 'Available',
      image: vehicleData.image || 'generic',
      description: description || `${name} (${category}) available for hourly rental.`
    };

    vehicles.push(newVehicle);
    DataStore.saveVehicles(vehicles);

    return {
      success: true,
      message: `Vehicle ${newVehicle.name} (${newVehicle.id}) added successfully to fleet.`,
      vehicle: newVehicle
    };
  },

  /**
   * Edit existing vehicle information and rate
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Object} { success: boolean, message: string, vehicle?: Object }
   */
  editVehicle(id, updateData) {
    this.requireAdmin();

    const vehicles = DataStore.getVehicles();
    const index = vehicles.findIndex(v => v.id === id);

    if (index === -1) {
      return { success: false, message: `Vehicle ID "${id}" not found.` };
    }

    const name = (updateData.name || '').trim();
    const category = (updateData.category || '').trim();
    const capacity = parseInt(updateData.capacity, 10);
    const transmission = (updateData.transmission || '').trim();
    const hourlyRate = parseFloat(updateData.hourlyRate);

    if (!name || !category || isNaN(capacity) || capacity < 1 || !transmission || isNaN(hourlyRate) || hourlyRate <= 0) {
      return { success: false, message: 'Please provide valid vehicle specifications and a positive hourly rate.' };
    }

    const updated = {
      ...vehicles[index],
      name,
      category,
      capacity,
      transmission,
      hourlyRate: parseFloat(hourlyRate.toFixed(2)),
      description: (updateData.description || '').trim() || vehicles[index].description
    };

    vehicles[index] = updated;
    DataStore.saveVehicles(vehicles);

    return {
      success: true,
      message: `Vehicle ${updated.id} (${updated.name}) updated successfully.`,
      vehicle: updated
    };
  },

  /**
   * Remove a vehicle when it has no conflicting active bookings (FR-08)
   * @param {string} id 
   * @returns {Object} { success: boolean, message: string }
   */
  removeVehicle(id) {
    this.requireAdmin();

    const vehicles = DataStore.getVehicles();
    const vehicle = vehicles.find(v => v.id === id);

    if (!vehicle) {
      return { success: false, message: `Vehicle ID "${id}" not found.` };
    }

    // Check for conflicting active bookings (Confirmed or Pending Payment)
    const allBookings = DataStore.getBookings();
    const now = new Date().getTime();

    const activeConflictingBookings = allBookings.filter(b => {
      if (b.vehicleId !== id) return false;
      const isActiveStatus = b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending Payment';
      const isFutureOrOngoing = new Date(b.endDateTime).getTime() >= now;
      return isActiveStatus && isFutureOrOngoing;
    });

    if (activeConflictingBookings.length > 0) {
      return {
        success: false,
        message: `Cannot remove vehicle "${vehicle.name}" (${vehicle.id}): It has ${activeConflictingBookings.length} active or upcoming reservation(s). Cancel or resolve them before removing this vehicle.`
      };
    }

    // Safe to remove
    const filteredVehicles = vehicles.filter(v => v.id !== id);
    DataStore.saveVehicles(filteredVehicles);

    return {
      success: true,
      message: `Vehicle "${vehicle.name}" (${vehicle.id}) was successfully removed from the fleet.`
    };
  },

  /**
   * View all bookings across all customers
   * @returns {Array} List of all bookings
   */
  getAllBookings() {
    this.requireAdmin();
    const bookings = DataStore.getBookings();
    return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Update booking status with administrative override (FR-08)
   * Allowed statuses: 'Pending Payment', 'Confirmed', 'Cancelled'
   * @param {string} bookingId 
   * @param {string} newStatus 
   * @returns {Object}
   */
  updateBookingStatus(bookingId, newStatus) {
    this.requireAdmin();

    const validStatuses = ['Pending Payment', 'Confirmed', 'Cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, message: `Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}.` };
    }

    const bookings = DataStore.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index === -1) {
      return { success: false, message: 'Booking reference not found.' };
    }

    const booking = bookings[index];
    const oldStatus = booking.bookingStatus;

    booking.bookingStatus = newStatus;
    if (newStatus === 'Confirmed' && booking.paymentStatus !== 'Successful') {
      booking.paymentStatus = 'Successful';
      booking.adminConfirmed = true;
    } else if (newStatus === 'Cancelled') {
      booking.cancelledAt = new Date().toISOString();
      booking.cancelledBy = 'Administrator';
    }

    bookings[index] = booking;
    DataStore.saveBookings(bookings);

    return {
      success: true,
      message: `Booking ${booking.id} status updated from "${oldStatus}" to "${newStatus}".`,
      booking
    };
  }
};
