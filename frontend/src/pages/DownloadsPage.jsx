import React, { useState } from 'react';
import { supabase, isDummyClient } from '../supabase';
import axios from 'axios';
import { Download, AlertCircle, FileArchive, Search } from 'lucide-react';

export default function DownloadsPage() {
  const [email, setEmail] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [purchasedDesigns, setPurchasedDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);
    setSearchedEmail(email);

    if (isDummyClient) {
      // Mock purchases fallback
      setPurchasedDesigns([
        {
          id: '1',
          title: 'Traditional Gold Zari Butti Motif',
          category: 'Motif',
          preview_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
          price: 299,
          orderDate: new Date(Date.now() - 3600000).toLocaleDateString(),
          paymentId: 'pay_mock_39fk29fk29'
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      // Query successful orders for this email
      const { data, error: dbError } = await supabase
        .from('orders')
        .select(`
          id,
          payment_id,
          amount,
          created_at,
          designs (
            id,
            title,
            preview_image_url,
            category_id,
            categories (name)
          )
        `)
        .eq('customer_email', email)
        .eq('payment_status', 'success')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      if (data) {
        const formatted = data.map((order) => {
          const design = order.designs;
          return {
            id: design.id,
            title: design.title,
            category: design.categories?.name || 'Border',
            preview_image_url: design.preview_image_url,
            price: order.amount,
            orderDate: new Date(order.created_at).toLocaleDateString(),
            paymentId: order.payment_id
          };
        });
        setPurchasedDesigns(formatted);
      }
    } catch (err) {
      console.error('Failed to load purchases from DB:', err);
      setError('Failed to retrieve order logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (designId) => {
    setDownloadingId(designId);
    setError('');

    try {
      // Call backend secure signed URL generator, passing both designId and searchedEmail
      const res = await axios.post(
        '/api/downloads/generate-url',
        { designId, email: searchedEmail }
      );

      const { signedUrl } = res.data;

      // Open link in browser to initiate file download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.setAttribute('download', `WEAVING_DESIGNS_design_${designId}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.error || 'Failed to generate signed download link.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
        <Download className="text-brand-500" />
        <span>My Purchased Designs</span>
      </h1>

      {/* Email Search Box */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl mb-8 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-3 flex items-center gap-1.5">
          <Search size={16} className="text-brand-500" />
          <span>Enter the email address you used during checkout to access your files:</span>
        </h3>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="billing-email@example.com"
            className="flex-grow px-4 py-2.5 bg-slate-100/50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold text-slate-800 dark:text-slate-250"
            required
          />
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>Access Downloads</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/20 text-sm mb-6 font-medium">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-dark-900 h-24 rounded-2xl border border-slate-200/50 dark:border-slate-800/40"></div>
          ))}
        </div>
      ) : hasSearched ? (
        purchasedDesigns.length > 0 ? (
          <div className="space-y-4">
            {purchasedDesigns.map((design) => (
              <div
                key={design.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Media & Meta Group */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-950 flex-shrink-0">
                    <img
                      src={design.preview_image_url}
                      alt={design.title}
                      className="w-full h-full object-cover no-select"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-snug">
                      {design.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                      <span className="bg-slate-100 dark:bg-dark-850 px-2 py-0.5 rounded font-medium text-slate-500">
                        {design.category}
                      </span>
                      <span>Purchased: {design.orderDate}</span>
                      <span className="font-mono">ID: {design.paymentId?.substring(0, 12)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 dark:border-slate-800/50 pt-4 sm:pt-0 sm:border-t-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Paid</span>
                    <span className="font-display font-extrabold text-slate-800 dark:text-slate-200 text-sm">₹{design.price}</span>
                  </div>

                  <button
                    onClick={() => handleDownload(design.id)}
                    disabled={downloadingId === design.id}
                    className="flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-brand-600/10 transition-all cursor-pointer"
                  >
                    {downloadingId === design.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download ZIP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-dark-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
            <FileArchive size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No successful order history found for "{searchedEmail}".</p>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white dark:bg-dark-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
          <Search size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your checkout email address above to retrieve your purchases.</p>
        </div>
      )}
    </div>
  );
}
