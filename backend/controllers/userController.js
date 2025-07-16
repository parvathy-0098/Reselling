const { runQuery, getOne, getAll } = require('../config/database');

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        const users = await getAll(
            `SELECT id, username, email, full_name, role, is_active, created_at
             FROM users
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );
        
        const { total } = await getOne('SELECT COUNT(*) as total FROM users');
        
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await getOne(
            `SELECT u.id, u.username, u.created_at,
                    (SELECT COUNT(*) FROM products WHERE seller_id = u.id AND status = "available") as total_products,
                    (SELECT COUNT(*) FROM transactions WHERE seller_id = u.id AND status = "completed") as total_sales
             FROM users u
             WHERE u.id = ? AND u.is_active = 1`,
            [id]
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
};

const getUserProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        const products = await getAll(
            `SELECT p.*, c.name as category_name
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.seller_id = ? AND p.status = "available"
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), parseInt(offset)]
        );
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get user products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user products'
        });
    }
};

const getUserReviews = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Placeholder - reviews table not implemented yet
        res.json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user reviews'
        });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        
        await runQuery(
            'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [is_active, id]
        );
        
        res.json({
            success: true,
            message: 'User status updated successfully'
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status'
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { receiver_id, product_id, subject, message } = req.body;
        const sender_id = req.user.id;
        
        if (sender_id === receiver_id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot send messages to yourself'
            });
        }
        
        const result = await runQuery(
            'INSERT INTO messages (sender_id, receiver_id, product_id, subject, message) VALUES (?, ?, ?, ?, ?)',
            [sender_id, receiver_id, product_id, subject, message]
        );
        
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { id: result.id }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'inbox' } = req.query;
        
        const whereClause = type === 'sent' 
            ? 'WHERE m.sender_id = ?' 
            : 'WHERE m.receiver_id = ?';
        
        const messages = await getAll(
            `SELECT m.*, u1.username as sender_name, u2.username as receiver_name,
                    p.title as product_title
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             LEFT JOIN products p ON m.product_id = p.id
             ${whereClause}
             ORDER BY m.created_at DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
};

const markMessageAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        await runQuery(
            'UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?',
            [id, userId]
        );
        
        res.json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Mark message read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking message as read'
        });
    }
};

module.exports = {
    getAllUsers,
    getPublicProfile,
    getUserProducts,
    getUserReviews,
    updateUserStatus,
    sendMessage,
    getMessages,
    markMessageAsRead
};