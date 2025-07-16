const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Public routes
router.get('/', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isInt(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('condition').optional().isIn(['new', 'like-new', 'good', 'fair', 'poor']),
    query('search').optional().isString(),
    query('sortBy').optional().isIn(['price', 'created_at', 'views']),
    query('order').optional().isIn(['asc', 'desc']),
    handleValidationErrors
], productController.getAllProducts);

router.get('/:id', productController.getProductById);
router.get('/seller/:sellerId', productController.getProductsBySeller);

// Protected routes
router.post('/', authenticateToken, [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']),
    body('category_id').isInt().withMessage('Category is required'),
    body('quantity').optional().isInt({ min: 1 }),
    body('image_url').optional().isURL().withMessage('Invalid image URL'),
    handleValidationErrors
], productController.createProduct);

router.put('/:id', authenticateToken, [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('condition').optional().isIn(['new', 'like-new', 'good', 'fair', 'poor']),
    body('category_id').optional().isInt(),
    body('quantity').optional().isInt({ min: 1 }),
    body('image_url').optional().isURL().withMessage('Invalid image URL'),
    handleValidationErrors
], productController.updateProduct);

router.delete('/:id', authenticateToken, productController.deleteProduct);

// Additional features - Move favorites routes to the end
router.get('/favorites/my', authenticateToken, productController.getMyFavorites);
router.post('/:id/favorite', authenticateToken, productController.toggleFavorite);

module.exports = router;