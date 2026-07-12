import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Sun, Moon, Home, Download, Phone, ArrowUpRight, X, Info } from 'lucide-react';

export default function Navbar() {
  const { cartItems } = useCart();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [installPlatform, setInstallPlatform] = useState(null); // 'ios', 'desktop', 'android'
  const [showContactModal, setShowContactModal] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !window.MSStream);
  }, []);

  // Sync theme to DOM class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors cursor-pointer" 
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

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

      {/* Fixed WhatsApp Quick Contact Bar at the very bottom for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 h-11 z-40 md:hidden bg-emerald-600 border-t border-emerald-500 shadow-md">
        <a 
          href="https://wa.me/919052572363?text=Hi%20Weaving%20Designs,%20I%20need%20support."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-white h-full font-bold text-xs cursor-pointer active:bg-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.457 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>Chat on WhatsApp</span>
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
                  href="https://wa.me/919052572363?text=Hi%20Weaving%20Designs,%20I%20need%20support." 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500/15 rounded-xl border border-emerald-500/20 font-bold transition-all cursor-pointer animate-fade-in"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 fill-current text-emerald-600 dark:text-emerald-455" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.457 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp Us: +91 90525 72363</span>
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
