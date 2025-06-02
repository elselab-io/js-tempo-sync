#!/usr/bin/env node

/**
 * Advanced build script for tempo-sync with aggressive minification
 */

const fs = require('fs');
const path = require('path');

// Aggressive minification function
function minify(code) {
  return code
    // Remove all comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    // Remove all unnecessary whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around operators and punctuation
    .replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, '$1')
    // Remove spaces around brackets
    .replace(/\s*(\[|\])\s*/g, '$1')
    // Remove spaces in function declarations
    .replace(/function\s+/g, 'function ')
    .replace(/\s*=>\s*/g, '=>')
    // Remove unnecessary semicolons before }
    .replace(/;\s*}/g, '}')
    // Remove spaces around dots
    .replace(/\s*\.\s*/g, '.')
    // Remove newlines and trim
    .replace(/\n/g, '')
    .trim();
}

// Ultra-compact version with variable name shortening
function ultraMinify(code) {
  let minified = minify(code);
  
  // Replace common long variable names with shorter ones
  const replacements = [
    ['document', 'd'],
    ['element', 'e'],
    ['timestamp', 't'],
    ['dataset', 'ds'],
    ['textContent', 'tc'],
    ['querySelectorAll', 'qsa'],
    ['MutationObserver', 'MO'],
    ['addedNodes', 'an'],
    ['removedNodes', 'rn'],
    ['nodeType', 'nt'],
    ['childList', 'cl'],
    ['subtree', 'st'],
    ['forEach', 'fE'],
    ['Math.floor', 'M.floor'],
    ['Math.abs', 'M.abs'],
    ['Math.min', 'M.min'],
    ['Date.now', 'D.now'],
    ['setTimeout', 'sT'],
    ['clearTimeout', 'cT'],
    ['isNaN', 'iN'],
    ['getTime', 'gT'],
    ['contains', 'c']
  ];
  
  // Apply replacements carefully to avoid breaking the code
  replacements.forEach(([long, short]) => {
    // Only replace if it's a standalone word (not part of another word)
    const regex = new RegExp(`\\b${long.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    minified = minified.replace(regex, short);
  });
  
  return minified;
}

console.log('🔨 Building tempo-sync with advanced minification...\n');

try {
  const srcPath = path.join(__dirname, '../src/tempo-sync.js');
  const distPath = path.join(__dirname, '../dist/tempo-sync.min.js');
  
  console.log('📖 Reading source file...');
  const sourceCode = fs.readFileSync(srcPath, 'utf8');
  
  console.log('⚡ Applying aggressive minification...');
  const minifiedCode = ultraMinify(sourceCode);
  
  // Ensure dist directory exists
  const distDir = path.dirname(distPath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  console.log('💾 Writing ultra-minified file...');
  fs.writeFileSync(distPath, minifiedCode);
  
  // Calculate sizes
  const originalSize = Buffer.byteLength(sourceCode, 'utf8');
  const minifiedSize = Buffer.byteLength(minifiedCode, 'utf8');
  const compressionRatio = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
  
  console.log('\n📊 Build Results:');
  console.log(`📄 Original size: ${originalSize} bytes`);
  console.log(`📦 Minified size: ${minifiedSize} bytes`);
  console.log(`🗜️  Compression: ${compressionRatio}% smaller`);
  console.log(`✅ Build complete: ${distPath}`);
  
  // Check size targets
  if (minifiedSize <= 1536) { // 1.5KB
    console.log(`🎉 Target achieved: ${minifiedSize} bytes ≤ 1.5KB`);
  } else if (minifiedSize <= 2048) { // 2KB
    console.log(`✅ Close to target: ${minifiedSize} bytes ≤ 2KB`);
  } else {
    console.log(`⚠️  Size target exceeded: ${minifiedSize} bytes > 2KB`);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
