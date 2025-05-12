const bcrypt = require('bcryptjs');
const dbModule = require('./database');

/**
 * Hash a password
 * @param {string} password - The plain password
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash
 * @param {string} password - The plain password
 * @param {string} hash - The hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Authenticate a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object|null>} - User object or null if authentication fails
 */
async function authenticateUser(email, password) {
    // Get user by email directly using database query
    const query = 'SELECT * FROM users WHERE email = $1';
    const users = await dbModule.query(query, [email]);
    
    if (users.length === 0) {
        return null;
    }
    
    const user = users[0];
    const isMatch = await comparePassword(password, user.password);
    
    if (!isMatch) {
        return null;
    }
    
    // Don't include password in returned object
    delete user.password;
    return user;
}

module.exports = {
    hashPassword,
    comparePassword,
    authenticateUser
};