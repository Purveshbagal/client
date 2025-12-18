import React from 'react';

const StatCard = ({ title, value, subtitle, icon, bgColor = 'bg-blue-500', trend, trendUp = true }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-2">{subtitle}</p>}
          {trend && (
            <div className={`text-xs mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </div>
        {icon && (
          <div className={`${bgColor} p-3 rounded-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
