/**
 * Marketplace Tenant Registry Tests
 */
import { canTransition, validateSlug, validateCommissionRate, MARKETPLACE_TEMPLATES, VALID_TRANSITIONS } from '../../src/lib/marketplace/tenant';

describe('Marketplace Tenant', () => {
  describe('canTransition', () => {
    it('DRAFT can transition to PENDING_REVIEW', () => {
      expect(canTransition('DRAFT', 'PENDING_REVIEW')).toBe(true);
    });
    it('DRAFT can transition to ARCHIVED', () => {
      expect(canTransition('DRAFT', 'ARCHIVED')).toBe(true);
    });
    it('DRAFT cannot transition directly to ACTIVE', () => {
      expect(canTransition('DRAFT', 'ACTIVE')).toBe(false);
    });
    it('PENDING_REVIEW can go to ACTIVE or DRAFT', () => {
      expect(canTransition('PENDING_REVIEW', 'ACTIVE')).toBe(true);
      expect(canTransition('PENDING_REVIEW', 'DRAFT')).toBe(true);
    });
    it('ACTIVE can be SUSPENDED or ARCHIVED', () => {
      expect(canTransition('ACTIVE', 'SUSPENDED')).toBe(true);
      expect(canTransition('ACTIVE', 'ARCHIVED')).toBe(true);
    });
    it('ARCHIVED cannot transition anywhere', () => {
      expect(canTransition('ARCHIVED', 'ACTIVE')).toBe(false);
      expect(canTransition('ARCHIVED', 'DRAFT')).toBe(false);
    });
    it('SUSPENDED can go back to ACTIVE', () => {
      expect(canTransition('SUSPENDED', 'ACTIVE')).toBe(true);
    });
  });

  describe('validateSlug', () => {
    it('accepts valid slug', () => {
      expect(validateSlug('my-marketplace-01').valid).toBe(true);
    });
    it('rejects short slug', () => {
      expect(validateSlug('ab').valid).toBe(false);
    });
    it('rejects uppercase', () => {
      expect(validateSlug('MyMarket').valid).toBe(false);
    });
    it('rejects consecutive hyphens', () => {
      expect(validateSlug('my--market').valid).toBe(false);
    });
    it('rejects starting with digit', () => {
      expect(validateSlug('1market').valid).toBe(false);
    });
    it('rejects ending with hyphen', () => {
      expect(validateSlug('market-').valid).toBe(false);
    });
  });

  describe('validateCommissionRate', () => {
    it('accepts 0%', () => {
      expect(validateCommissionRate(0).valid).toBe(true);
    });
    it('accepts 10%', () => {
      expect(validateCommissionRate(0.10).valid).toBe(true);
    });
    it('rejects negative', () => {
      expect(validateCommissionRate(-0.01).valid).toBe(false);
    });
    it('rejects above 50%', () => {
      expect(validateCommissionRate(0.51).valid).toBe(false);
    });
  });

  describe('MARKETPLACE_TEMPLATES', () => {
    it('has 3 templates', () => {
      expect(Object.keys(MARKETPLACE_TEMPLATES)).toHaveLength(3);
    });
    it('includes COMMERCE_HUB, CREATOR_MARKET, B2B_EXCHANGE', () => {
      expect(MARKETPLACE_TEMPLATES.COMMERCE_HUB).toBeDefined();
      expect(MARKETPLACE_TEMPLATES.CREATOR_MARKET).toBeDefined();
      expect(MARKETPLACE_TEMPLATES.B2B_EXCHANGE).toBeDefined();
    });
  });
});
