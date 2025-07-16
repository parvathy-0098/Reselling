const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// All transaction routes require authentication
router.use(authenticateToken);

// Create transaction (buy product)
router.post('/', [
    body('product_id').isInt().withMessage('Product ID is required'),
    body('quantity').optional().isInt({ min: 1 }),
    body('shipping_address').notEmpty().withMessage('Shipping address is required'),
    body('payment_method').notEmpty().withMessage('Payment method is required'),
    handleValidationErrors
], transactionController.createTransaction);

// Get user's transactions
router.get('/my', transactionController.getMyTransactions);
router.get('/my/purchases', transactionController.getMyPurchases);
router.get('/my/sales', transactionController.getMySales);

// Get specific transaction
router.get('/:id', transactionController.getTransactionById);

// Update transaction status (seller only)
router.put('/:id/status', [
    body('status').isIn(['completed', 'cancelled', 'refunded']),
    handleValidationErrors
], transactionController.updateTransactionStatus);

// Add tracking number (seller only)
router.put('/:id/tracking', [
    body('tracking_number').notEmpty(),
    handleValidationErrors
], transactionController.addTrackingNumber);

module.exports = router;