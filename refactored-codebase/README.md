# GoCar Car Rental Booking System (Refactored Codebase)

**Course:** CSEB5213 — Software Evolution & Maintenance  
**Assignment:** System Restructuring & Refactoring Deliverable  
**Reference System:** GoCar Malaysia ([https://www.gocar.my/](https://www.gocar.my/))  
**Document Status:** Production-Quality Refactored Deliverable  

---

## 1. Project Overview

This directory contains the **refactored, modularized implementation** of the GoCar Car Rental Booking System. The application has been restructured from a monolithic controller architecture into a clean, layered design adhering to the Single Responsibility Principle, Separation of Concerns, defensive security practices, and standardized domain rules.

All existing customer and administrator workflows, pricing formulas, seed data fixtures, and browser persistence mechanisms have been preserved with **100% behavioral equivalence**.

### Key Architectural Characteristics
- **Layered Client-Side Architecture:** Clear separation between Constants, Formatting Utilities, Domain Services, and Specialized Presentation Views.
- **Zero Backend / Zero Build Tooling:** Runs immediately upon opening in any modern web browser or lightweight HTTP server without Webpack, Vite, or npm compilation.
- **Built-in Security:** All dynamic user inputs and data fields are sanitized through an HTML entity escaping pipeline, neutralizing Cross-Site Scripting (XSS) risks.
- **Client-Side Persistence:** Local storage persistence with automated in-memory fallback.
- **Comprehensive Test Suite:** Includes both acceptance criteria tests (18 assertions) and modular unit/regression tests (22 assertions).

---

## 2. Technology Stack

- **Markup:** HTML5 (Semantic elements, accessible modal overlays, ARIA live alerts).
- **Styling:** CSS3 (Modern custom properties, flexbox/grid layout, responsive breakpoints, GoCar brand theme).
- **Programming Language:** Vanilla ECMAScript 6+ (ES6 Modules pattern, pure utility functions, Object.freeze constants).
- **Persistence:** Browser `localStorage` API with defensive memory fallback.
- **Test Framework:** Node.js native `vm` execution runner and assertions (zero external dependencies).

---

## 3. Directory Structure

```text
refactored-codebase/
├── index.html                     # Entry point loading scripts in dependency order
├── README.md                      # System documentation & run instructions
├── css/
│   └── style.css                  # Global responsive styling & GoCar branding
├── js/
│   ├── constants/
│   │   └── app-constants.js       # Immutable domain statuses, roles, and seed fixtures
│   ├── utils/
│   │   ├── formatters.js          # Pure formatting functions (Currency, Dates, Duration)
│   │   └── dom-utils.js           # HTML entity escaping (XSS guard) & safe DOM updates
│   ├── services/
│   │   ├── data-store.js          # Robust storage service with defensive fallback
│   │   ├── auth-service.js        # Authentication, registration & session validation
│   │   ├── booking-service.js     # Pricing, overlap detection & payment lifecycle
│   │   └── admin-service.js       # Fleet CRUD & active reservation conflict checks
│   ├── ui/
│   │   ├── vehicle-assets.js      # Self-contained offline SVG vector car illustrations
│   │   ├── notification-ui.js     # Accessible, auto-fading toast alerts
│   │   ├── auth-view.js           # Login/register modal dialogs & session header
│   │   ├── vehicle-view.js        # Fleet catalog, category filters & vehicle details
│   │   ├── booking-view.js        # Booking wizard, live calculation, receipts & history
│   │   └── admin-view.js          # Admin fleet table & booking ledger
│   └── app.js                     # High-cohesion application orchestrator
└── tests/
    ├── acceptance.test.js         # Acceptance criteria test suite (18 assertions)
    ├── unit-refactored.test.js    # Unit & security regression test suite (22 assertions)
    └── run-all-tests.js           # Master test runner executing both suites
```

---

## 4. How to Run the Application

### Option 1: Direct Browser Launch (Simplest)
Because this application is self-contained without build dependencies:
1. Navigate into the `refactored-codebase/` folder.
2. Double-click `index.html` to open it in your default web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).
3. Alternatively, open your browser and navigate to:
   ```text
   file:///C:/assignmentevo/simple%20prompt/refactored-codebase/index.html
   ```

### Option 2: Using a Lightweight Local HTTP Server
- **Using Python 3:**
  ```powershell
  cd "C:\assignmentevo\simple prompt\refactored-codebase"
  python -m http.server 8000
  ```
  Open `http://localhost:8000` in your browser.

- **Using Node.js (`npx serve`):**
  ```powershell
  cd "C:\assignmentevo\simple prompt\refactored-codebase"
  npx serve .
  ```
  Open `http://localhost:3000` in your browser.

---

## 5. Demo Accounts & Credentials

For instant manual evaluation, the top demo banner provides quick autofill buttons, or you can enter credentials manually:

| Role | Name | Email | Password | Allowed Capabilities |
|---|---|---|---|---|
| **Customer** | John Demo | `customer@gocar.demo` | `password123` | Browse fleet, create reservations, simulate payments, view personal receipts. |
| **Administrator** | Fleet Administrator | `admin@gocar.demo` | `admin123` | Manage fleet (Add/Edit/Remove vehicles), view all bookings, override booking statuses. |

*(Note: New customer accounts can also be created via the Register tab).*

---

## 6. How to Run Automated Tests

The refactored codebase includes 40 automated test assertions across two suites.

### Execute Master Test Runner (Both Suites)
```powershell
cd "C:\assignmentevo\simple prompt\refactored-codebase"
node tests/run-all-tests.js
```

### Execute Acceptance Test Suite Individually
```powershell
node tests/acceptance.test.js
```

### Execute Unit & Security Regression Suite Individually
```powershell
node tests/unit-refactored.test.js
```

---

## 7. Known Limitations

- **Academic Simulation:** Designed for university coursework. Payment transactions are simulated in memory; no real credit cards or external banking gateways are called.
- **Client-Side Auth:** Passwords are verified on the client side against `localStorage` for prototype simplicity; production systems require server-side cryptographic hashing.
- **Single-Browser Isolation:** State persists locally per browser instance; concurrent multi-device synchronization requires an external backend server.

---

## 8. Documentation Links

Comprehensive academic documentation is located in the `docs/` folder:
- **Baseline Codebase Analysis & Code Smells:** [docs/codebase-analysis.md](../docs/codebase-analysis.md)
- **Refactoring Strategy & Implementation Report:** [docs/refactoring-report.md](../docs/refactoring-report.md)
- **Testing, Verification & Quantitative Metrics Comparison:** [docs/testing-and-comparison.md](../docs/testing-and-comparison.md)
