import { describe, it, expect } from 'vitest';
import { chunk, uniqueBy, sortBy } from '../src/index';

describe('Array Utilities', () => {
  describe('chunk', () => {
    it('should chunk array into smaller arrays', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const chunks = chunk(array, 3);
      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });

    it('should handle chunk size larger than array', () => {
      const array = [1, 2, 3];
      const chunks = chunk(array, 10);
      expect(chunks).toEqual([[1, 2, 3]]);
    });

    it('should handle empty array', () => {
      const chunks = chunk([], 3);
      expect(chunks).toEqual([]);
    });
  });

  describe('uniqueBy', () => {
    it('should remove duplicates based on key function', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Charlie' },
        { id: 3, name: 'David' },
      ];
      const unique = uniqueBy(items, item => item.id);
      expect(unique).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'David' },
      ]);
    });

    it('should handle empty array', () => {
      expect(uniqueBy([], (item: any) => item.id)).toEqual([]);
    });
  });

  describe('sortBy', () => {
    it('should sort array ascending by key', () => {
      const items = [
        { id: 3, name: 'Charlie' },
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const sorted = sortBy(items, item => item.id, 'asc');
      expect(sorted).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]);
    });

    it('should sort array descending by key', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 3, name: 'Charlie' },
        { id: 2, name: 'Bob' },
      ];
      const sorted = sortBy(items, item => item.id, 'desc');
      expect(sorted).toEqual([
        { id: 3, name: 'Charlie' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice' },
      ]);
    });

    it('should not mutate original array', () => {
      const items = [
        { id: 3, name: 'Charlie' },
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const originalOrder = [...items];
      sortBy(items, item => item.id);
      expect(items).toEqual(originalOrder);
    });
  });
});
