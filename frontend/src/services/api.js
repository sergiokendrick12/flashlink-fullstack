import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle token expiry — auto-refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe:    () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
}

// ── Shipments ─────────────────────────────────────────────
export const shipmentsAPI = {
  getAll:       (params) => api.get('/shipments', { params }),
  getOne:       (id) => api.get(`/shipments/${id}`),
  create:       (data) => api.post('/shipments', data),
  updateStatus: (id, data) => api.patch(`/shipments/${id}/status`, data),
  track:        (ref) => api.get(`/track/${ref}`),
}

// ── Quotes ────────────────────────────────────────────────
export const quotesAPI = {
  create:   (data) => api.post('/quotes', data),
  getAll:   (params) => api.get('/quotes', { params }),
  respond:  (id, data) => api.patch(`/quotes/${id}`, data),
}

// ── Contact ───────────────────────────────────────────────
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
}

// ── Newsletter ────────────────────────────────────────────
export const newsletterAPI = {
  subscribe:   (data) => api.post('/newsletter/subscribe', data),
  unsubscribe: (token) => api.get(`/newsletter/unsubscribe/${token}`),
}

// ── Blog ──────────────────────────────────────────────────
export const blogAPI = {
  getAll:  (params) => api.get('/blog', { params }),
  getOne:  (slug) => api.get(`/blog/${slug}`),
  create:  (data) => api.post('/blog', data),
  update:  (id, data) => api.put(`/blog/${id}`, data),
  delete:  (id) => api.delete(`/blog/${id}`),
}

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
  getStats:   () => api.get('/admin/stats'),
  getUsers:   (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  getContacts:() => api.get('/contact'),
}

// ── Notifications ─────────────────────────────────────────
export const notificationsAPI = {
  getAll:      () => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}

// ── Users ─────────────────────────────────────────────────
export const usersAPI = {
  getProfile:      () => api.get('/users/profile'),
  updateProfile:   (data) => api.patch('/users/profile', data),
  changePassword:  (data) => api.patch('/users/change-password', data),
}
