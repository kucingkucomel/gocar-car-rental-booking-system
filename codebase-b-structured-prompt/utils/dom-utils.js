/**
 * DOM Manipulation Helpers
 * Provides clean, safe helper functions for interacting with the DOM.
 */

/**
 * Selects a single DOM element.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Selects all matching DOM elements as an Array.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Creates an element with optional attributes and children.
 * @param {string} tag
 * @param {Object} [attributes={}]
 * @param {...(Node|string)} children
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset' && typeof value === 'object') {
      for (const [dataKey, dataVal] of Object.entries(value)) {
        el.dataset[dataKey] = dataVal;
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (value !== false && value !== null && value !== undefined) {
      el.setAttribute(key, value === true ? '' : value);
    }
  }

  for (const child of children) {
    if (child === null || child === undefined) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Removes all child nodes from an element.
 * @param {HTMLElement} element
 */
export function clearElement(element) {
  if (!element) return;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Shows an element by removing hidden attribute or class.
 * @param {HTMLElement} element
 */
export function showElement(element) {
  if (!element) return;
  element.removeAttribute('hidden');
  element.classList.remove('is-hidden');
}

/**
 * Hides an element.
 * @param {HTMLElement} element
 */
export function hideElement(element) {
  if (!element) return;
  element.setAttribute('hidden', '');
  element.classList.add('is-hidden');
}

/**
 * Toggles visibility of an element.
 * @param {HTMLElement} element
 * @param {boolean} [show]
 */
export function toggleElement(element, show) {
  if (!element) return;
  const isCurrentlyHidden = element.hasAttribute('hidden') || element.classList.contains('is-hidden');
  const shouldShow = show !== undefined ? show : isCurrentlyHidden;
  if (shouldShow) {
    showElement(element);
  } else {
    hideElement(element);
  }
}
