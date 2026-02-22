import { describe, it, expect } from 'vitest';
import type { PhotoIdentification, BoundingBox } from '@photoidentifier/types';
import {
  calculateAspectRatio,
  isLandscape,
  isPortrait,
  getDominantIdentification,
  boundingBoxesOverlap,
  calculateIoU,
} from '../src/index';

describe('Photo Utilities', () => {
  describe('calculateAspectRatio', () => {
    it('should calculate aspect ratio correctly', () => {
      expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(1.78, 2);
      expect(calculateAspectRatio(1080, 1920)).toBeCloseTo(0.56, 2);
      expect(calculateAspectRatio(1000, 1000)).toBe(1);
    });
  });

  describe('isLandscape', () => {
    it('should identify landscape images', () => {
      expect(isLandscape(1920, 1080)).toBe(true);
      expect(isLandscape(1280, 720)).toBe(true);
      expect(isLandscape(1001, 1000)).toBe(true);
    });

    it('should return false for non-landscape images', () => {
      expect(isLandscape(1080, 1920)).toBe(false);
      expect(isLandscape(720, 1280)).toBe(false);
      expect(isLandscape(1000, 1000)).toBe(false);
    });
  });

  describe('isPortrait', () => {
    it('should identify portrait images', () => {
      expect(isPortrait(1080, 1920)).toBe(true);
      expect(isPortrait(720, 1280)).toBe(true);
      expect(isPortrait(1000, 1001)).toBe(true);
    });

    it('should return false for non-portrait images', () => {
      expect(isPortrait(1920, 1080)).toBe(false);
      expect(isPortrait(1280, 720)).toBe(false);
      expect(isPortrait(1000, 1000)).toBe(false);
    });
  });

  describe('getDominantIdentification', () => {
    it('should return the identification with highest confidence', () => {
      const identifications: PhotoIdentification[] = [
        { id: '1', label: 'cat', confidence: 0.9 },
        { id: '2', label: 'dog', confidence: 0.7 },
        { id: '3', label: 'bird', confidence: 0.95 },
      ];
      const dominant = getDominantIdentification(identifications);
      expect(dominant?.label).toBe('bird');
      expect(dominant?.confidence).toBe(0.95);
    });

    it('should return null for empty array', () => {
      expect(getDominantIdentification([])).toBeNull();
    });

    it('should handle single identification', () => {
      const identifications: PhotoIdentification[] = [
        { id: '1', label: 'cat', confidence: 0.9 },
      ];
      const dominant = getDominantIdentification(identifications);
      expect(dominant?.label).toBe('cat');
    });
  });

  describe('boundingBoxesOverlap', () => {
    const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };

    it('should detect overlapping boxes', () => {
      const box2: BoundingBox = { x: 50, y: 50, width: 100, height: 100 };
      expect(boundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should detect non-overlapping boxes', () => {
      const box2: BoundingBox = { x: 200, y: 200, width: 100, height: 100 };
      expect(boundingBoxesOverlap(box1, box2)).toBe(false);
    });

    it('should handle adjacent boxes (edge touching)', () => {
      const box2: BoundingBox = { x: 100, y: 0, width: 100, height: 100 };
      expect(boundingBoxesOverlap(box1, box2)).toBe(false);
    });
  });

  describe('calculateIoU', () => {
    it('should calculate IoU for overlapping boxes', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 50, y: 50, width: 100, height: 100 };
      const iou = calculateIoU(box1, box2);
      expect(iou).toBeGreaterThan(0);
      expect(iou).toBeLessThan(1);
    });

    it('should return 0 for non-overlapping boxes', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 200, y: 200, width: 100, height: 100 };
      const iou = calculateIoU(box1, box2);
      expect(iou).toBe(0);
    });

    it('should return 1 for identical boxes', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const iou = calculateIoU(box1, box2);
      expect(iou).toBe(1);
    });
  });
});
