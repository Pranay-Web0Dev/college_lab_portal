const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureTeacher } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Lab = require('../models/Lab');
const LabSession = require('../models/LabSession');

// Teacher Dashboard
router.get('/dashboard', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        // Get counts for dashboard
        const students = await User.getAllStudents();
        const studentCount = students.length;
        
        const labs = await Lab.getAll();
        const labCount = labs.length;
        
        const labSessions = await LabSession.getAll();
        const sessionCount = labSessions.length;
        
        // Get attendance statistics for current month
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const stats = await Attendance.getStatistics(firstDayOfMonth, lastDayOfMonth);
        
        res.render('teacher/dashboard', {
            title: 'Teacher Dashboard',
            user: req.session.user,
            studentCount,
            labCount,
            sessionCount,
            stats
        });
    } catch (error) {
        console.error('Error loading teacher dashboard:', error.message);
        req.session.error_msg = 'Error loading dashboard. Please try again.';
        res.render('teacher/dashboard', {
            title: 'Teacher Dashboard',
            user: req.session.user,
            studentCount: 0,
            labCount: 0,
            sessionCount: 0,
            stats: { labAttendance: [], userAttendance: [] }
        });
    }
});

// Students Management Page
router.get('/students', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const students = await User.getAllStudents();
        
        res.render('teacher/students', {
            title: 'Student Management',
            user: req.session.user,
            students
        });
    } catch (error) {
        console.error('Error loading students page:', error.message);
        req.session.error_msg = 'Error loading student data. Please try again.';
        res.redirect('/teacher/dashboard');
    }
});

// View Student Details
router.get('/students/:id', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Get student data
        const student = await User.getById(studentId);
        
        if (!student || student.role !== 'student') {
            req.session.error_msg = 'Student not found';
            return res.redirect('/teacher/students');
        }
        
        // Get student's attendance
        const attendance = await Attendance.getByUserId(studentId);
        
        res.render('teacher/student-details', {
            title: `Student: ${student.name}`,
            user: req.session.user,
            student,
            attendance
        });
    } catch (error) {
        console.error('Error loading student details:', error.message);
        req.session.error_msg = 'Error loading student details. Please try again.';
        res.redirect('/teacher/students');
    }
});

// Delete Student
router.post('/students/delete/:id', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Delete student
        await User.delete(studentId);
        
        req.session.success_msg = 'Student deleted successfully';
        res.redirect('/teacher/students');
    } catch (error) {
        console.error('Error deleting student:', error.message);
        req.session.error_msg = error.message || 'Error deleting student. Please try again.';
        res.redirect('/teacher/students');
    }
});

// Create Student
router.post('/students/create', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const { name, email, password, student_id } = req.body;
        
        // Basic validation
        if (!name || !email || !password || !student_id) {
            req.session.error_msg = 'Please fill in all fields';
            return res.redirect('/teacher/students');
        }
        
        // Create student
        await User.create({
            name,
            email,
            password,
            role: 'student',
            student_id
        });
        
        req.session.success_msg = 'Student created successfully';
        res.redirect('/teacher/students');
    } catch (error) {
        console.error('Error creating student:', error.message);
        
        if (error.message === 'Email already in use') {
            req.session.error_msg = error.message;
        } else {
            req.session.error_msg = 'Error creating student. Please try again.';
        }
        
        res.redirect('/teacher/students');
    }
});

// Attendance Management Page
router.get('/attendance', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        // Get all lab sessions
        const labSessions = await LabSession.getAll();
        
        // Default to first session if available
        const selectedSessionId = req.query.session_id || (labSessions.length > 0 ? labSessions[0].id : null);
        
        // Get attendance for selected session
        let attendanceData = [];
        if (selectedSessionId) {
            attendanceData = await Attendance.getByLabSessionId(selectedSessionId);
        }
        
        res.render('teacher/attendance', {
            title: 'Attendance Management',
            user: req.session.user,
            labSessions,
            selectedSessionId,
            attendanceData
        });
    } catch (error) {
        console.error('Error loading attendance page:', error.message);
        req.session.error_msg = 'Error loading attendance data. Please try again.';
        res.redirect('/teacher/dashboard');
    }
});

