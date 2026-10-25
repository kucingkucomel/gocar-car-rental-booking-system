# System Requirements Specification (SRS)
## GoCar Car Rental Booking System

**Course:** CSEB5213 — Software Evolution & Maintenance  
**Assignment:** Milestone 1 — System Restructuring / Refactoring  
**Reference System:** GoCar Malaysia  
**Reference Website:** https://www.gocar.my/  
**Document Status:** Baseline requirements for Codebase A and Codebase B

---

## 1. Introduction

### 1.1 Purpose

This document defines the functional requirements, business rules, technical requirements and acceptance criteria for an academic Car Rental Booking System based on publicly observable booking features of GoCar Malaysia.

The requirements will serve as the common blueprint for generating two codebases using generative AI. The codebases will subsequently be compared to identify software quality differences, critical code smells and suitable refactoring techniques.

### 1.2 Reference System

GoCar Malaysia provides an online car-sharing and rental booking service. Its publicly documented booking process includes selecting rental dates and times, choosing an available vehicle, selecting CDW and Flex options, proceeding to payment, and viewing a confirmed reservation in My Bookings.

Reference: https://gocarhelp.zendesk.com/hc/en-us/articles/204049148-How-do-I-book-a-GoCar-Sharing-Ride

### 1.3 Project Scope and Justification

This project implements a simplified academic version of a car rental booking system. It does not reproduce GoCar's actual internal software, production architecture, payment infrastructure or complete business operations.

The scope is intentionally reduced to core booking and administrative functions so that two comparable implementations can be generated, tested, analysed and refactored within the assignment timeline.

---

## 2. System Overview

### 2.1 System Objective

To develop a browser-based application that allows customers to browse cars, calculate rental costs, select rental options, create bookings, simulate payments and view booking history. Administrators can manage vehicle listings and reservations.

### 2.2 User Roles

**Customer**
- Register a demo account and log in.
- Browse and view vehicle information.
- Select rental dates and times.
- Choose CDW and Flex options.
- Calculate rental costs and submit a booking.
- Simulate payment.
- View personal booking history and booking status.

**Administrator**
- Log in using a designated demo administrator account.
- Add, view, edit and remove vehicle listings.
- View all bookings.
- Update booking status where permitted.

---

## 3. Functional Requirements

### FR-01: User Registration and Login

The system shall allow users to register using a name, email address and password, and subsequently log in and log out.

The system shall validate required fields, reject invalid email formats, and prevent duplicate email registrations.

For this educational prototype, authentication is simulated locally and is not suitable for real customer accounts or sensitive information.

### FR-02: Browse Vehicles

The system shall display a list of vehicles with:
- Vehicle name and model.
- Vehicle category.
- Image or placeholder image.
- Passenger capacity.
- Transmission type.
- Rental rate per hour.
- Availability status.

Customers shall be able to view individual vehicle details.

### FR-03: Select Rental Period and Calculate Price

The system shall allow customers to select a rental start date and time and an end date and time.

The system shall reject missing or invalid rental periods, including an end time that is not later than the start time.

The rental duration shall be calculated from the selected period. For the prototype, rental duration shall be charged in whole hours, rounded up when the duration contains a partial hour.

### FR-04: Select Rental Protection and Flex Options

The system shall provide the following illustrative options:

**Collision Damage Waiver (CDW)**
- Lite
- Standard
- Essential

**Flex package**
- Basic Flex
- Premium Flex

The customer shall be able to select the available options before confirming the booking.

The application shall display the selected options and their prices in the booking summary. The prototype's prices and package rules are illustrative test data and shall not be represented as current GoCar commercial prices or terms.

### FR-05: Create a Booking

The system shall allow a logged-in customer to review the selected vehicle, rental period, rental options and total estimated price before submitting a booking.

The system shall generate a unique booking reference for each successfully created booking.

The system shall check vehicle availability against existing confirmed or payment-pending bookings for overlapping rental periods, and reject conflicting bookings.

### FR-06: Simulated Payment

The system shall provide a simulated payment step without connecting to a real payment gateway.

The customer shall be able to simulate a successful or failed payment outcome.

- Successful payment shall update the payment status and booking status accordingly.
- Failed payment shall not be treated as a completed payment.
- The interface shall clearly distinguish pending, successful and failed payments.

No real debit card, credit card or banking information shall be collected.

### FR-07: Booking History and Details

The system shall allow customers to view their own bookings, including:
- Booking reference.
- Vehicle details.
- Rental dates and times.
- Selected CDW and Flex options.
- Total price.
- Payment status.
- Booking status.

Customers shall not be able to view another customer's bookings through the normal interface.

### FR-08: Vehicle and Booking Administration

The system shall provide an administrator interface to:
- Add a vehicle.
- Edit vehicle information and rental rates.
- Remove a vehicle when it has no conflicting active bookings.
- View all bookings.
- Update booking status using the defined status rules.

The system shall validate required vehicle fields and prevent invalid rental rates.

---

## 4. Business Rules

### BR-01: Rental Price Calculation

The base rental charge shall be:

**Base rental charge = Rental duration in billable hours × Vehicle hourly rate**

