/**
 * Automated Acceptance Test Suite for GoCar Booking System (Refactored Codebase)
 * Validates all 14 Acceptance Criteria in SRS Section 8 against the refactored modules.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser localStorage
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
  // Convert top-level const/let to var so they become properties on the sandbox context
  code = code.replace(/\bconst\s+([A-Za-z0-9_]+)\s*=/g, 'var $1 =');
  code = code.replace(/\blet\s+([A-Za-z0-9_]+)\s*=/g, 'var $1 =');
  vm.runInContext(code, sandbox);
}

// Load refactored modules in dependency order
runFile('js/constants/app-constants.js');
runFile('js/utils/formatters.js');
runFile('js/utils/dom-utils.js');
runFile('js/services/data-store.js');
runFile('js/services/auth-service.js');
runFile('js/services/booking-service.js');
runFile('js/services/admin-service.js');

const DataStore = sandbox.DataStore;
const Auth = sandbox.Auth || sandbox.AuthService;
const BookingService = sandbox.BookingService;
const AdminService = sandbox.AdminService;

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('--- STARTING ACCEPTANCE CRITERIA TEST SUITE (REFACTORED) ---');

// Criterion 1: A new demo customer can register and log in
const regResult = Auth.register({
  name: 'Alice Tester',
  email: 'alice@test.my',
  password: 'mypassword123'
});
assert(regResult.success === true && Auth.getCurrentUser().email === 'alice@test.my', '1. A new demo customer can register and log in');

// Criterion 2: Duplicate email registration is rejected
const dupResult = Auth.register({
  name: 'Alice Clone',
  email: 'ALICE@test.my', // case-insensitive check
  password: 'differentpassword'
});
assert(dupResult.success === false && dupResult.message.includes('already registered'), '2. Duplicate email registration is rejected');

// Criterion 3: The vehicle list and vehicle details are displayed with exact seed data
const vehicles = DataStore.getVehicles();
const axia = vehicles.find(v => v.id === 'CAR001');
const myvi = vehicles.find(v => v.id === 'CAR002');
const saga = vehicles.find(v => v.id === 'CAR003');
const alza = vehicles.find(v => v.id === 'CAR004');
assert(
  vehicles.length === 4 &&
  axia.hourlyRate === 8.00 &&
  myvi.hourlyRate === 10.00 &&
  saga.hourlyRate === 12.00 &&
  alza.hourlyRate === 18.00,
  '3. The vehicle list and vehicle details are displayed with exact seed data'
);

// Criterion 4: Invalid rental dates are rejected
const invalidDateCheck1 = BookingService.calculateRentalDuration('2026-10-24T12:00', '2026-10-24T10:00'); // end < start
const invalidDateCheck2 = BookingService.calculateRentalDuration('', '2026-10-24T10:00'); // missing start
assert(invalidDateCheck1.isValid === false && invalidDateCheck2.isValid === false, '4. Invalid rental dates are rejected');

// Criterion 5: Rental duration and total price are calculated consistently
// SRS Section 5 Example: Axia for 5 hours, Standard CDW, Basic Flex -> RM 58.00
const durCheck = BookingService.calculateRentalDuration('2026-10-24T10:00', '2026-10-24T15:00'); // exactly 5.0 hours
const breakdown = BookingService.calculatePriceBreakdown(8.00, durCheck.billableHours, 'cdw_standard', 'flex_basic');
// Also test rounding partial hour up: 2.25 hours should be billed as 3 whole hours
const roundUpCheck = BookingService.calculateRentalDuration('2026-10-24T10:00', '2026-10-24T12:15');
assert(
  durCheck.billableHours === 5 &&
  breakdown.baseCharge === 40.00 &&
  breakdown.cdwCharge === 10.00 &&
  breakdown.flexCharge === 8.00 &&
  breakdown.totalPrice === 58.00 &&
  roundUpCheck.billableHours === 3,
  '5. Rental duration (rounded up) and total price calculated consistently (Seed Data Section 5 verification: RM 58.00)'
);

// Criterion 6: Customer can select CDW and Flex options and see updated price
const altBreakdown = BookingService.calculatePriceBreakdown(10.00, 3, 'cdw_essential', 'flex_premium');
// 3 * 10 = 30 + 15 (Essential) + 15 (Premium Flex) = 60.00
assert(altBreakdown.totalPrice === 60.00, '6. Customer can select CDW and Flex options and see updated price');

// Criterion 7: A valid booking receives a unique booking reference
const bookingRes1 = BookingService.createBooking({
  vehicleId: 'CAR001',
  startDateTime: '2026-10-25T10:00:00Z',
  endDateTime: '2026-10-25T15:00:00Z',
  cdwId: 'cdw_standard',
  flexId: 'flex_basic'
});
assert(
  bookingRes1.success === true &&
  bookingRes1.booking.id.startsWith('GC-') &&
  bookingRes1.booking.bookingStatus === 'Pending Payment',
  '7. A valid booking receives a unique booking reference'
);

// Criterion 8: Overlapping booking for same vehicle is rejected when existing is Confirmed or Pending Payment
const overlapRes = BookingService.createBooking({
  vehicleId: 'CAR001', // same car
  startDateTime: '2026-10-25T12:00:00Z', // overlaps 10:00-15:00
  endDateTime: '2026-10-25T17:00:00Z',
  cdwId: 'cdw_lite',
  flexId: 'flex_basic'
});
assert(overlapRes.success === false && overlapRes.message.includes('already reserved'), '8. Overlapping booking for the same vehicle is rejected');

// Criterion 9: Successful simulated payment confirms the booking
const paySuccessRes = BookingService.processSimulatedPayment(bookingRes1.booking.id, 'success');
assert(
  paySuccessRes.success === true &&
  paySuccessRes.isConfirmed === true &&
  paySuccessRes.booking.bookingStatus === 'Confirmed' &&
  paySuccessRes.booking.paymentStatus === 'Successful',
  '9. Successful simulated payment confirms the booking'
);

// Criterion 10: Failed simulated payment does not confirm the booking
// Create booking 2 on different car (CAR002)
const bookingRes2 = BookingService.createBooking({
  vehicleId: 'CAR002',
  startDateTime: '2026-10-26T08:00:00Z',
  endDateTime: '2026-10-26T12:00:00Z',
  cdwId: 'cdw_lite',
  flexId: 'flex_basic'
});
const payFailRes = BookingService.processSimulatedPayment(bookingRes2.booking.id, 'fail');
assert(
  payFailRes.success === false &&
  payFailRes.isConfirmed === false &&
  payFailRes.booking.bookingStatus === 'Pending Payment' &&
  payFailRes.booking.paymentStatus === 'Failed',
  '10. Failed simulated payment does not confirm the booking'
);

// Criterion 11: A customer can view their own booking history
const aliceBookings = BookingService.getCustomerBookings(Auth.getCurrentUser().id);
assert(
  aliceBookings.length === 2 &&
  aliceBookings.some(b => b.id === bookingRes1.booking.id) &&
  aliceBookings.some(b => b.id === bookingRes2.booking.id),
  '11. A customer can view their own booking history'
);

// Criterion 12: The administrator can manage vehicle listings and view bookings
// Log in as demo admin
Auth.login('admin@gocar.demo', 'admin123');
assert(Auth.isAdmin() === true, '12a. Administrator login verified');

// Admin views all bookings
const allBookings = AdminService.getAllBookings();
assert(allBookings.length >= 2, '12b. Administrator can view all bookings across customers');

// Admin adds a vehicle
const addCarRes = AdminService.addVehicle({
  id: 'CAR005',
  name: 'Honda City',
  category: 'Sedan',
  capacity: 5,
  transmission: 'Automatic',
  hourlyRate: 14.00,
  description: 'Smooth modern sedan'
});
assert(addCarRes.success === true && DataStore.getVehicles().some(v => v.id === 'CAR005'), '12c. Administrator can add a vehicle');

// Admin attempts to delete vehicle with active booking (CAR001 has active confirmed booking)
const deleteBlockedRes = AdminService.removeVehicle('CAR001');
assert(deleteBlockedRes.success === false && deleteBlockedRes.message.includes('Cannot remove vehicle'), '12d. Administrator cannot remove vehicle with conflicting active bookings');

// Admin deletes CAR005 (which has no bookings)
const deleteCarRes = AdminService.removeVehicle('CAR005');
assert(deleteCarRes.success === true && !DataStore.getVehicles().some(v => v.id === 'CAR005'), '12e. Administrator can remove vehicle when no conflicting active bookings');

// Criterion 13: Application data persists after refreshing browser
// Simulate reload by re-reading localStorageStore directly
// (4 default vehicles remain after CAR005 was added then removed)
const persistedVehicles = JSON.parse(localStorageStore['gocar_vehicles']);
const persistedBookings = JSON.parse(localStorageStore['gocar_bookings']);
assert(persistedVehicles.length === 4 && persistedBookings.length === 2, '13. Application data persists in localStorage across reloads');

// Criterion 14: System reset restores default seed data cleanly
DataStore.resetToDefaults();
const resetVehicles = DataStore.getVehicles();
const resetBookings = DataStore.getBookings();
assert(resetVehicles.length === 4 && resetBookings.length === 0, '14. Reset function restores default seed data cleanly');

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log(`========================================`);
