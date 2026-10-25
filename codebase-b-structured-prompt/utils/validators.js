/**
 * Validation Utilities
 * Centralized validation functions for forms, inputs, and business rules.
 */

/**
 * Validates email format according to standard pattern.
 * @param {string} email
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }
  return { isValid: true };
}

/**
 * Validates password length and presence.
 * @param {string} password
 * @param {number} minLength
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters.` };
  }
  return { isValid: true };
}

/**
 * Validates required text field.
 * @param {any} value
 * @param {string} fieldName
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateRequired(value, fieldName = 'Field') {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true };
}

/**
 * Validates positive number.
 * @param {any} value
 * @param {string} fieldName
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validatePositiveNumber(value, fieldName = 'Value') {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: `${fieldName} must be a valid positive number greater than 0.` };
  }
  return { isValid: true };
}

/**
 * Validates rental start and end dates.
 * Enforces FR-03:
 * - Start and end dates must be provided.
 * - End date must be strictly later than start date.
 * @param {string|Date} startTime
 * @param {string|Date} endTime
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateRentalDates(startTime, endTime) {
  if (!startTime) {
    return { isValid: false, error: 'Rental start date and time is required.' };
  }
  if (!endTime) {
    return { isValid: false, error: 'Rental end date and time is required.' };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Invalid rental start date and time format.' };
  }
  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid rental end date and time format.' };
  }

  if (end.getTime() <= start.getTime()) {
    return { isValid: false, error: 'Rental end date and time must be later than the start date and time.' };
  }

  const durationMs = end.getTime() - start.getTime();
  // Minimum duration: at least 1 minute
  if (durationMs < 60 * 1000) {
    return { isValid: false, error: 'Rental duration must be at least 1 minute.' };
  }

  return { isValid: true };
}
