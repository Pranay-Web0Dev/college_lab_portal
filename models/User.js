const db = require('../config/database');
const authConfig = require('../config/auth');

class User {
    /**
     * Create a new user
     * @param {object} userData - User data object
     * @returns {Promise<object>} - Created user object
     */
    static async create(userData) {
        const { name, email, password, role, student_id = null } = userData;
        
        try {
            // First check if email already exists
            const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            
            if (existingUser.length > 0) {
                throw new Error('Email already in use');
            }
            
            // Hash password
            const hashedPassword = await authConfig.hashPassword(password);
            
            // Create user in database
            const result = await db.query(
                'INSERT INTO users (name, email, password, role, student_id) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, role, student_id]
            );
            
            // Return created user (without password)
            const createdUser = {
                id: result.insertId,
                name,
                email,
                role,
                student_id
            };
            
            return createdUser;
        } catch (error) {
            console.error('Error creating user:', error.message);
            throw error;
        }
    }
    
    /**
     * Get user by ID
     * @param {number} id - User ID
     * @returns {Promise<object|null>} - User object or null
     */
    static async getById(id) {
        try {
            const [user] = await db.query('SELECT id, name, email, role, student_id FROM users WHERE id = ?', [id]);
            return user || null;
        } catch (error) {
            console.error('Error getting user by ID:', error.message);
            throw error;
        }
    }
    
    /**
     * Update a user
     * @param {number} id - User ID
     * @param {object} userData - User data to update
     * @returns {Promise<boolean>} - Success status
     */
    static async update(id, userData) {
        try {
            const { name, email, student_id } = userData;
            
            await db.query(
                'UPDATE users SET name = ?, email = ?, student_id = ? WHERE id = ?',
                [name, email, student_id, id]
            );
            
            return true;
        } catch (error) {
            console.error('Error updating user:', error.message);
            throw error;
        }
    }
    
    /**
     * Delete a user
     * @param {number} id - User ID
     * @returns {Promise<boolean>} - Success status
     */
    static async delete(id) {
        try {
            // First delete related attendance records
            await db.query('DELETE FROM attendance WHERE user_id = ?', [id]);
            
            // Then delete user
            await db.query('DELETE FROM users WHERE id = ?', [id]);
            
            return true;
        } catch (error) {
            console.error('Error deleting user:', error.message);
            throw error;
        }
    }
    
    /**
     * Get all students
     * @returns {Promise<Array>} - Array of student users
     */
    static async getAllStudents() {
        try {
            return await db.query('SELECT id, name, email, student_id FROM users WHERE role = "student"');
        } catch (error) {
            console.error('Error getting all students:', error.message);
            throw error;
        }
    }
    
    /**
     * Change password
     * @param {number} id - User ID
     * @param {string} oldPassword - Old password
     * @param {string} newPassword - New password
     * @returns {Promise<boolean>} - Success status
     */
    static async changePassword(id, oldPassword, newPassword) {
        try {
            // Get user with password
            const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
            
            if (!user) {
                throw new Error('User not found');
            }
            
            // Verify old password
            const isMatch = await authConfig.comparePassword(oldPassword, user.password);
            
            if (!isMatch) {
                throw new Error('Current password is incorrect');
            }
            
            // Hash new password
            const hashedPassword = await authConfig.hashPassword(newPassword);
            
            // Update password
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
            
            return true;
        } catch (error) {
            console.error('Error changing password:', error.message);
            throw error;
        }
    }
}

module.exports = User;
