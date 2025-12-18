/**
 * Payment Service - Razorpay Integration
 * 
 * This service handles all payment-related API calls for the food delivery application.
 * It integrates with Razorpay payment gateway for secure online payments.
 */

import api from './api';

/**
 * Create Razorpay Order
 * 
 * Step 1 of payment flow - creates a Razorpay order on the backend
 * 
 * @param {string} orderId - The order ID from the database
 * @returns {Promise<Object>} - Razorpay order details including order_id and key
 * @throws {Error} - If order creation fails
 */
export const createRazorpayOrder = async (orderId) => {
  try {
    const response = await api.post('/payments/create-order', { orderId });
    return response.data;
  } catch (error) {
    console.error('Create Razorpay order failed:', error);
    throw error;
  }
};

/**
 * Verify Razorpay Payment
 * 
 * Step 2 of payment flow - verifies payment signature on the backend
 * This ensures the payment was genuinely made through Razorpay
 * 
 * @param {Object} paymentData - Payment verification data
 * @param {string} paymentData.razorpay_order_id - Razorpay order ID
 * @param {string} paymentData.razorpay_payment_id - Razorpay payment ID
 * @param {string} paymentData.razorpay_signature - Razorpay signature for verification
 * @param {string} paymentData.orderId - Our database order ID
 * @returns {Promise<Object>} - Verification result with order details
 * @throws {Error} - If verification fails
 */
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
};

/**
 * Mark Payment as Failed
 * 
 * Called when user closes payment modal or payment fails
 * Updates order status to failed
 * 
 * @param {string} orderId - The order ID from the database
 * @param {string} razorpayOrderId - The Razorpay order ID
 * @param {string} reason - Reason for failure (e.g., 'user_cancelled', 'payment_failed')
 * @returns {Promise<Object>} - Result of marking payment as failed
 */
export const markPaymentFailed = async (orderId, razorpayOrderId, reason = 'payment_failed') => {
  try {
    // For failed payments, we still need to update the order status
    // This can be done through a dedicated endpoint or by calling verify with failure info
    const response = await api.post('/payment/verify', {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: 'failed',
      razorpay_signature: 'failed',
      failed: true,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Mark payment failed error:', error);
    // Even if marking failed fails, we should return an error
    throw error;
  }
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  markPaymentFailed
};
