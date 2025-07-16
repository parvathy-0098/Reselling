const { runQuery, getOne, getAll } = require('../config/database');

const getAllCategories = async (req, res) => {
    try {
        const categories = await getAll(
            'SELECT * FROM categories WHERE is_active = 1 ORDER BY name'
        );
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await getOne(
            'SELECT * FROM categories WHERE id = ? AND is_active = 1',
            [id]
        );
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category'
        });
    }
};

const getCategoryProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        const products = await getAll(
            `SELECT p.*, u.username as seller_name
             FROM products p
             JOIN users u ON p.seller_id = u.id
             WHERE p.category_id = ? AND p.status = "available"
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), parseInt(offset)]
        );
        
        const { total } = await getOne(
            'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status = "available"',
            [id]
        );
        
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
        console.error('Get category products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category products'
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        
        const result = await runQuery(
            'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
            [name, description, icon]
        );
        
        const category = await getOne('SELECT * FROM categories WHERE id = ?', [result.id]);
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category'
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, is_active } = req.body;
        
        await runQuery(
            'UPDATE categories SET name = ?, description = ?, icon = ?, is_active = ? WHERE id = ?',
            [name, description, icon, is_active, id]
        );
        
        const category = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category'
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Soft delete
        await runQuery(
            'UPDATE categories SET is_active = 0 WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category'
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryProducts,
    createCategory,
    updateCategory,
    deleteCategory
};