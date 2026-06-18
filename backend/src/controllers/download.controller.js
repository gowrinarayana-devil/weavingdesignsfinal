const { supabaseAdmin, isDummy } = require('../config/supabase');

/**
 * Validates purchase and generates a signed URL for secure file delivery
 */
exports.generateSignedUrl = async (req, res) => {
  try {
    const { designId, email } = req.body;

    if (!designId) {
      return res.status(400).json({ error: 'Design ID is required.' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    // 1. Mock simulation logic if Supabase is not configured
    if (isDummy) {
      // Simulate download URL return
      return res.status(200).json({
        signedUrl: `https://dummy-project.supabase.co/storage/v1/object/sign/original-files/rose_design_${designId.substring(0,6)}.zip?token=mock_download_token`,
        message: 'Mock purchase verified. Downloader active (Sandbox).'
      });
    }

    // 2. Query orders table to verify success
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('customer_email', email)
      .eq('design_id', designId)
      .eq('payment_status', 'success')
      .limit(1)
      .maybeSingle();

    if (orderErr) {
      console.error('Database query order error:', orderErr);
      return res.status(500).json({ error: 'Database check failed.' });
    }

    if (!order) {
      return res.status(403).json({
        error: 'Access Denied: You must purchase this design before downloading.'
      });
    }

    // 3. Fetch private file path for design
    const { data: design, error: designErr } = await supabaseAdmin
      .from('designs')
      .select('zip_file_path')
      .eq('id', designId)
      .single();

    if (designErr || !design) {
      console.error('Database design query error:', designErr);
      return res.status(404).json({ error: 'Design files not found in system.' });
    }

    const filePath = design.zip_file_path; // e.g. "design_id.zip" or "original-files/design_id.zip"
    // Extract relative path from absolute if prefix matches
    const relativePath = filePath.startsWith('original-files/')
      ? filePath.replace('original-files/', '')
      : filePath;

    // 4. Generate signed url from Supabase Storage (5-minute expiration window)
    const { data: signData, error: signErr } = await supabaseAdmin.storage
      .from('original-files')
      .createSignedUrl(relativePath, 300); // 300 seconds = 5 minutes

    if (signErr || !signData || !signData.signedUrl) {
      console.error('Supabase signed URL error:', signErr);
      return res.status(500).json({ error: 'Failed to generate secure download link.' });
    }

    // 5. Log download request activity in downloads table
    try {
      const { data: existingDownload } = await supabaseAdmin
        .from('downloads')
        .select('id, download_count')
        .eq('customer_email', email)
        .eq('design_id', designId)
        .maybeSingle();

      if (existingDownload) {
        await supabaseAdmin
          .from('downloads')
          .update({
            download_count: existingDownload.download_count + 1,
            last_download: new Date().toISOString()
          })
          .eq('id', existingDownload.id);
      } else {
        await supabaseAdmin
          .from('downloads')
          .insert({
            customer_email: email,
            design_id: designId,
            download_count: 1,
            last_download: new Date().toISOString()
          });
      }
    } catch (logErr) {
      console.error('Failed to log download activity (non-fatal):', logErr);
    }

    return res.status(200).json({
      signedUrl: signData.signedUrl,
      message: 'Download permission granted.'
    });

  } catch (err) {
    console.error('Signed URL Controller Error:', err);
    return res.status(500).json({ error: 'Failed to process secure downloader.' });
  }
};
