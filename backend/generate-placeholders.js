// backend/generate-placeholders.js
const fs = require('fs');
const path = require('path');
const https = require('https');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Product images to generate (using placeholder service)
const images = [
    { name: 'iphone13.jpg', text: 'iPhone 13', color: '3498db' },
    { name: 'samsung-s22.jpg', text: 'Samsung S22', color: '2ecc71' },
    { name: 'pixel7.jpg', text: 'Pixel 7', color: 'e74c3c' },
    { name: 'macbook-pro.jpg', text: 'MacBook Pro', color: '95a5a6' },
    { name: 'dell-xps.jpg', text: 'Dell XPS', color: '34495e' },
    { name: 'thinkpad.jpg', text: 'ThinkPad', color: 'e74c3c' },
    { name: 'ipad-pro.jpg', text: 'iPad Pro', color: '3498db' },
    { name: 'galaxy-tab.jpg', text: 'Galaxy Tab', color: '2ecc71' },
    { name: 'sony-a7.jpg', text: 'Sony A7', color: 'f39c12' },
    { name: 'canon-r6.jpg', text: 'Canon R6', color: 'e74c3c' },
    { name: 'airpods-pro.jpg', text: 'AirPods Pro', color: 'ecf0f1' },
    { name: 'sony-xm5.jpg', text: 'Sony XM5', color: '34495e' },
    { name: 'bose-qc45.jpg', text: 'Bose QC45', color: '95a5a6' },
    { name: 'ps5.jpg', text: 'PS5', color: '3498db' },
    { name: 'xbox-series-x.jpg', text: 'Xbox', color: '27ae60' },
    { name: 'switch-oled.jpg', text: 'Switch', color: 'e74c3c' },
    { name: 'apple-watch-ultra.jpg', text: 'Apple Watch', color: 'f39c12' },
    { name: 'galaxy-watch.jpg', text: 'Galaxy Watch', color: '34495e' },
    { name: 'caldigit-dock.jpg', text: 'CalDigit', color: '95a5a6' },
    { name: 'logitech-mx.jpg', text: 'Logitech', color: '2c3e50' },
    { name: 'no-image.png', text: 'No Image', color: 'bdc3c7' }
];

console.log('📸 Generating placeholder images...\n');

// Function to download image
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(uploadsDir, filename));
        
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`  ✅ Created: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(path.join(uploadsDir, filename), () => {});
            reject(err);
        });
    });
}

// Generate all images
async function generateImages() {
    for (const img of images) {
        const url = `https://via.placeholder.com/400x300/${img.color}/ffffff?text=${encodeURIComponent(img.text)}`;
        try {
            await downloadImage(url, img.name);
        } catch (error) {
            console.error(`  ❌ Failed to create ${img.name}:`, error.message);
        }
    }
    
    // Also create a no-image placeholder for the frontend
    const frontendAssets = path.join(__dirname, '..', 'frontend', 'assets', 'images');
    if (!fs.existsSync(frontendAssets)) {
        fs.mkdirSync(frontendAssets, { recursive: true });
    }
    
    // Copy no-image to frontend
    const noImageSrc = path.join(uploadsDir, 'no-image.png');
    const noImageDest = path.join(frontendAssets, 'no-image.png');
    
    if (fs.existsSync(noImageSrc)) {
        fs.copyFileSync(noImageSrc, noImageDest);
        console.log('\n  ✅ Copied no-image.png to frontend assets');
    }
    
    console.log('\n✨ Placeholder images generated successfully!');
}

generateImages().catch(console.error);

// Add to package.json:
// "generate-images": "node generate-placeholders.js"