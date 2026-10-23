/**
 * GoCar Car Rental Booking System - Vehicle Catalog View Module
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Renders fleet cards with category filtering, availability checks,
 * and safe HTML escaping.
 */

const VehicleView = {
  activeCategory: 'all',

  renderGrid(onSelectCarForBooking, onOpenCarDetails) {
    const container = document.getElementById('vehicles-grid');
    if (!container) return;

    const vehicles = DataStore.getVehicles();
    const filtered = this.activeCategory === 'all'
      ? vehicles
      : vehicles.filter(v => v.category.toLowerCase() === this.activeCategory.toLowerCase());

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No vehicles found in the "${DOMUtils.escapeHTML(this.activeCategory)}" category.</p>
        </div>
      `;
      return;
    }

    const heroStart = document.getElementById('hero-start-time')?.value;
    const heroEnd = document.getElementById('hero-end-time')?.value;
    const hasSearchDates = heroStart && heroEnd && new Date(heroEnd) > new Date(heroStart);

    container.innerHTML = filtered.map(car => {
      let availabilityBadge = `<span class="badge badge-success">Available</span>`;

      if (hasSearchDates) {
        const check = BookingService.checkVehicleAvailability(car.id, heroStart, heroEnd);
        if (!check.isAvailable) {
          availabilityBadge = `<span class="badge badge-warning" title="${DOMUtils.escapeHTML(check.message)}">Reserved for Selected Dates</span>`;
        }
      }

      const safeId = DOMUtils.escapeHTML(car.id);
      const safeName = DOMUtils.escapeHTML(car.name);
      const safeCategory = DOMUtils.escapeHTML(car.category);
      const safeDesc = DOMUtils.escapeHTML(car.description || 'Reliable car sharing vehicle.');
      const formattedRate = Formatters.formatCurrency(car.hourlyRate).replace('RM ', '');
      const safeTrans = DOMUtils.escapeHTML(car.transmission);
      const safeCap = DOMUtils.escapeHTML(car.capacity);

      return `
        <div class="vehicle-card" data-vehicle-id="${safeId}">
          <div class="vehicle-card-image-wrap">
            ${VehicleAssets.getCarSvgIllustration(car.image, car.name)}
            <span class="category-pill">${safeCategory}</span>
          </div>
          <div class="vehicle-card-body">
            <div class="vehicle-card-header">
              <h3 class="vehicle-name">${safeName}</h3>
              <div class="vehicle-price-tag">
                <span class="currency">RM</span>
                <span class="rate">${formattedRate}</span>
                <span class="unit">/ hr</span>
              </div>
            </div>

            <p class="vehicle-desc">${safeDesc}</p>

            <div class="vehicle-specs-list">
              <div class="spec-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>${safeCap} Seats</span>
              </div>
              <div class="spec-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                <span>${safeTrans}</span>
              </div>
              <div class="spec-item">
                ${availabilityBadge}
              </div>
            </div>

            <div class="vehicle-card-actions">
              <button type="button" class="btn btn-secondary btn-sm" data-action="details" data-vehicle-id="${safeId}">
                Details
              </button>
              <button type="button" class="btn btn-primary btn-sm btn-book" data-action="book" data-vehicle-id="${safeId}">
                Book Now
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Event delegation on the container
    container.onclick = (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const vehicleId = btn.getAttribute('data-vehicle-id');

      if (action === 'details' && typeof onOpenCarDetails === 'function') {
        onOpenCarDetails(vehicleId);
      } else if (action === 'book' && typeof onSelectCarForBooking === 'function') {
        onSelectCarForBooking(vehicleId);
      }
    };
  },

  openDetailsModal(vehicleId, onBookFromDetails) {
    const vehicles = DataStore.getVehicles();
    const car = vehicles.find(v => v.id === vehicleId);
    if (!car) return;

    DOMUtils.setText('modal-details-name', car.name);
    DOMUtils.setText('modal-details-category', car.category);
    DOMUtils.setText('modal-details-rate', `${Formatters.formatCurrency(car.hourlyRate)} / hour`);
    DOMUtils.setText('modal-details-capacity', `${car.capacity} Passengers`);
    DOMUtils.setText('modal-details-transmission', car.transmission);
    DOMUtils.setText('modal-details-desc', car.description || 'Reliable and comfortable car sharing vehicle.');

    const imageWrap = document.getElementById('modal-details-image');
    if (imageWrap) {
      imageWrap.innerHTML = VehicleAssets.getCarSvgIllustration(car.image, car.name);
    }

    const btnBookFromDetails = document.getElementById('btn-details-book-now');
    if (btnBookFromDetails) {
      btnBookFromDetails.onclick = () => {
        document.getElementById('modal-vehicle-details')?.classList.remove('active');
        if (typeof onBookFromDetails === 'function') {
          onBookFromDetails(car.id);
        }
      };
    }

    const modal = document.getElementById('modal-vehicle-details');
    if (modal) modal.classList.add('active');
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.VehicleView = VehicleView;
}
