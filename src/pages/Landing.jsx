import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🍽️</div>
          <h1 className="text-3xl font-black text-gray-900">Swadhan Eats</h1>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 md:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-3 font-semibold text-sm">
              <span>⚡</span>
              <span>Quick delivery available</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
              Tasty Food{' '}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Delivered Fast
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Discover the finest restaurants in your area. Order now and enjoy delicious meals delivered to your doorstep in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={() => navigate('/login')}
                className="group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Order Now
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">⏱️</span>
                  <span className="text-xl font-bold text-gray-900">30 min</span>
                </div>
                <p className="text-xs text-gray-600">Fast delivery</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📍</span>
                  <span className="text-xl font-bold text-gray-900">500+</span>
                </div>
                <p className="text-xs text-gray-600">Restaurants</p>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 mb-1">⭐ 4.8</div>
                <p className="text-xs text-gray-600">Avg. rating</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative hidden md:block">
            <div className="relative w-full h-72 bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-3">🍕</div>
                  <p className="text-white font-bold text-xl">Foodie Paradise</p>
                  <p className="text-white/80 mt-1 text-sm">Best meals await</p>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-xl p-3 rotate-12 transform hover:rotate-0 transition-transform">
                <div className="text-3xl">🍔</div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-3 -rotate-12 transform hover:rotate-0 transition-transform">
                <div className="text-3xl">🍜</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 md:py-16 border-t border-gray-200">
        <div className="container mx-auto px-6 md:px-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">Why Choose Us?</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h4>
              <p className="text-gray-600">Delivered in 30 minutes or less, guaranteed</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Top Rated</h4>
              <p className="text-gray-600">Only the best restaurants in your city</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Fresh & Quality</h4>
              <p className="text-gray-600">Fresh ingredients guaranteed in every order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <p className="text-gray-400">© 2025 Swadhan Eats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
