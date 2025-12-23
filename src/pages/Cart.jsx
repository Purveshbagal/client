import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import formatPrice from '../utils/currency';
import BillSummary from '../components/BillSummary';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cart, updateQuantity, removeFromCart, getTotal } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return <p>Please login to view your cart.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🛒 Your Cart</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
            <div className="text-5xl md:text-6xl mb-4">🛍️</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">Looks like you haven't added anything yet. Let's fix that!</p>
            <button
              onClick={() => navigate('/home')}
              className="inline-block px-6 md:px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 font-semibold">
                  {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
                </div>

                <div className="space-y-4 p-3 md:p-4">
                  {cart.map((item) => (
                    <div
                      key={item.dish._id}
                      className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                    >
                      {/* Image */}
                      <div className="w-full sm:w-20 md:w-24 h-32 sm:h-20 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-300">
                        {item.dish.image ? (
                          <img
                            src={item.dish.image}
                            alt={item.dish.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Details and Controls Container */}
                      <div className="flex-1 flex flex-col justify-between">
                        {/* Details */}
                        <div>
                          <h3 className="font-bold text-gray-900 text-base md:text-lg">{item.dish.name}</h3>
                          {item.dish.description && (
                            <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">{item.dish.description}</p>
                          )}
                        </div>
                        
                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg md:text-xl font-bold text-green-600">
                            {formatPrice(item.dish.price * item.quantity)}
                          </span>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border-2 border-orange-500 rounded-lg bg-white">
                              <button
                                aria-label="decrease quantity"
                                onClick={() => updateQuantity(item.dish._id, Math.max(1, item.quantity - 1))}
                                className="px-2 md:px-3 py-1 md:py-2 hover:bg-orange-50 font-bold text-orange-600 transition text-lg"
                              >
                                −
                              </button>
                              <div className="px-3 md:px-4 py-1 md:py-2 font-semibold text-gray-900 min-w-[40px] md:min-w-[50px] text-center">
                                {item.quantity}
                              </div>
                              <button
                                aria-label="increase quantity"
                                onClick={() => updateQuantity(item.dish._id, item.quantity + 1)}
                                className="px-2 md:px-3 py-1 md:py-2 hover:bg-orange-50 font-bold text-orange-600 transition text-lg"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.dish._id)}
                              className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-semibold text-xs md:text-sm transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 border-t">
                  <p className="text-sm text-gray-600 text-center">
                    ✏️ You can edit quantities or remove items anytime before checkout
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:sticky lg:top-24">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Order Summary</h3>
                <BillSummary
                  items={cart}
                  ctaLabel="Proceed to Checkout"
                  onCta={() => navigate('/checkout')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
