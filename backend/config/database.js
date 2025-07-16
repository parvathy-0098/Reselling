const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/database.sqlite');
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Database helper functions
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

const getOne = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const getAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Initialize database with schema
const initialize = async () => {
    try {
        // Check if schema file exists
        if (!fs.existsSync(schemaPath)) {
            console.log('Schema file not found, creating tables directly...');
            await createTables();
        } else {
            // Read and execute schema
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema.split(';').filter(s => s.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    await runQuery(statement);
                }
            }
        }
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        // Try creating tables directly if schema fails
        await createTables();
    }
};

// Create tables directly if schema file is missing
const createTables = async () => {
    try {
        // Users table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                city VARCHAR(50),
                state VARCHAR(50),
                zip_code VARCHAR(10),
                role VARCHAR(20) DEFAULT 'user',
                is_active BOOLEAN DEFAULT 1,
                email_verified BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Categories table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                condition VARCHAR(20) NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
                brand VARCHAR(100),
                model VARCHAR(100),
                category_id INTEGER NOT NULL,
                seller_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                location VARCHAR(100),
                image_url TEXT,
                status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending', 'deleted')),
                views INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (seller_id) REFERENCES users(id)
            )
        `);

        // Transactions table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                buyer_id INTEGER NOT NULL,
                seller_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
                payment_method VARCHAR(50),
                shipping_address TEXT,
                tracking_number VARCHAR(100),
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (buyer_id) REFERENCES users(id),
                FOREIGN KEY (seller_id) REFERENCES users(id)
            )
        `);

        // Favorites table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id),
                UNIQUE(user_id, product_id)
            )
        `);

        // Messages table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                product_id INTEGER,
                subject VARCHAR(200),
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        // Insert default categories
        const categories = [
            ['Smartphones', 'Mobile phones and accessories', 'smartphone'],
            ['Laptops', 'Laptops and notebooks', 'laptop'],
            ['Tablets', 'Tablets and e-readers', 'tablet'],
            ['Cameras', 'Digital cameras and accessories', 'camera'],
            ['Audio', 'Headphones, speakers, and audio equipment', 'headphones'],
            ['Gaming', 'Gaming consoles and accessories', 'gamepad'],
            ['Wearables', 'Smartwatches and fitness trackers', 'watch'],
            ['Accessories', 'Cables, chargers, and other accessories', 'cable'],
            ['Components', 'Computer components and parts', 'cpu'],
            ['Other', 'Other electronics', 'device']
        ];

        for (const [name, description, icon] of categories) {
            await runQuery(
                'INSERT OR IGNORE INTO categories (name, description, icon) VALUES (?, ?, ?)',
                [name, description, icon]
            );
        }

        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
};

module.exports = {
    db,
    runQuery,
    getOne,
    getAll,
    initialize
};