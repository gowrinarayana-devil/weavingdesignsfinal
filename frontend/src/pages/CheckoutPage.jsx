import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isDummyClient } from '../supabase';
import axios from 'axios';
import { CreditCard, ShoppingBag, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // State for mock payment dialog popup
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);

  useEffect(() => {
    // Redirect if cart is empty and checkout hasn't succeeded
    if (cartItems.length === 0 && !success) {
      navigate('/cart');
    }
  }, [cartItems, success, navigate]);

  const handlePayment = async () => {
    setError('');
    
    if (!email) {
      setError('Please enter a valid billing email address.');
      return;
    }
    
    setLoading(true);

    try {
      // Check out the first item in the cart (or loop for all, here we buy the first design for simplicity)
      const designToBuy = cartItems[0];

      // 1. Call backend to create Razorpay Order (no Auth headers needed)
      const orderRes = await axios.post(
        '/api/payments/create-order',
        { designId: designToBuy.id, email }
      );

      const orderData = orderRes.data;

      // 2. If backend reports Mock sandbox mode, display simulator modal
      if (orderData.isMock) {
        setMockOrderDetails(orderData);
        setShowMockModal(true);
        setLoading(false);
        return;
      }

      // 3. Launch Razorpay Standard Payment Gateway Dialog
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'StitchLoom Marketplace',
        description: `Purchase: ${orderData.design.title}`,
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80',
        order_id: orderData.order_id,
        handler: async function (response) {
          setLoading(true);
          try {
            // Verify signature on backend
            const verifyRes = await axios.post(
              '/api/payments/verify',
              {
                order_id: orderData.order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                designId: designToBuy.id
              }
            );

            if (verifyRes.data.success) {
              setSuccess(true);
              clearCart();
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
            setError(err.response?.data?.error || 'Verification request failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: 'Embroidery Customer',
          email: email,
        },
        theme: {
          color: '#0d9488', // Brand Teal
        },
        modal: {
          ondismiss: function () {
            setError('Payment checkout cancelled by user.');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  // Handler for Mock Payment Simulation
  const simulatePayment = async (status) => {
    setShowMockModal(false);
    setLoading(true);

    if (status === 'fail') {
      setError('Payment simulation: Transaction failed/cancelled.');
      setLoading(false);
      return;
    }

    try {
      // Call backend to verify mock payment
      const verifyRes = await axios.post(
        '/api/payments/verify',
        {
          order_id: mockOrderDetails.order_id,
          payment_id: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
          signature: 'mock_signature',
          designId: mockOrderDetails.design.id
        }
      );

      if (verifyRes.data.success) {
        setSuccess(true);
        clearCart();
      } else {
        setError('Simulation verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Mock verification request failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="inline-flex bg-emerald-500/10 text-emerald-500 p-4 rounded-full mb-6">
          <CheckCircle size={48} />
        </div>
        <h1 className="font-display font-black text-2xl text-slate-800 dark:text-white">Payment Successful!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Your order has been verified. The digital files are now available inside your downloads center.
        </p>
        <div className="mt-8 space-y-3">
          <Link
            to="/downloads"
            className="w-full block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all text-sm"
          >
            Go to Downloads Page
          </Link>
          <Link
            to="/"
            className="w-full block border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-900 font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
        <CreditCard className="text-brand-500" />
        <span>Secure Checkout</span>
      </h1>

      {error && (
        <div className="flex items-center space-x-2 bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/20 text-sm mb-6">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left: Summary and details */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-500" />
              <span>Purchasing Item</span>
            </h3>
            
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 last:pb-0">
                <img
                  src={item.preview_image_url || item.image_url}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-dark-950 no-select"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="min-w-0 flex-grow">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{item.title}</h4>
                  <span className="text-xs text-slate-400">{item.category}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">₹{item.price}</div>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-700 dark:text-amber-400 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
            <span>Digital Delivery Notice: Once payment is successful, download permissions are logged instantly. All digital design exports contain color charts and machine configuration specs.</span>
          </div>
        </div>

        {/* Right: Payment controls */}
        <div className="md:col-span-2">
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-bold">
                Billing Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold text-slate-850 dark:text-slate-200"
                required
              />
            </div>

            <div>
              <span className="text-slate-400 text-xs block uppercase tracking-wider font-bold">Total Payment</span>
              <strong className="text-slate-900 dark:text-white font-display font-black text-2xl block mt-1">
                ₹{cartTotal}
              </strong>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-brand-600/10 transition-all text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <span>Pay Securely with Razorpay</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Mock Payment Modal (Sandbox Simulator) */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex bg-brand-500/10 text-brand-500 p-3 rounded-full mb-3">
                <CreditCard size={32} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Razorpay Sandbox Simulator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Simulate payment gateway behavior. No actual funds will be transferred.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-dark-950 p-4 rounded-xl mb-6 text-sm text-left space-y-1.5 border border-slate-200/50 dark:border-slate-800/40">
              <div className="flex justify-between">
                <span className="text-slate-400">Design Title:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{mockOrderDetails?.design.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{mockOrderDetails?.amount / 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono text-xs text-brand-600 dark:text-brand-400">{mockOrderDetails?.order_id.substring(0, 15)}...</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => simulatePayment('fail')}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel / Fail
              </button>
              <button
                onClick={() => simulatePayment('success')}
                className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-600/10 transition-colors"
              >
                Simulate Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
