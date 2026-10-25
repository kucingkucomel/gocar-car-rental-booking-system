/**
 * Admin View
 * Provides administrator fleet management, vehicle creation/editing/removal,
 * reservation oversight, and status updates according to FR-08 and BR-05.
 */

import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';
import { adminService } from '../services/admin-service.js';
import { authService } from '../services/auth-service.js';
import { vehicleService } from '../services/vehicle-service.js';
import { notifications } from '../components/notifications.js';
import { formatDisplayDateTime } from '../utils/date-utils.js';
import { formatCurrencyRM, escapeHtml } from '../utils/formatters.js';
import { $, $$ } from '../utils/dom-utils.js';

export class AdminView {
  /**
   * @param {HTMLElement} container
   * @param {Function} onNavigate
   */
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.activeTab = 'fleet'; // 'fleet' | 'bookings'
    this.editingVehicle = null; // null | vehicle object | 'new'
    this.bookingFilter = 'ALL';
  }

  /**
   * Renders the administrative dashboard.
   */
  render() {
    const user = authService.getCurrentUser();
    const isAdmin = authService.isAdmin();

    if (!user || !isAdmin) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚫</div>
          <h2>Administrator Access Required</h2>
          <p>You must be signed in with an administrator account (e.g. <code>admin@gocar.my</code>) to view this dashboard.</p>
          <button class="btn btn-primary" id="btn-admin-login">Sign In as Admin</button>
        </div>
      `;
      $('#btn-admin-login', this.container)?.addEventListener('click', () => {
        this.onNavigate('auth');
      });
      return;
    }

    const vehicles = vehicleService.getAllVehicles();
    let allBookings = adminService.getAllBookings();

    if (this.bookingFilter !== 'ALL') {
      allBookings = allBookings.filter(b => b.bookingStatus === this.bookingFilter);
    }
    // Sort bookings descending by created date
    allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.container.innerHTML = `
      <section class="admin-section">
        <div class="admin-header">
          <div>
            <span class="badge badge-admin-header mb-1">Administrative Portal</span>
            <h1 class="admin-title">Fleet &amp; Booking Management</h1>
            <p class="admin-subtitle">Logged in as Administrator: <strong>${user.name}</strong> (${user.email})</p>
          </div>
          <div class="admin-top-actions">
            <button type="button" class="btn btn-outline-danger btn-sm" id="btn-admin-reset-demo">
              ↻ Reset Demo Seed Data
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="admin-tabs" role="tablist">
          <button type="button" class="admin-tab ${this.activeTab === 'fleet' ? 'active' : ''}" id="tab-admin-fleet">
            🚗 Vehicle Fleet Management (${vehicles.length})
          </button>
          <button type="button" class="admin-tab ${this.activeTab === 'bookings' ? 'active' : ''}" id="tab-admin-bookings">
            📋 Customer Reservations (${allBookings.length})
          </button>
        </div>

        <!-- Tab 1: Vehicle Fleet Management -->
        <div class="admin-tab-pane ${this.activeTab === 'fleet' ? '' : 'is-hidden'}" id="pane-fleet">
          <div class="pane-action-bar">
            <h3>Vehicle Catalog</h3>
            <button type="button" class="btn btn-primary btn-sm" id="btn-add-vehicle">
              + Add New Vehicle
            </button>
          </div>

          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle Name</th>
                  <th>Category</th>
                  <th>Capacity</th>
                  <th>Transmission</th>
                  <th>Hourly Rate</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${vehicles.map(v => `
                  <tr>
                    <td><code>${escapeHtml(v.id)}</code></td>
                    <td><strong>${escapeHtml(v.name)}</strong></td>
                    <td><span class="badge badge-category">${escapeHtml(v.category)}</span></td>
                    <td>${v.capacity} Seats</td>
                    <td>${escapeHtml(v.transmission)}</td>
                    <td><strong>${formatCurrencyRM(v.hourlyRate)}/hr</strong></td>
                    <td>
                      <span class="badge ${v.isAvailable ? 'badge-success' : 'badge-danger'}">
                        ${v.isAvailable ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div class="table-action-btns">
                        <button type="button" class="btn btn-xs btn-outline-secondary btn-edit-vehicle" data-id="${escapeHtml(v.id)}">
                          Edit
                        </button>
                        <button type="button" class="btn btn-xs btn-outline-danger btn-delete-vehicle" data-id="${escapeHtml(v.id)}">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: Reservations Management -->
        <div class="admin-tab-pane ${this.activeTab === 'bookings' ? '' : 'is-hidden'}" id="pane-bookings">
          <div class="pane-action-bar">
            <div class="filter-group">
              <label for="select-booking-filter">Filter by Booking Status:</label>
              <select id="select-booking-filter" class="form-control form-control-sm">
                <option value="ALL" ${this.bookingFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
                <option value="${BOOKING_STATUS.PENDING_PAYMENT}" ${this.bookingFilter === BOOKING_STATUS.PENDING_PAYMENT ? 'selected' : ''}>Pending Payment</option>
                <option value="${BOOKING_STATUS.CONFIRMED}" ${this.bookingFilter === BOOKING_STATUS.CONFIRMED ? 'selected' : ''}>Confirmed</option>
                <option value="${BOOKING_STATUS.CANCELLED}" ${this.bookingFilter === BOOKING_STATUS.CANCELLED ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Schedule</th>
                  <th>Billable</th>
                  <th>Total</th>
                  <th>Booking Status</th>
                  <th>Payment Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                ${allBookings.length === 0 ? `
                  <tr>
                    <td colspan="9" class="text-center py-4">No reservations found matching this filter.</td>
                  </tr>
                ` : allBookings.map(b => this._renderBookingRow(b)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Add/Edit Vehicle Modal -->
      <div class="modal-backdrop ${this.editingVehicle ? 'is-active' : ''}" id="vehicle-form-modal">
        <div class="modal-dialog">
          ${this.editingVehicle ? this._renderVehicleModal(this.editingVehicle) : ''}
        </div>
      </div>
    `;

    this._attachListeners();
  }

  /**
   * Renders a table row for a booking.
   * @private
   * @param {import('../models/booking.js').Booking} b
   * @returns {string}
   */
  _renderBookingRow(b) {
    let bClass = 'badge-pending';
    if (b.bookingStatus === 'Confirmed') bClass = 'badge-success';
    else if (b.bookingStatus === 'Cancelled') bClass = 'badge-danger';

    let pClass = 'badge-pending';
    if (b.paymentStatus === 'Successful') pClass = 'badge-success';
    else if (b.paymentStatus === 'Failed') pClass = 'badge-danger';

    return `
      <tr>
        <td><strong>${escapeHtml(b.reference)}</strong></td>
        <td>
          <div>${escapeHtml(b.customerName || 'Customer')}</div>
          <small class="text-muted">${escapeHtml(b.customerEmail || b.customerId)}</small>
        </td>
        <td>
          <strong>${escapeHtml(b.vehicleDetails.name)}</strong>
          <small class="d-block text-muted">${escapeHtml(b.vehicleDetails.category)}</small>
        </td>
        <td>
          <small>
            ${formatDisplayDateTime(b.startTime)}<br/>
            ➔ ${formatDisplayDateTime(b.endTime)}
          </small>
        </td>
        <td>${b.billableHours} hrs</td>
        <td><strong>${formatCurrencyRM(b.totalPrice)}</strong></td>
        <td><span class="badge ${bClass}">${escapeHtml(b.bookingStatus)}</span></td>
        <td><span class="badge ${pClass}">${escapeHtml(b.paymentStatus)}</span></td>
        <td>
          <select class="form-control form-control-xs select-status-update" data-ref="${escapeHtml(b.reference)}">
            <option value="" disabled selected>Change Status...</option>
            <option value="CONFIRM">Mark Confirmed</option>
            <option value="CANCEL">Mark Cancelled</option>
            <option value="PAY_SUCCESS">Mark Payment Successful</option>
            <option value="PAY_FAIL">Mark Payment Failed</option>
          </select>
        </td>
      </tr>
    `;
  }

  /**
   * Renders the Add / Edit Vehicle modal.
   * @private
   * @param {Object|'new'} v
   * @returns {string}
   */
  _renderVehicleModal(v) {
    const isNew = v === 'new';
    const vehicle = isNew ? {
      id: `CAR${Date.now().toString().slice(-3)}`,
      name: '',
      category: 'Compact',
      capacity: 5,
      transmission: 'Automatic',
      hourlyRate: 10.00,
      isAvailable: true
    } : v;

    return `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${isNew ? 'Add New Fleet Vehicle' : 'Edit Vehicle Details'}</h3>
          <button type="button" class="btn-close-modal" id="btn-close-veh-modal">×</button>
        </div>

        <form id="form-admin-vehicle">
          <div class="modal-body">
            <div class="form-group">
              <label for="veh-id">Vehicle ID</label>
              <input type="text" id="veh-id" class="form-control" value="${escapeHtml(vehicle.id)}" ${isNew ? '' : 'readonly'} required />
            </div>

            <div class="form-group">
              <label for="veh-name">Vehicle Name / Model</label>
              <input type="text" id="veh-name" class="form-control" placeholder="e.g. Perodua Bezza" value="${escapeHtml(vehicle.name)}" required />
            </div>

            <div class="form-group">
              <label for="veh-category">Category</label>
              <select id="veh-category" class="form-control" required>
                <option value="Compact" ${vehicle.category === 'Compact' ? 'selected' : ''}>Compact</option>
                <option value="Hatchback" ${vehicle.category === 'Hatchback' ? 'selected' : ''}>Hatchback</option>
                <option value="Sedan" ${vehicle.category === 'Sedan' ? 'selected' : ''}>Sedan</option>
                <option value="MPV" ${vehicle.category === 'MPV' ? 'selected' : ''}>MPV</option>
                <option value="SUV" ${vehicle.category === 'SUV' ? 'selected' : ''}>SUV</option>
              </select>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="veh-capacity">Capacity (Seats)</label>
                <input type="number" id="veh-capacity" class="form-control" min="1" max="15" value="${vehicle.capacity}" required />
              </div>
              <div class="form-group">
                <label for="veh-transmission">Transmission</label>
                <select id="veh-transmission" class="form-control">
                  <option value="Automatic" ${vehicle.transmission === 'Automatic' ? 'selected' : ''}>Automatic</option>
                  <option value="Manual" ${vehicle.transmission === 'Manual' ? 'selected' : ''}>Manual</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="veh-rate">Hourly Rate (RM)</label>
              <input type="number" step="0.50" min="1" id="veh-rate" class="form-control" value="${vehicle.hourlyRate}" required />
            </div>

            <div class="form-check mt-3">
              <input type="checkbox" id="veh-available" ${vehicle.isAvailable ? 'checked' : ''} />
              <label for="veh-available">Vehicle Available for Booking</label>
            </div>

            <div class="form-error mt-2" id="veh-form-error" hidden></div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-veh-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-veh-save">
              ${isNew ? 'Create Vehicle' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Attaches event listeners.
   * @private
   */
  _attachListeners() {
    // Tabs
    $('#tab-admin-fleet', this.container)?.addEventListener('click', () => {
      this.activeTab = 'fleet';
      this.render();
    });

    $('#tab-admin-bookings', this.container)?.addEventListener('click', () => {
      this.activeTab = 'bookings';
      this.render();
    });

    // Reset demo seed
    $('#btn-admin-reset-demo', this.container)?.addEventListener('click', () => {
      const confirmed = window.confirm(
        'Reset demo fleet data and wipe bookings?\n\nThis will restore the 4 default seed vehicles from seed-data.md and reset demo users.'
      );
      if (confirmed) {
        adminService.resetSystemDemoData();
        notifications.success('Application demo data has been reset to seed values.');
        this.render();
      }
    });

    // Add Vehicle
    $('#btn-add-vehicle', this.container)?.addEventListener('click', () => {
      this.editingVehicle = 'new';
      this.render();
    });

    // Edit Vehicle
    $$('.btn-edit-vehicle', this.container).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.editingVehicle = vehicleService.getVehicleById(id);
        this.render();
      });
    });

    // Delete Vehicle (enforcing FR-08: no conflicting active bookings)
    $$('.btn-delete-vehicle', this.container).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const confirmed = window.confirm(`Are you sure you want to delete vehicle ${id}?`);
        if (confirmed) {
          try {
            adminService.removeVehicle(id);
            notifications.success(`Vehicle ${id} removed successfully.`);
            this.render();
          } catch (err) {
            notifications.error(err.message);
          }
        }
      });
    });

    // Booking status filter
    $('#select-booking-filter', this.container)?.addEventListener('change', (e) => {
      this.bookingFilter = e.target.value;
      this.render();
    });

    // Update individual booking status dropdowns
    $$('.select-status-update', this.container).forEach(select => {
      select.addEventListener('change', (e) => {
        const ref = select.dataset.ref;
        const action = e.target.value;

        try {
          if (action === 'CONFIRM') {
            adminService.updateBookingStatus(ref, BOOKING_STATUS.CONFIRMED, PAYMENT_STATUS.SUCCESSFUL);
            notifications.success(`Booking ${ref} confirmed.`);
          } else if (action === 'CANCEL') {
            adminService.updateBookingStatus(ref, BOOKING_STATUS.CANCELLED);
            notifications.success(`Booking ${ref} cancelled.`);
          } else if (action === 'PAY_SUCCESS') {
            adminService.updateBookingStatus(ref, BOOKING_STATUS.CONFIRMED, PAYMENT_STATUS.SUCCESSFUL);
            notifications.success(`Payment marked Successful for ${ref}.`);
          } else if (action === 'PAY_FAIL') {
            adminService.updateBookingStatus(ref, BOOKING_STATUS.PENDING_PAYMENT, PAYMENT_STATUS.FAILED);
            notifications.warning(`Payment marked Failed for ${ref}.`);
          }
          this.render();
        } catch (err) {
          notifications.error(err.message);
          this.render();
        }
      });
    });

    // Modal close & save handlers
    const closeModal = () => {
      this.editingVehicle = null;
      this.render();
    };

    $('#btn-close-veh-modal', this.container)?.addEventListener('click', closeModal);
    $('#btn-veh-cancel', this.container)?.addEventListener('click', closeModal);

    // Save vehicle form
    const form = $('#form-admin-vehicle', this.container);
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const errBox = $('#veh-form-error', this.container);
      errBox.hidden = true;

      const vehicleData = {
        id: $('#veh-id', this.container).value.trim(),
        name: $('#veh-name', this.container).value.trim(),
        category: $('#veh-category', this.container).value,
        capacity: Number($('#veh-capacity', this.container).value),
        transmission: $('#veh-transmission', this.container).value,
        hourlyRate: Number($('#veh-rate', this.container).value),
        isAvailable: $('#veh-available', this.container).checked
      };

      try {
        if (this.editingVehicle === 'new') {
          adminService.addVehicle(vehicleData);
          notifications.success(`Vehicle "${vehicleData.name}" added to fleet.`);
        } else {
          adminService.updateVehicle(vehicleData);
          notifications.success(`Vehicle "${vehicleData.name}" updated successfully.`);
        }
        this.editingVehicle = null;
        this.render();
      } catch (err) {
        errBox.textContent = err.message;
        errBox.hidden = false;
      }
    });
  }
}
