/**
 * Smart database layer that uses PostgreSQL in production (Render)
 * and SQLite for local development
 */

import dotenv from 'dotenv';
dotenv.config();

// Check if DATABASE_URL is set (indicates PostgreSQL/production)
const usePostgres = !!process.env.DATABASE_URL;

console.log(`Using ${usePostgres ? 'PostgreSQL' : 'SQLite'} database`);

// Import the appropriate database module
let dbModule;
if (usePostgres) {
  dbModule = await import('./db-postgres.js');
} else {
  dbModule = await import('./db-sqlite.js');
}

// Re-export all functions
export const {
  getAppliedJobIds,
  getAppliedJobs,
  markJobAsApplied,
  getRecommendedJobIds,
  getRecommendedJobs,
  default: db
} = dbModule;
