const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Register route
router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    handleValidationErrors
], authController.register);

// Login route
router.post('/login', [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
], authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

router.put('/profile', authenticateToken, [
    body('full_name').notEmpty().withMessage('Full name is required'),
    handleValidationErrors
], authController.updateProfile);

router.post('/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    handleValidationErrors
], authController.changePassword);

module.exports = router;
