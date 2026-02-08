import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  getAppliedJobIds,
  markJobAsApplied,
  getAppliedJobs,
  getRecommendedJobs,
  addRecommendedJob,
  authenticateUser,
  getUserById,
  getLoginAnalytics
} from './db.js';

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

// Authentication Middleware
function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.userId = parseInt(userId);
  next();
}

// API Routes

/**
 * POST /api/auth/login
 * Authenticate user
 * Body: { username: string, password: string }
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        isGuest: user.is_guest
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/jobs
 * Returns jobs from recommended_jobs table with applied status
 * Local territories: last 10 local jobs
 * Frontier & remote trails: last 10 remote jobs
 * Quick draw and side hustles: last 5 side gig jobs
 */
app.get('/api/jobs', requireAuth, async (req, res) => {
  try {
    // Get all recommended jobs (shared by all users)
    const recommendedJobs = await getRecommendedJobs();
    // Get applied jobs for this specific user
    const appliedIds = new Set(await getAppliedJobIds(req.userId));

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
 * Mark a job as applied for the authenticated user
 * Body: { jobId: string, jobData: object }
 */
app.post('/api/apply', requireAuth, async (req, res) => {
  try {
    const { jobId, jobData } = req.body;

    if (!jobId || !jobData) {
      return res.status(400).json({ error: 'jobId and jobData are required' });
    }

    const wasNew = await markJobAsApplied(jobId, jobData, req.userId);

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
 * Get all applied jobs for the authenticated user
 */
app.get('/api/applied', requireAuth, async (req, res) => {
  try {
    const appliedJobs = await getAppliedJobs(req.userId);
    res.json(appliedJobs);
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    res.status(500).json({ error: 'Failed to load applied jobs' });
  }
});

/**
 * GET /api/recommended
 * Get recommended jobs that are NOT in applied_jobs for the authenticated user
 * Organized by section (local_charleston, remote_other, side_gigs)
 */
app.get('/api/recommended', requireAuth, async (req, res) => {
  try {
    // Get all recommended jobs (shared by all users)
    const recommendedJobs = await getRecommendedJobs();

    // Get applied job IDs for this user to exclude them
    const appliedIds = new Set(await getAppliedJobIds(req.userId));

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

/**
 * GET /api/analytics
 * Get login analytics (owner only)
 */
app.get('/api/analytics', requireAuth, async (req, res) => {
  try {
    // Check if user is owner
    const user = await getUserById(req.userId);
    if (!user || user.is_guest) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analytics = await getLoginAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug endpoint to check environment
app.get('/debug', (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'not set',
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Using SQLite database for job storage');
});
