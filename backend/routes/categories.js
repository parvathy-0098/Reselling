const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/products', categoryController.getCategoryProducts);

// Admin routes
router.post('/', authenticateToken, authorizeRole('admin'), categoryController.createCategory);
router.put('/:id', authenticateToken, authorizeRole('admin'), categoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRole('admin'), categoryController.deleteCategory);

module.exports = router;