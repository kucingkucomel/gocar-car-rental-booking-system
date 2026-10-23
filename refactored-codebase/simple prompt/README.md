# GoCar Car Rental Booking System (Academic Prototype)

**Course:** CSEB5213 — Software Evolution & Maintenance  
**Assignment:** Milestone 1 — System Restructuring / Refactoring  
**Reference System:** GoCar Malaysia ([https://www.gocar.my/](https://www.gocar.my/))  
**Document Status:** Baseline implementation meeting all requirements of the System Requirements Specification (SRS) and Shared Seed Data.

---

## 1. Project Overview

This repository contains the complete implementation of an academic Car Rental Booking System inspired by the publicly observable booking workflow of **GoCar Malaysia**.

The system enables customers to browse vehicles, select rental periods, calculate billable hours and transparent pricing, select Collision Damage Waiver (CDW) and Flex packages, simulate payment workflows (success/failure), and review their personal reservation history. Administrators can manage the vehicle fleet (adding, editing, and conditionally removing vehicles) and oversee all system bookings.

### Key Architectural Characteristics
- **Client-Side Single Page Architecture (SPA):** Built strictly with standard web technologies (HTML5, CSS3, Vanilla ES6 JavaScript) without external libraries or frameworks.
- **Client-Side Persistence:** Application state (fleet records, user accounts, reservations, and session data) persists in browser `localStorage`.
- **Zero Backend / Zero Build Step:** Runs immediately upon opening in any modern web browser or via a lightweight local server.
- **Self-Contained Offline Assets:** Clean custom SVG car illustrations tailored to each vehicle model eliminate broken external image dependencies.

---

## 2. Default Seed Data & Demo Accounts

### 2.1 Demo Accounts (Instant Testing)

| Role | Name | Email | Password |
|---|---|---|---|
| **Customer** | John Demo | `customer@gocar.demo` | `password123` |
| **Administrator** | Fleet Administrator | `admin@gocar.demo` | `admin123` |

*(Note: New customer accounts can also be created via the Register tab).*

### 2.2 Sample Vehicles (SRS Shared Seed Data Section 2)

| Vehicle ID | Vehicle Name | Category | Capacity | Transmission | Hourly Rate (RM) | Status |
|---|---|---|---:|---|---:|---|
| `CAR001` | Perodua Axia | Compact | 5 | Automatic | RM 8.00 | Available |
| `CAR002` | Perodua Myvi | Hatchback | 5 | Automatic | RM 10.00 | Available |
| `CAR003` | Proton Saga | Sedan | 5 | Automatic | RM 12.00 | Available |
| `CAR004` | Perodua Alza | MPV | 7 | Automatic | RM 18.00 | Available |

### 2.3 Protection Packages (Collision Damage Waiver - CDW)

Charged once per booking:
- **Lite:** RM 5.00 (Basic excess waiver, excess capped at RM 2,500)
- **Standard:** RM 10.00 (Balanced coverage, excess capped at RM 1,000)
- **Essential:** RM 15.00 (Comprehensive protection, zero excess liability)

### 2.4 Flex Packages

Charged once per booking:
- **Basic Flex:** RM 8.00 (Free cancellation up to 6 hours before trip start)
- **Premium Flex:** RM 15.00 (Unlimited amendments & free cancellation anytime before start)

### 2.5 Pricing Calculation (BR-01 & Seed Data Section 5)

$$\text{Billable Hours} = \lceil \text{Duration in Hours} \rceil$$
$$\text{Base Rental Charge} = \text{Billable Hours} \times \text{Vehicle Hourly Rate}$$
$$\text{Total Booking Price} = \text{Base Rental Charge} + \text{CDW Package Rate} + \text{Flex Package Rate}$$

*Verification Example:* Perodua Axia for 5 hours with Standard CDW and Basic Flex:
- Base Rental: $5 \times \text{RM } 8.00 = \text{RM } 40.00$
- Standard CDW: $\text{RM } 10.00$
- Basic Flex: $\text{RM } 8.00$
- **Total: RM 58.00**

---

## 3. System Requirements & Architecture Mapping

| Requirement ID | Description | Source Module & Function |
|---|---|---|
| **FR-01** | User Registration & Login (Email format validation, duplicate check) | [js/auth.js](file:///c:/assignmentevo/js/auth.js) (`Auth.register`, `Auth.login`) |
| **FR-02** | Browse Vehicles (Category filters, capacity, transmission, rates) | [js/data.js](file:///c:/assignmentevo/js/data.js), [js/app.js](file:///c:/assignmentevo/js/app.js) (`App.renderVehiclesList`) |
| **FR-03** | Rental Period & Billable Duration (Rounded up whole hours) | [js/booking.js](file:///c:/assignmentevo/js/booking.js) (`BookingService.calculateRentalDuration`) |
| **FR-04** | Protection & Flex Option Selection | [js/booking.js](file:///c:/assignmentevo/js/booking.js) (`BookingService.calculatePriceBreakdown`) |
| **FR-05** | Booking Creation & Overlap Conflict Detection | [js/booking.js](file:///c:/assignmentevo/js/booking.js) (`BookingService.createBooking`, `checkVehicleAvailability`) |
| **FR-06** | Simulated Payment Step (Successful / Failed outcomes) | [js/booking.js](file:///c:/assignmentevo/js/booking.js) (`BookingService.processSimulatedPayment`) |
| **FR-07** | Booking History & Details (Customer restricted view) | [js/booking.js](file:///c:/assignmentevo/js/booking.js) (`BookingService.getCustomerBookings`), [js/app.js](file:///c:/assignmentevo/js/app.js) |
| **FR-08** | Vehicle & Booking Administration (Fleet CRUD, Active conflict guard) | [js/admin.js](file:///c:/assignmentevo/js/admin.js) (`AdminService.addVehicle`, `editVehicle`, `removeVehicle`) |
| **BR-01** | Rental Price Calculation | [js/booking.js](file:///c:/assignmentevo/js/booking.js) (`BookingService.calculatePriceBreakdown`) |
| **BR-02** | Shared Illustrative Seed Data | [js/data.js](file:///c:/assignmentevo/js/data.js) (`DEFAULT_VEHICLES`, `CDW_PACKAGES`, `FLEX_PACKAGES`) |
| **BR-03** | Vehicle Availability & Overlap Rejection | [js/booking.js](file:///c:/assignmentevo/js/booking.js) (`BookingService.checkVehicleAvailability`) |
| **BR-04** | Booking & Payment Status Transitions | [js/booking.js](file:///c:/assignmentevo/js/booking.js) (`Pending Payment`, `Confirmed`, `Cancelled`) |
| **BR-05** | Role Restrictions (Customer vs. Administrator isolation) | [js/auth.js](file:///c:/assignmentevo/js/auth.js), [js/admin.js](file:///c:/assignmentevo/js/admin.js) |
| **BR-06** | Browser Local Storage Persistence & Reset Function | [js/data.js](file:///c:/assignmentevo/js/data.js) (`DataStore.init`, `DataStore.resetToDefaults`) |

---

## 4. Directory Structure

```text
assignmentevo/
├── index.html              # Main single-page interface with all views & modals
├── css/
│   └── style.css           # Responsive styling (GoCar red theme, layout, components)
├── js/
│   ├── data.js             # Seed data constants & localStorage persistence engine
│   ├── auth.js             # Authentication, registration, validation, session state
│   ├── booking.js          # Pricing calculation, date validation, overlap check, payment
│   ├── admin.js            # Fleet CRUD, conflict check, all bookings administration
│   └── app.js              # DOM controller, modal triggers, event bindings, UI updates
├── tests/
│   └── acceptance.test.js  # Automated acceptance test suite (18 test assertions)
└── README.md               # System documentation, run instructions, and test guide
```

---

## 5. How to Run Locally

### Option 1: Direct Browser Launch (Simplest)
Because the codebase uses pure vanilla JavaScript without external module bundlers or CDNs, you can run it directly:
1. Double-click [index.html](file:///c:/assignmentevo/index.html) in Windows File Explorer, or
2. Open your preferred browser (Google Chrome, Microsoft Edge, Mozilla Firefox) and navigate to:
   ```text
   file:///c:/assignmentevo/index.html
   ```

### Option 2: Using Any Local Static Server
If you prefer running via HTTP:
- **Using Python 3:**
  ```powershell
  python -m http.server 8000
  ```
  Open `http://localhost:8000`
- **Using Node.js (`npx serve`):**
  ```powershell
  npx serve .
  ```
  Open `http://localhost:3000`

---

## 6. Verification and Automated Testing

An automated test script is provided in `tests/acceptance.test.js` to verify all 14 Acceptance Criteria specified in Section 8 of the SRS.

Run the test suite using Node.js:
```powershell
node tests/acceptance.test.js
```

### Test Suite Execution Output
```text
--- STARTING ACCEPTANCE CRITERIA TEST SUITE ---
[PASS] Test 1: 1. A new demo customer can register and log in
[PASS] Test 2: 2. Duplicate email registration is rejected
[PASS] Test 3: 3. The vehicle list and vehicle details are displayed with exact seed data
[PASS] Test 4: 4. Invalid rental dates are rejected
[PASS] Test 5: 5. Rental duration (rounded up) and total price calculated consistently (Seed Data Section 5 verification: RM 58.00)
[PASS] Test 6: 6. Customer can select CDW and Flex options and see updated price
[PASS] Test 7: 7. A valid booking receives a unique booking reference
[PASS] Test 8: 8. Overlapping booking for the same vehicle is rejected
[PASS] Test 9: 9. Successful simulated payment confirms the booking
[PASS] Test 10: 10. Failed simulated payment does not confirm the booking
[PASS] Test 11: 11. A customer can view their own booking history
[PASS] Test 12: 12a. Administrator login verified
[PASS] Test 13: 12b. Administrator can view all bookings across customers
[PASS] Test 14: 12c. Administrator can add a vehicle
[PASS] Test 15: 12d. Administrator cannot remove vehicle with conflicting active bookings
[PASS] Test 16: 12e. Administrator can remove vehicle when no conflicting active bookings
[PASS] Test 17: 13. Application data persists in localStorage across reloads
[PASS] Test 18: 14. Reset function restores default seed data cleanly

========================================
TEST RESULTS: 18/18 TESTS PASSED
========================================
```

---

## 7. Manual Walkthrough & Acceptance Testing Guide

For manual grading, follow this step-by-step evaluation procedure in the browser interface:

### Step 1: Customer Registration & Login (Acceptance Criteria 1 & 2)
1. In the top navigation bar, click **"Register"**.
2. Enter Name: `Demo User`, Email: `customer@gocar.demo`, Password: `password123`.
3. Notice error notification: duplicate email is rejected per FR-01.
4. Switch to **"Log In"** tab. Click **"Fill Customer (John)"** then click **"Log In"**.
5. The header displays: `John Demo (Customer)`.

### Step 2: Vehicle Browsing & Date Calculation (Acceptance Criteria 3, 4 & 5)
1. On the **Browse Vehicles** view, filter by categories (`Compact`, `Hatchback`, `Sedan`, `MPV`).
2. Click **"Book Now"** on the **Perodua Axia** (RM 8.00/hr).
3. Set start time to `10:00 AM` and end time to `3:00 PM` (5 hours).
4. Verify billable hours: `5 Billable Hours`.
5. Select **Standard CDW** (+RM 10.00) and **Basic Flex** (+RM 8.00).
6. Verify live calculation breakdown:
   - Base Rental: $5 \times \text{RM } 8.00 = \text{RM } 40.00$
   - CDW: $\text{RM } 10.00$
   - Flex: $\text{RM } 8.00$
   - **Total: RM 58.00** (matches SRS Section 5 exactly).

### Step 3: Booking Creation & Conflict Check (Acceptance Criteria 7 & 8)
1. Click **"Confirm & Proceed to Payment"**.
2. A unique booking reference (e.g. `GC-20261023-XXXX`) is generated with status `Pending Payment`.
3. Try to book the **same Perodua Axia** for an overlapping time window (e.g. `12:00 PM` to `4:00 PM`).
4. Notice the system blocks the booking with an availability alert.

### Step 4: Simulated Payment (Acceptance Criteria 6, 9 & 10)
1. On the payment modal, click **"Simulate Failed Payment"**.
   - Notice toast: Payment failed, booking status remains `Pending Payment` with payment status `Failed`.
2. Navigate to **"My Bookings"**. The booking appears with amber status `Pending Payment` and red badge `Payment: Failed`.
3. Click **"Simulate Payment"** again, then click **"Simulate Successful Payment"**.
   - Status transitions to `Confirmed` and payment status transitions to `Successful`.

### Step 5: Administrator Operations (Acceptance Criterion 12)
1. Click **"Log Out"** in the top navigation.
2. In the top demo helper bar, click **"Fill Demo Admin"** and log in (`admin@gocar.demo` / `admin123`).
3. Notice the admin navigation tabs appear: **Admin Fleet** and **All Bookings**.
4. In **All Bookings**, observe the reservations made across all customers.
5. In **Admin Fleet**, attempt to remove the Perodua Axia:
   - Notice the deletion is blocked because of the active reservation.
6. Click **"+ Add New Vehicle"**, fill details for `CAR005` (e.g. Honda City), and save.
7. The new vehicle appears immediately in both Admin Fleet and the customer Browse Vehicles catalogue.

### Step 6: Browser Persistence & System Reset (Acceptance Criteria 13 & 14)
1. Refresh the web page (`F5` or `Ctrl+R`). Notice all bookings, changes, and session remain intact.
2. Click **"Reset Demo Data"** in the top helper bar.
3. The system resets back to the baseline 4 sample vehicles and cleared booking records.

---

## 8. Compliance & Academic Integrity Statement

- **Non-commercial usage:** This software is an academic educational prototype developed strictly for CSEB5213 Software Evolution & Maintenance.
- **Privacy & Security:** No real credit card or bank details are collected or processed. Authentication and payment are simulated locally in browser memory/localStorage.
- **Attribution:** Functional concepts and workflow reference publicly observable features from [GoCar Malaysia](https://www.gocar.my/).
