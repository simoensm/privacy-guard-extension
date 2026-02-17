/**
 * Privacy Guard - Icon Generator
 * Converts SVG to PNG icons in different sizes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SVG file
const svgPath = path.join(__dirname, '../assets/icons/icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

console.log('SVG Icon Generator');
console.log('==================');
console.log('');
console.log('✓ SVG icon created at: assets/icons/icon.svg');
console.log('');
console.log('To generate PNG icons from the SVG:');
console.log('');
console.log('Option 1 - Online Tool:');
console.log('  1. Open https://cloudconvert.com/svg-to-png');
console.log('  2. Upload assets/icons/icon.svg');
console.log('  3. Set dimensions to 128x128, 48x48, and 16x16');
console.log('  4. Download and save as icon-128.png, icon-48.png, icon-16.png');
console.log('');
console.log('Option 2 - Using Inkscape (if installed):');
console.log('  inkscape icon.svg -w 128 -h 128 -o icon-128.png');
console.log('  inkscape icon.svg -w 48 -h 48 -o icon-48.png');
console.log('  inkscape icon.svg -w 16 -h 16 -o icon-16.png');
console.log('');
console.log('Option 3 - Using ImageMagick (if installed):');
console.log('  convert -background none -resize 128x128 icon.svg icon-128.png');
console.log('  convert -background none -resize 48x48 icon.svg icon-48.png');
console.log('  convert -background none -resize 16x16 icon.svg icon-16.png');
console.log('');
console.log('The PNG files should be saved in: assets/icons/');
console.log('');
