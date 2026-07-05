import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon, LayoutDashboard, Scissors } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getMarketplaceUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
    }
    return import.meta.env.VITE_MARKETPLACE_URL || 'https://weavingdesignsfinal-n5uj.vercel.app';
  };

  return (
    <nav className="sticky top-0 z-40 glass w-full transition-colors border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <a href={getMarketplaceUrl()} className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="WEAVING DESIGNS Logo" className="w-10 h-10 object-cover rounded-lg shadow-md border border-slate-200/50 dark:border-slate-800/40" />
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-500 dark:to-teal-300 bg-clip-text text-transparent">
                WEAVING DESIGNS <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-350 rounded border border-slate-200 dark:border-slate-700 ml-2">Admin Panel</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <div className="flex items-center space-x-6">
            {user && (
              <Link to="/" className="flex items-center space-x-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 px-3 py-1.5 rounded-lg border border-brand-500/20 hover:bg-brand-500/20 transition-colors">
                <LayoutDashboard size={16} />
                <span className="font-medium text-sm">Dashboard</span>
              </Link>
            )}

            {/* Vertical Separator */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors" aria-label="Toggle Dark Mode">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Session Interface */}
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm max-w-[200px] truncate hidden sm:inline">
                  Hi G. PAVAN KUMAR
                </span>
                <button onClick={handleSignOut} className="flex items-center space-x-1 px-3 py-2 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 rounded-lg transition-colors text-sm font-medium">
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
