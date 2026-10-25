/**
 * GoCar Car Rental Booking System - Shared Constants & Configuration
 * 
 * Defines standard storage keys, roles, statuses, and authoritative seed data
 * according to the SRS (docs/system-requirements.md) and seed data specification (docs/seed-data.md).
 */

export const STORAGE_KEYS = Object.freeze({
  USERS: 'gocar_users',
  VEHICLES: 'gocar_vehicles',
  BOOKINGS: 'gocar_bookings',
  CURRENT_USER: 'gocar_current_user',
  INITIALIZED: 'gocar_initialized_flag'
});

export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  ADMIN: 'admin'
});

export const BOOKING_STATUS = Object.freeze({
  PENDING_PAYMENT: 'Pending Payment',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled'
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'Pending',
  SUCCESSFUL: 'Successful',
  FAILED: 'Failed'
});

/**
 * Authoritative CDW Packages from Seed Data Specification
 * Charged once per booking.
 */
export const CDW_PACKAGES = Object.freeze({
  LITE: {
    id: 'lite',
    name: 'Lite',
    price: 5.00,
    description: 'Basic damage waiver coverage with standard excess liability.'
  },
  STANDARD: {
    id: 'standard',
    name: 'Standard',
    price: 10.00,
    description: 'Reduced excess liability and comprehensive windscreen coverage.'
  },
  ESSENTIAL: {
    id: 'essential',
    name: 'Essential',
    price: 15.00,
    description: 'Maximum coverage with minimal liability and complete peace of mind.'
  }
});

/**
 * Authoritative Flex Packages from Seed Data Specification
 * Charged once per booking.
 */
export const FLEX_PACKAGES = Object.freeze({
  BASIC: {
    id: 'basic_flex',
    name: 'Basic Flex',
    price: 8.00,
    description: 'Standard cancellation flexibility up to 2 hours before trip start.'
  },
  PREMIUM: {
    id: 'premium_flex',
    name: 'Premium Flex',
    price: 15.00,
    description: 'Unlimited free rescheduling, late return grace period, and priority support.'
  }
});

/**
 * Predefined Vehicles from Seed Data Specification
 */
export const SEED_VEHICLES = Object.freeze([
  {
    id: 'CAR001',
    name: 'Perodua Axia',
    category: 'Compact',
    capacity: 5,
    transmission: 'Automatic',
    hourlyRate: 8.00,
    imageUrl: 'assets/cars/car-axia.svg',
    isAvailable: true
  },
  {
    id: 'CAR002',
    name: 'Perodua Myvi',
    category: 'Hatchback',
    capacity: 5,
    transmission: 'Automatic',
    hourlyRate: 10.00,
    imageUrl: 'assets/cars/car-myvi.svg',
    isAvailable: true
  },
  {
    id: 'CAR003',
    name: 'Proton Saga',
    category: 'Sedan',
    capacity: 5,
    transmission: 'Automatic',
    hourlyRate: 12.00,
    imageUrl: 'assets/cars/car-saga.svg',
    isAvailable: true
  },
  {
    id: 'CAR004',
    name: 'Perodua Alza',
    category: 'MPV',
    capacity: 7,
    transmission: 'Automatic',
    hourlyRate: 18.00,
    imageUrl: 'assets/cars/car-alza.svg',
    isAvailable: true
  }
]);

/**
 * Predefined Demo Users for evaluation
 */
export const SEED_USERS = Object.freeze([
  {
    id: 'USR001',
    name: 'Ali bin Ahmad',
    email: 'customer@demo.com',
    password: 'Password123',
    role: ROLES.CUSTOMER,
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'ADM001',
    name: 'Siti Admin',
    email: 'admin@gocar.my',
    password: 'AdminPassword123',
    role: ROLES.ADMIN,
    createdAt: '2026-01-01T08:00:00.000Z'
  }
]);

export const CURRENCY = 'RM';
