const crypto = require('crypto');
const { supabaseAdmin, isDummy } = require('../config/supabase');
const { razorpayInstance, isDummyRazorpay } = require('../config/razorpay');

/**
 * Creates a Razorpay order for a design purchase
 */
exports.createOrder = async (req, res) => {
  try {
    const { designId, email } = req.body;

    if (!designId) {
      return res.status(400).json({ error: 'Design ID is required.' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Customer email is required.' });
    }

    // Retrieve design details from database
    let design;
    if (isDummy) {
      // Return a mock design if database isn't connected
      design = { id: designId, title: 'Sample Embroidery Design', price: 299.00 };
    } else {
      const { data, error } = await supabaseAdmin
        .from('designs')
        .select('id, title, price')
        .eq('id', designId)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Design not found.' });
      }
      design = data;
    }

    const price = parseFloat(design.price);
    const amountInPaise = Math.round(price * 100);

    // If Razorpay is missing, run in dummy simulation mode
    if (isDummyRazorpay) {
      const mockOrderId = `order_mock_${crypto.randomBytes(6).toString('hex')}`;
      
      // Store pending order in Supabase
      if (!isDummy) {
        const { error: insertErr } = await supabaseAdmin
          .from('orders')
          .insert({
            customer_email: email,
            design_id: design.id,
            payment_id: null,
            order_id: mockOrderId,
            amount: price,
            payment_status: 'pending'
          });

        if (insertErr) {
          console.error('Failed to create pending order:', insertErr);
          return res.status(500).json({ error: 'Failed to record purchase order.' });
        }
      }

      return res.status(200).json({
        isMock: true,
        key_id: 'rzp_test_mock',
        amount: amountInPaise,
        currency: 'INR',
        order_id: mockOrderId,
        design: { id: design.id, title: design.title }
      });
    }

    // Creating Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${design.id.substring(0, 8)}`,
      notes: {
        design_id: design.id,
        customer_email: email
      }
    };

    razorpayInstance.orders.create(options, async (err, rzpOrder) => {
      if (err) {
        console.error('Razorpay order creation error:', err);
        return res.status(500).json({ error: 'Failed to initiate Razorpay order.' });
      }

      // Record pending order in database
      if (!isDummy) {
        const { error: insertErr } = await supabaseAdmin
          .from('orders')
          .insert({
            customer_email: email,
            design_id: design.id,
            payment_id: null,
            order_id: rzpOrder.id,
            amount: price,
            payment_status: 'pending'
          });

        if (insertErr) {
          console.error('Failed to record pending order:', insertErr);
          return res.status(500).json({ error: 'Failed to record purchase order.' });
        }
      }

      return res.status(200).json({
        isMock: false,
        key_id: process.env.RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.id,
        design: { id: design.id, title: design.title }
      });
    });

  } catch (err) {
    console.error('Create Order Error:', err);
    return res.status(500).json({ error: 'Failed to process checkout order.' });
  }
};

/**
 * Verifies Razorpay payment signature and completes the order
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, designId } = req.body;

    if (!order_id || !designId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // 1. Handle Dummy/Mock verification
    if (isDummyRazorpay || order_id.startsWith('order_mock_')) {
      if (!isDummy) {
        // Find order and update to success
        const { error: updateErr } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'success',
            payment_id: payment_id || `pay_mock_${crypto.randomBytes(6).toString('hex')}`
          })
          .eq('order_id', order_id);

        if (updateErr) {
          console.error('Failed to update order status:', updateErr);
          return res.status(500).json({ error: 'Failed to process order completion.' });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Mock payment verified and registered successfully.',
        download_ready: true
      });
    }

    // 2. Real Payment verification using signature checking
    if (!payment_id || !signature) {
      return res.status(400).json({ error: 'Payment ID and signature are required.' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    const isValid = generated_signature === signature;

    if (isValid) {
      if (!isDummy) {
        // Verify user holds this order and update status to success
        const { error: updateErr } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'success',
            payment_id: payment_id
          })
          .eq('order_id', order_id);

        if (updateErr) {
          console.error('Order update error:', updateErr);
          return res.status(500).json({ error: 'Payment verified, but failed to update order database.' });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified and registered successfully.',
        download_ready: true
      });
    } else {
      // Flag order as failed
      if (!isDummy) {
        await supabaseAdmin
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('order_id', order_id);
      }
      return res.status(400).json({ error: 'Payment signature verification failed.' });
    }

  } catch (err) {
    console.error('Payment Verification Error:', err);
    return res.status(500).json({ error: 'Verification failed.' });
  }
};
