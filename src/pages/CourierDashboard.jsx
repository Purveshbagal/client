import React, { useEffect, useState } from 'react';
import { connectSocket, onEvent, disconnectSocket } from '../utils/socketClient';

export default function CourierDashboard() {
  const [courier, setCourier] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    // load courier profile
    fetch('/api/couriers/me', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then(res => res.json())
      .then(data => setCourier(data))
      .catch(() => {});

    connectSocket(token);

    const handler = (payload) => {
      if (!payload || !payload.data) return;
      // job assigned
      if (payload.event === 'job:assigned' || payload.event === 'job_assigned' || payload.event === 'jobAssigned') {
        setJobs(j => [payload.data.order, ...j]);
      }
    };

    onEvent('job:assigned', (p) => handler({ event: 'job:assigned', data: p.data }));

    return () => {
      try { disconnectSocket(); } catch (e) {}
    };
  }, []);

  const updateLocation = async () => {
    if (!courier) return;
    const token = localStorage.getItem('accessToken');
    await fetch(`/api/couriers/${courier._id}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ lat: Number(lat), lng: Number(lng) }),
    });
  };

  const accept = async (orderId) => {
    if (!courier) return;
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`/api/couriers/${courier._id}/jobs/${orderId}/accept`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '' } });
    if (res.ok) {
      const data = await res.json();
      setJobs(j => j.map(job => job._id === orderId ? data.order : job));
      alert('Job accepted');
    } else {
      const err = await res.json();
      alert(err.message || 'Failed to accept');
    }
  };

  const reject = async (orderId) => {
    if (!courier) return;
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`/api/couriers/${courier._id}/jobs/${orderId}/reject`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '' } });
    if (res.ok) {
      const data = await res.json();
      setJobs(j => j.filter(job => job._id !== orderId));
      alert('Job rejected');
    } else {
      const err = await res.json();
      alert(err.message || 'Failed to reject');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Courier Dashboard</h2>
      <div className="bg-white p-4 rounded shadow">
        {courier ? (
          <div>
            <p><strong>Name:</strong> {courier.name}</p>
            <p><strong>Available:</strong> {courier.available ? 'Yes' : 'No'}</p>
            <div className="mt-3">
              <h4 className="font-medium">Update Location</h4>
              <div className="flex gap-2 mt-2">
                <input className="border p-2 rounded" placeholder="lat" value={lat} onChange={e => setLat(e.target.value)} />
                <input className="border p-2 rounded" placeholder="lng" value={lng} onChange={e => setLng(e.target.value)} />
                <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={updateLocation}>Send</button>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading courier profile...</p>
        )}

        <div className="mt-4">
          <h4 className="font-medium">Assigned Jobs</h4>
          <ul className="list-disc ml-5 mt-2">
            {jobs.length === 0 && <li>No jobs yet</li>}
            {jobs.map(j => (
              <li key={j._id} className="mb-2">
                <div>{j._id} — {j.status} — ₹{j.totalPrice}</div>
                {j.status === 'assigned' && (
                  <div className="mt-1">
                    <button className="px-2 py-1 mr-2 bg-green-600 text-white rounded" onClick={() => accept(j._id)}>Accept</button>
                    <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => reject(j._id)}>Reject</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
