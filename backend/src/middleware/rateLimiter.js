const rateLimit = require('express-rate-limit');

// General API request limiter (100 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Stricter limiter for checkout/payments to prevent abuse (15 order creation attempts per hour)
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many payment requests from this IP. Please wait an hour.'
  }
});

module.exports = { apiLimiter, paymentLimiter };
