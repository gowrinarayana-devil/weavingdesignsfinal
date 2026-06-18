const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Create a payment order session (rate limited)
router.post('/create-order', paymentLimiter, paymentController.createOrder);

// Verify signature of completed order payment
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
