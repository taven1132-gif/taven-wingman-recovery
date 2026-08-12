/**
 * Peer-Tenant Isolation Tests
 * Marketplace tenants must be completely isolated from each other.
 * No data leakage, no cross-tenant access without explicit grants.
 */

interface TenantContext {
  userId: string;
  userRole: string;
  marketplaceId: string;
}

interface Grant {
  recipientId: string;
  marketplaceId: string;
  grantType: string;
  permissions: string[];
  revokedAt: Date | null;
  expiresAt: Date | null;
}

function canAccessTenant(
  requester: TenantContext,
  targetMarketplaceId: string,
  grants: Grant[],
  now: Date = new Date()
): { allowed: boolean; reason?: string } {
  // Same marketplace = allowed
  if (requester.marketplaceId === targetMarketplaceId) {
    return { allowed: true };
  }

  // SUPER_ADMIN can access all tenants
  if (requester.userRole === 'SUPER_ADMIN') {
    return { allowed: true };
  }

  // Check for valid cross-marketplace grant
  const validGrant = grants.find(g =>
    g.recipientId === requester.userId &&
    g.marketplaceId === targetMarketplaceId &&
    g.revokedAt === null &&
    (g.expiresAt === null || g.expiresAt > now)
  );

  if (validGrant) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Cross-tenant access denied: no valid grant exists' };
}

describe('Peer-Tenant Isolation', () => {
  const userA: TenantContext = { userId: 'user-a', userRole: 'MARKETPLACE_ADMIN', marketplaceId: 'mkt-alpha' };
  const userB: TenantContext = { userId: 'user-b', userRole: 'SELLER_ADMIN', marketplaceId: 'mkt-beta' };
  const superAdmin: TenantContext = { userId: 'admin', userRole: 'SUPER_ADMIN', marketplaceId: 'mkt-central' };

  it('allows access to own marketplace', () => {
    expect(canAccessTenant(userA, 'mkt-alpha', []).allowed).toBe(true);
  });

  it('blocks cross-tenant access without grant', () => {
    const result = canAccessTenant(userA, 'mkt-beta', []);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Cross-tenant');
  });

  it('SUPER_ADMIN can access any tenant', () => {
    expect(canAccessTenant(superAdmin, 'mkt-alpha', []).allowed).toBe(true);
    expect(canAccessTenant(superAdmin, 'mkt-beta', []).allowed).toBe(true);
  });

  it('allows cross-tenant access with valid grant', () => {
    const grants: Grant[] = [{
      recipientId: 'user-a',
      marketplaceId: 'mkt-beta',
      grantType: 'CROSS_SELL',
      permissions: ['read_products'],
      revokedAt: null,
      expiresAt: null,
    }];
    expect(canAccessTenant(userA, 'mkt-beta', grants).allowed).toBe(true);
  });

  it('blocks cross-tenant access with revoked grant', () => {
    const grants: Grant[] = [{
      recipientId: 'user-a',
      marketplaceId: 'mkt-beta',
      grantType: 'CROSS_SELL',
      permissions: ['read_products'],
      revokedAt: new Date('2025-01-01'),
      expiresAt: null,
    }];
    expect(canAccessTenant(userA, 'mkt-beta', grants).allowed).toBe(false);
  });

  it('blocks cross-tenant access with expired grant', () => {
    const grants: Grant[] = [{
      recipientId: 'user-a',
      marketplaceId: 'mkt-beta',
      grantType: 'ANALYTICS_VIEW',
      permissions: ['read_analytics'],
      revokedAt: null,
      expiresAt: new Date('2020-01-01'),
    }];
    expect(canAccessTenant(userA, 'mkt-beta', grants).allowed).toBe(false);
  });

  it('user B cannot access marketplace A', () => {
    expect(canAccessTenant(userB, 'mkt-alpha', []).allowed).toBe(false);
  });
});
