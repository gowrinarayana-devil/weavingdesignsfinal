const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireAdmin2FA } = require('../middleware/auth');

// Setup TOTP secret & return QR Code (requires primary Supabase Auth)
router.post('/setup-2fa', requireAuth, adminController.setup2FA);

// Verify TOTP token and issue secure admin session token (requires primary Supabase Auth)
router.post('/verify-2fa', requireAuth, adminController.verify2FA);

// Get analytical dashboard statistics (guarded by admin 2FA verification JWT check)
router.get('/dashboard-stats', requireAdmin2FA, adminController.getDashboardStats);

module.exports = router;
