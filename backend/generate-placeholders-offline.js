// backend/generate-placeholders-offline.js
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple SVG placeholder generator
function createPlaceholderSVG(text, color = '#3498db') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${color}"/>
    <text x="200" y="150" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" alignment-baseline="middle">${text}</text>
</svg>`;
}

// Product images to generate
const images = [
    { name: 'iphone13.svg', text: 'iPhone 13', color: '#3498db' },
    { name: 'samsung-s22.svg', text: 'Samsung S22', color: '#2ecc71' },
    { name: 'pixel7.svg', text: 'Pixel 7', color: '#e74c3c' },
    { name: 'macbook-pro.svg', text: 'MacBook Pro', color: '#95a5a6' },
    { name: 'dell-xps.svg', text: 'Dell XPS', color: '#34495e' },
    { name: 'thinkpad.svg', text: 'ThinkPad', color: '#e74c3c' },
    { name: 'ipad-pro.svg', text: 'iPad Pro', color: '#3498db' },
    { name: 'galaxy-tab.svg', text: 'Galaxy Tab', color: '#2ecc71' },
    { name: 'sony-a7.svg', text: 'Sony A7', color: '#f39c12' },
    { name: 'canon-r6.svg', text: 'Canon R6', color: '#e74c3c' },
    { name: 'airpods-pro.svg', text: 'AirPods Pro', color: '#95a5a6' },
    { name: 'sony-xm5.svg', text: 'Sony XM5', color: '#34495e' },
    { name: 'bose-qc45.svg', text: 'Bose QC45', color: '#95a5a6' },
    { name: 'ps5.svg', text: 'PS5', color: '#3498db' },
    { name: 'xbox-series-x.svg', text: 'Xbox', color: '#27ae60' },
    { name: 'switch-oled.svg', text: 'Switch', color: '#e74c3c' },
    { name: 'apple-watch-ultra.svg', text: 'Apple Watch', color: '#f39c12' },
    { name: 'galaxy-watch.svg', text: 'Galaxy Watch', color: '#34495e' },
    { name: 'caldigit-dock.svg', text: 'CalDigit', color: '#95a5a6' },
    { name: 'logitech-mx.svg', text: 'Logitech', color: '#2c3e50' },
    { name: 'no-image.svg', text: 'No Image', color: '#bdc3c7' }
];

console.log('📸 Generating placeholder images (offline)...\n');

// Generate all images
images.forEach(img => {
    const svgContent = createPlaceholderSVG(img.text, img.color);
    const filePath = path.join(uploadsDir, img.name);
    
    fs.writeFileSync(filePath, svgContent);
    console.log(`  ✅ Created: ${img.name}`);
});

// Also create a no-image placeholder for the frontend
const frontendAssets = path.join(__dirname, '..', 'frontend', 'assets', 'images');
if (!fs.existsSync(frontendAssets)) {
    fs.mkdirSync(frontendAssets, { recursive: true });
}

// Create no-image for frontend
const noImageSvg = createPlaceholderSVG('No Image', '#bdc3c7');
fs.writeFileSync(path.join(frontendAssets, 'no-image.svg'), noImageSvg);
console.log('\n  ✅ Created no-image.svg in frontend assets');

console.log('\n✨ Placeholder images generated successfully!');
console.log('📝 Note: Update image extensions in seed-data.js from .jpg to .svg');

// Also update the seed-data.js image references
console.log('\n🔧 Updating seed data to use SVG images...');

const seedDataPath = path.join(__dirname, 'seed-data.js');
if (fs.existsSync(seedDataPath)) {
    let seedContent = fs.readFileSync(seedDataPath, 'utf8');
    seedContent = seedContent.replace(/\.jpg/g, '.svg');
    seedContent = seedContent.replace(/no-image\.png/g, 'no-image.svg');
    fs.writeFileSync(seedDataPath, seedContent);
    console.log('  ✅ Updated seed-data.js to use SVG images');
}

// Also update frontend references
const frontendFiles = [
    path.join(__dirname, '..', 'frontend', 'index.html'),
    path.join(__dirname, '..', 'frontend', 'products.html'),
    path.join(__dirname, '..', 'frontend', 'product-detail.html'),
    path.join(__dirname, '..', 'frontend', 'my-products.html')
];

frontendFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/no-image\.png/g, 'no-image.svg');
        fs.writeFileSync(file, content);
        console.log(`  ✅ Updated ${path.basename(file)}`);
    }
});

console.log('\n🎉 All done! Your app now uses offline SVG placeholders.');