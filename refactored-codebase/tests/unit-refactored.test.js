/**
 * Unit & Regression Test Suite for Refactored Modules
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Verifies newly extracted modules, edge cases, XSS escaping,
 * formatters, unified business rules, and error handling.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock localStorage
const localStorageStore = {};
const mockLocalStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, val) => { localStorageStore[key] = String(val); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

const sandbox = {
  console,
  Date,
  Math,
  String,
  Number,
  parseFloat,
  parseInt,
  isNaN,
  JSON,
  localStorage: mockLocalStorage
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;

vm.createContext(sandbox);

function runFile(filePath) {
  let code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
  code = code.replace(/\bconst\s+([A-Za-z0-9_]+)\s*=/g, 'var $1 =');
  code = code.replace(/\blet\s+([A-Za-z0-9_]+)\s*=/g, 'var $1 =');
  vm.runInContext(code, sandbox);
}

runFile('js/constants/app-constants.js');
runFile('js/utils/formatters.js');
runFile('js/utils/dom-utils.js');
runFile('js/utils/badge-utils.js');
runFile('js/services/data-store.js');
runFile('js/services/auth-service.js');
runFile('js/services/booking-service.js');
runFile('js/services/admin-service.js');
runFile('js/ui/vehicle-assets.js');

const DOMUtils = sandbox.DOMUtils;
const Formatters = sandbox.Formatters;
const BadgeUtils = sandbox.BadgeUtils;
const BookingService = sandbox.BookingService;
const AdminService = sandbox.AdminService;
const AuthService = sandbox.AuthService;
const VehicleAssets = sandbox.VehicleAssets;
const DataStore = sandbox.DataStore;

let unitPassed = 0;
let unitTotal = 0;

function assertUnit(condition, testName) {
  unitTotal++;
  if (condition) {
    console.log(`[PASS] Unit Test ${unitTotal}: ${testName}`);
    unitPassed++;
  } else {
    console.error(`[FAIL] Unit Test ${unitTotal}: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('--- STARTING UNIT & REGRESSION TEST SUITE ---');

// 1. DOMUtils: XSS escaping checks
const xssPayload1 = '<script>alert("XSS")</script>';
const xssPayload2 = '<img src=x onerror=alert(1)>';
const xssPayload3 = 'Tom & Jerry "Special" \'Edition\'';
assertUnit(
  DOMUtils.escapeHTML(xssPayload1) === '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
  'DOMUtils.escapeHTML escapes script tags and double quotes'
);
assertUnit(
  DOMUtils.escapeHTML(xssPayload2) === '&lt;img src=x onerror=alert(1)&gt;',
  'DOMUtils.escapeHTML escapes tag brackets in img payloads'
);
assertUnit(
  DOMUtils.escapeHTML(xssPayload3) === 'Tom &amp; Jerry &quot;Special&quot; &#039;Edition&#039;',
  'DOMUtils.escapeHTML escapes ampersands, quotes, and apostrophes'
);
assertUnit(
  DOMUtils.escapeHTML(null) === '' && DOMUtils.escapeHTML(undefined) === '',
  'DOMUtils.escapeHTML handles null and undefined safely'
);

// 2. Formatters: Currency Formatting
assertUnit(Formatters.formatCurrency(58) === 'RM 58.00', 'Formatters.formatCurrency formats integers as RM XX.XX');
assertUnit(Formatters.formatCurrency(12.5) === 'RM 12.50', 'Formatters.formatCurrency formats single decimal place');
assertUnit(Formatters.formatCurrency('not a number') === 'RM 0.00', 'Formatters.formatCurrency handles non-numeric input gracefully');
assertUnit(Formatters.formatCurrency(0) === 'RM 0.00', 'Formatters.formatCurrency handles zero value');

// 3. Formatters: Rental Duration and Rounding
const testDur1 = Formatters.calculateRentalDuration('2026-10-24T10:00', '2026-10-24T11:01'); // 1h 1min -> 2 hours
assertUnit(testDur1.billableHours === 2 && testDur1.isValid === true, 'calculateRentalDuration rounds partial hour (1h 1m) up to 2 billable hours');

const testDurEqual = Formatters.calculateRentalDuration('2026-10-24T10:00', '2026-10-24T10:00'); // same start and end
assertUnit(testDurEqual.isValid === false && testDurEqual.message.includes('later than the start'), 'calculateRentalDuration rejects equal start and end time');

const testDurNegative = Formatters.calculateRentalDuration('2026-10-24T12:00', '2026-10-24T10:00');
assertUnit(testDurNegative.isValid === false, 'calculateRentalDuration rejects end time before start time');

// 4. Formatters: toLocalISOString
const sampleDate = new Date(2026, 9, 24, 15, 30); // 24 Oct 2026, 15:30 local
const localStr = Formatters.toLocalISOString(sampleDate);
assertUnit(localStr === '2026-10-24T15:30', 'Formatters.toLocalISOString generates valid local ISO datetime format');

// 5. BookingService: Unified Active Booking Predicate
assertUnit(
  BookingService.isActiveBooking({ bookingStatus: 'Confirmed' }) === true,
  'BookingService.isActiveBooking returns true for Confirmed booking'
);
assertUnit(
  BookingService.isActiveBooking({ bookingStatus: 'Pending Payment' }) === true,
  'BookingService.isActiveBooking returns true for Pending Payment booking'
);
assertUnit(
  BookingService.isActiveBooking({ bookingStatus: 'Cancelled' }) === false,
  'BookingService.isActiveBooking returns false for Cancelled booking'
);
assertUnit(
  BookingService.isActiveBooking(null) === false,
  'BookingService.isActiveBooking handles null booking gracefully'
);

// 6. BookingService: Multi-package Pricing Calculations
const comboPrice = BookingService.calculatePriceBreakdown(15.00, 4, 'cdw_lite', 'flex_basic');
// 4 * 15 = 60 + 5 (Lite) + 8 (Basic Flex) = 73.00
assertUnit(
  comboPrice.baseCharge === 60.00 &&
  comboPrice.cdwCharge === 5.00 &&
  comboPrice.flexCharge === 8.00 &&
  comboPrice.totalPrice === 73.00,
  'BookingService.calculatePriceBreakdown computes 4 hrs @ RM 15 + Lite CDW + Basic Flex = RM 73.00'
);

// 7. AdminService: Access Control
AuthService.logout();
let adminAccessBlocked = false;
try {
  AdminService.requireAdmin();
} catch (e) {
  adminAccessBlocked = true;
}
assertUnit(adminAccessBlocked === true, 'AdminService.requireAdmin throws error for unauthenticated user');

// 8. VehicleAssets: SVG Rendering
const axiaSvg = VehicleAssets.getCarSvgIllustration('axia', 'Perodua Axia');
assertUnit(
  axiaSvg.includes('viewBox="0 0 320 160"') &&
  axiaSvg.includes('aria-label="Perodua Axia"') &&
  axiaSvg.includes('#e02424'),
  'VehicleAssets generates valid SVG markup with accessibility label and correct color palette'
);

const genericSvg = VehicleAssets.getCarSvgIllustration('unknown_model', 'Mystery Car');
assertUnit(
  genericSvg.includes('viewBox="0 0 320 160"') &&
  genericSvg.includes('aria-label="Mystery Car"'),
  'VehicleAssets generates default fallback SVG for unknown model'
);

// 9. AuthService: Input validation
const shortPassRes = AuthService.register({ name: 'Valid Name', email: 'valid@mail.com', password: '123' });
assertUnit(shortPassRes.success === false && shortPassRes.message.includes('at least 6 characters'), 'AuthService rejects password shorter than 6 characters');

const invalidEmailRes = AuthService.register({ name: 'Valid Name', email: 'notanemail', password: 'password123' });
assertUnit(invalidEmailRes.success === false && invalidEmailRes.message.includes('valid email address'), 'AuthService rejects malformed email address');

// 10. BadgeUtils: Booking & Payment status CSS class mapping
assertUnit(BadgeUtils.getBookingBadgeClass('Confirmed') === 'badge-success', 'BadgeUtils maps Confirmed booking to badge-success');
assertUnit(BadgeUtils.getBookingBadgeClass('Cancelled') === 'badge-secondary', 'BadgeUtils maps Cancelled booking to badge-secondary');
assertUnit(BadgeUtils.getBookingBadgeClass('Pending Payment') === 'badge-warning', 'BadgeUtils maps Pending Payment booking to badge-warning');
assertUnit(BadgeUtils.getBookingBadgeClass('Unknown Status') === 'badge-warning', 'BadgeUtils maps unknown booking status to badge-warning default');
assertUnit(BadgeUtils.getBookingBadgeClass(null) === 'badge-warning', 'BadgeUtils maps null booking status to badge-warning default');

assertUnit(BadgeUtils.getPaymentBadgeClass('Successful') === 'badge-success', 'BadgeUtils maps Successful payment to badge-success');
assertUnit(BadgeUtils.getPaymentBadgeClass('Failed') === 'badge-danger', 'BadgeUtils maps Failed payment to badge-danger');
assertUnit(BadgeUtils.getPaymentBadgeClass('Pending') === 'badge-warning', 'BadgeUtils maps Pending payment to badge-warning');
assertUnit(BadgeUtils.getPaymentBadgeClass('Other Status') === 'badge-warning', 'BadgeUtils maps unknown payment status to badge-warning default');
assertUnit(BadgeUtils.getPaymentBadgeClass(undefined) === 'badge-warning', 'BadgeUtils maps undefined payment status to badge-warning default');

console.log(`\n========================================`);
console.log(`UNIT TEST RESULTS: ${unitPassed}/${unitTotal} TESTS PASSED`);
console.log(`========================================`);
