/**
 * Test suite for tempo-sync library
 */

// Mock DOM environment for Node.js testing
if (typeof window === 'undefined') {
  global.window = {
    MutationObserver: class MockMutationObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      disconnect() {}
    }
  };
  
  global.document = {
    body: {},
    querySelectorAll: () => [],
    contains: () => true
  };
  
  global.Node = {
    ELEMENT_NODE: 1
  };
  
  global.setTimeout = setTimeout;
  global.clearTimeout = clearTimeout;
}

// Import the library
const tempoSync = require('../src/tempo-sync.js');

describe('TempoSync Library', () => {
  let mockElements = [];
  let originalQuerySelectorAll;
  let originalContains;

  beforeEach(() => {
    // Reset the library state
    tempoSync.disconnect();
    mockElements = [];
    
    // Mock DOM methods
    originalQuerySelectorAll = document.querySelectorAll;
    originalContains = document.contains;
    
    document.querySelectorAll = jest.fn(() => mockElements);
    document.contains = jest.fn(() => true);
    
    // Mock Date.now for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01 00:00:00 UTC
  });

  afterEach(() => {
    tempoSync.disconnect();
    document.querySelectorAll = originalQuerySelectorAll;
    document.contains = originalContains;
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize without errors', () => {
      expect(() => tempoSync.observe()).not.toThrow();
    });

    test('should not initialize twice', () => {
      tempoSync.observe();
      const spy = jest.spyOn(tempoSync, 'scanForElements');
      tempoSync.observe();
      expect(spy).not.toHaveBeenCalled();
    });

    test('should disconnect properly', () => {
      tempoSync.observe();
      expect(() => tempoSync.disconnect()).not.toThrow();
    });
  });

  describe('Element Management', () => {
    test('should add elements with valid timestamps', () => {
      const mockElement = {
        dataset: { tempo: '2022-01-01T00:00:00Z' },
        textContent: ''
      };
      
      tempoSync.addElement(mockElement);
      expect(tempoSync.elements.size).toBe(1);
    });

    test('should ignore elements with invalid timestamps', () => {
      const mockElement = {
        dataset: { tempo: 'invalid-date' },
        textContent: ''
      };
      
      tempoSync.addElement(mockElement);
      expect(tempoSync.elements.size).toBe(0);
    });

    test('should ignore elements without data-tempo attribute', () => {
      const mockElement = {
        dataset: {},
        textContent: ''
      };
      
      tempoSync.addElement(mockElement);
      expect(tempoSync.elements.size).toBe(0);
    });

    test('should remove elements', () => {
      const mockElement = {
        dataset: { tempo: '2022-01-01T00:00:00Z' },
        textContent: ''
      };
      
      tempoSync.addElement(mockElement);
      expect(tempoSync.elements.size).toBe(1);
      
      tempoSync.removeElement(mockElement);
      expect(tempoSync.elements.size).toBe(0);
    });
  });

  describe('Time Formatting', () => {
    test('should format "just now" for times under 1 minute', () => {
      const result = tempoSync.formatRelativeTime(30000); // 30 seconds
      expect(result).toBe('just now');
    });

    test('should format minutes correctly', () => {
      const result = tempoSync.formatRelativeTime(2 * 60 * 1000); // 2 minutes
      expect(result).toBe('2 minutes ago');
    });

    test('should format single minute correctly', () => {
      const result = tempoSync.formatRelativeTime(1 * 60 * 1000); // 1 minute
      expect(result).toBe('1 minute ago');
    });

    test('should format hours correctly', () => {
      const result = tempoSync.formatRelativeTime(3 * 60 * 60 * 1000); // 3 hours
      expect(result).toBe('3 hours ago');
    });

    test('should format single hour correctly', () => {
      const result = tempoSync.formatRelativeTime(1 * 60 * 60 * 1000); // 1 hour
      expect(result).toBe('1 hour ago');
    });

    test('should format days correctly', () => {
      const result = tempoSync.formatRelativeTime(5 * 24 * 60 * 60 * 1000); // 5 days
      expect(result).toBe('5 days ago');
    });

    test('should format single day correctly', () => {
      const result = tempoSync.formatRelativeTime(1 * 24 * 60 * 60 * 1000); // 1 day
      expect(result).toBe('1 day ago');
    });

    test('should format weeks correctly', () => {
      const result = tempoSync.formatRelativeTime(2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks
      expect(result).toBe('2 weeks ago');
    });

    test('should format months correctly', () => {
      const result = tempoSync.formatRelativeTime(3 * 30 * 24 * 60 * 60 * 1000); // 3 months
      expect(result).toBe('3 months ago');
    });

    test('should format years correctly', () => {
      const result = tempoSync.formatRelativeTime(2 * 365 * 24 * 60 * 60 * 1000); // 2 years
      expect(result).toBe('2 years ago');
    });

    test('should format future times correctly', () => {
      const result = tempoSync.formatRelativeTime(-2 * 60 * 1000); // 2 minutes in future
      expect(result).toBe('in 2 minutes');
    });

    test('should format future single units correctly', () => {
      const result = tempoSync.formatRelativeTime(-1 * 60 * 60 * 1000); // 1 hour in future
      expect(result).toBe('in 1 hour');
    });
  });

  describe('Update Intervals', () => {
    test('should return default interval when no elements', () => {
      const interval = tempoSync.getNextUpdateInterval();
      expect(interval).toBe(60000); // 1 minute
    });

    test('should return 1 second interval for recent timestamps', () => {
      const mockElement = {
        dataset: { tempo: new Date(Date.now() - 30000).toISOString() }, // 30 seconds ago
        textContent: ''
      };
      
      tempoSync.addElement(mockElement);
      const interval = tempoSync.getNextUpdateInterval();
      expect(interval).toBe(1000); // 1 second
    });

    test('should return 1 minute interval for minute-old timestamps', () => {
      const mockElement = {
        dataset: { tempo: new Date(Date.now() - 5 * 60 * 1000).toISOString() }, // 5 minutes ago
        textContent: ''
      };
      
      tempoSync.addElement(mockElement);
      const interval = tempoSync.getNextUpdateInterval();
      expect(interval).toBe(60000); // 1 minute
    });

    test('should return 1 hour interval for hour-old timestamps', () => {
      const mockElement = {
        dataset: { tempo: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }, // 2 hours ago
        textContent: ''
      };
      
      tempoSync.addElement(mockElement);
      const interval = tempoSync.getNextUpdateInterval();
      expect(interval).toBe(3600000); // 1 hour
    });

    test('should return minimum interval when multiple elements', () => {
      const recentElement = {
        dataset: { tempo: new Date(Date.now() - 30000).toISOString() }, // 30 seconds ago
        textContent: ''
      };
      
      const oldElement = {
        dataset: { tempo: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }, // 2 hours ago
        textContent: ''
      };
      
      tempoSync.addElement(recentElement);
      tempoSync.addElement(oldElement);
      
      const interval = tempoSync.getNextUpdateInterval();
      expect(interval).toBe(1000); // Should use the minimum (1 second)
    });
  });

  describe('Timer Management', () => {
    test('should start timer when observing', () => {
      const spy = jest.spyOn(global, 'setTimeout');
      tempoSync.observe();
      expect(spy).toHaveBeenCalled();
    });

    test('should stop timer when disconnecting', () => {
      const spy = jest.spyOn(global, 'clearTimeout');
      tempoSync.observe();
      tempoSync.disconnect();
      expect(spy).toHaveBeenCalled();
    });

    test('should not start multiple timers', () => {
      tempoSync.startTimer();
      const timerId1 = tempoSync.timerId;
      tempoSync.startTimer();
      const timerId2 = tempoSync.timerId;
      expect(timerId1).toBe(timerId2);
    });
  });

  describe('DOM Cleanup', () => {
    test('should remove elements not in DOM during update', () => {
      const mockElement = {
        dataset: { tempo: '2022-01-01T00:00:00Z' },
        textContent: ''
      };
      
      tempoSync.addElement(mockElement);
      expect(tempoSync.elements.size).toBe(1);
      
      // Mock element as not in DOM
      document.contains = jest.fn(() => false);
      
      tempoSync.updateAllElements();
      expect(tempoSync.elements.size).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle elements without dataset', () => {
      const mockElement = {
        textContent: ''
      };
      
      expect(() => tempoSync.addElement(mockElement)).not.toThrow();
      expect(tempoSync.elements.size).toBe(0);
    });

    test('should handle null/undefined elements', () => {
      expect(() => tempoSync.addElement(null)).not.toThrow();
      expect(() => tempoSync.addElement(undefined)).not.toThrow();
    });

    test('should handle removing non-existent elements', () => {
      const mockElement = {
        dataset: { tempo: '2022-01-01T00:00:00Z' },
        textContent: ''
      };
      
      expect(() => tempoSync.removeElement(mockElement)).not.toThrow();
    });
  });

  describe('Module Exports', () => {
    test('should export tempoSync object', () => {
      expect(tempoSync).toBeDefined();
      expect(typeof tempoSync.observe).toBe('function');
      expect(typeof tempoSync.disconnect).toBe('function');
    });
  });
});

// Test runner for Node.js environment
if (typeof module !== 'undefined' && require.main === module) {
  console.log('Running tempo-sync tests...');
  
  // Simple test runner
  const tests = [
    () => {
      console.log('✓ Library loads without errors');
      return true;
    },
    () => {
      const result = tempoSync.formatRelativeTime(30000);
      console.log('✓ Formats "just now" correctly:', result === 'just now');
      return result === 'just now';
    },
    () => {
      const result = tempoSync.formatRelativeTime(2 * 60 * 1000);
      console.log('✓ Formats minutes correctly:', result === '2 minutes ago');
      return result === '2 minutes ago';
    },
    () => {
      const result = tempoSync.formatRelativeTime(-1 * 60 * 1000);
      console.log('✓ Formats future times correctly:', result === 'in 1 minute');
      return result === 'in 1 minute';
    }
  ];
  
  let passed = 0;
  tests.forEach((test, index) => {
    try {
      if (test()) passed++;
    } catch (error) {
      console.log(`✗ Test ${index + 1} failed:`, error.message);
    }
  });
  
  console.log(`\nTests completed: ${passed}/${tests.length} passed`);
}
