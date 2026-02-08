// API Configuration
// In production, use the backend URL; in development, use relative path (Vite proxy)
const API_BASE_URL = import.meta.env.PROD
  ? 'https://jobs-dashboard-backend-wgqx.onrender.com'
  : '';

// Helper function for authenticated API calls
export function getAuthHeaders() {
  const userId = localStorage.getItem('jobWranglerUserId');
  return {
    'Content-Type': 'application/json',
    'X-User-Id': userId || ''
  };
}

// Helper function for authenticated fetch
export async function authenticatedFetch(url, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });
}

export default API_BASE_URL;
