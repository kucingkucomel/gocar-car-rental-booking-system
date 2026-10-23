/**
 * Vehicle Repository
 * Data access layer for rental vehicles.
 */

import { STORAGE_KEYS, SEED_VEHICLES } from '../config/constants.js';
import { Vehicle } from '../models/vehicle.js';
import { storageRepository } from './storage-repository.js';

class VehicleRepository {
  constructor() {
    this._initializeSeedData();
  }

  /**
   * Initializes seed vehicles if none exist in storage.
   * @private
   */
  _initializeSeedData() {
    const existing = storageRepository.getItem(STORAGE_KEYS.VEHICLES, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageRepository.setItem(STORAGE_KEYS.VEHICLES, SEED_VEHICLES);
    }
  }

  /**
   * Resets vehicle fleet to authoritative seed data.
   */
  resetToSeed() {
    storageRepository.setItem(STORAGE_KEYS.VEHICLES, SEED_VEHICLES);
  }

  /**
   * Retrieves all vehicles.
   * @returns {Vehicle[]}
   */
  getAll() {
    const rawList = storageRepository.getItem(STORAGE_KEYS.VEHICLES, []);
    return rawList.map(raw => Vehicle.fromJSON(raw)).filter(Boolean);
  }

  /**
   * Finds a vehicle by ID.
   * @param {string} id
   * @returns {Vehicle|null}
   */
  getById(id) {
    if (!id) return null;
    const all = this.getAll();
    const found = all.find(v => v.id === id);
    return found || null;
  }

  /**
   * Creates a new vehicle record.
   * @param {Vehicle} vehicle
   * @returns {Vehicle}
   */
  create(vehicle) {
    const validation = vehicle.validate();
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (this.getById(vehicle.id)) {
      throw new Error(`Vehicle with ID "${vehicle.id}" already exists.`);
    }

    const all = this.getAll();
    all.push(vehicle);
    storageRepository.setItem(
      STORAGE_KEYS.VEHICLES,
      all.map(v => v.toJSON())
    );
    return vehicle;
  }

  /**
   * Updates an existing vehicle.
   * @param {Vehicle} vehicle
   * @returns {Vehicle}
   */
  update(vehicle) {
    const validation = vehicle.validate();
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const all = this.getAll();
    const index = all.findIndex(v => v.id === vehicle.id);
    if (index === -1) {
      throw new Error(`Vehicle with ID "${vehicle.id}" not found.`);
    }

    all[index] = vehicle;
    storageRepository.setItem(
      STORAGE_KEYS.VEHICLES,
      all.map(v => v.toJSON())
    );
    return vehicle;
  }

  /**
   * Deletes a vehicle by ID.
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    const all = this.getAll();
    const filtered = all.filter(v => v.id !== id);
    if (filtered.length === all.length) {
      return false;
    }

    storageRepository.setItem(
      STORAGE_KEYS.VEHICLES,
      filtered.map(v => v.toJSON())
    );
    return true;
  }
}

export const vehicleRepository = new VehicleRepository();
