/**
 * LiveVerse and Academy Integration Scoping Tests
 */
import { getLiveVerseScope, LIVEVERSE_FEATURES } from '../../src/lib/liveverse/scoping';
import { getAcademyScope, ACADEMY_FEATURES } from '../../src/lib/academy/scoping';

describe('LiveVerse Scoping', () => {
  it('enables all features for active marketplace', () => {
    const scope = getLiveVerseScope('mkt-001', 'ACTIVE');
    expect(scope.enabled).toBe(true);
    expect(scope.features).toEqual(LIVEVERSE_FEATURES);
    expect(scope.features).toHaveLength(5);
  });

  it('disables for non-active marketplace', () => {
    expect(getLiveVerseScope('mkt-001', 'DRAFT').enabled).toBe(false);
    expect(getLiveVerseScope('mkt-001', 'SUSPENDED').enabled).toBe(false);
    expect(getLiveVerseScope('mkt-001', 'ARCHIVED').enabled).toBe(false);
  });

  it('returns empty features when disabled', () => {
    const scope = getLiveVerseScope('mkt-001', 'DRAFT');
    expect(scope.features).toHaveLength(0);
  });

  it('sets minRole to MARKETPLACE_ADMIN when disabled', () => {
    const scope = getLiveVerseScope('mkt-001', 'SUSPENDED');
    expect(scope.minRole).toBe('MARKETPLACE_ADMIN');
  });
});

describe('Academy Scoping', () => {
  it('enables all features for active marketplace', () => {
    const scope = getAcademyScope('mkt-001', 'ACTIVE');
    expect(scope.enabled).toBe(true);
    expect(scope.features).toEqual(ACADEMY_FEATURES);
    expect(scope.features).toHaveLength(5);
  });

  it('disables for non-active marketplace', () => {
    expect(getAcademyScope('mkt-001', 'DRAFT').enabled).toBe(false);
    expect(getAcademyScope('mkt-001', 'PENDING_REVIEW').enabled).toBe(false);
  });

  it('includes SELLER_TRAINING feature', () => {
    const scope = getAcademyScope('mkt-001', 'ACTIVE');
    expect(scope.features).toContain('SELLER_TRAINING');
  });
});