// Labs Management Page
router.get('/labs', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        // Get all labs
        const labs = await Lab.getAll();
        
        res.render('teacher/labs', {
            title: 'Lab Management',
            user: req.session.user,
            labs
        });
    } catch (error) {
        console.error('Error loading labs page:', error.message);
        req.session.error_msg = 'Error loading lab data. Please try again.';
        res.redirect('/teacher/dashboard');
    }
});

// Create Lab
router.post('/labs/create', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const { name, location, capacity, description } = req.body;
        
        // Basic validation
        if (!name || !location || !capacity) {
            req.session.error_msg = 'Please fill in all required fields';
            return res.redirect('/teacher/labs');
        }
        
        // Create lab
        await Lab.create({
            name,
            location,
            capacity,
            description: description || ''
        });
        
        req.session.success_msg = 'Lab created successfully';
        res.redirect('/teacher/labs');
    } catch (error) {
        console.error('Error creating lab:', error.message);
        
        if (error.message === 'Lab with this name already exists') {
            req.session.error_msg = error.message;
        } else {
            req.session.error_msg = 'Error creating lab. Please try again.';
        }
        
        res.redirect('/teacher/labs');
    }
});

// Update Lab
router.post('/labs/update/:id', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const labId = req.params.id;
        const { name, location, capacity, description } = req.body;
        
        // Basic validation
        if (!name || !location || !capacity) {
            req.session.error_msg = 'Please fill in all required fields';
            return res.redirect('/teacher/labs');
        }
        
        // Update lab
        await Lab.update(labId, {
            name,
            location,
            capacity,
            description: description || ''
        });
        
        req.session.success_msg = 'Lab updated successfully';
        res.redirect('/teacher/labs');
    } catch (error) {
        console.error('Error updating lab:', error.message);
        req.session.error_msg = error.message || 'Error updating lab. Please try again.';
        res.redirect('/teacher/labs');
    }
});

// Delete Lab
router.post('/labs/delete/:id', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const labId = req.params.id;
        
        // Delete lab
        await Lab.delete(labId);
        
        req.session.success_msg = 'Lab deleted successfully';
        res.redirect('/teacher/labs');
    } catch (error) {
        console.error('Error deleting lab:', error.message);
        req.session.error_msg = error.message || 'Error deleting lab. Please try again.';
        res.redirect('/teacher/labs');
    }
});

// Lab Sessions Management Page
router.get('/labs/:id/sessions', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const labId = req.params.id;
        
        // Get lab details
        const lab = await Lab.getById(labId);
        
        if (!lab) {
            req.session.error_msg = 'Lab not found';
            return res.redirect('/teacher/labs');
        }
        
        // Get lab sessions
        const sessions = await LabSession.getByLabId(labId);
        
        res.render('teacher/lab-sessions', {
            title: `Sessions for ${lab.name}`,
            user: req.session.user,
            lab,
            sessions
        });
    } catch (error) {
        console.error('Error loading lab sessions page:', error.message);
        req.session.error_msg = 'Error loading lab session data. Please try again.';
        res.redirect('/teacher/labs');
    }
});

// Create Lab Session
router.post('/labs/:id/sessions/create', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const labId = req.params.id;
        const { name, day_of_week, start_time, end_time, max_students } = req.body;
        
        // Basic validation
        if (!name || !day_of_week || !start_time || !end_time || !max_students) {
            req.session.error_msg = 'Please fill in all fields';
            return res.redirect(`/teacher/labs/${labId}/sessions`);
        }
        
        // Create lab session
        await LabSession.create({
            lab_id: labId,
            name,
            day_of_week,
            start_time,
            end_time,
            max_students
        });
        
        req.session.success_msg = 'Lab session created successfully';
        res.redirect(`/teacher/labs/${labId}/sessions`);
    } catch (error) {
        console.error('Error creating lab session:', error.message);
        req.session.error_msg = error.message || 'Error creating lab session. Please try again.';
        res.redirect(`/teacher/labs/${req.params.id}/sessions`);
    }
});

