import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAppliedJobIds, markJobAsApplied, getAppliedJobs, getRecommendedJobs, addRecommendedJob } from './db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Configure CORS to allow frontend domain
const allowedOrigins = [
  'http://localhost:3000',
  'https://jobs-dashboard-frontend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// API Routes

/**
 * GET /api/jobs
 * Returns jobs from recommended_jobs table with applied status
 * Local territories: last 10 local jobs
 * Frontier & remote trails: last 10 remote jobs
 * Quick draw and side hustles: last 5 side gig jobs
 */
app.get('/api/jobs', (req, res) => {
  try {
    // Get all recommended jobs
    const recommendedJobs = getRecommendedJobs();
    const appliedIds = new Set(getAppliedJobIds());

    // Convert to jobs with full data and applied status
    const allJobs = recommendedJobs.map(item => ({
      ...item.jobData,
      id: item.jobId,
      isApplied: appliedIds.has(item.jobId),
      recommendedAt: item.recommendedAt
    }));

    // Sort by recommendedAt (most recent first)
    allJobs.sort((a, b) => new Date(b.recommendedAt) - new Date(a.recommendedAt));

    // Organize by section with limits
    const jobsWithStatus = {
      local_charleston: allJobs
        .filter(job => job.source === 'local_charleston')
        .slice(0, 10),
      remote_other: allJobs
        .filter(job => job.source === 'remote_other')
        .slice(0, 10),
      side_gigs: allJobs
        .filter(job => job.source === 'side_gigs')
        .slice(0, 5)
    };

    res.json(jobsWithStatus);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to load jobs data' });
  }
});

/**
 * POST /api/apply
 * Mark a job as applied
 * Body: { jobId: string, jobData: object }
 */
app.post('/api/apply', (req, res) => {
  try {
    const { jobId, jobData } = req.body;

    if (!jobId || !jobData) {
      return res.status(400).json({ error: 'jobId and jobData are required' });
    }

    const wasNew = markJobAsApplied(jobId, jobData);

    res.json({
      success: true,
      message: wasNew ? 'Job marked as applied' : 'Job was already applied',
      wasNew
    });
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(500).json({ error: 'Failed to mark job as applied' });
  }
});

/**
 * GET /api/applied
 * Get all applied jobs
 */
app.get('/api/applied', (req, res) => {
  try {
    const appliedJobs = getAppliedJobs();
    res.json(appliedJobs);
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    res.status(500).json({ error: 'Failed to load applied jobs' });
  }
});

/**
 * GET /api/recommended
 * Get recommended jobs that are NOT in applied_jobs
 * Organized by section (local_charleston, remote_other, side_gigs)
 */
app.get('/api/recommended', (req, res) => {
  try {
    // Get all recommended jobs
    const recommendedJobs = getRecommendedJobs();

    // Get applied job IDs to exclude them
    const appliedIds = new Set(getAppliedJobIds());

    // Filter out applied jobs only
    const filteredJobs = recommendedJobs
      .filter(item => !appliedIds.has(item.jobId))
      .map(item => ({
        ...item.jobData,
        id: item.jobId,
        isApplied: false,
        recommendedAt: item.recommendedAt
      }))
      .sort((a, b) => new Date(b.recommendedAt) - new Date(a.recommendedAt));

    // Organize by section
    const organizedJobs = {
      local_charleston: filteredJobs.filter(job => job.source === 'local_charleston'),
      remote_other: filteredJobs.filter(job => job.source === 'remote_other'),
      side_gigs: filteredJobs.filter(job => job.source === 'side_gigs')
    };

    res.json(organizedJobs);
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({ error: 'Failed to load recommended jobs' });
  }
});

/**
 * POST /api/admin/recommend
 * Add a job to the recommended_jobs table
 * Body: { jobId: string, jobData: object } or { jobs: array }
 *
 * Single job:
 * { "jobId": "https://...", "jobData": {...} }
 *
 * Multiple jobs:
 * { "jobs": [{"jobId": "...", "jobData": {...}}, ...] }
 */
app.post('/api/admin/recommend', async (req, res) => {
  try {
    const { jobId, jobData, jobs } = req.body;

    // Bulk import
    if (jobs && Array.isArray(jobs)) {
      let added = 0;
      let skipped = 0;

      for (const job of jobs) {
        if (!job.jobId || !job.jobData) {
          skipped++;
          continue;
        }
        const wasNew = await addRecommendedJob(job.jobId, job.jobData);
        if (wasNew) added++;
        else skipped++;
      }

      return res.json({
        success: true,
        message: `Processed ${jobs.length} jobs: ${added} added, ${skipped} skipped`,
        added,
        skipped
      });
    }

    // Single job
    if (!jobId || !jobData) {
      return res.status(400).json({ error: 'jobId and jobData are required' });
    }

    const wasNew = await addRecommendedJob(jobId, jobData);

    res.json({
      success: true,
      message: wasNew ? 'Job added to recommended' : 'Job already exists',
      wasNew
    });
  } catch (error) {
    console.error('Error adding recommended job:', error);
    res.status(500).json({ error: 'Failed to add job to recommended' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Using SQLite database for job storage');
});
