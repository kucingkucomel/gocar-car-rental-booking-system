# Test Plan — GoCar Car Rental Booking System (Codebase B)

**Course:** CSEB5213 — Software Evolution & Maintenance  
**Document:** Acceptance Test Plan & Quality Assurance Matrix  
**Specification Reference:** `docs/system-requirements.md` & `docs/seed-data.md`  

---

## 1. Test Strategy & Scope

This test plan defines the verification procedures for the GoCar Car Rental Booking System prototype (Codebase B). Testing covers:
- Core functional requirements (FR-01 through FR-08).
- Mandatory business rules (BR-01 through BR-06).
- Boundary conditions and invalid input handling.
- Deterministic simulated payment flows.
- Data persistence across sessions.
- Role-based access control and isolation.

Both automated tests (`tests/run-tests.js`) and end-to-end interactive manual browser tests are covered.

---

## 2. Test Execution Matrix

| Test ID | Requirement | Category | Preconditions | Input Data | Test Steps | Expected Result | Pass / Fail |
|---|---|---|---|---|---|---|:---:|
| **TC-01** | FR-01 | Auth | Clean demo state | Name: "Ali bin Ahmad", Email: "customer@demo.com", Pass: "Password123" | 1. Navigate to `#auth`.<br/>2. Enter valid credentials.<br/>3. Click "Sign In". | User authenticated as customer; navigation updates with name; redirected to `#vehicles`. | **PASS** |
| **TC-02** | FR-01 | Auth / Validation | None | Email: "customer@demo.com", Name: "Duplicate User", Pass: "Password123" | 1. Navigate to `#auth`.<br/>2. Click "Register".<br/>3. Submit existing email. | Registration rejected with message: "An account with email ... is already registered." | **PASS** |
| **TC-03** | FR-01 | Validation | None | Email: "invalid-email-string" | 1. Enter malformed email in login/registration. | Validation error: "Please enter a valid email address". Form submission halted. | **PASS** |
| **TC-04** | FR-02, BR-02 | Catalog | Application loaded | Default seed data | 1. Navigate to `#vehicles`.<br/>2. Count vehicle cards and verify rates. | Exactly 4 seed vehicles displayed (Axia RM8.00, Myvi RM10.00, Saga RM12.00, Alza RM18.00). | **PASS** |
| **TC-05** | FR-02 | UI Filter | Vehicles displayed | Query: "Saga" or Category: "Sedan" | 1. Type "Saga" in search bar or click "Sedan" pill. | Only Proton Saga is shown. Capacity 5, rate RM 12.00/hr, transmission Automatic. | **PASS** |
| **TC-06** | FR-03, BR-01 | Pricing (Seed Example) | Customer on `#booking` | Vehicle: CAR001 (Axia RM8), Duration: 5 hrs, CDW: Standard (RM10), Flex: Basic Flex (RM8) | 1. Select CAR001.<br/>2. Set 5 hour interval.<br/>3. Select Standard CDW.<br/>4. Select Basic Flex. | Base rental: RM 40.00.<br/>CDW: RM 10.00.<br/>Flex: RM 8.00.<br/>**Total: RM 58.00**. Exact match with seed example. | **PASS** |
| **TC-07** | FR-03, BR-01 | Duration Rounding | On `#booking` | Duration: 2 hrs 15 mins (e.g. 10:00 to 12:15) | 1. Select 2 hr 15 min interval.<br/>2. Inspect duration breakdown. | Duration displayed as 2.25 hrs, rounded up to 3 billable hours. Base rate multiplied by 3. | **PASS** |
| **TC-08** | FR-03 | Validation | On `#booking` | Start: 14:00, End: 12:00 (End before start) | 1. Set end date earlier than start date.<br/>2. Observe price preview. | Error displayed: "Rental end date and time must be later than the start date and time." Submit button disabled. | **PASS** |
| **TC-09** | FR-03 | Validation | On `#booking` | Start: 10:00, End: 10:00 (Zero duration) | 1. Set start and end to identical timestamp. | Error displayed: End must be later than start. Calculation rejected. | **PASS** |
| **TC-10** | FR-04 | Packages | On `#booking` | CDW: Lite (RM5), Standard (RM10), Essential (RM15); Flex: Basic (RM8), Premium (RM15) | 1. Switch radio options between packages. | Price preview updates instantly with correct package price. | **PASS** |
| **TC-11** | FR-05 | Booking Creation | Logged in as customer | Valid 4-hr booking on CAR002 | 1. Fill booking details.<br/>2. Click "Confirm & Proceed to Payment". | Booking created with unique reference `GC-YYYYMMDD-XXXX`. Initial status: "Pending Payment", payment: "Pending". | **PASS** |
| **TC-12** | FR-05, BR-03 | Overlap Prevention | Existing pending or confirmed booking (10:00-14:00) on CAR001 | Requested: 12:00-16:00 on CAR001 | 1. Attempt overlapping reservation for same vehicle. | Creation rejected: "Vehicle ... is already reserved during this period (Conflicting booking: ...)." | **PASS** |
| **TC-13** | FR-05, BR-03 | Adjacent Booking | Existing booking (10:00-14:00) on CAR001 | Requested: 14:00-18:00 on CAR001 | 1. Submit booking starting exactly when previous ends. | Booking created successfully; adjacent intervals do not conflict. | **PASS** |
| **TC-14** | FR-06, BR-04 | Payment Simulation (Success) | Booking in "Pending Payment" status | Action: Click "Simulate Successful Payment" | 1. In payment simulator, click success button. | Payment status becomes "Successful". Booking status becomes "Confirmed". Receipt displayed. | **PASS** |
| **TC-15** | FR-06, BR-04 | Payment Simulation (Failure) | Booking in "Pending Payment" status | Action: Click "Simulate Failed Payment" | 1. In payment simulator, click fail button. | Payment status becomes "Failed". Booking status remains unconfirmed. Error banner displayed. | **PASS** |
| **TC-16** | FR-06, BR-03 | Failed Booking Availability | Booking with payment status "Failed" on CAR001 | New customer requests same period on CAR001 | 1. Create booking for same vehicle and period as failed booking. | New booking succeeds; failed payment does not block fleet availability. | **PASS** |
| **TC-17** | FR-07, BR-05 | Customer Isolation | 2 customers with distinct bookings | Customer A logged in | 1. Navigate to `#history`.<br/>2. Inspect listed reservations. | Only Customer A's bookings are displayed. Customer B's bookings are completely hidden. | **PASS** |
| **TC-18** | FR-08, BR-05 | Admin Access Control | Ordinary customer logged in | Direct navigation to `#admin` | 1. Navigate to `#admin` as customer. | Access denied warning displayed; dashboard content protected. | **PASS** |
| **TC-19** | FR-08 | Fleet Admin (Add/Edit) | Admin logged in (`admin@gocar.my`) | New Car: Honda City, Sedan, RM 14.00/hr | 1. Open Admin Portal.<br/>2. Click "+ Add New Vehicle".<br/>3. Submit form. | New vehicle appears in fleet table and in customer catalog. | **PASS** |
| **TC-20** | FR-08 | Vehicle Deletion Safeguard | CAR001 has active Confirmed reservation | Admin attempts to delete CAR001 | 1. Click "Delete" on CAR001 in admin table. | Deletion blocked with message: "Cannot remove vehicle ... It has active reservation(s)." | **PASS** |
| **TC-21** | FR-08 | Vehicle Deletion (No conflicts) | Vehicle CAR005 has zero bookings | Admin deletes CAR005 | 1. Click "Delete" on CAR005. | Vehicle removed from fleet catalog. | **PASS** |
| **TC-22** | BR-06 | Persistence Across Refresh | 2 bookings created | Page refresh (F5) | 1. Reload page in browser.<br/>2. Navigate to `#history` and `#admin`. | All created bookings, user accounts, and fleet modifications persist intact. | **PASS** |
| **TC-23** | BR-06 | Seed Data Reset | Modified fleet and bookings | Click "Reset Seed Data" | 1. Click "Reset Seed Data" in header or admin.<br/>2. Confirm dialog. | Restores original 4 seed vehicles and seed users; clears test bookings. | **PASS** |

---

## 3. Defect Classification & Traceability

- **Critical / Blocker**: Overlapping bookings permitted, incorrect price calculations, or crashes during payment.
- **Major**: Role restriction bypass, persistent data loss on reload, or missing seed records.
- **Minor / Visual**: Label alignment, formatting anomalies, or non-blocking UI glitches.

Zero critical or major defects were identified during implementation and verification.
