/**
 * Automated Verification Test Suite
 * Exercises the core business logic, services, repositories, and models
 * against all acceptance criteria and business rules.
 */

import { pricingService } from '../src/services/pricing-service.js';
import { bookingService } from '../src/services/booking-service.js';
import { paymentService } from '../src/services/payment-service.js';
import { authService } from '../src/services/auth-service.js';
import { adminService } from '../src/services/admin-service.js';
import { vehicleRepository } from '../src/repositories/vehicle-repository.js';
import { userRepository } from '../src/repositories/user-repository.js';
import { bookingRepository } from '../src/repositories/booking-repository.js';
import { BOOKING_STATUS, PAYMENT_STATUS, SEED_VEHICLES, CDW_PACKAGES, FLEX_PACKAGES } from '../src/config/constants.js';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    results.push({ name: testName, status: 'PASS', details });
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failed++;
    results.push({ name: testName, status: 'FAIL', details });
    console.error(`  ✗ [FAIL] ${testName} - ${details}`);
  }
}

function assertThrows(fn, testName, expectedErrorSubstr) {
  try {
    fn();
    failed++;
    results.push({ name: testName, status: 'FAIL', details: 'Expected exception was not thrown' });
    console.error(`  ✗ [FAIL] ${testName} - Expected exception was not thrown`);
  } catch (err) {
    if (!expectedErrorSubstr || err.message.includes(expectedErrorSubstr)) {
      passed++;
      results.push({ name: testName, status: 'PASS', details: `Correctly threw: ${err.message}` });
      console.log(`  ✓ [PASS] ${testName}`);
    } else {
      failed++;
      results.push({ name: testName, status: 'FAIL', details: `Threw unexpected error: ${err.message}` });
      console.error(`  ✗ [FAIL] ${testName} - Threw: ${err.message}`);
    }
  }
}

console.log('====================================================');
console.log('GoCar Booking System — Codebase B Verification Suite');
console.log('====================================================\n');

// Reset to clean seed before testing
adminService.resetSystemDemoData();

// --- Test Group 1: Seed Data Verification ---
console.log('--- Test Group 1: Seed Data Verification ---');
const vehicles = vehicleRepository.getAll();
assert(vehicles.length === 4, 'Seed vehicle count is exactly 4');
assert(vehicles.find(v => v.id === 'CAR001')?.hourlyRate === 8.00, 'CAR001 (Axia) hourly rate is RM 8.00');
assert(vehicles.find(v => v.id === 'CAR002')?.hourlyRate === 10.00, 'CAR002 (Myvi) hourly rate is RM 10.00');
assert(vehicles.find(v => v.id === 'CAR003')?.hourlyRate === 12.00, 'CAR003 (Saga) hourly rate is RM 12.00');
assert(vehicles.find(v => v.id === 'CAR004')?.hourlyRate === 18.00, 'CAR004 (Alza) hourly rate is RM 18.00');

assert(CDW_PACKAGES.LITE.price === 5.00, 'CDW Lite is RM 5.00');
assert(CDW_PACKAGES.STANDARD.price === 10.00, 'CDW Standard is RM 10.00');
assert(CDW_PACKAGES.ESSENTIAL.price === 15.00, 'CDW Essential is RM 15.00');
assert(FLEX_PACKAGES.BASIC.price === 8.00, 'Flex Basic is RM 8.00');
assert(FLEX_PACKAGES.PREMIUM.price === 15.00, 'Flex Premium is RM 15.00');

// --- Test Group 2: Pricing Calculation & Seed Example (BR-01) ---
console.log('\n--- Test Group 2: Pricing Calculation & Seed Example (BR-01) ---');
// Seed example: Axia (CAR001, RM8.00) for 5 hours, Standard CDW (RM10.00), Basic Flex (RM8.00) => RM58.00
const seedExamplePricing = pricingService.calculateRentalPrice({
  hourlyRate: 8.00,
  startTime: '2026-11-01T08:00:00.000Z',
  endTime: '2026-11-01T13:00:00.000Z', // 5 hours
  cdwPackageId: 'standard',
  flexPackageId: 'basic_flex'
});

assert(seedExamplePricing.billableHours === 5, 'Billable hours is exactly 5');
assert(seedExamplePricing.basePrice === 40.00, 'Base rental price is 5 * 8 = RM 40.00');
assert(seedExamplePricing.cdwPrice === 10.00, 'Standard CDW price is RM 10.00');
assert(seedExamplePricing.flexPrice === 8.00, 'Basic Flex price is RM 8.00');
assert(seedExamplePricing.totalPrice === 58.00, 'Total price matches seed-data.md example: RM 58.00');
assert(seedExamplePricing.formatted.totalPrice === 'RM 58.00', 'Formatted total is "RM 58.00"');

