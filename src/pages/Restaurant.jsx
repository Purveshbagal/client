import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import DishCard from '../components/DishCard';
import FloatingCartBar from '../components/FloatingCartBar';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import StarRating from '../components/StarRating';
import formatPrice from '../utils/currency';
import resolveImage from '../utils/resolveImage';
import { useCart } from '../hooks/useCart';

const Restaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, updateQuantity, getTotal, clearCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshReviews, setRefreshReviews] = useState(0);

  useEffect(() => {
    fetchRestaurant();
    fetchDishes();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await api.get(`/dishes?restaurant=${id}`);
      setDishes(response.data.dishes || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setRefreshReviews(prev => prev + 1);
    fetchRestaurant();
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="container mx-auto p-4">Restaurant not found</div>;
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Restaurant Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-4 md:mb-6 transition"
          >
            ← Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="lg:col-span-2">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">{restaurant.name}</h1>

              <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-4 md:mb-6">
                <div className="flex items-center gap-2">
                  <StarRating rating={restaurant.averageRating || 0} readonly />
                  <span className="text-gray-700 font-semibold text-sm md:text-base">
                    {restaurant.averageRating?.toFixed(1) || 'N/A'} ({restaurant.reviewCount || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                  <span className="text-lg md:text-xl">📍</span>
                  <span>{restaurant.city}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                  <span className="text-lg md:text-xl">⏱️</span>
                  <span>{restaurant.deliveryTime} min</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine?.map((c) => (
                  <span
                    key={c}
                    className="px-3 md:px-4 py-1 md:py-2 bg-orange-100 text-orange-700 rounded-full font-semibold text-xs md:text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {restaurant.imageUrl && (
              <div className="rounded-lg overflow-hidden shadow-lg h-48 md:h-64 mt-4 lg:mt-0">
                <img
                  src={resolveImage(restaurant.imageUrl)}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Menu</h2>
          <p className="text-gray-600 text-sm md:text-base">Explore delicious dishes from this restaurant</p>
        </div>

        {dishes.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {dishes.map((dish) => (
              <DishCard key={dish._id} dish={dish} restaurantId={id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-600 text-lg">No dishes available</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white border-t mt-8 md:mt-12">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <ReviewList
                targetType="restaurant"
                targetId={id}
                refreshTrigger={refreshReviews}
              />
            </div>
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="lg:sticky lg:top-4 bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                <h3 className="font-bold text-base md:text-lg mb-4">Leave a Review</h3>
                <ReviewForm
                  targetType="restaurant"
                  targetId={id}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FloatingCartBar />
    </>
  );
};

export default Restaurant;
