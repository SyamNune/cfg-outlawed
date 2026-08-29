import axios from 'axios';

// Backend URL from environment variables, defaulting to port 5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ==========================================
// INTERCEPTORS
// ==========================================

// Attach token from localStorage if present and valid
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token === 'undefined' || token === 'null') {
      localStorage.removeItem('authToken');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let normalizedError = {
      message: 'Something went wrong. Please try again.',
      status: error.response?.status || 500,
      originalError: error,
    };

    if (!error.response) {
      normalizedError.message = 'Network error. Please check if the backend server is running on port 5000.';
    } else if (error.response.status === 401) {
      normalizedError.message = error.response.data?.error?.message || 'Session expired. Please log in again.';
      // If token is invalid/malformed, clean storage
      if (normalizedError.message.includes('malformed') || normalizedError.message.includes('expired') || normalizedError.message.includes('invalid')) {
        localStorage.removeItem('authToken');
      }
    } else if (error.response.status === 403) {
      normalizedError.message = error.response.data?.error?.message || 'You do not have permission to perform this action.';
    } else if (error.response.status === 404) {
      normalizedError.message = error.response.data?.error?.message || 'Requested resource not found.';
    } else if (error.response.data?.error?.message) {
      normalizedError.message = error.response.data.error.message;
    }

    console.error('[API Error Interceptor]:', normalizedError);
    return Promise.reject(normalizedError);
  }
);

// ==========================================
// API HELPER SERVICES
// ==========================================

export const authService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  getUsers: (params) => apiClient.get('/auth/users', { params }),
  seedDemo: () => apiClient.post('/auth/seed-demo'),
};

export const caseService = {
  getCases: (params) => apiClient.get('/cases', { params }),
  getCaseById: (id) => apiClient.get(`/cases/${id}`),
  createCase: (caseData) => apiClient.post('/cases', caseData),
  updateCase: (id, caseData) => apiClient.put(`/cases/${id}`, caseData),
  addFieldVisit: (id, visitData) => apiClient.post(`/cases/${id}/field-visits`, visitData),
  addCaseUpdate: (id, updateData) => apiClient.post(`/cases/${id}/updates`, updateData),
  addDocument: (id, docData) => apiClient.post(`/cases/${id}/documents`, docData),
  requestLegalExpert: (id, requestData) => apiClient.post(`/cases/${id}/request-expert`, requestData),
  provideExpertGuidance: (id, guidanceData) => apiClient.post(`/cases/${id}/expert-guidance`, guidanceData),
  assignCase: (id, data) => apiClient.post(`/case-manager/cases/${id}/assign`, data),
  getSimilarCases: (id) => apiClient.get(`/cases/${id}/similar`),
  runAIAnalysis: (id) => apiClient.post(`/cases/${id}/ai-analyze`),
};

export const caseManagerService = {
  getDashboardMetrics: (params) => apiClient.get('/case-manager/dashboard-metrics', { params }),
  getExpertRequests: (params) => apiClient.get('/case-manager/expert-requests', { params }),
  reviewExpertRequest: (id, data) => apiClient.post(`/case-manager/expert-requests/${id}/review`, data),
  assignCase: (id, data) => apiClient.post(`/case-manager/cases/${id}/assign`, data),
  getVolunteerPerformance: (params) => apiClient.get('/case-manager/volunteer-performance', { params }),
};

export const aiService = {
  chat: (query, caseContext) => apiClient.post('/ai/chat', { query, caseContext }),
  findSimilar: (data) => apiClient.post('/ai/find-similar', data),
  getKnowledge: (params) => apiClient.get('/ai/knowledge', { params }),
  getStatus: () => apiClient.get('/ai/status'),
};

export const adminService = {
  getAllUsers: (params) => apiClient.get('/admin/users', { params }),
  createUser: (userData) => apiClient.post('/admin/users', userData),
  updateUser: (id, userData) => apiClient.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getSystemStats: () => apiClient.get('/admin/stats'),
};

export default apiClient;
