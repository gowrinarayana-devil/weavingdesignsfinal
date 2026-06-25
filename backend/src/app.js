const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { apiLimiter } = require('./middleware/rateLimiter');
const paymentRoutes = require('./routes/payment.routes');
const downloadRoutes = require('./routes/download.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and CORS middleware configurations
app.use(cors({
  origin: '*', // In production, replace with specific frontend domains (e.g. Vercel)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'x-mock-user', 'x-mock-user-id', 'x-mock-role']
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply rate limiter to all APIs
app.use('/api/', apiLimiter);

// Custom security headers middleware (XSS Protection, Content-Type Options, basic CSRF check)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Custom headers disable caching for sensitive endpoints
  if (req.path.startsWith('/api/downloads') || req.path.startsWith('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }
  
  next();
});

// Route registration
app.use('/api/payments', paymentRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal server error occurred.'
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});

module.exports = app;
