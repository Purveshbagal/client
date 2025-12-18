import React, { useEffect, useState } from 'react';

const OrderAlertNotification = ({ order, onClose, autoClose = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoClose) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 8000);
    return () => clearTimeout(timer);
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  const totalPrice = order?.totalPrice || order?.total || 0;
  const itemCount = order?.items?.length || 0;
  const orderId = order?._id?.substring(0, 8) || 'Unknown';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-l-4 border-green-500 max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">New Order Received!</p>
                <p className="text-sm text-green-100">Order #{orderId}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Customer Info */}
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {order?.user?.name || 'Customer'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {order?.user?.phone || order?.user?.email || 'No contact'}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Delivery Address</p>
              <p className="text-xs text-gray-600 truncate">
                {order?.address || 'No address provided'}
              </p>
              {order?.city && (
                <p className="text-xs text-gray-500">
                  {order.city}
                </p>
              )}
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              📦 {itemCount} item{itemCount !== 1 ? 's' : ''} ordered
            </p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="text-xs text-gray-600 flex justify-between">
                  <span className="truncate flex-1">
                    {item.name || item.dish?.name || 'Item'} x{item.qty}
                  </span>
                  <span className="text-gray-500 flex-shrink-0 ml-2">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center border-t pt-3">
            <span className="text-sm font-semibold text-gray-700">Total Amount:</span>
            <span className="text-lg font-bold text-green-600">₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer - Action Button */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            View Order Details
          </button>
        </div>

        {/* Auto-close progress bar */}
        {autoClose && (
          <div className="h-1 bg-gray-200 animate-shrink-width"></div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-shrink-width {
          animation: shrinkWidth 8s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderAlertNotification;
