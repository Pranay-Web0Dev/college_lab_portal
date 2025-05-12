const dbModule = require('../config/database');

class LabSession {
    /**
     * Create a new lab session
     * @param {object} sessionData - Lab session data
     * @returns {Promise<object>} - Created lab session
     */
    static async create(sessionData) {
        try {
            const { lab_id, name, day_of_week, start_time, end_time, max_students } = sessionData;
            
            const query = `
                INSERT INTO lab_sessions (lab_id, name, day_of_week, start_time, end_time, max_students)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            
            const values = [lab_id, name, day_of_week, start_time, end_time, max_students];
            const result = await dbModule.query(query, values);
            
            return result[0];
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
            const query = `
                SELECT ls.*, l.name AS lab_name
                FROM lab_sessions ls
                JOIN labs l ON ls.lab_id = l.id
                ORDER BY ls.day_of_week, ls.start_time
            `;
            return await dbModule.query(query);
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
            const query = `
                SELECT * FROM lab_sessions
                WHERE lab_id = $1
                ORDER BY day_of_week, start_time
            `;
            return await dbModule.query(query, [labId]);
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
            const query = `
                SELECT ls.*, l.name AS lab_name
                FROM lab_sessions ls
                JOIN labs l ON ls.lab_id = l.id
                WHERE ls.id = $1
            `;
            const result = await dbModule.query(query, [id]);
            
            return result.length > 0 ? result[0] : null;
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
        try {
            const { name, day_of_week, start_time, end_time, max_students } = sessionData;
            
            const query = `
                UPDATE lab_sessions
                SET name = $1, day_of_week = $2, start_time = $3, end_time = $4, max_students = $5
                WHERE id = $6
                RETURNING id
            `;
            
            const values = [name, day_of_week, start_time, end_time, max_students, id];
            const result = await dbModule.query(query, values);
            
            return result.length > 0;
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
            // First check if there are any attendance records for this session
            const checkQuery = 'SELECT COUNT(*) as count FROM attendance WHERE lab_session_id = $1';
            const checkResult = await dbModule.query(checkQuery, [id]);
            
            if (checkResult[0].count > 0) {
                throw new Error('Cannot delete lab session with attendance records');
            }
            
            // No attendance records, safe to delete
            const query = 'DELETE FROM lab_sessions WHERE id = $1 RETURNING id';
            const result = await dbModule.query(query, [id]);
            
            return result.length > 0;
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
            const query = `
                SELECT ls.*, l.name AS lab_name, l.location
                FROM lab_sessions ls
                JOIN labs l ON ls.lab_id = l.id
                WHERE ls.day_of_week = $1
                ORDER BY ls.start_time
            `;
            return await dbModule.query(query, [day]);
        } catch (error) {
            console.error('Error getting available lab sessions by day:', error.message);
            throw error;
        }
    }

    /**
     * Get lab sessions for a specific day
     * @param {string} day - Day of week
     * @returns {Promise<Array>} - Array of lab sessions
     */
    static async getByDay(day) {
        try {
            const query = `
                SELECT ls.*, l.name AS lab_name, l.location,
                (
                    SELECT COUNT(*)
                    FROM attendance a
                    WHERE a.lab_session_id = ls.id
                    AND DATE(a.date) = CURRENT_DATE
                ) AS current_students
                FROM lab_sessions ls
                JOIN labs l ON ls.lab_id = l.id
                WHERE ls.day_of_week = $1
                ORDER BY ls.start_time
            `;
            return await dbModule.query(query, [day]);
        } catch (error) {
            console.error('Error getting lab sessions by day:', error.message);
            throw error;
        }
    }
}

module.exports = LabSession;