// Test fractional hours rounding up: 2 hours 15 minutes -> 3 billable hours
const fractionalPricing = pricingService.calculateRentalPrice({
  hourlyRate: 10.00,
  startTime: '2026-11-01T10:00:00.000Z',
  endTime: '2026-11-01T12:15:00.000Z', // 2.25 hours
  cdwPackageId: 'lite',
  flexPackageId: 'basic_flex'
});
assert(fractionalPricing.billableHours === 3, '2.25 hours rounds up to 3 billable hours');
assert(fractionalPricing.basePrice === 30.00, 'Base price is 3 * 10 = RM 30.00');
assert(fractionalPricing.totalPrice === 43.00, 'Total is 30 + 5 (lite) + 8 (basic) = RM 43.00');

// Test invalid dates rejection
assertThrows(() => {
  pricingService.calculateRentalPrice({
    hourlyRate: 8.00,
    startTime: '2026-11-01T14:00:00.000Z',
    endTime: '2026-11-01T12:00:00.000Z', // End before start
    cdwPackageId: 'lite',
    flexPackageId: 'basic_flex'
  });
}, 'Rejects rental end time before start time', 'later than the start date');

assertThrows(() => {
  pricingService.calculateRentalPrice({
    hourlyRate: 8.00,
    startTime: '2026-11-01T10:00:00.000Z',
    endTime: '2026-11-01T10:00:00.000Z', // Same time
    cdwPackageId: 'lite',
    flexPackageId: 'basic_flex'
  });
}, 'Rejects rental period with identical start and end time', 'later than the start date');

// --- Test Group 3: User Registration & Authentication (FR-01) ---
console.log('\n--- Test Group 3: User Registration & Authentication (FR-01) ---');
// Customer login with demo account
const demoCustomer = authService.login('customer@demo.com', 'Password123');
assert(demoCustomer.name === 'Ali bin Ahmad', 'Demo customer logs in successfully');
assert(demoCustomer.role === 'customer', 'Demo customer has role "customer"');

// Register new user
const newUser = authService.register({
  name: 'Tan Mei Ling',
  email: 'meiling@test.com',
  password: 'Password123'
});
assert(newUser.email === 'meiling@test.com', 'New user registered successfully');

// Duplicate email rejection
assertThrows(() => {
  authService.register({
    name: 'Duplicate Test',
    email: 'meiling@test.com',
    password: 'Password123'
  });
}, 'Prevents duplicate email registration', 'already registered');

// --- Test Group 4: Booking Creation & Overlap Conflict Detection (FR-05 & BR-03) ---
console.log('\n--- Test Group 4: Booking Creation & Overlap Conflict Detection (FR-05 & BR-03) ---');
// Create initial booking on CAR001 from 10:00 to 14:00
const booking1 = bookingService.createBooking({
  customerId: newUser.id,
  customerName: newUser.name,
  customerEmail: newUser.email,
  vehicleId: 'CAR001',
  startTime: '2026-11-10T10:00:00.000Z',
  endTime: '2026-11-10T14:00:00.000Z',
  cdwPackageId: 'standard',
  flexPackageId: 'basic_flex'
});
assert(Boolean(booking1.reference.startsWith('GC-')), 'Booking reference format matches GC-* pattern');
assert(booking1.bookingStatus === BOOKING_STATUS.PENDING_PAYMENT, 'New booking has status "Pending Payment"');
assert(booking1.paymentStatus === PAYMENT_STATUS.PENDING, 'New booking has payment status "Pending"');

// Attempt overlapping booking on same vehicle (12:00 to 16:00) -> Must be rejected!
assertThrows(() => {
  bookingService.createBooking({
    customerId: demoCustomer.id,
    customerName: demoCustomer.name,
    customerEmail: demoCustomer.email,
    vehicleId: 'CAR001',
    startTime: '2026-11-10T12:00:00.000Z', // Overlaps booking1 (10:00 - 14:00)
    endTime: '2026-11-10T16:00:00.000Z',
    cdwPackageId: 'lite',
    flexPackageId: 'basic_flex'
  });
}, 'Rejects overlapping booking for same vehicle during pending payment', 'already reserved during this period');

// Booking non-overlapping period on same vehicle (14:00 to 18:00) -> Must succeed!
const booking2 = bookingService.createBooking({
  customerId: demoCustomer.id,
  customerName: demoCustomer.name,
  customerEmail: demoCustomer.email,
  vehicleId: 'CAR001',
  startTime: '2026-11-10T14:00:00.000Z', // Adjacent start
  endTime: '2026-11-10T18:00:00.000Z',
  cdwPackageId: 'essential',
  flexPackageId: 'premium_flex'
});
assert(booking2.reference !== booking1.reference, 'Adjacent booking created with distinct unique reference');

