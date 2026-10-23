# GoCar Car Rental Booking System — Codebase Analysis & Code Smell Inventory

**Course:** CSEB5213 Software Evolution & Maintenance  
**System:** GoCar Malaysia Academic Prototype  
**Baseline Workspace:** `codebase-a-simple-prompt/`  
**Evaluation Date:** October 2026  
**Document Status:** Complete Baseline Technical Analysis  

---

## 1. Project Overview & System Purpose

The **GoCar Car Rental Booking System** is an academic prototype designed to simulate the vehicle sharing and hourly reservation workflows observed in commercial car-sharing applications (modeled after GoCar Malaysia). 

The application facilitates two primary user personas:
1. **Customers:** Browse a fleet of vehicles with category filters, specify rental pick-up and return date-times, calculate billable hours and transparent pricing, select Collision Damage Waiver (CDW) and Flex protection packages, execute simulated payments (supporting both success and failure test paths), and view their personal booking history.
2. **Fleet Administrators:** Access privileged administrative routes to oversee the entire booking ledger, adjust reservation statuses with override authority, and manage the vehicle fleet (adding, editing specifications/rates, and conditionally removing vehicles guarding against active reservation conflicts).

The system is implemented as a client-side Single Page Application (SPA) using standard web technologies: HTML5, CSS3, and Vanilla JavaScript (ES6), utilizing browser `localStorage` for data persistence.

---

## 2. Baseline Architecture & Module Responsibilities

The baseline codebase (`codebase-a-simple-prompt/`) organizes its logic into five JavaScript files loaded sequentially in `index.html`:

```
codebase-a-simple-prompt/
├── index.html              # Main HTML markup containing all SPA views & modals (701 lines)
├── README.md               # Original project specifications and instructions (233 lines)
├── css/
│   └── style.css           # Global application styling & responsive rules (1,196 lines)
├── js/
│   ├── data.js             # Seed data constants & localStorage persistence engine (217 lines)
│   ├── auth.js             # Authentication, registration, validation, session state (136 lines)
│   ├── booking.js          # Pricing calculation, date validation, overlap check, payment (419 lines)
│   ├── admin.js            # Fleet CRUD, active conflict guard, all bookings admin (224 lines)
│   └── app.js              # Monolithic UI controller, event bindings, HTML rendering (1,284 lines)
└── tests/
    └── acceptance.test.js  # Automated acceptance test suite for 14 SRS criteria (234 lines)
```

### Source File Inventory & Responsibility Breakdown

| Source File | Total Lines | Code Lines | Primary Responsibility | Architectural Coupling & Dependencies |
|---|---:|---:|---|---|
| `index.html` | 701 | 597 | View structure, dialog modals, header, navigation, and script loading tags. | Tightly coupled to global `App` via inline `onclick` handlers (`App.openAuthModal`, etc.). |
| `css/style.css` | 1,196 | 1,009 | Visual design, responsive layout, GoCar brand colors, modal backdrops, badges. | Styles tied directly to DOM element IDs and class hierarchies. |
| `js/data.js` | 217 | 180 | Data access layer: Seed data constants (`DEFAULT_VEHICLES`, `DEFAULT_USERS`) and `DataStore` object interacting with `localStorage`. | Directly mutates `localStorage`; automatically executes `DataStore.init()` as a side-effect at load time. |
| `js/auth.js` | 136 | 80 | User registration, credential login, password length check, role verification (`isAdmin`). | Calls `DataStore.getUsers()`, `DataStore.saveUsers()`, and `DataStore.setCurrentUser()`. |
| `js/booking.js` | 419 | 280 | Business rules BR-01 through BR-04: Duration rounding, price calculation, vehicle availability overlap detection, simulated payment state machine. | Depends globally on `DataStore`, `Auth`, `CDW_PACKAGES`, and `FLEX_PACKAGES`. |
| `js/admin.js` | 224 | 151 | Fleet CRUD and booking ledger oversight (FR-08, BR-05). Enforces admin privileges and prevents vehicle deletion if active bookings exist. | Depends on `Auth.isAdmin()`, `DataStore.getVehicles()`, and `DataStore.getBookings()`. |
| `js/app.js` | 1,284 | 977 | Monolithic UI Controller: View routing, DOM event listeners, modal triggers, HTML generation, dynamic SVG car generation, live price calculation, toast notifications. | Enormous **God Object**. Couples DOM directly to `DataStore`, `Auth`, `BookingService`, and `AdminService`. |
| `tests/acceptance.test.js` | 234 | 173 | Node.js acceptance test runner using Node's `vm` sandbox to evaluate business logic against SRS criteria 1–14. | Replaces `const`/`let` with `var` to expose globals inside sandbox; mocks `localStorage`. |

