const dbModule = require('../config/database');

class Attendance {
    /**
     * Mark attendance for a user (pending approval)
     * @param {object} attendanceData - Attendance data
     * @returns {Promise<object>} - Created attendance record
     */
    static async markAttendance(attendanceData) {
        try {
            const { user_id, lab_id, lab_session_id } = attendanceData;
            
            // Check if this user already has attendance for this session on this date
            const checkQuery = `
                SELECT id FROM attendance
                WHERE user_id = $1 AND lab_session_id = $2 AND DATE(date) = CURRENT_DATE
            `;
            
            const checkResult = await dbModule.query(checkQuery, [user_id, lab_session_id]);
            
            if (checkResult.length > 0) {
                throw new Error('Attendance already marked for this session today');
            }
            
            // Mark attendance as not approved initially
            const insertQuery = `
                INSERT INTO attendance (user_id, lab_id, lab_session_id, approved)
                VALUES ($1, $2, $3, false)
                RETURNING *
            `;
            
            const result = await dbModule.query(insertQuery, [user_id, lab_id, lab_session_id]);
            
            return result[0];
        } catch (error) {
            console.error('Error marking attendance:', error.message);
            throw error;
        }
    }

    /**
     * Get attendance by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Array>} - Array of attendance records
     */
    static async getByUserId(userId) {
        try {
            const query = `
                SELECT a.*, l.name AS lab_name, ls.name AS session_name, 
                       ls.day_of_week, ls.start_time, ls.end_time
                FROM attendance a
                JOIN labs l ON a.lab_id = l.id
                JOIN lab_sessions ls ON a.lab_session_id = ls.id
                WHERE a.user_id = $1
                ORDER BY a.date DESC
            `;
            
            return await dbModule.query(query, [userId]);
        } catch (error) {
            console.error('Error getting attendance by user ID:', error.message);
            throw error;
        }
    }

    /**
     * Delete attendance record
     * @param {number} id - Attendance record ID
     * @param {number} userId - User ID (for validation)
     * @returns {Promise<boolean>} - Success status
     */
    static async delete(id, userId) {
        try {
            const query = 'DELETE FROM attendance WHERE id = $1 AND user_id = $2 RETURNING id';
            const result = await dbModule.query(query, [id, userId]);
            
            return result.length > 0;
        } catch (error) {
            console.error('Error deleting attendance:', error.message);
            throw error;
        }
    }

    /**
     * Get attendance by lab session ID
     * @param {number} labSessionId - Lab session ID
     * @returns {Promise<Array>} - Array of attendance records with user details
     */
    static async getByLabSessionId(labSessionId) {
        try {
            const query = `
                SELECT a.*, u.name AS student_name, u.email, u.student_id
                FROM attendance a
                JOIN users u ON a.user_id = u.id
                WHERE a.lab_session_id = $1
                ORDER BY a.date DESC
            `;
            
            return await dbModule.query(query, [labSessionId]);
        } catch (error) {
            console.error('Error getting attendance by lab session ID:', error.message);
            throw error;
        }
    }

    /**
     * Get attendance statistics by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<object>} - Attendance statistics
     */
    static async getStatistics(startDate, endDate) {
        try {
            const query = `
                SELECT 
                    COUNT(*) AS total_attendance,
                    COUNT(DISTINCT user_id) AS unique_students,
                    COUNT(DISTINCT lab_session_id) AS unique_sessions
                FROM attendance
                WHERE DATE(date) BETWEEN $1 AND $2
            `;
            
            const result = await dbModule.query(query, [startDate, endDate]);
            
            return {
                totalAttendance: parseInt(result[0].total_attendance),
                uniqueStudents: parseInt(result[0].unique_students),
                uniqueSessions: parseInt(result[0].unique_sessions)
            };
        } catch (error) {
            console.error('Error getting attendance statistics:', error.message);
            throw error;
        }
    }

    /**
     * Get all attendance records, optionally limited
     * @param {number} limit - Optional limit of records to return
     * @returns {Promise<Array>} - Array of attendance records
     */
    static async getAll(limit = null) {
        try {
            let query = `
                SELECT a.*, u.name AS student_name, l.name AS lab_name, ls.name AS session_name
                FROM attendance a
                JOIN users u ON a.user_id = u.id
                JOIN labs l ON a.lab_id = l.id
                JOIN lab_sessions ls ON a.lab_session_id = ls.id
                ORDER BY a.date DESC
            `;
            
            if (limit) {
                query += ` LIMIT ${limit}`;
            }
            
            return await dbModule.query(query);
        } catch (error) {
            console.error('Error getting all attendance records:', error.message);
            throw error;
        }
    }

    /**
     * Get pending attendance records that need approval
     * @param {string} subject - Optional subject filter for teachers
     * @returns {Promise<Array>} - Array of pending attendance records
     */
    static async getPendingApprovals(subject = null) {
        try {
            let query = `
                SELECT a.*, u.name AS student_name, u.student_id, u.email,
                       l.name AS lab_name, ls.name AS session_name, ls.day_of_week,
                       t.subject AS teacher_subject
                FROM attendance a
                JOIN users u ON a.user_id = u.id
                JOIN labs l ON a.lab_id = l.id
                JOIN lab_sessions ls ON a.lab_session_id = ls.id
                JOIN users t ON t.role = 'teacher' AND t.subject IS NOT NULL
                WHERE a.approved = false
            `;
            
            // Add subject filter if provided
            if (subject) {
                query += ` AND t.subject = $1`;
            }
            
            query += ` ORDER BY a.date DESC`;
            
            if (subject) {
                return await dbModule.query(query, [subject]);
            } else {
                return await dbModule.query(query);
            }
        } catch (error) {
            console.error('Error getting pending approvals:', error.message);
            throw error;
        }
    }
    
    /**
     * Approve an attendance record
     * @param {number} id - Attendance record ID
     * @param {number} teacherId - Teacher ID (for validation)
     * @returns {Promise<boolean>} - Success status
     */
    static async approve(id, teacherId) {
        try {
            const query = `
                UPDATE attendance
                SET approved = true
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await dbModule.query(query, [id]);
            return result.length > 0;
        } catch (error) {
            console.error('Error approving attendance:', error.message);
            throw error;
        }
    }
    
    /**
     * Reject an attendance record (delete it)
     * @param {number} id - Attendance record ID
     * @param {number} teacherId - Teacher ID (for validation)
     * @returns {Promise<boolean>} - Success status
     */
    static async reject(id, teacherId) {
        try {
            const query = 'DELETE FROM attendance WHERE id = $1 RETURNING id';
            const result = await dbModule.query(query, [id]);
            
            return result.length > 0;
        } catch (error) {
            console.error('Error rejecting attendance:', error.message);
            throw error;
        }
    }
}

module.exports = Attendance;