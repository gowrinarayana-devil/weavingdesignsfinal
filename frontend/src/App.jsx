import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Marketplace from './pages/Marketplace';
import DesignDetail from './pages/DesignDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DownloadsPage from './pages/DownloadsPage';
import Login from './pages/Login';

// Route Guards
import { UserRoute } from './components/ProtectedRoutes';

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
              <Route path="/login" element={<Login />} />
              
              {/* Authenticated Customer Routes */}
              <Route element={<UserRoute />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<Marketplace />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
