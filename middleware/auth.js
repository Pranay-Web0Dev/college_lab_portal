/**
 * Middleware to check if user is authenticated
 */
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    req.session.error_msg = 'Please log in to access this page';
    res.redirect('/');
}

/**
 * Middleware to check if user is a student
 */
function ensureStudent(req, res, next) {
    if (req.session.user && req.session.user.role === 'student') {
        return next();
    }
    req.session.error_msg = 'Access denied. Students only.';
    res.redirect('/');
}

/**
 * Middleware to check if user is a teacher
 */
function ensureTeacher(req, res, next) {
    if (req.session.user && req.session.user.role === 'teacher') {
        return next();
    }
    req.session.error_msg = 'Access denied. Teachers only.';
    res.redirect('/');
}

/**
 * Middleware to check if user is already logged in
 * (used to redirect away from login page)
 */
function ensureNotAuthenticated(req, res, next) {
    if (!req.session.user) {
        return next();
    }
    
    if (req.session.user.role === 'student') {
        res.redirect('/student/dashboard');
    } else if (req.session.user.role === 'teacher') {
        res.redirect('/teacher/dashboard');
    } else {
        res.redirect('/');
    }
}

module.exports = {
    ensureAuthenticated,
    ensureStudent,
    ensureTeacher,
    ensureNotAuthenticated
};