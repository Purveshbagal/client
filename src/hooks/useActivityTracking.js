import { useEffect, useCallback } from 'react';
import axios from 'axios';

const useActivityTracking = (activityType, details = {}) => {
  const trackActivity = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        type: activityType,
        details,
        description: generateActivityDescription(activityType, details),
      };

      await axios.post('/api/activities/track', payload, config);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [activityType, details]);

  return trackActivity;
};

const generateActivityDescription = (type, details) => {
  const descriptions = {
    USER_REGISTRATION: 'User registered successfully',
    USER_LOGIN: 'User logged in',
    RESTAURANT_VIEWED: `Viewed restaurant: ${details.restaurantName || 'Unknown'}`,
    DISH_VIEWED: `Viewed dish: ${details.dishName || 'Unknown'}`,
    CART_UPDATED: 'Cart updated',
    ORDER_PLACED: `Order placed for $${details.total || 0}`,
    PAYMENT_PROCESSED: `Payment processed for $${details.amount || 0}`,
    RESTAURANT_CREATED: `Restaurant created: ${details.restaurantName || 'Unknown'}`,
    DISH_CREATED: `Dish created: ${details.dishName || 'Unknown'}`,
    ADMIN_LOGIN: 'Admin logged in',
    ADMIN_ACTION: details.action || 'Admin action performed',
  };

  return descriptions[type] || 'Activity recorded';
};

export default useActivityTracking;
