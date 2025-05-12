const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureTeacher } = require('../middleware/auth');
const User = require('../models/User');
const Lab = require('../models/Lab');
const LabSession = require('../models/LabSession');
const Attendance = require('../models/Attendance');

// Apply middleware to all routes in this router
router.use(ensureAuthenticated);
router.use(ensureTeacher);

// Teacher Dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Get the teacher's subject for filtering
        const teacherSubject = req.session.user.subject || null;
        
        // Get statistics for dashboard
        const stats = {
            totalStudents: await User.getAllStudents().then(students => students.length),
            totalLabs: await Lab.getAll().then(labs => labs.length),
            totalSessions: await LabSession.getAll().then(sessions => sessions.length),
            todayAttendance: 0, // Initialize with default
            pendingApprovals: 0 // Initialize pending approvals count
        };
        
        // Get today's date in the format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        // Get all attendance for today
        const todayAttendanceCount = await Attendance.getStatistics(today, today)
            .then(stats => stats.totalAttendance || 0);
        
        stats.todayAttendance = todayAttendanceCount;
        
        // Get pending approvals count
        const pendingApprovals = await Attendance.getPendingApprovals(teacherSubject);
        stats.pendingApprovals = pendingApprovals.length;
        
        // Get recent attendance records (limited to 10 for dashboard)
        const recentAttendance = await Attendance.getAll(10);
        
        // Get today's lab sessions
        const todaySessions = await LabSession.getByDay(getCurrentDay());
        
        res.render('teacher/dashboard', {
            title: 'Teacher Dashboard',
            stats,
            recentAttendance,
            todaySessions,
            subjectFilter: teacherSubject
        });
    } catch (error) {
        console.error('Error in teacher dashboard:', error);
        req.session.error_msg = 'Error loading dashboard data';
        res.redirect('/');
    }
});

