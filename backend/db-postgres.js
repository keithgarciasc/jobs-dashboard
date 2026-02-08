import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create PostgreSQL connection pool
// Only use SSL for remote databases (not localhost)
const isLocalDb = process.env.DATABASE_URL?.includes('localhost');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.DATABASE_URL && !isLocalDb) ? {
    rejectUnauthorized: false
  } : false
});

/**
 * Initialize database schema
 */
async function initDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        is_guest BOOLEAN DEFAULT FALSE,
        login_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP
      )
    `);

    // Create recommended_jobs table (shared by all users)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recommended_jobs (
        job_id TEXT PRIMARY KEY,
        job_data JSONB NOT NULL,
        recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create applied_jobs table with user_id
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applied_jobs (
        id SERIAL PRIMARY KEY,
        job_id TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        job_data JSONB NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, user_id)
      )
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_applied_jobs_user_id ON applied_jobs(user_id)
    `);

    // Create default owner account (if not exists)
    await pool.query(`
      INSERT INTO users (username, password, display_name, is_guest)
      VALUES ('owner', 'changeme123', 'Keith', FALSE)
      ON CONFLICT (username) DO NOTHING
    `);

    // Create guest account (if not exists)
    await pool.query(`
      INSERT INTO users (username, password, display_name, is_guest)
      VALUES ('guest', 'guest', 'Guest Cowpoke', TRUE)
      ON CONFLICT (username) DO NOTHING
    `);

    console.log('✓ PostgreSQL database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Authenticate user and track login
 */
export async function authenticateUser(username, password) {
  try {
    const result = await pool.query(
      'SELECT id, username, display_name, is_guest FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Update login count and last login time
      await pool.query(
        'UPDATE users SET login_count = login_count + 1, last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      return user;
    }

    return null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const result = await pool.query(
      'SELECT id, username, display_name, is_guest, login_count FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Get login analytics
 */
export async function getLoginAnalytics() {
  try {
    const result = await pool.query(
      'SELECT username, display_name, is_guest, login_count, last_login_at FROM users ORDER BY login_count DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting login analytics:', error);
    return [];
  }
}

/**
 * Get all applied job IDs for a specific user
 */
export async function getAppliedJobIds(userId) {
  try {
    const result = await pool.query(
      'SELECT job_id FROM applied_jobs WHERE user_id = $1',
      [userId]
    );
    return result.rows.map(row => row.job_id);
  } catch (error) {
    console.error('Error getting applied job IDs:', error);
    return [];
  }
}

/**
 * Get all applied jobs with full data for a specific user
 */
export async function getAppliedJobs(userId) {
  try {
    const result = await pool.query(
      'SELECT job_id, job_data, applied_at FROM applied_jobs WHERE user_id = $1 ORDER BY applied_at DESC',
      [userId]
    );
    return result.rows.map(row => ({
      jobId: row.job_id,
      jobData: row.job_data,
      appliedAt: row.applied_at
    }));
  } catch (error) {
    console.error('Error getting applied jobs:', error);
    return [];
  }
}

/**
 * Mark a job as applied (idempotent) for a specific user
 * @param {string} jobId - Unique identifier for the job (URL)
 * @param {object} jobData - Full job payload
 * @param {number} userId - User ID
 */
export async function markJobAsApplied(jobId, jobData, userId) {
  try {
    const result = await pool.query(
      `INSERT INTO applied_jobs (job_id, job_data, user_id, applied_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (job_id, user_id) DO NOTHING
       RETURNING id`,
      [jobId, JSON.stringify(jobData), userId]
    );
    return result.rowCount > 0; // Returns true if new insertion, false if already existed
  } catch (error) {
    console.error('Error marking job as applied:', error);
    return false;
  }
}

/**
 * Get all recommended job IDs
 */
export async function getRecommendedJobIds() {
  try {
    const result = await pool.query('SELECT job_id FROM recommended_jobs');
    return result.rows.map(row => row.job_id);
  } catch (error) {
    console.error('Error getting recommended job IDs:', error);
    return [];
  }
}

/**
 * Get all recommended jobs with full data
 */
export async function getRecommendedJobs() {
  try {
    const result = await pool.query(
      'SELECT job_id, job_data, recommended_at FROM recommended_jobs ORDER BY recommended_at DESC'
    );
    return result.rows.map(row => ({
      jobId: row.job_id,
      jobData: row.job_data,
      recommendedAt: row.recommended_at
    }));
  } catch (error) {
    console.error('Error getting recommended jobs:', error);
    return [];
  }
}

/**
 * Add a job to recommended jobs (for testing/admin)
 * @param {string} jobId - Unique identifier for the job (URL)
 * @param {object} jobData - Full job payload
 */
export async function addRecommendedJob(jobId, jobData) {
  try {
    const result = await pool.query(
      `INSERT INTO recommended_jobs (job_id, job_data, recommended_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (job_id) DO NOTHING
       RETURNING job_id`,
      [jobId, JSON.stringify(jobData)]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error adding recommended job:', error);
    return false;
  }
}

// Initialize database on module load
await initDatabase();

export default pool;
