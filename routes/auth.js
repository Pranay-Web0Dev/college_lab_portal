const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authConfig = require('../config/auth');
const { ensureNotAuthenticated } = require('../middleware/auth');

// Home/Login page
router.get('/', ensureNotAuthenticated, (req, res) => {
    res.render('auth', {
        title: 'College Lab Portal - Login'
    });
});

// Login 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            req.session.error_msg = 'Please fill in all fields';
            return res.redirect('/');
        }
        
        // Authenticate user
        const user = await authConfig.authenticateUser(email, password);
        
        if (!user) {
            req.session.error_msg = 'Invalid email or password';
            return res.redirect('/');
        }
        
        // Set session
        req.session.user = user;
        
        // Redirect based on role
        if (user.role === 'student') {
            return res.redirect('/student/dashboard');
        } else if (user.role === 'teacher') {
            return res.redirect('/teacher/dashboard');
        } else {
            req.session.error_msg = 'Invalid user role';
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Login error:', error.message);
        req.session.error_msg = 'An error occurred during login. Please try again.';
        res.redirect('/');
    }
});

// Register 
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, password2, role, student_id } = req.body;
        
        // Basic validation
        if (!name || !email || !password || !password2 || !role) {
            req.session.error_msg = 'Please fill in all fields';
            return res.redirect('/');
        }
        
        if (password !== password2) {
            req.session.error_msg = 'Passwords do not match';
            return res.redirect('/');
        }
        
        if (password.length < 6) {
            req.session.error_msg = 'Password should be at least 6 characters';
            return res.redirect('/');
        }
        
        if (role === 'student' && !student_id) {
            req.session.error_msg = 'Student ID is required for student accounts';
            return res.redirect('/');
        }
        
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            student_id: role === 'student' ? student_id : null
        });
        
        // Set session
        req.session.user = user;
        req.session.success_msg = 'Registration successful! Welcome to College Lab Portal.';
        
        // Redirect based on role
        if (role === 'student') {
            return res.redirect('/student/dashboard');
        } else {
            return res.redirect('/teacher/dashboard');
        }
    } catch (error) {
        console.error('Registration error:', error.message);
        
        if (error.message === 'Email already in use') {
            req.session.error_msg = error.message;
        } else {
            req.session.error_msg = 'An error occurred during registration. Please try again.';
        }
        
        res.redirect('/');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

module.exports = router;