// Manage Students
router.get('/students', async (req, res) => {
    try {
        const students = await User.getAllStudents();
        
        res.render('teacher/students', {
            title: 'Manage Students',
            students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        req.session.error_msg = 'Error loading student data';
        res.redirect('/teacher/dashboard');
    }
});

// Manage Labs
router.get('/labs', async (req, res) => {
    try {
        const labs = await Lab.getAll();
        
        res.render('teacher/labs', {
            title: 'Manage Labs',
            labs
        });
    } catch (error) {
        console.error('Error fetching labs:', error);
        req.session.error_msg = 'Error loading lab data';
        res.redirect('/teacher/dashboard');
    }
});

// Add New Lab
router.post('/labs/add', async (req, res) => {
    try {
        const { name, location, capacity, description } = req.body;
        
        // Simple validation
        if (!name || !location || !capacity) {
            req.session.error_msg = 'Please fill in all required fields';
            return res.redirect('/teacher/labs');
        }
        
        const labData = { name, location, capacity, description };
        await Lab.create(labData);
        
        req.session.success_msg = 'Lab added successfully';
        res.redirect('/teacher/labs');
    } catch (error) {
        console.error('Error adding lab:', error);
        req.session.error_msg = 'Error adding lab: ' + error.message;
        res.redirect('/teacher/labs');
    }
});

// Edit Lab
router.post('/labs/edit/:id', async (req, res) => {
    try {
        const labId = req.params.id;
        const { name, location, capacity, description } = req.body;
        
        // Simple validation
        if (!name || !location || !capacity) {
            req.session.error_msg = 'Please fill in all required fields';
            return res.redirect('/teacher/labs');
        }
        
        const labData = { name, location, capacity, description };
        const success = await Lab.update(labId, labData);
        
        if (success) {
            req.session.success_msg = 'Lab updated successfully';
        } else {
            req.session.error_msg = 'Lab not found or no changes made';
        }
        
        res.redirect('/teacher/labs');
    } catch (error) {
        console.error('Error updating lab:', error);
        req.session.error_msg = 'Error updating lab: ' + error.message;
        res.redirect('/teacher/labs');
    }
});

// Delete Lab
router.post('/labs/delete/:id', async (req, res) => {
    try {
        const labId = req.params.id;
        const success = await Lab.delete(labId);
        
        if (success) {
            req.session.success_msg = 'Lab deleted successfully';
        } else {
            req.session.error_msg = 'Lab not found or could not be deleted';
        }
        
        res.redirect('/teacher/labs');
    } catch (error) {
        console.error('Error deleting lab:', error);
        req.session.error_msg = 'Error deleting lab: ' + error.message;
        res.redirect('/teacher/labs');
    }
});

// Manage Lab Sessions
router.get('/sessions', async (req, res) => {
    try {
        const sessions = await LabSession.getAll();
        const labs = await Lab.getAll();
        
        res.render('teacher/sessions', {
            title: 'Manage Lab Sessions',
            sessions,
            labs
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        req.session.error_msg = 'Error loading session data';
        res.redirect('/teacher/dashboard');
    }
});

// Add New Lab Session
router.post('/sessions/add', async (req, res) => {
    try {
        const { labId, name, dayOfWeek, startTime, endTime, maxStudents } = req.body;
        
        // Simple validation
        if (!labId || !name || !dayOfWeek || !startTime || !endTime || !maxStudents) {
            req.session.error_msg = 'Please fill in all required fields';
            return res.redirect('/teacher/sessions');
        }
        
        const sessionData = {
            lab_id: labId,
            name,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            max_students: maxStudents
        };
        
        await LabSession.create(sessionData);
        
        req.session.success_msg = 'Lab session added successfully';
        res.redirect('/teacher/sessions');
    } catch (error) {
        console.error('Error adding session:', error);
        req.session.error_msg = 'Error adding session: ' + error.message;
        res.redirect('/teacher/sessions');
    }
});

// Edit Lab Session
router.post('/sessions/edit/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { name, dayOfWeek, startTime, endTime, maxStudents } = req.body;
        
        // Simple validation
        if (!name || !dayOfWeek || !startTime || !endTime || !maxStudents) {
            req.session.error_msg = 'Please fill in all required fields';
            return res.redirect('/teacher/sessions');
        }
        
        const sessionData = {
            name,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            max_students: maxStudents
        };
        
        const success = await LabSession.update(sessionId, sessionData);
        
        if (success) {
            req.session.success_msg = 'Lab session updated successfully';
        } else {
            req.session.error_msg = 'Lab session not found or no changes made';
        }
        
        res.redirect('/teacher/sessions');
    } catch (error) {
        console.error('Error updating session:', error);
        req.session.error_msg = 'Error updating session: ' + error.message;
        res.redirect('/teacher/sessions');
    }
});

// Delete Lab Session
router.post('/sessions/delete/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const success = await LabSession.delete(sessionId);
        
        if (success) {
            req.session.success_msg = 'Lab session deleted successfully';
        } else {
            req.session.error_msg = 'Lab session not found or could not be deleted';
        }
        
        res.redirect('/teacher/sessions');
    } catch (error) {
        console.error('Error deleting session:', error);
        req.session.error_msg = 'Error deleting session: ' + error.message;
        res.redirect('/teacher/sessions');
    }
});

