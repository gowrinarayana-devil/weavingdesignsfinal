const crypto = require('crypto');
const { supabaseAdmin, isDummy } = require('../config/supabase');
const { isDummyRazorpay } = require('../config/razorpay');

/**
 * Creates a UPI payment session tracking entry for a design purchase
 */
exports.createOrder = async (req, res) => {
  try {
    const { designId, designIds, email } = req.body;

    if (!designId && (!designIds || designIds.length === 0)) {
      return res.status(400).json({ error: 'Design ID(s) are required.' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Customer email is required.' });
    }

    const ids = designIds && designIds.length > 0 ? designIds : [designId];

    // Retrieve design details from database
    let designs = [];
    if (isDummy) {
      // Return mock designs if database isn't connected
      designs = ids.map(id => ({ id, title: 'Sample Embroidery Design', price: 299.00 }));
    } else {
      const { data, error } = await supabaseAdmin
        .from('designs')
        .select('id, title, price')
        .in('id', ids);

      if (error || !data || data.length === 0) {
        return res.status(404).json({ error: 'Designs not found in system.' });
      }
      designs = data;
    }

    const totalPrice = designs.reduce((sum, d) => sum + parseFloat(d.price), 0);
    const amountInPaise = Math.round(totalPrice * 100);
    const upiId = process.env.UPI_ID || 'weavingdesigns@ybl';
    const orderId = `order_upi_${crypto.randomBytes(6).toString('hex')}`;

    // Store pending orders in Supabase
    if (!isDummy) {
      const orderRows = designs.map(d => ({
        customer_email: email,
        design_id: d.id,
        payment_id: null,
        order_id: orderId,
        amount: parseFloat(d.price),
        payment_status: 'pending'
      }));

      const { error: insertErr } = await supabaseAdmin
        .from('orders')
        .insert(orderRows);

      if (insertErr) {
        console.error('Failed to create pending orders:', insertErr);
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
      designs: designs.map(d => ({ id: d.id, title: d.title }))
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
    const { order_id, payment_id } = req.body; // payment_id will contain the user entered UTR

    if (!order_id) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    if (!payment_id) {
      return res.status(400).json({ error: 'UPI Transaction UTR/Reference ID is required.' });
    }

    // 1. Handle Dummy/Mock verification or auto-approval in sandbox mode
    if (isDummyRazorpay || order_id.startsWith('order_mock_')) {
      if (!isDummy) {
        // Query to see how many rows exist for this order_id
        const { data: orderRows } = await supabaseAdmin
          .from('orders')
          .select('id, design_id')
          .eq('order_id', order_id);

        if (orderRows && orderRows.length > 0) {
          for (const row of orderRows) {
            // Append design_id suffix if multiple rows exist to avoid unique constraint key violations
            const finalUtr = orderRows.length > 1 ? `${payment_id}_${row.design_id}` : payment_id;
            await supabaseAdmin
              .from('orders')
              .update({
                payment_status: 'success',
                payment_id: finalUtr
              })
              .eq('id', row.id);
          }
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
      // Query to see how many rows exist for this order_id
      const { data: orderRows, error: fetchErr } = await supabaseAdmin
        .from('orders')
        .select('id, design_id')
        .eq('order_id', order_id);

      if (fetchErr || !orderRows || orderRows.length === 0) {
        return res.status(404).json({ error: 'Order details not found.' });
      }

      for (const row of orderRows) {
        const finalUtr = orderRows.length > 1 ? `${payment_id}_${row.design_id}` : payment_id;
        const { error: updateErr } = await supabaseAdmin
          .from('orders')
          .update({
            payment_id: finalUtr,
            payment_status: 'success'
          })
          .eq('id', row.id);

        if (updateErr) {
          console.error('Failed to register payment UTR:', updateErr);
          return res.status(500).json({ error: 'Failed to process transaction completion.' });
        }
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

