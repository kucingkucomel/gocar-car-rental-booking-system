/**
 * GoCar Car Rental Booking System - Notification UI Service
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Provides accessible, safe toast notifications with auto-fade and dismiss capabilities.
 * Guarantees that message strings cannot inject malicious HTML.
 */

const NotificationUI = {
  /**
   * Display a toast notification
   * @param {string} message 
   * @param {'info'|'success'|'error'|'warning'} type 
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const safeMessage = typeof DOMUtils !== 'undefined'
      ? DOMUtils.escapeHTML(message)
      : String(message);

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-indicator"></span>
        <span class="toast-message">${safeMessage}</span>
      </div>
      <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.remove();
      });
    }

    container.appendChild(toast);

    const duration = typeof TIME_CONSTANTS !== 'undefined' ? TIME_CONSTANTS.TOAST_DURATION_MS : 4500;
    const fadeDuration = typeof TIME_CONSTANTS !== 'undefined' ? TIME_CONSTANTS.TOAST_FADE_MS : 400;

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, fadeDuration);
    }, duration);
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.NotificationUI = NotificationUI;
}
