const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const { supabaseAdmin, isDummy } = require('../config/supabase');

// Helper to sign custom admin token
const signAdminToken = (userId, email) => {
  return jwt.sign(
    { userId, email, role: 'admin', verified2FA: true },
    process.env.JWT_SECRET || 'temporary_admin_secret_key',
    { expiresIn: '12h' }
  );
};

/**
 * Initiates Two-Factor Authentication setup for admin users
 */
exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access Denied: Admin role required.' });
    }

    if (isDummy) {
      // Simulate generating 2FA secret and qr code
      const secret = 'MOCKSAMPLE2FASECRETSECRET';
      const otpauthUrl = `otpauth://totp/EmbroideryMarketplace:${userEmail}?secret=${secret}&issuer=EmbroideryMarketplace`;
      const qrDataUrl = await qrcode.toDataURL(otpauthUrl);
      return res.status(200).json({
        twoFactorEnabled: false,
        secret,
        qrCode: qrDataUrl
      });
    }

    // Query current status
    const { data: userProfile, error: queryErr } = await supabaseAdmin
      .from('users')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', userId)
      .single();

    if (queryErr) {
      console.error('2FA Query Profile Error:', queryErr);
      return res.status(500).json({ error: 'Failed to retrieve profile status.' });
    }

    if (userProfile.two_factor_enabled) {
      return res.status(200).json({
        twoFactorEnabled: true,
        message: 'Two-Factor Authentication is already configured and enabled.'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `EmbroideryMarketplace:${userEmail}`
    });

    // Save secret temporarily in db (waiting for verification)
    const { error: updateErr } = await supabaseAdmin
      .from('users')
      .update({ two_factor_secret: secret.base32 })
      .eq('id', userId);

    if (updateErr) {
      console.error('Failed to save 2FA secret:', updateErr);
      return res.status(500).json({ error: 'Failed to save 2FA secret.' });
    }

    // Generate QR code data URL
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    return res.status(200).json({
      twoFactorEnabled: false,
      secret: secret.base32,
      qrCode: qrCodeDataUrl
    });

  } catch (err) {
    console.error('2FA Setup Error:', err);
    return res.status(500).json({ error: 'Internal server error setting up 2FA.' });
  }
};

/**
 * Verifies TOTP token and issues custom 2FA admin JWT
 */
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }

    if (isDummy) {
      // In sandbox mode, accept '123456' as valid token
      if (token === '123456' || token === '000000') {
        const customToken = signAdminToken(userId, userEmail);
        return res.status(200).json({
          success: true,
          adminToken: customToken,
          message: '2FA verified successfully (Sandbox).'
        });
      }
      return res.status(400).json({ error: 'Invalid 2FA token. Use 123456 for testing.' });
    }

    // Query secret
    const { data: userProfile, error: queryErr } = await supabaseAdmin
      .from('users')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', userId)
      .single();

    if (queryErr || !userProfile || !userProfile.two_factor_secret) {
      return res.status(400).json({ error: '2FA secret not found. Run setup first.' });
    }

    const verified = speakeasy.totp.verify({
      secret: userProfile.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 1 // 30-second tolerance window
    });

    if (verified) {
      // Enable 2FA permanently if not done
      if (!userProfile.two_factor_enabled) {
        await supabaseAdmin
          .from('users')
          .update({ two_factor_enabled: true })
          .eq('id', userId);
      }

      const adminToken = signAdminToken(userId, userEmail);

      return res.status(200).json({
        success: true,
        adminToken,
        message: 'Two-Factor authentication approved.'
      });
    } else {
      return res.status(400).json({ error: 'Invalid verification token.' });
    }

  } catch (err) {
    console.error('2FA Verification Error:', err);
    return res.status(500).json({ error: 'Verification failed.' });
  }
};

/**
 * Retrieves dashboard analytical data
 */