---

## 3. Core Application Workflows

1. **Customer Registration & Authentication (FR-01):**
   - User inputs Name, Email, Password. `Auth.register()` performs validation: non-empty name ($\ge 2$ characters), RFC email regex format, password length ($\ge 6$ characters), and case-insensitive duplicate email detection.
   - On success, account is appended to `gocar_users` in `localStorage`, and session is persisted in `gocar_current_user`.
2. **Vehicle Browsing & Availability Check (FR-02, BR-03):**
   - Fleet rendered from `DataStore.getVehicles()`. Filter pills permit category isolation (`compact`, `hatchback`, `sedan`, `mpv`).
   - If hero date range is specified, `BookingService.checkVehicleAvailability()` evaluates whether any active booking (`Confirmed` or `Pending Payment`) overlaps: `(startA < endB) && (endA > startB)`.
3. **Rental Duration & Pricing Breakdown (FR-03, FR-04, BR-01):**
   - User selects start and end time. Partial hours are rounded up: $\text{Billable Hours} = \lceil \text{Duration in Hours} \rceil$.
   - Live recalculation combines:
     $$\text{Total Price} = (\text{Billable Hours} \times \text{Hourly Rate}) + \text{CDW Package Rate} + \text{Flex Package Rate}$$
4. **Booking Submission & Simulated Payment (FR-05, FR-06, BR-04):**
   - Booking record generated with reference format `GC-YYYYMMDD-XXXX`. Initial status set to `Pending Payment` and payment status to `Pending`.
   - Simulated payment modal allows testing `success` (transitions to `Confirmed` / `Successful`) or `fail` (remains `Pending Payment` / `Failed`).
5. **Customer Booking History (FR-07):**
   - Filters `DataStore.getBookings()` by customer `userId`. Customer can cancel uncompleted bookings or view modal receipts.
6. **Fleet & Reservation Administration (FR-08):**
   - Admin can add new vehicles, edit existing specifications, or delete vehicles. Deletion is blocked if active upcoming/ongoing bookings exist for that vehicle. Admin can override booking statuses (`Pending Payment`, `Confirmed`, `Cancelled`).

---

## 4. Code Smell Inventory

A systematic static inspection of the baseline source code revealed eight genuine, substantiated code smells and architectural anti-patterns:

| ID | Code Smell Name | Affected File & Lines | Severity | Maintainability & Quality Impact |
|---|---|---|---|---|
| **CS-01** | **God Object / Monolithic Controller** | `js/app.js` (Lines 7–1278) | **Critical** | Low cohesion, massive file size (1,284 lines), 33 disparate methods managing state, routing, DOM binding, SVG creation, and HTML templating. |
| **CS-02** | **Scattered Business Rules & Duplicated Code** | `js/booking.js` (L157–162)<br>`js/admin.js` (L148–150)<br>`js/app.js` (L313, 322, 872–874) | **High** | The definition of an "Active Booking" (`Confirmed` or `Pending Payment`) is duplicated in 4 distinct files. Adding a status risks silent discrepancies. |
| **CS-03** | **Security Vulnerability: Unescaped HTML Injection (XSS)** | `js/app.js` (L376, 384, 787, 880, 954, 955, 1264) | **Critical** | Dynamic user and admin inputs (`customerName`, `customerEmail`, `car.name`, `description`, `message`) injected into `innerHTML` without HTML entity escaping. |
| **CS-04** | **Magic Strings and Numbers** | `js/booking.js`, `js/admin.js`, `js/auth.js`, `js/app.js` | **Medium** | Domain statuses (`'Pending Payment'`, `'Confirmed'`, `'Cancelled'`), roles (`'customer'`, `'admin'`), and conversion factors (`3600000`, `4500`, `400`) hardcoded repeatedly. |
| **CS-05** | **Hardcoded Vector Assets in Logic Layer** | `js/app.js` (Lines 417–497) | **Medium** | Over 80 lines of SVG paths and geometric coordinates embedded directly inside application controller. |
| **CS-06** | **Inconsistent Formatting & Presentation Logic** | `js/booking.js` (L10)<br>`js/app.js` (L379, 550, 630, 800, 806, 884, 930, 962) | **Medium** | Ad-hoc `toFixed(2)` and manual `RM ${...}` string concatenations scattered across 11+ UI locations rather than a unified formatter. |
| **CS-07** | **Tight UI-to-Code Coupling via Inline Handlers** | `index.html` (L18, 22, 36)<br>`js/app.js` (L401, 404, 737, 819, 824, 828, 893, 894, 966) | **Medium** | Direct `onclick="App.method()"` in HTML strings tightly binds DOM markup to global window properties, hindering modularization and CSP compliance. |
| **CS-08** | **Inconsistent Error Handling & Global State Mutation** | `js/admin.js` (L10–14)<br>`js/data.js` (L183) | **Low** | `AdminService.requireAdmin` throws raw errors while other methods return result objects; `DataStore.getCurrentUser()` silently swallows exceptions. |

