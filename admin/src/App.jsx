import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import Admin2FA from './pages/Admin2FA';
import Login from './pages/Login';

// Route Guards
import { AdminRoute } from './components/ProtectedRoutes';

export default function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-slate-100 font-sans transition-colors duration-200">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Admin Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/2fa" element={<Admin2FA />} />

            {/* Secure Admin Dashboard (requires auth and 2FA verify) */}
            <Route element={<AdminRoute />}>
              <Route path="/" element={<AdminDashboard />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Login />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </AuthProvider>
  );
}
