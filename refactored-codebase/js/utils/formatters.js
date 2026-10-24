/**
 * GoCar Car Rental Booking System - Formatting & Calculation Utilities
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Provides unified, pure formatting functions for currency, timestamps,
 * and duration rounding. Eliminates duplicated inline formatting throughout the codebase.
 */

const Formatters = {
  /**
   * Format numeric amount as Malaysian Ringgit (RM) with 2 decimal places (BR-01)
   * @param {number|string} amount 
   * @returns {string} e.g. "RM 58.00"
   */
  formatCurrency(amount) {
    const num = Number(amount);
    if (isNaN(num)) return 'RM 0.00';
    return `RM ${num.toFixed(2)}`;
  },

  /**
   * Format ISO date string for user-facing display
   * @param {string|Date} isoOrDateString 
   * @returns {string} e.g. "24 Oct 2026, 10:00 AM"
   */
  formatDateTime(isoOrDateString) {
    if (!isoOrDateString) return 'N/A';
    try {
      const date = new Date(isoOrDateString);
      if (isNaN(date.getTime())) return String(isoOrDateString);
      return date.toLocaleString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return String(isoOrDateString);
    }
  },

  /**
   * Converts a Date object to local datetime-local input string format (YYYY-MM-DDTHH:mm)
   * @param {Date} date 
   * @returns {string}
   */
  toLocalISOString(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date();
    }
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  },

  /**
   * Calculate rental duration in hours and rounded billable hours (FR-03, BR-01)
   * @param {string|Date} startInput 
   * @param {string|Date} endInput 
   * @returns {{ isValid: boolean, message: string|null, billableHours: number, rawHours: number }}
   */
  calculateRentalDuration(startInput, endInput) {
    if (!startInput || !endInput) {
      return {
        isValid: false,
        message: 'Both rental start and end date/time must be specified.',
        billableHours: 0,
        rawHours: 0
      };
    }

    const startDate = new Date(startInput);
    const endDate = new Date(endInput);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        isValid: false,
        message: 'Invalid date format selected.',
        billableHours: 0,
        rawHours: 0
      };
    }

    const diffMs = endDate.getTime() - startDate.getTime();

    if (diffMs <= 0) {
      return {
        isValid: false,
        message: 'Rental end time must be later than the start time.',
        billableHours: 0,
        rawHours: 0
      };
    }

    const rawHours = diffMs / (typeof TIME_CONSTANTS !== 'undefined' ? TIME_CONSTANTS.MS_PER_HOUR : 3600000);
    const billableHours = Math.ceil(rawHours);

    return {
      isValid: true,
      message: null,
      billableHours,
      rawHours: parseFloat(rawHours.toFixed(2))
    };
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.Formatters = Formatters;
}
