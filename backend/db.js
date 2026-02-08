import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path (configurable via environment variable)
const DB_PATH = process.env.DB_PATH || join(__dirname, 'jobs.db');

// Initialize SQL.js and database
let db;
let SQL;

async function initDatabase() {
  SQL = await initSqlJs();

  // Load existing database or create new one
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize schema
  db.run(`
    CREATE TABLE IF NOT EXISTS applied_jobs (
      job_id TEXT PRIMARY KEY,
      job_data TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS recommended_jobs (
      job_id TEXT PRIMARY KEY,
      job_data TEXT NOT NULL,
      recommended_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Save after schema creation
  saveDatabase();
}

/**
 * Save database to file
 */
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
}

/**
 * Get all applied job IDs
 */
export function getAppliedJobIds() {
  if (!db) {
    console.error('Database not initialized');
    return [];
  }

  const stmt = db.prepare('SELECT job_id FROM applied_jobs');
  const jobIds = [];

  while (stmt.step()) {
    const row = stmt.getAsObject();
    jobIds.push(row.job_id);
  }

  stmt.free();
  return jobIds;
}

/**
 * Get all applied jobs with full data
 */
export function getAppliedJobs() {
  if (!db) {
    console.error('Database not initialized');
    return [];
  }

  const stmt = db.prepare('SELECT job_id, job_data, applied_at FROM applied_jobs');
  const jobs = [];

  while (stmt.step()) {
    const row = stmt.getAsObject();
    jobs.push({
      jobId: row.job_id,
      jobData: JSON.parse(row.job_data),
      appliedAt: row.applied_at
    });
  }

  stmt.free();
  return jobs;
}

/**
 * Mark a job as applied (idempotent)
 * @param {string} jobId - Unique identifier for the job (URL)
 * @param {object} jobData - Full job payload
 */
export function markJobAsApplied(jobId, jobData) {
  if (!db) {
    console.error('Database not initialized');
    return false;
  }

  // Check if job already exists
  const checkStmt = db.prepare('SELECT job_id FROM applied_jobs WHERE job_id = ?');
  checkStmt.bind([jobId]);
  const exists = checkStmt.step();
  checkStmt.free();

  if (exists) {
    return false; // Already applied
  }

  // Insert new job
  const insertStmt = db.prepare(`
    INSERT INTO applied_jobs (job_id, job_data, applied_at)
    VALUES (?, ?, datetime('now'))
  `);
  insertStmt.bind([jobId, JSON.stringify(jobData)]);
  insertStmt.step();
  insertStmt.free();

  saveDatabase();
  return true; // New insertion
}

/**
 * Get all recommended job IDs
 */
export function getRecommendedJobIds() {
  if (!db) {
    console.error('Database not initialized');
    return [];
  }

  const stmt = db.prepare('SELECT job_id FROM recommended_jobs');
  const jobIds = [];

  while (stmt.step()) {
    const row = stmt.getAsObject();
    jobIds.push(row.job_id);
  }

  stmt.free();
  return jobIds;
}

/**
 * Get all recommended jobs with full data
 */
export function getRecommendedJobs() {
  if (!db) {
    console.error('Database not initialized');
    return [];
  }

  const stmt = db.prepare('SELECT job_id, job_data, recommended_at FROM recommended_jobs');
  const jobs = [];

  while (stmt.step()) {
    const row = stmt.getAsObject();
    jobs.push({
      jobId: row.job_id,
      jobData: JSON.parse(row.job_data),
      recommendedAt: row.recommended_at
    });
  }

  stmt.free();
  return jobs;
}


// Initialize database on module load
await initDatabase();

export default db;
