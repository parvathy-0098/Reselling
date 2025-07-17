const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const userController = {
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Basic validation
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Create new user
            const user = await User.create({ username, email, password });
            
            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                user: { id: user.id, username: user.username, email: user.email },
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Validate password
            const isValid = await User.validatePassword(password, user.password);
            if (!isValid) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                user: { id: user.id, username: user.username, email: user.email },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    async getProfile(req, res) {
        try {
            res.json({ user: req.user });
        } catch (error) {
            console.error('Profile error:', error);
            res.status(500).json({ error: 'Failed to get profile' });
        }
    }
};

module.exports = userController;