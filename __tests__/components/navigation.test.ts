/**
 * Navigation Component Tests
 * TVN-EMG-RC-20260811-M1-003
 */

import { NAVIGATION_GROUPS, getActiveCapabilities, getCapabilitiesByGroup } from '@/registry/capabilities';

describe('Navigation Collapsible Domain Groups', () => {
  test('All 10 domain groups are defined', () => {
    expect(NAVIGATION_GROUPS).toHaveLength(10);
  });
  test('No retired items in active navigation', () => {
    const active = getActiveCapabilities();
    active.forEach(item => {
      expect(item.status).not.toBe('RETIRED');
    });
  });
  test('Every active capability has a non-empty route', () => {
    getActiveCapabilities().forEach(item => {
      expect(item.route).toBeTruthy();
      expect(item.route.startsWith('/command-center')).toBe(true);
    });
  });
  test('No duplicate routes', () => {
    const routes = getActiveCapabilities().map(a => a.route);
    expect(new Set(routes).size).toBe(routes.length);
  });
});
