/**
 * Shared toast notification utility.
 * This is a browser-global script loaded before app.js.
 */
const NotificationUtils = {
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const content = document.createElement('div');
    content.className = 'toast-content';

    const indicator = document.createElement('span');
    indicator.className = 'toast-indicator';

    const messageElement = document.createElement('span');
    messageElement.className = 'toast-message';
    messageElement.textContent = String(message);

    content.append(indicator, messageElement);

    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.addEventListener('click', () => toast.remove());

    toast.append(content, closeButton);
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 400);
    }, 4500);
  }
};
