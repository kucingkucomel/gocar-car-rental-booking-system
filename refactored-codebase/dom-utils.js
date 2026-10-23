/**
 * GoCar Car Rental Booking System - DOM & Security Utilities
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Provides safe DOM manipulation methods and HTML entity escaping
 * to mitigate Cross-Site Scripting (XSS) vulnerabilities.
 */

const DOMUtils = {
  /**
   * Escape special HTML characters to prevent XSS injection
   * @param {string|any} str 
   * @returns {string} Safe HTML-encoded string
   */
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Safely set element textContent by ID or Element reference
   * @param {string|HTMLElement} target 
   * @param {string} text 
   */
  setText(target, text) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (el) {
      el.textContent = text !== null && text !== undefined ? String(text) : '';
    }
  },

  /**
   * Safely set display style property
   * @param {string|HTMLElement} target 
   * @param {string} displayValue 
   */
  setDisplay(target, displayValue) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (el) {
      el.style.display = displayValue;
    }
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.DOMUtils = DOMUtils;
}
