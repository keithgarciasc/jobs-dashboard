# Deployment Guide

This guide covers deploying the Jobs Dashboard to Render.com.

## Pre-Deployment Checklist

### ✅ Security Review Complete

- [x] No hardcoded credentials or API keys
- [x] No personal file paths in code
- [x] .env file is in .gitignore
- [x] Database files (*.db) are in .gitignore
- [x] .vs/ and .claude/ folders are in .gitignore
- [x] node_modules is in .gitignore

### ✅ Code Updated for Production

- [x] Removed unused JSON file loading code
- [x] Backend is fully database-driven (SQLite)
- [x] Environment variables are properly configured
- [x] CORS is enabled for cross-origin requests

## Render.com Deployment Steps

### 1. Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Jobs Dashboard application"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy Backend on Render

1. Go to [Render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the backend service:
   - **Name**: `jobs-dashboard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add environment variables:
   - `PORT`: `3001` (Render will override this)
6. Click **Create Web Service**

**Important Notes:**
- The SQLite database will be stored in Render's ephemeral filesystem
- For production, consider upgrading to a persistent disk or using PostgreSQL
- The database will reset when the service restarts on the free tier

### 3. Deploy Frontend on Render

1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure the frontend:
   - **Name**: `jobs-dashboard-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://jobs-dashboard-backend.onrender.com` (use your backend URL)
5. Click **Create Static Site**

### 4. Update Frontend API URL

Update `frontend/vite.config.js` to use environment variable for production:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

### 5. Update CORS in Backend

Update `backend/server.js` to allow your frontend domain:

```javascript
// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://jobs-dashboard-frontend.onrender.com', // Add your frontend URL
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

## Alternative Deployment Options

### Option A: Single Service Deployment

Deploy as a single service with the backend serving the built frontend:

1. Update `backend/server.js` to serve static files:
```javascript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve frontend static files
app.use(express.static(join(__dirname, '../frontend/dist')));

// All other routes serve the React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});
```

2. Deploy as a single web service with:
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `cd backend && npm start`

### Option B: Docker Deployment

Create a `Dockerfile` in the root:

```dockerfile
# Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build backend
FROM node:18
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

EXPOSE 3001
CMD ["npm", "start"]
```

## Database Persistence on Render

### Option 1: Persistent Disk (Paid Plan)

1. Upgrade to a paid Render plan
2. Add a persistent disk to your backend service
3. Set `DB_PATH` environment variable to point to the disk mount

### Option 2: PostgreSQL (Recommended for Production)

1. Create a PostgreSQL database on Render
2. Update `backend/db.js` to use PostgreSQL instead of SQLite
3. Install `pg` package: `npm install pg`

### Option 3: External Database

Use a managed database service:
- **Railway**: PostgreSQL with generous free tier
- **Supabase**: PostgreSQL with built-in auth
- **PlanetScale**: MySQL-compatible serverless database

## Environment Variables Summary

### Backend
- `PORT`: Server port (auto-set by Render)
- `DB_PATH`: Custom database path (optional)
- `NODE_ENV`: Set to `production` on Render

### Frontend
- `VITE_API_URL`: Backend API URL (only needed if not using proxy)

## Post-Deployment Testing

1. ✅ Test health check: `https://your-backend.onrender.com/health`
2. ✅ Test API endpoints: `/api/jobs`, `/api/recommended`, `/api/applied`
3. ✅ Test frontend loads correctly
4. ✅ Test apply button functionality
5. ✅ Test navigation between pages
6. ✅ Test that applied jobs persist after refresh

## Troubleshooting

### Backend not starting
- Check Render logs for errors
- Verify `npm start` command works locally
- Ensure all dependencies are in package.json

### Frontend can't connect to backend
- Check CORS configuration
- Verify API URL in frontend config
- Check network tab in browser DevTools

### Database resets on restart
- This is expected on Render free tier
- Upgrade to persistent disk or use external database
- Consider PostgreSQL for production

## Monitoring

Set up monitoring for your deployed application:
- **Render Dashboard**: View logs and metrics
- **Uptime Monitoring**: Use UptimeRobot or similar
- **Error Tracking**: Consider Sentry for frontend errors

## Costs

- **Render Free Tier**: $0/month
  - Backend: Sleeps after 15 min of inactivity
  - Frontend: Always available
  - No persistent database storage

- **Render Paid Plans**: Starting at $7/month
  - Always-on services
  - Persistent disk available
  - Better performance

## Security Best Practices

1. ✅ Never commit .env files
2. ✅ Use environment variables for all secrets
3. ✅ Enable HTTPS (automatic on Render)
4. ✅ Keep dependencies updated
5. ✅ Review CORS settings for production
6. ✅ Consider adding rate limiting for APIs
7. ✅ Add authentication if handling sensitive data

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure SSL certificate (automatic on Render)
3. Set up automated deployments from GitHub
4. Add monitoring and alerting
5. Plan for database backups
6. Consider adding authentication
