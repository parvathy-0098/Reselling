const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getOne } = require('../config/database');

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone, address, city, state, zip_code } = req.body;

        // Check if user already exists
        const existingUser = await getOne(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await runQuery(
            `INSERT INTO users (username, email, password, full_name, phone, address, city, state, zip_code) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, full_name, phone, address, city, state, zip_code]
        );

        // Get the created user
        const user = await getOne('SELECT * FROM users WHERE id = ?', [result.id]);
        delete user.password;

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await getOne(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await runQuery(
            'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        delete user.password;

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await getOne(
            'SELECT * FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        delete user.password;

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { full_name, phone, address, city, state, zip_code } = req.body;
        const userId = req.user.id;

        await runQuery(
            `UPDATE users 
             SET full_name = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [full_name, phone, address, city, state, zip_code, userId]
        );

        const updatedUser = await getOne('SELECT * FROM users WHERE id = ?', [userId]);
        delete updatedUser.password;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user with password
        const user = await getOne('SELECT password FROM users WHERE id = ?', [userId]);

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await runQuery(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};