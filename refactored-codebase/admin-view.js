/**
 * GoCar Car Rental Booking System - Administrator View Module
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Manages administrative views: fleet management table, vehicle creation/editing modal,
 * and comprehensive booking ledger with status controls and revenue KPIs.
 */

const AdminView = {
  editingVehicleId: null,

  renderFleet(onEditVehicle, onRemoveVehicle) {
    const container = document.getElementById('admin-fleet-table-body');
    if (!container) return;

    const vehicles = DataStore.getVehicles();
    const allBookings = DataStore.getBookings();
    const now = Date.now();

    container.innerHTML = vehicles.map(v => {
      const activeBookings = allBookings.filter(b => {
        if (b.vehicleId !== v.id) return false;
        const isActive = typeof BookingService !== 'undefined' && typeof BookingService.isActiveBooking === 'function'
          ? BookingService.isActiveBooking(b)
          : (b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending Payment');
        return isActive && new Date(b.endDateTime).getTime() >= now;
      });

      const safeId = DOMUtils.escapeHTML(v.id);
      const safeName = DOMUtils.escapeHTML(v.name);
      const safeCat = DOMUtils.escapeHTML(v.category);
      const safeCap = DOMUtils.escapeHTML(v.capacity);
      const safeTrans = DOMUtils.escapeHTML(v.transmission);
      const formattedRate = Formatters.formatCurrency(v.hourlyRate);

      return `
        <tr>
          <td><strong>${safeId}</strong></td>
          <td>${safeName}</td>
          <td><span class="badge badge-secondary">${safeCat}</span></td>
          <td>${safeCap} Seats</td>
          <td>${safeTrans}</td>
          <td><strong>${formattedRate}</strong></td>
          <td>
            ${activeBookings.length > 0 
              ? `<span class="badge badge-warning">${activeBookings.length} Active Booking(s)</span>`
              : `<span class="badge badge-success">Available</span>`
            }
          </td>
          <td>
            <div class="btn-group">
              <button type="button" class="btn btn-secondary btn-sm" data-action="edit" data-vehicle-id="${safeId}">Edit</button>
              <button type="button" class="btn btn-outline-danger btn-sm" data-action="remove" data-vehicle-id="${safeId}">Remove</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.onclick = (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const vehicleId = btn.getAttribute('data-vehicle-id');

      if (action === 'edit' && typeof onEditVehicle === 'function') {
        onEditVehicle(vehicleId);
      } else if (action === 'remove' && typeof onRemoveVehicle === 'function') {
        onRemoveVehicle(vehicleId);
      }
    };
  },

  renderBookings(onStatusChange) {
    const container = document.getElementById('admin-bookings-table-body');
    if (!container) return;

    const bookings = AdminService.getAllBookings();

    // Summary Statistics
    const totalCount = bookings.length;
    const confirmedCount = bookings.filter(b => b.bookingStatus === 'Confirmed').length;
    const pendingCount = bookings.filter(b => b.bookingStatus === 'Pending Payment').length;
    const cancelledCount = bookings.filter(b => b.bookingStatus === 'Cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.bookingStatus === 'Confirmed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    DOMUtils.setText('stat-total-bookings', totalCount);
    DOMUtils.setText('stat-confirmed-bookings', confirmedCount);
    DOMUtils.setText('stat-pending-bookings', pendingCount);
    DOMUtils.setText('stat-cancelled-bookings', cancelledCount);
    DOMUtils.setText('stat-total-revenue', Formatters.formatCurrency(totalRevenue));

    if (bookings.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding: 2rem;">No bookings found across the system.</td>
        </tr>
      `;
      return;
    }

    container.innerHTML = bookings.map(b => {
      let bookBadgeClass = 'badge-warning';
      if (b.bookingStatus === 'Confirmed') bookBadgeClass = 'badge-success';
      if (b.bookingStatus === 'Cancelled') bookBadgeClass = 'badge-secondary';

      let payBadgeClass = 'badge-warning';
      if (b.paymentStatus === 'Successful') payBadgeClass = 'badge-success';
      if (b.paymentStatus === 'Failed') payBadgeClass = 'badge-danger';

      const safeId = DOMUtils.escapeHTML(b.id);
      const safeCustomerName = DOMUtils.escapeHTML(b.customerName);
      const safeCustomerEmail = DOMUtils.escapeHTML(b.customerEmail);
      const safeVehicleName = DOMUtils.escapeHTML(b.vehicleName);
      const safeVehicleId = DOMUtils.escapeHTML(b.vehicleId);

      return `
        <tr>
          <td><strong>${safeId}</strong></td>
          <td>
            <div>${safeCustomerName}</div>
            <div class="small text-muted">${safeCustomerEmail}</div>
          </td>
          <td>${safeVehicleName} (${safeVehicleId})</td>
          <td>
            <div class="small">${Formatters.formatDateTime(b.startDateTime)}</div>
            <div class="small text-muted">to ${Formatters.formatDateTime(b.endDateTime)} (${b.billableHours} hrs)</div>
          </td>
          <td><strong>${Formatters.formatCurrency(b.totalPrice)}</strong></td>
          <td><span class="badge ${payBadgeClass}">${DOMUtils.escapeHTML(b.paymentStatus)}</span></td>
          <td><span class="badge ${bookBadgeClass}">${DOMUtils.escapeHTML(b.bookingStatus)}</span></td>
          <td>
            <select class="admin-status-select" data-booking-id="${safeId}">
              <option value="Pending Payment" ${b.bookingStatus === 'Pending Payment' ? 'selected' : ''}>Pending Payment</option>
              <option value="Confirmed" ${b.bookingStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Cancelled" ${b.bookingStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    container.onchange = (e) => {
      const select = e.target.closest('select.admin-status-select');
      if (!select) return;
      const bookingId = select.getAttribute('data-booking-id');
      const newStatus = select.value;
      if (typeof onStatusChange === 'function') {
        onStatusChange(bookingId, newStatus);
      }
    };
  },

  openVehicleFormModal(vehicleId = null) {
    this.editingVehicleId = vehicleId;
    const modal = document.getElementById('modal-admin-vehicle');
    const title = document.getElementById('modal-admin-vehicle-title');
    const idInput = document.getElementById('admin-car-id');
    const nameInput = document.getElementById('admin-car-name');
    const catInput = document.getElementById('admin-car-category');
    const capInput = document.getElementById('admin-car-capacity');
    const transInput = document.getElementById('admin-car-transmission');
    const rateInput = document.getElementById('admin-car-rate');
    const descInput = document.getElementById('admin-car-description');

    if (vehicleId) {
      const vehicles = DataStore.getVehicles();
      const car = vehicles.find(v => v.id === vehicleId);
      if (!car) return;

      if (title) title.textContent = `Edit Vehicle: ${car.name} (${car.id})`;
      if (idInput) {
        idInput.value = car.id;
        idInput.readOnly = true;
      }
      if (nameInput) nameInput.value = car.name;
      if (catInput) catInput.value = car.category;
      if (capInput) capInput.value = car.capacity;
      if (transInput) transInput.value = car.transmission;
      if (rateInput) rateInput.value = car.hourlyRate;
      if (descInput) descInput.value = car.description || '';
    } else {
      if (title) title.textContent = 'Add New Vehicle to Fleet';
      const vehicles = DataStore.getVehicles();
      if (idInput) {
        idInput.value = `CAR00${vehicles.length + 1}`;
        idInput.readOnly = false;
      }
      if (nameInput) nameInput.value = '';
      if (catInput) catInput.value = 'Compact';
      if (capInput) capInput.value = '5';
      if (transInput) transInput.value = 'Automatic';
      if (rateInput) rateInput.value = '10.00';
      if (descInput) descInput.value = '';
    }

    if (modal) modal.classList.add('active');
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.AdminView = AdminView;
}
