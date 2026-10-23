/**
 * Vehicle View
 * Renders the vehicle fleet catalog, category filters, and vehicle detail modal according to FR-02.
 */

import { vehicleService } from '../services/vehicle-service.js';
import { formatCurrencyRM, escapeHtml } from '../utils/formatters.js';
import { $, $$ } from '../utils/dom-utils.js';

export class VehicleView {
  /**
   * @param {HTMLElement} container
   * @param {Function} onNavigate
   */
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.selectedCategory = 'ALL';
    this.searchQuery = '';
    this.activeDetailVehicle = null;
  }

  /**
   * Renders the vehicles view.
   */
  render() {
    const categories = vehicleService.getCategories();
    const vehicles = vehicleService.filterVehicles({
      category: this.selectedCategory,
      search: this.searchQuery
    });

    this.container.innerHTML = `
      <section class="catalog-section">
        <div class="catalog-header">
          <div class="catalog-title-wrap">
            <h1 class="catalog-title">Explore GoCar Fleet</h1>
            <p class="catalog-subtitle">Select a vehicle to view pricing, add CDW/Flex protection, and reserve online.</p>
          </div>

          <!-- Quick Filters -->
          <div class="catalog-controls">
            <div class="search-box">
              <input type="text" id="vehicle-search-input" class="form-control" placeholder="Search by model or category..." value="${escapeHtml(this.searchQuery)}" />
            </div>
            <div class="category-pills" role="radiogroup" aria-label="Vehicle categories">
              <button type="button" class="pill-btn ${this.selectedCategory === 'ALL' ? 'active' : ''}" data-category="ALL">
                All Fleet (${vehicleService.getAllVehicles().length})
              </button>
              ${categories.map(cat => `
                <button type="button" class="pill-btn ${this.selectedCategory === cat ? 'active' : ''}" data-category="${escapeHtml(cat)}">
                  ${escapeHtml(cat)}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Vehicle Grid -->
        <div class="vehicle-grid" id="vehicle-grid">
          ${vehicles.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🚗</div>
              <h3>No vehicles match your filter</h3>
              <p>Try selecting another category or clear your search query.</p>
              <button class="btn btn-outline-primary" id="btn-clear-filters">Clear Filters</button>
            </div>
          ` : vehicles.map(vehicle => this._renderVehicleCard(vehicle)).join('')}
        </div>
      </section>

      <!-- Vehicle Detail Modal -->
      <div class="modal-backdrop ${this.activeDetailVehicle ? 'is-active' : ''}" id="vehicle-detail-modal" aria-hidden="${!this.activeDetailVehicle}">
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-vehicle-title">
          ${this.activeDetailVehicle ? this._renderModalContent(this.activeDetailVehicle) : ''}
        </div>
      </div>
    `;

    this._attachListeners();
  }

  /**
   * Renders single vehicle card.
   * @private
   * @param {import('../models/vehicle.js').Vehicle} vehicle
   * @returns {string}
   */
  _renderVehicleCard(vehicle) {
    const isAvail = vehicle.isAvailable;
    const placeholderSvg = this._getVehicleSvg(vehicle.category);

    return `
      <div class="vehicle-card ${isAvail ? '' : 'vehicle-card-disabled'}" data-id="${vehicle.id}">
        <div class="vehicle-card-badge-wrap">
          <span class="badge badge-category">${escapeHtml(vehicle.category)}</span>
          <span class="badge ${isAvail ? 'badge-success' : 'badge-danger'}">
            ${isAvail ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div class="vehicle-card-media">
          <div class="vehicle-svg-container">
            ${placeholderSvg}
          </div>
        </div>

        <div class="vehicle-card-body">
          <div class="vehicle-id-tag">${escapeHtml(vehicle.id)}</div>
          <h3 class="vehicle-card-title">${escapeHtml(vehicle.name)}</h3>

          <div class="vehicle-specs-list">
            <span class="spec-item" title="Passenger Capacity">
              👥 <strong>${vehicle.capacity}</strong> Seats
            </span>
            <span class="spec-item" title="Transmission">
              ⚙️ <strong>${escapeHtml(vehicle.transmission)}</strong>
            </span>
          </div>

          <div class="vehicle-price-box">
            <span class="rate-label">Hourly Rate:</span>
            <span class="rate-amount">${formatCurrencyRM(vehicle.hourlyRate)}</span>
            <span class="rate-unit">/ hour</span>
          </div>
        </div>

        <div class="vehicle-card-footer">
          <button type="button" class="btn btn-outline-secondary btn-sm btn-view-details" data-id="${vehicle.id}">
            View Details
          </button>
          <button type="button" class="btn btn-primary btn-sm btn-book-vehicle" data-id="${vehicle.id}" ${isAvail ? '' : 'disabled'}>
            Book Now ➔
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Returns clean, attractive inline SVG illustration for vehicle category.
   * @private
   * @param {string} category
   * @returns {string}
   */
  _getVehicleSvg(category) {
    const cat = (category || '').toLowerCase();
    let bodyColor = '#e2231a'; // GoCar red
    let roofOffset = '45';

    if (cat.includes('compact')) {
      bodyColor = '#e2231a';
      roofOffset = '50';
    } else if (cat.includes('hatchback')) {
      bodyColor = '#0284c7';
      roofOffset = '40';
    } else if (cat.includes('sedan')) {
      bodyColor = '#10b981';
      roofOffset = '35';
    } else if (cat.includes('mpv')) {
      bodyColor = '#8b5cf6';
      roofOffset = '20';
    }

    return `
      <svg viewBox="0 0 240 110" class="car-illustration" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="55" width="210" height="30" rx="10" fill="${bodyColor}" />
        <path d="M 40 55 Q 70 ${roofOffset} 100 ${roofOffset} L 160 ${roofOffset} Q 195 55 205 55 Z" fill="${bodyColor}" />
        <!-- Windows -->
        <path d="M 72 53 L 98 42 L 132 42 L 132 53 Z" fill="#dbeafe" opacity="0.9" />
        <path d="M 138 42 L 165 42 L 180 53 L 138 53 Z" fill="#dbeafe" opacity="0.9" />
        <!-- Headlights -->
        <rect x="215" y="60" width="10" height="8" rx="3" fill="#fef08a" />
        <rect x="15" y="60" width="8" height="8" rx="3" fill="#fca5a5" />
        <!-- Wheels -->
        <circle cx="65" cy="85" r="16" fill="#1e293b" />
        <circle cx="65" cy="85" r="8" fill="#94a3b8" />
        <circle cx="175" cy="85" r="16" fill="#1e293b" />
        <circle cx="175" cy="85" r="8" fill="#94a3b8" />
      </svg>
    `;
  }

  /**
   * Renders the detail modal content.
   * @private
   * @param {import('../models/vehicle.js').Vehicle} vehicle
   * @returns {string}
   */
  _renderModalContent(vehicle) {
    return `
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <span class="badge badge-category">${escapeHtml(vehicle.category)}</span>
            <h3 class="modal-title" id="modal-vehicle-title">${escapeHtml(vehicle.name)}</h3>
            <span class="modal-id-sub">Vehicle Code: ${escapeHtml(vehicle.id)}</span>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-modal" aria-label="Close modal">×</button>
        </div>

        <div class="modal-body">
          <div class="modal-vehicle-visual">
            ${this._getVehicleSvg(vehicle.category)}
          </div>

          <div class="vehicle-specs-grid">
            <div class="spec-box">
              <span class="spec-label">Category</span>
              <strong class="spec-val">${escapeHtml(vehicle.category)}</strong>
            </div>
            <div class="spec-box">
              <span class="spec-label">Passenger Capacity</span>
              <strong class="spec-val">${vehicle.capacity} Persons</strong>
            </div>
            <div class="spec-box">
              <span class="spec-label">Transmission</span>
              <strong class="spec-val">${escapeHtml(vehicle.transmission)}</strong>
            </div>
            <div class="spec-box">
              <span class="spec-label">Hourly Rental Rate</span>
              <strong class="spec-val price-highlight">${formatCurrencyRM(vehicle.hourlyRate)} / hr</strong>
            </div>
          </div>

          <div class="modal-features-list">
            <h4>Included Fleet Features</h4>
            <ul>
              <li>Air Conditioning &amp; Clean Modern Interior</li>
              <li>Dual Airbags &amp; ABS Braking System</li>
              <li>Keyless Ignition or Digital Access Enabled</li>
              <li>Shared Seed Baseline Rate according to CSEB5213 specification</li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-modal-close-footer">Back</button>
          <button type="button" class="btn btn-primary" id="btn-modal-book" data-id="${vehicle.id}" ${vehicle.isAvailable ? '' : 'disabled'}>
            Book This ${escapeHtml(vehicle.name)} ➔
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attaches event listeners.
   * @private
   */
  _attachListeners() {
    // Search input
    const searchInput = $('#vehicle-search-input', this.container);
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.render();
      const updatedInput = $('#vehicle-search-input', this.container);
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
      }
    });

    // Category pills
    $$('.pill-btn', this.container).forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCategory = btn.dataset.category;
        this.render();
      });
    });

    // Clear filters
    $('#btn-clear-filters', this.container)?.addEventListener('click', () => {
      this.selectedCategory = 'ALL';
      this.searchQuery = '';
      this.render();
    });

    // Book Now buttons
    $$('.btn-book-vehicle', this.container).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.onNavigate('booking', { vehicleId: id });
      });
    });

    // View Details buttons
    $$('.btn-view-details', this.container).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.activeDetailVehicle = vehicleService.getVehicleById(id);
        this.render();
      });
    });

    // Modal close buttons
    const closeModal = () => {
      this.activeDetailVehicle = null;
      this.render();
    };

    $('#btn-close-modal', this.container)?.addEventListener('click', closeModal);
    $('#btn-modal-close-footer', this.container)?.addEventListener('click', closeModal);
    $('#btn-modal-book', this.container)?.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      this.activeDetailVehicle = null;
      this.onNavigate('booking', { vehicleId: id });
    });
  }
}
