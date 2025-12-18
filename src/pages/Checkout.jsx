import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import useRazorpayPayment from '../hooks/useRazorpayPayment';
import api from '../api/api';
import { toast } from 'react-toastify';
import formatPrice from '../utils/currency';
import Modal from '../components/Modal';
import QRCode from 'react-qr-code';
import BillSummary from '../components/BillSummary';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [upiConfirming, setUpiConfirming] = useState(false);
  const [codConfirmationOpen, setCodConfirmationOpen] = useState(false);
  const [codFormData, setCodFormData] = useState(null);
  const UPI_ID = '7058409290-4@axl';
  
  // Razorpay payment hook
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpayPayment();

  const fakePayment = () => {
    // Simulate an online payment flow. Replace with real payment SDK later.
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success 95% of time
        if (Math.random() < 0.95) resolve({ id: 'mock_txn_' + Date.now() });
        else reject(new Error('Payment failed'));
      }, 1000);
    });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const total = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const handleCodConfirmation = async (confirmed) => {
    if (!confirmed) {
      setCodConfirmationOpen(false);
      setCodFormData(null);
      return;
    }

    // User clicked "Yes" - proceed with order placement
    setCodConfirmationOpen(false);
    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({ dish: item.dish._id, qty: item.quantity })),
        address: codFormData.address,
        city: codFormData.city || user.city || 'Unknown',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
      };
      await api.post('/orders', orderData);
      clearCart();
      toast.success('Order placed successfully! Your order will be delivered via Cash on Delivery.');
      navigate('/profile');
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
      setCodFormData(null);
    }
  };

  const onSubmit = async (data) => {
    // For Cash on Delivery, show confirmation modal instead of immediately placing order
    if (paymentMethod === 'cod') {
      setCodFormData(data);
      setCodConfirmationOpen(true);
      return;
    }

    setLoading(true);
    try {
      // If Razorpay selected, create order in DB first, then initiate payment
      if (paymentMethod === 'razorpay') {
        // Step 1: Create order in our DB first (status: pending)
        const orderPayload = {
          items: cart.map(item => ({ dish: item.dish._id, qty: item.quantity })),
          address: data.address,
          city: data.city || user.city || 'Unknown',
          paymentMethod: 'gateway',
          paymentStatus: 'pending',
        };
        
        const createResp = await api.post('/orders', orderPayload);
        const createdOrder = createResp.data;

        // Step 2: Initiate Razorpay payment
        await initiatePayment(createdOrder._id, {
          userDetails: {
            name: user.name,
            email: user.email,
            phone: user.phone
          },
          onSuccess: (order) => {
            // Payment successful and verified
            clearCart();
            navigate('/profile');
          },
          onFailure: (error) => {
            // Payment failed or cancelled
            console.error('Payment failed:', error);
            // Order remains in pending state, user can retry payment
          }
        });
        
        setLoading(false);
        return; // exit onSubmit since Razorpay flow will handle completion
      }

      if (paymentMethod === 'online') {
        setPaymentModalOpen(true);
        try {
          paymentResult = await fakePayment();
          toast.success('Payment successful');
        } catch (err) {
          toast.error('Payment failed. Please try another method');
          setPaymentModalOpen(false);
          setLoading(false);
          return;
        }
        setPaymentModalOpen(false);
      }
      // If user selected direct UPI option and they confirm they've paid,
      // we assume paymentResult is success (no server-side verification here).
      if (paymentMethod === 'upi-direct' && upiConfirming) {
        paymentResult = { method: 'upi', upi: UPI_ID };
      }

      const orderData = {
        items: cart.map(item => ({ dish: item.dish._id, qty: item.quantity })),
        address: data.address,
        city: data.city || user.city || 'Unknown',
      };
      await api.post('/orders', orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
      setUpiConfirming(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Address & Payment</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium">City</label>
                <input
                  {...register('city', { required: true })}
                  className="border p-2 w-full mt-1 rounded"
                  defaultValue={user.city || ''}
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Address</label>
                <textarea
                  {...register('address', { required: true })}
                  className="border p-2 w-full mt-1 rounded"
                  rows="4"
                  defaultValue={user.address || ''}
                />
                {errors.address && <p className="text-red-500 text-sm">Address is required</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className={`p-3 border rounded cursor-pointer ${paymentMethod==='cod' ? 'border-blue-600 bg-blue-50' : ''}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod==='cod'} onChange={() => setPaymentMethod('cod')} className="mr-2" />
                  Cash on Delivery
                </label>
                <label className={`p-3 border rounded cursor-pointer ${paymentMethod==='online' ? 'border-blue-600 bg-blue-50' : ''}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod==='online'} onChange={() => setPaymentMethod('online')} className="mr-2" />
                  Pay Online (mock)
                </label>
                <label className={`p-3 border rounded cursor-pointer ${paymentMethod==='razorpay' ? 'border-blue-600 bg-blue-50' : ''}`}>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod==='razorpay'} onChange={() => setPaymentMethod('razorpay')} className="mr-2" />
                  Razorpay (card/UPI)
                </label>
                <label className={`p-3 border rounded cursor-pointer ${paymentMethod==='upi-direct' ? 'border-blue-600 bg-blue-50' : ''}`}>
                  <input type="radio" name="payment" value="upi-direct" checked={paymentMethod==='upi-direct'} onChange={() => setPaymentMethod('upi-direct')} className="mr-2" />
                  UPI — {UPI_ID}
                </label>
              </div>
            </div>

            {paymentMethod === 'upi-direct' && (
              <div className="mb-4 border p-4 rounded">
                <div className="flex gap-4 items-start">
                  <div className="bg-white p-2 rounded">
                    <QRCode value={`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Swadhan Eats')}&am=${Number(total).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order payment')}`} />
                  </div>
                  <div className="flex-1">
                    <p className="mb-2">Amount: <strong>{formatPrice(total)}</strong></p>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 p-1 rounded">{UPI_ID}</code>
                      <button type="button" onClick={() => { navigator.clipboard?.writeText(UPI_ID); toast.success('UPI ID copied'); }} className="bg-gray-200 px-2 py-1 rounded">Copy</button>
                    </div>
                    <div className="mt-3">
                      <button type="button" onClick={() => setUpiConfirming(true)} className="bg-indigo-600 text-white px-3 py-1 rounded">I have paid</button>
                      <p className="text-xs text-gray-500 mt-1">After you confirm, we will create the order and mark it as paid (manual verification).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded w-full disabled:opacity-50">
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <BillSummary items={cart} deliveryFee={2.5} showCTA={false} />
          <div className="mt-3 text-sm text-gray-500">Review your bill before placing the order.</div>
        </div>
      </div>

      <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Processing Payment">
        <p>Please wait while we process your payment...</p>
      </Modal>

      <Modal open={codConfirmationOpen} onClose={() => handleCodConfirmation(false)} title="Confirm Cash on Delivery Order">
        <div className="py-4">
          <p className="mb-4 text-gray-700">
            Please confirm your Cash on Delivery order. You will pay <strong>{formatPrice(total)}</strong> to the delivery executive when your order arrives.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
            <p><strong>Delivery Address:</strong></p>
            <p>{codFormData?.address}</p>
            <p className="text-gray-600">{codFormData?.city}</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => handleCodConfirmation(false)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              No, Cancel
            </button>
            <button
              onClick={() => handleCodConfirmation(true)}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Yes, Confirm Order'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;
