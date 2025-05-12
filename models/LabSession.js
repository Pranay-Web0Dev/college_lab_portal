const db = require('../config/database');

class LabSession {
    /**
     * Create a new lab session
     * @param {object} sessionData - Lab session data
     * @returns {Promise<object>} - Created lab session
     */
    static async create(sessionData) {
        const { lab_id, name, day_of_week, start_time, end_time, max_students } = sessionData;
        
        try {
            // Check if lab exists
            const [lab] = await db.query('SELECT * FROM labs WHERE id = ?', [lab_id]);
            
            if (!lab) {
                throw new Error('Lab not found');
            }
            
            // Check for time conflicts
            const conflicts = await db.query(`
                SELECT * FROM lab_sessions 
                WHERE lab_id = ? 
                AND day_of_week = ? 
                AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))
            `, [lab_id, day_of_week, start_time, start_time, end_time, end_time, start_time, end_time]);
            
            if (conflicts.length > 0) {
                throw new Error('Time conflict with another lab session');
            }
            
            // Create lab session
            const result = await db.query(
                'INSERT INTO lab_sessions (lab_id, name, day_of_week, start_time, end_time, max_students) VALUES (?, ?, ?, ?, ?, ?)',
                [lab_id, name, day_of_week, start_time, end_time, max_students]
            );
            
            return {
                id: result.insertId,
                lab_id,
                name,
                day_of_week,
                start_time,
                end_time,
                max_students
            };
        } catch (error) {
            console.error('Error creating lab session:', error.message);
            throw error;
        }
    }
    
    /**
     * Get all lab sessions
     * @returns {Promise<Array>} - Array of lab sessions with lab info
     */
    static async getAll() {
        try {
            return await db.query(`
                SELECT ls.*, l.name as lab_name, l.location
                FROM lab_sessions ls
                JOIN labs l ON ls.lab_id = l.id
                ORDER BY ls.day_of_week, ls.start_time
            `);
        } catch (error) {
            console.error('Error getting all lab sessions:', error.message);
            throw error;
        }
    }
    
    /**
     * Get lab sessions by lab ID
     * @param {number} labId - Lab ID
     * @returns {Promise<Array>} - Array of lab sessions
     */
    static async getByLabId(labId) {
        try {
            return await db.query(`
                SELECT ls.*, l.name as lab_name, l.location
                FROM lab_sessions ls
                JOIN labs l ON ls.lab_id = l.id
                WHERE ls.lab_id = ?
                ORDER BY ls.day_of_week, ls.start_time
            `, [labId]);
        } catch (error) {
            console.error('Error getting lab sessions by lab ID:', error.message);
            throw error;
        }
    }
    
    /**
     * Get lab session by ID
     * @param {number} id - Lab session ID
     * @returns {Promise<object|null>} - Lab session object or null
     */
    static async getById(id) {
        try {
            const [session] = await db.query(`
                SELECT ls.*, l.name as lab_name, l.location, l.capacity
                FROM lab_sessions ls
                JOIN labs l ON ls.lab_id = l.id
                WHERE ls.id = ?
            `, [id]);
            
            return session || null;
        } catch (error) {
            console.error('Error getting lab session by ID:', error.message);
            throw error;
        }
    }
    
    /**
     * Update a lab session
     * @param {number} id - Lab session ID
     * @param {object} sessionData - Lab session data to update
     * @returns {Promise<boolean>} - Success status
     */
    static async update(id, sessionData) {
        const { lab_id, name, day_of_week, start_time, end_time, max_students } = sessionData;
        
        try {
            // Check if lab session exists
            const [session] = await db.query('SELECT * FROM lab_sessions WHERE id = ?', [id]);
            
            if (!session) {
                throw new Error('Lab session not found');
            }
            
            // Check if lab exists
            const [lab] = await db.query('SELECT * FROM labs WHERE id = ?', [lab_id]);
            
            if (!lab) {
                throw new Error('Lab not found');
            }
            
            // Check for time conflicts with other sessions
            const conflicts = await db.query(`
                SELECT * FROM lab_sessions 
                WHERE lab_id = ? 
                AND day_of_week = ? 
                AND id != ?
                AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))
            `, [lab_id, day_of_week, id, start_time, start_time, end_time, end_time, start_time, end_time]);
            
            if (conflicts.length > 0) {
                throw new Error('Time conflict with another lab session');
            }
            
            // Update lab session
            await db.query(
                'UPDATE lab_sessions SET lab_id = ?, name = ?, day_of_week = ?, start_time = ?, end_time = ?, max_students = ? WHERE id = ?',
                [lab_id, name, day_of_week, start_time, end_time, max_students, id]
            );
            
            return true;
        } catch (error) {
            console.error('Error updating lab session:', error.message);
            throw error;
        }
    }
    
    /**
     * Delete a lab session
     * @param {number} id - Lab session ID
     * @returns {Promise<boolean>} - Success status
     */
    static async delete(id) {
        try {
            // Check if lab session has attendance records
            const attendance = await db.query('SELECT * FROM attendance WHERE lab_session_id = ?', [id]);
            
            if (attendance.length > 0) {
                throw new Error('Cannot delete lab session that has attendance records');
            }
            
            // Delete lab session
            await db.query('DELETE FROM lab_sessions WHERE id = ?', [id]);
            
            return true;
        } catch (error) {
            console.error('Error deleting lab session:', error.message);
            throw error;
        }
    }
    
    /**
     * Get available lab sessions for a specific day
     * @param {string} day - Day of week
     * @returns {Promise<Array>} - Array of available lab sessions
     */
    static async getAvailableByDay(day) {
        try {
            return await db.query(`
                SELECT ls.*, l.name as lab_name, l.location,
                (SELECT COUNT(*) FROM attendance a WHERE a.lab_session_id = ls.id AND DATE(a.date) = CURDATE()) as current_attendance
                FROM lab_sessions ls
                JOIN labs l ON ls.lab_id = l.id
                WHERE ls.day_of_week = ?
                HAVING current_attendance < ls.max_students
                ORDER BY ls.start_time
            `, [day]);
        } catch (error) {
            console.error('Error getting available lab sessions by day:', error.message);
            throw error;
        }
    }
}

module.exports = LabSession;
