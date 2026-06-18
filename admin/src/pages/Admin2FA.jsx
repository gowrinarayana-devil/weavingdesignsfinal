import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertCircle, KeyRound, QrCode } from 'lucide-react';

export default function Admin2FA() {
  const { user, verify2FA, setup2FA, setTwoFactorRequired } = useAuth();
  const navigate = useNavigate();

  const [setupMode, setSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if user is not logged in or not an admin
    if (!user) {
      navigate('/login');
      return;
    }

    const init2FA = async () => {
      try {
        setLoading(true);
        const res = await setup2FA();
        if (res.twoFactorEnabled) {
          setSetupMode(false);
        } else {
          setSetupMode(true);
          setQrCode(res.qrCode);
          setSecret(res.secret);
        }
      } catch (err) {
        console.error('Failed to query 2FA settings:', err);
        setError('Failed to establish connection with 2FA server.');
      } finally {
        setLoading(false);
      }
    };

    init2FA();
  }, [user, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (token.length !== 6 || isNaN(token)) {
      setError('Please enter a valid 6-digit TOTP code.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const res = await verify2FA(token);

    if (res.success) {
      setSuccess('2FA Verification successful! Loading admin control center...');
      setTwoFactorRequired(false);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } else {
      setError(res.error || 'Invalid passcode. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-xl animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex bg-brand-500/10 text-brand-600 dark:text-brand-400 p-3 rounded-full mb-3">
            <ShieldAlert size={28} />
          </div>
          <h2 className="font-display font-black text-xl text-slate-800 dark:text-white">Admin Secondary Authentication</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Two-Factor Verification is required to access administrative features.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-lg border border-red-500/20 text-xs mb-4">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-lg border border-emerald-500/20 text-xs mb-4">
            {success}
          </div>
        )}

        {/* Enrollment Step-by-Step Flow (if not configured) */}
        {setupMode && qrCode && (
          <div className="space-y-6 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
            <div className="bg-brand-500/5 dark:bg-brand-500/10 p-4 rounded-xl border border-brand-500/20 text-[11px] leading-relaxed text-slate-600 dark:text-slate-350 space-y-2">
              <p className="font-bold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                <QrCode size={14} className="text-brand-500" />
                <span>2FA Onboarding Enrollment:</span>
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Download Google Authenticator, Authy, or Microsoft Authenticator.</li>
                <li>Scan the barcode image below using your authenticator app.</li>
                <li>Or manually input the secret code: <strong className="font-mono text-brand-600 dark:text-brand-400 select-all">{secret}</strong></li>
              </ol>
            </div>

            <div className="flex justify-center bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm max-w-[200px] mx-auto">
              <img src={qrCode} alt="2FA Scanner Barcode" className="w-full object-contain" />
            </div>
          </div>
        )}

        {/* TOTP Entry Code Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 text-center">
              Enter 6-Digit Authenticator Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <KeyRound size={18} />
              </span>
              <input
                type="text"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono text-center tracking-[0.4em] text-lg"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-brand-600/10 transition-all text-xs flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Sandbox Bypass Code: <strong className="font-semibold text-brand-500">123456</strong>
          </p>
        </div>

      </div>
    </div>
  );
}