The total booking price shall be:

**Total price = Base rental charge + CDW charge + Flex package charge**

All amounts shall be displayed in Malaysian Ringgit (RM) to two decimal places.

### BR-02: Illustrative Pricing Data

Both codebases shall use the same predefined vehicle records, hourly rates, CDW rates and Flex package rates.

The team shall define the exact seed data before code generation. The rates shall be fixed for testing and shall not be dynamically retrieved from GoCar.

### BR-03: Vehicle Availability

A vehicle shall not be bookable when an existing confirmed or payment-pending booking overlaps the requested rental period.

A failed or cancelled booking shall not block vehicle availability.

### BR-04: Booking and Payment Status

The prototype shall use the following booking statuses:
- Pending Payment
- Confirmed
- Cancelled

The payment statuses shall be:
- Pending
- Successful
- Failed

A booking shall only become Confirmed when its simulated payment succeeds.

### BR-05: Role Restrictions

Customers shall only access their own booking records. Administrators shall be able to access vehicle-management functions and view all booking records.

### BR-06: Persistence

Application records shall persist in the same browser using local storage across page refreshes.

A reset or clear-demo-data function may be provided for testing. Both codebases shall start with equivalent seed data.

---

## 5. Non-Functional Requirements

### NFR-01: Usability
The interface shall provide clear navigation, readable labels, validation messages and booking summaries.

### NFR-02: Maintainability
The code shall be organised so that vehicle management, booking operations, pricing calculations, authentication and interface rendering can be identified and analysed.

The two codebases may differ in internal organisation because code quality is part of the experiment.

### NFR-03: Reliability
The application shall handle invalid inputs and failed simulated payments without falsely confirming bookings or producing incorrect totals.

### NFR-04: Performance
For the agreed small demo dataset, common actions such as browsing vehicles, calculating prices and viewing bookings should complete without noticeable delay in a modern browser.

### NFR-05: Compatibility
The application shall run locally in a current desktop web browser.

### NFR-06: Privacy and Security Limitations
The prototype shall not collect real payment details or real identity documents. Browser local storage and client-side role checks are for demonstration only and do not provide production-grade authentication, authorisation or data security.

---

## 6. Technical Requirements

Both codebases shall use the same technology stack:

- **Frontend:** HTML5
- **Styling:** CSS3
- **Programming language:** Vanilla JavaScript (ES6 or later)
- **Data persistence:** Browser localStorage
- **Execution environment:** Modern desktop web browser
- **External backend:** None
- **Payment integration:** None; payment is simulated
- **External libraries:** Not required; avoid them unless the team agrees to use the same dependencies in both versions.

This stack is selected to keep setup and execution straightforward while allowing the team to compare code structure, duplication, complexity, cohesion and maintainability.

---

## 7. Out of Scope

The following features are excluded from both codebases:
- Real payment gateway integration.
- Real GoCar account authentication or access to GoCar databases.
- Actual vehicle location tracking or live fleet availability.
- Real identity-card or driving-licence verification.
- Email or SMS notifications.
- Production deployment and server-side security.
- Actual rental agreements, insurance claims or legal processing.
- Real-time synchronization across different users or devices.

---

## 8. Acceptance Criteria

The system shall be considered to meet the agreed baseline when the following tests pass:

1. A new demo customer can register and log in.
2. Duplicate email registration is rejected.
3. The vehicle list and vehicle details are displayed.
4. Invalid rental dates are rejected.
5. Rental duration and total price are calculated consistently.
6. A customer can select CDW and Flex options and see the updated price.
7. A valid booking receives a unique booking reference.
8. An overlapping booking for the same vehicle is rejected when the existing booking is confirmed or payment-pending.
9. Successful simulated payment confirms the booking.
10. Failed simulated payment does not confirm the booking.
11. A customer can view their own booking history.
12. The administrator can manage vehicle listings and view bookings.
13. Application data persists after refreshing the browser.
14. Both codebases pass the same agreed acceptance tests using equivalent seed data.

---

## 9. Codebase Generation Rules

To ensure a fair comparison:

1. Both members must use this same SRS and agreed seed data.
2. Both codebases must implement the same functional scope.
3. Member 1 shall use a straightforward, less-structured prompt for Codebase A.
4. Member 2 shall use a detailed, structured prompt for Codebase B.
5. Each member shall save the exact prompt, AI tool/model if available, generation date, generated files and any manual changes.
6. Neither member shall deliberately introduce defects or code smells to make their codebase appear worse.
7. Both versions shall be tested against the same acceptance criteria before comparison.
8. Original generated versions shall be preserved before any refactoring.
9. The team shall determine which version is poorer in quality from actual code evidence and appropriate metrics rather than assuming the simple-prompt version must be worse.

---

## 10. Assumptions

- The system is an educational prototype and not a commercial rental service.
- Vehicle records and package prices are fixed demonstration data.
- Users access the application through one browser environment.
- Data stored in localStorage is not shared between browsers or devices.
- Simulated payments do not transfer money.
- The reference system informs the functional concept, but the implementation is independently developed.
- The team will agree on the final seed data and test cases before either codebase is generated.

**End of System Requirements Specification**
