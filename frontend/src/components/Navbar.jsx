import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Sun, Moon, Menu, X, Scissors, Download } from 'lucide-react';

export default function Navbar() {
  const { cartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <nav className="sticky top-0 z-40 glass w-full transition-colors border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="WEAVING DESIGNS Logo" className="w-10 h-10 object-cover rounded-lg shadow-md border border-slate-200/50 dark:border-slate-800/40" />
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-500 dark:to-teal-300 bg-clip-text text-transparent">
                WEAVING DESIGNS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-500 font-medium transition-colors">
              Marketplace
            </Link>
            
            <Link to="/downloads" className="flex items-center space-x-1 text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-500 font-medium transition-colors">
              <Download size={16} />
              <span>My Downloads</span>
            </Link>

            <a
              href="https://wa.me/919052572363?text=Hi%20Weaving%20Designs,%20I%20want%20to%20request%20a%20custom%20weaving%20design."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <span>Make My Own Design</span>
            </a>

            {/* Vertical Separator */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors" aria-label="Toggle Dark Mode">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Shopping Cart Indicator */}
            <Link to="/cart" className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors">
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-brand-500 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link to="/cart" className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors">
              <ShoppingCart size={18} />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-brand-500 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>

            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden glass border-t border-slate-200 dark:border-slate-800/60 px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors">
            Marketplace
          </Link>
          <Link to="/downloads" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors">
            My Downloads
          </Link>
          <div className="pt-2">
            <a
              href="https://wa.me/919052572363?text=Hi%20Weaving%20Designs,%20I%20want%20to%20request%20a%20custom%20weaving%20design."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow"
            >
              Make My Own Design
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
