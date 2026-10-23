/**
 * Vehicle Service
 * Handles vehicle queries, catalog filtering, and vehicle detail retrieval according to FR-02.
 */

import { vehicleRepository } from '../repositories/vehicle-repository.js';

class VehicleService {
  /**
   * Retrieves all vehicles in the catalog.
   * @returns {import('../models/vehicle.js').Vehicle[]}
   */
  getAllVehicles() {
    return vehicleRepository.getAll();
  }

  /**
   * Retrieves a vehicle by ID.
   * @param {string} id
   * @returns {import('../models/vehicle.js').Vehicle|null}
   */
  getVehicleById(id) {
    return vehicleRepository.getById(id);
  }

  /**
   * Retrieves unique vehicle categories present in the fleet.
   * @returns {string[]}
   */
  getCategories() {
    const vehicles = this.getAllVehicles();
    const categories = new Set(vehicles.map(v => v.category));
    return Array.from(categories).sort();
  }

  /**
   * Filters vehicles by criteria.
   * @param {Object} [filters={}]
   * @param {string} [filters.category]
   * @param {string} [filters.search]
   * @returns {import('../models/vehicle.js').Vehicle[]}
   */
  filterVehicles({ category, search } = {}) {
    let vehicles = this.getAllVehicles();

    if (category && category !== 'ALL') {
      vehicles = vehicles.filter(v => v.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      vehicles = vehicles.filter(
        v =>
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      );
    }

    return vehicles;
  }
}

export const vehicleService = new VehicleService();
