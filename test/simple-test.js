/**
 * Simple test runner for tempo-sync library (no dependencies)
 */

// Mock DOM environment for Node.js testing
global.window = {
  MutationObserver: class MockMutationObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
  }
};

// Also add MutationObserver to global scope
global.MutationObserver = global.window.MutationObserver;

global.document = {
  body: {},
  querySelectorAll: () => [],
  contains: () => true
};

global.Node = {
  ELEMENT_NODE: 1
};

// Import the library
const tempoSync = require('../src/tempo-sync.js');

// Test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
  }
}

// Test suite
const tests = [
  {
    name: 'Library loads without errors',
    test: () => {
      assert(typeof tempoSync === 'object', 'tempoSync should be an object');
      assert(typeof tempoSync.observe === 'function', 'observe should be a function');
      assert(typeof tempoSync.disconnect === 'function', 'disconnect should be a function');
      return true;
    }
  },
  
  {
    name: 'Formats "just now" correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(30000); // 30 seconds
      assertEqual(result, 'just now', 'Should format 30 seconds as "just now"');
      return true;
    }
  },
  
  {
    name: 'Formats minutes correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(2 * 60 * 1000); // 2 minutes
      assertEqual(result, '2 minutes ago', 'Should format 2 minutes correctly');
      return true;
    }
  },
  
  {
    name: 'Formats single minute correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(1 * 60 * 1000); // 1 minute
      assertEqual(result, '1 minute ago', 'Should format 1 minute correctly');
      return true;
    }
  },
  
  {
    name: 'Formats hours correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(3 * 60 * 60 * 1000); // 3 hours
      assertEqual(result, '3 hours ago', 'Should format 3 hours correctly');
      return true;
    }
  },
  
  {
    name: 'Formats single hour correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(1 * 60 * 60 * 1000); // 1 hour
      assertEqual(result, '1 hour ago', 'Should format 1 hour correctly');
      return true;
    }
  },
  
  {
    name: 'Formats days correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(5 * 24 * 60 * 60 * 1000); // 5 days
      assertEqual(result, '5 days ago', 'Should format 5 days correctly');
      return true;
    }
  },
  
  {
    name: 'Formats weeks correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks
      assertEqual(result, '2 weeks ago', 'Should format 2 weeks correctly');
      return true;
    }
  },
  
  {
    name: 'Formats months correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(3 * 30 * 24 * 60 * 60 * 1000); // 3 months
      assertEqual(result, '3 months ago', 'Should format 3 months correctly');
      return true;
    }
  },
  
  {
    name: 'Formats years correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(2 * 365 * 24 * 60 * 60 * 1000); // 2 years
      assertEqual(result, '2 years ago', 'Should format 2 years correctly');
      return true;
    }
  },
  
  {
    name: 'Formats future times correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(-2 * 60 * 1000); // 2 minutes in future
      assertEqual(result, 'in 2 minutes', 'Should format future times correctly');
      return true;
    }
  },
  
  {
    name: 'Formats future single units correctly',
    test: () => {
      const result = tempoSync.formatRelativeTime(-1 * 60 * 60 * 1000); // 1 hour in future
      assertEqual(result, 'in 1 hour', 'Should format future single units correctly');
      return true;
    }
  },
  
  {
    name: 'Initialize and disconnect without errors',
    test: () => {
      tempoSync.observe();
      assert(tempoSync.isObserving === true, 'Should be observing after observe()');
      
      tempoSync.disconnect();
      assert(tempoSync.isObserving === false, 'Should not be observing after disconnect()');
      return true;
    }
  },
  
  {
    name: 'Add and remove elements',
    test: () => {
      const mockElement = {
        dataset: { tempo: '2022-01-01T00:00:00Z' },
        textContent: ''
      };
      
      const initialSize = tempoSync.elements.size;
      tempoSync.addElement(mockElement);
      assert(tempoSync.elements.size === initialSize + 1, 'Should add element');
      
      tempoSync.removeElement(mockElement);
      assert(tempoSync.elements.size === initialSize, 'Should remove element');
      return true;
    }
  },
  
  {
    name: 'Ignore invalid timestamps',
    test: () => {
      const mockElement = {
        dataset: { tempo: 'invalid-date' },
        textContent: ''
      };
      
      const initialSize = tempoSync.elements.size;
      tempoSync.addElement(mockElement);
      assert(tempoSync.elements.size === initialSize, 'Should ignore invalid timestamps');
      return true;
    }
  },
  
  {
    name: 'Handle elements without data-tempo',
    test: () => {
      const mockElement = {
        dataset: {},
        textContent: ''
      };
      
      const initialSize = tempoSync.elements.size;
      tempoSync.addElement(mockElement);
      assert(tempoSync.elements.size === initialSize, 'Should ignore elements without data-tempo');
      return true;
    }
  },
  
  {
    name: 'Calculate update intervals correctly',
    test: () => {
      // Test default interval when no elements
      tempoSync.elements.clear();
      const defaultInterval = tempoSync.getNextUpdateInterval();
      assertEqual(defaultInterval, 60000, 'Should return 1 minute default interval');
      
      // Test with recent element (should return 1 second)
      const now = Date.now();
      const recentElement = {
        element: { dataset: { tempo: new Date(now - 30000).toISOString() } },
        timestamp: now - 30000
      };
      tempoSync.elements.add(recentElement);
      
      const recentInterval = tempoSync.getNextUpdateInterval();
      assertEqual(recentInterval, 1000, 'Should return 1 second for recent timestamps');
      
      tempoSync.elements.clear();
      return true;
    }
  }
];

// Run tests
console.log('🧪 Running tempo-sync tests...\n');

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  try {
    test.test();
    console.log(`✅ ${index + 1}. ${test.name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${index + 1}. ${test.name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Test Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${tests.length}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n💥 Some tests failed!');
  process.exit(1);
}
