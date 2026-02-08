# Database Management Scripts

These scripts help you manage the Jobs Dashboard database.

## Import Jobs to Database

You have several options to add jobs to your database:

### Option 1: PowerShell Script (Windows - Easiest)

```powershell
.\scripts\import-jobs.ps1 -JsonFile "C:\Users\Keith\Documents\JobReports\data\Jobs_Report.json"
```

### Option 2: Python Script (Cross-platform)

```bash
# Install requests if needed
pip install requests

# Run the import
python scripts/import-jobs.py "C:\Users\Keith\Documents\JobReports\data\Jobs_Report.json"
```

### Option 3: curl (Manual/Quick Test)

**Add a single job:**
```bash
curl -X POST https://jobs-dashboard-backend-wgqx.onrender.com/api/admin/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "https://example.com/job/123",
    "jobData": {
      "title": "Software Engineer",
      "company": "Acme Corp",
      "location": "Remote",
      "url": "https://example.com/job/123",
      "source": "remote_other"
    }
  }'
```

**Add multiple jobs:**
```bash
curl -X POST https://jobs-dashboard-backend-wgqx.onrender.com/api/admin/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "jobs": [
      {
        "jobId": "https://example.com/job/123",
        "jobData": {...}
      },
      {
        "jobId": "https://example.com/job/456",
        "jobData": {...}
      }
    ]
  }'
```

### Option 4: Direct PostgreSQL Access (Advanced)

1. Go to your Render dashboard
2. Click on your PostgreSQL database
3. Go to "Connect" tab
4. Copy the "External Database URL" or "PSQL Command"

**Using psql:**
```bash
psql postgres://user:password@host/database

# Insert a job
INSERT INTO recommended_jobs (job_id, job_data)
VALUES (
  'https://example.com/job/123',
  '{"title":"Software Engineer","company":"Acme","url":"https://example.com/job/123","source":"remote_other"}'
);
```

**Using any PostgreSQL client:**
- DBeaver
- pgAdmin
- TablePlus
- DataGrip

### Option 5: Postman / Insomnia

Import jobs using a REST client:

1. Open Postman or Insomnia
2. Create a POST request to: `https://jobs-dashboard-backend-wgqx.onrender.com/api/admin/recommend`
3. Set header: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "jobs": [
    {
      "jobId": "https://example.com/job/1",
      "jobData": {
        "title": "Job Title",
        "company": "Company Name",
        "location": "Location",
        "url": "https://example.com/job/1",
        "source": "local_charleston"
      }
    }
  ]
}
```

## Job Data Format

Each job should have these fields:

```json
{
  "title": "Software Engineer",
  "company": "Acme Corp",
  "location": "Charleston, SC" or "Remote",
  "url": "https://example.com/job-posting",
  "source": "local_charleston" | "remote_other" | "side_gigs",
  "pay": "80k-120k" (optional),
  "confidence": "95%" (optional),
  "date_posted": "2024-01-15" (optional)
}
```

**Important:** The `url` field is used as the unique identifier (job_id).

## Source Values

- `local_charleston` - Local Charleston area jobs
- `remote_other` - Remote jobs (other locations)
- `side_gigs` - Side gigs and contract work

## Troubleshooting

### "Network error" or "Connection refused"
- Make sure the backend is running
- Check the API URL is correct
- For local dev, use: `http://localhost:3001/api/admin/recommend`
- For production, use: `https://jobs-dashboard-backend-wgqx.onrender.com/api/admin/recommend`

### "Job already exists"
- This is normal - the database prevents duplicates based on URL
- The job was already in the database, so it was skipped

### "No jobs found"
- Check that your JSON file has the correct structure
- Must have `local_charleston`, `remote_other`, or `side_gigs` sections
- Each job must have a `url` field

## Examples

See `examples/sample-jobs.json` for example job data format.
