/**
 * Product Publication Gates — 17 Gate Test Suite
 */
import { checkGate, checkAllGates, PRODUCT_GATES, ProductForGateCheck } from '../../src/lib/products/gates';

const validProduct: ProductForGateCheck = {
  id: 'prod-001',
  name: 'Premium Wireless Headphones',
  description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
  sku: 'AUDIO-WH-001',
  basePrice: 149.99,
  stockQuantity: 50,
  images: ['headphones-front.jpg'],
  tags: ['audio', 'wireless'],
  categoryId: 'cat-electronics',
  sellerOrgId: 'seller-001',
  marketplaceId: 'mkt-001',
  weight: 0.35,
  dimensions: { length: 20, width: 18, height: 8 },
  metadata: { brand: 'AudioPro' },
};

describe('Product Publication Gates', () => {
  describe('Gate count', () => {
    it('should have exactly 17 gates defined', () => {
      expect(PRODUCT_GATES).toHaveLength(17);
    });
  });

  describe('TITLE_MIN_LENGTH', () => {
    it('passes for valid title', () => {
      const result = checkGate(validProduct, 'TITLE_MIN_LENGTH');
      expect(result.passed).toBe(true);
    });
    it('fails for short title', () => {
      const result = checkGate({ ...validProduct, name: 'Ab' }, 'TITLE_MIN_LENGTH');
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('at least');
    });
  });

  describe('DESCRIPTION_MIN_LENGTH', () => {
    it('passes for valid description', () => {
      const result = checkGate(validProduct, 'DESCRIPTION_MIN_LENGTH');
      expect(result.passed).toBe(true);
    });
    it('fails for short description', () => {
      const result = checkGate({ ...validProduct, description: 'Too short' }, 'DESCRIPTION_MIN_LENGTH');
      expect(result.passed).toBe(false);
    });
  });

  describe('SKU_FORMAT_VALID', () => {
    it('passes for valid SKU', () => {
      expect(checkGate(validProduct, 'SKU_FORMAT_VALID').passed).toBe(true);
    });
    it('fails for invalid SKU with spaces', () => {
      expect(checkGate({ ...validProduct, sku: 'bad sku!' }, 'SKU_FORMAT_VALID').passed).toBe(false);
    });
  });

  describe('PRICE_POSITIVE', () => {
    it('passes for positive price', () => {
      expect(checkGate(validProduct, 'PRICE_POSITIVE').passed).toBe(true);
    });
    it('fails for zero price', () => {
      expect(checkGate({ ...validProduct, basePrice: 0 }, 'PRICE_POSITIVE').passed).toBe(false);
    });
    it('fails for negative price', () => {
      expect(checkGate({ ...validProduct, basePrice: -10 }, 'PRICE_POSITIVE').passed).toBe(false);
    });
  });

  describe('PRICE_BELOW_MAX', () => {
    it('passes for reasonable price', () => {
      expect(checkGate(validProduct, 'PRICE_BELOW_MAX').passed).toBe(true);
    });
    it('fails for exceeding max', () => {
      expect(checkGate({ ...validProduct, basePrice: 1000000 }, 'PRICE_BELOW_MAX').passed).toBe(false);
    });
  });

  describe('STOCK_NON_NEGATIVE', () => {
    it('passes for positive stock', () => {
      expect(checkGate(validProduct, 'STOCK_NON_NEGATIVE').passed).toBe(true);
    });
    it('passes for zero stock', () => {
      expect(checkGate({ ...validProduct, stockQuantity: 0 }, 'STOCK_NON_NEGATIVE').passed).toBe(true);
    });
    it('fails for negative stock', () => {
      expect(checkGate({ ...validProduct, stockQuantity: -1 }, 'STOCK_NON_NEGATIVE').passed).toBe(false);
    });
  });

  describe('IMAGE_MINIMUM', () => {
    it('passes with at least 1 image', () => {
      expect(checkGate(validProduct, 'IMAGE_MINIMUM').passed).toBe(true);
    });
    it('fails with no images', () => {
      expect(checkGate({ ...validProduct, images: [] }, 'IMAGE_MINIMUM').passed).toBe(false);
    });
  });

  describe('IMAGE_FORMAT_VALID', () => {
    it('passes for valid image formats', () => {
      expect(checkGate({ ...validProduct, images: ['photo.jpg', 'banner.png'] }, 'IMAGE_FORMAT_VALID').passed).toBe(true);
    });
    it('fails for invalid formats', () => {
      expect(checkGate({ ...validProduct, images: ['file.bmp'] }, 'IMAGE_FORMAT_VALID').passed).toBe(false);
    });
  });

  describe('CATEGORY_ASSIGNED', () => {
    it('passes when category is set', () => {
      expect(checkGate(validProduct, 'CATEGORY_ASSIGNED').passed).toBe(true);
    });
    it('fails when category is null', () => {
      expect(checkGate({ ...validProduct, categoryId: null }, 'CATEGORY_ASSIGNED').passed).toBe(false);
    });
  });

  describe('TAGS_MINIMUM', () => {
    it('passes with at least 1 tag', () => {
      expect(checkGate(validProduct, 'TAGS_MINIMUM').passed).toBe(true);
    });
    it('fails with no tags', () => {
      expect(checkGate({ ...validProduct, tags: [] }, 'TAGS_MINIMUM').passed).toBe(false);
    });
  });

  describe('SELLER_ORG_ACTIVE', () => {
    it('passes when seller org is active', () => {
      expect(checkGate(validProduct, 'SELLER_ORG_ACTIVE', { sellerOrgActive: true }).passed).toBe(true);
    });
    it('fails when seller org is inactive', () => {
      expect(checkGate(validProduct, 'SELLER_ORG_ACTIVE', { sellerOrgActive: false }).passed).toBe(false);
    });
  });

  describe('MARKETPLACE_ACTIVE', () => {
    it('passes when marketplace is active', () => {
      expect(checkGate(validProduct, 'MARKETPLACE_ACTIVE', { marketplaceActive: true }).passed).toBe(true);
    });
    it('fails when marketplace is inactive', () => {
      expect(checkGate(validProduct, 'MARKETPLACE_ACTIVE', { marketplaceActive: false }).passed).toBe(false);
    });
  });

  describe('NO_PROHIBITED_CONTENT', () => {
    it('passes for clean content', () => {
      expect(checkGate(validProduct, 'NO_PROHIBITED_CONTENT').passed).toBe(true);
    });
    it('fails for prohibited words', () => {
      expect(checkGate({ ...validProduct, name: 'Counterfeit Handbag' }, 'NO_PROHIBITED_CONTENT').passed).toBe(false);
    });
  });

  describe('UNIQUE_SKU_IN_MARKETPLACE', () => {
    it('passes when SKU is unique', () => {
      expect(checkGate(validProduct, 'UNIQUE_SKU_IN_MARKETPLACE', { existingSkus: ['OTHER-SKU'] }).passed).toBe(true);
    });
    it('fails when SKU already exists', () => {
      expect(checkGate(validProduct, 'UNIQUE_SKU_IN_MARKETPLACE', { existingSkus: ['AUDIO-WH-001'] }).passed).toBe(false);
    });
  });

  describe('checkAllGates', () => {
    it('all gates pass for a valid product', () => {
      const result = checkAllGates(validProduct, { sellerOrgActive: true, marketplaceActive: true });
      expect(result.allPassed).toBe(true);
      expect(result.failedGates).toHaveLength(0);
      expect(result.results).toHaveLength(17);
    });
    it('reports multiple failures', () => {
      const badProduct: ProductForGateCheck = {
        ...validProduct,
        name: 'Ab',
        basePrice: -1,
        images: [],
        tags: [],
      };
      const result = checkAllGates(badProduct);
      expect(result.allPassed).toBe(false);
      expect(result.failedGates.length).toBeGreaterThan(3);
    });
  });
});
