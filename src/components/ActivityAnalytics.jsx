import React, { useEffect, useState } from 'react';
import activityService from '../api/activityService';

const ActivityAnalytics = () => {
  const [stats, setStats] = useState({ byType: [], bySeverity: [], byStatus: [] });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await activityService.getActivityStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const renderList = (items) => (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it._id} className="flex justify-between">
          <span className="text-gray-700">{it._id}</span>
          <span className="font-mono text-gray-900">{it.count}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Activity Analytics</h2>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">By Type</h3>
            {stats.byType && stats.byType.length > 0 ? renderList(stats.byType) : <div className="text-gray-500">No data</div>}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">By Severity</h3>
            {stats.bySeverity && stats.bySeverity.length > 0 ? renderList(stats.bySeverity) : <div className="text-gray-500">No data</div>}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">By Status</h3>
            {stats.byStatus && stats.byStatus.length > 0 ? renderList(stats.byStatus) : <div className="text-gray-500">No data</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityAnalytics;
