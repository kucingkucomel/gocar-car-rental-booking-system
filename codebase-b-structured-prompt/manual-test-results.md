# Manual & Automated Test Results — GoCar Car Rental Booking System (Codebase B)

**Course:** CSEB5213 — Software Evolution & Maintenance  
**Assignment:** Milestone 1 — System Restructuring / Refactoring  
**Execution Date:** 2026-10-23  
**Execution Environment:** Desktop Web Browser (Chrome / Edge), Node.js v24.13.0, Windows OS  
**Implementation Standard:** Codebase B — Structured Prompt & Layered Architecture  

---

## 1. Automated Test Execution Summary

An automated ES-module verification suite was executed via `node tests/run-tests.js` to systematically assert all business rules and service contracts.

```text
====================================================
GoCar Booking System — Codebase B Verification Suite
====================================================

--- Test Group 1: Seed Data Verification ---
  ✓ [PASS] Seed vehicle count is exactly 4
  ✓ [PASS] CAR001 (Axia) hourly rate is RM 8.00
  ✓ [PASS] CAR002 (Myvi) hourly rate is RM 10.00
  ✓ [PASS] CAR003 (Saga) hourly rate is RM 12.00
  ✓ [PASS] CAR004 (Alza) hourly rate is RM 18.00
  ✓ [PASS] CDW Lite is RM 5.00
  ✓ [PASS] CDW Standard is RM 10.00
  ✓ [PASS] CDW Essential is RM 15.00
  ✓ [PASS] Flex Basic is RM 8.00
  ✓ [PASS] Flex Premium is RM 15.00

--- Test Group 2: Pricing Calculation & Seed Example (BR-01) ---
  ✓ [PASS] Billable hours is exactly 5
  ✓ [PASS] Base rental price is 5 * 8 = RM 40.00
  ✓ [PASS] Standard CDW price is RM 10.00
  ✓ [PASS] Basic Flex price is RM 8.00
  ✓ [PASS] Total price matches seed-data.md example: RM 58.00
  ✓ [PASS] Formatted total is "RM 58.00"
  ✓ [PASS] 2.25 hours rounds up to 3 billable hours
  ✓ [PASS] Base price is 3 * 10 = RM 30.00
  ✓ [PASS] Total is 30 + 5 (lite) + 8 (basic) = RM 43.00
  ✓ [PASS] Rejects rental end time before start time
  ✓ [PASS] Rejects rental period with identical start and end time

--- Test Group 3: User Registration & Authentication (FR-01) ---
  ✓ [PASS] Demo customer logs in successfully
  ✓ [PASS] Demo customer has role "customer"
  ✓ [PASS] New user registered successfully
  ✓ [PASS] Prevents duplicate email registration

--- Test Group 4: Booking Creation & Overlap Conflict Detection (FR-05 & BR-03) ---
  ✓ [PASS] Booking reference format matches GC-* pattern
  ✓ [PASS] New booking has status "Pending Payment"
  ✓ [PASS] New booking has payment status "Pending"
  ✓ [PASS] Rejects overlapping booking for same vehicle during pending payment
  ✓ [PASS] Adjacent booking created with distinct unique reference
  ✓ [PASS] Booking for different vehicle during same time window succeeds

--- Test Group 5: Payment Simulation & Status Transitions (FR-06 & BR-04) ---
  ✓ [PASS] Simulated payment reports failure
  ✓ [PASS] Payment status updated to "Failed"
  ✓ [PASS] Failed payment does NOT confirm booking
  ✓ [PASS] Simulated payment reports success
  ✓ [PASS] Payment status updated to "Successful"
  ✓ [PASS] Booking status updated to "Confirmed"
  ✓ [PASS] Confirmed booking blocks overlapping reservation
  ✓ [PASS] Booking status changed to "Cancelled"
  ✓ [PASS] Cancelled reservation frees up vehicle availability for new booking

--- Test Group 6: History & Customer Isolation (FR-07 & BR-05) ---
  ✓ [PASS] Customer 1 only sees their own bookings
  ✓ [PASS] Customer 2 only sees their own bookings

--- Test Group 7: Administration Features (FR-08) ---
  ✓ [PASS] Admin login verified
  ✓ [PASS] Admin can add a new vehicle
  ✓ [PASS] Prevents removing vehicle when active booking exists (FR-08)
  ✓ [PASS] Removing vehicle with zero active bookings succeeds
  ✓ [PASS] Vehicle CAR005 is deleted

====================================================
Test Execution Finished: 47 PASSED, 0 FAILED
====================================================
```

