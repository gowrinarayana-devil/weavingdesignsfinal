import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase, isDummyClient } from '../supabase';
import { Search, SlidersHorizontal, ArrowUpDown, Tag, Heart, Eye, ShoppingCart, CheckCircle2, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { updateSEO } from '../utils/seo';
import { slugify } from '../utils/slugify';
import { getOptimizedImageUrl } from '../utils/image';

// High-fidelity seed designs to bootstrap the catalog instantly on load
const MOCK_DESIGNS = [
  {
    id: "fa37b61c-ee2d-4158-8e4a-16732b2e0893",
    title: "480 HOOKS , 92 REED , STEEL REED ",
    description: "WELCOME TO WEAVING DESIGNS\nROYAL PEACOCK DESIGN\n480 HOOKS 1120 WEAVING THREADS ( 760 MEENA , 360 JARI )\nWORK IN BOTH HANDLOOM WEAVING AND POWERLOOM JACQUARD",
    price: 180,
    preview_image_url: "https://hhpxxburlqkpgyrmqtmk.supabase.co/storage/v1/object/public/previews/fa37b61c-ee2d-4158-8e4a-16732b2e0893.jpg",
    category: "BUTTIS",
    is_featured: false,
    created_at: "2026-07-06T15:41:30.206147+00:00",
    hooks: "480 hooks",
    cards: "1120 cards",
    box: "2 boxes",
    reed: "92 steel reed"
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
    reed: "100 steel reed"
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
    reed: "100 reed"
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
    reed: "84 steel reed"
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
    reed: "84 steel reed"
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
    reed: "84 steel reed"
  }
];

const MOCK_CATEGORIES = ['All', 'Border', 'Blouse', 'Motif', 'Sleeve', 'Pallu', 'Neckline'];

// Helper to sort categories by custom order: All, blouse, broket, pallu, border
const getSortedCategories = (cats) => {
  const order = ['all', 'blouse', 'broket', 'pallu', 'border'];
  return [...cats].sort((a, b) => {
    const indexA = order.indexOf(a.toLowerCase());
    const indexB = order.indexOf(b.toLowerCase());
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

export default function Marketplace() {
  const { addToCart, isInCart } = useCart();
  const [designs, setDesigns] = useState(() => {
    try {
      const cached = localStorage.getItem('weaving_designs_cache');
      return cached ? JSON.parse(cached) : MOCK_DESIGNS;
    } catch (e) {
      return MOCK_DESIGNS;
    }
  });
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('weaving_categories_cache');
      return cached ? JSON.parse(cached) : getSortedCategories(MOCK_CATEGORIES);
    } catch (e) {
      return getSortedCategories(MOCK_CATEGORIES);
    }
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';
  
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest'); // price-asc, price-desc, popularity, newest
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pagination states
  const currentPage = (() => {
    const savedPage = searchParams.get('page');
    return savedPage ? parseInt(savedPage, 10) : 1;
  })();
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const setSelectedCategory = (cat) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('category', cat);
      params.set('page', '1');
      return params;
    });
  };

  const setCurrentPage = (page) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('page', page.toString());
      return params;
    });
  };

  // Scroll to top smoothly when category or page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory, currentPage]);

  // Fetch designs and categories from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Only set loading to true if we don't have cached data to show
      if (designs.length === 0) {
        setLoading(true);
      }
      if (isDummyClient) {
        setDesigns(MOCK_DESIGNS);
        setLoading(false);
        return;
      }

      try {
        // Fetch categories and designs in parallel to avoid sequential waterfalls
        const [categoriesResponse, designsResponse] = await Promise.all([
          supabase.from('categories').select('name'),
          supabase.from('designs').select(`
            *,
            categories (name)
          `)
        ]);

        const dbCategories = categoriesResponse.data;
        if (dbCategories && dbCategories.length > 0) {
          const rawCats = ['All', ...dbCategories.map(c => c.name)];
          const sortedCats = getSortedCategories(rawCats);
          setCategories(sortedCats);
          localStorage.setItem('weaving_categories_cache', JSON.stringify(sortedCats));
        }

        const dbDesigns = designsResponse.data;
        const error = designsResponse.error;
        if (error) throw error;

        if (dbDesigns && dbDesigns.length > 0) {
          const formatted = dbDesigns.map(d => ({
            ...d,
            category: d.categories?.name || 'Border'
          }));
          setDesigns(formatted);
          localStorage.setItem('weaving_designs_cache', JSON.stringify(formatted));
        } else {
          // Fallback if DB is empty to show beautiful mock catalog
          setDesigns(MOCK_DESIGNS);
        }
      } catch (err) {
        console.error('Failed to load designs from Supabase. Falling back to mock:', err);
        // Only override if we don't even have cached data
        if (designs.length === 0) {
          setDesigns(MOCK_DESIGNS);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dynamically preload the LCP image (first design card) as soon as data arrives
  useEffect(() => {
    if (designs && designs.length > 0) {
      const firstDesign = designs[0];
      const imageUrl = getOptimizedImageUrl(firstDesign.preview_image_url || firstDesign.image_url, 400, 75);
      if (imageUrl) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageUrl;
        link.setAttribute('fetchpriority', 'high');
        document.head.appendChild(link);
      }
    }
  }, [designs]);

  useEffect(() => {
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "WEAVING DESIGNS",
      "url": "https://www.weavingdesigns.in",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.weavingdesigns.in/?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "WEAVING DESIGNS",
      "url": "https://www.weavingdesigns.in",
      "logo": "https://www.weavingdesigns.in/logo.jpg"
    };

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "numberOfItems": designs.length,
      "itemListElement": designs.slice(0, 12).map((d, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${window.location.origin}/design/${d.id}/${slugify(d.title)}`,
        "name": d.title,
        "image": d.preview_image_url || d.image_url,
        "description": d.description
      }))
    };

    updateSEO({
      title: 'WEAVING DESIGNS - Premium Weaving & Embroidery Designs Marketplace',
      description: 'Explore and download premium Jacquard weaving designs, border styles, motifs, and custom embroidery layouts with full color charts and machine config specs.',
      image: designs[0]?.preview_image_url || designs[0]?.image_url || `${window.location.origin}/logo.jpg`,
      url: window.location.href,
      type: 'website',
      schema: [websiteSchema, organizationSchema, itemListSchema]
    });
  }, [designs]);

  // Dynamically update document title on search query changes
  useEffect(() => {
    if (search.trim()) {
      document.title = `Search: "${search}" | WEAVING DESIGNS`;
    } else {
      document.title = 'WEAVING DESIGNS - Premium Weaving & Embroidery Designs Marketplace';
    }
  }, [search]);

  // Filter and Sort designs
  const filteredDesigns = designs
    .filter(design => {
      const matchesSearch = design.title.toLowerCase().includes(search.toLowerCase()) || 
                            design.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || design.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'popularity') return (b.downloads || 0) - (a.downloads || 0);
      return new Date(b.created_at) - new Date(a.created_at); // newest
    });

  const totalPages = Math.ceil(filteredDesigns.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  
  const displayedDesigns = filteredDesigns.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, activePage - 1);
    const end = Math.min(totalPages, activePage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Featured Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 dark:from-dark-900 dark:via-brand-950 dark:to-dark-950 p-8 sm:p-12 text-white shadow-xl border border-slate-800/40">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-brand-500/30">
            <Tag size={12} />
            <span>Premium Files</span>
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
            Craft Masterpieces with Premium Weaving Designs
          </h1>
          <p className="text-slate-300 mt-4 text-base sm:text-lg">
            Download production-ready patterns compatible with all major computer-controlled weaving machines. Fully watermarked previews, instant UPI payments, and lifetime downloads.
          </p>
        </div>
        {/* Background Decorative Art / Glowing Orb */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-30 hidden md:block">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-400 via-brand-500/40 to-transparent rounded-full transform scale-125 translate-x-1/4"></div>
        </div>
      </div>

      {/* Catalog Search & Controls Panel */}
      <div className="flex flex-col gap-6">
        
        {/* Unified Search, Sort & Category Panel */}
        <div className="glass p-4 sm:p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={18} className="text-brand-500" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search premium designs (hooks, reed, border)..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 dark:bg-dark-950/80 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm shadow-inner text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Sorting Select */}
            <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">Sort By:</span>
              <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Sort designs list by"
                  className="w-full bg-slate-100/80 dark:bg-dark-950/80 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none pr-10 font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="newest" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">Newest Additions</option>
                  <option value="price-asc" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">Price: Low to High</option>
                  <option value="price-desc" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">Price: High to Low</option>
                  <option value="popularity" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">Popularity (Downloads)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <ArrowUpDown size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap pt-1.5 shrink-0">
              <SlidersHorizontal size={14} className="text-brand-500" />
              <span>Categories</span>
            </div>
            <div className="flex flex-wrap gap-2 w-full">
              {categories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                    }}
                    className={`shrink-0 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl text-xs font-semibold transition-all transform hover:scale-[1.03] active:scale-95 duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500 to-teal-600 text-white shadow-md shadow-brand-500/25 border border-brand-500'
                        : 'bg-slate-100/90 dark:bg-dark-900 text-slate-700 dark:text-slate-300 border border-slate-200/20 dark:border-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {cat === 'All' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid Designs List */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-5 py-8">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-dark-900 border border-slate-100 dark:border-slate-800/40 rounded-3xl overflow-hidden flex flex-col h-full">
                <div className="aspect-square bg-slate-100/80 dark:bg-dark-950/80"></div>
                <div className="p-3 space-y-2.5 flex-grow flex flex-col">
                  <div className="h-4 bg-slate-200/60 dark:bg-dark-800/60 rounded-md w-3/4"></div>
                  <div className="h-3 bg-slate-200/40 dark:bg-dark-800/40 rounded-md w-full"></div>
                  <div className="h-3 bg-slate-200/40 dark:bg-dark-800/40 rounded-md w-5/6 flex-grow"></div>
                  <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-3 flex items-center justify-between gap-2">
                    <div className="h-4 bg-slate-200/60 dark:bg-dark-800/60 rounded-md w-1/3"></div>
                    <div className="h-7 bg-slate-200/60 dark:bg-dark-800/60 rounded-xl w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedDesigns.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {displayedDesigns.map((design, index) => {
                const hooksVal = design.hooks ? design.hooks.replace(/hooks/i, '').trim() : '560';
                const cardsVal = design.cards ? design.cards.replace(/cards/i, '').trim() : '700';
                const reedVal = design.reed ? design.reed.replace(/reed|steel/ig, '').trim() : '100';
                const ppiVal = design.box ? design.box.replace(/box|boxes/ig, '').trim() : '72';

                return (
                  <div 
                    key={design.id} 
                    className="group relative bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-brand-500/5 hover:border-brand-500/20 dark:hover:border-brand-500/20 transition-all duration-300 flex flex-col h-full"
                  >
                    
                    {/* Design Image Preview */}
                    <Link 
                      to={`/design/${design.id}/${slugify(design.title)}`}
                      className="relative block overflow-hidden aspect-square bg-slate-100 dark:bg-dark-950 cursor-pointer"
                    >
                      {/* Visual protection watermark banner */}
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[size:30px_30px] pointer-events-none z-10 opacity-60"></div>
                      
                      {/* Image overlay gradient for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>

                      <img
                        src={getOptimizedImageUrl(design.preview_image_url || design.image_url, 400, 75)}
                        alt={`Weaving Design Preview - ${design.title} - ${design.category}`}
                        loading={index < 4 ? "eager" : "lazy"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 no-select"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                      />
                      
                      {/* Category Label Overlay */}
                      <span className="absolute bottom-2.5 left-2.5 bg-slate-900/60 backdrop-blur-[4px] text-slate-200 px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wide border border-white/5 z-20">
                        {design.category}
                      </span>
                    </Link>

                    {/* Card Metadata */}
                    <div className="p-3 flex flex-col flex-grow">
                      <h2 className="font-display font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-800 line-clamp-1 transition-colors text-sm cursor-pointer">
                        <Link to={`/design/${design.id}/${slugify(design.title)}`}>
                          {design.title}
                        </Link>
                      </h2>
                      
                      {/* WEAVING DESIGNS Certified Badge */}
                      <span className="inline-block bg-red-800/10 text-red-850 dark:bg-red-950/20 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 self-start border border-red-800/20">
                        ✓ WEAVING DESIGNS Certified
                      </span>

                      {/* Price Section */}
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="font-display font-bold text-teal-600 dark:text-teal-400 text-base leading-none">
                          ₹{design.price}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 line-through text-[11px] font-medium">
                          ₹{Math.round(design.price * 1.33)}
                        </span>
                      </div>
                      
                      {/* Spec badges */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-250/20 dark:bg-emerald-955/20 dark:text-emerald-450 dark:border-emerald-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Hooks: {hooksVal}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-250/20 dark:bg-blue-955/20 dark:text-blue-450 dark:border-blue-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Cards: {cardsVal}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-250/20 dark:bg-purple-955/20 dark:text-purple-450 dark:border-purple-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          Reed: {reedVal}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-750 border border-amber-250/20 dark:bg-amber-955/20 dark:text-amber-450 dark:border-amber-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Boxs: {ppiVal}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-1.5 mt-3.5 border-t border-slate-105 dark:border-slate-800/40 pt-2.5 flex-grow justify-end">
                        <Link
                          to={`/design/${design.id}/${slugify(design.title)}`}
                          className="flex items-center justify-center gap-1 bg-red-800 hover:bg-red-900 text-white py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all text-center"
                        >
                          <Eye size={12} />
                          <span>View Details</span>
                        </Link>
                        
                        {isInCart(design.id) ? (
                          <Link
                            to="/cart"
                            className="flex items-center justify-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 hover:bg-emerald-500/25 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all text-center"
                          >
                            <CheckCircle2 size={12} />
                            <span>Added</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => addToCart(design)}
                            className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-dark-850 dark:hover:bg-dark-800 dark:text-slate-205 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <ShoppingCart size={12} />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Showing Count and Per Page Dropdown & Pagination block */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-slate-600 dark:text-slate-350">
                <div>
                  Showing <strong className="font-bold text-slate-850 dark:text-white">{(activePage - 1) * itemsPerPage + 1}</strong> to <strong className="font-bold text-slate-850 dark:text-white">{Math.min(activePage * itemsPerPage, filteredDesigns.length)}</strong> of <strong className="font-bold text-slate-850 dark:text-white">{filteredDesigns.length}</strong> designs
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold whitespace-nowrap">Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value, 10));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value={12} className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">12</option>
                    <option value={24} className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">24</option>
                    <option value={50} className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">50</option>
                    <option value={100} className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">100</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(activePage - 1)}
                    disabled={activePage === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      activePage === 1
                        ? 'bg-slate-50 dark:bg-dark-950/20 text-slate-400 dark:text-slate-650 border-transparent cursor-not-allowed'
                        : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    &lt; Previous
                  </button>
                  
                  {getPageNumbers().map((page) => {
                    const isActive = activePage === page;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-red-800 text-white shadow-sm border border-red-800'
                            : 'bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(activePage + 1)}
                    disabled={activePage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      activePage === totalPages
                        ? 'bg-slate-50 dark:bg-dark-950/20 text-slate-400 dark:text-slate-650 border-transparent cursor-not-allowed'
                        : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-dark-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
            <p className="text-slate-600 dark:text-slate-300 font-medium">No weaving designs found matching the current filters.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); setCurrentPage(1); }}
              className="text-brand-500 font-bold hover:underline mt-2 text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
