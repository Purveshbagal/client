import { useState, useEffect, useContext } from 'react';
import { Link, NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../contexts/AuthContext';
import api, { getFavorites, addToFavorites, removeFromFavorites } from '../api/api';
import formatPrice from '../utils/currency';
import Modal from '../components/Modal';
import Map from '../components/Map';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config/environment';

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState({ restaurants: [], dishes: [] });
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [editing, setEditing] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  // Nested routing replaces local tab state
  const location = useLocation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchFavorites();
      // Only reset form with editable fields
      reset({
        name: user.name,
        email: user.email,
        address: user.address || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  // Subscribe to SSE for live order updates
  useEffect(() => {
    if (!user) return;
    let es;
    try {
      console.log('Connecting to SSE for order updates...');
      es = new EventSource('/api/stream/events');
      
      es.onopen = () => {
        console.log('SSE connection established');
      };
      
      es.onerror = (error) => {
        console.error('SSE connection error:', error);
      };
      es.addEventListener('order_updated', (e) => {
        try {
          const payload = JSON.parse(e.data);
          const updatedOrder = payload.order || payload;
          // Get the user ID from the order (could be string, object with _id, or populated)
          const orderUserId = typeof updatedOrder.user === 'string' 
            ? updatedOrder.user 
            : updatedOrder.user?._id || updatedOrder.user?.id;
          
          // Compare with current user
          const currentUserId = user._id || user.id;
          
          console.log('Order update received:', {
            orderId: updatedOrder._id,
            status: updatedOrder.status,
            orderUserId,
            currentUserId,
            matches: String(orderUserId) === String(currentUserId)
          });
          
          // If this update is for the current user, update orders list
          if (String(orderUserId) === String(currentUserId)) {
            setOrders(prev => {
              const updated = prev.map(o => o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o);
              console.log('Orders updated:', updated);
              return updated;
            });
            toast.success(`Order updated: ${updatedOrder.status.replace('_', ' ').toUpperCase()}`, {
              position: 'top-right',
              autoClose: 3000,
            });
          }
        } catch (err) {
          console.error('Error processing order update:', err);
        }
      });
      es.addEventListener('delivery_updated', (e) => {
        try {
          const payload = JSON.parse(e.data);
          const updatedOrder = payload.order || payload;
          if (String(updatedOrder.user) === String(user.id) || updatedOrder.user?._id === user.id) {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
            toast.info(`Delivery update for ${updatedOrder._id}`);
          }
        } catch (err) {}
      });
    } catch (err) {
      // ignore
    }
    return () => { if (es) es.close(); };
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await getFavorites();
      setFavorites(response.data || { restaurants: [], dishes: [] });
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavorites({ restaurants: [], dishes: [] });
    }
  };

  const openTracker = (order) => {
    setTrackingOrder(order);
    setTrackerOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      // Filter out undefined, null, and empty string values
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      console.log('Submitting profile data:', cleanData);
      await updateUser(cleanData);
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) return null;

  // Split orders into active and completed
  const activeOrders = orders.filter(order => 
    ['pending', 'accepted', 'confirmed', 'preparing', 'out-for-delivery', 'out_for_delivery'].includes(order.status)
  );
  
  const completedOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your orders</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.role || 'Customer'}</p>
              </div>

              {/* Navigation */}
              <div className="space-y-2 mb-6">
                <NavLink
                  to="orders"
                  className={({ isActive }) => `block w-full text-left px-4 py-3 rounded-lg font-semibold border transition-all ${isActive ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >🔥 Your Orders</NavLink>
                <NavLink
                  to="history"
                  className={({ isActive }) => `block w-full text-left px-4 py-3 rounded-lg font-semibold border transition-all ${isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >📜 Order History</NavLink>
                <NavLink
                  to="settings"
                  className={({ isActive }) => `block w-full text-left px-4 py-3 rounded-lg font-semibold border transition-all ${isActive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >⚙️ Settings</NavLink>
                <NavLink
                  to="support"
                  className={({ isActive }) => `block w-full text-left px-4 py-3 rounded-lg font-semibold border transition-all ${isActive ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >🛟 Support</NavLink>
              </div>

              {/* User Info - Only show on /profile root */}
              {location.pathname === '/profile' && !editing ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">📧</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                        <p className="text-gray-800 font-medium break-all">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">📍</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-gray-800 font-medium">{user.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">📱</span>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                          <p className="text-gray-800 font-medium">{user.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => { /* redirect handled in Settings link */ }}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <NavLink to="settings" className="block w-full">✏️ Edit Profile</NavLink>
                  </button>
                </div>
              ) : location.pathname === '/profile' ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input 
                      {...register('name', { required: true })} 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
                      placeholder="Your name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">Name is required</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      {...register('email', { required: true })} 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">Email is required</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <textarea 
                      {...register('address')} 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
                      rows="3"
                      placeholder="Your delivery address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone (Optional)</label>
                    <input 
                      {...register('phone')} 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md"
                    >
                      💾 Save
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditing(false)} 
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </form>
              ) : null}

              {location.pathname === '/profile' && <button 
                onClick={logout} 
                className="w-full mt-4 bg-red-50 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-100 transition-all duration-300 border border-red-200"
              >
                🚪 Logout
              </button>}
            </div>
          </div>

          {/* Right Content via nested routes */}
          <div className="md:col-span-2 space-y-6">
            <Outlet context={{
              user,
              orders,
              activeOrders,
              completedOrders,
              formatPrice,
              getStatusColor,
              openTracker,
              handleSubmit,
              onSubmit,
              register,
              errors,
              setPreferencesOpen,
            }} />
          </div>
        </div>
      </div>
      <Modal open={trackerOpen} onClose={() => setTrackerOpen(false)} title={trackingOrder ? `Tracking ${trackingOrder._id}` : 'Tracking'}>
        {trackingOrder ? (
          <div>
            <p><strong>Status:</strong> {trackingOrder.status}</p>
            <p><strong>Estimated time:</strong> {trackingOrder.status === 'delivered' ? 'Delivered' : '15-30 min'}</p>
            <div className="mt-3 border p-2 rounded bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Live location (updates in real-time)</p>
              {
                (() => {
                  const current = trackingOrder.currentLocation;
                  const rest = trackingOrder.restaurant && trackingOrder.restaurant.location;
                  const path = [];
                  if (rest) path.push(rest);
                  if (current) path.push(current);
                  return (
                    <>
                      <Map position={current} path={path} height={320} zoom={13} />
                      {path.length >= 2 && (
                        (() => {
                          const toRad = (v) => v * Math.PI / 180;
                          const haversine = (a, b) => {
                            const R = 6371; // km
                            const dLat = toRad(b.lat - a.lat);
                            const dLon = toRad(b.lng - a.lng);
                            const lat1 = toRad(a.lat);
                            const lat2 = toRad(b.lat);
                            const h = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
                            const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
                            return R * c;
                          };
                          const distKm = haversine(path[path.length - 1], path[0]);
                          const speedKmph = 30; // assume 30 km/h avg rider speed
                          const etaMinutes = Math.round((distKm / speedKmph) * 60);
                          return (
                            <div className="mt-2 text-sm text-gray-700">
                              <p><strong>Distance:</strong> {distKm.toFixed(2)} km</p>
                              <p><strong>ETA:</strong> {etaMinutes <= 0 ? 'Arriving' : `${etaMinutes} min`}</p>
                            </div>
                          );
                        })()
                      )}
                    </>
                  );
                })()
              }
            </div>
            {trackingOrder.courier && (
              <div className="mt-2">
                <p><strong>Rider:</strong> {trackingOrder.courier.name} — {trackingOrder.courier.phone}</p>
              </div>
            )}
          </div>
        ) : (
          <p>No order selected.</p>
        )}
      </Modal>

      {/* Preferences Modal */}
      <Modal open={preferencesOpen} onClose={() => setPreferencesOpen(false)} title="Edit Preferences">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block mb-2">Dietary Restrictions</label>
            <div className="grid grid-cols-2 gap-2">
              {['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'dairy-free'].map((diet) => (
                <label key={diet} className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('preferences.dietary')}
                    value={diet}
                    className="mr-2"
                  />
                  {diet.charAt(0).toUpperCase() + diet.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Favorite Cuisines</label>
            <input
              {...register('preferences.cuisine')}
              placeholder="e.g., Italian, Chinese, Mexican"
              className="border p-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Price Range</label>
            <select {...register('preferences.priceRange')} className="border p-2 w-full">
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPreferencesOpen(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
