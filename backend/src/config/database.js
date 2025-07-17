const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../..', 'database', 'electronics.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

const initializeDatabase = () => {
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            condition TEXT NOT NULL,
            description TEXT,
            seller_id INTEGER NOT NULL,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users(id)
        )
    `);

    // Insert sample data
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
            console.error('Error checking products:', err);
        } else if (row.count === 0) {
            const sampleProducts = [
                ['iPhone 12', 'Smartphone', 599.99, 'Good', 'Excellent condition iPhone 12 with minor scratches', 1, 'https://via.placeholder.com/300x200'],
                ['MacBook Pro', 'Laptop', 1299.99, 'Like New', 'MacBook Pro 13-inch, barely used', 1, 'https://via.placeholder.com/300x200'],
                ['Samsung TV', 'Television', 899.99, 'Fair', '55-inch Samsung Smart TV', 1, 'https://via.placeholder.com/300x200'],
                ['Gaming Console', 'Gaming', 399.99, 'Good', 'PlayStation 5 with controller', 1, 'https://via.placeholder.com/300x200']
            ];

            const stmt = db.prepare(`
                INSERT INTO products (name, category, price, condition, description, seller_id, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            sampleProducts.forEach(product => {
                stmt.run(product);
            });

            stmt.finalize();
        }
    });
};

module.exports = { db, initializeDatabase };