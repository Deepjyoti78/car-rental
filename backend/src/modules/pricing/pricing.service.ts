export interface PricingCalculationResult {
  rentalDays: number;
  baseRate: number; // In paise
  baseAmount: number; // In paise
  taxesAmount: number; // 18% GST on baseAmount in paise
  securityDeposit: number; // In paise
  platformFee: number; // In paise
  totalAmount: number; // In paise
  commissionRate: number; // e.g. 10.0%
  vendorEarnings: number; // In paise
}

export interface RefundCalculationResult {
  refundableAmount: number; // In paise
  cancellationPenalty: number; // In paise
  policyApplied: string;
  depositRefund: number;
}

export class PricingService {
  /**
   * Calculates rental days based on start and end dates (minimum 1 day, ceiling fractional)
   */
  public static calculateRentalDays(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs <= 0) {
      throw new Error('Return date must be after pickup date.');
    }

    const hours = diffMs / (1000 * 60 * 60);
    // Every full or partial 24 hour block counts as a rental day
    const days = Math.ceil(hours / 24);
    return Math.max(1, days);
  }

  /**
   * Centralized server-side pricing breakdown calculation
   * All currency values are strictly calculated in minor units (paise) to prevent floating-point inaccuracies
   */
  public static calculatePrice(params: {
    dailyRate: number;
    securityDeposit: number;
    startDate: Date;
    endDate: Date;
    commissionRate?: number;
  }): PricingCalculationResult {
    const rentalDays = this.calculateRentalDays(params.startDate, params.endDate);
    const baseRate = Math.round(params.dailyRate);
    const baseAmount = baseRate * rentalDays;

    // 18% GST on base rental amount
    const taxesAmount = Math.round(baseAmount * 0.18);

    const securityDeposit = Math.round(params.securityDeposit);

    // Platform booking processing fee (flat ₹500 = 50000 paise)
    const platformFee = 50000;

    // Final total customer payable amount
    const totalAmount = baseAmount + taxesAmount + securityDeposit + platformFee;

    // Vendor earnings calculation based on vendor's commission rate
    const commissionRate = params.commissionRate ?? 10.0;
    const platformCommission = Math.round((baseAmount * commissionRate) / 100);
    const vendorEarnings = baseAmount - platformCommission;

    return {
      rentalDays,
      baseRate,
      baseAmount,
      taxesAmount,
      securityDeposit,
      platformFee,
      totalAmount,
      commissionRate,
      vendorEarnings,
    };
  }

  /**
   * Calculates refundable amount when a booking is cancelled
   */
  public static calculateCancellationRefund(params: {
    startDate: Date;
    cancellationDate?: Date;
    baseAmount: number;
    taxesAmount: number;
    securityDeposit: number;
    platformFee: number;
  }): RefundCalculationResult {
    const cancelTime = params.cancellationDate ?? new Date();
    const hoursUntilPickup = (params.startDate.getTime() - cancelTime.getTime()) / (1000 * 60 * 60);

    let baseRefundPercentage = 0;
    let policyApplied = '';

    if (hoursUntilPickup >= 48) {
      baseRefundPercentage = 100;
      policyApplied = 'Full refund (>48 hours prior to trip start)';
    } else if (hoursUntilPickup >= 24) {
      baseRefundPercentage = 75;
      policyApplied = '75% rental refund (24 to 48 hours prior to trip start)';
    } else if (hoursUntilPickup > 0) {
      baseRefundPercentage = 50;
      policyApplied = '50% rental refund (less than 24 hours prior to trip start)';
    } else {
      baseRefundPercentage = 0;
      policyApplied = 'No rental refund after pickup scheduled time';
    }

    const baseRefund = Math.round((params.baseAmount * baseRefundPercentage) / 100);
    // Taxes are refunded proportionally with base amount
    const taxesRefund = Math.round((params.taxesAmount * baseRefundPercentage) / 100);
    // Security deposit is ALWAYS 100% refunded if car was not picked up
    const depositRefund = params.securityDeposit;

    const refundableAmount = baseRefund + taxesRefund + depositRefund;
    const originalTotal = params.baseAmount + params.taxesAmount + params.securityDeposit + params.platformFee;
    const cancellationPenalty = originalTotal - refundableAmount;

    return {
      refundableAmount,
      cancellationPenalty,
      policyApplied,
      depositRefund,
    };
  }
}
