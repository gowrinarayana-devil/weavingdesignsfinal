const crypto = require('crypto');
const { supabaseAdmin, isDummy } = require('../config/supabase');
const { isDummyRazorpay } = require('../config/razorpay');

/**
 * Creates a UPI payment session tracking entry for a design purchase
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
    const upiId = process.env.UPI_ID || '9052572363@ybl';
    const orderId = `order_upi_${crypto.randomBytes(6).toString('hex')}`;

    // Store pending order in Supabase
    if (!isDummy) {
      const { error: insertErr } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_email: email,
          design_id: design.id,
          payment_id: null,
          order_id: orderId,
          amount: price,
          payment_status: 'pending'
        });

      if (insertErr) {
        console.error('Failed to create pending order:', insertErr);
        return res.status(500).json({ error: 'Failed to record purchase order.' });
      }
    }

    return res.status(200).json({
      success: true,
      isMock: isDummyRazorpay, // Keep isMock true when key is dummy to allow frontend simulation UI
      amount: amountInPaise,
      currency: 'INR',
      order_id: orderId,
      upi_id: upiId,
      design: { id: design.id, title: design.title }
    });

  } catch (err) {
    console.error('Create Order Error:', err);
    return res.status(500).json({ error: 'Failed to process checkout order.' });
  }
};

/**
 * Verifies UPI payment references and updates status
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, designId } = req.body; // payment_id will contain the user entered UTR

    if (!order_id || !designId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    if (!payment_id) {
      return res.status(400).json({ error: 'UPI Transaction UTR/Reference ID is required.' });
    }

    // 1. Handle Dummy/Mock verification or auto-approval in sandbox mode
    if (isDummyRazorpay || order_id.startsWith('order_mock_')) {
      if (!isDummy) {
        // Find order and update to success
        const { error: updateErr } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'success',
            payment_id: payment_id
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

    // 2. Real Payment verification: check if UTR is 12 digits and auto-approve
    const isUtrValid = /^\d{12}$/.test(payment_id);
    if (!isUtrValid) {
      return res.status(400).json({ error: 'Invalid UPI Transaction Reference. Must be a 12-digit numeric UTR ID.' });
    }

    if (!isDummy) {
      const { error: updateErr } = await supabaseAdmin
        .from('orders')
        .update({
          payment_id: payment_id,
          payment_status: 'success'
        })
        .eq('order_id', order_id);

      if (updateErr) {
        console.error('Failed to register payment UTR:', updateErr);
        return res.status(500).json({ error: 'Failed to process transaction completion.' });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and registered successfully.',
      download_ready: true
    });

  } catch (err) {
    console.error('Payment Verification Error:', err);
    return res.status(500).json({ error: 'Verification failed.' });
  }
};

