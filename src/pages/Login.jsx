import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../api/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user-login'); // 'user-login', 'user-register', 'admin-login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  // Update demo credentials when switching to admin
  useEffect(() => {
    if (activeTab === 'admin-login') {
      setEmail('admin@swadhaneats.com');
      setPassword('Admin@123');
    } else {
      setEmail('');
      setPassword('');
    }
  }, [activeTab]);

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Admin login successful!');
      navigate('/admin');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !city) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        city,
        address,
      });
      toast.success('Registration successful! Please login.');
      setActiveTab('user-login');
      setEmail('');
      setPassword('');
      setName('');
      setAddress('');
      setCity('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col justify-center items-start">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-5xl">🍽️</div>
                <h1 className="text-4xl font-black text-gray-900">Swadhan Eats</h1>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">
                Order delicious food from the best restaurants and get it delivered to your doorstep in 30 minutes.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚡</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Fast Delivery</h3>
                  <p className="text-gray-600">Get your food in 30 minutes or less</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">🏆</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Best Restaurants</h3>
                  <p className="text-gray-600">500+ top-rated restaurants to choose from</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">💳</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Safe Payment</h3>
                  <p className="text-gray-600">Secure and easy payment options</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('user-login')}
                className={`pb-4 px-4 font-semibold transition-all border-b-2 ${
                  activeTab === 'user-login'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                User Login
              </button>
              <button
                onClick={() => setActiveTab('user-register')}
                className={`pb-4 px-4 font-semibold transition-all border-b-2 ${
                  activeTab === 'user-register'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Register
              </button>
              <button
                onClick={() => setActiveTab('admin-login')}
                className={`pb-4 px-4 font-semibold transition-all border-b-2 ${
                  activeTab === 'admin-login'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Login Form */}
            {activeTab === 'user-login' && (
              <form onSubmit={handleUserLogin}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back!</h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 mb-4"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="text-center text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('user-register')}
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </form>
            )}

            {/* User Register Form */}
            {activeTab === 'user-register' && (
              <form onSubmit={handleUserRegister}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="Enter your delivery address"
                    rows="3"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 mb-4"
                >
                  {loading ? 'Creating account...' : 'Register'}
                </button>

                <p className="text-center text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('user-login')}
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Login here
                  </button>
                </p>
              </form>
            )}

            {/* Admin Login Form */}
            {activeTab === 'admin-login' && (
              <form onSubmit={handleAdminLogin}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h2>

                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>Demo Admin Credentials:</strong> <br />
                    Email: admin@swadhaneats.com <br />
                    Password: Admin@123
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="admin@swadhaneats.com"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="Enter admin password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login as Admin'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
