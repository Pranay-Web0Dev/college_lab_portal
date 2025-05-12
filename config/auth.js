const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
    const user = await User.getByEmail(email);
    if (!user) {
        return null;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return null;
    }

    return user;
}

module.exports = {
    hashPassword,
    comparePassword,
    authenticateUser
};