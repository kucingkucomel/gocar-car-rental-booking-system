# Architecture Documentation — GoCar Car Rental Booking System (Codebase B)

**Course:** CSEB5213 — Software Evolution & Maintenance  
**System:** GoCar Malaysia Academic Booking Prototype  
**Implementation Standard:** Codebase B — Strict Modular Layered Architecture  

---

## 1. Architectural Overview

Codebase B is engineered as a clean, modular, layered web application built strictly with modern Vanilla JavaScript (ES6+ Native Modules), semantic HTML5, and CSS3. It enforces strict separation of concerns, single-responsibility principle (SRP), centralized business rules, and predictable data persistence via browser `localStorage`.

The application follows an adapted Model-View-Service-Repository (MVSR) architectural pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│   (HTML5 Views, UI Components, Hash Router, DOM Helpers)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Services                     │
│  (PricingService, BookingService, PaymentService, Auth,     │
│   VehicleService, AdminService)                             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Uses Models & Calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Repository Layer                       │
│  (StorageRepository, UserRepository, VehicleRepository,     │
│   BookingRepository)                                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Persists
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Browser Storage                        │
│                 (window.localStorage / RAM)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Layer Responsibilities & Module Boundaries

### 2.1 Presentation Layer (`src/views/` & `src/components/`)
- **Views (`auth-view.js`, `vehicle-view.js`, `booking-view.js`, `history-view.js`, `admin-view.js`)**:
  - Responsible strictly for rendering markup, binding DOM events, collecting user input, and displaying feedback.
  - **Constraint:** Views *never* calculate rental prices directly, nor do they check vehicle reservation overlaps or mutate storage directly. All user intents are delegated to the service layer.
- **Components (`navigation.js`, `notifications.js`, `booking-summary.js`)**:
  - Reusable presentation widgets.
  - `booking-summary.js`: Authoritative presentation component for itemized billing breakdowns, ensuring consistent calculation displays across booking and history screens.
  - `notifications.js`: Floating accessible notification system for error and confirmation toasts.
  - `navigation.js`: Dynamic role-sensitive header responding to authentication events.

### 2.2 Service Layer (`src/services/`)
Encapsulates all business rules, orchestration workflows, validation checks, and state transitions.

- `pricing-service.js`:
  - **Sole authoritative source** for rental price calculations according to **BR-01**.
  - Computes billable hours (rounding upward using `Math.ceil`), multiplies by hourly rate, and adds CDW and Flex package charges.
- `booking-service.js`:
  - Centralizes reservation creation, reference generation (`GC-YYYYMMDD-XXXX`), and conflict/overlap detection (**BR-03**).
  - Guarantees that only `Confirmed` or `Pending Payment` bookings block fleet availability.
- `payment-service.js`:
  - Simulates payment gateway outcomes (**FR-06** and **BR-04**).
  - Handles deterministic status transitions:
    - Success $\rightarrow$ `paymentStatus: 'Successful'`, `bookingStatus: 'Confirmed'`
    - Failure $\rightarrow$ `paymentStatus: 'Failed'`, `bookingStatus: 'Pending Payment'`
- `auth-service.js`:
  - Handles client-side user sessions, registration validation, duplicate email checks, and role checks (`customer` vs `admin`).
- `vehicle-service.js`:
  - Provides filtered vehicle catalog queries, search, and category lookups.
- `admin-service.js`:
  - Enforces administrative permissions for vehicle fleet CRUD and reservation management.
  - Enforces the **FR-08** integrity rule: vehicles with active (`Confirmed` or `Pending Payment`) reservations cannot be removed.
  - Provides demo seed data reset.

### 2.3 Repository Layer (`src/repositories/`)
- `storage-repository.js`:
  - Low-level wrapper over `localStorage` with JSON serialization, error handling, and in-memory Map fallback for headless/test environments.
