// frontend/js/config.js - Updated with data URL for no-image placeholder
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api',
    DEFAULT_IMAGE: 'https://via.placeholder.com/400x300/f0f0f0/999999?text=No+Image',
    ITEMS_PER_PAGE: 20,
    TOKEN_KEY: 'token',
    USER_KEY: 'user'
};

// Create assets directory structure - Run this in terminal
// mkdir -p frontend/assets/images
// mkdir -p frontend/assets/icons

// Alternative: Create a simple HTML file to generate placeholder image
// Save this as frontend/assets/create-placeholder.html
const createPlaceholderHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Create Placeholder Image</title>
</head>
<body>
    <h2>No-Image Placeholder Generator</h2>
    <canvas id="canvas" width="400" height="300"></canvas>
    <br><br>
    <button onclick="downloadImage()">Download no-image.png</button>
    
    <script>
        // Create placeholder image
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 400, 300);
        
        // Add border
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 398, 298);
        
        // Add text
        ctx.fillStyle = '#999';
        ctx.font = '24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Image', 200, 150);
        
        // Add icon
        ctx.font = '48px Arial, sans-serif';
        ctx.fillText('📷', 200, 100);
        
        function downloadImage() {
            const link = document.createElement('a');
            link.download = 'no-image.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    </script>
</body>
</html>
`;