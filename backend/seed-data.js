// backend/seed-data.js
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Import database functions
const { runQuery, getOne, getAll } = require('./config/database');

// Sample data
const users = [
    {
        username: 'john_seller',
        email: 'john@example.com',
        password: 'password123',
        full_name: 'John Smith',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        role: 'user'
    },
    {
        username: 'sarah_tech',
        email: 'sarah@example.com',
        password: 'password123',
        full_name: 'Sarah Johnson',
        phone: '+1234567891',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001',
        role: 'user'
    },
    {
        username: 'mike_buyer',
        email: 'mike@example.com',
        password: 'password123',
        full_name: 'Mike Williams',
        phone: '+1234567892',
        address: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        role: 'user'
    },
    {
        username: 'emma_electronics',
        email: 'emma@example.com',
        password: 'password123',
        full_name: 'Emma Davis',
        phone: '+1234567893',
        address: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        zip_code: '77001',
        role: 'user'
    },
    {
        username: 'alex_gamer',
        email: 'alex@example.com',
        password: 'password123',
        full_name: 'Alex Chen',
        phone: '+1234567894',
        address: '654 Maple Dr',
        city: 'Phoenix',
        state: 'AZ',
        zip_code: '85001',
        role: 'user'
    }
];

const products = [
    // Smartphones
    {
        title: 'iPhone 13 Pro Max 256GB - Excellent Condition',
        description: 'Barely used iPhone 13 Pro Max in Sierra Blue. Comes with original box, charger, and case. Battery health at 95%. No scratches or dents. Always kept in protective case.',
        price: 899.99,
        condition: 'like-new',
        brand: 'Apple',
        model: 'iPhone 13 Pro Max',
        category_name: 'Smartphones',
        quantity: 1,
        location: 'New York, NY',
        image_url: '/uploads/products/iphone13.svg',
        seller_index: 0,
        views: 245
    },
    {
        title: 'Samsung Galaxy S22 Ultra 512GB',
        description: 'Top-tier Samsung flagship with S Pen included. Phantom Black color. Minor wear on edges but screen is perfect. Includes wireless charger and extra S Pen tips.',
        price: 749.99,
        condition: 'good',
        brand: 'Samsung',
        model: 'Galaxy S22 Ultra',
        category_name: 'Smartphones',
        quantity: 1,
        location: 'Los Angeles, CA',
        image_url: '/uploads/products/samsung-s22.svg',
        seller_index: 1,
        views: 189
    },
    {
        title: 'Google Pixel 7 Pro 128GB - Like New',
        description: 'Latest Google flagship with amazing camera. Used for only 2 months. Switching to iPhone. Comes with Google case and screen protector already applied.',
        price: 599.99,
        condition: 'like-new',
        brand: 'Google',
        model: 'Pixel 7 Pro',
        category_name: 'Smartphones',
        quantity: 1,
        location: 'Chicago, IL',
        image_url: '/uploads/products/pixel7.svg',
        seller_index: 2,
        views: 156
    },
    
    // Laptops
    {
        title: 'MacBook Pro 14" M2 Pro - 16GB RAM, 512GB SSD',
        description: 'Powerful MacBook Pro with M2 Pro chip. Space Gray. Perfect for creative professionals. Minor wear on palm rest. Includes original charger and USB-C hub.',
        price: 1799.99,
        condition: 'good',
        brand: 'Apple',
        model: 'MacBook Pro 14"',
        category_name: 'Laptops',
        quantity: 1,
        location: 'Houston, TX',
        image_url: '/uploads/products/macbook-pro.svg',
        seller_index: 3,
        views: 367
    },
    {
        title: 'Dell XPS 15 - Intel i7, 32GB RAM, 1TB SSD',
        description: 'High-performance Windows laptop. 4K touchscreen display. NVIDIA GTX 1650Ti. Perfect for gaming and productivity. Includes laptop sleeve and wireless mouse.',
        price: 1299.99,
        condition: 'like-new',
        brand: 'Dell',
        model: 'XPS 15 9510',
        category_name: 'Laptops',
        quantity: 1,
        location: 'Phoenix, AZ',
        image_url: '/uploads/products/dell-xps.svg',
        seller_index: 4,
        views: 234
    },
    {
        title: 'ThinkPad X1 Carbon Gen 9 - Business Laptop',
        description: 'Legendary ThinkPad durability. Intel i5, 16GB RAM, 256GB SSD. Excellent keyboard. Some wear on trackpad. Great for business use.',
        price: 799.99,
        condition: 'good',
        brand: 'Lenovo',
        model: 'ThinkPad X1 Carbon',
        category_name: 'Laptops',
        quantity: 1,
        location: 'New York, NY',
        image_url: '/uploads/products/thinkpad.svg',
        seller_index: 0,
        views: 178
    },
    
    // Tablets
    {
        title: 'iPad Pro 12.9" M2 256GB with Magic Keyboard',
        description: 'Latest iPad Pro with M2 chip. Includes Magic Keyboard and Apple Pencil 2. Perfect for digital art and productivity. Screen is flawless.',
        price: 1299.99,
        condition: 'like-new',
        brand: 'Apple',
        model: 'iPad Pro 12.9"',
        category_name: 'Tablets',
        quantity: 1,
        location: 'Los Angeles, CA',
        image_url: '/uploads/products/ipad-pro.svg',
        seller_index: 1,
        views: 298
    },
    {
        title: 'Samsung Galaxy Tab S8+ - Great for Students',
        description: 'Android tablet with S Pen. 12.4" AMOLED display. Perfect for note-taking and media consumption. Includes keyboard cover.',
        price: 649.99,
        condition: 'good',
        brand: 'Samsung',
        model: 'Galaxy Tab S8+',
        category_name: 'Tablets',
        quantity: 1,
        location: 'Chicago, IL',
        image_url: '/uploads/products/galaxy-tab.svg',
        seller_index: 2,
        views: 145
    },
    
    // Cameras
    {
        title: 'Sony A7 III Mirrorless Camera + 28-70mm Lens',
        description: 'Professional mirrorless camera. Full frame sensor. Includes kit lens, extra battery, and camera bag. Shutter count: 12,000. Some dust on sensor.',
        price: 1399.99,
        condition: 'good',
        brand: 'Sony',
        model: 'A7 III',
        category_name: 'Cameras',
        quantity: 1,
        location: 'Houston, TX',
        image_url: '/uploads/products/sony-a7.svg',
        seller_index: 3,
        views: 412
    },
    {
        title: 'Canon EOS R6 Body Only - Low Shutter Count',
        description: 'Excellent condition R6 body. Shutter count only 5,000. Includes 3 batteries, charger, and strap. Perfect for video and photography.',
        price: 1899.99,
        condition: 'like-new',
        brand: 'Canon',
        model: 'EOS R6',
        category_name: 'Cameras',
        quantity: 1,
        location: 'Phoenix, AZ',
        image_url: '/uploads/products/canon-r6.svg',
        seller_index: 4,
        views: 234
    },
    
    // Audio
    {
        title: 'AirPods Pro 2nd Gen - With AppleCare+',
        description: 'Latest AirPods Pro with USB-C case. AppleCare+ valid until Dec 2024. All ear tips included. Minor scratches on case.',
        price: 199.99,
        condition: 'good',
        brand: 'Apple',
        model: 'AirPods Pro 2',
        category_name: 'Audio',
        quantity: 1,
        location: 'New York, NY',
        image_url: '/uploads/products/airpods-pro.svg',
        seller_index: 0,
        views: 567
    },
    {
        title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        description: 'Best-in-class noise cancellation. Midnight Blue color. 30-hour battery life. Includes carrying case and airplane adapter.',
        price: 279.99,
        condition: 'like-new',
        brand: 'Sony',
        model: 'WH-1000XM5',
        category_name: 'Audio',
        quantity: 1,
        location: 'Los Angeles, CA',
        image_url: '/uploads/products/sony-xm5.svg',
        seller_index: 1,
        views: 423
    },
    {
        title: 'Bose QuietComfort 45 - Comfortable ANC',
        description: 'Premium noise-cancelling headphones. White color. Some wear on ear cushions but still very comfortable. Great battery life.',
        price: 229.99,
        condition: 'good',
        brand: 'Bose',
        model: 'QuietComfort 45',
        category_name: 'Audio',
        quantity: 1,
        location: 'Chicago, IL',
        image_url: '/uploads/products/bose-qc45.svg',
        seller_index: 2,
        views: 312
    },
    
    // Gaming
    {
        title: 'PlayStation 5 Bundle - Extra Controller + 3 Games',
        description: 'PS5 console with disc drive. Includes extra DualSense controller, Spider-Man 2, God of War Ragnarok, and Horizon Forbidden West. All cables included.',
        price: 549.99,
        condition: 'good',
        brand: 'Sony',
        model: 'PlayStation 5',
        category_name: 'Gaming',
        quantity: 1,
        location: 'Houston, TX',
        image_url: '/uploads/products/ps5.svg',
        seller_index: 3,
        views: 789
    },
    {
        title: 'Xbox Series X - 1TB with Game Pass',
        description: 'Latest Xbox in perfect condition. Includes 3 months of Game Pass Ultimate. Original box and controller included.',
        price: 449.99,
        condition: 'like-new',
        brand: 'Microsoft',
        model: 'Xbox Series X',
        category_name: 'Gaming',
        quantity: 1,
        location: 'Phoenix, AZ',
        image_url: '/uploads/products/xbox-series-x.svg',
        seller_index: 4,
        views: 654
    },
    {
        title: 'Nintendo Switch OLED + Pro Controller',
        description: 'White OLED model. Includes Pro Controller, carrying case, and screen protector. Perfect for gaming on the go.',
        price: 299.99,
        condition: 'good',
        brand: 'Nintendo',
        model: 'Switch OLED',
        category_name: 'Gaming',
        quantity: 1,
        location: 'New York, NY',
        image_url: '/uploads/products/switch-oled.svg',
        seller_index: 0,
        views: 445
    },
    
    // Wearables
    {
        title: 'Apple Watch Ultra - Titanium Case',
        description: 'Premium Apple Watch with titanium case. Orange Alpine Loop band. Perfect for outdoor activities. Battery lasts 2 days.',
        price: 699.99,
        condition: 'like-new',
        brand: 'Apple',
        model: 'Watch Ultra',
        category_name: 'Wearables',
        quantity: 1,
        location: 'Los Angeles, CA',
        image_url: '/uploads/products/apple-watch-ultra.svg',
        seller_index: 1,
        views: 334
    },
    {
        title: 'Samsung Galaxy Watch 5 Pro - Fitness Tracking',
        description: 'Rugged smartwatch with excellent battery life. Black titanium case. Includes extra sport band. Great for fitness enthusiasts.',
        price: 349.99,
        condition: 'good',
        brand: 'Samsung',
        model: 'Galaxy Watch 5 Pro',
        category_name: 'Wearables',
        quantity: 1,
        location: 'Chicago, IL',
        image_url: '/uploads/products/galaxy-watch.svg',
        seller_index: 2,
        views: 223
    },
    
    // Accessories
    {
        title: 'CalDigit TS4 Thunderbolt 4 Dock',
        description: '18 ports of connectivity. 98W laptop charging. Perfect for Mac or PC setup. All cables included.',
        price: 299.99,
        condition: 'like-new',
        brand: 'CalDigit',
        model: 'TS4',
        category_name: 'Accessories',
        quantity: 1,
        location: 'Houston, TX',
        image_url: '/uploads/products/caldigit-dock.svg',
        seller_index: 3,
        views: 167
    },
    {
        title: 'Logitech MX Master 3S + MX Keys Bundle',
        description: 'Premium wireless mouse and keyboard combo. Perfect for productivity. Works with Mac and PC. USB-C charging.',
        price: 179.99,
        condition: 'good',
        brand: 'Logitech',
        model: 'MX Master 3S',
        category_name: 'Accessories',
        quantity: 1,
        location: 'Phoenix, AZ',
        image_url: '/uploads/products/logitech-mx.svg',
        seller_index: 4,
        views: 289
    }
];

