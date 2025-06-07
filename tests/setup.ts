/**
 * Jest Test Setup
 * Global test configuration and shared setup logic
 */

import { mock, afterEach, afterAll } from 'bun:test';

// Mock Embedded Bridge for testing (replaces WebSocket)
(global as any).SecureEmbeddedBridge = mock(() => ({
  initialize: mock(),
  sendMessage: mock(),
  disconnect: mock(),
  isActive: () => true,
  getSessionId: () => 'test_session_123',
}));

// Mock Figma API for plugin tests
(global as any).figma = {
  // Core API mocks
  currentPage: {
    children: [],
    selection: [],
  },
  root: {
    children: [],
  },
  
  // Plugin API mocks
  ui: {
    postMessage: mock(),
    onmessage: null,
    resize: mock(),
    close: mock(),
  },
  
  // Plugin lifecycle
  closePlugin: mock(),
  
  // Utilities
  notify: mock(),
  showUI: mock(),
};

// Mock environment variables for embedded bridge testing
process.env.NODE_ENV = 'test';
// No PORT needed - using secure embedded bridge architecture

// Suppress console logs during tests unless explicitly needed
const originalConsole = console;
(global as any).console = {
  ...originalConsole,
  log: mock(),
  info: mock(),
  warn: mock(),
  error: mock(),
};

// Reset mocks after each test
afterEach(() => {
  // Note: Bun doesn't have clearAllMocks, so we'll handle this per test
});

// Clean up after all tests
afterAll(() => {
  // Note: Bun doesn't have restoreAllMocks, so we'll handle cleanup manually
});

export {}; 