---

## 5. In-Depth Documentation of Confirmed Code Smells

### 5.1 CS-01: God Object / Monolithic Controller (`App` in `js/app.js`)

- **Exact Location:** `codebase-a-simple-prompt/js/app.js`, lines 7–1278.
- **Evidence:**
  ```javascript
  const App = {
    currentView: 'vehicles',
    selectedVehicleForBooking: null,
    activeFilterCategory: 'all',
    editingVehicleId: null,

    init() { /* ... */ },
    setupDatePickersDefault() { /* ... */ },
    bindEvents() { /* 138 lines binding forms, buttons, filters, modals */ },
    switchView(viewName) { /* ... */ },
    renderCurrentView() { /* ... */ },
    updateUserSessionUI() { /* ... */ },
    updateBookingsBadges() { /* ... */ },
    renderVehiclesList() { /* ... */ },
    getCarSvgIllustration(imageType, carName) { /* 81 lines of SVG paths */ },
    handleHeroSearch() { /* ... */ },
    openBookingModal(vehicleId) { /* ... */ },
    updateBookingPriceSummary() { /* ... */ },
    handleBookingSubmit(e) { /* ... */ },
    openSimulatedPaymentModal(bookingId) { /* ... */ },
    handleSimulatedPayment(outcome) { /* ... */ },
    renderMyBookingsList() { /* 110 lines of HTML templating */ },
    handleCancelBooking(bookingId) { /* ... */ },
    renderAdminFleet() { /* ... */ },
    renderAdminBookings() { /* ... */ },
    handleAdminStatusChange(bookingId, newStatus) { /* ... */ },
    openVehicleFormModal(vehicleId) { /* ... */ },
    handleAdminVehicleSubmit(e) { /* ... */ },
    handleAdminDeleteVehicle(vehicleId) { /* ... */ },
    openVehicleDetailsModal(vehicleId) { /* ... */ },
    showBookingReceiptModal(bookingId) { /* ... */ },
    openAuthModal(tab) { /* ... */ },
    switchAuthTab(tab) { /* ... */ },
    handleLoginSubmit(e) { /* ... */ },
    handleRegisterSubmit(e) { /* ... */ },
    handleLogout() { /* ... */ },
    handleResetDemoData() { /* ... */ },
    showToast(message, type) { /* ... */ }
  };
  ```
- **Why It Is a Maintainability Problem:** `App` violates the Single Responsibility Principle (SRP). It is responsible for session state, view routing, raw DOM listener attachments, SVG asset drawing, customer booking flows, admin tables, modal toggles, and toast messaging. At 1,284 lines, it represents **56.3% of the entire JavaScript codebase**.
- **Impact on Future Modifications:** Any change—whether styling a toast, updating an SVG wheel coordinate, or changing table layout—requires altering this single massive file, creating high cognitive load and merge conflicts.
- **Severity:** **Critical**.
- **Recommended Refactoring Technique:** *Extract Class / Extract Module*. Decompose into focused UI modules: `VehicleAssets`, `NotificationUI`, `AuthView`, `VehicleView`, `BookingView`, `AdminView`, and a streamlined `App` orchestrator.

---

### 5.2 CS-02: Scattered Business Rules & Duplicated Code (Active Booking Predicate)