// Function to seed the database
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');
        
        // Check if data already exists
        const existingUsers = await getOne('SELECT COUNT(*) as count FROM users WHERE email != ?', ['admin@resale.com']);
        if (existingUsers.count > 0) {
            console.log('⚠️  Database already contains user data. Skipping seed to avoid duplicates.');
            console.log('💡 To reseed, reset the database first with: npm run reset-db\n');
            return;
        }
        
        // 1. Create users
        console.log('👥 Creating users...');
        const userIds = [];
        
        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const result = await runQuery(
                `INSERT INTO users (username, email, password, full_name, phone, address, city, state, zip_code, role) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userData.username, userData.email, hashedPassword, userData.full_name, 
                 userData.phone, userData.address, userData.city, userData.state, 
                 userData.zip_code, userData.role]
            );
            userIds.push(result.id);
            console.log(`  ✅ Created user: ${userData.username} (${userData.email})`);
        }
        
        // 2. Get categories
        console.log('\n📁 Fetching categories...');
        const categories = await getAll('SELECT * FROM categories');
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat.id;
        });
        
        // 3. Create products
        console.log('\n📦 Creating products...');
        const productIds = [];
        
        for (const productData of products) {
            const sellerId = userIds[productData.seller_index];
            const categoryId = categoryMap[productData.category_name];
            
            const result = await runQuery(
                `INSERT INTO products (
                    title, description, price, condition, brand, model,
                    category_id, seller_id, quantity, location, image_url, views
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [productData.title, productData.description, productData.price,
                 productData.condition, productData.brand, productData.model,
                 categoryId, sellerId, productData.quantity, productData.location,
                 productData.image_url, productData.views]
            );
            productIds.push(result.id);
            console.log(`  ✅ Created product: ${productData.title.substring(0, 50)}...`);
        }
        
        // 4. Create some transactions (purchases)
        console.log('\n💰 Creating sample transactions...');
        const transactions = [
            { product_index: 0, buyer_index: 2, status: 'completed' },
            { product_index: 3, buyer_index: 3, status: 'completed' },
            { product_index: 6, buyer_index: 4, status: 'pending' },
            { product_index: 10, buyer_index: 2, status: 'completed' },
            { product_index: 13, buyer_index: 1, status: 'pending' }
        ];
        
        for (const trans of transactions) {
            const product = products[trans.product_index];
            const productId = productIds[trans.product_index];
            const buyerId = userIds[trans.buyer_index];
            const sellerId = userIds[product.seller_index];
            
            await runQuery(
                `INSERT INTO transactions (
                    product_id, buyer_id, seller_id, quantity, total_price,
                    status, payment_method, shipping_address
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [productId, buyerId, sellerId, 1, product.price,
                 trans.status, 'credit_card', '123 Buyer Street, City, State 12345']
            );
            console.log(`  ✅ Created transaction: ${users[trans.buyer_index].username} bought from ${users[product.seller_index].username}`);
        }
        
        // 5. Add some favorites
        console.log('\n❤️  Adding favorites...');
        const favorites = [
            { user_index: 0, product_index: 4 },
            { user_index: 1, product_index: 2 },
            { user_index: 2, product_index: 7 },
            { user_index: 3, product_index: 1 },
            { user_index: 4, product_index: 9 }
        ];
        
        for (const fav of favorites) {
            await runQuery(
                'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
                [userIds[fav.user_index], productIds[fav.product_index]]
            );
            console.log(`  ✅ ${users[fav.user_index].username} favorited a product`);
        }
        
        // 6. Add some reviews
        console.log('\n⭐ Adding reviews...');
        const reviews = [
            { product_index: 0, user_index: 2, rating: 5, comment: 'Excellent condition as described. Fast shipping!' },
            { product_index: 3, user_index: 3, rating: 4, comment: 'Great laptop, minor wear as mentioned but works perfectly.' },
            { product_index: 10, user_index: 2, rating: 5, comment: 'Amazing sound quality! Seller was very responsive.' }
        ];
        
        for (const review of reviews) {
            await runQuery(
                'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
                [productIds[review.product_index], userIds[review.user_index], review.rating, review.comment]
            );
            console.log(`  ✅ Added review for ${products[review.product_index].title.substring(0, 30)}...`);
        }
        
        console.log('\n✨ Database seeding completed successfully!\n');
        console.log('📝 Test Accounts:');
        console.log('  Admin: admin / admin123');
        users.forEach(user => {
            console.log(`  User: ${user.username} / password123`);
        });
        console.log('\n🚀 Your application now has realistic sample data!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

// Run the seeding
if (require.main === module) {
    // Initialize database first
    const db = require('./config/database');
    db.initialize().then(() => {
        seedDatabase().then(() => {
            process.exit(0);
        });
    }).catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
}

module.exports = seedDatabase;