**Automated Result:** 100% Passed (47 of 47 assertions verified).

---

## 2. Interactive Manual Browser Verification

| Workflow Tested | Steps Performed | Observations & Results | Status |
|---|---|---|:---:|
| **1. Application Launch & Navigation** | Launched application in browser. Checked default route `#vehicles`. Clicked hamburger menu on responsive view. | Navbar rendered GoCar branding, fleet link, login button, and demo reset button. Default view showed 4 seed vehicles with correct categories and badges. | **PASS** |
| **2. Demo Authentication** | Navigated to `#auth`. Clicked "Demo Customer" quick-fill button. Clicked "Sign In". | Form auto-filled with `customer@demo.com` and `Password123`. Notification displayed "Welcome back, Ali bin Ahmad!". Header updated with customer badge and "My Bookings" link. | **PASS** |
| **3. Seed Pricing Verification** | Selected Perodua Axia (CAR001, RM8.00/hr). Configured 5-hour rental interval. Selected Standard CDW (RM10.00) and Basic Flex (RM8.00). | Live summary displayed: Base rental = RM 40.00, CDW = RM 10.00, Flex = RM 8.00, Total = **RM 58.00**. Exact match with `docs/seed-data.md` specification. | **PASS** |
| **4. Date Validation Guard** | Adjusted drop-off time to be 1 hour earlier than pick-up time. | Summary immediately updated with red alert: "Rental end date and time must be later than the start date and time." "Confirm & Proceed" button became disabled. | **PASS** |
| **5. Booking Submission** | Restored valid 5-hour duration and clicked "Confirm & Proceed to Payment". | Booking generated with reference `GC-20261023-XXXX`. Status set to "Pending Payment". Screen transitioned to simulated payment gateway. | **PASS** |
| **6. Simulated Payment (Failure)** | Clicked "Simulate Failed Payment". | Screen updated with red alert: "Payment Failed / Declined". Payment status badge turned red (`Failed`). Booking status remained unconfirmed. | **PASS** |
| **7. Simulated Payment (Success)** | Clicked "Simulate Successful Payment". | Screen updated with green alert: "Payment Successful!". Payment status badge turned green (`Successful`). Booking status became `Confirmed`. | **PASS** |
| **8. Overlap Rejection Check** | Opened new booking flow for same vehicle (CAR001) during overlapping hours. | System rejected submission with clear notification identifying conflicting reservation reference. Overlap prevented. | **PASS** |
| **9. Customer Booking Isolation** | Logged out. Registered new account `mei@test.my`. Navigated to `#history`. | "My Bookings" displayed empty state ("No Bookings Yet"). Customer Ali's previous bookings were completely inaccessible. Isolation verified. | **PASS** |
| **10. Admin Portal & Safeguards** | Logged in as `admin@gocar.my` (`AdminPassword123`). Navigated to `#admin`. | Fleet management table displayed all vehicles. Attempted to delete CAR001 (which has an active confirmed booking). Action blocked with alert explaining active reservation conflict. Deleting unreserved vehicle CAR005 succeeded. | **PASS** |
| **11. LocalStorage Persistence** | Reloaded browser tab (F5). | Active admin session, updated vehicle fleet, and reservation history persisted without loss. | **PASS** |

---

## 3. Discovered Defects & Fix Log

1. **Assertion String Mismatch during Test Suite Run:**
   - *Discovery:* In `tests/run-tests.js`, duplicate email rejection test checked for substring `"already exists"`, whereas the user-facing message produced was `"An account with email ... is already registered. Please log in instead."`
   - *Resolution:* Updated assertion expected substring to match `"already registered"`. Zero functional application bugs.

---

## 4. Known Limitations & Prototype Assumptions

1. **Simulated Payments:**
   - Payment simulation is local and educational. No real financial credentials or payment processors are invoked.
2. **Client-Side Authorization:**
   - Demonstrates role separation (`customer` vs `admin`) in the browser UI and storage. It is not designed to replace production server-side OAuth / JWT infrastructure.
3. **Storage Boundary:**
   - Application state is persisted locally in the user's browser `localStorage`. Data is not synchronized across different devices or separate browser profiles.
