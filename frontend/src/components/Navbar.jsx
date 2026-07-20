import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Home, Download, Phone, ArrowUpRight, X, Info, Mail } from 'lucide-react';

export default function Navbar() {
  const { cartItems } = useCart();
  const location = useLocation();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [installPlatform, setInstallPlatform] = useState(null); // 'ios', 'desktop', 'android'
  const [showContactModal, setShowContactModal] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !window.MSStream);
  }, []);

  // Ensure theme is always light and clean up legacy dark mode state
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  // Listen to PWA installable event
  useEffect(() => {
    const handlePwaInstallable = () => {
      setIsInstallable(true);
    };

    window.addEventListener('pwa-installable', handlePwaInstallable);
    if (window.deferredPrompt) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('pwa-installable', handlePwaInstallable);
    };
  }, []);

  // Determine platform and handle PWA installation prompt
  const handleInstallClick = async () => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/i.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

    if (isStandalone) {
      alert("WEAVING DESIGNS is already installed and running!");
      return;
    }

    if (window.deferredPrompt) {
      const promptEvent = window.deferredPrompt;
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      console.log(`User install outcome: ${outcome}`);
      if (outcome === 'accepted') {
        window.deferredPrompt = null;
        setIsInstallable(false);
      }
    } else if (isIOS) {
      setInstallPlatform('ios');
      setShowInstallGuide(true);
    } else if (isAndroid) {
      setInstallPlatform('android');
      setShowInstallGuide(true);
    } else {
      setInstallPlatform('desktop');
      setShowInstallGuide(true);
    }
  };

  return (
    <>
      {/* Sticky Desktop Navbar */}
      <nav className="sticky top-0 z-40 glass w-full border-b border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/logo.jpg" 
                  alt="WEAVING DESIGNS Logo" 
                  width="40" 
                  height="40" 
                  className="w-10 h-10 object-cover rounded-lg shadow-md border border-slate-200/50 dark:border-slate-800/40" 
                />
                <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-500 dark:to-teal-300 bg-clip-text text-transparent">
                  WEAVING DESIGNS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`flex items-center space-x-1.5 font-medium transition-colors text-sm ${
                  location.pathname === '/' 
                    ? 'text-brand-500 font-semibold' 
                    : 'text-slate-650 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-500'
                }`}
              >
                <Home size={16} />
                <span>Home</span>
              </Link>

              <Link 
                to="/downloads" 
                className={`flex items-center space-x-1.5 font-medium transition-colors text-sm ${
                  location.pathname === '/downloads' 
                    ? 'text-brand-500 font-semibold' 
                    : 'text-slate-650 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-500'
                }`}
              >
                <Download size={16} />
                <span>Purchase</span>
              </Link>

              <button 
                onClick={() => setShowContactModal(true)}
                className="flex items-center space-x-1.5 font-medium transition-colors text-sm text-slate-650 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-500 cursor-pointer"
              >
                <Phone size={16} />
                <span>Contact</span>
              </button>
            </div>

            {/* Actions: Theme Toggle, Cart, and Install button */}
            <div className="flex items-center space-x-4">
              {/* Install App Desktop Button */}
              {(isInstallable || isIOS) && (
                <>
                  <button
                    onClick={handleInstallClick}
                    className="hidden md:inline-flex bg-brand-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md items-center gap-1.5 cursor-pointer"
                  >
                    <span>Install App</span>
                  </button>

                  {/* Vertical Separator */}
                  <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-800" />
                </>
              )}



              {/* Shopping Cart Indicator */}
              <Link 
                to="/cart" 
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors" 
                aria-label="View Shopping Cart"
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-brand-500 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-11 left-0 right-0 z-40 md:hidden bg-white dark:bg-dark-950 border-t border-slate-200 dark:border-slate-850 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around h-16 px-2">
          <Link 
            to="/" 
            className={`flex flex-col items-center justify-center w-20 py-1 transition-all ${
              location.pathname === '/' 
                ? 'text-brand-500 font-semibold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] mt-1">Home</span>
          </Link>

          <Link 
            to="/downloads" 
            className={`flex flex-col items-center justify-center w-20 py-1 transition-all ${
              location.pathname === '/downloads' 
                ? 'text-brand-500 font-semibold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Download size={20} />
            <span className="text-[10px] mt-1">Purchase</span>
          </Link>

          <button 
            onClick={() => setShowContactModal(true)}
            className="flex flex-col items-center justify-center w-20 py-1 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
          >
            <Phone size={20} />
            <span className="text-[10px] mt-1">Contact</span>
          </button>

          {(isInstallable || isIOS) && (
            <button 
              onClick={handleInstallClick}
              className="bg-brand-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer shrink-0"
            >
              <span>Install App</span>
            </button>
          )}
        </div>
      </nav>

      {/* Fixed Email Quick Contact Bar at the very bottom for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 h-11 z-40 md:hidden bg-brand-600 border-t border-brand-500 shadow-md">
        <a 
          href="mailto:gudurupavan0297@gmail.com?subject=Support%20Request%20-%20Weaving%20Designs"
          className="flex items-center justify-center gap-1.5 text-white h-full font-bold text-xs cursor-pointer active:bg-brand-700 transition-colors"
        >
          <Mail size={16} />
          <span>Email Support</span>
        </a>
      </div>

      {/* PWA Installation Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
              <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white flex items-center gap-2">
                <Info className="text-brand-500" size={20} />
                <span>Install WEAVING DESIGNS</span>
              </h3>
              <button 
                onClick={() => setShowInstallGuide(false)}
                className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-dark-950 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {installPlatform === 'ios' ? (
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-305">
                <p>Safari on iOS does not support one-click installation, but you can install the app easily manually:</p>
                <ol className="list-decimal pl-5 space-y-2.5 leading-relaxed font-semibold text-slate-700 dark:text-slate-200">
                  <li>Open the browser options by tapping the <strong className="text-brand-500">Share</strong> button (box with an arrow pointing upwards) in the bottom Safari bar.</li>
                  <li>Scroll down and select <strong className="text-brand-500">Add to Home Screen</strong>.</li>
                  <li>Enter the preferred name (e.g. "WEAVING DESIGNS") and tap <strong className="text-brand-500">Add</strong> in the top right corner.</li>
                </ol>
              </div>
            ) : installPlatform === 'android' ? (
              <div className="space-y-4 text-sm text-slate-650 dark:text-slate-305">
                <p>To install the app on Android:</p>
                <ol className="list-decimal pl-5 space-y-2.5 leading-relaxed font-semibold text-slate-700 dark:text-slate-200">
                  <li>Tap the browser options button (three vertical dots in Chrome) in the top-right corner.</li>
                  <li>Tap <strong className="text-brand-500">Add to Home screen</strong> or <strong className="text-brand-500">Install app</strong>.</li>
                  <li>Confirm by clicking install to place it in your app drawer.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-slate-650 dark:text-slate-305">
                <p>To install this app on your desktop:</p>
                <ol className="list-decimal pl-5 space-y-2.5 leading-relaxed font-semibold text-slate-700 dark:text-slate-200">
                  <li>Look at the browser URL bar in the top-right and click the **Install** icon (monitor with a down arrow, or overlapping squares).</li>
                  <li>Alternatively, click the browser settings menu (three dots) and select <strong className="text-brand-500">Install WEAVING DESIGNS...</strong>.</li>
                </ol>
              </div>
            )}

            <button
              onClick={() => setShowInstallGuide(false)}
              className="mt-6 w-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-950 dark:hover:bg-dark-850 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-800"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Contact Info Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
              <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-white flex items-center gap-2">
                <span>Contact WEAVING DESIGNS</span>
              </h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-dark-950 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 text-sm text-slate-650 dark:text-slate-350">
              <p>Need support, custom adjustments, or want to create a brand-new design? Get in touch with us:</p>
              
              <div className="space-y-3">
                <a 
                  href="mailto:gudurupavan0297@gmail.com?subject=Support%20Request%20-%20Weaving%20Designs" 
                  className="flex items-center justify-between p-3.5 bg-brand-500/10 text-brand-600 hover:bg-brand-500/15 rounded-xl border border-brand-500/20 font-bold transition-all cursor-pointer animate-fade-in"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail size={20} className="text-brand-600" />
                    <span>Email Us: gudurupavan0297@gmail.com</span>
                  </div>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full bg-slate-150 hover:bg-slate-200 dark:bg-dark-850 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
