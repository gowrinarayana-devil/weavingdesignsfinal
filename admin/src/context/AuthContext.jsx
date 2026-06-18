import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDummyClient } from '../supabase';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      if (isDummyClient) {
        const savedUser = localStorage.getItem('mockUser');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setRole(parsed.role);
          if (parsed.role === 'admin' && !adminToken) {
            setTwoFactorRequired(true);
          }
        }
        setLoading(false);
        return;
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await fetchUserProfile(session.user);
      } else {
        clearAuthStates();
      }
      setLoading(false);

      // Listen to auth state transitions
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession) {
          await fetchUserProfile(currentSession.user);
        } else {
          clearAuthStates();
        }
        setLoading(false);
      });

      return () => {
        subscription?.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, role, two_factor_enabled')
        .eq('id', authUser.id)
        .single();

      if (error || !data) {
        // Fallback for profiles not loaded yet
        setUser({ ...authUser, name: authUser.user_metadata?.name || authUser.email });
        setRole('user');
        
        // If not admin, sign them out immediately
        await supabase.auth.signOut();
        clearAuthStates();
        throw new Error('Access denied: Admin privileges are required.');
      } else if (data.role !== 'admin') {
        // Reject non-admin access
        await supabase.auth.signOut();
        clearAuthStates();
        throw new Error('Access denied: Admin privileges are required.');
      } else {
        setUser({ ...authUser, name: data.name, twoFactorEnabled: data.two_factor_enabled });
        setRole(data.role);
        
        // If role is admin and we don't have a 2FA verified token, flag it
        if (!adminToken) {
          setTwoFactorRequired(true);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile or not authorized:', err);
      clearAuthStates();
      throw err;
    }
  };

  const clearAuthStates = () => {
    setUser(null);
    setRole(null);
    setAdminToken(null);
    setTwoFactorRequired(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('mockUser');
  };

  // Sign In Handler for Admin
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      if (isDummyClient) {
        const isMockAdmin = email.toLowerCase() === 'admin@example.com' && password === 'admin123';
        if (!isMockAdmin) {
          throw new Error('Invalid mock credentials. Admin login is admin@example.com / admin123');
        }

        const mockSessionUser = {
          id: 'mock-admin-uuid-0001',
          email,
          name: 'System Admin',
          role: 'admin'
        };

        setUser(mockSessionUser);
        setRole(mockSessionUser.role);
        localStorage.setItem('mockUser', JSON.stringify(mockSessionUser));
        
        if (!adminToken) {
          setTwoFactorRequired(true);
        }

        setLoading(false);
        return { data: mockSessionUser, error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      await fetchUserProfile(data.user);
      return { data, error: null };
    } catch (err) {
      setLoading(false);
      clearAuthStates();
      return { data: null, error: err };
    }
  };

  // Sign Out Handler
  const signOut = async () => {
    setLoading(true);
    if (!isDummyClient) {
      await supabase.auth.signOut();
    }
    clearAuthStates();
    setLoading(false);
  };

  // Setup 2FA
  const setup2FA = async () => {
    try {
      let authHeaders = {};
      if (!isDummyClient) {
        const { data: { session } } = await supabase.auth.getSession();
        authHeaders = { Authorization: `Bearer ${session?.access_token}` };
      } else {
        authHeaders = { Authorization: 'Bearer mock_admin_session_token' };
      }

      const res = await axios.post('/api/admin/setup-2fa', {}, { headers: authHeaders });
      return res.data;
    } catch (err) {
      console.error('2FA Setup Request Failed:', err);
      throw err.response?.data || err;
    }
  };

  // Verify 2FA TOTP Token
  const verify2FA = async (token) => {
    try {
      let authHeaders = {};
      if (!isDummyClient) {
        const { data: { session } } = await supabase.auth.getSession();
        authHeaders = { Authorization: `Bearer ${session?.access_token}` };
      } else {
        authHeaders = {
          Authorization: 'Bearer mock_admin_session_token',
          'x-mock-user': user?.email,
          'x-mock-user-id': user?.id,
          'x-mock-role': 'admin'
        };
      }

      const res = await axios.post('/api/admin/verify-2fa', { token }, { headers: authHeaders });
      
      if (res.data.success && res.data.adminToken) {
        setAdminToken(res.data.adminToken);
        localStorage.setItem('adminToken', res.data.adminToken);
        setTwoFactorRequired(false);
        return { success: true };
      }
      return { success: false, error: 'Verification failed.' };
    } catch (err) {
      console.error('2FA Verification Request Failed:', err);
      return { success: false, error: err.response?.data?.error || 'Verification server error.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      adminToken,
      twoFactorRequired,
      setTwoFactorRequired,
      signIn,
      signOut,
      setup2FA,
      verify2FA
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
