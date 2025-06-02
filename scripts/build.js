#!/usr/bin/env node

/**
 * Build script for tempo-sync
 * Minifies the source code and updates file sizes
 */

const fs = require('fs');
const path = require('path');

// Simple minification function
function minify(code) {
  return code
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around operators and punctuation
    .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
    // Remove whitespace at start/end of lines
    .replace(/^\s+|\s+$/gm, '')
    // Remove empty lines
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

console.log('🔨 Building tempo-sync...\n');

try {
  // Read source file
  const srcPath = path.join(__dirname, '../src/tempo-sync.js');
  const distPath = path.join(__dirname, '../dist/tempo-sync.min.js');
  
  console.log('📖 Reading source file...');
  const sourceCode = fs.readFileSync(srcPath, 'utf8');
  
  console.log('⚡ Minifying code...');
  const minifiedCode = minify(sourceCode);
  
  // Ensure dist directory exists
  const distDir = path.dirname(distPath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  console.log('💾 Writing minified file...');
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
  
  // Verify the minified file is under 2KB
  if (minifiedSize <= 2048) {
    console.log(`🎉 Size target met: ${minifiedSize} bytes ≤ 2KB`);
  } else {
    console.log(`⚠️  Size target exceeded: ${minifiedSize} bytes > 2KB`);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
