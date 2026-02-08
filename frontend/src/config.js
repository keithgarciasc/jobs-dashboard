// API Configuration
// In production, use the backend URL; in development, use relative path (Vite proxy)
const API_BASE_URL = import.meta.env.PROD
  ? 'https://jobs-dashboard-backend-wgqx.onrender.com'
  : '';

export default API_BASE_URL;
