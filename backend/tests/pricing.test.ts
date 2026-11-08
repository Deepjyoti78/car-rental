import { describe, it, expect } from 'vitest';
import { PricingService } from '../src/modules/pricing/pricing.service.js';

describe('Pricing Engine', () => {
  it('calculates correct rental days with 24-hour ceiling', () => {
    const start = new Date('2026-12-01T10:00:00Z');
    const end24 = new Date('2026-12-02T10:00:00Z');
    expect(PricingService.calculateRentalDays(start, end24)).toBe(1);

    // 25 hours counts as 2 days
    const end25 = new Date('2026-12-02T11:00:00Z');
    expect(PricingService.calculateRentalDays(start, end25)).toBe(2);

    // 72 hours counts as 3 days
    const end72 = new Date('2026-12-04T10:00:00Z');
    expect(PricingService.calculateRentalDays(start, end72)).toBe(3);
  });

  it('rejects invalid or inverted dates', () => {
    const start = new Date('2026-12-05T10:00:00Z');
    const end = new Date('2026-12-04T10:00:00Z');
    expect(() => PricingService.calculateRentalDays(start, end)).toThrow();
  });

  it('calculates full price breakdown in integer paise', () => {
    const start = new Date('2026-12-01T10:00:00Z');
    const end = new Date('2026-12-04T10:00:00Z'); // 3 days
    const dailyRate = 300000; // ₹3,000.00
    const securityDeposit = 500000; // ₹5,000.00
    const commissionRate = 10.0; // 10%

    const result = PricingService.calculatePrice({
      dailyRate,
      securityDeposit,
      startDate: start,
      endDate: end,
      commissionRate,
    });

    expect(result.rentalDays).toBe(3);
    expect(result.baseRate).toBe(300000);
    expect(result.baseAmount).toBe(900000); // 3 * ₹3,000 = ₹9,000
    expect(result.taxesAmount).toBe(162000); // 18% of 900,000 = 162,000 (₹1,620)
    expect(result.platformFee).toBe(50000); // ₹500
    expect(result.securityDeposit).toBe(500000);
    expect(result.totalAmount).toBe(900000 + 162000 + 500000 + 50000); // 1,612,000 (₹16,120)

    // Vendor earnings: baseAmount - 10% commission = 900,000 - 90,000 = 810,000
    expect(result.vendorEarnings).toBe(810000);
  });

  it('calculates correct cancellation refund tiers', () => {
    const tripStart = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now (>48h)
    const baseAmount = 1000000;
    const taxesAmount = 180000;
    const securityDeposit = 500000;
    const platformFee = 50000;

    // >48 hours: 100% refund of base, taxes, deposit
    const tier1 = PricingService.calculateCancellationRefund({
      startDate: tripStart,
      cancellationDate: new Date(),
      baseAmount,
      taxesAmount,
      securityDeposit,
      platformFee,
    });
    expect(tier1.refundableAmount).toBe(1000000 + 180000 + 500000);
    expect(tier1.depositRefund).toBe(500000);

    // 30 hours: 75% refund of base and taxes
    const tripStart30 = new Date(Date.now() + 30 * 60 * 60 * 1000);
    const tier2 = PricingService.calculateCancellationRefund({
      startDate: tripStart30,
      cancellationDate: new Date(),
      baseAmount,
      taxesAmount,
      securityDeposit,
      platformFee,
    });
    expect(tier2.refundableAmount).toBe(750000 + 135000 + 500000);

    // 10 hours: 50% refund
    const tripStart10 = new Date(Date.now() + 10 * 60 * 60 * 1000);
    const tier3 = PricingService.calculateCancellationRefund({
      startDate: tripStart10,
      cancellationDate: new Date(),
      baseAmount,
      taxesAmount,
      securityDeposit,
      platformFee,
    });
    expect(tier3.refundableAmount).toBe(500000 + 90000 + 500000);
  });
});
