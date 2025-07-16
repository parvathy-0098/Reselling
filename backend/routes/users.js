const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes
router.get('/:id/profile', userController.getPublicProfile);
router.get('/:id/products', userController.getUserProducts);
router.get('/:id/reviews', userController.getUserReviews);

// Protected routes
router.use(authenticateToken);

// User management (admin only)
router.get('/', authorizeRole('admin'), userController.getAllUsers);
router.put('/:id/status', authorizeRole('admin'), userController.updateUserStatus);

// Messages
router.post('/messages', userController.sendMessage);
router.get('/messages', userController.getMessages);
router.put('/messages/:id/read', userController.markMessageAsRead);

module.exports = router;