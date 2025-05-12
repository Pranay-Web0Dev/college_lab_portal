const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureStudent } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const LabSession = require('../models/LabSession');
const Lab = require('../models/Lab');

// Apply middleware to all routes in this router
router.use(ensureAuthenticated);
router.use(ensureStudent);

// Student Dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Get attendance data
        const attendanceData = await Attendance.getByUserId(req.session.user.id);
        
        // Calculate attendance statistics
        const attendanceStats = {
            total: attendanceData.length,
            rate: attendanceData.length > 0 ? Math.round((attendanceData.length / 10) * 100) : 0 // Placeholder calculation
        };
        
        // Get upcoming lab sessions (example implementation)
        const upcomingSessions = await LabSession.getAvailableByDay(getCurrentDay());
        
        // Get recent attendance (last 5)
        const recentAttendance = attendanceData.slice(0, 5);
        
        res.render('student/dashboard', {
            title: 'Student Dashboard',
            attendance: attendanceStats,
            recentAttendance,
            upcomingSessions
        });
    } catch (error) {
        console.error('Error in student dashboard:', error);
        req.session.error_msg = 'Error loading dashboard data';
        res.redirect('/');
    }
});

// View All Attendance
router.get('/attendance', async (req, res) => {
    try {
        const attendanceData = await Attendance.getByUserId(req.session.user.id);
        
        res.render('student/attendance', {
            title: 'My Attendance',
            attendance: attendanceData
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        req.session.error_msg = 'Error loading attendance data';
        res.redirect('/student/dashboard');
    }
});

// View Available Lab Sessions
router.get('/labs', async (req, res) => {
    try {
        const labs = await Lab.getAll();
        
        // For each lab, get its sessions
        for (const lab of labs) {
            lab.sessions = await LabSession.getByLabId(lab.id);
        }
        
        res.render('student/labs', {
            title: 'Available Labs',
            labs
        });
    } catch (error) {
        console.error('Error fetching labs:', error);
        req.session.error_msg = 'Error loading lab data';
        res.redirect('/student/dashboard');
    }
});

// Mark Attendance
router.post('/mark-attendance', async (req, res) => {
    try {
        const { labSessionId, labId } = req.body;
        
        if (!labSessionId || !labId) {
            req.session.error_msg = 'Missing required information';
            return res.redirect('/student/labs');
        }
        
        const attendanceData = {
            user_id: req.session.user.id,
            lab_session_id: labSessionId,
            lab_id: labId
        };
        
        await Attendance.markAttendance(attendanceData);
        
        req.session.success_msg = 'Attendance marked successfully';
        res.redirect('/student/attendance');
    } catch (error) {
        console.error('Error marking attendance:', error);
        req.session.error_msg = 'Error marking attendance: ' + error.message;
        res.redirect('/student/labs');
    }
});

// Delete Attendance Record
router.post('/delete-attendance/:id', async (req, res) => {
    try {
        const attendanceId = req.params.id;
        const userId = req.session.user.id;
        
        const result = await Attendance.delete(attendanceId, userId);
        
        if (result) {
            req.session.success_msg = 'Attendance record deleted successfully';
        } else {
            req.session.error_msg = 'Unable to delete attendance record';
        }
        
        res.redirect('/student/attendance');
    } catch (error) {
        console.error('Error deleting attendance:', error);
        req.session.error_msg = 'Error deleting attendance record';
        res.redirect('/student/attendance');
    }
});

// Helper function to get current day of the week
function getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

module.exports = router;