- `user-repository.js`, `vehicle-repository.js`, `booking-repository.js`:
  - Domain-specific CRUD persistence operations.
  - Initializes seed data automatically when storage is unpopulated.

### 2.4 Models (`src/models/`)
- `User`: Encapsulates user profile, role queries (`isAdmin()`), and JSON serialization.
- `Vehicle`: Encapsulates car specifications, hourly rate validation, and availability state.
- `Booking`: Encapsulates reservation details, itemized breakdown snapshot, and `blocksAvailability()` predicate.

### 2.5 Utilities & Configuration (`src/utils/` & `src/config/`)
- `constants.js`: System-wide constants, seed data, rates, package definitions, and storage keys.
- `validators.js`: Pure functions for validating emails, passwords, required fields, positive numbers, and rental dates.
- `date-utils.js`: Pure functions for date parsing, billable hour ceiling math, interval overlap detection (`sA < eB && eA > sB`), and date formatting.
- `formatters.js`: Currency formatting (`formatCurrencyRM`), time formatting, and HTML escaping (`escapeHtml`) to prevent XSS.
- `dom-utils.js`: Safe DOM selection and element creation helpers.

---

## 3. Mandatory Business Rule Centralization (Audit Trail)

| Business Rule | Requirement | Authoritative Implementation Module | Function / Method |
|---|---|---|---|
| **Rental Price Calculation** | BR-01 | `src/services/pricing-service.js` | `PricingService.prototype.calculateRentalPrice()` |
| **Billable Hours Ceiling Math** | BR-01 | `src/utils/date-utils.js` | `calculateBillableHours()` |
| **Seed Pricing & Fleet Data** | BR-02 | `src/config/constants.js` | `SEED_VEHICLES`, `CDW_PACKAGES`, `FLEX_PACKAGES` |
| **Vehicle Overlap Detection** | BR-03 | `src/services/booking-service.js` | `BookingService.prototype.checkAvailability()` |
| **Overlap Interval Logic** | BR-03 | `src/utils/date-utils.js` | `isDateRangeOverlapping()` |
| **Availability Blocking Predicate** | BR-03 | `src/models/booking.js` | `Booking.prototype.blocksAvailability()` |
| **Booking & Payment Status Transitions** | BR-04 | `src/services/payment-service.js` | `PaymentService.prototype.processSimulatedPayment()` |
| **Role-Based Access Control** | BR-05 | `src/services/auth-service.js` & `admin-service.js` | `AuthService.prototype.isAdmin()`, `_requireAdmin()` |
| **Vehicle Deletion Active Booking Guard** | FR-08 | `src/services/admin-service.js` | `AdminService.prototype.removeVehicle()` |
| **Duplicate Email Prevention** | FR-01 | `src/services/auth-service.js` & `user-repository.js` | `AuthService.prototype.register()`, `userRepository.create()` |
| **Storage Persistence & Reset** | BR-06 | `src/repositories/storage-repository.js` | `StorageRepository`, `AdminService.prototype.resetSystemDemoData()` |

---

## 4. Data Models & Entity Contracts

### 4.1 User Contract
```typescript
interface User {
  id: string;               // e.g. "USR001", "ADM001"
  name: string;             // e.g. "Ali bin Ahmad"
  email: string;            // e.g. "customer@demo.com"
  password: string;         // Plaintext string for prototype verification
  role: 'customer' | 'admin';
  createdAt: string;        // ISO 8601 string
}
```

### 4.2 Vehicle Contract
```typescript
interface Vehicle {
  id: string;               // e.g. "CAR001"
  name: string;             // e.g. "Perodua Axia"
  category: string;         // e.g. "Compact", "Hatchback", "Sedan", "MPV"
  capacity: number;         // e.g. 5
  transmission: string;     // e.g. "Automatic"
  hourlyRate: number;       // e.g. 8.00 (in RM)
  imageUrl: string;         // e.g. "assets/cars/car-axia.svg"
  isAvailable: boolean;     // e.g. true
  createdAt: string;        // ISO 8601 string
}
```

