import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { connectSocket, listenDeliveryUpdates, listenOrderAssigned, listenOrderUpdates, disconnectSocket } from '../utils/socketClient';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    fetch(`/api/orders/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
      .then(res => res.json())
      .then(data => setOrder(data))
      .catch(() => {});

    const sock = connectSocket(token);

    const unsub1 = listenOrderUpdates((payload) => {
      if (payload.data && payload.data.order && payload.data.order._id === id) {
        setOrder(payload.data.order);
        setMessages(m => [`Order updated: ${payload.data.order.status}`, ...m]);
      }
    });

    const unsub2 = listenDeliveryUpdates((payload) => {
      if (payload.data && payload.data.order && payload.data.order._id === id) {
        setOrder(payload.data.order);
        setMessages(m => [`Delivery update: ${new Date(payload.timestamp).toLocaleTimeString()}`, ...m]);
      }
    });

    const unsub3 = listenOrderAssigned((payload) => {
      if (payload.data && payload.data.order && payload.data.order._id === id) {
        setOrder(payload.data.order);
        setMessages(m => [`Courier assigned: ${payload.data.order.courier?.name || 'unknown'}`, ...m]);
      }
    });

    return () => {
      try { unsub1(); unsub2(); unsub3(); } catch (e) {}
      disconnectSocket();
    };
  }, [id]);

  if (!order) return <div className="p-4">Loading order...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Order Tracking</h2>
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> ₹{order.totalPrice}</p>
        <p><strong>Address:</strong> {order.address}, {order.city}</p>

        <div className="mt-3">
          <h3 className="font-medium">Courier</h3>
          {order.courierRef || order.courier?.name ? (
            <div>
              <p><strong>Name:</strong> {order.courier?.name || '—'}</p>
              <p><strong>Phone:</strong> {order.courier?.phone || '—'}</p>
              <p><strong>Vehicle:</strong> {order.courier?.vehicleType || '—'}</p>
            </div>
          ) : (
            <p>No courier assigned yet</p>
          )}
        </div>

        <div className="mt-3">
          <a className="text-indigo-600" href={`/order/${order._id}/invoice`}>View / Download Invoice</a>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Live Updates</h3>
        <ul className="list-disc ml-5 mt-2">
          {messages.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </div>
    </div>
  );
}
