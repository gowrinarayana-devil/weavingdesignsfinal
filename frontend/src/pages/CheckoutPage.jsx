import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isDummyClient } from '../supabase';
import axios from 'axios';
import { CreditCard, ShoppingBag, AlertCircle, ShieldAlert, CheckCircle, Clock, QrCode, Copy, Check, ChevronLeft, Download } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const directBuyItem = location.state?.directBuyItem;
  const checkoutItems = directBuyItem ? [directBuyItem] : cartItems;
  const checkoutTotal = directBuyItem ? directBuyItem.price : cartTotal;

  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // State for UPI checkout
  const [paymentStep, setPaymentStep] = useState(1);
  const [upiOrderDetails, setUpiOrderDetails] = useState(null);
  const [utr, setUtr] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [copied, setCopied] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  const triggerAutomaticDownload = async (designId, customerEmail) => {
    setDownloadingId(designId);
    setDownloading(true);
    setDownloadError('');
    try {
      const res = await axios.post(
        '/api/downloads/generate-url',
        { designId, email: customerEmail }
      );
      const { signedUrl } = res.data;

      if (Capacitor.isNativePlatform()) {
        window.open(signedUrl, '_system');
      } else {
        const link = document.createElement('a');
        link.href = signedUrl;
        link.setAttribute('download', `WEAVING_DESIGNS_design_${designId}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Automatic download failed:', err);
      setDownloadError('Could not start download automatically. You can retrieve it manually on the Downloads page.');
    } finally {
      setDownloading(false);
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    // Redirect if checkout items list is empty and checkout hasn't succeeded
    if (checkoutItems.length === 0 && !success && !isPendingApproval) {
      navigate('/cart');
    }
  }, [checkoutItems, success, isPendingApproval, navigate]);

  const handlePayment = async () => {
    setError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid billing email address.');
      return;
    }
    
    setLoading(true);

    try {
      // Collect all design IDs in the purchase
      const designIds = checkoutItems.map(item => item.id);
      const designId = designIds[0]; // Fallback for backward compatibility with old deployed backends

      // 1. Call backend to create Order tracking session for all items
      const orderRes = await axios.post(
        '/api/payments/create-order',
        { designId, designIds, email }
      );

      // 2. Open the UPI Checkout UI in the right panel
      const orderData = orderRes.data;
      setUpiOrderDetails(orderData);
      setPaymentStep(2);
      setLoading(false);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  const displayUpiId = upiOrderDetails?.upi_id === '9052572363@ybl' 
    ? 'weavingdesigns@ybl' 
    : (upiOrderDetails?.upi_id || 'weavingdesigns@ybl');

  const handleCopyUpiId = () => {
    if (!displayUpiId) return;
    navigator.clipboard.writeText(displayUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit UPI transaction reference ID (UTR)
  const submitUtr = async (simulatedStatus = null) => {
    setError('');
    
    if (!simulatedStatus) {
      const utrRegex = /^\d{12}$/;
      if (!utrRegex.test(utr.trim())) {
        setError('Please enter a valid 12-digit UPI UTR / Transaction Reference ID.');
        return;
      }
    }

    setSubmittingUtr(true);
    const finalPaymentId = simulatedStatus === 'fail' 
      ? '' 
      : simulatedStatus === 'success' 
        ? `pay_mock_${Math.random().toString(36).substr(2, 9)}`
        : utr.trim();

    if (simulatedStatus === 'fail') {
      setError('Payment simulation: Transaction failed/cancelled.');
      setPaymentStep(1);
      setSubmittingUtr(false);
      return;
    }

    try {
      // Call backend to verify/register UPI payment reference
      const verifyRes = await axios.post(
        '/api/payments/verify',
        {
          order_id: upiOrderDetails.order_id,
          payment_id: finalPaymentId,
          designId: checkoutItems[0]?.id // Fallback for backward compatibility with old deployed backends
        }
      );

      if (verifyRes.data.success) {
        // Capture items to download before clearing cart
        const itemsToDownload = [...checkoutItems];
        setPurchasedItems(itemsToDownload);
        if (!directBuyItem) {
          clearCart();
        }
        setPaymentStep(1);
        if (verifyRes.data.download_ready) {
          // Sandbox mode - auto approved immediately
          setSuccess(true);
          // Trigger automatic download for first item
          if (itemsToDownload.length > 0) {
            await triggerAutomaticDownload(itemsToDownload[0].id, email);
          }
        } else {
          // Live mode - pending admin review
          setIsPendingApproval(true);
        }
      } else {
        setError('Verification request failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Mock verification request failed.');
    } finally {
      setSubmittingUtr(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="inline-flex bg-emerald-500/10 text-emerald-500 p-4 rounded-full mb-6">
          <CheckCircle size={48} />
        </div>
        <h1 className="font-display font-black text-2xl text-slate-800 dark:text-white">Payment Successful!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Your order has been verified.
        </p>

        {purchasedItems.length > 0 && (
          <div className="mt-8 text-left bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-105 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <span>Your Purchased Designs</span>
              {purchasedItems.length > 1 && (
                <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full font-bold">
                  {purchasedItems.length} Designs
                </span>
              )}
            </h3>

            {purchasedItems.length > 1 && (
              <div className="mb-4 p-3 bg-brand-500/5 border border-brand-500/15 rounded-xl text-[11px] text-slate-550 dark:text-slate-400 leading-normal flex items-start gap-2">
                <AlertCircle size={15} className="text-brand-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> We started downloading the first design automatically. Since browsers block multiple files from downloading at once, please click the <strong>Download ZIP</strong> button next to each design below to save them.
                </span>
              </div>
            )}

            <div className="space-y-3">
              {purchasedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 dark:bg-dark-950/30 rounded-xl border border-slate-100 dark:border-slate-850/60 hover:bg-slate-50 dark:hover:bg-dark-950 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.preview_image_url || item.image_url}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-dark-900 flex-shrink-0 no-select animate-fade-in"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">{item.title}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-850 px-1.5 py-0.5 rounded mt-1 inline-block font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerAutomaticDownload(item.id, email)}
                    disabled={downloadingId === item.id}
                    className="flex items-center justify-center space-x-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-all cursor-pointer flex-shrink-0 shadow-sm shadow-brand-600/5"
                  >
                    {downloadingId === item.id ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Download size={13} />
                        <span>Download ZIP</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {downloading && (
          <div className="mt-6 flex flex-col items-center justify-center space-y-2 text-xs text-brand-500">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-500"></div>
            <span>Downloading design file...</span>
          </div>
        )}

        {downloadError && (
          <p className="mt-6 text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{downloadError}</p>
        )}

        {!downloading && !downloadError && purchasedItems.length === 1 && (
          <p className="mt-6 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl font-medium">
            ✓ Your download has started automatically!
          </p>
        )}

        <div className="mt-8 space-y-3 max-w-md mx-auto">
          <Link
            to="/downloads"
            className="w-full block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all text-sm"
          >
            Go to Downloads Page
          </Link>
          <a
            href="https://wa.me/919052572363?text=Hi%20Weaving%20Designs,%20I%20need%20support%20with%20my%20recent%20purchase."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block border border-emerald-500/20 dark:border-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Contact Support via WhatsApp
          </a>
          <Link
            to="/"
            className="w-full block border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-900 font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isPendingApproval) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="inline-flex bg-amber-500/10 text-amber-500 p-4 rounded-full mb-6">
          <Clock className="animate-pulse" size={48} />
        </div>
        <h1 className="font-display font-black text-2xl text-slate-800 dark:text-white">Transaction Submitted</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Your transaction reference (UTR: <strong className="font-mono text-brand-600 dark:text-brand-400">{utr}</strong>) has been submitted for manual approval.
        </p>
        <p className="text-slate-400 dark:text-slate-500 mt-4 text-xs max-w-sm mx-auto leading-relaxed">
          Our admin team will verify the payment against our bank records. Once verified, the designs will be unlocked in your Downloads section.
        </p>

        {purchasedItems.length > 0 && (
          <div className="mt-8 text-left bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm max-w-md mx-auto">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-105 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <span>Designs Pending Verification</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold">
                {purchasedItems.length} Designs
              </span>
            </h3>

            <div className="space-y-3">
              {purchasedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50/50 dark:bg-dark-950/30 rounded-xl border border-slate-100 dark:border-slate-850">
                  <img
                    src={item.preview_image_url || item.image_url}
                    alt={item.title}
                    className="w-10 h-10 object-cover rounded-lg bg-slate-100 dark:bg-dark-900 flex-shrink-0 no-select"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-3 max-w-md mx-auto">
          <Link
            to="/downloads"
            className="w-full block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all text-sm"
          >
            Track Download Status
          </Link>
          <a
            href="https://wa.me/919052572363?text=Hi%20Weaving%20Designs,%20I%20just%20submitted%20my%20UTR%20reference%20and%20need%20quick%20approval."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block border border-amber-500/25 dark:border-amber-500/10 text-amber-600 dark:text-amber-450 bg-amber-500/5 hover:bg-amber-500/10 font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Contact Support (Fast Approval)
          </a>
          <Link
            to="/"
            className="w-full block border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-900 font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Generate UPI payload string for the QR code
  const upiLink = upiOrderDetails
    ? `upi://pay?pa=${displayUpiId}&pn=Weaving%20Designs&am=${upiOrderDetails.amount / 100}&cu=INR&tn=${upiOrderDetails.order_id}`
    : '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in flex flex-col">
      {/* Back Button Option */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <Link
          to="/cart"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 font-semibold border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl bg-white dark:bg-dark-900 hover:bg-slate-50 hover:border-brand-500 dark:hover:bg-dark-800 dark:hover:border-brand-500/50 transition-all shadow-sm cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Back to Cart</span>
        </Link>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans bg-slate-100 dark:bg-dark-900 px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-800">
          Step 2 of 2: Payment
        </div>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 flex-shrink-0">
        <CreditCard className="text-brand-500" />
        <span>Secure Checkout</span>
      </h1>

      {error && (
        <div className="flex items-center space-x-2 bg-red-500/10 text-red-650 dark:text-red-400 p-4 rounded-xl border border-red-500/20 text-sm mb-4 font-medium flex-shrink-0">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pb-4">
        {/* Left: Summary and details */}
        <div className="space-y-4 flex flex-col w-full">
          <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 sticky top-0 bg-white dark:bg-dark-900 py-1 z-10">
              <ShoppingBag size={18} className="text-brand-500" />
              <span>Purchasing Item</span>
            </h3>
            
            {checkoutItems.map((item) => (
              <div key={item.id} className="flex gap-4 py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 last:pb-0">
                <img
                  src={item.preview_image_url || item.image_url}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-dark-950 no-select animate-fade-in"
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

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-700 dark:text-amber-400 leading-relaxed flex items-start gap-2.5 flex-shrink-0">
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
            <span>Digital Delivery Notice: Once payment is successful and reference is confirmed by our admin team, download permissions are logged instantly. All digital design exports contain color charts and machine config specs.</span>
          </div>
        </div>

        {/* Right: Payment controls (stretched, 50% split) */}
        <div className="w-full">
          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col">
            {paymentStep === 1 ? (
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-bold font-sans">
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
                    <strong className="text-slate-900 dark:text-white font-display font-black text-2xl block mt-1 font-sans">
                      ₹{checkoutTotal}
                    </strong>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-brand-600/10 transition-all text-sm cursor-pointer animate-fade-in"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <QrCode size={18} />
                        <span>Pay with UPI QR / ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: UPI details directly in the right card
              <div className="flex flex-col justify-between space-y-4">
                
                {/* Header */}
                <div className="text-center">
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Pay Securely via UPI</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Scan the QR code or follow the instructions below to buy this design.
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="text-center p-2 bg-slate-550/5 dark:bg-dark-950/20 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&margin=8&data=${encodeURIComponent(upiLink)}`}
                    alt="UPI QR Code"
                    className="border-2 border-white rounded-lg shadow bg-white w-[120px] h-[120px] no-select"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <span className="block text-[9px] font-bold text-slate-450 dark:text-slate-400 mt-1 font-mono uppercase tracking-wider">
                    Scan with GPay, PhonePe, Paytm or BHIM
                  </span>
                </div>

                {/* Amount Due */}
                <div className="py-2 px-3 bg-brand-500/5 dark:bg-brand-500/10 rounded-xl border border-brand-500/20 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Amount Due:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">₹{upiOrderDetails?.amount / 100}</span>
                </div>

                {/* Instructions */}
                <div className="bg-slate-550/5 dark:bg-dark-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850 text-[11px] text-slate-650 dark:text-slate-350 space-y-2">
                  <span className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[9px]">How to pay:</span>
                  <ul className="space-y-1.5 leading-normal">
                    <li className="flex gap-1.5"><span className="font-bold text-brand-500">1.</span> Take screenshot of the QR code</li>
                    <li className="flex gap-1.5"><span className="font-bold text-brand-500">2.</span> Upload the screenshot in PhonePe, GPay, Paytm, etc.</li>
                    <li className="flex gap-1.5"><span className="font-bold text-brand-500">3.</span> Make payment</li>
                    <li className="flex gap-1.5"><span className="font-bold text-brand-500">4.</span> Copy UTR (12-digit transaction ID) after payment</li>
                    <li className="flex gap-1.5"><span className="font-bold text-brand-500">5.</span> Paste the UTR number in below</li>
                  </ul>
                </div>

                {/* UTR Input Form */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                    Enter 12-digit UPI Transaction Reference / UTR ID
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456789012"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-mono text-center tracking-widest text-slate-800 dark:text-slate-100"
                    required
                  />
                  <p className="text-[8.5px] text-slate-400 dark:text-slate-500 leading-tight">
                    Make your payment in your UPI app, locate the 12-digit transaction identifier/UTR in payment history, and input it here.
                  </p>
                </div>

                {/* Simulation controls */}
                {upiOrderDetails?.isMock && (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-2 rounded-xl space-y-1 flex-shrink-0">
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                      <span>🛠️ Sandbox Simulator</span>
                      <span>(No real funds required)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitUtr('fail')}
                        className="flex-1 py-1 px-2 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 text-slate-650 dark:text-slate-250 font-bold rounded-lg text-[8.5px] transition-colors"
                      >
                        Simulate Fail
                      </button>
                      <button
                        onClick={() => submitUtr('success')}
                        className="flex-1 py-1 px-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-650 dark:text-brand-400 font-bold rounded-lg text-[8.5px] border border-brand-500/20 transition-colors"
                      >
                        Simulate Auto-Approve
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStep(1);
                      setUtr('');
                    }}
                    className="flex-1 py-2 px-4 bg-slate-100 dark:bg-dark-800 hover:bg-slate-250 text-slate-750 dark:text-slate-250 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => submitUtr()}
                    disabled={submittingUtr || utr.length !== 12}
                    className="flex-1 py-2 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/40 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-600/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    {submittingUtr ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <span>Submit Reference</span>
                    )}
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
