const Razorpay = require('razorpay');
require('dotenv').config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isDummyRazorpay = !keyId || !keySecret || keyId.includes('dummy') || keyId.includes('your-razorpay');

if (isDummyRazorpay) {
  console.warn('⚠️ WARNING: Razorpay credentials are missing or default. Payment flow will run in Sandbox Mode.');
}

const razorpayInstance = !isDummyRazorpay
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    })
  : null;

module.exports = { razorpayInstance, isDummyRazorpay };
