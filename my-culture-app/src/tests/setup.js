import { expect, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia for components that use responsive design
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock window.location
  delete window.location;
  window.location = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    toString: vi.fn(() => 'http://localhost:3000'),
  };

  // Mock navigator
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve('')),
    },
    writable: true,
  });

  // Mock window.open
  global.open = vi.fn();

  // Mock document.createElement for iframe and other elements
  const originalCreateElement = document.createElement;
  document.createElement = vi.fn((tagName) => {
    if (tagName === 'iframe') {
      const iframe = originalCreateElement.call(document, 'iframe');
      // Mock iframe properties
      Object.defineProperty(iframe, 'contentWindow', {
        value: {
          postMessage: vi.fn(),
        },
        writable: true,
      });
      return iframe;
    }
    return originalCreateElement.call(document, tagName);
  });

  // Mock FileReader for file upload tests
  global.FileReader = vi.fn().mockImplementation(() => ({
    readAsDataURL: vi.fn(),
    readAsText: vi.fn(),
    onload: null,
    onerror: null,
    result: null,
  }));

  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Suppress console errors during tests unless we're specifically testing error handling
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: React.createFactory() is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Mock CSS.supports for CSS feature detection
  global.CSS = {
    supports: vi.fn(() => false),
  };
});