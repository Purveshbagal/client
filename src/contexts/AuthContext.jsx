import { createContext, useState, useEffect } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('swadhan_access');
    if (token) {
      // Verify token and fetch user info
      api.get('/auth/me')
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('swadhan_access');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email: String(email), password: String(password) });
    const { accessToken, refreshToken, user: userData } = response.data;
    localStorage.setItem('swadhan_access', accessToken);
    localStorage.setItem('swadhan_refresh', refreshToken);
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { accessToken, refreshToken, user: userData } = response.data;
    localStorage.setItem('swadhan_access', accessToken);
    localStorage.setItem('swadhan_refresh', refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('swadhan_refresh');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    localStorage.removeItem('swadhan_access');
    localStorage.removeItem('swadhan_refresh');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = async (userData) => {
    try {
      console.log('Updating user with data:', userData);
      const response = await api.put('/users/profile', userData);
      setUser(response.data);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      console.error('Update error:', error.response?.data);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
