const db = require('../config/database');

class Attendance {
    /**
     * Mark attendance for a user
     * @param {object} attendanceData - Attendance data
     * @returns {Promise<object>} - Created attendance record
     */
    static async markAttendance(attendanceData) {
        const { user_id, lab_id, lab_session_id, date = new Date() } = attendanceData;
        
        try {
            // Check if attendance already marked for this session
            const existingAttendance = await db.query(
                'SELECT * FROM attendance WHERE user_id = ? AND lab_session_id = ? AND DATE(date) = DATE(?)',
                [user_id, lab_session_id, date]
            );
            
            if (existingAttendance.length > 0) {
                throw new Error('Attendance already marked for this session');
            }
            
            // Insert new attendance record
            const result = await db.query(
                'INSERT INTO attendance (user_id, lab_id, lab_session_id, date) VALUES (?, ?, ?, ?)',
                [user_id, lab_id, lab_session_id, date]
            );
            
            return {
                id: result.insertId,
                user_id,
                lab_id,
                lab_session_id,
                date
            };
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
            return await db.query(`
                SELECT a.id, a.date, l.name as lab_name, ls.name as session_name, ls.start_time, ls.end_time
                FROM attendance a
                JOIN labs l ON a.lab_id = l.id
                JOIN lab_sessions ls ON a.lab_session_id = ls.id
                WHERE a.user_id = ?
                ORDER BY a.date DESC
            `, [userId]);
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
            // Verify that the attendance record belongs to the user
            const [attendance] = await db.query('SELECT * FROM attendance WHERE id = ?', [id]);
            
            if (!attendance) {
                throw new Error('Attendance record not found');
            }
            
            if (attendance.user_id !== userId) {
                throw new Error('Unauthorized to delete this attendance record');
            }
            
            await db.query('DELETE FROM attendance WHERE id = ?', [id]);
            
            return true;
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
            return await db.query(`
                SELECT a.id, a.date, u.id as user_id, u.name as user_name, u.student_id
                FROM attendance a
                JOIN users u ON a.user_id = u.id
                WHERE a.lab_session_id = ?
                ORDER BY a.date DESC
            `, [labSessionId]);
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
            const attendanceData = await db.query(`
                SELECT l.name as lab_name, COUNT(a.id) as attendance_count
                FROM attendance a
                JOIN labs l ON a.lab_id = l.id
                WHERE a.date BETWEEN ? AND ?
                GROUP BY l.name
            `, [startDate, endDate]);
            
            const userAttendance = await db.query(`
                SELECT u.name as user_name, u.student_id, COUNT(a.id) as attendance_count
                FROM attendance a
                JOIN users u ON a.user_id = u.id
                WHERE a.date BETWEEN ? AND ? AND u.role = 'student'
                GROUP BY u.id
                ORDER BY attendance_count DESC
            `, [startDate, endDate]);
            
            return {
                labAttendance: attendanceData,
                userAttendance: userAttendance
            };
        } catch (error) {
            console.error('Error getting attendance statistics:', error.message);
            throw error;
        }
    }
}

module.exports = Attendance;
