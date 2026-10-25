/**
 * Formatting Utilities
 * Standardizes currency, time, and text representation across all views and components.
 */

import { CURRENCY } from '../config/constants.js';

/**
 * Formats a numeric value into Malaysian Ringgit currency string with 2 decimal places.
 * Example: formatCurrencyRM(58) => "RM 58.00"
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrencyRM(amount) {
  const num = Number(amount);
  if (isNaN(num)) {
    return `${CURRENCY} 0.00`;
  }
  return `${CURRENCY} ${num.toFixed(2)}`;
}

/**
 * Formats hours into human-readable label.
 * Example: formatHours(1) => "1 hour", formatHours(5) => "5 hours"
 * @param {number} hours
 * @returns {string}
 */
export function formatHours(hours) {
  const num = Number(hours);
  if (isNaN(num) || num === 0) return '0 hours';
  return num === 1 ? '1 hour' : `${num} hours`;
}

/**
 * Escapes unsafe HTML characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
