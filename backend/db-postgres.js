import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});

/**
 * Initialize database schema
 */
async function initDatabase() {
  try {
    // Create applied_jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applied_jobs (
        job_id TEXT PRIMARY KEY,
        job_data JSONB NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create recommended_jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recommended_jobs (
        job_id TEXT PRIMARY KEY,
        job_data JSONB NOT NULL,
        recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ PostgreSQL database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get all applied job IDs
 */
export async function getAppliedJobIds() {
  try {
    const result = await pool.query('SELECT job_id FROM applied_jobs');
    return result.rows.map(row => row.job_id);
  } catch (error) {
    console.error('Error getting applied job IDs:', error);
    return [];
  }
}

/**
 * Get all applied jobs with full data
 */
export async function getAppliedJobs() {
  try {
    const result = await pool.query(
      'SELECT job_id, job_data, applied_at FROM applied_jobs ORDER BY applied_at DESC'
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
 * Mark a job as applied (idempotent)
 * @param {string} jobId - Unique identifier for the job (URL)
 * @param {object} jobData - Full job payload
 */
export async function markJobAsApplied(jobId, jobData) {
  try {
    const result = await pool.query(
      `INSERT INTO applied_jobs (job_id, job_data, applied_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (job_id) DO NOTHING
       RETURNING job_id`,
      [jobId, JSON.stringify(jobData)]
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
