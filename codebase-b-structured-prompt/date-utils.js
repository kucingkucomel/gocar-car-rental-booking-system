/**
 * Date and Time Utilities
 * Centralized logic for date parsing, formatting, duration calculations,
 * billable hours determination, and interval overlap detection.
 */

/**
 * Parses any date representation into a valid Date object.
 * @param {string|number|Date} dateInput
 * @returns {Date}
 */
export function parseDate(dateInput) {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  return new Date(dateInput);
}

/**
 * Calculates raw duration in hours as a floating-point number.
 * @param {string|Date} startTime
 * @param {string|Date} endTime
 * @returns {number} Floating point hours
 */
export function calculateDurationHours(startTime, endTime) {
  const start = parseDate(startTime);
  const end = parseDate(endTime);
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;
  return diffMs / (1000 * 60 * 60);
}

/**
 * Calculates billable hours according to BR-01:
 * "Billable hours are calculated by rounding the rental duration up to the next whole hour."
 * @param {string|Date} startTime
 * @param {string|Date} endTime
 * @returns {number} Whole integer hours rounded up
 */
export function calculateBillableHours(startTime, endTime) {
  const rawHours = calculateDurationHours(startTime, endTime);
  if (rawHours <= 0) return 0;
  return Math.ceil(rawHours);
}

/**
 * Checks whether two time intervals overlap.
 * Uses half-open interval rule [start, end) where adjacent intervals
 * (e.g. Booking 1 ending at 14:00 and Booking 2 starting at 14:00) do NOT overlap.
 * 
 * Interval A overlaps with Interval B iff:
 *   startA < endB AND endA > startB
 * 
 * @param {string|Date} startA
 * @param {string|Date} endA
 * @param {string|Date} startB
 * @param {string|Date} endB
 * @returns {boolean}
 */
export function isDateRangeOverlapping(startA, endA, startB, endB) {
  const sA = parseDate(startA).getTime();
  const eA = parseDate(endA).getTime();
  const sB = parseDate(startB).getTime();
  const eB = parseDate(endB).getTime();

  return sA < eB && eA > sB;
}

/**
 * Formats a date into a human-readable string: "DD MMM YYYY, hh:mm A"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDisplayDateTime(dateInput) {
  if (!dateInput) return '—';
  const d = parseDate(dateInput);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strHours = String(hours).padStart(2, '0');

  return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
}

/**
 * Formats a Date object to the standard input format for datetime-local: "YYYY-MM-DDTHH:MM"
 * @param {Date} date
 * @returns {string}
 */
export function toDatetimeLocalString(date) {
  const d = parseDate(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Returns a default starting datetime (e.g. today rounded to the next hour)
 * @returns {string}
 */
export function getDefaultStartDateTime() {
  const now = new Date();
  now.setHours(now.getHours() + 1, 0, 0, 0);
  return toDatetimeLocalString(now);
}

/**
 * Returns a default end datetime (e.g. 5 hours after default start)
 * @param {string|Date} [fromStart]
 * @param {number} [hoursAhead=5]
 * @returns {string}
 */
export function getDefaultEndDateTime(fromStart, hoursAhead = 5) {
  const start = fromStart ? parseDate(fromStart) : new Date();
  if (!fromStart) {
    start.setHours(start.getHours() + 1, 0, 0, 0);
  }
  const end = new Date(start.getTime() + hoursAhead * 60 * 60 * 1000);
  return toDatetimeLocalString(end);
}
