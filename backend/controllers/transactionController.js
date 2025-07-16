const { runQuery, getOne, getAll } = require('../config/database');

const createTransaction = async (req, res) => {
    try {
        const { product_id, quantity = 1, shipping_address, payment_method, notes } = req.body;
        const buyer_id = req.user.id;
        
        // Get product details
        const product = await getOne(
            'SELECT * FROM products WHERE id = ? AND status = "available"',
            [product_id]
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not available'
            });
        }
        
        if (product.seller_id === buyer_id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot buy your own product'
            });
        }
        
        if (product.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient quantity available'
            });
        }
        
        const total_price = product.price * quantity;
        
        // Create transaction
        const result = await runQuery(
            `INSERT INTO transactions (
                product_id, buyer_id, seller_id, quantity, total_price,
                payment_method, shipping_address, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_id, buyer_id, product.seller_id, quantity, total_price,
             payment_method, shipping_address, notes]
        );
        
        // Update product quantity and status
        const newQuantity = product.quantity - quantity;
        await runQuery(
            'UPDATE products SET quantity = ?, status = ? WHERE id = ?',
            [newQuantity, newQuantity === 0 ? 'sold' : 'available', product_id]
        );
        
        const transaction = await getOne(
            `SELECT t.*, p.title as product_title, 
                    u1.username as buyer_name, u2.username as seller_name
             FROM transactions t
             JOIN products p ON t.product_id = p.id
             JOIN users u1 ON t.buyer_id = u1.id
             JOIN users u2 ON t.seller_id = u2.id
             WHERE t.id = ?`,
            [result.id]
        );
        
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating transaction'
        });
    }
};

const getMyTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE (t.buyer_id = ? OR t.seller_id = ?)';
        const params = [userId, userId];
        
        if (status) {
            whereClause += ' AND t.status = ?';
            params.push(status);
        }
        
        params.push(parseInt(limit), parseInt(offset));
        
        const transactions = await getAll(
            `SELECT t.*, p.title as product_title, p.image_url,
                    u1.username as buyer_name, u2.username as seller_name,
                    CASE WHEN t.buyer_id = ? THEN 'purchase' ELSE 'sale' END as type
             FROM transactions t
             JOIN products p ON t.product_id = p.id
             JOIN users u1 ON t.buyer_id = u1.id
             JOIN users u2 ON t.seller_id = u2.id
             ${whereClause}
             ORDER BY t.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, ...params]
        );
        
        // Get total count
        const countParams = status ? [userId, userId, status] : [userId, userId];
        const { total } = await getOne(
            `SELECT COUNT(*) as total FROM transactions t ${whereClause}`,
            countParams
        );
        
        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions'
        });
    }
};

const getMyPurchases = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const purchases = await getAll(
            `SELECT t.*, p.title as product_title, p.image_url,
                    u.username as seller_name
             FROM transactions t
             JOIN products p ON t.product_id = p.id
             JOIN users u ON t.seller_id = u.id
             WHERE t.buyer_id = ?
             ORDER BY t.created_at DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            data: purchases
        });
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching purchases'
        });
    }
};

const getMySales = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const sales = await getAll(
            `SELECT t.*, p.title as product_title, p.image_url,
                    u.username as buyer_name
             FROM transactions t
             JOIN products p ON t.product_id = p.id
             JOIN users u ON t.buyer_id = u.id
             WHERE t.seller_id = ?
             ORDER BY t.created_at DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            data: sales
        });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales'
        });
    }
};

const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const transaction = await getOne(
            `SELECT t.*, p.title as product_title, p.description as product_description,
                    p.image_url, p.price as product_price,
                    u1.username as buyer_name, u1.email as buyer_email,
                    u2.username as seller_name, u2.email as seller_email
             FROM transactions t
             JOIN products p ON t.product_id = p.id
             JOIN users u1 ON t.buyer_id = u1.id
             JOIN users u2 ON t.seller_id = u2.id
             WHERE t.id = ? AND (t.buyer_id = ? OR t.seller_id = ?)`,
            [id, userId, userId]
        );
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction'
        });
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        
        // Check if user is the seller
        const transaction = await getOne(
            'SELECT * FROM transactions WHERE id = ? AND seller_id = ?',
            [id, userId]
        );
        
        if (!transaction) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own sales'
            });
        }
        
        // Update status
        const completed_at = status === 'completed' ? 'CURRENT_TIMESTAMP' : null;
        await runQuery(
            `UPDATE transactions SET status = ?, completed_at = ${completed_at} WHERE id = ?`,
            [status, id]
        );
        
        // If cancelled, restore product quantity
        if (status === 'cancelled' && transaction.status === 'pending') {
            await runQuery(
                'UPDATE products SET quantity = quantity + ?, status = "available" WHERE id = ?',
                [transaction.quantity, transaction.product_id]
            );
        }
        
        res.json({
            success: true,
            message: 'Transaction status updated successfully'
        });
    } catch (error) {
        console.error('Update transaction status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating transaction status'
        });
    }
};

const addTrackingNumber = async (req, res) => {
    try {
        const { id } = req.params;
        const { tracking_number } = req.body;
        const userId = req.user.id;
        
        // Check if user is the seller
        const transaction = await getOne(
            'SELECT * FROM transactions WHERE id = ? AND seller_id = ?',
            [id, userId]
        );
        
        if (!transaction) {
            return res.status(403).json({
                success: false,
                message: 'You can only add tracking to your own sales'
            });
        }
        
        await runQuery(
            'UPDATE transactions SET tracking_number = ? WHERE id = ?',
            [tracking_number, id]
        );
        
        res.json({
            success: true,
            message: 'Tracking number added successfully'
        });
    } catch (error) {
        console.error('Add tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding tracking number'
        });
    }
};

module.exports = {
    createTransaction,
    getMyTransactions,
    getMyPurchases,
    getMySales,
    getTransactionById,
    updateTransactionStatus,
    addTrackingNumber
};
