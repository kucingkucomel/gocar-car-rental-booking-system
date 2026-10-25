/**
 * Pricing Service
 * Authoritative single source of truth for rental price calculations according to BR-01.
 * 
 * Rules:
 *   Billable hours = rental duration rounded up to the next whole hour.
 *   Base rental price = Billable hours * Vehicle hourly rate
 *   Total price = Base rental price + CDW package price + Flex package price
 *   All monetary values displayed in Malaysian Ringgit (RM) with 2 decimal places.
 */

import { CDW_PACKAGES, FLEX_PACKAGES } from '../config/constants.js';
import { calculateBillableHours, calculateDurationHours } from '../utils/date-utils.js';
import { formatCurrencyRM, formatHours } from '../utils/formatters.js';
import { validateRentalDates, validatePositiveNumber } from '../utils/validators.js';

class PricingService {
  /**
   * Resolves a CDW package by ID or returns null if not found.
   * @param {string} packageId
   * @returns {Object|null}
   */
  getCdwPackage(packageId) {
    if (!packageId) return null;
    const key = Object.keys(CDW_PACKAGES).find(
      k => CDW_PACKAGES[k].id.toLowerCase() === packageId.toLowerCase()
    );
    return key ? CDW_PACKAGES[key] : null;
  }

  /**
   * Resolves a Flex package by ID or returns null if not found.
   * @param {string} packageId
   * @returns {Object|null}
   */
  getFlexPackage(packageId) {
    if (!packageId) return null;
    const key = Object.keys(FLEX_PACKAGES).find(
      k => FLEX_PACKAGES[k].id.toLowerCase() === packageId.toLowerCase()
    );
    return key ? FLEX_PACKAGES[key] : null;
  }

  /**
   * Calculates complete rental pricing breakdown.
   * 
   * @param {Object} params
   * @param {number} params.hourlyRate - Vehicle hourly rental rate (RM)
   * @param {string|Date} params.startTime - Rental start datetime
   * @param {string|Date} params.endTime - Rental end datetime
   * @param {string} params.cdwPackageId - CDW package ID ('lite', 'standard', 'essential')
   * @param {string} params.flexPackageId - Flex package ID ('basic_flex', 'premium_flex')
   * @returns {Object} Complete pricing calculation and breakdown
   */
  calculateRentalPrice({ hourlyRate, startTime, endTime, cdwPackageId, flexPackageId }) {
    // 1. Validate dates
    const dateValidation = validateRentalDates(startTime, endTime);
    if (!dateValidation.isValid) {
      throw new Error(dateValidation.error);
    }

    // 2. Validate hourly rate
    const rateValidation = validatePositiveNumber(hourlyRate, 'Vehicle hourly rate');
    if (!rateValidation.isValid) {
      throw new Error(rateValidation.error);
    }
    const rate = Number(hourlyRate);

    // 3. Validate packages
    const cdwPackage = this.getCdwPackage(cdwPackageId);
    if (!cdwPackage) {
      throw new Error(`Invalid CDW package: "${cdwPackageId}". Please select Lite, Standard, or Essential.`);
    }

    const flexPackage = this.getFlexPackage(flexPackageId);
    if (!flexPackage) {
      throw new Error(`Invalid Flex package: "${flexPackageId}". Please select Basic Flex or Premium Flex.`);
    }

    // 4. Calculate duration & billable hours (rounded up)
    const rawHours = calculateDurationHours(startTime, endTime);
    const billableHours = calculateBillableHours(startTime, endTime);

    if (billableHours <= 0) {
      throw new Error('Calculated billable hours must be at least 1 hour.');
    }

    // 5. Calculate base and total charges
    const basePrice = Math.round(billableHours * rate * 100) / 100;
    const cdwPrice = cdwPackage.price;
    const flexPrice = flexPackage.price;
    const totalPrice = Math.round((basePrice + cdwPrice + flexPrice) * 100) / 100;

    return {
      billableHours,
      rawHours: Number(rawHours.toFixed(2)),
      hourlyRate: rate,
      basePrice,
      cdwPackage: {
        id: cdwPackage.id,
        name: cdwPackage.name,
        price: cdwPrice,
        description: cdwPackage.description
      },
      cdwPrice,
      flexPackage: {
        id: flexPackage.id,
        name: flexPackage.name,
        price: flexPrice,
        description: flexPackage.description
      },
      flexPrice,
      totalPrice,
      formatted: {
        hourlyRate: formatCurrencyRM(rate),
        basePrice: formatCurrencyRM(basePrice),
        cdwPrice: formatCurrencyRM(cdwPrice),
        flexPrice: formatCurrencyRM(flexPrice),
        totalPrice: formatCurrencyRM(totalPrice),
        billableHours: formatHours(billableHours)
      }
    };
  }
}

export const pricingService = new PricingService();
