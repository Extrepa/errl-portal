import { cleanupSvgAttribute } from './cleanupSvgAttribute';

// Unit tests for cleanupSvgAttribute
// These tests are kept for reference. To run them, set up a test runner like Vitest or Jest.

// Type definitions for test functions (to satisfy TypeScript)
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void): void;
declare function expect<T>(actual: T): {
  toBe(expected: T): void;
};

// Note: These will only work if a test framework is configured
// For now, they're type-checked but not executable without a test runner
describe('cleanupSvgAttribute', () => {
  it('add space around a single number', () => {
    const cleaned = cleanupSvgAttribute('1');
    expect(cleaned).toBe(' 1 ');
  });
  it('replace multiple spaces with a single one', () => {
    const cleaned = cleanupSvgAttribute('     1    ');
    expect(cleaned).toBe(' 1 ');
  });
  it('replace commas with spaces or commas and multiple spaces with a single space', () => {
    const cleaned = cleanupSvgAttribute('1,2 , 4');
    expect(cleaned).toBe(' 1 2 4 ');
  });
});
