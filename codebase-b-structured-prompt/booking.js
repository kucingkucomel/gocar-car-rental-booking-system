/**
 * Booking Model
 * Represents a car reservation, its pricing breakdown, and status lifecycle.
 */

import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';

export class Booking {
  /**
   * @param {Object} data
   * @param {string} data.reference
   * @param {string} data.customerId
   * @param {string} [data.customerName]
   * @param {string} [data.customerEmail]
   * @param {string} data.vehicleId
   * @param {Object} data.vehicleDetails
   * @param {string} data.startTime
   * @param {string} data.endTime
   * @param {number} data.billableHours
   * @param {Object} data.cdwPackage
   * @param {Object} data.flexPackage
   * @param {Object} data.pricingBreakdown
   * @param {number} data.totalPrice
   * @param {string} [data.bookingStatus=BOOKING_STATUS.PENDING_PAYMENT]
   * @param {string} [data.paymentStatus=PAYMENT_STATUS.PENDING]
   * @param {string} [data.createdAt]
   * @param {string} [data.updatedAt]
   */
  constructor({
    reference,
    customerId,
    customerName = '',
    customerEmail = '',
    vehicleId,
    vehicleDetails = {},
    startTime,
    endTime,
    billableHours,
    cdwPackage,
    flexPackage,
    pricingBreakdown = {},
    totalPrice,
    bookingStatus = BOOKING_STATUS.PENDING_PAYMENT,
    paymentStatus = PAYMENT_STATUS.PENDING,
    createdAt,
    updatedAt
  }) {
    this.reference = reference;
    this.customerId = customerId;
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.vehicleId = vehicleId;
    this.vehicleDetails = vehicleDetails;
    this.startTime = startTime;
    this.endTime = endTime;
    this.billableHours = Number(billableHours);
    this.cdwPackage = cdwPackage;
    this.flexPackage = flexPackage;
    this.pricingBreakdown = pricingBreakdown;
    this.totalPrice = Number(totalPrice);
    this.bookingStatus = bookingStatus;
    this.paymentStatus = paymentStatus;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || this.createdAt;
  }

  /**
   * Checks if booking is in Confirmed status.
   * @returns {boolean}
   */
  isConfirmed() {
    return this.bookingStatus === BOOKING_STATUS.CONFIRMED;
  }

  /**
   * Checks if booking blocks vehicle availability according to BR-03:
   * "A vehicle shall not be bookable when an existing confirmed or payment-pending booking overlaps the requested rental period.
   * A failed or cancelled booking shall not block vehicle availability."
   * @returns {boolean}
   */
  blocksAvailability() {
    if (this.bookingStatus === BOOKING_STATUS.CANCELLED) {
      return false;
    }
    if (this.paymentStatus === PAYMENT_STATUS.FAILED) {
      return false;
    }
    return (
      this.bookingStatus === BOOKING_STATUS.CONFIRMED ||
      this.bookingStatus === BOOKING_STATUS.PENDING_PAYMENT
    );
  }

  /**
   * Serializes booking for persistence.
   * @returns {Object}
   */
  toJSON() {
    return {
      reference: this.reference,
      customerId: this.customerId,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      vehicleId: this.vehicleId,
      vehicleDetails: this.vehicleDetails,
      startTime: this.startTime,
      endTime: this.endTime,
      billableHours: this.billableHours,
      cdwPackage: this.cdwPackage,
      flexPackage: this.flexPackage,
      pricingBreakdown: this.pricingBreakdown,
      totalPrice: this.totalPrice,
      bookingStatus: this.bookingStatus,
      paymentStatus: this.paymentStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Instantiates a Booking from a plain object.
   * @param {Object} raw
   * @returns {Booking}
   */
  static fromJSON(raw) {
    if (!raw) return null;
    return new Booking(raw);
  }
}
