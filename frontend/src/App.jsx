import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

// Pages
import Marketplace from './pages/Marketplace';
import DesignDetail from './pages/DesignDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DownloadsPage from './pages/DownloadsPage';


export default function App() {
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
            className="fixed bottom-6 right-6 z-50 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 p-2.5 rounded-full shadow-2xl border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group hover:border-[#25D366] dark:hover:border-[#25D366] cursor-pointer"
            aria-label="Contact support on WhatsApp"
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#25D366"
                d="M12.031 0C5.396 0 0 5.396 0 12.031c0 2.222.603 4.305 1.649 6.108L0 24l6.027-1.583a12.008 12.008 0 0 0 6.004 1.614c6.635 0 12.031-5.396 12.031-12.031C24.062 5.396 18.666 0 12.031 0zm0 22.028c-1.859 0-3.619-.516-5.127-1.423l-.369-.214-3.568.937.954-3.48-.235-.374a9.96 9.96 0 0 1-1.527-5.443c0-5.509 4.484-9.993 9.992-9.993 2.68 0 5.2.104 7.098 2.002 1.897 1.897 2.894 4.418 2.894 7.098.001 5.51-4.483 9.993-9.993 9.993zm5.006-6.848c-.274-.137-1.62-.799-1.871-.891-.251-.091-.433-.137-.616.137-.183.274-.707.891-.867 1.073-.16.183-.32.206-.594.069a7.514 7.514 0 0 1-2.208-1.36 8.27 8.27 0 0 1-1.528-1.902c-.16-.274-.017-.423.12-.56.124-.123.274-.32.411-.48.137-.16.183-.274.274-.457.091-.183.046-.343-.023-.48-.069-.137-.616-1.485-.845-2.033-.223-.537-.449-.463-.616-.471-.16-.008-.343-.008-.525-.008-.183 0-.48.069-.731.343-.251.274-.959.937-.959 2.285s.982 2.651 1.119 2.834c.137.183 1.933 2.951 4.683 4.14.654.283 1.165.452 1.563.579.657.209 1.256.179 1.728.109.527-.078 1.62-.663 1.849-1.302.228-.64.228-1.188.16-1.302-.069-.115-.251-.183-.526-.32z"
              />
            </svg>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 font-bold text-xs transition-all duration-300 ease-in-out whitespace-nowrap text-slate-700 dark:text-slate-200">
              WhatsApp Support
            </span>
          </a>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
