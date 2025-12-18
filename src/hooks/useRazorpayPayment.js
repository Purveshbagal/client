/**
 * useRazorpayPayment - Custom React Hook for Razorpay Integration
 * 
 * This hook handles the complete Razorpay payment flow:
 * 1. Load Razorpay SDK script
 * 2. Create Razorpay order
 * 3. Open Razorpay checkout modal
 * 4. Handle payment success/failure
 * 5. Verify payment on backend
 * 
 * Usage:
 * const { initiatePayment, isLoading } = useRazorpayPayment();
 * await initiatePayment(orderId, { onSuccess, onFailure });
 */

import { useState, useCallback } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/paymentService';
import { toast } from 'react-toastify';

// Load Razorpay SDK script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    
    document.body.appendChild(script);
  });
};

export const useRazorpayPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initiate Razorpay Payment
   * 
   * @param {string} orderId - Database order ID
   * @param {Object} options - Configuration options
   * @param {Function} options.onSuccess - Callback when payment succeeds
   * @param {Function} options.onFailure - Callback when payment fails
   * @param {Object} options.userDetails - User details for prefill (name, email, phone)
   * @returns {Promise<void>}
   */
  const initiatePayment = useCallback(async (orderId, options = {}) => {
    const {
      onSuccess = () => {},
      onFailure = () => {},
      userDetails = {}
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Step 2: Create Razorpay order on backend
      const orderData = await createRazorpayOrder(orderId);
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const { order, key, amount } = orderData;

      // Step 3: Configure Razorpay checkout options
      const razorpayOptions = {
        key: key, // Razorpay Key ID (public key)
        amount: order.amount, // Amount in paise
        currency: order.currency || 'INR',
        name: 'Swadhan Eats',
        description: 'Food Order Payment',
        order_id: order.id, // Razorpay order ID
        
        // Payment success handler
        handler: async (response) => {
          try {
            setIsLoading(true);
            
            // Step 4: Verify payment on backend
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId
            };

            const verificationResult = await verifyRazorpayPayment(verificationData);

            if (verificationResult.success) {
              toast.success('Payment successful! Your order is confirmed.');
              onSuccess(verificationResult.order);
            } else {
              toast.error('Payment verification failed. Please contact support.');
              onFailure(verificationResult);
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            toast.error('Payment verification failed. Please contact support.');
            onFailure(verifyError);
          } finally {
            setIsLoading(false);
          }
        },

        // Prefill user details
        prefill: {
          name: userDetails.name || '',
          email: userDetails.email || '',
          contact: userDetails.phone || ''
        },

        // Theme customization
        theme: {
          color: '#3399cc'
        },

        // Modal configuration
        modal: {
          // Called when user closes the payment modal
          ondismiss: () => {
            console.log('Payment modal closed by user');
            toast.warning('Payment cancelled. You can retry payment anytime.');
            setIsLoading(false);
            onFailure({ 
              reason: 'user_cancelled',
              message: 'Payment cancelled by user' 
            });
          },
          
          // Prevent escape key from closing modal
          escape: true,
          
          // Show address collection in Razorpay modal (optional)
          backdropclose: false
        },

        // Retry configuration
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      // Step 5: Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(razorpayOptions);
      
      // Handle payment failures
      razorpayInstance.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setIsLoading(false);
        onFailure({
          reason: 'payment_failed',
          error: response.error
        });
      });

      razorpayInstance.open();
      setIsLoading(false);

    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err);
      toast.error(err.message || 'Failed to initiate payment');
      setIsLoading(false);
      onFailure(err);
    }
  }, []);

  return {
    initiatePayment,
    isLoading,
    error
  };
};

export default useRazorpayPayment;
