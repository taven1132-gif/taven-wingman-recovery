/**
 * Seller Organization Lifecycle Tests
 */
import {
  canSellerTransition,
  validateSellerApplication,
  calculateTierEligibility,
  SELLER_STATUS_TRANSITIONS,
  TIER_REQUIREMENTS,
} from '../../src/lib/seller/lifecycle';

describe('Seller Lifecycle', () => {
  describe('canSellerTransition', () => {
    it('PENDING_APPLICATION -> UNDER_REVIEW', () => {
      expect(canSellerTransition('PENDING_APPLICATION', 'UNDER_REVIEW')).toBe(true);
    });
    it('UNDER_REVIEW -> APPROVED', () => {
      expect(canSellerTransition('UNDER_REVIEW', 'APPROVED')).toBe(true);
    });
    it('APPROVED -> ACTIVE', () => {
      expect(canSellerTransition('APPROVED', 'ACTIVE')).toBe(true);
    });
    it('ACTIVE -> SUSPENDED', () => {
      expect(canSellerTransition('ACTIVE', 'SUSPENDED')).toBe(true);
    });
    it('SUSPENDED -> ACTIVE (reinstatement)', () => {
      expect(canSellerTransition('SUSPENDED', 'ACTIVE')).toBe(true);
    });
    it('TERMINATED is final', () => {
      expect(canSellerTransition('TERMINATED', 'ACTIVE')).toBe(false);
      expect(canSellerTransition('TERMINATED', 'PENDING_APPLICATION')).toBe(false);
    });
    it('cannot skip UNDER_REVIEW -> ACTIVE directly', () => {
      expect(canSellerTransition('UNDER_REVIEW', 'ACTIVE')).toBe(false);
    });
    it('any state can go to TERMINATED', () => {
      expect(canSellerTransition('PENDING_APPLICATION', 'TERMINATED')).toBe(true);
      expect(canSellerTransition('ACTIVE', 'TERMINATED')).toBe(true);
    });
  });

  describe('validateSellerApplication', () => {
    const validApp = {
      businessName: 'Test Corp',
      businessType: 'LLC',
      contactEmail: 'test@example.com',
      description: 'A comprehensive business providing quality products to marketplace customers.',
      productCategories: ['electronics', 'accessories'],
      agreeToTerms: true,
    };

    it('accepts valid application', () => {
      const result = validateSellerApplication(validApp);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects missing business name', () => {
      const result = validateSellerApplication({ ...validApp, businessName: '' });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Business name');
    });

    it('rejects invalid email', () => {
      const result = validateSellerApplication({ ...validApp, contactEmail: 'not-an-email' });
      expect(result.valid).toBe(false);
    });

    it('rejects short description', () => {
      const result = validateSellerApplication({ ...validApp, description: 'Short' });
      expect(result.valid).toBe(false);
    });

    it('rejects empty categories', () => {
      const result = validateSellerApplication({ ...validApp, productCategories: [] });
      expect(result.valid).toBe(false);
    });

    it('rejects without terms agreement', () => {
      const result = validateSellerApplication({ ...validApp, agreeToTerms: false });
      expect(result.valid).toBe(false);
    });
  });

  describe('calculateTierEligibility', () => {
    it('returns STARTER for new sellers', () => {
      expect(calculateTierEligibility(0, 0, 0)).toBe('STARTER');
    });
    it('returns GROWTH for qualifying sellers', () => {
      expect(calculateTierEligibility(15, 3.8, 4)).toBe('GROWTH');
    });
    it('returns PROFESSIONAL for high performers', () => {
      expect(calculateTierEligibility(60, 4.2, 7)).toBe('PROFESSIONAL');
    });
    it('returns ENTERPRISE for top sellers', () => {
      expect(calculateTierEligibility(250, 4.7, 13)).toBe('ENTERPRISE');
    });
    it('does not promote if rating is too low', () => {
      expect(calculateTierEligibility(300, 3.0, 15)).toBe('STARTER');
    });
  });
});
