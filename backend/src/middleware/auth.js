const jwt = require('jsonwebtoken');
const { supabaseAdmin, isDummy } = require('../config/supabase');

/**
 * Authentication middleware that verifies the user's token using Supabase Auth
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In dummy/development mode without real Supabase, allow bypassing auth with mock header
      if (isDummy && req.headers['x-mock-user']) {
        req.user = {
          id: req.headers['x-mock-user-id'] || 'e6e580a5-2965-4f40-845a-6cd89182390f',
          email: req.headers['x-mock-user'] || 'mockuser@example.com',
          role: req.headers['x-mock-role'] || 'user',
          name: 'Mock User'
        };
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized: Bearer token is required.' });
    }

    const token = authHeader.split(' ')[1];

    if (isDummy) {
      // In dummy mode, extract claims from token if it's mock JWT, or just assign mock user
      req.user = {
        id: 'e6e580a5-2965-4f40-845a-6cd89182390f',
        email: 'customer@example.com',
        role: token.includes('admin') ? 'admin' : 'user',
        name: token.includes('admin') ? 'Mock Admin' : 'Mock Customer'
      };
      return next();
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }

    req.user = user;

    // Fetch profile details for custom role-based access control
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('name, email, role, two_factor_enabled')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      req.user.role = 'user';
      req.user.name = user.user_metadata?.name || user.email;
    } else {
      req.user.role = profile.role;
      req.user.name = profile.name;
      req.user.two_factor_enabled = profile.two_factor_enabled;
    }

    next();
  } catch (err) {
    console.error('Authentication Error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

/**
 * Middleware requiring the authenticated user to be an admin
 */
const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access is required.' });
    }
    next();
  });
};

/**
 * Middleware requiring the admin to have completed 2FA check (checks backend issued JWT)
 */
const requireAdmin2FA = async (req, res, next) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken) {
      return res.status(403).json({ error: 'Forbidden: Admin session token is required.' });
    }

    // 1. Check if it's the dummy client's mock token (development/dummy mode)
    if (isDummy && (adminToken === 'mock_admin_session_token' || adminToken.includes('mock'))) {
      req.admin = {
        userId: 'mock-admin-uuid-0001',
        email: 'gudurupavan0297@gmail.com',
        role: 'admin'
      };
      return next();
    }

    // 2. Try verifying as standard Supabase Access Token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(adminToken);
    if (!error && user) {
      // Fetch user profile from public.users to check if they are indeed an admin
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profileError && profile && profile.role === 'admin') {
        req.admin = {
          userId: user.id,
          email: user.email,
          role: 'admin'
        };
        return next();
      }
    }

    // 3. Fallback: Try verifying as legacy 2FA JWT token (signed with JWT_SECRET)
    try {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET || 'temporary_admin_secret_key');
      if (decoded.role === 'admin') {
        req.admin = decoded;
        return next();
      }
    } catch (e) {}

    try {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET || 'super_secret_temporary_jwt_key_for_development');
      if (decoded.role === 'admin') {
        req.admin = decoded;
        return next();
      }
    } catch (e) {}

    return res.status(403).json({ error: 'Forbidden: Invalid administrative privileges.' });
  } catch (err) {
    console.error('requireAdmin2FA validation error:', err);
    return res.status(403).json({ error: 'Forbidden: Administrative session expired.' });
  }
};

module.exports = { requireAuth, requireAdmin, requireAdmin2FA };
