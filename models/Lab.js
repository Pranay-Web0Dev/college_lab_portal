const db = require('../config/database');

class Lab {
    /**
     * Create a new lab
     * @param {object} labData - Lab data
     * @returns {Promise<object>} - Created lab
     */
    static async create(labData) {
        const { name, location, capacity, description } = labData;
        
        try {
            // Check if lab with same name already exists
            const existingLab = await db.query('SELECT * FROM labs WHERE name = ?', [name]);
            
            if (existingLab.length > 0) {
                throw new Error('Lab with this name already exists');
            }
            
            // Create lab
            const result = await db.query(
                'INSERT INTO labs (name, location, capacity, description) VALUES (?, ?, ?, ?)',
                [name, location, capacity, description]
            );
            
            return {
                id: result.insertId,
                name,
                location,
                capacity,
                description
            };
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
            return await db.query('SELECT * FROM labs');
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
            const [lab] = await db.query('SELECT * FROM labs WHERE id = ?', [id]);
            return lab || null;
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
        const { name, location, capacity, description } = labData;
        
        try {
            // Check if lab exists
            const [lab] = await db.query('SELECT * FROM labs WHERE id = ?', [id]);
            
            if (!lab) {
                throw new Error('Lab not found');
            }
            
            // Check if lab name is being changed and if new name conflicts
            if (name !== lab.name) {
                const conflictLab = await db.query('SELECT * FROM labs WHERE name = ? AND id != ?', [name, id]);
                
                if (conflictLab.length > 0) {
                    throw new Error('Lab with this name already exists');
                }
            }
            
            // Update lab
            await db.query(
                'UPDATE labs SET name = ?, location = ?, capacity = ?, description = ? WHERE id = ?',
                [name, location, capacity, description, id]
            );
            
            return true;
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
            // Check if lab has associated lab sessions
            const labSessions = await db.query('SELECT * FROM lab_sessions WHERE lab_id = ?', [id]);
            
            if (labSessions.length > 0) {
                throw new Error('Cannot delete lab that has associated lab sessions');
            }
            
            // Check if lab has associated attendance records
            const attendance = await db.query('SELECT * FROM attendance WHERE lab_id = ?', [id]);
            
            if (attendance.length > 0) {
                throw new Error('Cannot delete lab that has associated attendance records');
            }
            
            // Delete lab
            await db.query('DELETE FROM labs WHERE id = ?', [id]);
            
            return true;
        } catch (error) {
            console.error('Error deleting lab:', error.message);
            throw error;
        }
    }
}

module.exports = Lab;
