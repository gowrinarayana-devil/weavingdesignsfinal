import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Scissors } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect after success
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error: signInErr } = await signIn(email, password);
    if (signInErr) {
      setError(signInErr.message || 'Login failed. Please verify admin credentials.');
      setLoading(false);
    } else {
      setSuccess('Authenticated successfully!');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/40 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="WEAVING DESIGNS Logo" className="w-16 h-16 object-cover rounded-2xl mx-auto shadow-lg border border-slate-200/50 dark:border-slate-800/40 mb-3" />
          <h2 className="font-display font-extrabold text-2xl text-slate-800 dark:text-slate-100">
            WEAVING DESIGNS Admin Portal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Sign in to access catalog upload and metrics dashboard.
          </p>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="flex items-center space-x-2 bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-lg border border-red-500/20 text-sm mb-4">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-lg border border-emerald-500/20 text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Admin Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-500 transition-all text-sm"
                placeholder="gudurupavan0297@gmail.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-medium">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-500 transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white font-medium py-2.5 rounded-lg shadow-md shadow-brand-600/10 transition-all text-sm mt-6 flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
