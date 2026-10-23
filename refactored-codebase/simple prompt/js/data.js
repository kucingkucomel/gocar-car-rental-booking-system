/**
 * GoCar Car Rental Booking System - Shared Seed Data & Storage Module
 * Course: CSEB5213 — Software Evolution & Maintenance
 * Reference: GoCar Malaysia (https://www.gocar.my/)
 */

const STORAGE_KEYS = {
  VEHICLES: 'gocar_vehicles',
  USERS: 'gocar_users',
  BOOKINGS: 'gocar_bookings',
  CURRENT_USER: 'gocar_current_user'
};

// Seed Vehicles matching SRS Section 2 exactly
const DEFAULT_VEHICLES = [
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
];

// Seed CDW packages matching SRS Section 3 exactly
const CDW_PACKAGES = [
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
];

// Seed Flex packages matching SRS Section 4 exactly
const FLEX_PACKAGES = [
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
];

// Predefined Demo Users for instant testing
const DEFAULT_USERS = [
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
];

/**
 * Data Storage Management functions
 */
const DataStore = {
  /**
   * Initializes local storage with seed data if not already present.
   */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      this.saveVehicles(DEFAULT_VEHICLES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.saveUsers(DEFAULT_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      this.saveBookings([]);
    }
  },

  getVehicles() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return data ? JSON.parse(data) : DEFAULT_VEHICLES;
    } catch (e) {
      console.error('Error reading vehicles from localStorage:', e);
      return DEFAULT_VEHICLES;
    }
  },

  saveVehicles(vehicles) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  },

  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch (e) {
      console.error('Error reading users from localStorage:', e);
      return DEFAULT_USERS;
    }
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getBookings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading bookings from localStorage:', e);
      return [];
    }
  },

  saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  /**
   * Resets all storage back to default seed data.
   */
  resetToDefaults() {
    this.saveVehicles(DEFAULT_VEHICLES);
    this.saveUsers(DEFAULT_USERS);
    this.saveBookings([]);
    // Do not forcibly log out user if they are currently logged in, just update their user object if needed
    const current = this.getCurrentUser();
    if (current) {
      const existing = DEFAULT_USERS.find(u => u.email === current.email);
      if (!existing) {
        this.setCurrentUser(null);
      }
    }
    return true;
  }
};

// Initialize immediately upon loading script
DataStore.init();