exports.getDashboardStats = async (req, res) => {
  try {
    if (isDummy) {
      // Return beautiful mock statistics
      return res.status(200).json({
        stats: {
          totalRevenue: 54950.00,
          totalUsers: 142,
          totalOrders: 98,
          totalDesigns: 24,
          recentOrders: [
            { id: '1', name: 'Rohan Sharma', email: 'rohan@example.com', title: 'Elephant Mandala Blouse', amount: 350.00, status: 'success', created_at: new Date().toISOString() },
            { id: '2', name: 'Neha Gupta', email: 'neha@example.com', title: 'Traditional Rose Border', amount: 199.00, status: 'success', created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: '3', name: 'Amit Patil', email: 'amit@example.com', title: 'Gold Zari Butti Motif', amount: 499.00, status: 'success', created_at: new Date(Date.now() - 86400000).toISOString() }
          ],
          monthlyRevenue: [
            { month: 'Jan', sales: 12000 },
            { month: 'Feb', sales: 19000 },
            { month: 'Mar', sales: 15000 },
            { month: 'Apr', sales: 27000 },
            { month: 'May', sales: 34000 },
            { month: 'Jun', sales: 54950 }
          ],
          topSelling: [
            { id: 'd1', title: 'Gold Zari Butti Motif', salesCount: 42, revenue: 20958 },
            { id: 'd2', title: 'Traditional Rose Border', salesCount: 31, revenue: 6169 },
            { id: 'd3', title: 'Elephant Mandala Blouse', salesCount: 25, revenue: 8750 }
          ]
        }
      });
    }

    // 1. Fetch total counts and metrics
    const { count: designsCount } = await supabaseAdmin.from('designs').select('*', { count: 'exact', head: true });
    const { count: usersCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
    
    // Revenue and Order status aggregation
    const { data: orders, error: ordersErr } = await supabaseAdmin
      .from('orders')
      .select('amount, payment_status, created_at, user_id, design_id');

    if (ordersErr) {
      throw ordersErr;
    }

    const successOrders = orders.filter(o => o.payment_status === 'success');
    const totalOrders = successOrders.length;
    const totalRevenue = successOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);

    // Fetch design details to cross-reference titles for top-selling lists
    const { data: designs } = await supabaseAdmin.from('designs').select('id, title');
    const designMap = (designs || []).reduce((acc, d) => ({ ...acc, [d.id]: d.title }), {});

    // Compute top selling designs
    const designSales = {};
    successOrders.forEach(o => {
      if (!designSales[o.design_id]) {
        designSales[o.design_id] = { salesCount: 0, revenue: 0 };
      }
      designSales[o.design_id].salesCount += 1;
      designSales[o.design_id].revenue += parseFloat(o.amount);
    });

    const topSelling = Object.keys(designSales)
      .map(id => ({
        id,
        title: designMap[id] || 'Unknown Design',
        salesCount: designSales[id].salesCount,
        revenue: designSales[id].revenue
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    // Get profiles for recent orders list
    const { data: recentOrdersData } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        amount,
        payment_status,
        created_at,
        design_id,
        user_id,
        customer_email,
        payment_id,
        order_id
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch corresponding user profiles
    const userIds = [...new Set((recentOrdersData || []).map(o => o.user_id).filter(Boolean))];
    const { data: profiles } = await supabaseAdmin.from('users').select('id, name, email').in('id', userIds);
    const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

    const recentOrders = (recentOrdersData || []).map(o => ({
      id: o.id,
      amount: o.amount,
      status: o.payment_status,
      created_at: o.created_at,
      title: designMap[o.design_id] || 'Deleted Design',
      name: profileMap[o.user_id]?.name || 'Weaving Customer',
      email: o.customer_email || profileMap[o.user_id]?.email || 'N/A',
      payment_id: o.payment_id,
      order_id: o.order_id
    }));

    // Process monthly revenue metrics (Last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = monthNames[d.getMonth()];
      monthlyMap[mLabel] = 0;
    }

    successOrders.forEach(o => {
      const orderDate = new Date(o.created_at);
      const mLabel = monthNames[orderDate.getMonth()];
      if (monthlyMap[mLabel] !== undefined) {
        monthlyMap[mLabel] += parseFloat(o.amount);
      }
    });

    const monthlyRevenue = Object.keys(monthlyMap).map(month => ({
      month,
      sales: monthlyMap[month]
    }));

    return res.status(200).json({
      stats: {
        totalRevenue,
        totalUsers: usersCount || 0,
        totalOrders,
        totalDesigns: designsCount || 0,
        recentOrders,
        monthlyRevenue,
        topSelling
      }
    });

  } catch (err) {
    console.error('Admin Dashboard Analytics Error:', err);
    return res.status(500).json({ error: 'Failed to compile admin stats.' });
  }
};
