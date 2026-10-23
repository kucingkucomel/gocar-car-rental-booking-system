# GoCar Car Rental Booking System — Codebase B

**Course:** CSEB5213 — Software Evolution & Maintenance  
**Milestone:** 1 — System Restructuring / Refactoring Baseline  
**Implementation Type:** Codebase B — Modular, Layered Vanilla JavaScript Application (Structured Prompt)  
**Priority Hierarchy:** Correctness → Maintainability → Reliability → Usability → Visual Quality  

---

## 1. Overview & Architectural Philosophy

This repository contains **Codebase B** of the GoCar Car Rental Booking System educational prototype. It was implemented in strict accordance with:
1. `docs/system-requirements.md` (System Requirements Specification)
2. `docs/seed-data.md` (Shared Seed Data & Pricing Rules)
3. Codebase B Strict Software Engineering Implementation Specification

### Engineering Standard Highlights
- **Strict Separation of Concerns:** Layered architecture separating Presentation (`views/`, `components/`), Business Logic (`services/`), Data Persistence (`repositories/`), Entity Contracts (`models/`), and Configuration/Utilities (`config/`, `utils/`).
- **Centralized Business Rules:**
  - Rental pricing calculation is strictly centralized in `src/services/pricing-service.js` (**BR-01**).
  - Vehicle reservation overlap detection and availability checking are strictly centralized in `src/services/booking-service.js` (**BR-03**).
  - Status lifecycle transitions are strictly governed by `src/services/payment-service.js` and `src/services/admin-service.js` (**BR-04**).
  - Storage read/write logic is isolated in `src/repositories/storage-repository.js` (**BR-06**).
- **Zero Framework / Zero Heavy Dependencies:** Built purely with semantic HTML5, CSS3, and native ES6+ JavaScript modules. No React, Vue, Angular, or third-party libraries.
- **Client-Side Persistence:** Application data persists in browser `localStorage` across page reloads and browser sessions.

---

## 2. Directory Structure

```text
structured prompt/
├── index.html                           # Semantic HTML5 single-page application entry point
├── serve.js                             # Zero-dependency local static server for ES modules
├── README.md                            # Comprehensive setup and project documentation
├── docs/
│   ├── system-requirements.md           # Authoritative SRS specification
│   ├── seed-data.md                     # Authoritative fleet and package seed data
│   └── architecture.md                  # Layer responsibilities, data contracts & rules
├── src/
│   ├── app.js                           # Application router and bootstrapping orchestrator
│   ├── config/
│   │   └── constants.js                 # Seed data, rates, package definitions, storage keys
│   ├── models/
│   │   ├── user.js                      # User entity model & role methods
│   │   ├── vehicle.js                   # Vehicle entity model & field validation
│   │   └── booking.js                   # Booking entity model & availability predicate
│   ├── services/
│   │   ├── auth-service.js              # Authentication, demo session, duplicate email checks
│   │   ├── vehicle-service.js           # Fleet queries, search, and category filtering
│   │   ├── pricing-service.js           # Authoritative BR-01 pricing calculation
│   │   ├── booking-service.js           # Authoritative BR-03 overlap detection & creation
│   │   ├── payment-service.js           # FR-06 simulated payment processing & transitions
│   │   └── admin-service.js             # FR-08 fleet management & vehicle deletion guard
│   ├── repositories/
│   │   ├── storage-repository.js        # Safe localStorage wrapper with memory fallback
│   │   ├── user-repository.js           # User account persistence & seeding
│   │   ├── vehicle-repository.js        # Vehicle catalog persistence & seeding
│   │   └── booking-repository.js        # Reservation records persistence & querying
│   ├── components/
│   │   ├── navigation.js                # Dynamic header, role navigation & demo reset
│   │   ├── notifications.js             # Accessible toast alert notification manager
│   │   └── booking-summary.js           # Authoritative itemized price breakdown card
│   ├── views/
│   │   ├── auth-view.js                 # Login & Registration screens with demo quick-fills
│   │   ├── vehicle-view.js              # Fleet catalog, category pills & vehicle modal
│   │   ├── booking-view.js              # Period picker, CDW/Flex chooser & live breakdown
│   │   ├── history-view.js              # Customer's personal bookings & isolated receipt view
│   │   └── admin-view.js                # Administrator fleet CRUD & reservation management
│   └── utils/
│       ├── validators.js                # Input, email, password, and rental date validation
│       ├── date-utils.js                # Interval overlap math, duration & billable hours
│       ├── formatters.js                # Currency (RM), duration, and XSS string escaping
│       └── dom-utils.js                 # Safe DOM query and manipulation helpers
├── styles/
│   ├── main.css                         # CSS design tokens, GoCar branding, reset, typography
│   ├── layout.css                       # Header, navbar, grids, containers, footer
│   ├── components.css                   # Buttons, cards, form inputs, badges, modals, tables
│   └── responsive.css                   # Mobile and tablet viewport breakpoints
└── tests/
    ├── test-plan.md                     # Acceptance test matrix & criteria coverage
    ├── manual-test-results.md           # Actual test execution results & defect log
    └── run-tests.js                     # Automated ES-module verification test suite
```

