import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { AuthContext } from '../../contexts/AuthContext';
import { connectSocket, onEvent, offEvent, disconnectSocket } from '../../utils/socketClient';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [stats, setStats] = useState({ totalActivities: 0, adminActivities: 0, errors: 0, warnings: 0 });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Setup socket for admin to receive realtime order alerts
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const init = async () => {
      // fetch persisted notifications first
      try {
        const resp = await api.get('/notifications');
        const list = resp.data.notifications || [];
        // normalize to { data, timestamp }
        const mapped = list.map(n => ({ data: n.data || {}, timestamp: n.createdAt, _id: n._id, read: n.read }));
        setAlerts(mapped);
      } catch (err) {
        console.warn('Failed to load notifications', err?.message || err);
      }

      const token = localStorage.getItem('swadhan_access');
      try {
        socketRef.current = connectSocket(token);

        const unsub = onEvent('order:created', (payload) => {
          const event = payload || {};
          // play a short beep
          try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = 'sine';
            o.frequency.value = 720;
            g.gain.value = 0.03;
            o.connect(g); g.connect(ac.destination);
            o.start();
            setTimeout(() => { o.stop(); try { ac.close(); } catch (e) {} }, 140);
          } catch (e) {}

          // show desktop notification if permitted
          try {
            if (window.Notification && Notification.permission === 'granted') {
              const id = event.data?.order?._id || '';
              new Notification('New Order placed', { body: `Order ${id} — ${event.data?.order?.totalPrice ? '₹' + (event.data.order.totalPrice).toFixed(2) : ''}`, tag: id });
            }
          } catch (e) {}

          setAlerts(prev => [{ ...event, timestamp: new Date().toISOString(), read: false }, ...prev].slice(0, 50));
          toast.info(`New order ${event.data?.order?._id || ''} placed`);
        });

        // request permission for notifications if not set
        try {
          if (window.Notification && Notification.permission === 'default') {
            Notification.requestPermission().then(() => {});
          }
        } catch (e) {}

        return () => {
          try { if (unsub) unsub(); } catch (e) {}
          try { disconnectSocket(); } catch (e) {}
        };
      } catch (err) {
        console.warn('Socket init failed', err);
      }
    };

    init();
  }, [user]);

  // mark notifications read when admin opens alerts panel
  useEffect(() => {
    if (!alertsOpen || !user || user.role !== 'admin') return;
    (async () => {
      try {
        await api.patch('/notifications/all/read');
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      } catch (err) {
        console.warn('Failed to mark notifications read', err?.message || err);
      }
    })();
  }, [alertsOpen, user]);

  // Fetch dashboard stats for admin overview
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    (async () => {
      try {
        const resp = await api.get('/activities/user/dashboard');
        const d = resp.data.data || resp.data;
        setStats(d || {});
      } catch (e) {
        console.warn('Failed to load dashboard stats', e?.message || e);
      }
    })();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>}

            {/* Alerts / realtime */}
            <div className="relative">
              <button onClick={() => setAlertsOpen(v => !v)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {alerts.length > 0 && <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded-full">{alerts.length}</span>}
              </button>

              {alertsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b font-semibold">Realtime Alerts</div>
                  <div className="max-h-60 overflow-auto">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">No alerts yet.</div>
                    ) : (
                      alerts.map((a, i) => {
                        const order = a.data.order || {};
                        const items = order.items || [];
                        return (
                          <div key={a._id || i} className="p-3 border-b hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm text-gray-700">New order placed — <span className="font-medium">{order._id}</span></div>
                                <div className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</div>
                                <div className="text-sm mt-2">Total: <strong>₹{(order.totalPrice || order.total || 0).toFixed(2)}</strong></div>
                                <div className="text-xs text-gray-500 mt-2">{order.address || 'No address provided'}</div>
                                <div className="mt-2 text-sm text-gray-600">
                                  {items.slice(0,2).map((it, idx) => (
                                    <div key={idx}>{it.name} x {it.qty}</div>
                                  ))}
                                  {items.length > 2 && <div className="text-xs text-gray-400">+{items.length - 2} more items</div>}
                                </div>
                              </div>
                              <div className="text-right">
                                <button onClick={() => setSelectedAlert(a)} className="text-sm text-blue-600 hover:underline">Open</button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            {/* Alert details modal */}
            {selectedAlert && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">Order {selectedAlert.data.order._id}</h3>
                    <button className="text-gray-500" onClick={() => setSelectedAlert(null)}>Close</button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Items</h4>
                      <ul className="mt-2 space-y-2">
                        {(selectedAlert.data.order.items || []).map((it, idx) => (
                          <li key={idx} className="flex justify-between">
                            <div>
                              <div className="font-medium">{it.name}</div>
                              <div className="text-xs text-gray-500">Qty: {it.qty} · ₹{it.price}</div>
                            </div>
                            <div className="font-semibold">₹{(it.price * it.qty).toFixed(2)}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Delivery</h4>
                      <div className="mt-2 text-sm text-gray-700">{selectedAlert.data.order.address}</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedAlert.data.order.city}</div>

                      <h4 className="font-semibold mt-4">Bill</h4>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{(selectedAlert.data.order.totalPrice || 0).toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span>Tax</span><span>—</span></div>
                        <div className="flex justify-between text-lg font-bold mt-2"><span>Total</span><span>₹{(selectedAlert.data.order.totalPrice || 0).toFixed(2)}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <button onClick={() => setSelectedAlert(null)} className="px-3 py-1 bg-gray-200 rounded">Close</button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {sidebarOpen && <span>Orders</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/dishes"
                className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {sidebarOpen && <span>Dish Management</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/restaurants"
                className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {sidebarOpen && <span>Restaurants</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                {sidebarOpen && <span>Users</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/analytics"
                className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {sidebarOpen && <span>Analytics</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome to your admin dashboard</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Activities (today)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalActivities ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admin Activities (today)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.adminActivities ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Errors (today)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.errors ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Warnings (today)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.warnings ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Outlet */}
          <div className="bg-white rounded-lg shadow">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
