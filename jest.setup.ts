import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

(globalThis as unknown as { jest: typeof jest }).jest = jest;

// Polyfill window.matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: unknown) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Polyfill scrollTo
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.scrollTo = jest.fn();