---

## 3. How to Run the Application

Because native ES6 modules (`import`/`export`) require HTTP/HTTPS serving to satisfy browser security (CORS), run a local static server rather than opening `index.html` via `file:///`.

### Option A: Using the Included Node Server (Recommended)
Node.js v16+ is required.
```bash
node serve.js
```
Then open: **`http://localhost:3000`** in any modern desktop web browser (Chrome, Edge, Firefox, Safari).

*(To use a custom port, run: `node serve.js 8080`)*

### Option B: Using VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

### Option C: Using Standard Static Servers
```bash
# Using Python:
python -m http.server 8000

# Using Node npx serve:
npx serve .
```

---

## 4. Predefined Demo Accounts & Seed Data

The application automatically seeds initial data into browser `localStorage` on first load.

### Predefined User Accounts
| Role | Email Address | Password | Name |
|---|---|---|---|
| **Demo Customer** | `customer@demo.com` | `Password123` | Ali bin Ahmad |
| **Demo Administrator** | `admin@gocar.my` | `AdminPassword123` | Siti Admin |

*(Quick-fill buttons are provided on the Sign In page for one-click testing.)*

### Predefined Vehicle Fleet
| Vehicle ID | Vehicle Name | Category | Capacity | Transmission | Hourly Rate (RM) |
|---|---|---|---:|---|---:|
| **CAR001** | Perodua Axia | Compact | 5 | Automatic | RM 8.00 |
| **CAR002** | Perodua Myvi | Hatchback | 5 | Automatic | RM 10.00 |
| **CAR003** | Proton Saga | Sedan | 5 | Automatic | RM 12.00 |
| **CAR004** | Perodua Alza | MPV | 7 | Automatic | RM 18.00 |

### Predefined Protection Packages
- **Collision Damage Waiver (CDW):**
  - Lite: RM 5.00
  - Standard: RM 10.00
  - Essential: RM 15.00
- **Flex Packages:**
  - Basic Flex: RM 8.00
  - Premium Flex: RM 15.00

### Price Calculation Rule (BR-01)
$$\text{Billable Hours} = \lceil \text{Rental Duration in Hours} \rceil$$
$$\text{Base Rental Price} = \text{Billable Hours} \times \text{Hourly Rate}$$
$$\text{Total Price} = \text{Base Rental Price} + \text{CDW Price} + \text{Flex Price}$$

**Seed Example:**
Renting a Perodua Axia (`CAR001`, RM 8.00/hr) for 5 hours with Standard CDW (RM 10.00) and Basic Flex (RM 8.00):
- Base: $5 \times \text{RM } 8.00 = \text{RM } 40.00$
- CDW: $\text{RM } 10.00$
- Flex: $\text{RM } 8.00$
- **Total: RM 58.00**

---

## 5. How to Run the Automated Test Suite

Run the headless verification suite using Node.js:
```bash
node tests/run-tests.js
```

### Verified Criteria (47 of 47 Assertions Passed):
1. **Seed Data:** Exact vehicle records, package prices, and user accounts.
2. **Pricing Logic:** Seed calculation example (RM 58.00), fractional hour rounding up (2.25 hrs $\rightarrow$ 3 billable hrs), and date ordering guards.
3. **Authentication:** Customer/Admin login, role assignment, and duplicate email registration prevention.
4. **Availability & Overlap:** Overlap conflict detection against `Pending Payment` and `Confirmed` bookings; allowance of adjacent back-to-back bookings; allowance of concurrent bookings for different vehicles.
5. **Payment Simulation:** Deterministic transitions to `Successful` (`Confirmed`) and `Failed` (unconfirmed); verification that failed bookings free up availability.
6. **Customer Isolation:** Customers only receive and view their own reservation records.
7. **Administration Operations:** Fleet addition, fleet rate editing, reservation oversight, and active reservation deletion safeguards.

---

## 6. How to Reset Demo Data

At any time during testing, you can reset the application back to its pristine seed data state by clicking the **"↻ Reset Seed Data"** button in the top navigation header or within the Administrator Portal.

---

## 7. Documentation Index

- **System Architecture & Data Contracts:** [`docs/architecture.md`](docs/architecture.md)
- **Authoritative System Requirements Specification:** [`docs/system-requirements.md`](docs/system-requirements.md)
- **Authoritative Shared Seed Data:** [`docs/seed-data.md`](docs/seed-data.md)
- **Acceptance Test Plan Matrix:** [`tests/test-plan.md`](tests/test-plan.md)
- **Executed Manual & Automated Test Results:** [`tests/manual-test-results.md`](tests/manual-test-results.md)
