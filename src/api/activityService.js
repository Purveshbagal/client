import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const activityService = {
  // Get all activities (admin)
  getAllActivities: (filters = {}, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(filters.type && { type: filters.type }),
      ...(filters.severity && { severity: filters.severity }),
      ...(filters.status && { status: filters.status }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    });

    return axios.get(`${API_BASE_URL}/activities?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Get activity statistics
  getActivityStats: (filters = {}) => {
    const params = new URLSearchParams({
      ...(filters.type && { type: filters.type }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    });

    return axios.get(`${API_BASE_URL}/activities/stats/overview?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Get recent public activities
  getRecentActivities: (limit = 10) => {
    return axios.get(`${API_BASE_URL}/activities/recent?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Get user's activities
  getUserActivities: (page = 1, limit = 20) => {
    return axios.get(
      `${API_BASE_URL}/activities/user/activities?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  },

  // Get admin's activities
  getAdminActivities: (page = 1, limit = 20) => {
    return axios.get(
      `${API_BASE_URL}/activities/admin/activities?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  },

  // Get restaurant activities
  getRestaurantActivities: (restaurantId, page = 1, limit = 20) => {
    return axios.get(
      `${API_BASE_URL}/activities/restaurant/${restaurantId}/activities?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  },

  // Get dashboard stats
  getDashboardStats: () => {
    return axios.get(`${API_BASE_URL}/activities/user/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Get single activity
  getActivity: (activityId) => {
    return axios.get(`${API_BASE_URL}/activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Clean up old activities
  cleanupOldActivities: (daysOld = 30) => {
    return axios.delete(`${API_BASE_URL}/activities/cleanup?daysOld=${daysOld}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },
};

export default activityService;
