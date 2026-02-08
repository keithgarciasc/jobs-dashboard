# 🎯 Jobs Dashboard - Smart Job Application Tracker

> **A full-stack web application for managing job applications with intelligent filtering and persistent tracking**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-success?style=for-the-badge&logo=render)](https://jobs-dashboard-frontend.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/keithgarciasc/jobs-dashboard)

**🚀 [View Live Demo](https://jobs-dashboard-frontend.onrender.com/)**

---

## 📋 Overview

Jobs Dashboard is a production-ready full-stack application designed to streamline the job hunting process. It provides an intuitive interface for tracking job applications, managing recommendations, and maintaining a persistent record of your job search journey.

### The Problem
Job seekers often struggle to:
- Track which jobs they've already applied to
- Organize job opportunities from multiple sources
- Maintain historical records of their applications
- Avoid duplicate applications

### The Solution
A centralized dashboard that:
- ✅ Automatically filters out previously applied jobs
- ✅ Organizes opportunities by category (Local, Remote, Side Gigs)
- ✅ Provides persistent storage with PostgreSQL
- ✅ Offers real-time updates and visual feedback
- ✅ Deploys seamlessly to the cloud

---

## ✨ Key Features

### 🎨 User Experience
- **Intuitive Interface**: Clean, Western-themed UI with responsive design
- **Real-Time Updates**: Instant visual feedback on all actions
- **Smart Filtering**: Automatically removes duplicate job listings
- **Persistent Tracking**: All application data saved across sessions
- **Multi-View Navigation**: Separate pages for Home, Recommended, and Applied jobs

### 🔧 Technical Features
- **RESTful API**: Well-structured Express.js backend with comprehensive endpoints
- **Database Abstraction**: Smart layer supports both SQLite (dev) and PostgreSQL (prod)
- **Idempotent Operations**: Safe to retry actions without side effects
- **Error Handling**: Comprehensive error catching and user-friendly messages
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment-Based Config**: Automatic detection of development vs production

### 📊 Data Management
- **Bulk Import Scripts**: PowerShell and Python tools for data migration
- **Admin API**: Endpoints for programmatic job additions
- **Database Migration**: Seamless SQLite to PostgreSQL migration tools
- **JSON Support**: Flexible job schema using JSONB storage

---

## 🏗️ Architecture

### Technology Stack

**Frontend**
- ⚛️ **React 18** - Modern UI with hooks and functional components
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎨 **CSS3** - Custom styling with responsive design
- 🧭 **React Router** - Client-side routing for SPA navigation

**Backend**
- 🟢 **Node.js** - JavaScript runtime
- 🚂 **Express.js** - Minimal and flexible web framework
- 🐘 **PostgreSQL** - Production database (Render)
- 💾 **SQLite** - Development database (sql.js)
- 🔐 **CORS** - Cross-origin resource sharing

**DevOps & Deployment**
- 🌐 **Render.com** - Cloud hosting platform
- 🔄 **Git** - Version control
- 📦 **npm** - Package management
- 🔧 **dotenv** - Environment configuration

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│              https://jobs-dashboard-frontend                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS/REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Express.js Backend                         │
│            https://jobs-dashboard-backend                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                           │  │
│  │  • GET  /api/jobs          (All jobs with status)   │  │
│  │  • GET  /api/recommended   (Unapplied jobs)         │  │
│  │  • GET  /api/applied       (Applied jobs)           │  │
│  │  • POST /api/apply         (Mark as applied)        │  │
│  │  • POST /api/admin/recommend (Add jobs)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Smart Database Layer                                 │  │
│  │  • Auto-detects PostgreSQL vs SQLite                 │  │
│  │  • Async/await for PostgreSQL                        │  │
│  │  • Sync operations for SQLite                        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   PostgreSQL Database          │
        │   (Render - Production)        │
        │                                │
        │  • applied_jobs table          │
        │  • recommended_jobs table      │
        │  • JSONB data storage          │
        │  • Indexed by job_id (URL)     │
        └────────────────────────────────┘
```

---

## 🗄️ Database Schema

**Production-Ready PostgreSQL Design**

```sql
-- Applied Jobs Table
CREATE TABLE applied_jobs (
  job_id TEXT PRIMARY KEY,              -- Unique URL identifier
  job_data JSONB NOT NULL,              -- Flexible job schema
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommended Jobs Table
CREATE TABLE recommended_jobs (
  job_id TEXT PRIMARY KEY,              -- Unique URL identifier
  job_data JSONB NOT NULL,              -- Flexible job schema
  recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_applied_date ON applied_jobs(applied_at DESC);
CREATE INDEX idx_recommended_date ON recommended_jobs(recommended_at DESC);
```

**Key Design Decisions:**
- ✅ URL as primary key ensures no duplicate applications
- ✅ JSONB storage allows flexible job schemas without migrations
- ✅ Timestamps track application history
- ✅ Indexes optimize common queries

---

## 🚀 Live Demo

**Production URL:** [https://jobs-dashboard-frontend.onrender.com/](https://jobs-dashboard-frontend.onrender.com/)

### What You Can Do:
1. **Browse Jobs** - View categorized job opportunities
2. **Track Applications** - Mark jobs as applied with one click
3. **View History** - See all jobs you've applied to with timestamps
4. **Filter Intelligently** - Recommended jobs automatically exclude applied ones

### Demo Credentials
No login required - fully public demo showcasing the application's capabilities.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/keithgarciasc/jobs-dashboard.git
cd jobs-dashboard

# Install dependencies (both frontend and backend)
npm run setup
# Or manually:
cd backend && npm install && cd ../frontend && npm install && cd ..

# Start development servers
npm run dev
# Or use PowerShell script:
.\start.ps1

# Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

### Environment Configuration

Create `backend/.env` for local development:

```env
# Server Configuration
PORT=3001

# Database (PostgreSQL for production, SQLite for dev)
# DATABASE_URL=postgresql://user:password@host:port/database

# Leave DATABASE_URL unset for local development (uses SQLite)
```

---

## 📡 API Documentation

### Base URL
- **Production:** `https://jobs-dashboard-backend-wgqx.onrender.com`
- **Development:** `http://localhost:3001`

### Endpoints

#### `GET /api/jobs`
Returns all jobs with their application status.

**Response:**
```json
{
  "local_charleston": [
    {
      "id": "https://example.com/job/123",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "location": "Charleston, SC",
      "pay": "$80k-$120k",
      "isApplied": false,
      "recommendedAt": "2024-02-07T10:30:00Z"
    }
  ],
  "remote_other": [...],
  "side_gigs": [...]
}
```

#### `POST /api/apply`
Mark a job as applied.

**Request:**
```json
{
  "jobId": "https://example.com/job/123",
  "jobData": {
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "Remote",
    "url": "https://example.com/job/123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job marked as applied",
  "wasNew": true
}
```

#### `GET /api/recommended`
Get jobs not yet applied to, organized by section.

#### `GET /api/applied`
Get all applied jobs with timestamps.

#### `POST /api/admin/recommend`
Add jobs to the recommended pool (bulk or single).

---

## 🛠️ Technical Highlights

### Smart Database Layer
```javascript
// Automatically detects environment and uses appropriate database
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  // PostgreSQL with async/await
  dbModule = await import('./db-postgres.js');
} else {
  // SQLite for local development
  dbModule = await import('./db-sqlite.js');
}
```

### Async/Await Error Handling
```javascript
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await getRecommendedJobs();
    const appliedIds = new Set(await getAppliedJobIds());
    // Process and return data
    res.json(organizedJobs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to load jobs' });
  }
});
```

### Idempotent Operations
```sql
-- PostgreSQL INSERT with conflict handling
INSERT INTO applied_jobs (job_id, job_data, applied_at)
VALUES ($1, $2, CURRENT_TIMESTAMP)
ON CONFLICT (job_id) DO NOTHING
RETURNING job_id;
```

### CORS Configuration
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://jobs-dashboard-frontend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

---

## 📦 Project Structure

```
jobs-dashboard/
├── backend/
│   ├── server.js              # Express API server
│   ├── db.js                  # Smart database abstraction
│   ├── db-postgres.js         # PostgreSQL implementation
│   ├── db-sqlite.js           # SQLite implementation
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── App.css            # Global styles
│   │   ├── main.jsx           # Entry point
│   │   ├── config.js          # API configuration
│   │   ├── components/
│   │   │   ├── Dashboard.jsx  # Dashboard layout
│   │   │   ├── JobSection.jsx # Section container
│   │   │   ├── JobRow.jsx     # Job card component
│   │   │   └── Navigation.jsx # Nav bar
│   │   └── pages/
│   │       ├── Home.jsx       # Home page
│   │       ├── RecommendedJobs.jsx
│   │       └── AppliedJobs.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── scripts/
│   ├── import-jobs.py         # Python import script
│   ├── import-jobs.ps1        # PowerShell import script
│   ├── migrate-sqlite-to-postgres.js
│   └── README.md
├── DEPLOYMENT.md              # Deployment guide
├── SECURITY_AUDIT.md          # Security review
└── README.md
```

---

## 🔒 Security Features

✅ **No Hardcoded Credentials** - All sensitive data in environment variables
✅ **CORS Protection** - Whitelist of allowed origins
✅ **SQL Injection Prevention** - Parameterized queries
✅ **Input Validation** - Server-side validation on all endpoints
✅ **HTTPS Enforced** - SSL/TLS encryption in production
✅ **Environment Separation** - Dev and prod configurations isolated

---

## 🚢 Deployment

### Production Stack
- **Frontend:** Render Static Site (CDN-backed)
- **Backend:** Render Web Service (Auto-scaling)
- **Database:** Render PostgreSQL (Managed)

### Deployment Status
- ✅ Automated CI/CD via GitHub integration
- ✅ Zero-downtime deployments
- ✅ Health check monitoring
- ✅ Environment variable management

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 📈 Performance

- **Frontend:** Vite-optimized bundle with code splitting
- **Backend:** Express.js with minimal middleware overhead
- **Database:** Indexed queries for sub-millisecond lookups
- **Caching:** Browser caching for static assets
- **CDN:** Global content delivery for frontend

---

## 🧪 Testing & Quality

### Code Quality
- ✅ ESLint configuration for code consistency
- ✅ Error boundaries in React components
- ✅ Comprehensive error handling
- ✅ Graceful degradation for failed API calls

### Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Keith Garcia**

- 🌐 [Live Demo](https://jobs-dashboard-frontend.onrender.com/)
- 💼 [GitHub](https://github.com/keithgarciasc)
- 📧 keith.garcia.sc@gmail.com

---

## 🙏 Acknowledgments

- React team for the excellent framework
- Render.com for reliable hosting
- Open source community for inspiration

---

## 📊 Project Stats

- **Lines of Code:** ~3,000+
- **Components:** 7 React components
- **API Endpoints:** 6 RESTful routes
- **Database Tables:** 2 with JSONB storage
- **Scripts:** 4 automation tools
- **Documentation:** Comprehensive README, deployment guide, security audit

---

**Built with ❤️ by Keith Garcia**

🚀 **[View Live Demo](https://jobs-dashboard-frontend.onrender.com/)** 🚀
