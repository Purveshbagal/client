import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-lg border-b-4 border-orange-500">
      <div className="container mx-auto px-4 md:px-12 py-4">
        <div className="flex justify-between items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
            <div className="text-3xl">🍽️</div>
            <h1 className="text-2xl font-black text-gray-900 hidden sm:block">Swadhan Eats</h1>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ pathname: '/home', search: query ? `?q=${encodeURIComponent(query)}` : '' });
            }}
            className="flex-1 hidden md:block max-w-md"
          >
            <div className="relative">
              <input
                type="search"
                aria-label="Search restaurants"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines..."
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700 font-semibold"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Navigation */}
          <nav className="flex items-center gap-4 md:gap-6">
            <Link to="/home" className="text-gray-700 hover:text-orange-600 font-semibold transition">
              Home
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-orange-600 font-semibold transition">
              🛒 Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative flex items-center gap-4">
                <div className="hidden md:block text-sm">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-gray-600 text-xs">{user.email}</p>
                </div>

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-lg transition-all font-bold"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition font-semibold"
                      onClick={() => setDropdownOpen(false)}
                    >
                      👤 Profile
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition font-semibold border-t border-gray-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        ⚙️ Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition font-semibold border-t border-gray-200"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-orange-600 border-2 border-orange-600 rounded-lg hover:bg-orange-50 transition font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ pathname: '/home', search: query ? `?q=${encodeURIComponent(query)}` : '' });
          }}
          className="md:hidden mt-4"
        >
          <div className="relative">
            <input
              type="search"
              aria-label="Search restaurants"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700 font-semibold"
            >
              🔍
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
