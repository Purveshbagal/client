import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import resolveImage from '../utils/resolveImage';
import formatPrice from '../utils/currency';
import { toast } from 'react-toastify';

const DishCard = ({ dish }) => {
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cart } = useCart();

  const existingItem = cart.find(item => item.dish._id === dish._id);
  const currentQuantity = existingItem ? existingItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart(dish);
    toast.success(`${dish.name} added to cart successfully!`);
  };

  const handleIncrement = () => {
    updateQuantity(dish._id, currentQuantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(dish._id, currentQuantity - 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col hover:scale-105">
      {/* Image Container */}
      <div className="relative overflow-hidden h-48 bg-gray-200">
        <img
          src={resolveImage(dish.imageUrl) || dish.image || '/placeholder-dish.jpg'}
          alt={dish.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {!dish.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{dish.name}</h3>

        {dish.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dish.description}</p>
        )}

        {/* Rating */}
        {dish.averageRating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={dish.averageRating} size="sm" />
            <span className="text-xs text-gray-500">({dish.reviewCount || 0})</span>
          </div>
        )}

        {/* Price and Actions */}
        <div className="mt-auto pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">{formatPrice(dish.price)}</span>
          </div>

          {dish.available ? (
            currentQuantity > 0 ? (
              <div className="flex items-center justify-center">
                <div className="flex items-center border-2 border-orange-500 rounded-lg bg-white w-full">
                  <button
                    onClick={handleDecrement}
                    className="flex-1 px-3 py-2 text-orange-600 hover:bg-orange-50 font-bold transition"
                    aria-label="decrease quantity"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-bold text-gray-900">{currentQuantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="flex-1 px-3 py-2 text-orange-600 hover:bg-orange-50 font-bold transition"
                    aria-label="increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg"
              >
                Add to Cart
              </button>
            )
          ) : (
            <button
              disabled
              className="w-full bg-gray-400 text-white px-4 py-3 rounded-lg cursor-not-allowed font-semibold"
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