// Update Lab Session
router.post('/labs/:labId/sessions/update/:id', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const labId = req.params.labId;
        const sessionId = req.params.id;
        const { name, day_of_week, start_time, end_time, max_students } = req.body;
        
        // Basic validation
        if (!name || !day_of_week || !start_time || !end_time || !max_students) {
            req.session.error_msg = 'Please fill in all fields';
            return res.redirect(`/teacher/labs/${labId}/sessions`);
        }
        
        // Update lab session
        await LabSession.update(sessionId, {
            lab_id: labId,
            name,
            day_of_week,
            start_time,
            end_time,
            max_students
        });
        
        req.session.success_msg = 'Lab session updated successfully';
        res.redirect(`/teacher/labs/${labId}/sessions`);
    } catch (error) {
        console.error('Error updating lab session:', error.message);
        req.session.error_msg = error.message || 'Error updating lab session. Please try again.';
        res.redirect(`/teacher/labs/${req.params.labId}/sessions`);
    }
});

// Delete Lab Session
router.post('/labs/:labId/sessions/delete/:id', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const labId = req.params.labId;
        const sessionId = req.params.id;
        
        // Delete lab session
        await LabSession.delete(sessionId);
        
        req.session.success_msg = 'Lab session deleted successfully';
        res.redirect(`/teacher/labs/${labId}/sessions`);
    } catch (error) {
        console.error('Error deleting lab session:', error.message);
        req.session.error_msg = error.message || 'Error deleting lab session. Please try again.';
        res.redirect(`/teacher/labs/${req.params.labId}/sessions`);
    }
});

// Profile Page
router.get('/profile', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        // Get fresh user data
        const user = await User.getById(req.session.user.id);
        
        if (!user) {
            req.session.error_msg = 'User not found';
            return res.redirect('/teacher/dashboard');
        }
        
        res.render('student/profile', { // Reuse student profile template
            title: 'My Profile',
            user: user,
            formData: user,
            isTeacher: true
        });
    } catch (error) {
        console.error('Error loading profile page:', error.message);
        req.session.error_msg = 'Error loading profile data. Please try again.';
        res.redirect('/teacher/dashboard');
    }
});

// Update Profile
router.post('/profile/update', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        // Basic validation
        if (!name || !email) {
            req.session.error_msg = 'Please fill in all required fields';
            return res.redirect('/teacher/profile');
        }
        
        // Update user
        await User.update(req.session.user.id, {
            name,
            email,
            student_id: null
        });
        
        // Update session user data
        req.session.user.name = name;
        req.session.user.email = email;
        
        req.session.success_msg = 'Profile updated successfully';
        res.redirect('/teacher/profile');
    } catch (error) {
        console.error('Error updating profile:', error.message);
        req.session.error_msg = 'Error updating profile. Please try again.';
        res.redirect('/teacher/profile');
    }
});

// Change Password
router.post('/profile/change-password', ensureAuthenticated, ensureTeacher, async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;
        
        // Basic validation
        if (!current_password || !new_password || !confirm_password) {
            req.session.error_msg = 'Please fill in all password fields';
            return res.redirect('/teacher/profile');
        }
        
        if (new_password !== confirm_password) {
            req.session.error_msg = 'New passwords do not match';
            return res.redirect('/teacher/profile');
        }
        
        if (new_password.length < 6) {
            req.session.error_msg = 'New password should be at least 6 characters';
            return res.redirect('/teacher/profile');
        }
        
        // Change password
        await User.changePassword(req.session.user.id, current_password, new_password);
        
        req.session.success_msg = 'Password changed successfully';
        res.redirect('/teacher/profile');
    } catch (error) {
        console.error('Error changing password:', error.message);
        req.session.error_msg = error.message || 'Error changing password. Please try again.';
        res.redirect('/teacher/profile');
    }
});

module.exports = router;
