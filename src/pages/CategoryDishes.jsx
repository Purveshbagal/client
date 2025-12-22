import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import DishCard from '../components/DishCard';

const CategoryDishes = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState({});

  useEffect(() => {
    fetchDishesByCategory();
  }, [category]);

  const fetchDishesByCategory = async () => {
    setLoading(true);
    try {
      // Fetch all dishes
      const dishesResponse = await api.get('/dishes', { 
        params: { limit: 100 } 
      });
      
      const allDishes = dishesResponse.data.dishes || [];
      
      // Filter dishes based on category
      let filteredDishes = [];
      
      const categoryLower = category.toLowerCase();
      
      if (categoryLower === 'veg') {
        filteredDishes = allDishes.filter(dish => 
          dish.type?.toLowerCase() === 'vegetarian' || 
          dish.type?.toLowerCase() === 'veg' ||
          dish.dietary?.includes('vegetarian')
        );
      } else if (categoryLower === 'non veg') {
        filteredDishes = allDishes.filter(dish => 
          dish.type?.toLowerCase() === 'non-veg' || 
          dish.type?.toLowerCase() === 'non veg' ||
          dish.type?.toLowerCase() === 'nonveg'
        );
      } else {
        // For other categories, match with dish cuisine or category
        filteredDishes = allDishes.filter(dish => 
          dish.cuisine?.toLowerCase().includes(categoryLower) ||
          dish.category?.toLowerCase().includes(categoryLower) ||
          dish.name?.toLowerCase().includes(categoryLower)
        );
      }

      setDishes(filteredDishes);

      // Build restaurant map from populated dish data
      const restaurantMap = {};
      filteredDishes.forEach(dish => {
        if (dish.restaurant && dish.restaurant._id) {
          restaurantMap[dish.restaurant._id] = dish.restaurant;
        }
      });

      setRestaurants(restaurantMap);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {category} dishes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-4 transition"
          >
            ← Back to Home
          </button>
          
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-900">{category}</h1>
            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
              {dishes.length} {dishes.length === 1 ? 'Dish' : 'Dishes'}
            </span>
          </div>
          <p className="text-gray-600 mt-2">Explore delicious {category.toLowerCase()} dishes from various restaurants</p>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="container mx-auto px-4 py-8">
        {dishes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dishes.map((dish) => (
              <div key={dish._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {/* Restaurant Name Badge */}
                {dish.restaurant && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-semibold">
                    📍 {dish.restaurant.name}
                  </div>
                )}
                
                {/* Dish Card */}
                <DishCard 
                  dish={dish} 
                  restaurantId={dish.restaurant?._id || dish.restaurant}
                  showRestaurant={false}
                />
                
                {/* Restaurant Details Link */}
                {dish.restaurant && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => navigate(`/restaurant/${dish.restaurant._id}`)}
                      className="w-full text-center text-orange-600 hover:text-orange-700 text-sm font-semibold mt-2 py-2 border border-orange-200 rounded-lg hover:bg-orange-50 transition"
                    >
                      View Full Menu →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No dishes found</h3>
            <p className="text-gray-500 mb-6">We couldn't find any {category.toLowerCase()} dishes at the moment</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition"
            >
              Browse All Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDishes;
