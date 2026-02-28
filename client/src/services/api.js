/**
 * API Service
 * -------------
 * Base HTTP client for communicating with the Dhandha Studio backend.
 * All dashboard pages use this service for API calls.
 */

const BASE_URL = '/api';

/**
 * Get the stored API key from localStorage.
 * @returns {string|null}
 */
const getApiKey = () => localStorage.getItem('ds_api_key');

/**
 * Make an authenticated HTTP request.
 * @param {string} path
 * @param {object} [options]
 * @returns {Promise<object>}
 */
export const apiRequest = async (path, options = {}) => {
  const apiKey = getApiKey();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ── Convenience methods ────────────────────────────────────────

export const api = {
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
};

// ── Domain-specific API calls ──────────────────────────────────

// Health
export const checkHealth = () => api.get('/health');

// Generation
export const submitGeneration = (payload) => api.post('/generate', payload);
export const pollJobStatus = (jobId) => api.get(`/status/${jobId}`);

// User Dashboard
export const getProfile = () => api.get('/user/profile');
export const updateProfile = (data) => api.put('/user/profile', data);
export const getHistory = (params = '') => api.get(`/user/history${params ? '?' + params : ''}`);
export const getCredits = () => api.get('/user/credits');
export const requestRefund = (data) => api.post('/user/refund', data);

// Client Dashboard
export const getApiKeys = () => api.get('/client/keys');
export const generateApiKey = (data) => api.post('/client/keys', data);
export const rotateApiKey = (keyId) => api.post(`/client/keys/${keyId}/rotate`);
export const getClientAnalytics = (days = 30) => api.get(`/client/analytics?days=${days}`);
export const getClientBilling = () => api.get('/client/billing');
export const getClientJobs = (params = '') => api.get(`/client/jobs${params ? '?' + params : ''}`);

// Admin Dashboard
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminClients = () => api.get('/admin/clients');
export const getAdminRefunds = () => api.get('/admin/refunds');
export const approveAdminRefund = (id) => api.post(`/admin/refunds/${id}/approve`);
export const rejectAdminRefund = (id, reason) => api.post(`/admin/refunds/${id}/reject`, { reason });
export const adjustCredits = (data) => api.post('/admin/credits/adjust', data);

export default api;
