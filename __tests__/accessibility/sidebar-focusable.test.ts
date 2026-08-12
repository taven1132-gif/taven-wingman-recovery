/**
 * Sidebar Focusable Tests — OPEN-002 Remediation
 * TVN-EMG-RC-20260811-M1-003
 * 
 * Verifies the scrollable sidebar is keyboard-focusable with proper ARIA.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Sidebar Keyboard Focusability — scrollable-region-focusable', () => {
  const sidebarPath = path.resolve(__dirname, '../../src/components/navigation/Sidebar.tsx');
  const sidebarSource = fs.readFileSync(sidebarPath, 'utf-8');

  test('Sidebar component exists', () => {
    expect(fs.existsSync(sidebarPath)).toBe(true);
  });

  test('Desktop sidebar aside element has tabIndex={0}', () => {
    expect(sidebarSource).toContain('tabIndex={0}');
  });

  test('Sidebar has aria-label for accessibility', () => {
    expect(sidebarSource).toContain('aria-label="Navigation sidebar"');
  });

  test('Sidebar has role="navigation" for desktop', () => {
    expect(sidebarSource).toContain('role="navigation"');
  });

  test('Mobile drawer has role="dialog" and aria-modal', () => {
    expect(sidebarSource).toContain('role="dialog"');
    expect(sidebarSource).toContain('aria-modal="true"');
  });

  test('Sidebar has overflow-y-auto for scrollability', () => {
    expect(sidebarSource).toContain('overflow-y-auto');
  });

  test('Close button has aria-label', () => {
    expect(sidebarSource).toContain('aria-label="Close navigation drawer"');
  });

  test('Mobile drawer has keyboard escape handler', () => {
    expect(sidebarSource).toContain("e.key === 'Escape'");
  });

  test('Both desktop and mobile aside elements have tabIndex', () => {
    const matches = sidebarSource.match(/tabIndex=\{0\}/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
});