// Manage Attendance
router.get('/attendance', async (req, res) => {
    try {
        const attendance = await Attendance.getAll();
        
        res.render('teacher/attendance', {
            title: 'Manage Attendance',
            attendance
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        req.session.error_msg = 'Error loading attendance data';
        res.redirect('/teacher/dashboard');
    }
});

// Pending Attendance Approvals
router.get('/attendance/pending', async (req, res) => {
    try {
        // If teacher has set a subject, filter approvals by subject
        const subject = req.session.user.subject || null;
        const pendingApprovals = await Attendance.getPendingApprovals(subject);
        
        res.render('teacher/pending-approvals', {
            title: 'Pending Attendance Approvals',
            pendingApprovals
        });
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        req.session.error_msg = 'Error loading pending approvals data';
        res.redirect('/teacher/attendance');
    }
});

// Approve Attendance
router.post('/attendance/approve/:id', async (req, res) => {
    try {
        const attendanceId = req.params.id;
        const teacherId = req.session.user.id;
        
        const success = await Attendance.approve(attendanceId, teacherId);
        
        if (success) {
            req.session.success_msg = 'Attendance has been approved successfully';
        } else {
            req.session.error_msg = 'Failed to approve attendance';
        }
        
        res.redirect('/teacher/attendance/pending');
    } catch (error) {
        console.error('Error approving attendance:', error);
        req.session.error_msg = 'Error during attendance approval: ' + error.message;
        res.redirect('/teacher/attendance/pending');
    }
});

// Reject Attendance
router.post('/attendance/reject/:id', async (req, res) => {
    try {
        const attendanceId = req.params.id;
        const teacherId = req.session.user.id;
        
        const success = await Attendance.reject(attendanceId, teacherId);
        
        if (success) {
            req.session.success_msg = 'Attendance has been rejected';
        } else {
            req.session.error_msg = 'Failed to reject attendance';
        }
        
        res.redirect('/teacher/attendance/pending');
    } catch (error) {
        console.error('Error rejecting attendance:', error);
        req.session.error_msg = 'Error during attendance rejection: ' + error.message;
        res.redirect('/teacher/attendance/pending');
    }
});

// View Attendance for a Specific Lab Session
router.get('/attendance/session/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await LabSession.getById(sessionId);
        
        if (!session) {
            req.session.error_msg = 'Lab session not found';
            return res.redirect('/teacher/attendance');
        }
        
        const attendance = await Attendance.getByLabSessionId(sessionId);
        const lab = await Lab.getById(session.lab_id);
        
        res.render('teacher/session-attendance', {
            title: `Attendance: ${session.name}`,
            session,
            lab,
            attendance
        });
    } catch (error) {
        console.error('Error fetching session attendance:', error);
        req.session.error_msg = 'Error loading attendance data for this session';
        res.redirect('/teacher/attendance');
    }
});

// Profile Page
router.get('/profile', async (req, res) => {
    try {
        const user = await User.getById(req.session.user.id);
        
        res.render('teacher/profile', {
            title: 'My Profile',
            formData: {
                name: user.name,
                email: user.email,
                subject: user.subject || ''
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        req.session.error_msg = 'Error loading profile data';
        res.redirect('/teacher/dashboard');
    }
});

// Update Profile
router.post('/profile/update', async (req, res) => {
    try {
        const { name, email, subject } = req.body;
        
        // Simple validation
        if (!name || !email) {
            req.session.error_msg = 'Please fill in all required fields';
            return res.redirect('/teacher/profile');
        }
        
        // Check if email is already used by another user
        const existingUser = await User.getByEmail(email);
        if (existingUser && existingUser.id !== req.session.user.id) {
            req.session.error_msg = 'Email is already in use by another account';
            return res.redirect('/teacher/profile');
        }
        
        // Update user data
        const userData = { name, email, subject };
        const success = await User.update(req.session.user.id, userData);
        
        if (success) {
            // Update session data
            req.session.user = {
                ...req.session.user,
                name,
                email,
                subject
            };
            
            req.session.success_msg = 'Profile updated successfully';
        } else {
            req.session.error_msg = 'Unable to update profile';
        }
        
        res.redirect('/teacher/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        req.session.error_msg = 'Error updating profile: ' + error.message;
        res.redirect('/teacher/profile');
    }
});

// Change Password
router.post('/profile/change-password', async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;
        
        // Simple validation
        if (!current_password || !new_password || !confirm_password) {
            req.session.error_msg = 'Please fill in all password fields';
            return res.redirect('/teacher/profile');
        }
        
        if (new_password.length < 6) {
            req.session.error_msg = 'New password must be at least 6 characters';
            return res.redirect('/teacher/profile');
        }
        
        if (new_password !== confirm_password) {
            req.session.error_msg = 'New passwords do not match';
            return res.redirect('/teacher/profile');
        }
        
        // Attempt to change password
        const success = await User.changePassword(req.session.user.id, current_password, new_password);
        
        if (success) {
            req.session.success_msg = 'Password changed successfully';
        } else {
            req.session.error_msg = 'Current password is incorrect';
        }
        
        res.redirect('/teacher/profile');
    } catch (error) {
        console.error('Error changing password:', error);
        req.session.error_msg = 'Error changing password: ' + error.message;
        res.redirect('/teacher/profile');
    }
});

// Helper function to get current day of the week
function getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

module.exports = router;