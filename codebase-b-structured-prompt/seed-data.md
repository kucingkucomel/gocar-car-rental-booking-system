# GoCar Car Rental Booking System — Shared Seed Data

## 1. Purpose

This document defines the sample data used by Codebase A and Codebase B for the CSEB5213 Software Evolution & Maintenance assignment.

Both implementations must use the same initial data to ensure a fair comparison.

**Note:** All vehicles, rental rates and package prices below are illustrative academic prototype data. They are not official GoCar prices.

## 2. Sample Vehicles

| Vehicle ID | Vehicle Name | Category | Capacity | Transmission | Hourly Rate (RM) |
|---|---|---|---:|---|---:|
| CAR001 | Perodua Axia | Compact | 5 | Automatic | 8.00 |
| CAR002 | Perodua Myvi | Hatchback | 5 | Automatic | 10.00 |
| CAR003 | Proton Saga | Sedan | 5 | Automatic | 12.00 |
| CAR004 | Perodua Alza | MPV | 7 | Automatic | 18.00 |

All four vehicles are initially available for booking.

## 3. Collision Damage Waiver (CDW)

The selected CDW package is charged once per booking.

| Package | Price (RM) |
|---|---:|
| Lite | 5.00 |
| Standard | 10.00 |
| Essential | 15.00 |

## 4. Flex Packages

The selected Flex package is charged once per booking.

| Package | Price (RM) |
|---|---:|
| Basic Flex | 8.00 |
| Premium Flex | 15.00 |

For the prototype, customers must select one CDW package and one Flex package before confirming their booking.

## 5. Price Calculation

Billable hours are calculated by rounding the rental duration up to the next whole hour.

**Base rental price** = Billable hours × Vehicle hourly rate

**Total price** = Base rental price + CDW price + Flex package price

All monetary values must be displayed in Malaysian Ringgit (RM), rounded to two decimal places.

### Example

A customer rents a Perodua Axia for 5 hours and selects Standard CDW and Basic Flex.

- Base rental: 5 × RM8.00 = RM40.00
- Standard CDW: RM10.00
- Basic Flex: RM8.00
- **Total: RM58.00**

## 6. Shared Implementation Rules

1. Codebase A and Codebase B must use the same vehicle records and package prices.
2. Both codebases must implement the same price calculation rules.
3. Both codebases must use the same functional requirements and acceptance tests in `system-requirements.md`.
4. Additional sample data may only be added if both implementations use equivalent data.
5. No real payments will be processed.
6. These prices are for academic testing only and do not represent official GoCar pricing.
