import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { AuthContext } from '../../contexts/AuthContext';
import { connectSocket, onEvent, offEvent, disconnectSocket } from '../../utils/socketClient';
import StatCard from '../../components/admin/StatCard';
import OrderAlertNotification from '../../components/admin/OrderAlertNotification';
import RestaurantDishManager from '../../components/admin/RestaurantDishManager';
import { toast } from 'react-toastify';

export default function EnhancedAdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // State management
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [topDishes, setTopDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [alertFilter, setAlertFilter] = useState('all');
  const [readAlerts, setReadAlerts] = useState(new Set());

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.stats);
        setTopDishes(response.data.topDishes || []);
        setRestaurants(response.data.restaurantStats || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const params = {
        page: 1,
        limit: 50,
        ...(filter !== 'all' && { status: filter }),
        ...(searchQuery && { search: searchQuery })
      };
      const response = await api.get('/dashboard/orders', { params });
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  // Setup real-time socket connection
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('swadhan_access') || localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      socketRef.current = connectSocket(token);

      const unsubOrder = onEvent('order:created', (payload) => {
        const order = payload?.data?.order || payload?.order;
        if (order) {
          // Play notification sound
          playNotificationSound();

          // Show alert
          setAlerts(prev => [order, ...prev].slice(0, 10));

          // Refresh data
          fetchStats();
          fetchOrders();

          // Desktop notification
          if (window.Notification && Notification.permission === 'granted') {
            new Notification('🎉 New Order!', {
              body: `Order #${order._id?.substring(0, 8)} - ₹${order.totalPrice?.toFixed(2)}`,
              icon: '📦'
            });
          }
        }
      });

      return () => {
        if (unsubOrder) unsubOrder();
        if (socketRef.current) {
          try { disconnectSocket(); } catch (e) { }
        }
      };
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }, [user, navigate]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchOrders()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Refresh on filter/search change
  useEffect(() => {
    if (!loading) {
      fetchOrders();
    }
  }, [filter, searchQuery]);

  // Request notification permission
  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      });

      toast.success('Order status updated successfully!');
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
      console.error('Error:', error);
    }
  };

  // Alert management functions
  const markAlertAsRead = (alertId) => {
    setReadAlerts(prev => new Set([...prev, alertId]));
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a._id !== alertId));
    markAlertAsRead(alertId);
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    setReadAlerts(new Set());
  };

  const getUnreadCount = () => {
    return alerts.filter(a => !readAlerts.has(a._id)).length;
  };

  const getFilteredAlerts = () => {
    if (alertFilter === 'all') return alerts;
    if (alertFilter === 'unread') return alerts.filter(a => !readAlerts.has(a._id));
    if (alertFilter === 'pending') return alerts.filter(a => a.status === 'pending');
    return alerts;
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Alert Notifications */}
      <div className="fixed top-20 right-4 z-40 space-y-2 max-h-96 overflow-y-auto">
        {alerts.slice(0, 3).map((alert, idx) => (
          <OrderAlertNotification
            key={alert._id || idx}
            order={alert}
            onClose={() => setAlerts(prev => prev.filter((_, i) => i !== idx))}
          />
        ))}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.name}! 👋</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Live Orders</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin">
              <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 bg-white rounded-lg shadow-sm p-1 w-fit flex-wrap">
              {['overview', 'alerts', 'orders', 'analytics', 'restaurants'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
                    activeTab === tab
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'restaurants' ? '🏪 Restaurants & Dishes' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'alerts' && getUnreadCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {getUnreadCount()}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Statistics Grid */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Orders"
                      value={stats?.totalOrders || 0}
                      subtitle="All time"
                      icon={
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 4V3m10 1v-1m4 6h-1m1 4h-1m1 4h-1M4 20h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v11a2 2 0 002 2z" />
                        </svg>
                      }
                      bgColor="bg-blue-500"
                    />
                    <StatCard
                      title="Pending Orders"
                      value={stats?.pendingOrders || 0}
                      subtitle="Needs attention"
                      icon={
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                      bgColor="bg-orange-500"
                      trend={`${stats?.pendingOrders || 0}`}
                      trendUp={false}
                    />
                    <StatCard
                      title="Total Revenue"
                      value={`₹${stats?.totalRevenue || 0}`}
                      subtitle="Delivered orders"
                      icon={
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                      bgColor="bg-green-500"
                      trend={`₹${stats?.todayRevenue || 0} today`}
                      trendUp={true}
                    />
                    <StatCard
                      title="Avg Order Value"
                      value={`₹${stats?.avgOrderValue || 0}`}
                      subtitle="Per order"
                      icon={
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      }
                      bgColor="bg-purple-500"
                    />
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Dishes */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🔥 Top Selling Dishes</h3>
                    <div className="space-y-3">
                      {topDishes.length > 0 ? (
                        topDishes.slice(0, 5).map((dish, idx) => (
                          <div key={dish._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-orange-500 w-8 text-center">#{idx + 1}</span>
                              <div>
                                <p className="font-semibold text-gray-900">{dish.name}</p>
                                <p className="text-sm text-gray-600">{dish.totalQuantity} sold</p>
                              </div>
                            </div>
                            <p className="font-bold text-gray-900">₹{dish.totalSales?.toFixed(2) || 0}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No data yet</p>
                      )}
                    </div>
                  </div>

                  {/* Restaurant Performance */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🏪 Restaurant Performance</h3>
                    <div className="space-y-3">
                      {restaurants.length > 0 ? (
                        restaurants.slice(0, 5).map((rest, idx) => (
                          <div key={rest._id} className="p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-gray-900">{rest.name}</p>
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                {rest.orderCount} orders
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min((rest.orderCount / (restaurants[0]?.orderCount || 1)) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">₹{rest.totalRevenue?.toFixed(2) || 0}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No restaurants yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Search by customer name, email, or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Orders</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="preparing">Preparing</option>
                      <option value="out-for-delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={fetchOrders}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Restaurant</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono text-gray-700">
                                #{order._id?.substring(0, 8)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div>
                                  <p className="font-semibold text-gray-900">{order.user?.name || 'N/A'}</p>
                                  <p className="text-xs text-gray-600">{order.user?.phone || order.user?.email || '-'}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {order.restaurant?.name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {order.items?.length || 0} items
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                ₹{order.totalPrice?.toFixed(2) || 0}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  order.status === 'out-for-delivery' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status?.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActiveTab('order-details');
                                  }}
                                  className="text-orange-600 hover:text-orange-800 font-semibold"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No orders found matching your filters.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Sales Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <p className="text-gray-700 font-semibold mb-2">Today's Orders</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.todayOrders || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <p className="text-gray-700 font-semibold mb-2">Today's Revenue</p>
                    <p className="text-3xl font-bold text-green-600">₹{stats?.todayRevenue || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <p className="text-gray-700 font-semibold mb-2">Active Restaurants</p>
                    <p className="text-3xl font-bold text-purple-600">{stats?.restaurantCount || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                {/* Alerts Header & Controls */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">🔔 Alerts & Notifications</h2>
                      <p className="text-gray-600 text-sm mt-1">{getUnreadCount()} unread alerts</p>
                    </div>
                    <div className="flex gap-2">
                      {alerts.length > 0 && (
                        <button
                          onClick={clearAllAlerts}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alert Filters */}
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'unread', 'pending'].map(filterType => (
                      <button
                        key={filterType}
                        onClick={() => setAlertFilter(filterType)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          alertFilter === filterType
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                        {filterType === 'unread' && ` (${getUnreadCount()})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alerts List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {getFilteredAlerts().length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {getFilteredAlerts().map((alert, idx) => (
                        <div
                          key={alert._id || idx}
                          className={`p-6 hover:bg-gray-50 transition-colors ${
                            !readAlerts.has(alert._id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Alert Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex-shrink-0">
                                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    New Order #{alert._id?.substring(0, 8)}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {new Date(alert.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Alert Details */}
                              <div className="bg-gray-50 rounded p-4 mb-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">Customer</p>
                                    <p className="font-semibold text-gray-900">{alert.user?.name || 'Unknown'}</p>
                                    {alert.user?.phone && (
                                      <p className="text-gray-600 text-xs">{alert.user.phone}</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Total Amount</p>
                                    <p className="font-semibold text-orange-600 text-lg">₹{alert.totalPrice?.toFixed(2) || 0}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-gray-600 text-sm">Delivery Address</p>
                                  <p className="text-gray-900 font-semibold">{alert.address || 'N/A'}</p>
                                  <p className="text-gray-600 text-sm">{alert.city || ''}</p>
                                </div>

                                <div>
                                  <p className="text-gray-600 text-sm mb-2">Items ({alert.items?.length || 0})</p>
                                  <div className="space-y-1">
                                    {alert.items?.slice(0, 3).map((item, i) => (
                                      <p key={i} className="text-sm text-gray-700">
                                        • {item.name || item.dish?.name} × {item.qty} - ₹{(item.price * item.qty).toFixed(2)}
                                      </p>
                                    ))}
                                    {alert.items?.length > 3 && (
                                      <p className="text-sm text-gray-600">... and {alert.items.length - 3} more items</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  alert.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  alert.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {alert.status?.toUpperCase() || 'PENDING'}
                                </span>
                              </div>
                            </div>

                            {/* Alert Actions */}
                            <div className="flex-shrink-0 flex flex-col gap-2">
                              <button
                                onClick={() => markAlertAsRead(alert._id)}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded font-semibold transition-colors"
                              >
                                Mark Read
                              </button>
                              <button
                                onClick={() => dismissAlert(alert._id)}
                                className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded font-semibold transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Alerts</h3>
                      <p className="text-gray-600">You're all caught up! There are no alerts to display.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Restaurants & Dishes Tab */}
            {activeTab === 'restaurants' && (
              <RestaurantDishManager />
            )}
          </>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && activeTab === 'order-details' && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setActiveTab('orders');
          }}
          onStatusUpdate={(status) => {
            updateOrderStatus(selectedOrder._id, status);
            setSelectedOrder(null);
            setActiveTab('orders');
          }}
        />
      )}
    </div>
  );
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(order.status);

  const statusFlow = ['pending', 'accepted', 'preparing', 'out-for-delivery', 'delivered'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Order #{order._id?.substring(0, 8)}</h2>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Customer</p>
              <p className="text-lg font-semibold text-gray-900">{order.user?.name}</p>
              <p className="text-sm text-gray-600">{order.user?.phone}</p>
              <p className="text-sm text-gray-600">{order.user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Restaurant</p>
              <p className="text-lg font-semibold text-gray-900">{order.restaurant?.name}</p>
              <p className="text-sm text-gray-600">{order.restaurant?.city}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Delivery Address</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-900 font-semibold">{order.address}</p>
              <p className="text-gray-600 text-sm">{order.city}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Order Items</p>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name || item.dish?.name}</p>
                    <p className="text-xs text-gray-600">Qty: {item.qty}</p>
                  </div>
                  <p className="font-bold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-900">Total Amount:</span>
              <span className="text-orange-600">₹{order.totalPrice?.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {statusFlow.map(status => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`px-4 py-2 rounded font-semibold transition-all ${
                    newStatus === status
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => onStatusUpdate(newStatus)}
            className="flex-1 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
