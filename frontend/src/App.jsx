import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import { App as CapacitorApp } from '@capacitor/app';

// Pages
import Marketplace from './pages/Marketplace';
import DesignDetail from './pages/DesignDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DownloadsPage from './pages/DownloadsPage';


export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let backButtonListener;

    const setupListener = async () => {
      try {
        backButtonListener = await CapacitorApp.addListener('backButton', () => {
          if (location.pathname === '/' || location.pathname === '/marketplace') {
            CapacitorApp.exitApp();
          } else {
            navigate(-1);
          }
        });
      } catch (err) {
        console.log('Capacitor App listener not active (browser environment)');
      }
    };

    setupListener();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [location, navigate]);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-slate-100 font-sans transition-colors duration-200">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Marketplace />} />
              <Route path="/design/:id" element={<DesignDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/downloads" element={<DownloadsPage />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Marketplace />} />
            </Routes>
          </main>

          {/* Floating WhatsApp Support Button */}
          <a
            href="https://wa.me/919052572363?text=Hi%20Weaving%20Designs,%20I%20need%20support."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3 rounded-full shadow-lg shadow-[#25D366]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group cursor-pointer"
            aria-label="Contact support on WhatsApp"
          >
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
            </svg>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 font-bold text-xs transition-all duration-300 ease-in-out whitespace-nowrap text-white">
              WhatsApp Support
            </span>
          </a>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
