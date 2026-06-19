import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100 text-slate-600 dark:bg-dark-950 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-900 pb-6 mb-6">
          <div className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="WEAVING DESIGNS Logo" className="w-8 h-8 object-cover rounded-lg shadow border border-slate-200/50 dark:border-slate-800/40" />
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-800 dark:text-slate-200">
              WEAVING DESIGNS
            </span>
          </div>
          <p className="text-sm text-center md:text-right max-w-md">
            Premium, high-resolution weaving machine patterns (DST, PES, BMP) with production-ready instructions and digital watermarking.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} WEAVING DESIGNS. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-brand-500 transition-colors">Marketplace</Link>
            <a href="http://localhost:8080" className="hover:text-brand-500 transition-colors">Admin Portal</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
