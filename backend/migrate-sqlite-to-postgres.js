/**
 * Migration script to copy data from SQLite to PostgreSQL
 *
 * Usage:
 *   node scripts/migrate-sqlite-to-postgres.js
 *
 * Make sure to set DATABASE_URL environment variable for PostgreSQL connection
 */

import initSqlJs from 'sql.js';
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../backend/.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const SQLITE_DB_PATH = join(__dirname, '../backend/jobs.db');
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable not set!');
  console.error('');
  console.error('Set it to your Render PostgreSQL connection string:');
  console.error('');
  console.error('Windows (PowerShell):');
  console.error('  $env:DATABASE_URL="postgres://user:password@host:port/database"');
  console.error('  node scripts/migrate-sqlite-to-postgres.js');
  console.error('');
  console.error('Windows (CMD):');
  console.error('  set DATABASE_URL=postgres://user:password@host:port/database');
  console.error('  node scripts\\migrate-sqlite-to-postgres.js');
  console.error('');
  console.error('Linux/Mac:');
  console.error('  DATABASE_URL="postgres://..." node scripts/migrate-sqlite-to-postgres.js');
  process.exit(1);
}

if (!existsSync(SQLITE_DB_PATH)) {
  console.error(`❌ ERROR: SQLite database not found at: ${SQLITE_DB_PATH}`);
  console.error('');
  console.error('Make sure you have a jobs.db file in the backend directory.');
  process.exit(1);
}

console.log('🚀 SQLite to PostgreSQL Migration');
console.log('==================================');
console.log(`📂 SQLite DB: ${SQLITE_DB_PATH}`);
console.log(`📡 PostgreSQL: ${POSTGRES_URL.substring(0, 30)}...`);
console.log('');

async function migrate() {
  let sqliteDb;
  let pgPool;

  try {
    // Initialize SQLite
    console.log('📖 Reading SQLite database...');
    const SQL = await initSqlJs();
    const buffer = readFileSync(SQLITE_DB_PATH);
    sqliteDb = new SQL.Database(buffer);

    // Connect to PostgreSQL
    console.log('🔌 Connecting to PostgreSQL...');
    pgPool = new pg.Pool({
      connectionString: POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test PostgreSQL connection
    await pgPool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connection successful');
    console.log('');

    // Initialize PostgreSQL schema
    console.log('📋 Initializing PostgreSQL schema...');
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS applied_jobs (
        job_id TEXT PRIMARY KEY,
        job_data JSONB NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS recommended_jobs (
        job_id TEXT PRIMARY KEY,
        job_data JSONB NOT NULL,
        recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Schema initialized');
    console.log('');

    // Migrate applied_jobs
    console.log('📦 Migrating applied_jobs...');
    const appliedStmt = sqliteDb.prepare('SELECT job_id, job_data, applied_at FROM applied_jobs');
    let appliedCount = 0;
    let appliedSkipped = 0;

    while (appliedStmt.step()) {
      const row = appliedStmt.getAsObject();
      try {
        const result = await pgPool.query(
          `INSERT INTO applied_jobs (job_id, job_data, applied_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (job_id) DO NOTHING
           RETURNING job_id`,
          [row.job_id, row.job_data, row.applied_at]
        );

        if (result.rowCount > 0) {
          appliedCount++;
          process.stdout.write(`\r   Migrated: ${appliedCount} jobs`);
        } else {
          appliedSkipped++;
        }
      } catch (error) {
        console.error(`\n⚠️  Error migrating job ${row.job_id}:`, error.message);
      }
    }
    appliedStmt.free();
    console.log(`\n✅ Applied jobs: ${appliedCount} migrated, ${appliedSkipped} skipped (already exist)`);
    console.log('');

    // Migrate recommended_jobs
    console.log('📦 Migrating recommended_jobs...');
    const recommendedStmt = sqliteDb.prepare('SELECT job_id, job_data, recommended_at FROM recommended_jobs');
    let recommendedCount = 0;
    let recommendedSkipped = 0;

    while (recommendedStmt.step()) {
      const row = recommendedStmt.getAsObject();
      try {
        const result = await pgPool.query(
          `INSERT INTO recommended_jobs (job_id, job_data, recommended_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (job_id) DO NOTHING
           RETURNING job_id`,
          [row.job_id, row.job_data, row.recommended_at]
        );

        if (result.rowCount > 0) {
          recommendedCount++;
          process.stdout.write(`\r   Migrated: ${recommendedCount} jobs`);
        } else {
          recommendedSkipped++;
        }
      } catch (error) {
        console.error(`\n⚠️  Error migrating job ${row.job_id}:`, error.message);
      }
    }
    recommendedStmt.free();
    console.log(`\n✅ Recommended jobs: ${recommendedCount} migrated, ${recommendedSkipped} skipped (already exist)`);
    console.log('');

    // Summary
    console.log('🎉 Migration Complete!');
    console.log('=======================');
    console.log(`✅ Applied jobs: ${appliedCount} new, ${appliedSkipped} existing`);
    console.log(`✅ Recommended jobs: ${recommendedCount} new, ${recommendedSkipped} existing`);
    console.log('');
    console.log('Your PostgreSQL database is now ready! 🚀');

    // Close connections
    sqliteDb.close();
    await pgPool.end();

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);

    if (sqliteDb) sqliteDb.close();
    if (pgPool) await pgPool.end();

    process.exit(1);
  }
}

migrate();
