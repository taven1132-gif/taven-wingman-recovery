/**
 * Retired Routes Tests — Wholesale and Dropshipping return 410
 * TVN-EMG-RC-20260811-M1-003
 */

import { isRetiredRoute, getRetiredResponse } from '@/lib/retired-routes';

describe('Retired Routes — 410 Gone', () => {
  describe('Route detection', () => {
    test('/wholesale-tiers is detected as retired', () => {
      expect(isRetiredRoute('/wholesale-tiers')).toBe(true);
    });

    test('/wholesale-quotes is detected as retired', () => {
      expect(isRetiredRoute('/wholesale-quotes')).toBe(true);
    });

    test('/wholesale is detected as retired', () => {
      expect(isRetiredRoute('/wholesale')).toBe(true);
    });

    test('/wholesale-admin is detected as retired', () => {
      expect(isRetiredRoute('/wholesale-admin')).toBe(true);
    });

    test('/wholesale-admin/settings is detected as retired', () => {
      expect(isRetiredRoute('/wholesale-admin/settings')).toBe(true);
    });

    test('/wholesale-admin/users/list is detected as retired', () => {
      expect(isRetiredRoute('/wholesale-admin/users/list')).toBe(true);
    });

    test('/dropshipping is detected as retired', () => {
      expect(isRetiredRoute('/dropshipping')).toBe(true);
    });

    test('/dropshipping-admin is detected as retired', () => {
      expect(isRetiredRoute('/dropshipping-admin')).toBe(true);
    });

    test('/dropshipping-admin/config is detected as retired', () => {
      expect(isRetiredRoute('/dropshipping-admin/config')).toBe(true);
    });

    test('/dropshipping-admin/suppliers/list is detected as retired', () => {
      expect(isRetiredRoute('/dropshipping-admin/suppliers/list')).toBe(true);
    });

    test('/dropship is detected as retired', () => {
      expect(isRetiredRoute('/dropship')).toBe(true);
    });

    test('/wholesale/products is detected as retired', () => {
      expect(isRetiredRoute('/wholesale/products')).toBe(true);
    });

    test('/wholesale-tiers/list is detected as retired', () => {
      expect(isRetiredRoute('/wholesale-tiers/list')).toBe(true);
    });

    test('/command-center is NOT retired', () => {
      expect(isRetiredRoute('/command-center')).toBe(false);
    });

    test('/admin/products is NOT retired', () => {
      expect(isRetiredRoute('/admin/products')).toBe(false);
    });

    test('/marketplace/sellers is NOT retired', () => {
      expect(isRetiredRoute('/marketplace/sellers')).toBe(false);
    });
  });

  describe('Retired response', () => {
    test('Returns status 410', () => {
      const response = getRetiredResponse();
      expect(response.status).toBe(410);
    });

    test('Response body contains required fields', () => {
      const response = getRetiredResponse();
      expect(response.body).toHaveProperty('error', 'Gone');
      expect(response.body).toHaveProperty('status', 410);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('retired_at');
      expect(response.body).toHaveProperty('candidate', 'TVN-EMG-RC-20260811-M1-003');
    });
  });
});
