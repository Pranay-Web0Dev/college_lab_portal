const dbModule = require('../config/database');
const { hashPassword } = require('../config/auth');

class User {
    /**
     * Create a new user
     * @param {object} userData - User data object
     * @returns {Promise<object>} - Created user object
     */
    static async create(userData) {
        try {
            // Hash password
            const hashedPassword = await hashPassword(userData.password);
            
            // Handle different properties based on role
            const params = [
                userData.name,
                userData.email,
                hashedPassword,
                userData.role
            ];
            
            let query = `
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;

            // Add student_id if role is student
            if (userData.role === 'student' && userData.studentId) {
                query = `
                    INSERT INTO users (name, email, password, role, student_id)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `;
                params.push(userData.studentId);
            }

            const result = await dbModule.query(query, params);
            const user = result[0];
            
            // Don't return password to client
            delete user.password;
            
            return user;
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
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await dbModule.query(query, [id]);
            
            if (result.length === 0) {
                return null;
            }
            
            const user = result[0];
            delete user.password;
            
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error.message);
            throw error;
        }
    }
    
    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise<object|null>} - User object or null
     */
    static async getByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await dbModule.query(query, [email]);
            
            if (result.length === 0) {
                return null;
            }
            
            return result[0]; // Include password for authentication
        } catch (error) {
            console.error('Error getting user by email:', error.message);
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
            const allowedFields = ['name', 'email', 'student_id', 'subject'];
            const fields = [];
            const values = [];
            let paramCount = 1;

            // Build dynamic query based on provided fields
            for (const field of allowedFields) {
                if (field in userData) {
                    fields.push(`${field} = $${paramCount++}`);
                    values.push(userData[field]);
                }
            }

            if (fields.length === 0) {
                return true; // Nothing to update
            }

            values.push(id);
            
            const query = `
                UPDATE users
                SET ${fields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING id
            `;

            const result = await dbModule.query(query, values);
            return result.length > 0;
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
            const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
            const result = await dbModule.query(query, [id]);
            return result.length > 0;
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
            const query = `
                SELECT id, name, email, student_id, created_at
                FROM users
                WHERE role = 'student'
                ORDER BY name
            `;
            return await dbModule.query(query);
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
            // Import password handling functions
            const { comparePassword, hashPassword } = require('../config/auth');
            
            // First, get the user with current password hash
            const getUserQuery = 'SELECT password FROM users WHERE id = $1';
            const userResult = await dbModule.query(getUserQuery, [id]);
            
            if (userResult.length === 0) {
                return false;
            }
            
            const user = userResult[0];
            
            // Verify old password
            const isMatch = await comparePassword(oldPassword, user.password);
            if (!isMatch) {
                return false;
            }
            
            // Update to new password
            const hashedPassword = await hashPassword(newPassword);
            const updateQuery = 'UPDATE users SET password = $1 WHERE id = $2 RETURNING id';
            const result = await dbModule.query(updateQuery, [hashedPassword, id]);
            
            return result.length > 0;
        } catch (error) {
            console.error('Error changing password:', error.message);
            throw error;
        }
    }
}

module.exports = User;