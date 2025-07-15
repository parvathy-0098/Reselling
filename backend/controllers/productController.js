const { runQuery, getOne, getAll } = require('../config/database');

// Helper function to validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Create product
const createProduct = async (req, res) => {
    try {
        const {
            title, description, price, condition, brand, model,
            category_id, quantity = 1, location, image_url
        } = req.body;
        
        const seller_id = req.user.id;

        // Validate image URL if provided
        if (image_url && !isValidUrl(image_url)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image URL'
            });
        }

        const result = await runQuery(
            `INSERT INTO products (
                title, description, price, condition, brand, model,
                category_id, seller_id, quantity, location, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, price, condition, brand, model,
             category_id, seller_id, quantity, location, image_url || null]
        );

        const product = await getOne(
            `SELECT p.*, c.name as category_name, u.username as seller_name
             FROM products p
             JOIN categories c ON p.category_id = c.id
             JOIN users u ON p.seller_id = u.id
             WHERE p.id = ?`,
            [result.id]
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product'
        });
    }
};

// Get all products with filters
const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1, limit = 20, category, minPrice, maxPrice,
            condition, search, sortBy = 'created_at', order = 'desc'
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['p.status = "available"'];
        let params = [];

        // Build filter conditions
        if (category) {
            whereConditions.push('p.category_id = ?');
            params.push(category);
        }
        if (minPrice) {
            whereConditions.push('p.price >= ?');
            params.push(minPrice);
        }
        if (maxPrice) {
            whereConditions.push('p.price <= ?');
            params.push(maxPrice);
        }
        if (condition) {
            whereConditions.push('p.condition = ?');
            params.push(condition);
        }
        if (search) {
            whereConditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Validate sort column
        const allowedSortColumns = ['price', 'created_at', 'views'];
        const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM products p 
            ${whereClause}
        `;
        const { total } = await getOne(countQuery, params);

        // Get products
        const query = `
            SELECT p.*, c.name as category_name, u.username as seller_name,
                   (SELECT COUNT(*) FROM favorites WHERE product_id = p.id) as favorite_count
            FROM products p
            JOIN categories c ON p.category_id = c.id
            JOIN users u ON p.seller_id = u.id
            ${whereClause}
            ORDER BY p.${sortColumn} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        params.push(parseInt(limit), parseInt(offset));

        const products = await getAll(query, params);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Increment view count
        await runQuery('UPDATE products SET views = views + 1 WHERE id = ?', [id]);

        const product = await getOne(
            `SELECT p.*, c.name as category_name, 
                    u.username as seller_name, u.email as seller_email,
                    u.phone as seller_phone, u.created_at as seller_since,
                    (SELECT COUNT(*) FROM products WHERE seller_id = p.seller_id AND status = "available") as seller_total_products,
                    (SELECT COUNT(*) FROM favorites WHERE product_id = p.id) as favorite_count
             FROM products p
             JOIN categories c ON p.category_id = c.id
             JOIN users u ON p.seller_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if user owns the product
        const product = await getOne(
            'SELECT seller_id FROM products WHERE id = ?',
            [id]
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.seller_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own products'
            });
        }

        // Build update query dynamically
        const updates = [];
        const params = [];
        const allowedFields = ['title', 'description', 'price', 'condition', 
                             'brand', 'model', 'category_id', 'quantity', 'location', 'image_url'];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (field === 'image_url' && req.body[field] && !isValidUrl(req.body[field])) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid image URL'
                    });
                }
                updates.push(`${field} = ?`);
                params.push(req.body[field]);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await runQuery(
            `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const updatedProduct = await getOne(
            `SELECT p.*, c.name as category_name, u.username as seller_name
             FROM products p
             JOIN categories c ON p.category_id = c.id
             JOIN users u ON p.seller_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
};

// Delete product (soft delete)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if user owns the product
        const product = await getOne(
            'SELECT seller_id FROM products WHERE id = ?',
            [id]
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.seller_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own products'
            });
        }

        // Soft delete
        await runQuery(
            'UPDATE products SET status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
};

// Get products by seller
const getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { status = 'available' } = req.query;

        const products = await getAll(
            `SELECT p.*, c.name as category_name
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.seller_id = ? AND p.status = ?
             ORDER BY p.created_at DESC`,
            [sellerId, status]
        );

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller products'
        });
    }
};

// Toggle favorite
const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if already favorited
        const existing = await getOne(
            'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, id]
        );

        if (existing) {
            // Remove favorite
            await runQuery(
                'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
                [userId, id]
            );
            res.json({
                success: true,
                message: 'Product removed from favorites',
                favorited: false
            });
        } else {
            // Add favorite
            await runQuery(
                'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
                [userId, id]
            );
            res.json({
                success: true,
                message: 'Product added to favorites',
                favorited: true
            });
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling favorite'
        });
    }
};

// Get user's favorites
const getMyFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await getAll(
            `SELECT p.*, c.name as category_name, u.username as seller_name
             FROM favorites f
             JOIN products p ON f.product_id = p.id
             JOIN categories c ON p.category_id = c.id
             JOIN users u ON p.seller_id = u.id
             WHERE f.user_id = ? AND p.status = "available"
             ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorites'
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsBySeller,
    toggleFavorite,
    getMyFavorites
};