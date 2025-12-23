import { Link } from 'react-router-dom';
import resolveImage from '../utils/resolveImage';
import StarRating from './StarRating';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col hover:scale-105">
        {/* Image Container */}
        <div className="relative overflow-hidden h-40 md:h-48 bg-gray-200">
          <img
            src={resolveImage(restaurant.imageUrl) || restaurant.image || '/placeholder-restaurant.jpg'}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Badge */}
          {restaurant.averageRating && (
            <div className="absolute top-3 right-3 bg-white rounded-full shadow-lg px-3 py-1 flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-bold text-gray-900">{restaurant.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 flex-1 flex flex-col">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition">
            {restaurant.name}
          </h3>

          {/* Details */}
          <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600 mb-auto">
            {restaurant.cuisine && restaurant.cuisine.length > 0 && (
              <p className="line-clamp-1">
                <span className="text-gray-900 font-semibold">{restaurant.cuisine.slice(0, 2).join(', ')}</span>
                {restaurant.cuisine.length > 2 && <span> +{restaurant.cuisine.length - 2}</span>}
              </p>
            )}

            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              {restaurant.deliveryTime && (
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{restaurant.deliveryTime} min</span>
                </div>
              )}
              {restaurant.city && (
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate">{restaurant.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
            <div className="inline-flex items-center text-orange-600 font-semibold group-hover:gap-2 gap-1 transition-all text-sm md:text-base">
              Order Now <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
