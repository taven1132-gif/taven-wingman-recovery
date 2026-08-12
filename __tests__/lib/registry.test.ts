/**
 * Capability Registry Tests
 * TVN-EMG-RC-20260811-M1-003
 */

import {
  CAPABILITY_REGISTRY,
  NAVIGATION_GROUPS,
  getActiveCapabilities,
  getRetiredCapabilities,
  getCapabilitiesByGroup,
  getCapabilityByRoute,
  isRetiredRoute,
  getCapabilitiesForSession,
} from '@/registry/capabilities';

describe('Capability Registry', () => {
  describe('Registry structure', () => {
    test('All entries have required fields', () => {
      CAPABILITY_REGISTRY.forEach(entry => {
        expect(entry.id).toBeTruthy();
        expect(entry.group).toBeTruthy();
        expect(entry.label).toBeTruthy();
        expect(entry.route).toBeTruthy();
        expect(entry.feature_flag).toBeTruthy();
        expect(entry.status).toBeTruthy();
        expect(Array.isArray(entry.required_capabilities)).toBe(true);
        expect(Array.isArray(entry.scope_types)).toBe(true);
      });
    });

    test('All entries have valid status values', () => {
      const validStatuses = ['VERIFIED', 'UNKNOWN', 'NOT_CONNECTED', 'DEGRADED', 'BLOCKED', 'RETIRED'];
      CAPABILITY_REGISTRY.forEach(entry => {
        expect(validStatuses).toContain(entry.status);
      });
    });

    test('All entries belong to a valid navigation group', () => {
      const validGroups = NAVIGATION_GROUPS.map(g => g.label);
      // Active entries must be in valid groups
      // Retired entries are excluded from navigation
      getActiveCapabilities().forEach(entry => {
        expect(validGroups).toContain(entry.group);
      });
    });
  });

  describe('Navigation groups', () => {
    test('Exactly 10 navigation groups defined', () => {
      expect(NAVIGATION_GROUPS).toHaveLength(10);
    });

    test('Groups have correct order', () => {
      const expectedOrder = [
        'TAVEN Front Page',
        'Executive',
        'Marketplace & Seller',
        'Commerce & Operations',
        'LiveVerse & Community',
        'Marketing, Ads & Networking',
        'Academy & Education',
        'Integrations',
        'Offices & Governance',
        'Administration',
      ];
      NAVIGATION_GROUPS.forEach((group, idx) => {
        expect(group.label).toBe(expectedOrder[idx]);
        expect(group.order).toBe(idx + 1);
      });
    });
  });

  describe('Retired modules', () => {
    test('Wholesale Tiers is RETIRED', () => {
      const entry = CAPABILITY_REGISTRY.find(c => c.id === 'wholesale-tiers');
      expect(entry).toBeDefined();
      expect(entry!.status).toBe('RETIRED');
    });

    test('Wholesale Quotes is RETIRED', () => {
      const entry = CAPABILITY_REGISTRY.find(c => c.id === 'wholesale-quotes');
      expect(entry).toBeDefined();
      expect(entry!.status).toBe('RETIRED');
    });

    test('Dropshipping is RETIRED', () => {
      const entry = CAPABILITY_REGISTRY.find(c => c.id === 'dropshipping');
      expect(entry).toBeDefined();
      expect(entry!.status).toBe('RETIRED');
    });

    test('getActiveCapabilities excludes retired', () => {
      const active = getActiveCapabilities();
      active.forEach(entry => {
        expect(entry.status).not.toBe('RETIRED');
      });
    });

    test('getRetiredCapabilities returns only retired', () => {
      const retired = getRetiredCapabilities();
      retired.forEach(entry => {
        expect(entry.status).toBe('RETIRED');
      });
      expect(retired.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Route retirement checks', () => {
    test('/wholesale-tiers is retired', () => {
      expect(isRetiredRoute('/wholesale-tiers')).toBe(true);
    });

    test('/wholesale-quotes is retired', () => {
      expect(isRetiredRoute('/wholesale-quotes')).toBe(true);
    });

    test('/dropshipping is retired', () => {
      expect(isRetiredRoute('/dropshipping')).toBe(true);
    });

    test('/command-center is NOT retired', () => {
      expect(isRetiredRoute('/command-center')).toBe(false);
    });
  });

  describe('CJ Automation rename', () => {
    test('No entry labeled "CJ Automation" exists', () => {
      const cjEntry = CAPABILITY_REGISTRY.find(c => 
        c.label.toLowerCase().includes('cj automation')
      );
      expect(cjEntry).toBeUndefined();
    });

    test('Supplier Integration exists', () => {
      const entry = CAPABILITY_REGISTRY.find(c => c.id === 'supplier-integration');
      expect(entry).toBeDefined();
      expect(entry!.label).toBe('Supplier Integration');
    });

    test('Connector Hub exists', () => {
      const entry = CAPABILITY_REGISTRY.find(c => c.id === 'connector-hub');
      expect(entry).toBeDefined();
      expect(entry!.label).toBe('Connector Hub');
    });
  });

  describe('Capability filtering', () => {
    test('getCapabilitiesByGroup returns correct items', () => {
      const execItems = getCapabilitiesByGroup('Executive');
      execItems.forEach(item => {
        expect(item.group).toBe('Executive');
        expect(item.status).not.toBe('RETIRED');
      });
    });

    test('getCapabilityByRoute finds correct entry', () => {
      const entry = getCapabilityByRoute('/command-center');
      expect(entry).toBeDefined();
      expect(entry!.id).toBe('taven-home');
    });

    test('getCapabilitiesForSession filters by capabilities', () => {
      const limited = getCapabilitiesForSession(['view_dashboard', 'manage_products']);
      limited.forEach(entry => {
        const hasMatch = entry.required_capabilities.length === 0 ||
          entry.required_capabilities.some(rc => ['view_dashboard', 'manage_products'].includes(rc));
        expect(hasMatch).toBe(true);
      });
    });
  });
});
