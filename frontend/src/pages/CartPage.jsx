import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
        <ShoppingBag className="text-brand-500" />
        <span>Your Shopping Cart</span>
      </h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-950 flex-shrink-0">
                  <img
                    src={item.preview_image_url || item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover no-select"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>

                {/* Meta */}
                <div className="flex-grow min-w-0">
                  <Link
                    to={`/design/${item.id}`}
                    className="font-display font-bold text-slate-800 dark:text-slate-100 hover:text-brand-500 transition-colors text-sm sm:text-base truncate block"
                  >
                    {item.title}
                  </Link>
                  <span className="inline-block mt-0.5 text-xs bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>

                {/* Price */}
                <div className="text-right">
                  <span className="font-display font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg block">
                    ₹{item.price}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-1 mt-1 rounded hover:bg-slate-100 dark:hover:bg-dark-800 transition-all inline-flex items-center gap-1 text-xs"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart control */}
            <div className="flex justify-end pt-2">
              <button
                onClick={clearCart}
                className="text-slate-400 hover:text-red-500 text-xs font-semibold hover:underline"
              >
                Clear entire cart
              </button>
            </div>
          </div>

          {/* Right: Order Summary Panel */}
          <div className="lg:col-span-1">
            <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Selected designs ({cartItems.length})</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Tax (GST 0%)</span>
                  <span>₹0</span>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div className="flex justify-between font-bold text-slate-900 dark:text-white text-base">
                  <span>Total Amount</span>
                  <span className="text-brand-500">₹{cartTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-brand-600/10 transition-all text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Immediate secure delivery guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-dark-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your shopping cart is empty.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 dark:text-brand-400 font-bold mt-4 text-sm"
          >
            <span>Browse designs catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