// Booking same time period on DIFFERENT vehicle (CAR002) -> Must succeed!
const bookingCar2 = bookingService.createBooking({
  customerId: demoCustomer.id,
  customerName: demoCustomer.name,
  customerEmail: demoCustomer.email,
  vehicleId: 'CAR002',
  startTime: '2026-11-10T10:00:00.000Z', // Same time as booking1, but different vehicle
  endTime: '2026-11-10T14:00:00.000Z',
  cdwPackageId: 'lite',
  flexPackageId: 'basic_flex'
});
assert(Boolean(bookingCar2), 'Booking for different vehicle during same time window succeeds');

// --- Test Group 5: Payment Simulation & Status Transitions (FR-06 & BR-04) ---
console.log('\n--- Test Group 5: Payment Simulation & Status Transitions (FR-06 & BR-04) ---');
// Simulate payment failure on booking2
const failResult = paymentService.processSimulatedPayment(booking2.reference, false);
assert(failResult.success === false, 'Simulated payment reports failure');
assert(failResult.booking.paymentStatus === PAYMENT_STATUS.FAILED, 'Payment status updated to "Failed"');
assert(failResult.booking.bookingStatus !== BOOKING_STATUS.CONFIRMED, 'Failed payment does NOT confirm booking');

// Simulate payment success on booking1
const successResult = paymentService.processSimulatedPayment(booking1.reference, true);
assert(successResult.success === true, 'Simulated payment reports success');
assert(successResult.booking.paymentStatus === PAYMENT_STATUS.SUCCESSFUL, 'Payment status updated to "Successful"');
assert(successResult.booking.bookingStatus === BOOKING_STATUS.CONFIRMED, 'Booking status updated to "Confirmed"');

// Confirmed booking continues to block overlap
assertThrows(() => {
  bookingService.createBooking({
    customerId: demoCustomer.id,
    customerName: demoCustomer.name,
    customerEmail: demoCustomer.email,
    vehicleId: 'CAR001',
    startTime: '2026-11-10T11:00:00.000Z',
    endTime: '2026-11-10T13:00:00.000Z',
    cdwPackageId: 'lite',
    flexPackageId: 'basic_flex'
  });
}, 'Confirmed booking blocks overlapping reservation', 'already reserved during this period');

// Cancel booking1
bookingService.cancelBooking(booking1.reference, newUser.id, false);
const cancelledBooking1 = bookingService.getBooking(booking1.reference);
assert(cancelledBooking1.bookingStatus === BOOKING_STATUS.CANCELLED, 'Booking status changed to "Cancelled"');

// Cancelled booking no longer blocks availability (BR-03)
const bookingReplaced = bookingService.createBooking({
  customerId: demoCustomer.id,
  customerName: demoCustomer.name,
  customerEmail: demoCustomer.email,
  vehicleId: 'CAR001',
  startTime: '2026-11-10T10:00:00.000Z',
  endTime: '2026-11-10T14:00:00.000Z',
  cdwPackageId: 'lite',
  flexPackageId: 'basic_flex'
});
assert(Boolean(bookingReplaced), 'Cancelled reservation frees up vehicle availability for new booking');

// --- Test Group 6: History & Customer Isolation (FR-07 & BR-05) ---
console.log('\n--- Test Group 6: History & Customer Isolation (FR-07 & BR-05) ---');
const customer1Bookings = bookingService.getCustomerBookings(newUser.id);
const customer2Bookings = bookingService.getCustomerBookings(demoCustomer.id);
assert(customer1Bookings.every(b => b.customerId === newUser.id), 'Customer 1 only sees their own bookings');
assert(customer2Bookings.every(b => b.customerId === demoCustomer.id), 'Customer 2 only sees their own bookings');

// --- Test Group 7: Administration Features (FR-08) ---
console.log('\n--- Test Group 7: Administration Features (FR-08) ---');
// Login as Admin
authService.login('admin@gocar.my', 'AdminPassword123');
assert(authService.isAdmin() === true, 'Admin login verified');

// Admin adds vehicle
const newCar = adminService.addVehicle({
  id: 'CAR005',
  name: 'Honda City',
  category: 'Sedan',
  capacity: 5,
  transmission: 'Automatic',
  hourlyRate: 14.00,
  isAvailable: true
});
assert(vehicleRepository.getById('CAR005')?.name === 'Honda City', 'Admin can add a new vehicle');

// Prevention of vehicle deletion with active booking
// bookingReplaced is active on CAR001
assertThrows(() => {
  adminService.removeVehicle('CAR001');
}, 'Prevents removing vehicle when active booking exists (FR-08)', 'active reservation');

// Removing vehicle with no active bookings succeeds
const deleteSuccess = adminService.removeVehicle('CAR005');
assert(deleteSuccess === true, 'Removing vehicle with zero active bookings succeeds');
assert(vehicleRepository.getById('CAR005') === null, 'Vehicle CAR005 is deleted');

console.log('\n====================================================');
console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
