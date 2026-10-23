/**
 * Vehicle Model
 * Represents a rental car in the fleet.
 */

export class Vehicle {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.name
   * @param {string} data.category
   * @param {number} data.capacity
   * @param {string} [data.transmission='Automatic']
   * @param {number} data.hourlyRate
   * @param {string} [data.imageUrl='']
   * @param {boolean} [data.isAvailable=true]
   * @param {string} [data.createdAt]
   */
  constructor({
    id,
    name,
    category,
    capacity = 5,
    transmission = 'Automatic',
    hourlyRate,
    imageUrl = '',
    isAvailable = true,
    createdAt
  }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.capacity = Number(capacity) || 5;
    this.transmission = transmission;
    this.hourlyRate = Number(hourlyRate);
    this.imageUrl = imageUrl;
    this.isAvailable = Boolean(isAvailable);
    this.createdAt = createdAt || new Date().toISOString();
  }

  /**
   * Validates required vehicle attributes.
   * @returns {{ isValid: boolean, error?: string }}
   */
  validate() {
    if (!this.id || typeof this.id !== 'string') {
      return { isValid: false, error: 'Vehicle ID is required.' };
    }
    if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
      return { isValid: false, error: 'Vehicle name is required.' };
    }
    if (!this.category || typeof this.category !== 'string') {
      return { isValid: false, error: 'Category is required.' };
    }
    if (isNaN(this.capacity) || this.capacity <= 0) {
      return { isValid: false, error: 'Capacity must be at least 1 person.' };
    }
    if (isNaN(this.hourlyRate) || this.hourlyRate <= 0) {
      return { isValid: false, error: 'Hourly rate must be greater than 0.' };
    }
    return { isValid: true };
  }

  /**
   * Serializes vehicle for persistence.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      capacity: this.capacity,
      transmission: this.transmission,
      hourlyRate: this.hourlyRate,
      imageUrl: this.imageUrl,
      isAvailable: this.isAvailable,
      createdAt: this.createdAt
    };
  }

  /**
   * Instantiates a Vehicle from a stored object.
   * @param {Object} raw
   * @returns {Vehicle}
   */
  static fromJSON(raw) {
    if (!raw) return null;
    return new Vehicle(raw);
  }
}
