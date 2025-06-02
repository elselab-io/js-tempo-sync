# tempo-sync

[![npm version](https://badge.fury.io/js/tempo-sync.svg)](https://badge.fury.io/js/tempo-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](./test/)

tempo-sync is a lightweight (3KB) JavaScript library that automatically updates all relative time elements on your page ("2 hours ago", "just now", etc.) using a single, intelligent shared timer.

## ✨ Key Features

- **🎯 One Timer for Everything** - Instead of each timestamp creating its own timer, all elements share one smart timer
- **🧠 Smart Update Intervals** - Updates "seconds ago" every second, "minutes ago" every minute, "hours ago" every hour, etc.
- **🪶 Zero Dependencies** - Pure vanilla JS using native browser APIs
- **🔧 Framework Agnostic** - Works with any HTML, React, Vue, Angular, etc.
- **🧹 Auto-cleanup** - Automatically stops tracking removed elements
- **⚡ Performance Optimized** - Minimal CPU/battery usage

## 🚀 Quick Start

### Installation

```bash
npm install tempo-sync
```

Or use via CDN:

```html
<script src="https://unpkg.com/tempo-sync@latest/dist/tempo-sync.min.js"></script>
```

### Basic Usage

```html
<!-- Add data-tempo attribute to any element -->
<span data-tempo="2024-01-15T10:30:00Z">2 hours ago</span>
<div data-tempo="2024-01-15T08:00:00Z">4 hours ago</div>
<time data-tempo="2024-01-14T12:00:00Z">Yesterday</time>

<script>
// Initialize once
tempoSync.observe();
</script>
```

That's it! All timestamps will now update automatically at intelligent intervals.

## 📖 API Reference

### `tempoSync.observe()`
Starts observing elements with `data-tempo` attributes and begins automatic updates.

```javascript
tempoSync.observe();
```

### `tempoSync.disconnect()`
Stops observing and cleans up all timers and observers.

```javascript
tempoSync.disconnect();
```

### `tempoSync.addElement(element)`
Manually add an element to be tracked (usually not needed as observe() handles this automatically).

```javascript
const element = document.querySelector('[data-tempo]');
tempoSync.addElement(element);
```

### `tempoSync.removeElement(element)`
Manually remove an element from tracking.

```javascript
tempoSync.removeElement(element);
```

## 🎨 Examples

### Social Media Feed

```html
<div class="post">
  <h3>John shared a photo</h3>
  <span data-tempo="2024-01-15T14:30:00Z">2 hours ago</span>
</div>

<div class="comment">
  <p>Great photo!</p>
  <small data-tempo="2024-01-15T15:45:00Z">45 minutes ago</small>
</div>
```

### Dashboard with Live Updates

```html
<div class="metrics">
  <div class="metric">
    <span>Last backup:</span>
    <span data-tempo="2024-01-15T12:00:00Z">4 hours ago</span>
  </div>
  <div class="metric">
    <span>Server restart:</span>
    <span data-tempo="2024-01-15T06:30:00Z">10 hours ago</span>
  </div>
</div>
```

### React Integration

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize tempo-sync when component mounts
    tempoSync.observe();
    
    // Cleanup when component unmounts
    return () => tempoSync.disconnect();
  }, []);

  return (
    <div>
      <span data-tempo={new Date(Date.now() - 300000).toISOString()}>
        5 minutes ago
      </span>
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <span :data-tempo="timestamp">{{ relativeTime }}</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      relativeTime: '10 minutes ago'
    };
  },
  mounted() {
    tempoSync.observe();
  },
  beforeUnmount() {
    tempoSync.disconnect();
  }
};
</script>
```

## ⚡ Performance Benefits

### The Problem
Most relative time libraries create multiple timers (one per element) that update inefficiently:

```javascript
// ❌ Traditional approach - wasteful
setInterval(() => updateElement1(), 1000); // Updates "3 days ago" every second
setInterval(() => updateElement2(), 1000); // Updates "1 year ago" every second
setInterval(() => updateElement3(), 1000); // Updates "just now" every second
```

### The Solution
tempo-sync uses one intelligent timer that knows when each element actually needs updating:

```javascript
// ✅ tempo-sync approach - efficient
// "just now" updates every second
// "5 minutes ago" updates every minute
// "3 hours ago" updates every hour
// "2 days ago" updates daily
```

### Benchmark Results

| Elements | Traditional | tempo-sync | CPU Savings |
|----------|-------------|------------|-------------|
| 10       | 10 timers   | 1 timer    | 90%         |
| 100      | 100 timers  | 1 timer    | 99%         |
| 1000     | 1000 timers | 1 timer    | 99.9%       |

## 🕐 Time Formats

tempo-sync automatically formats time differences into human-readable strings:

| Time Difference | Output | Update Frequency |
|----------------|--------|------------------|
| < 1 minute | "just now" | Every second |
| 1-59 minutes | "X minutes ago" | Every minute |
| 1-23 hours | "X hours ago" | Every hour |
| 1-6 days | "X days ago" | Every day |
| 1-4 weeks | "X weeks ago" | Every day |
| 1-11 months | "X months ago" | Every day |
| 1+ years | "X years ago" | Every day |

### Future Times
tempo-sync also supports future timestamps:

- "in 5 minutes"
- "in 2 hours"
- "in 3 days"

## 🔧 Advanced Usage

### Manual Control

```javascript
// Start/stop as needed
tempoSync.observe();

// Later...
tempoSync.disconnect();

// Restart
tempoSync.observe();
```

### Dynamic Content

tempo-sync automatically detects new elements added to the DOM:

```javascript
// This will be automatically tracked
const newElement = document.createElement('span');
newElement.setAttribute('data-tempo', new Date().toISOString());
newElement.textContent = 'just now';
document.body.appendChild(newElement);
```

### Custom Timestamps

```javascript
// Any valid ISO 8601 timestamp works
const timestamps = [
  '2024-01-15T10:30:00Z',           // UTC
  '2024-01-15T10:30:00-05:00',      // With timezone
  '2024-01-15T10:30:00.123Z',       // With milliseconds
  new Date().toISOString()           // Current time
];
```

## 🌐 Browser Support

- Chrome 51+
- Firefox 55+
- Safari 10+
- Edge 79+
- IE 11+ (with polyfills)

## 📦 Module Systems

tempo-sync supports all module systems:

### ES Modules
```javascript
import tempoSync from 'tempo-sync';
```

### CommonJS
```javascript
const tempoSync = require('tempo-sync');
```

### AMD
```javascript
define(['tempo-sync'], function(tempoSync) {
  // Use tempoSync
});
```

### Global
```html
<script src="tempo-sync.min.js"></script>
<script>
  // tempoSync is available globally
  tempoSync.observe();
</script>
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Or with Jest:

```bash
npm run test:jest
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📊 Bundle Size

- **Minified**: 3KB
- **Gzipped**: ~1.2KB
- **Zero dependencies**

---

<div align="center">
  <a href="https://elselab.io">
    <img src="https://elselab.io/wp-content/uploads/2024/04/Elselab-Logo.png" alt="Else Lab" width="200">
  </a>
  
  **Made with ❤️ by [Else Lab](https://github.com/elselab-io)**
  
  [Website](https://elselab.io) • [GitHub](https://github.com/elselab-io) • [Contact](mailto:contact@elselab.io)
</div>
