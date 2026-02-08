# Jobs Dashboard

A React-based dashboard for tracking job applications with local SQLite persistence.

## Architecture

- **Frontend**: React + Vite (port 3000)
- **Backend**: Node.js + Express + SQLite (port 3001)
- **Database**: SQLite (sql.js)
- **Data Source**: Configurable via .env file (supports auto-discovery of dated job reports)

## Project Structure

```
JobsDashboard/
├── backend/
│   ├── server.js          # Express API server
│   ├── db.js              # SQLite database layer
│   ├── jobs.db            # SQLite database (auto-created)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # Global styles
│   │   ├── main.jsx       # Entry point
│   │   └── components/
│   │       ├── Dashboard.jsx   # Container for all sections
│   │       ├── JobSection.jsx  # Individual section
│   │       └── JobRow.jsx      # Job row with apply button
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── start.ps1              # PowerShell script to start both servers
└── README.md
```

## Database Schema

```sql
CREATE TABLE applied_jobs (
  job_id TEXT PRIMARY KEY,        -- Job URL (unique identifier)
  job_data TEXT NOT NULL,         -- Full job payload as JSON
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommended_jobs (
  job_id TEXT PRIMARY KEY,        -- Job URL (unique identifier)
  job_data TEXT NOT NULL,         -- Full job payload as JSON
  recommended_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Note:** Both tables use `job_id` (the job URL) as the primary key. Jobs are stored as JSON in the `job_data` field, allowing flexible job schemas. The `recommended_jobs` table should be populated with job opportunities (manually or via an import script), and users can mark them as applied.

## Features

✅ SQLite database for persistent job storage
✅ Recommended jobs table for job opportunities
✅ Applied jobs table for tracking applications
✅ Display jobs in 3 sections (local_charleston, remote_other, side_gigs)
✅ Apply button for each job
✅ Idempotent apply action (prevents duplicates)
✅ Visual feedback (disabled button, applied styling)
✅ Reload persistence (applied jobs remain marked across sessions)
✅ Separate views: Home, Recommended Jobs, and Applied Jobs

## Setup Instructions

### 1. Install Dependencies

Run the setup script to install both backend and frontend dependencies:

```powershell
.\setup.ps1
```

Or install manually:

```powershell
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure Environment (Optional)

The backend works out of the box with default settings. To customize:

```powershell
# Create backend/.env from the example
cp backend/.env.example backend/.env

# Edit backend/.env to change port or database location
```

### 3. Start the Application

**Option A: Start both servers at once (PowerShell)**
```powershell
.\start.ps1
```

**Option B: Start servers separately**

Terminal 1 (Backend):
```powershell
cd backend
npm start
```

Terminal 2 (Frontend):
```powershell
cd frontend
npm run dev
```

### 4. Access the Dashboard

Open your browser to: **http://localhost:3000**

## API Endpoints

### GET `/api/jobs`
Returns all jobs with applied status.

**Response:**
```json
{
  "local_charleston": [...],
  "remote_other": [...],
  "side_gigs": [...]
}
```

### POST `/api/apply`
Mark a job as applied.

**Request:**
```json
{
  "jobId": "https://...",
  "jobData": { ... }
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

### GET `/api/applied`
Get all applied jobs with timestamps.

## Component Hierarchy

```
App
└── Dashboard
    └── JobSection (x3)
        └── JobRow (per job)
```

## Key Implementation Details

### Unique Job Identifier
- Uses the `url` field as the unique ID for each job
- Ensures stable identification across app reloads

### Optimistic UI Updates
- When Apply is clicked, the UI updates immediately
- If the API call fails, an error alert is shown

### Idempotent Apply
- Uses SQLite's `ON CONFLICT DO NOTHING` to prevent duplicate entries
- Safe to call multiple times with the same job ID

### Data Normalization
- Backend normalizes jobs by adding:
  - `id` field (from URL)
  - `source` field (from category or section)
  - `isApplied` boolean (from database lookup)

## Edge Cases Handled

1. **Missing Company**: Displays "Company not listed" if company is "NULL"
2. **Missing Pay**: Only displays pay if present and not "NULL"
3. **Empty Sections**: Shows "No jobs in this section" message
4. **Duplicate Applications**: Prevented by SQLite PRIMARY KEY constraint
5. **API Failures**: Error handling with user feedback
6. **Empty Database**: Backend returns empty arrays if no jobs in database

## Data Management

### Adding Jobs to the Database

Jobs are stored in the `recommended_jobs` SQLite table. You can populate jobs by:

1. **Manual Import**: Use a SQLite client to insert jobs directly
2. **API or Script**: Create a script to import jobs from JSON or other sources
3. **Frontend Interface**: Build an admin interface to add jobs (future enhancement)

**Example SQL to add a job:**
```sql
INSERT INTO recommended_jobs (job_id, job_data)
VALUES (
  'https://example.com/job/123',
  '{"title":"Software Engineer","company":"Acme Corp","location":"Remote","url":"https://example.com/job/123","source":"remote_other"}'
);
```

### Customization

#### Change Server Port
Edit `backend/.env`:
```bash
PORT=3001
```

#### Update Styles
Edit `frontend/src/App.css` to customize colors, spacing, etc.

### Add New Fields
1. Update `JobRow.jsx` to display new fields
2. No backend changes needed (full job data is already stored)

## Development Notes

- Backend runs on port 3001
- Frontend runs on port 3000 with proxy to backend
- SQLite database is created automatically on first run
- Vite provides hot module reloading for fast development

## Future Enhancements

- Admin interface for adding/managing recommended jobs
- JSON import script for bulk job uploads
- Search/filter functionality
- Sort by confidence score, date, pay
- Export applied jobs to CSV
- Application notes field
- Application status tracking (applied → interviewing → offer)
- Email notifications for new recommended jobs
