import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, isDummyClient } from '../supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, CreditCard, ChevronLeft, ChevronRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { updateSEO } from '../utils/seo';
import { getOptimizedImageUrl } from '../utils/image';

const MOCK_DESIGNS = [
  {
    id: "fa37b61c-ee2d-4158-8e4a-16732b2e0893",
    title: "480 HOOKS , 92 REED , STEEL REED ",
    description: "WELCOME TO WEAVING DESIGNS\nROYAL PEACOCK DESIGN\n480 HOOKS 1120 WEAVING THREADS ( 760 MEENA , 360 JARI )\nWORK IN BOTH HANDLOOM WEAVING AND POWERLOOM JACQUARD",
    price: 180,
    preview_image_url: "https://hhpxxburlqkpgyrmqtmk.supabase.co/storage/v1/object/public/previews/fa37b61c-ee2d-4158-8e4a-16732b2e0893.jpg",
    secondary_image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    category: "BUTTIS",
    is_featured: false,
    created_at: "2026-07-06T15:41:30.206147+00:00",
    hooks: "480 hooks",
    cards: "1120 cards",
    box: "2 boxes",
    reed: "92 steel reed",
    formats: "DST, PES, EXP, XXX"
  },
  {
    id: "75e19932-cfdd-4bf7-99ee-ec0a83a38365",
    title: "480 HOOKS , 100 STEEL REED , BUTTIS DESIGN",
    description: "WELCOME TO WEAVING DESIGNS \nBEAUTIFUL MANGO SHAPE BUTTIS AND SMALL PEACOCK BUTTIS\n480 HOOKS , 100 STEEL REED , 688 WEAVING THREADS ( 464 MEENA + 224 JARI )\nWORKS IN BOTH HANDLOOM WEAVING AND POWERLOOM JACQUARD",
    price: 100,
    preview_image_url: "https://hhpxxburlqkpgyrmqtmk.supabase.co/storage/v1/object/public/previews/75e19932-cfdd-4bf7-99ee-ec0a83a38365.jpg",
    category: "BUTTIS",
    is_featured: false,
    created_at: "2026-07-06T15:29:57.401929+00:00",
    hooks: "480 hooks",
    cards: "688 cards",
    box: "1 box",
    reed: "100 steel reed",
    formats: "DST, PES, EXP, XXX"
  },
  {
    id: "79311a0b-fae0-456f-ab77-20927d842ad7",
    title: "480 HOOKS , 100 REED, 552 CARDS ( 276 MEENA + 276 JARI )",
    description: "WELCOME TO WEAVING DESIGNS \nVINTAGE BEAUTIFUL PEACOCK AND CHAKRAM BUTTA DESIGN\n480 HOOKS , 100 REED , 70 + 70 JARI CARDS DESIGN \nSMOOTH CLOTH , MEENA ANI WEAVING \nWORKS IN BOTH     HANDLOOM AND POWERLOOM ELECTRONIC JACQUARD\n ",
    price: 70,
    preview_image_url: "https://hhpxxburlqkpgyrmqtmk.supabase.co/storage/v1/object/public/previews/79311a0b-fae0-456f-ab77-20927d842ad7.jpg",
    category: "BUTTIS",
    is_featured: false,
    created_at: "2026-07-06T15:19:00.499275+00:00",
    hooks: "480 hooks",
    cards: "552 cards",
    box: "2 boxes",
    reed: "100 reed",
    formats: "DST, PES, EXP, XXX"
  },
  {
    id: "80590932-eedd-432d-9f37-55fb4e230a00",
    title: "240 HOOKS , 360 CARDS , 84 REED BORDER ",
    description: "WELCOME TO WEAVING DESIGNS \n240 HOOKS , 360 CARDS , 84 STEEL REED \nSMALL BEAUTIFUL PEACOCK BORDER WITH SMALL FLOWER\nWORK IN HANDLOOM AND ELECTRONIC JACQUARD",
    price: 140,
    preview_image_url: "https://hhpxxburlqkpgyrmqtmk.supabase.co/storage/v1/object/public/previews/80590932-eedd-432d-9f37-55fb4e230a00.jpg",
    category: "border",
    is_featured: false,
    created_at: "2026-07-06T15:06:59.096173+00:00",
    hooks: "240 hooks",
    cards: "360 cards",
    box: "1 box",
    reed: "84 steel reed",
    formats: "DST, PES, EXP, XXX"
  },
  {
    id: "4cca6f42-dda9-496f-9276-f80e5a7feceb",
    title: "240 HOOKS BORDER, 400 CARDS , 84 REED . PEACOCK BORDER",
    description: "WELCOME TO WEAVING DESIGNS\nVINTAGE PEACOCK BORDER\nBEAUTIFUL PEACOCK BORDER , THIS DESIGN SET AS IN ROUND SHAPE OF REVERSE HOOKS AND HALF ROUND SHAPE AND EXPAND THE BORDER WITH BANARAS\n240 HOOKS , 400 CARDS , 84 STEEL REED \nWORK IN HANDLOOM AND ELETRONIC JACQUARD",
    price: 200,
    preview_image_url: "https://hhpxxburlqkpgyrmqtmk.supabase.co/storage/v1/object/public/previews/4cca6f42-dda9-496f-9276-f80e5a7feceb.jpg",
    category: "border",
    is_featured: false,
    created_at: "2026-07-06T14:48:57.472563+00:00",
    hooks: "240 hooks",
    cards: "400 cards",
    box: "1 box",
    reed: "84 steel reed",
    formats: "DST, PES, EXP, XXX"
  },
  {
    id: "201228af-76c4-46f8-bb1c-c1cc54c8fa13",
    title: "240 HOOKS , 84 REED  VINTAGE BORDER",
    description: "WELCOME TO WEAVING DESIGNS\nVINTAGE BORDER \n240 HOOKS , 398 CARDS \n84 STEEL REED\nSUPPORT ON HANDLOOM AND ELECTRONIC JACQUARD\nBORDER CAN CHANGE AS U LOOK BEAUTIFUL DESIGN LIKE MAIN BORDER DOWN SIDE OR UP SIDE AND EXPAND BANARAS AS U LIKE ",
    price: 200,
    preview_image_url: "https://hhpxxburlqkpgyrmqtmk.supabase.co/storage/v1/object/public/previews/201228af-76c4-46f8-bb1c-c1cc54c8fa13.jpg",
    category: "border",
    is_featured: false,
    created_at: "2026-07-06T04:10:45.085149+00:00",
    hooks: "240 hooks",
    cards: "398 cards",
    box: "1 box",
    reed: "84 steel reed",
    formats: "DST, PES, EXP, XXX"
  }
];

