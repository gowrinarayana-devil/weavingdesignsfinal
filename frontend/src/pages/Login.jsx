import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Scissors } from 'lucide-react';

export default function Login() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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

    if (isLogin) {
      const { error: signInErr } = await signIn(email, password);
      if (signInErr) {
        setError(signInErr.message || 'Login failed. Please verify credentials.');
        setLoading(false);
      } else {
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      }
    } else {
      if (!name) {
        setError('Name is required.');
        setLoading(false);
        return;
      }
      const { error: signUpErr } = await signUp(email, password, name);
      if (signUpErr) {
        setError(signUpErr.message || 'Registration failed.');
        setLoading(false);
      } else {
        setSuccess('Registration successful! You can now log in.');
        setIsLogin(true);
        setLoading(false);
      }
    }
  };

  const loadMockUser = async (roleType) => {
    setEmail(roleType === 'admin' ? 'admin@example.com' : 'customer@example.com');
    setPassword(roleType === 'admin' ? 'admin123' : 'user123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/40 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-brand-500 text-white p-3 rounded-xl shadow-lg shadow-brand-500/20 mb-3 justify-center items-center">
            <Scissors size={26} className="rotate-95" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-800 dark:text-slate-100">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {isLogin ? 'Sign in to access your purchased designs' : 'Join us to purchase premium embroidery files'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              isLogin ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              !isLogin ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            Register
          </button>
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
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-500 transition-all text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-500 transition-all text-sm"
                placeholder="name@example.com"
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
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Sandbox Dev Shortcuts */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center">Sandbox Mock Credentials</p>
          <div className="flex gap-2">
            <button
              onClick={() => loadMockUser('user')}
              className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-dark-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
            >
              Customer Login
            </button>
            <button
              onClick={() => loadMockUser('admin')}
              className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-dark-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
            >
              Admin Login
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">Passwords: customer is user123, admin is admin123</p>
        </div>
      </div>
    </div>
  );
}
