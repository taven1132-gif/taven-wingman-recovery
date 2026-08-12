/**
 * Supplier Auto-Distribution & Store Manual Selection Tests
 */
import {
  checkMarketplaceEligibility,
  distributeToEligibleMarketplaces,
  validateStoreProductSelection,
  ProductForDistribution,
  MarketplaceForDistribution,
} from '../../src/lib/products/distribution';

const product: ProductForDistribution = {
  id: 'prod-001',
  categoryId: 'cat-electronics',
  sellerTier: 'PROFESSIONAL',
  currency: 'USD',
  marketplaceId: 'mkt-origin',
  allGatesPassed: true,
};

const activeMarketplace: MarketplaceForDistribution = {
  id: 'mkt-target-1',
  name: 'Target Marketplace',
  status: 'ACTIVE',
  currency: 'USD',
};

describe('Supplier Distribution', () => {
  describe('checkMarketplaceEligibility', () => {
    it('allows distribution to active marketplace with matching currency', () => {
      const result = checkMarketplaceEligibility(product, activeMarketplace);
      expect(result.eligible).toBe(true);
    });

    it('rejects distribution to own marketplace', () => {
      const result = checkMarketplaceEligibility(product, { ...activeMarketplace, id: 'mkt-origin' });
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('origin');
    });

    it('rejects inactive marketplace', () => {
      const result = checkMarketplaceEligibility(product, { ...activeMarketplace, status: 'SUSPENDED' });
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('SUSPENDED');
    });

    it('rejects when gates not passed', () => {
      const result = checkMarketplaceEligibility({ ...product, allGatesPassed: false }, activeMarketplace);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('gates');
    });

    it('rejects currency mismatch', () => {
      const result = checkMarketplaceEligibility(product, { ...activeMarketplace, currency: 'EUR' });
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Currency');
    });

    it('rejects unsupported category', () => {
      const result = checkMarketplaceEligibility(product, {
        ...activeMarketplace,
        supportedCategories: ['cat-fashion', 'cat-food'],
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('category');
    });

    it('rejects seller tier not accepted', () => {
      const result = checkMarketplaceEligibility(product, {
        ...activeMarketplace,
        acceptedSellerTiers: ['ENTERPRISE'],
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('tier');
    });
  });

  describe('distributeToEligibleMarketplaces', () => {
    it('distributes to all eligible marketplaces', () => {
      const marketplaces: MarketplaceForDistribution[] = [
        { id: 'mkt-origin', name: 'Origin', status: 'ACTIVE', currency: 'USD' },
        { id: 'mkt-1', name: 'Market 1', status: 'ACTIVE', currency: 'USD' },
        { id: 'mkt-2', name: 'Market 2', status: 'ACTIVE', currency: 'USD' },
        { id: 'mkt-3', name: 'Market 3', status: 'SUSPENDED', currency: 'USD' },
      ];
      const result = distributeToEligibleMarketplaces(product, marketplaces);
      expect(result.distributedTo).toEqual(['mkt-1', 'mkt-2']);
      expect(result.totalDistributed).toBe(2);
      expect(result.rejectedFrom).toHaveLength(1);
      expect(result.rejectedFrom[0].marketplaceId).toBe('mkt-3');
    });
  });

  describe('validateStoreProductSelection (Manual Only)', () => {
    it('allows manual selection', () => {
      const result = validateStoreProductSelection('store-1', 'prod-1', 'user-1', true);
      expect(result.allowed).toBe(true);
    });

    it('rejects auto-distribution to stores', () => {
      const result = validateStoreProductSelection('store-1', 'prod-1', 'user-1', false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('manual');
    });

    it('rejects selection without identified user', () => {
      const result = validateStoreProductSelection('store-1', 'prod-1', '', true);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('selector');
    });
  });
});
