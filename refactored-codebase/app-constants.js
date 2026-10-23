/**
 * GoCar Car Rental Booking System - Application Constants
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Centralizes all magic strings, domain statuses, storage keys, time constants,
 * seed data fixtures, and business rule validation thresholds.
 */

const BOOKING_STATUS = Object.freeze({
  PENDING_PAYMENT: 'Pending Payment',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled'
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'Pending',
  SUCCESSFUL: 'Successful',
  FAILED: 'Failed'
});

const USER_ROLES = Object.freeze({
  CUSTOMER: 'customer',
  ADMIN: 'admin'
});

const STORAGE_KEYS = Object.freeze({
  VEHICLES: 'gocar_vehicles',
  USERS: 'gocar_users',
  BOOKINGS: 'gocar_bookings',
  CURRENT_USER: 'gocar_current_user'
});

const TIME_CONSTANTS = Object.freeze({
  MS_PER_HOUR: 3600000,
  DEFAULT_HOURS_AHEAD: 1,
  DEFAULT_RENTAL_HOURS: 4,
  TOAST_DURATION_MS: 4500,
  TOAST_FADE_MS: 400
});

const VALIDATION_RULES = Object.freeze({
  MIN_NAME_LENGTH: 2,
  MIN_PASSWORD_LENGTH: 6,
  MIN_CAPACITY: 1,
  MAX_CAPACITY: 15
});

// Seed Vehicles matching SRS Section 2 exactly
const DEFAULT_VEHICLES = Object.freeze([
  {
    id: 'CAR001',
    name: 'Perodua Axia',
    category: 'Compact',
    capacity: 5,
    transmission: 'Automatic',
    hourlyRate: 8.00,
    status: 'Available',
    image: 'axia',
    description: 'Fuel-efficient, agile compact car perfect for city driving and daily errands in Kuala Lumpur.'
  },
  {
    id: 'CAR002',
    name: 'Perodua Myvi',
    category: 'Hatchback',
    capacity: 5,
    transmission: 'Automatic',
    hourlyRate: 10.00,
    status: 'Available',
    image: 'myvi',
    description: 'Malaysia\'s beloved hatchback with spacious cabin, smart drive assist, and balanced power.'
  },
  {
    id: 'CAR003',
    name: 'Proton Saga',
    category: 'Sedan',
    capacity: 5,
    transmission: 'Automatic',
    hourlyRate: 12.00,
    status: 'Available',
    image: 'saga',
    description: 'Comfortable 5-seater sedan with generous boot capacity, ideal for outstation weekend trips.'
  },
  {
    id: 'CAR004',
    name: 'Perodua Alza',
    category: 'MPV',
    capacity: 7,
    transmission: 'Automatic',
    hourlyRate: 18.00,
    status: 'Available',
    image: 'alza',
    description: 'Versatile 7-seater multi-purpose vehicle designed for family outings and group travel with luggage.'
  }
]);

// Seed CDW packages matching SRS Section 3 exactly
const CDW_PACKAGES = Object.freeze([
  {
    id: 'cdw_lite',
    name: 'Lite',
    price: 5.00,
    description: 'Basic excess waiver with maximum liability capped at RM 2,500.'
  },
  {
    id: 'cdw_standard',
    name: 'Standard',
    price: 10.00,
    description: 'Balanced coverage reducing excess liability down to RM 1,000.'
  },
  {
    id: 'cdw_essential',
    name: 'Essential',
    price: 15.00,
    description: 'Complete peace of mind with zero excess liability and roadside assistance.'
  }
]);

// Seed Flex packages matching SRS Section 4 exactly
const FLEX_PACKAGES = Object.freeze([
  {
    id: 'flex_basic',
    name: 'Basic Flex',
    price: 8.00,
    description: 'Free cancellation up to 6 hours before your scheduled trip start time.'
  },
  {
    id: 'flex_premium',
    name: 'Premium Flex',
    price: 15.00,
    description: 'Unlimited itinerary amendments and free cancellation anytime before start.'
  }
]);

// Predefined Demo Users for instant testing
const DEFAULT_USERS = Object.freeze([
  {
    id: 'USR001',
    name: 'John Demo',
    email: 'customer@gocar.demo',
    password: 'password123',
    role: 'customer'
  },
  {
    id: 'ADM001',
    name: 'Fleet Administrator',
    email: 'admin@gocar.demo',
    password: 'admin123',
    role: 'admin'
  }
]);

// Attach to globalThis / window for browser and Node.js testing environments
if (typeof globalThis !== 'undefined') {
  globalThis.BOOKING_STATUS = BOOKING_STATUS;
  globalThis.PAYMENT_STATUS = PAYMENT_STATUS;
  globalThis.USER_ROLES = USER_ROLES;
  globalThis.STORAGE_KEYS = STORAGE_KEYS;
  globalThis.TIME_CONSTANTS = TIME_CONSTANTS;
  globalThis.VALIDATION_RULES = VALIDATION_RULES;
  globalThis.DEFAULT_VEHICLES = DEFAULT_VEHICLES;
  globalThis.CDW_PACKAGES = CDW_PACKAGES;
  globalThis.FLEX_PACKAGES = FLEX_PACKAGES;
  globalThis.DEFAULT_USERS = DEFAULT_USERS;
}
