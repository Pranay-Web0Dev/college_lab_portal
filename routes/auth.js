const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateUser } = require('../config/auth');
const { ensureNotAuthenticated } = require('../middleware/auth');

// Home/Login page
router.get('/', ensureNotAuthenticated, (req, res) => {
    res.render('auth', {
        title: 'Login',
    });
});

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role, studentId } = req.body;
        
        // Simple validation
        const errors = [];
        
        if (!name || !email || !password || !confirmPassword || !role) {
            errors.push('Please fill in all required fields');
        }
        
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        if (password.length < 6) {
            errors.push('Password should be at least 6 characters');
        }
        
        if (role === 'student' && !studentId) {
            errors.push('Student ID is required for student accounts');
        }
        
        // Check if email exists
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
            errors.push('Email is already registered');
        }
        
        // If there are errors, render the form again with errors
        if (errors.length > 0) {
            return res.render('auth', {
                title: 'Register',
                error_msg: errors.join(', '),
                name,
                email,
                role,
                studentId,
                showRegisterForm: true,
            });
        }
        
        // Create user
        const userData = { name, email, password, role, studentId };
        const user = await User.create(userData);
        
        // Set session
        req.session.user = user;
        req.session.success_msg = 'You are now registered and logged in';
        
        // Redirect based on role
        if (user.role === 'student') {
            res.redirect('/student/dashboard');
        } else {
            res.redirect('/teacher/dashboard');
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.render('auth', {
            title: 'Register',
            error_msg: 'An error occurred during registration. Please try again.',
            showRegisterForm: true,
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Simple validation
        if (!email || !password) {
            return res.render('auth', {
                title: 'Login',
                error_msg: 'Please provide both email and password',
                email,
            });
        }
        
        // Authenticate user
        const user = await authenticateUser(email, password);
        
        if (!user) {
            return res.render('auth', {
                title: 'Login',
                error_msg: 'Invalid email or password',
                email,
            });
        }
        
        // Set session
        req.session.user = user;
        
        // Redirect based on role
        if (user.role === 'student') {
            res.redirect('/student/dashboard');
        } else {
            res.redirect('/teacher/dashboard');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('auth', {
            title: 'Login',
            error_msg: 'An error occurred during login. Please try again.',
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

module.exports = router;