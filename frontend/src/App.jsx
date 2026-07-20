import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { App as CapacitorApp } from '@capacitor/app';
import { Mail } from 'lucide-react';

// Pages (Lazy loaded for optimal code-splitting and faster load times)
const Marketplace = lazy(() => import('./pages/Marketplace'));
const DesignDetail = lazy(() => import('./pages/DesignDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));


export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-slate-100 font-sans transition-colors duration-200 pb-28 md:pb-0">
          <Navbar />
          
          <main className="flex-grow flex flex-col">
            <Suspense fallback={
              <div className="min-h-[40vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            }>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Marketplace />} />
                <Route path="/design/:id/:slug?" element={<DesignDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                
                {/* Fallback route */}
                <Route path="*" element={<Marketplace />} />
              </Routes>
              <Footer />
            </Suspense>
          </main>

          {/* Floating Email Support Button */}
          <a
            href="mailto:gudurupavan0297@gmail.com?subject=Support%20Request%20-%20Weaving%20Designs"
            className="fixed bottom-6 right-6 z-50 bg-brand-600 hover:bg-brand-700 text-white p-3.5 rounded-full shadow-lg shadow-brand-650/30 hidden md:flex items-center justify-center hover:scale-110 active:scale-95 transition-all group cursor-pointer"
            aria-label="Contact support via Email"
          >
            <Mail size={24} className="text-white" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 font-bold text-xs transition-all duration-300 ease-in-out whitespace-nowrap text-white">
              Email Support
            </span>
          </a>

        </div>
      </CartProvider>
    </AuthProvider>
  );
}
