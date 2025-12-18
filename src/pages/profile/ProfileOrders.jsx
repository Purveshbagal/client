import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';

export default function ProfileOrders() {
  const { activeOrders, formatPrice, getStatusColor, openTracker } = useOutletContext();
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔥 Your Orders</h2>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
          {activeOrders.length} Active
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-gray-500 text-lg mb-1">No active orders</p>
          <p className="text-gray-400 text-sm">Your running orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => (
            <div key={order._id} className="border-2 border-orange-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-orange-300 bg-gradient-to-r from-orange-50 to-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 text-sm font-mono">#{order._id.slice(-8)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    📅 {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{formatPrice(order.total)}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toggle(order._id)}
                  className="flex-1 border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  {expanded[order._id] ? 'Hide details ▲' : 'Show details ▼'}
                </button>
                <button 
                  onClick={() => openTracker(order)} 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all shadow-md"
                >
                  📍 Track Order Live
                </button>
              </div>

              {expanded[order._id] && (
                <div className="bg-white rounded-lg p-4 mt-4 border border-orange-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item._id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold text-orange-600">{item.quantity}x</span> {item.dish.name}
                        </span>
                        <span className="text-gray-600">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
