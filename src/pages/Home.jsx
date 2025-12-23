import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import CategorySection from '../components/CategorySection';
import api from '../api/api';
import RestaurantCard from '../components/RestaurantCard';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState({
    q: '',
    cuisine: [],
    priceRange: '',
    rating: '',
    deliveryTime: '',
    dietary: [],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();

  // Sync search state with `q` query param so header search works
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setFilters(prev => ({ ...prev, q }));
    // reset to first page when query changes
    setPage(1);
  }, [location.search]);

  useEffect(() => {
    fetchRestaurants();
  }, [filters, page]);

  // Subscribe to server-sent events for real-time updates (development)
  useEffect(() => {
    let es;
    try {
      es = new EventSource('/api/stream/events');
      es.addEventListener('restaurant_created', (e) => {
        // refetch restaurants when a new one is created by admin
        fetchRestaurants();
      });
    } catch (err) {
      // ignore
    }
    return () => {
      if (es) es.close();
    };
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };

      // Apply filters
      if (filters.q) params.q = filters.q;
      if (filters.cuisine.length > 0) params.cuisine = filters.cuisine.join(',');
      if (filters.priceRange) params.priceRange = filters.priceRange;
      if (filters.rating) params.rating = filters.rating;
      if (filters.deliveryTime) params.deliveryTime = filters.deliveryTime;
      if (filters.dietary.length > 0) params.dietary = filters.dietary.join(',');
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await api.get('/restaurants', { params });
      setRestaurants(response.data.restaurants || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      // Fallback mock data so UI can be previewed without backend
      const sample = [
        {
          _id: '1',
          name: 'Noodle Nest',
          city: 'Bengaluru',
          cuisine: ['Chinese'],
          averageRating: 4.0,
          deliveryTime: 25,
          imageUrl: '/placeholder-restaurant.jpg',
        },
        {
          _id: '2',
          name: 'Green Garden',
          city: 'Chennai',
          cuisine: ['Vegetarian'],
          averageRating: 4.3,
          deliveryTime: 30,
          imageUrl: '/placeholder-restaurant.jpg',
        },
        {
          _id: '3',
          name: 'Grill House',
          city: 'Hyderabad',
          cuisine: ['Non-Veg'],
          averageRating: 4.1,
          deliveryTime: 35,
          imageUrl: '/placeholder-restaurant.jpg',
        },
      ];

      // Apply advanced filters to fallback data
      let filtered = sample;

      if (filters.q) {
        const q = filters.q.toLowerCase();
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.cuisine.some(c => c.toLowerCase().includes(q))
        );
      }

      if (filters.cuisine.length > 0) {
        filtered = filtered.filter(r =>
          filters.cuisine.some(c => r.cuisine.includes(c))
        );
      }

      if (filters.rating) {
        const minRating = Number(filters.rating);
        filtered = filtered.filter(r => r.averageRating >= minRating);
      }

      if (filters.deliveryTime) {
        const maxTime = Number(filters.deliveryTime);
        filtered = filtered.filter(r => r.deliveryTime <= maxTime);
      }

      // Sort
      if (filters.sortBy === 'name') {
        filtered.sort((a, b) => filters.sortOrder === 'asc' ?
          a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      } else if (filters.sortBy === 'averageRating') {
        filtered.sort((a, b) => filters.sortOrder === 'asc' ?
          a.averageRating - b.averageRating : b.averageRating - a.averageRating);
      } else if (filters.sortBy === 'deliveryTime') {
        filtered.sort((a, b) => filters.sortOrder === 'asc' ?
          a.deliveryTime - b.deliveryTime : b.deliveryTime - a.deliveryTime);
      }

      setRestaurants(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Section - appears only on home page at the top */}
      <CategorySection />
      
      <div className="container mx-auto px-4 py-8">
        {/* Restaurants Section */}
        <div className="mt-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Popular Restaurants</h2>
            <p className="text-gray-600 mt-2">Order from your favorite restaurants and get fresh meals delivered</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : restaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-semibold">Page</span>
                  <div className="bg-white border-2 border-orange-500 rounded-lg px-4 py-2 font-bold text-orange-500">
                    {page}
                  </div>
                  <span className="text-gray-700 font-semibold">of {totalPages}</span>
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg">No restaurants found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
