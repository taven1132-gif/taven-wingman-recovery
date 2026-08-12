/**
 * MFA Enforcement for Privileged Roles
 */

type UserRole = 'SUPER_ADMIN' | 'MARKETPLACE_ADMIN' | 'SELLER_ADMIN' | 'STORE_MANAGER' | 'OFFICE_ADMIN' | 'VIEWER';

interface MfaStatus {
  userId: string;
  role: UserRole;
  mfaEnabled: boolean;
  mfaVerifiedAt: Date | null;
  sessionMfaStepUp: boolean;
}

const PRIVILEGED_ROLES: UserRole[] = ['SUPER_ADMIN', 'MARKETPLACE_ADMIN', 'SELLER_ADMIN', 'OFFICE_ADMIN'];

function requiresMfa(role: UserRole): boolean {
  return PRIVILEGED_ROLES.includes(role);
}

function enforceMfa(status: MfaStatus): { allowed: boolean; reason?: string } {
  if (!requiresMfa(status.role)) {
    return { allowed: true };
  }
  if (!status.mfaEnabled) {
    return { allowed: false, reason: `MFA must be enabled for role ${status.role}` };
  }
  if (!status.sessionMfaStepUp) {
    return { allowed: false, reason: 'MFA step-up required for this session' };
  }
  return { allowed: true };
}

describe('MFA Enforcement', () => {
  it('requires MFA for SUPER_ADMIN', () => {
    expect(requiresMfa('SUPER_ADMIN')).toBe(true);
  });

  it('requires MFA for MARKETPLACE_ADMIN', () => {
    expect(requiresMfa('MARKETPLACE_ADMIN')).toBe(true);
  });

  it('requires MFA for SELLER_ADMIN', () => {
    expect(requiresMfa('SELLER_ADMIN')).toBe(true);
  });

  it('requires MFA for OFFICE_ADMIN', () => {
    expect(requiresMfa('OFFICE_ADMIN')).toBe(true);
  });

  it('does not require MFA for VIEWER', () => {
    expect(requiresMfa('VIEWER')).toBe(false);
  });

  it('does not require MFA for STORE_MANAGER', () => {
    expect(requiresMfa('STORE_MANAGER')).toBe(false);
  });

  it('allows privileged user with MFA enabled and step-up verified', () => {
    const result = enforceMfa({
      userId: 'u-1',
      role: 'SUPER_ADMIN',
      mfaEnabled: true,
      mfaVerifiedAt: new Date(),
      sessionMfaStepUp: true,
    });
    expect(result.allowed).toBe(true);
  });

  it('blocks privileged user without MFA enabled', () => {
    const result = enforceMfa({
      userId: 'u-2',
      role: 'MARKETPLACE_ADMIN',
      mfaEnabled: false,
      mfaVerifiedAt: null,
      sessionMfaStepUp: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('MFA must be enabled');
  });

  it('blocks privileged user without session step-up', () => {
    const result = enforceMfa({
      userId: 'u-3',
      role: 'SELLER_ADMIN',
      mfaEnabled: true,
      mfaVerifiedAt: new Date(),
      sessionMfaStepUp: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('step-up');
  });

  it('allows VIEWER without MFA', () => {
    const result = enforceMfa({
      userId: 'u-4',
      role: 'VIEWER',
      mfaEnabled: false,
      mfaVerifiedAt: null,
      sessionMfaStepUp: false,
    });
    expect(result.allowed).toBe(true);
  });
});
