/**
 * Authorization Tests — RBAC/ABAC and cross-scope negative tests
 * TVN-EMG-RC-20260811-M1-003
 */

import { authorizeAccess, validateSession, SESSION_STORE } from '@/lib/auth';
import { UserSession } from '@/types/registry';

const platformAdmin: UserSession = { id: 'admin-001', email: 'admin@taven.io', role: 'super_admin', capabilities: ['view_dashboard', 'manage_marketplace', 'manage_users', 'manage_products', 'manage_inventory'], scope: { type: 'PLATFORM', id: 'platform-001' }, authenticated: true, session_token: 'token-admin-001' };
const sellerAdmin: UserSession = { id: 'seller-001', email: 'seller@taven.io', role: 'seller_admin', capabilities: ['view_dashboard', 'manage_products', 'manage_inventory'], scope: { type: 'SELLER_ORG', id: 'scope-seller-001', marketplace_id: 'mkt-alpha', seller_org_id: 'seller-alpha' }, authenticated: true, session_token: 'token-seller-001' };
const unauthenticatedSession: UserSession = { id: 'anon-001', email: '', role: 'seller_admin', capabilities: [], scope: { type: 'STORE', id: 'anon' }, authenticated: false };

describe('Authorization RBAC', () => {
  test('Unauthenticated session is denied', () => {
    const result = authorizeAccess(unauthenticatedSession, ['view_dashboard'], 'PLATFORM');
    expect(result.authorized).toBe(false);
  });
  test('Platform admin can access any level', () => {
    expect(authorizeAccess(platformAdmin, ['view_dashboard'], 'PLATFORM').authorized).toBe(true);
    expect(authorizeAccess(platformAdmin, ['manage_products'], 'STORE').authorized).toBe(true);
  });
  test('Seller cannot escalate to PLATFORM', () => {
    const result = authorizeAccess(sellerAdmin, ['manage_users'], 'PLATFORM');
    expect(result.authorized).toBe(false);
  });
  test('Session validation with valid token', () => {
    SESSION_STORE.clear();
    SESSION_STORE.set('token-admin-001', platformAdmin);
    const session = validateSession('token-admin-001');
    expect(session?.id).toBe('admin-001');
  });
  test('Invalid token returns null', () => {
    expect(validateSession('invalid')).toBeNull();
  });
});
