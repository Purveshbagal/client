import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import formatPrice from '../utils/currency';
import resolveImage from '../utils/resolveImage';

const CartPopup = ({ isOpen, onClose, addedItem }) => {
  const navigate = useNavigate();
  const { cart, getTotal } = useCart();

  useEffect(() => {
    if (isOpen) {
      // Auto-close popup after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md mx-auto overflow-hidden animate-slide-up sm:animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success Icon */}
        <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3 animate-bounce-once">
            <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Added to Cart!</h3>
        </div>

        {/* Added Item Details */}
        {addedItem && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              <img
                src={resolveImage(addedItem.imageUrl) || addedItem.image || '/placeholder-dish.jpg'}
                alt={addedItem.name}
                className="w-16 h-16 object-cover rounded-lg shadow-sm"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{addedItem.name}</h4>
                <p className="text-sm text-gray-600">Quantity: {cart.find(item => item.dish._id === addedItem._id)?.quantity || 1}</p>
                <p className="font-bold text-orange-600">{formatPrice(addedItem.price)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cart Summary */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">
                🛒 Total Items in Cart:
              </span>
              <span className="font-bold text-xl text-gray-900">{cart.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Cart Total:</span>
              <span className="font-bold text-2xl text-orange-600">{formatPrice(getTotal())}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleViewCart}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View Cart & Checkout
            </button>

            <button
              onClick={handleContinueShopping}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-xl font-semibold transition hover:border-orange-500 hover:text-orange-600"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Quick Cart Items Preview */}
        {cart.length > 1 && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500 text-center">
              + {cart.length - 1} more item{cart.length - 1 !== 1 ? 's' : ''} in cart
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-bounce-once {
          animation: bounce-once 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CartPopup;
