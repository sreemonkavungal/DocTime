import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Doctor APIs
export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots/${date}`),
  getMyProfile: () => api.get('/doctors/profile/me'),
  updateProfile: (data) => api.put('/doctors/profile/me', data),
  updateAvailability: (data) => api.put('/doctors/availability', data),
  getSpecializations: () => api.get('/doctors/meta/specializations'),
};

// Appointment APIs
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getMyAppointments: (params) => api.get('/appointments/my-appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
};

// Admin APIs
export const adminAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getPendingDoctors: () => api.get('/users/doctors/pending'),
  updateDoctorStatus: (id, status) => api.put(`/users/doctors/${id}/status`, { status }),
  getAllAppointments: (params) => api.get('/users/appointments/all', { params }),
  getAnalytics: () => api.get('/users/analytics'),
  deleteUser: (userId) => api.delete(`/profile/admin/delete-user/${userId}`),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/profile/me'),
  updateDetails: (data) => api.put('/profile/update-details', data),
  updateEmail: (data) => api.put('/profile/update-email', data),
  updatePassword: (data) => api.put('/profile/update-password', data),
  deleteAccount: (password) => api.delete('/profile/delete-account', { data: { password } }),
};

// Rating APIs
export const ratingAPI = {
  submitRating: (data) => api.post('/ratings/submit', data),
  updateRating: (data) => api.put('/ratings/update', data),
  getDoctorReviews: (doctorId, params) => api.get(`/ratings/doctor/${doctorId}`, { params }),
  getDoctorStats: (doctorId) => api.get(`/ratings/doctor/${doctorId}/stats`),
};

export default api;

