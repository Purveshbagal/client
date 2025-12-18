import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import ProfileOrders from './pages/profile/ProfileOrders';
import ProfileHistory from './pages/profile/ProfileHistory';
import ProfileSettings from './pages/profile/ProfileSettings';
import ProfileSupport from './pages/profile/ProfileSupport';
import ContactUs from './pages/ContactUs';
import EnhancedAdminDashboard from './pages/admin/EnhancedAdminDashboard';
import DishesAdmin from './pages/admin/DishesAdmin';
import RestaurantsAdmin from './pages/admin/RestaurantsAdmin';
import OrderTracking from './pages/OrderTracking';
import InvoicePage from './pages/InvoicePage';
import CourierDashboard from './pages/CourierDashboard';

function AppContent() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Hide header and footer on landing and login/register pages
  const hideHeaderFooter = !user || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/landing';

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={user ? <Home /> : <Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />}>

            <Route path="orders" element={<ProfileOrders />} />
            <Route path="history" element={<ProfileHistory />} />
            <Route path="settings" element={<ProfileSettings />} />
            <Route path="support" element={<ProfileSupport />} />
          </Route>
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/order/:id/track" element={<OrderTracking />} />
          <Route path="/order/:id/invoice" element={<InvoicePage />} />
          <Route path="/courier" element={<CourierDashboard />} />
          <Route path="/admin" element={<EnhancedAdminDashboard />} />
          <Route path="/admin/dashboard" element={<EnhancedAdminDashboard />} />
          <Route path="/admin/dishes" element={<DishesAdmin />} />
          <Route path="/admin/restaurants" element={<RestaurantsAdmin />} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
