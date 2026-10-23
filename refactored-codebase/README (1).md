# GoCar Car Rental Booking System — Software Evolution & Maintenance Assignment Deliverable

**Course:** CSEB5213 — Software Evolution & Maintenance  
**System:** GoCar Malaysia Academic Prototype  
**Semester / Year:** October 2026  
**Document Status:** Complete Academic Assessment Deliverable  

---

## 1. Repository Overview

This repository contains the complete assignment deliverable for **Software Evolution & Maintenance**, consisting of the original baseline prototype, a comprehensive technical analysis of genuine code smells, the fully refactored and modularized codebase, empirical before-and-after verification metrics, and complete academic assessment documentation.

### Deliverable Directory Layout

```text
simple prompt/
├── README.md                      # Master repository documentation (this file)
├── codebase-a-simple-prompt/      # UNCHANGED original source files (Baseline)
│   ├── index.html                 # Original SPA markup
│   ├── README.md                  # Original specification documentation
│   ├── css/
│   │   └── style.css              # Original stylesheet
│   ├── js/
│   │   ├── admin.js               # Original admin service
│   │   ├── app.js                 # Original monolithic controller (1,284 lines)
│   │   ├── auth.js                # Original auth module
│   │   ├── booking.js             # Original booking module
│   │   └── data.js                # Original data module
│   └── tests/
│       └── acceptance.test.js     # Original 18 acceptance criteria assertions
├── refactored-codebase/           # REFACTORED, modularized, production-quality codebase
│   ├── index.html                 # Refactored entry point with modular script loading
│   ├── README.md                  # Runnable instructions & guide for refactored system
│   ├── css/
│   │   └── style.css              # Preserved visual styling & responsive design
│   ├── js/
│   │   ├── constants/             # Centralized constants & seed fixtures
│   │   ├── utils/                 # Pure formatters & XSS DOM sanitizers
│   │   ├── services/              # Domain logic (Auth, Booking, Admin, Storage)
│   │   ├── ui/                    # Dedicated presentation views & vector assets
│   │   └── app.js                 # Streamlined application orchestrator (476 lines)
│   └── tests/
│       ├── acceptance.test.js     # Acceptance criteria test suite (18 assertions)
│       ├── unit-refactored.test.js# Modular unit & security regression suite (22 assertions)
│       └── run-all-tests.js       # Master runner executing both suites (40 assertions)
└── docs/                          # Comprehensive academic documentation
    ├── codebase-analysis.md       # Original architecture & code smell inventory
    ├── refactoring-report.md      # Refactoring strategy, design improvements & code diffs
    └── testing-and-comparison.md  # Test results & empirical before-and-after metrics
```

---

## 2. Key Refactoring Highlights & Quantitative Improvements

| Metric | Original Baseline (`codebase-a-simple-prompt/`) | Refactored Version (`refactored-codebase/`) | Measurable Improvement |
|---|---:|---:|---:|
| **Application Controller (`js/app.js`)** | 1,284 lines | 476 lines | **-62.9% code volume reduction** |
| **Controller Cyclomatic Complexity** | 169 decision points | 56 decision points | **-66.9% complexity reduction** |
| **JavaScript Modules Count** | 5 files | 14 files | **+180% modular decomposition** |
| **Average Lines per JS Module** | 456.0 lines | 213.9 lines | **-53.1% reduction in module size** |
| **Duplicated Active Booking Definitions** | 4 locations | 1 location (`isActiveBooking`) | **-75% duplication eliminated** |
| **Unescaped HTML Interpolations (XSS)** | 7 locations | 0 locations (`DOMUtils.escapeHTML`) | **100% neutralized** |
| **Automated Test Assertions** | 18 assertions | 40 assertions | **+122% test coverage expansion** |
| **Test Pass Rate** | 100% (18/18) | 100% (40/40) | **Zero behavioral regression** |

---

## 3. Quick Start & Execution Guide

### Running the Refactored Application
No build step, bundler, or package manager is required. The project runs immediately using vanilla browser technologies:

1. **Direct Launch:** Double-click `refactored-codebase/index.html` in File Explorer, or open:
   ```text
   file:///C:/assignmentevo/simple%20prompt/refactored-codebase/index.html
   ```
2. **Local Web Server (Python 3):**
   ```powershell
   cd refactored-codebase
   python -m http.server 8000
   ```
   Navigate to `http://localhost:8000`.

3. **Local Web Server (Node.js):**
   ```powershell
   cd refactored-codebase
   npx serve .
   ```
   Navigate to `http://localhost:3000`.

---

## 4. Test Verification Instructions

### Running Baseline Acceptance Tests
```powershell
node codebase-a-simple-prompt/tests/acceptance.test.js
```
*(Result: 18/18 Acceptance Tests Passed)*

### Running Master Refactored Test Suite
```powershell
node refactored-codebase/tests/run-all-tests.js
```
*(Result: 40/40 Assertions Passed across 2 suites)*

---

## 5. Demo Credentials

Quick autofill buttons are provided in the top demo banner for rapid testing:

| Role | Email | Password | Allowed Scope |
|---|---|---|---|
| **Customer** | `customer@gocar.demo` | `password123` | Browse fleet, create bookings, simulated payment, view receipts. |
| **Administrator** | `admin@gocar.demo` | `admin123` | Add/Edit/Remove fleet vehicles, view all bookings, status overrides. |

---

## 6. Academic Documentation Index

All required technical documentation is organized in the `docs/` folder:
- [docs/codebase-analysis.md](docs/codebase-analysis.md): Overview, original architecture, source inventory, main workflows, confirmed code smells table with source evidence.
- [docs/refactoring-report.md](docs/refactoring-report.md): Refactoring objectives, strategy, techniques applied, before-and-after code diffs, behavioral preservation, technical debt.
- [docs/testing-and-comparison.md](docs/testing-and-comparison.md): Test environment, baseline vs. post-refactoring test logs, empirical comparison tables, resolved defects.

---

## 7. Instructions for Uploading to GitHub

To push this complete project to your university assignment GitHub repository:

1. **Initialize Git (if not already initialized):**
   ```powershell
   git init
   ```
2. **Stage all deliverables (Baseline, Refactored Codebase, Docs, Readme):**
   ```powershell
   git add .
   ```
3. **Commit the repository:**
   ```powershell
   git commit -m "Milestone 1: Refactored GoCar Booking System with complete documentation and test suites"
   ```
4. **Link to your remote GitHub repository:**
   ```powershell
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   ```
5. **Push to GitHub:**
   ```powershell
   git push -u origin main
   ```