export default function DesignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const images = design
    ? [design.preview_image_url || design.image_url, design.secondary_image_url].filter(Boolean)
    : [];

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || images.length <= 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      setActiveSlide((prev) => (prev + 1) % images.length);
    } else if (isRightSwipe) {
      setActiveSlide((prev) => (prev - 1 + images.length) % images.length);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

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
            hooks: data.hooks || '',
            cards: data.cards || '',
            box: data.box || '',
            reed: data.reed || '',
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
        "description": design.description || `Premium Weaving Design with hooks: ${design.hooks}, cards: ${design.cards}, reed: ${design.reed}.`,
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
            "name": "Hooks",
            "value": design.hooks || 'N/A'
          },
          {
            "@type": "PropertyValue",
            "name": "Cards",
            "value": design.cards || 'N/A'
          },
          {
            "@type": "PropertyValue",
            "name": "Boxs",
            "value": design.box || 'N/A'
          },
          {
            "@type": "PropertyValue",
            "name": "Reed",
            "value": design.reed || 'N/A'
          },
          {
            "@type": "PropertyValue",
            "name": "Formats",
            "value": design.formats || 'DST, PES, EXP, XXX'
          }
        ]
      };

      updateSEO({
        title: design.title,
        description: `${design.description || 'Download design.'} Premium Weaving Design parameters: hooks: ${design.hooks || 'N/A'}, cards: ${design.cards || 'N/A'}, box: ${design.box || 'N/A'}, reed: ${design.reed || 'N/A'}.`,
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
    updateSEO({
      title: 'Design Not Found',
      description: 'The design template path does not exist or has been removed.',
      noindex: true
    });
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100">Design Not Found</h2>
        <p className="text-slate-500 mt-2">The design template path does not exist or has been removed.</p>
        <Link to="/" className="text-brand-500 font-semibold hover:underline mt-4 inline-block">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Back Button */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
        className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold mb-6 cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span>Back to Marketplace</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Preview Container with Watermarks & Slide Scroll Carousel */}
        <div className="space-y-4">
          <div
            className="relative overflow-hidden rounded-3xl glass border border-slate-200/50 dark:border-slate-800/40 p-4 flex items-center justify-center aspect-square select-none max-h-[550px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            
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

            {/* Slide Count Pill */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 z-20 bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-sm flex items-center gap-1">
                <span>{activeSlide + 1}</span>
                <span className="text-slate-400">/</span>
                <span>{images.length}</span>
              </div>
            )}

            {/* Prev / Next Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-slate-900/60 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-slate-900/60 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Protected Image Slides */}
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
              {images.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={getOptimizedImageUrl(imgUrl, 800, 80)}
                  alt={`Premium ${design.category} Weaving Pattern - ${design.title} - Slide ${idx + 1}`}
                  className={`w-full h-full object-contain rounded-2xl no-select transition-all duration-500 ease-in-out absolute inset-0 ${
                    idx === activeSlide
                      ? 'opacity-100 scale-100 z-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -z-10 pointer-events-none'
                  }`}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              ))}
            </div>
          </div>

          {/* Slide Thumbnails & Dot Indicators */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-3 pt-1">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    activeSlide === idx
                      ? 'border-brand-500 ring-2 ring-brand-500/30 scale-105'
                      : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(imgUrl, 120, 70)}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-14 h-14 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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
            <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {design.description}
            </p>
          </div>

          {/* Technical Specifications Section */}
          <div className="border-t border-b border-slate-200/50 dark:border-slate-800/60 py-6 my-6">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
              Design Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-100/50 dark:bg-dark-900/60 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-650 dark:text-slate-400 block uppercase font-semibold">Hooks</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{design.hooks || 'N/A'}</span>
              </div>
              <div className="bg-slate-100/50 dark:bg-dark-900/60 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-650 dark:text-slate-400 block uppercase font-semibold">Cards</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{design.cards || 'N/A'}</span>
              </div>
              <div className="bg-slate-100/50 dark:bg-dark-900/60 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-650 dark:text-slate-400 block uppercase font-semibold">Boxs</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{design.box || 'N/A'}</span>
              </div>
              <div className="bg-slate-100/50 dark:bg-dark-900/60 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-650 dark:text-slate-400 block uppercase font-semibold">Reed</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{design.reed || 'N/A'}</span>
              </div>
              <div className="col-span-2 bg-slate-100/50 dark:bg-dark-900/60 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-650 dark:text-slate-400 block uppercase font-semibold">Supported Formats</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{design.formats || 'DST, PES, EXP, XXX'}</span>
              </div>
            </div>
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
