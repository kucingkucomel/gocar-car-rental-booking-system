/**
 * Storage Repository
 * Provides safe abstraction for persistent browser storage (localStorage)
 * with graceful memory fallback for testing environments and quota limits.
 */

class StorageRepository {
  constructor() {
    this._memoryFallback = new Map();
    this._isLocalStorageAvailable = this._checkLocalStorageAvailability();
  }

  /**
   * Detects whether window.localStorage is accessible.
   * @private
   * @returns {boolean}
   */
  _checkLocalStorageAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__gocar_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves an item from storage and parses JSON.
   * @template T
   * @param {string} key
   * @param {T} [defaultValue=null]
   * @returns {T}
   */
  getItem(key, defaultValue = null) {
    try {
      let raw = null;
      if (this._isLocalStorageAvailable) {
        raw = window.localStorage.getItem(key);
      } else {
        raw = this._memoryFallback.get(key) || null;
      }

      if (raw === null || raw === undefined) {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[StorageRepository] Failed to read key "${key}":`, err);
      return defaultValue;
    }
  }

  /**
   * Persists an item to storage with JSON serialization.
   * @param {string} key
   * @param {any} value
   * @returns {boolean} Success status
   */
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (this._isLocalStorageAvailable) {
        window.localStorage.setItem(key, serialized);
      } else {
        this._memoryFallback.set(key, serialized);
      }
      return true;
    } catch (err) {
      console.error(`[StorageRepository] Failed to write key "${key}":`, err);
      // Fallback to in-memory store if quota exceeded or storage blocked
      this._memoryFallback.set(key, JSON.stringify(value));
      return false;
    }
  }

  /**
   * Removes an item from storage.
   * @param {string} key
   */
  removeItem(key) {
    try {
      if (this._isLocalStorageAvailable) {
        window.localStorage.removeItem(key);
      }
      this._memoryFallback.delete(key);
    } catch (err) {
      console.warn(`[StorageRepository] Failed to remove key "${key}":`, err);
    }
  }

  /**
   * Clears all items managed by this storage repository.
   */
  clear() {
    try {
      if (this._isLocalStorageAvailable) {
        window.localStorage.clear();
      }
      this._memoryFallback.clear();
    } catch (err) {
      console.warn('[StorageRepository] Failed to clear storage:', err);
    }
  }
}

// Singleton storage repository instance
export const storageRepository = new StorageRepository();
