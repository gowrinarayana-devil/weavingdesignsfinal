export const generateInvoicePDF = (item, customerEmail, paymentId, orderId, amount, date) => {
  const invoiceWindow = window.open('', '_blank');
  if (!invoiceWindow) {
    alert("Popup blocked! Please allow popups to view/print the invoice.");
    return;
  }

  const invoiceNo = paymentId ? `INV-${paymentId.toUpperCase()}` : `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const displayDate = date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString();
  const hooks = item.hooks ? item.hooks.replace(/hooks/i, '').trim() : '560';
  const cards = item.cards ? item.cards.replace(/cards/i, '').trim() : '700';
  const epi = item.reed ? item.reed.replace(/reed|steel/ig, '').trim() : '100';
  const ppi = item.box ? item.box.replace(/box|boxes/ig, '').trim() : '72';
  const harness = 'SINGLE';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${invoiceNo} - WEAVING DESIGNS</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          line-height: 1.5;
          background-color: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #851414;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          color: #851414;
          margin: 0;
          letter-spacing: -0.025em;
        }
        .inv-details {
          text-align: right;
        }
        .inv-details h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: #475569;
          letter-spacing: -0.025em;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }
        .meta-box h3 {
          margin: 0 0 6px 0;
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .meta-box p {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        .table th {
          background-color: #fafaf9;
          border-bottom: 2px solid #f5e9d3;
          color: #851414;
          text-align: left;
          padding: 12px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .spec-list {
          font-size: 11px;
          color: #475569;
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .spec-item {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .total-box {
          text-align: right;
          margin-top: 20px;
          margin-bottom: 50px;
        }
        .total-box p {
          font-size: 14px;
          margin: 6px 0;
          color: #475569;
        }
        .total-box .grand-total {
          font-size: 20px;
          font-weight: 800;
          color: #851414;
          margin-top: 10px;
        }
        .developer-details {
          margin-top: 80px;
          border-top: 1px dashed #cbd5e1;
          padding-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #64748b;
          line-height: 1.8;
        }
        .developer-details a {
          color: #851414;
          text-decoration: none;
          font-weight: 600;
        }
        .developer-details a:hover {
          text-decoration: underline;
        }
        @media print {
          body {
            padding: 10px;
          }
          .print-btn-container {
            display: none !important;
          }
        }
        .print-btn-container {
          text-align: right;
          margin-bottom: 24px;
        }
        .print-btn {
          background-color: #851414;
          color: white;
          border: none;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .print-btn:hover {
          background-color: #6a0f0f;
        }
      </style>
    </head>
    <body>
      <div class="print-btn-container">
        <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
      </div>

      <div class="header">
        <div class="logo-title">
          <img src="/logo.jpg" class="logo" alt="WEAVING DESIGNS Logo" />
          <h1 class="title">WEAVING DESIGNS</h1>
        </div>
        <div class="inv-details">
          <h2>INVOICE</h2>
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: bold; color: #851414;">${invoiceNo}</p>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-box">
          <h3>Billed To:</h3>
          <p>${customerEmail}</p>
        </div>
        <div class="meta-box" style="text-align: right;">
          <h3>Invoice Date:</h3>
          <p>${displayDate}</p>
          <h3 style="margin-top: 14px;">Payment Method:</h3>
          <p>UPI QR (Reference UTR: ${paymentId || 'N/A'})</p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Weaving Design Details</th>
            <th style="text-align: right; width: 120px;">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style="font-weight: bold; font-size: 14px; color: #0f172a;">${item.title}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Category: ${item.category}</div>
              <div class="spec-list">
                <span class="spec-item"><strong>HOOKS:</strong> ${hooks}</span>
                <span class="spec-item"><strong>CARDS:</strong> ${cards}</span>
                <span class="spec-item"><strong>REED:</strong> ${epi}</span>
                <span class="spec-item"><strong>BOXS:</strong> ${ppi}</span>
              </div>
            </td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${amount}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-box">
        <p>Subtotal: ₹${amount}</p>
        <p>GST (0%): ₹0</p>
        <p class="grand-total">Total Paid: ₹${amount}</p>
      </div>

      <div class="developer-details">
        <p>This invoice has been generated automatically by computer.</p>
        <p><strong>Developed & Maintained by:</strong> WEAVING DESIGNS Technical Team. Website: <a href="https://weavingdesigns.in" target="_blank">weavingdesigns.in</a></p>
        <p>Customer Support: gudurupavan0297@gmail.com</p>
        <p style="font-size: 9px; color: #94a3b8; margin-top: 12px;">Security Verification: dynamic computer order logs registered. Powered by Advanced Automated Systems.</p>
      </div>

      <script>
        // Auto open print dialog
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 300);
        });
      </script>
    </body>
    </html>
  `;

  invoiceWindow.document.write(htmlContent);
  invoiceWindow.document.close();
};
