const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureStudent } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Lab = require('../models/Lab');
const LabSession = require('../models/LabSession');

// Student Dashboard
router.get('/dashboard', ensureAuthenticated, ensureStudent, async (req, res) => {
    try {
        // Get current day of week
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[new Date().getDay()];
        
        // Get available lab sessions for today
        const availableSessions = await LabSession.getAvailableByDay(currentDay);
        
        // Get student's recent attendance
        const recentAttendance = await Attendance.getByUserId(req.session.user.id);
        
        res.render('student/dashboard', {
            title: 'Student Dashboard',
            user: req.session.user,
            availableSessions,
            recentAttendance: recentAttendance.slice(0, 5), // Get only 5 most recent
            currentDay
        });
    } catch (error) {
        console.error('Error loading student dashboard:', error.message);
        req.session.error_msg = 'Error loading dashboard. Please try again.';
        res.render('student/dashboard', {
            title: 'Student Dashboard',
            user: req.session.user,
            availableSessions: [],
            recentAttendance: []
        });
    }
});

// Student Attendance Page
router.get('/attendance', ensureAuthenticated, ensureStudent, async (req, res) => {
    try {
        // Get student's attendance records
        const attendance = await Attendance.getByUserId(req.session.user.id);
        
        // Get all labs and sessions for mark attendance form
        const labs = await Lab.getAll();
        const labSessions = await LabSession.getAll();
        
        res.render('student/attendance', {
            title: 'My Attendance',
            user: req.session.user,
            attendance,
            labs,
            labSessions
        });
    } catch (error) {
        console.error('Error loading attendance page:', error.message);
        req.session.error_msg = 'Error loading attendance data. Please try again.';
        res.redirect('/student/dashboard');
    }
});

// Mark Attendance
router.post('/attendance/mark', ensureAuthenticated, ensureStudent, async (req, res) => {
    try {
        const { lab_id, lab_session_id } = req.body;
        
        // Basic validation
        if (!lab_id || !lab_session_id) {
            req.session.error_msg = 'Please select both lab and session';
            return res.redirect('/student/attendance');
        }
        
        // Get lab session to check if it's for today
        const labSession = await LabSession.getById(lab_session_id);
        
        if (!labSession) {
            req.session.error_msg = 'Invalid lab session selected';
            return res.redirect('/student/attendance');
        }
        
        // Check if the session is for today
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[new Date().getDay()];
        
        if (labSession.day_of_week !== currentDay) {
            req.session.error_msg = `Cannot mark attendance for ${labSession.day_of_week} session today (${currentDay})`;
            return res.redirect('/student/attendance');
        }
        
        // Check current time against session time
        const currentTime = new Date().toTimeString().slice(0, 5); // Format: HH:MM
        
        if (currentTime < labSession.start_time || currentTime > labSession.end_time) {
            req.session.error_msg = `Cannot mark attendance outside session hours (${labSession.start_time} - ${labSession.end_time})`;
            return res.redirect('/student/attendance');
        }
        
        // Mark attendance
        await Attendance.markAttendance({
            user_id: req.session.user.id,
            lab_id,
            lab_session_id
        });
        
        req.session.success_msg = 'Attendance marked successfully';
        res.redirect('/student/attendance');
    } catch (error) {
        console.error('Error marking attendance:', error.message);
        
        if (error.message === 'Attendance already marked for this session') {
            req.session.error_msg = error.message;
        } else {
            req.session.error_msg = 'Error marking attendance. Please try again.';
        }
        
        res.redirect('/student/attendance');
    }
});

// Delete Attendance Record
router.post('/attendance/delete/:id', ensureAuthenticated, ensureStudent, async (req, res) => {
    try {
        const attendanceId = req.params.id;
        
        // Delete attendance
        await Attendance.delete(attendanceId, req.session.user.id);
        
        req.session.success_msg = 'Attendance record deleted successfully';
        res.redirect('/student/attendance');
    } catch (error) {
        console.error('Error deleting attendance:', error.message);
        req.session.error_msg = error.message || 'Error deleting attendance record. Please try again.';
        res.redirect('/student/attendance');
    }
});

// Profile Page
router.get('/profile', ensureAuthenticated, ensureStudent, async (req, res) => {
    try {
        // Get fresh user data
        const user = await User.getById(req.session.user.id);
        
        if (!user) {
            req.session.error_msg = 'User not found';
            return res.redirect('/student/dashboard');
        }
        
        res.render('student/profile', {
            title: 'My Profile',
            user: user,
            formData: user
        });
    } catch (error) {
        console.error('Error loading profile page:', error.message);
        req.session.error_msg = 'Error loading profile data. Please try again.';
        res.redirect('/student/dashboard');
    }
});

// Update Profile
router.post('/profile/update', ensureAuthenticated, ensureStudent, async (req, res) => {
    try {
        const { name, email, student_id } = req.body;
        
        // Basic validation
        if (!name || !email || !student_id) {
            req.session.error_msg = 'Please fill in all fields';
            return res.redirect('/student/profile');
        }
        
        // Update user
        await User.update(req.session.user.id, {
            name,
            email,
            student_id
        });
        
        // Update session user data
        req.session.user.name = name;
        req.session.user.email = email;
        req.session.user.student_id = student_id;
        
        req.session.success_msg = 'Profile updated successfully';
        res.redirect('/student/profile');
    } catch (error) {
        console.error('Error updating profile:', error.message);
        req.session.error_msg = 'Error updating profile. Please try again.';
        res.redirect('/student/profile');
    }
});

// Change Password
router.post('/profile/change-password', ensureAuthenticated, ensureStudent, async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;
        
        // Basic validation
        if (!current_password || !new_password || !confirm_password) {
            req.session.error_msg = 'Please fill in all password fields';
            return res.redirect('/student/profile');
        }
        
        if (new_password !== confirm_password) {
            req.session.error_msg = 'New passwords do not match';
            return res.redirect('/student/profile');
        }
        
        if (new_password.length < 6) {
            req.session.error_msg = 'New password should be at least 6 characters';
            return res.redirect('/student/profile');
        }
        
        // Change password
        await User.changePassword(req.session.user.id, current_password, new_password);
        
        req.session.success_msg = 'Password changed successfully';
        res.redirect('/student/profile');
    } catch (error) {
        console.error('Error changing password:', error.message);
        req.session.error_msg = error.message || 'Error changing password. Please try again.';
        res.redirect('/student/profile');
    }
});

module.exports = router;
