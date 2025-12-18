import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import useRealtimeActivity from '../hooks/useRealtimeActivity';

const ActivityDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    adminActivities: 0,
    errors: 0,
    warnings: 0,
  });
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: '',
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0,
  });

  const activityTypes = [
    'USER_REGISTRATION',
    'USER_LOGIN',
    'RESTAURANT_CREATED',
    'DISH_CREATED',
    'ORDER_PLACED',
    'PAYMENT_PROCESSED',
    'ADMIN_LOGIN',
    'ADMIN_ACTION',
  ];

  const severityLevels = ['INFO', 'WARNING', 'ERROR', 'SUCCESS'];

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await axios.get(
        `/api/activities?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setActivities(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/activities/user/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchDashboardStats();

    const interval = setInterval(() => {
      fetchActivities();
      fetchDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [filters, fetchActivities, fetchDashboardStats]);

  // Real-time connection for incoming activities
  const { connected: socketConnected, events: realtimeEvents } = useRealtimeActivity({ maxEvents: 200 });

  useEffect(() => {
    if (!realtimeEvents || realtimeEvents.length === 0) return;

    const latest = realtimeEvents[0];

    // Handle order events for admin notifications
    if (latest?.event === 'order:created') {
      const order = latest.data?.data || latest.data;
      if (order && order._id) {
        toast.success(`New order received! Order #${order._id.slice(-6)} from ${order.user?.name || 'Customer'} - $${order.totalPrice?.toFixed(2)}`, {
          position: "top-right",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }

    // The hook may push different shapes: either raw activity object or { event, data }
    let activity = null;
    if (latest?.event && latest.event !== 'activity') {
      // non-activity custom event
      activity = latest.data?.data || latest.data;
    } else if (latest?.data) {
      activity = latest.data;
    } else if (latest?.type) {
      activity = latest;
    }

    if (activity && activity._id) {
      setActivities((prev) => {
        const max = parseInt(filters.limit, 10) || 20;
        // avoid duplicates (same id at top)
        if (prev.length && prev[0]._id === activity._id) return prev;
        return [activity, ...prev].slice(0, max);
      });

      // Refresh stats to reflect new activity
      fetchDashboardStats();
    }
  }, [realtimeEvents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const getSeverityColor = (severity) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      SUCCESS: 'bg-green-100 text-green-800',
    };
    return colors[severity] || colors.INFO;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.PENDING;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Activity Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">
            Total Activities
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalActivities}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">
            Admin Activities
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {stats.adminActivities}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Errors</div>
          <div className="text-3xl font-bold text-red-600">{stats.errors}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Warnings</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.warnings}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {severityLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items per Page
            </label>
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No activities found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {activity.description}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(activity.severity)}`}
                        >
                          {activity.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                        >
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(
                          new Date(activity.createdAt),
                          'MMM dd, yyyy HH:mm:ss'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {activities.length} of {pagination.totalItems} activities
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {pagination.current} of {pagination.total}
                </span>

                <button
                  onClick={() =>
                    handlePageChange(
                      Math.min(pagination.total, filters.page + 1)
                    )
                  }
                  disabled={filters.page >= pagination.total}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityDashboard;
