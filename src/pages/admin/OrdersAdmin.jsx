import React, { useEffect, useState } from 'react';
import api from '../../api/api';

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/orders');
      const data = resp.data;
      setOrders(data.orders || data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const assignCourier = async (orderId) => {
    try {
      const resp = await api.post(`/orders/${orderId}/assign`);
      if (resp.data && resp.data.order) {
        setOrders(prev => prev.map(o => o._id === orderId ? resp.data.order : o));
        alert('Assigned successfully');
      } else {
        alert('Assigned');
      }
    } catch (err) {
      console.error('assign error', err);
      alert(err.response?.data?.message || 'Failed to assign');
    }
  };

  if (loading) return <div className="p-4">Loading orders...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Admin — Orders</h2>
        <button onClick={fetchOrders} className="px-3 py-1 bg-gray-200 rounded">Refresh</button>
      </div>

      <div className="grid gap-4">
        {orders.map(o => (
          <div key={o._id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-gray-500">Order ID</div>
              <div className="font-mono text-sm">{o._id}</div>
              <div className="mt-2 text-gray-700">{o.user?.name || o.user?.email || 'Unknown user'}</div>
              <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
            </div>

            <div className="mt-3 md:mt-0">
              <div className="text-sm">Status: <span className="font-medium">{o.status}</span></div>
              <div className="text-lg font-bold mt-2">{o.totalPrice ? `₹${o.totalPrice}` : ''}</div>
            </div>

            <div className="mt-3 md:mt-0 flex items-center gap-2">
              <button onClick={() => setSelected(o)} className="px-3 py-1 bg-blue-600 text-white rounded">Details</button>
              <button onClick={() => assignCourier(o._id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Assign nearest</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500">Close</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Items</h4>
                <ul className="mt-2 space-y-2">
                  {selected.items.map(it => (
                    <li key={it._id || it.dish} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm text-gray-500">Qty: {it.qty} · ₹{it.price}</div>
                      </div>
                      <div className="font-semibold">₹{(it.price * it.qty).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">Delivery</h4>
                <div className="mt-2 text-sm text-gray-700">{selected.address}</div>
                <div className="mt-1 text-sm text-gray-500">{selected.city}</div>

                <h4 className="font-semibold mt-4">Restaurant / Hotel</h4>
                <div className="mt-2 text-sm text-gray-700">{selected.items && selected.items[0] && selected.items[0].dish && selected.items[0].dish.restaurant ? (selected.items[0].dish.restaurant.name || 'Restaurant') : (selected.restaurantName || 'Unknown')}</div>

                <h4 className="font-semibold mt-4">Bill</h4>
                <div className="mt-2">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{(selected.totalPrice || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span>Tax</span><span>—</span></div>
                  <div className="flex justify-between text-lg font-bold mt-2"><span>Total</span><span>₹{(selected.totalPrice || 0).toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
