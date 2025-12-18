import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 rounded-2xl p-10 md:p-16 shadow-xl overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40 animate-pulse delay-75"></div>

      <div className="relative container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="flex-1 text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 font-semibold text-sm border border-white/30">
            <span className="text-lg">🎉</span>
            <span>Quick delivery to your door</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Delicious food delivered <span className="text-white drop-shadow-lg">in minutes</span>
          </h2>

          <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-md">
            Discover the best restaurants nearby — curated for you. Order your favorite meals and enjoy fresh food delivered fast.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/home')}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-orange-600 bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Order Now
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              className="px-8 py-4 font-bold text-white bg-white/20 backdrop-blur-sm border-2 border-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
            >
              Browse Cuisines
            </button>
          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-6 text-white">
            <div>
              <div className="text-2xl font-black">⚡ 30 min</div>
              <p className="text-sm text-white/80">or less delivery</p>
            </div>
            <div>
              <div className="text-2xl font-black">🏆 500+</div>
              <p className="text-sm text-white/80">restaurants</p>
            </div>
            <div>
              <div className="text-2xl font-black">⭐ 4.8</div>
              <p className="text-sm text-white/80">average rating</p>
            </div>
          </div>
        </div>

        {/* Right Content - Food Illustration */}
        <div className="flex-1 hidden md:flex">
          <div className="relative w-full h-80">
            {/* Main card */}
            <div className="absolute top-0 right-0 w-72 h-64 bg-white rounded-2xl shadow-2xl p-6 rotate-6 hover:rotate-0 transition-transform duration-300 flex flex-col items-center justify-center">
              <div className="text-8xl mb-3">🍕</div>
              <p className="font-bold text-gray-900 text-center">Hot & Fresh</p>
            </div>

            {/* Floating cards */}
            <div className="absolute bottom-6 left-6 w-20 h-20 bg-white rounded-xl shadow-xl p-3 -rotate-12 hover:rotate-0 transition-transform duration-300 flex items-center justify-center text-4xl">
              🍔
            </div>
            <div className="absolute top-24 left-0 w-20 h-20 bg-white rounded-xl shadow-xl p-3 rotate-12 hover:rotate-0 transition-transform duration-300 flex items-center justify-center text-4xl">
              🍜
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
