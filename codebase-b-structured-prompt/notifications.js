/**
 * Notification Component
 * Displays accessible toast notifications and banners for user feedback.
 */

import { createElement, $ } from '../utils/dom-utils.js';

class NotificationManager {
  constructor() {
    this._container = null;
  }

  /**
   * Initializes or returns the notification container.
   * @private
   * @returns {HTMLElement}
   */
  _getContainer() {
    if (!this._container) {
      let existing = $('#notification-container');
      if (!existing) {
        existing = createElement('div', {
          id: 'notification-container',
          className: 'notification-container',
          'aria-live': 'polite',
          'aria-atomic': 'true'
        });
        document.body.appendChild(existing);
      }
      this._container = existing;
    }
    return this._container;
  }

  /**
   * Shows a notification banner.
   * @param {string} message - Notification message
   * @param {'success'|'error'|'info'|'warning'} [type='info']
   * @param {number} [durationMs=4500]
   */
  show(message, type = 'info', durationMs = 4500) {
    const container = this._getContainer();

    const toast = createElement('div', {
      className: `notification-toast notification-${type}`,
      role: 'alert'
    });

    const iconSpan = createElement('span', { className: 'notification-icon' });
    if (type === 'success') iconSpan.textContent = '✓';
    else if (type === 'error') iconSpan.textContent = '⚠';
    else if (type === 'warning') iconSpan.textContent = '⚡';
    else iconSpan.textContent = 'ℹ';

    const msgSpan = createElement('span', { className: 'notification-message' }, message);

    const closeBtn = createElement(
      'button',
      {
        type: 'button',
        className: 'notification-close-btn',
        'aria-label': 'Close notification',
        onClick: () => this._dismiss(toast)
      },
      '×'
    );

    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    if (durationMs > 0) {
      setTimeout(() => {
        this._dismiss(toast);
      }, durationMs);
    }
  }

  /**
   * Dismisses a toast smoothly.
   * @private
   * @param {HTMLElement} toast
   */
  _dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('notification-leaving');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  success(msg, duration) { this.show(msg, 'success', duration); }
  error(msg, duration) { this.show(msg, 'error', duration || 6000); }
  info(msg, duration) { this.show(msg, 'info', duration); }
  warning(msg, duration) { this.show(msg, 'warning', duration); }
}

export const notifications = new NotificationManager();
