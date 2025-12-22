import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import resolveImage from '../utils/resolveImage';
import formatPrice from '../utils/currency';
import StarRating from './StarRating';

const DishCard = ({ dish, restaurantId }) => {
  const navigate = useNavigate();
  const { addToCart, updateQuantity, getQuantity } = useCart();

  const currentQuantity = getQuantity(dish._id);

  const handleAddToCart = () => {
    addToCart(dish, restaurantId);
  };

  const handleIncrement = () => {
    updateQuantity(dish._id, currentQuantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(dish._id, currentQuantity - 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Container */}
      <div className="relative overflow-hidden h-40 bg-gray-200">
        <img
          src={resolveImage(dish.imageUrl) || dish.image || '/placeholder-dish.jpg'}
          alt={dish.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {!dish.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{dish.name}</h3>

          {dish.description && (
            <p className="text-xs text-gray-600 mb-1 line-clamp-1">{dish.description}</p>
          )}

          {/* Rating */}
          {dish.averageRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <StarRating rating={dish.averageRating} size="sm" />
              <span className="text-xs text-gray-500">({dish.reviewCount || 0})</span>
            </div>
          )}
        </div>

        {/* Price and Actions */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-green-600">{formatPrice(dish.price)}</span>
          </div>

          {dish.available ? (
            currentQuantity > 0 ? (
              <div className="flex items-center justify-center">
                <div className="flex items-center border-2 border-orange-500 rounded-md bg-white w-full">
                  <button
                    onClick={handleDecrement}
                    className="flex-1 px-2 py-1 text-orange-600 hover:bg-orange-50 font-bold transition text-sm"
                    aria-label="decrease quantity"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-bold text-gray-900 text-sm">{currentQuantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="flex-1 px-2 py-1 text-orange-600 hover:bg-orange-50 font-bold transition text-sm"
                    aria-label="increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-2 rounded-lg font-bold transition shadow-md hover:shadow-lg text-sm"
              >
                Add to Cart
              </button>
            )
          ) : (
            <button
              disabled
              className="w-full bg-gray-400 text-white px-3 py-2 rounded-lg cursor-not-allowed font-semibold text-sm"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;
