import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  formatDate,
  formatRelativeTime,
  formatConfidence,
} from '../src/index';

describe('Formatting Utilities', () => {
  describe('formatFileSize', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(2097152)).toBe('2 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDate', () => {
    it('should format a date correctly', () => {
      const date = new Date('2024-02-22');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/February/);
      expect(formatted).toMatch(/22/);
    });

    it('should use the specified locale', () => {
      const date = new Date('2024-02-22');
      const formatted = formatDate(date, 'es-ES');
      expect(formatted).toMatch(/2024/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format time as "just now" for recent dates', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should format minutes correctly', () => {
      const date = new Date(Date.now() - 60 * 1000);
      expect(formatRelativeTime(date)).toBe('1 minute ago');

      const date5Min = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(date5Min)).toBe('5 minutes ago');
    });

    it('should format hours correctly', () => {
      const date = new Date(Date.now() - 3600 * 1000);
      expect(formatRelativeTime(date)).toBe('1 hour ago');

      const date5Hours = new Date(Date.now() - 5 * 3600 * 1000);
      expect(formatRelativeTime(date5Hours)).toBe('5 hours ago');
    });

    it('should format days correctly', () => {
      const date = new Date(Date.now() - 86400 * 1000);
      expect(formatRelativeTime(date)).toBe('1 day ago');

      const date5Days = new Date(Date.now() - 5 * 86400 * 1000);
      expect(formatRelativeTime(date5Days)).toBe('5 days ago');
    });
  });

  describe('formatConfidence', () => {
    it('should format confidence to percentage', () => {
      expect(formatConfidence(0.95)).toBe('95%');
      expect(formatConfidence(0.5)).toBe('50%');
      expect(formatConfidence(0.1)).toBe('10%');
      expect(formatConfidence(1.0)).toBe('100%');
      expect(formatConfidence(0.0)).toBe('0%');
    });

    it('should round correctly', () => {
      expect(formatConfidence(0.945)).toBe('95%');
      expect(formatConfidence(0.944)).toBe('94%');
    });
  });
});
