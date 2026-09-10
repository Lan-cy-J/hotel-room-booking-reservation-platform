const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Universal request handler with token injection and standard response unwrapping
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.errors = data.errors || null;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    getProfile: () => request('/auth/profile', { method: 'GET' })
  },

  // Hotels
  hotels: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/hotels${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/hotels/${id}`),
    create: (data) => request('/hotels', { method: 'POST', body: data }),
    update: (id, data) => request(`/hotels/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/hotels/${id}`, { method: 'DELETE' })
  },

  // Room Types
  roomTypes: {
    getByHotel: (hotelId) => request(`/hotels/${hotelId}/room-types`),
    getById: (id) => request(`/room-types/${id}`),
    create: (hotelId, data) => request(`/hotels/${hotelId}/room-types`, { method: 'POST', body: data }),
    update: (id, data) => request(`/room-types/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/room-types/${id}`, { method: 'DELETE' })
  },

  // Availability Engine
  availability: {
    search: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/availability/search?${qs}`);
    },
    check: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/availability/check?${qs}`);
    }
  },

  // Bookings & Lifecycle
  bookings: {
    create: (bookingData) => request('/bookings', { method: 'POST', body: bookingData }),
    getMyBookings: () => request('/bookings/my-bookings'),
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/bookings${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/bookings/${id}`),
    confirm: (id) => request(`/bookings/${id}/confirm`, { method: 'PUT' }),
    checkIn: (id, data) => request(`/bookings/${id}/checkin`, { method: 'PUT', body: data }),
    checkOut: (id) => request(`/bookings/${id}/checkout`, { method: 'PUT' }),
    cancel: (id, data = {}) => request(`/bookings/${id}/cancel`, { method: 'PUT', body: data })
  },

  // Physical Rooms
  rooms: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/rooms${qs ? `?${qs}` : ''}`);
    },
    create: (data) => request('/rooms', { method: 'POST', body: data }),
    update: (id, data) => request(`/rooms/${id}`, { method: 'PUT', body: data })
  },

  // Housekeeping
  housekeeping: {
    getRooms: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/housekeeping/rooms${qs ? `?${qs}` : ''}`);
    },
    updateStatus: (id, data) => request(`/housekeeping/rooms/${id}/status`, { method: 'PUT', body: data })
  },

  // Invoices
  invoices: {
    getByBookingId: (bookingId) => request(`/invoices/${bookingId}`)
  },

  // Dynamic Pricing Rules
  pricingRules: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/pricing-rules${qs ? `?${qs}` : ''}`);
    },
    create: (data) => request('/pricing-rules', { method: 'POST', body: data }),
    update: (id, data) => request(`/pricing-rules/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/pricing-rules/${id}`, { method: 'DELETE' })
  },

  // Reports
  reports: {
    getDashboard: () => request('/reports/dashboard'),
    getOccupancy: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/reports/occupancy?${qs}`);
    },
    getRevenue: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/reports/revenue?${qs}`);
    }
  }
};
