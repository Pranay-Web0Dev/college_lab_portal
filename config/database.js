const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create connection pool for PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to execute SQL queries
async function query(sql, params = []) {
    try {
        // Convert MySQL-style queries to PostgreSQL (? to $1, $2, etc.)
        let pgSql = sql;
        let paramCount = 0;
        pgSql = pgSql.replace(/\?/g, () => `$${++paramCount}`);
        
        // Replace some MySQL specific syntax
        pgSql = pgSql.replace(/`/g, '"');
        
        const result = await pool.query(pgSql, params);
        return result.rows;
    } catch (error) {
        console.error('Database Error:', error.message);
        console.error('Query:', sql);
        console.error('Params:', params);
        throw error;
    }
}

// Test connection
pool.connect()
    .then(() => console.log('PostgreSQL connected successfully'))
    .catch(err => console.error('PostgreSQL connection failed:', err.message));

module.exports = pool;
module.exports.query = query;
