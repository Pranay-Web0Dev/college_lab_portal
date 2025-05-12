const dbModule = require('../config/database');

class Lab {
    /**
     * Create a new lab
     * @param {object} labData - Lab data
     * @returns {Promise<object>} - Created lab
     */
    static async create(labData) {
        try {
            const { name, location, capacity, description } = labData;
            
            const query = `
                INSERT INTO labs (name, location, capacity, description)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const values = [name, location, capacity, description || null];
            const result = await db.query(query, values);
            
            return result[0];
        } catch (error) {
            console.error('Error creating lab:', error.message);
            throw error;
        }
    }

    /**
     * Get all labs
     * @returns {Promise<Array>} - Array of labs
     */
    static async getAll() {
        try {
            const query = 'SELECT * FROM labs ORDER BY name';
            return await dbModule.query(query);
        } catch (error) {
            console.error('Error getting all labs:', error.message);
            throw error;
        }
    }

    /**
     * Get lab by ID
     * @param {number} id - Lab ID
     * @returns {Promise<object|null>} - Lab object or null
     */
    static async getById(id) {
        try {
            const query = 'SELECT * FROM labs WHERE id = $1';
            const result = await dbModule.query(query, [id]);
            
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting lab by ID:', error.message);
            throw error;
        }
    }

    /**
     * Update a lab
     * @param {number} id - Lab ID
     * @param {object} labData - Lab data to update
     * @returns {Promise<boolean>} - Success status
     */
    static async update(id, labData) {
        try {
            const { name, location, capacity, description } = labData;
            
            const query = `
                UPDATE labs
                SET name = $1, location = $2, capacity = $3, description = $4
                WHERE id = $5
                RETURNING id
            `;
            
            const values = [name, location, capacity, description || null, id];
            const result = await dbModule.query(query, values);
            
            return result.length > 0;
        } catch (error) {
            console.error('Error updating lab:', error.message);
            throw error;
        }
    }

    /**
     * Delete a lab
     * @param {number} id - Lab ID
     * @returns {Promise<boolean>} - Success status
     */
    static async delete(id) {
        try {
            // First check if there are any lab sessions for this lab
            const checkQuery = 'SELECT COUNT(*) as count FROM lab_sessions WHERE lab_id = $1';
            const checkResult = await dbModule.query(checkQuery, [id]);
            
            if (checkResult[0].count > 0) {
                throw new Error('Cannot delete lab with existing sessions');
            }
            
            // No sessions, safe to delete
            const query = 'DELETE FROM labs WHERE id = $1 RETURNING id';
            const result = await dbModule.query(query, [id]);
            
            return result.length > 0;
        } catch (error) {
            console.error('Error deleting lab:', error.message);
            throw error;
        }
    }
}

module.exports = Lab;