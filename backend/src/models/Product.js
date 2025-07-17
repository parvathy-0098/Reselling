const { db } = require('../config/database');

class Product {
    static async create(productData) {
        const { name, category, price, condition, description, seller_id, image_url } = productData;
        
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO products (name, category, price, condition, description, seller_id, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run([name, category, price, condition, description, seller_id, image_url], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...productData });
                }
            });
            
            stmt.finalize();
        });
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT p.*, u.username as seller_name 
            FROM products p 
            JOIN users u ON p.seller_id = u.id
        `;
        const params = [];

        if (filters.category) {
            query += ' WHERE p.category = ?';
            params.push(filters.category);
        }

        if (filters.search) {
            query += params.length > 0 ? ' AND' : ' WHERE';
            query += ' (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY p.created_at DESC';

        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT p.*, u.username as seller_name 
                 FROM products p 
                 JOIN users u ON p.seller_id = u.id 
                 WHERE p.id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    static async update(id, productData) {
        const { name, category, price, condition, description, image_url } = productData;
        
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                UPDATE products 
                SET name = ?, category = ?, price = ?, condition = ?, 
                    description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            
            stmt.run([name, category, price, condition, description, image_url, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, ...productData });
                }
            });
            
            stmt.finalize();
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ deletedId: id, changes: this.changes });
                }
            });
        });
    }
}

module.exports = Product;