- **Exact Locations:**
  1. `js/booking.js`, Lines 158–162:
     ```javascript
     const blocksAvailability = (
       booking.bookingStatus === 'Confirmed' ||
       booking.bookingStatus === 'Pending Payment'
     );
     ```
  2. `js/admin.js`, Lines 148–150:
     ```javascript
     const isActiveStatus = b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending Payment';
     const isFutureOrOngoing = new Date(b.endDateTime).getTime() >= now;
     return isActiveStatus && isFutureOrOngoing;
     ```
  3. `js/app.js`, Lines 313 & 322:
     ```javascript
     const activeCount = myBookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending Payment').length;
     ...
     const pendingOrConfirmed = allBookings.filter(b => b.bookingStatus === 'Pending Payment' || b.bookingStatus === 'Confirmed').length;
     ```
  4. `js/app.js`, Lines 872–874:
     ```javascript
     const isActive = b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending Payment';
     return isActive && new Date(b.endDateTime).getTime() >= now;
     ```
- **Why It Is a Maintainability Problem:** The domain rule defining what constitutes an active reservation that occupies fleet capacity is duplicated in four separate modules.
- **Impact on Future Modifications:** If business introduces a new status such as `'In Progress'`, developers must remember to locate and update all 4 sites. Omitting one causes silent logic errors, such as allowing deletion of a vehicle during active rental.
- **Severity:** **High**.
- **Recommended Refactoring Technique:** *Extract Method / Encapsulate Business Rule*. Implement `BookingService.isActiveBooking(booking)` as the authoritative predicate across all services and views.

---

### 5.3 CS-03: Security Vulnerability: Cross-Site Scripting (XSS) via Unescaped Interpolation

- **Exact Locations:**
  - `js/app.js`, line 376: `<h3 class="vehicle-name">${car.name}</h3>`
  - `js/app.js`, line 384: `<p class="vehicle-desc">${car.description || ...}</p>`
  - `js/app.js`, line 954: `<div>${b.customerName}</div>`
  - `js/app.js`, line 955: `<div class="small text-muted">${b.customerEmail}</div>`
  - `js/app.js`, line 1264: `<span class="toast-message">${message}</span>`
- **Evidence:** User-supplied strings (customer name registered via form, vehicle description entered by admin, or error messages) are concatenated directly into HTML strings assigned to `container.innerHTML` without sanitization or HTML entity escaping.
- **Why It Is a Maintainability Problem:** Leaves the application vulnerable to stored and DOM-based Cross-Site Scripting.
- **Severity:** **Critical**.
- **Recommended Refactoring Technique:** *Introduce HTML Sanitization / Escape Utility*. Implement `DOMUtils.escapeHTML()` and pass all interpolated dynamic values through it before rendering.

---

### 5.4 CS-04: Magic Strings & Magic Numbers

- **Exact Locations:**
  - Status strings (`'Pending Payment'`, `'Confirmed'`, `'Cancelled'`, `'Successful'`, `'Failed'`, `'Pending'`) scattered across `booking.js`, `admin.js`, and `app.js`.
  - Roles (`'customer'`, `'admin'`) hardcoded across `auth.js`, `booking.js`, and `app.js`.
  - Numbers: `1000 * 60 * 60` (ms to hour conversion in `booking.js` L78), `4 * 60 * 60 * 1000` (default rental duration in `app.js` L29), `4500` & `400` (toast timers in `app.js` L1271, 1274).
- **Severity:** **Medium**.
- **Recommended Refactoring Technique:** *Replace Magic Strings/Numbers with Named Constants*. Consolidate into `app-constants.js` with `BOOKING_STATUS`, `PAYMENT_STATUS`, `USER_ROLES`, `STORAGE_KEYS`, and `TIME_CONSTANTS`.

---

## 6. Prioritized Refactoring Opportunities

1. **Priority 1 (Architectural Cohesion & Maintainability):** Deconstruct `App` (CS-01) by extracting distinct views (`AuthView`, `VehicleView`, `BookingView`, `AdminView`, `VehicleAssets`, `NotificationUI`) and shared utilities (`Formatters`, `DOMUtils`).
2. **Priority 2 (Domain Integrity & DRY):** Centralize active booking conflict logic into `BookingService.isActiveBooking` (CS-02).
3. **Priority 3 (Application Security):** Eliminate unescaped HTML interpolation with `DOMUtils.escapeHTML()` (CS-03).
4. **Priority 4 (Robustness & Maintainability):** Centralize magic strings and numbers into `app-constants.js` (CS-04) and standardize currency and date formatting into `formatters.js` (CS-06).
