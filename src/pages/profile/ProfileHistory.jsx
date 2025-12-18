import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';

export default function ProfileHistory() {
  const { completedOrders, formatPrice, getStatusColor } = useOutletContext();
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📜 Order History</h2>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          {completedOrders.length} Completed
        </span>
      </div>

      {completedOrders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-500 text-lg mb-1">No order history</p>
          <p className="text-gray-400 text-sm">Completed orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {completedOrders.map((order) => (
            <div key={order._id} className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-gray-300">
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
                  <p className="text-2xl font-bold text-gray-800">{formatPrice(order.total)}</p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => toggle(order._id)}
                  className="w-full border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  {expanded[order._id] ? 'Hide details ▲' : 'Show details ▼'}
                </button>
              </div>

              {expanded[order._id] && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
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

                  {order.status === 'delivered' && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <span>✅</span>
                      <span className="font-semibold">Successfully Delivered</span>
                    </div>
                  )}
                  {order.status === 'cancelled' && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <span>❌</span>
                      <span className="font-semibold">Order Cancelled</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
