import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const FloatingCartBar = () => {
  const navigate = useNavigate();
  const { cart, getTotal, getTotalItems } = useCart();

  const isVisible = cart.length > 0;

  if (!isVisible) {
    document.body.style.paddingBottom = '0';
    return null;
  }

  document.body.style.paddingBottom = '80px';

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-500 shadow-2xl animate-slide-up z-40">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex-1">
            <span className="text-gray-700 font-semibold text-sm md:text-base">
              {getTotalItems()} Item{getTotalItems() !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl md:text-2xl font-bold text-orange-600">₹{getTotal()}</span>
          </div>
          <button
            onClick={handleViewCart}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold transition shadow-lg hover:shadow-xl whitespace-nowrap text-sm md:text-base"
          >
            VIEW CART →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FloatingCartBar;