### 4.3 Booking Contract
```typescript
interface Booking {
  reference: string;        // Unique code: "GC-YYYYMMDD-XXXX"
  customerId: string;       // Foreign key -> User.id
  customerName: string;
  customerEmail: string;
  vehicleId: string;        // Foreign key -> Vehicle.id
  vehicleDetails: {         // Historical snapshot
    id: string;
    name: string;
    category: string;
    capacity: number;
    transmission: string;
    hourlyRate: number;
  };
  startTime: string;        // ISO 8601 string
  endTime: string;          // ISO 8601 string
  billableHours: number;    // Math.ceil(durationHours)
  cdwPackage: {
    id: string;             // "lite" | "standard" | "essential"
    name: string;
    price: number;          // 5.00 | 10.00 | 15.00
  };
  flexPackage: {
    id: string;             // "basic_flex" | "premium_flex"
    name: string;
    price: number;          // 8.00 | 15.00
  };
  pricingBreakdown: {
    billableHours: number;
    rawHours: number;
    hourlyRate: number;
    basePrice: number;
    cdwPrice: number;
    flexPrice: number;
    totalPrice: number;
    formatted: {
      hourlyRate: string;
      basePrice: string;
      cdwPrice: string;
      flexPrice: string;
      totalPrice: string;
      billableHours: string;
    };
  };
  totalPrice: number;       // basePrice + cdwPrice + flexPrice
  bookingStatus: 'Pending Payment' | 'Confirmed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Successful' | 'Failed';
  createdAt: string;        // ISO 8601 string
  updatedAt: string;        // ISO 8601 string
}
```

---

## 5. Software Evolution & Maintainability Guide

Codebase B is organized specifically so that future developers or evaluators can pinpoint and modify system behaviors without side-effects:

1. **Changing a Vehicle Hourly Rate:**
   - Predefined defaults: Edit `SEED_VEHICLES` in `src/config/constants.js`.
   - Runtime fleet rates: Use the Admin Portal (`#admin`) or call `adminService.updateVehicle()`.
2. **Changing CDW or Flex Package Prices:**
   - Edit `CDW_PACKAGES` or `FLEX_PACKAGES` in `src/config/constants.js`. Both the UI selections and `pricingService` automatically reflect the updated values.
3. **Modifying Rental Price Calculations (e.g. adding taxes, deposits, or daily caps):**
   - Edit `calculateRentalPrice()` in `src/services/pricing-service.js`. Every view, booking creation workflow, and receipt component displays the service's computed output without UI changes.
4. **Altering Availability or Overlap Logic (e.g. adding buffer times between rentals):**
   - Edit `isDateRangeOverlapping()` in `src/utils/date-utils.js` or `checkAvailability()` in `src/services/booking-service.js`.
5. **Switching Persistence Engine (e.g. from localStorage to IndexedDB or REST API):**
   - Swap the implementation inside `src/repositories/storage-repository.js` or update the concrete repositories (`user-repository.js`, `vehicle-repository.js`, `booking-repository.js`). The services and presentation layers remain unchanged.

---

## 6. Security & Educational Prototype Limitations

1. **Client-Side Authorization:**
   - Role checks are enforced in JavaScript and localStorage. Anyone with browser DevTools can inspect or modify stored data. This is documented according to SRS Section NFR-06.
2. **Simulated Payments:**
   - No payment gateway API keys, bank account numbers, or debit/credit card details are collected or processed.
3. **Password Handling:**
   - Passwords for demo accounts (`Password123`, `AdminPassword123`) are stored in client-side storage for local evaluation and validation tests. Never use real personal passwords.
4. **Data Sanitization:**
   - All user inputs rendered in the DOM are escaped via `escapeHtml()` or inserted via `textContent` / safe DOM nodes to guard against Cross-Site Scripting (XSS).
