import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, isDummyClient } from '../supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, CreditCard, ChevronLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { updateSEO } from '../utils/seo';

const MOCK_DESIGNS = [
  { id: '1', title: 'Traditional Gold Zari Butti Motif', description: 'A gorgeous, detailed gold thread bhutti embroidery motif. Production ready for blouses, sarees, and sleeves. Tested on modern high-speed machines.', price: 299, preview_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', category: 'Motif', stitches: 14200, colors: 3, height: '80mm', width: '80mm', formats: 'DST, PES, EXP, HUS, JEF' },
  { id: '2', title: 'Royal Elephant Mandala Blouse Back', description: 'Intricate ethnic elephant mandala design specifically tailored for bridal blouse back panels. High stitch density, extremely premium styling.', price: 499, preview_image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80', category: 'Blouse', stitches: 34500, colors: 5, height: '220mm', width: '240mm', formats: 'DST, PES, EXP, XXX' },
  { id: '3', title: 'Peacock Border Lace Pattern', description: 'Seamless running border lace with majestic peacock motifs. Ideal for saree borders, dupatta hems, and sherwani cuffs. Easily resizable.', price: 199, preview_image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80', category: 'Border', stitches: 9800, colors: 2, height: '45mm', width: '150mm', formats: 'DST, PES, HUS' },
  { id: '4', title: 'Abstract Geometry Sleeve Pattern', description: 'Modern abstract geometric sleeve embroidery panel. Fits multiple frame sizes, neat color changes, low thread-break rate.', price: 249, preview_image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80', category: 'Sleeve', stitches: 18400, colors: 4, height: '110mm', width: '130mm', formats: 'DST, PES, JEF' },
  { id: '5', title: 'Classic Floral Pallu Border', description: 'Detailed heavy floral vines pattern for saree pallus. Contains multi-layered shaded fills and delicate running borders.', price: 349, preview_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', category: 'Pallu', stitches: 26100, colors: 6, height: '180mm', width: '220mm', formats: 'DST, PES, EXP, HUS, JEF, XXX' },
  { id: '6', title: 'Delicate Rose Vines neckline', description: 'Elegant neck design featuring delicate rose vines and leaves. Beautiful placement for kurtis, suits, and dresses.', price: 279, preview_image_url: 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&w=800&q=80', category: 'Neckline', stitches: 15300, colors: 3, height: '140mm', width: '120mm', formats: 'DST, PES, HUS, JEF' }
];

export default function DesignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  // Disable context menu and save key combinations
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Block Ctrl+S (Save), Ctrl+U (Source), Ctrl+P (Print)
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && (e.key === 'p' || e.key === 'P'))
      ) {
        e.preventDefault();
        alert('Visual resources are protected. Saving webpage files is disabled.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchDesign = async () => {
      setLoading(true);
      if (isDummyClient) {
        const d = MOCK_DESIGNS.find((item) => item.id === id);
        setDesign(d || null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('designs')
          .select(`
            *,
            categories (name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setDesign({
            ...data,
            category: data.categories?.name || 'Border',
            // Assign mock detailed fields if absent in DB
            stitches: data.stitches || 18000,
            colors: data.colors || 3,
            height: data.height || '120mm',
            width: data.width || '120mm',
            formats: data.formats || 'DST, PES, EXP, XXX'
          });
        }
      } catch (err) {
        console.error('Failed to load design, trying mock fallback:', err);
        const d = MOCK_DESIGNS.find((item) => item.id === id);
        setDesign(d || null);
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [id]);

  useEffect(() => {
    if (design) {
      // Build dynamic product schema for Google search engine rich results
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": design.title,
        "image": design.preview_image_url || design.image_url,
        "description": design.description || `Premium ${design.category} embroidery design with ${design.stitches} stitches.`,
        "offers": {
          "@type": "Offer",
          "price": design.price,
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "url": window.location.href
        },
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Stitches",
            "value": design.stitches
          },
          {
            "@type": "PropertyValue",
            "name": "Colors",
            "value": design.colors
          },
          {
            "@type": "PropertyValue",
            "name": "Dimensions",
            "value": `${design.width} x ${design.height}`
          },
          {
            "@type": "PropertyValue",
            "name": "Formats",
            "value": design.formats
          }
        ]
      };

      updateSEO({
        title: design.title,
        description: `${design.description || 'Download design.'} Premium ${design.category} embroidery design specifications: ${design.stitches} stitches, ${design.colors} colors, size ${design.width}x${design.height}.`,
        image: design.preview_image_url || design.image_url,
        url: window.location.href,
        type: 'product',
        schema: productSchema
      });
    }
  }, [design]);

  const handleBuyNow = () => {
    if (!design) return;
    // Redirect straight to Checkout, passing the single design in location state
    navigate('/checkout', { state: { directBuyItem: design } });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100">Design Not Found</h2>
        <p className="text-slate-500 mt-2">The design template path does not exist or has been removed.</p>
        <Link to="/" className="text-brand-500 font-semibold hover:underline mt-4 inline-block">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold mb-6">
        <ChevronLeft size={16} />
        <span>Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Preview Container with Watermarks */}
        <div className="relative overflow-hidden rounded-3xl glass border border-slate-200/50 dark:border-slate-800/40 p-4 flex items-center justify-center aspect-square select-none max-h-[550px]">
          
          {/* Diagonal Line Watermark pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.04)_50%,rgba(0,0,0,0.04)_75%,transparent_75%,transparent)] bg-[size:50px_50px] pointer-events-none z-10 opacity-60"></div>
          
          {/* Repeated Text Watermark overlays */}
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-12 pointer-events-none z-10 select-none overflow-hidden opacity-10 rotate-12">
            {[...Array(24)].map((_, i) => (
              <span key={i} className="font-display font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100">
                WEAVING DESIGNS Protected
              </span>
            ))}
          </div>

          {/* Actual protected Image */}
          <img
            src={design.preview_image_url || design.image_url}
            alt={design.title}
            className="w-full h-full object-contain rounded-2xl no-select"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        </div>

        {/* Right: Meta Details & Buy Actions */}
        <div className="space-y-8">
          <div>
            <span className="inline-flex px-3 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
              {design.category}
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-800 dark:text-slate-100">
              {design.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {design.description}
            </p>
          </div>



          {/* Purchase details */}
          <div className="flex items-baseline space-x-3">
            <span className="text-slate-500 text-sm">Design Price:</span>
            <span className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">
              ₹{design.price}
            </span>
            <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
              One-Time Purchase
            </span>
          </div>

          {/* Buy Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isInCart(design.id) ? (
              <Link
                to="/cart"
                className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/10 transition-all text-sm"
              >
                <CheckCircle2 size={18} />
                <span>View in Cart</span>
              </Link>
            ) : (
              <button
                onClick={() => addToCart(design)}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-dark-950 font-semibold py-3.5 px-6 rounded-xl shadow-md transition-all text-sm"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
            )}

            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-600/20 transition-all text-sm"
            >
              <CreditCard size={18} />
              <span>Buy Now (Express)</span>
            </button>
          </div>

          {/* Guarantee Security tags */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3">
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-brand-500 flex-shrink-0" />
              <span><strong>Instant Delivery:</strong> Original BMP/instructions ZIP files made accessible immediately after payment.</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <FileText size={16} className="text-brand-500 flex-shrink-0" />
              <span><strong>Secure payment protection:</strong> Handled securely via UPI payments with transaction verification.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
