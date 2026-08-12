/**
 * Advertising Governance — Deny-by-Default Tests
 */
import { requireAdvertisingAuthority, checkAdvertisingAuthority, AdvertisingDeniedError, AdvertisingContext } from '../../src/lib/advertising/governance';

describe('Advertising Governance', () => {
  test('SUPER_ADMIN always has authority', () => {
    expect(() => requireAdvertisingAuthority({ userRole: 'SUPER_ADMIN', policyType: 'DENY_ALL' })).not.toThrow();
  });
  test('DENY_ALL blocks non-SUPER_ADMIN', () => {
    expect(() => requireAdvertisingAuthority({ userRole: 'SELLER_ADMIN', policyType: 'DENY_ALL' })).toThrow(AdvertisingDeniedError);
  });
  test('PLATFORM_ONLY allows MARKETPLACE_ADMIN', () => {
    expect(() => requireAdvertisingAuthority({ userRole: 'MARKETPLACE_ADMIN', policyType: 'PLATFORM_ONLY' })).not.toThrow();
  });
  test('SELF_SERVE allows SELLER_ADMIN', () => {
    expect(() => requireAdvertisingAuthority({ userRole: 'SELLER_ADMIN', policyType: 'SELF_SERVE' })).not.toThrow();
  });
  test('checkAdvertisingAuthority returns boolean', () => {
    expect(checkAdvertisingAuthority({ userRole: 'VIEWER', policyType: 'DENY_ALL' })).toBe(false);
    expect(checkAdvertisingAuthority({ userRole: 'SUPER_ADMIN', policyType: 'DENY_ALL' })).toBe(true);
  });
});
