/**
 * Color Contrast Tests — OPEN-003 Remediation
 * TVN-EMG-RC-20260811-M1-003
 * 
 * Verifies no text-gray-500 or text-gray-600 classes remain in source files
 * that would fail WCAG AA contrast on dark backgrounds.
 */

import * as fs from 'fs';
import * as path from 'path';

function getSourceFiles(dir: string, ext: string[] = ['.tsx', '.ts']): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      results.push(...getSourceFiles(fullPath, ext));
    } else if (ext.some(e => entry.name.endsWith(e))) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Color Contrast — WCAG AA Compliance', () => {
  const srcDir = path.resolve(__dirname, '../../src');
  const sourceFiles = getSourceFiles(srcDir);

  test('No text-gray-500 class usage (fails 4.5:1 on dark bg)', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('text-gray-500')) {
        violations.push(file.replace(srcDir, 'src'));
      }
    }
    expect(violations).toEqual([]);
  });

  test('No text-gray-600 class usage (fails 3:1 on dark bg)', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('text-gray-600')) {
        violations.push(file.replace(srcDir, 'src'));
      }
    }
    expect(violations).toEqual([]);
  });

  test('Minimum contrast colors used: text-gray-400 or lighter on dark backgrounds', () => {
    const failingGrays = ['text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900'];
    
    const violations: { file: string; match: string }[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const gray of failingGrays) {
        if (content.includes(gray)) {
          violations.push({ file: file.replace(srcDir, 'src'), match: gray });
        }
      }
    }
    expect(violations).toEqual([]);
  });

  test('Contrast ratio verification: gray-400 on #12121a exceeds 4.5:1', () => {
    function luminance(r: number, g: number, b: number): number {
      const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
      const l1 = luminance(...fg);
      const l2 = luminance(...bg);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const gray400: [number, number, number] = [0x9c, 0xa3, 0xaf];
    const tavenDark800: [number, number, number] = [0x12, 0x12, 0x1a];

    const ratio = contrastRatio(gray400, tavenDark800);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
