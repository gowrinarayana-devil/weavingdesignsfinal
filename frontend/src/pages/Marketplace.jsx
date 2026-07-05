import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isDummyClient } from '../supabase';
import { Search, SlidersHorizontal, ArrowUpDown, Tag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { updateSEO } from '../utils/seo';

// High-fidelity mock designs for sandbox mode / empty state fallbacks
const MOCK_DESIGNS = [
  { id: '1', title: 'Traditional Gold Zari Butti Motif', description: 'A gorgeous, detailed gold thread bhutti embroidery motif. Production ready for blouses, sarees, and sleeves. Tested on modern high-speed machines.', price: 299, preview_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', category: 'Motif', is_featured: true, created_at: new Date().toISOString(), downloads: 48 },
  { id: '2', title: 'Royal Elephant Mandala Blouse Back', description: 'Intricate ethnic elephant mandala design specifically tailored for bridal blouse back panels. High stitch density, extremely premium styling.', price: 499, preview_image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80', category: 'Blouse', is_featured: true, created_at: new Date(Date.now() - 86400000).toISOString(), downloads: 72 },
  { id: '3', title: 'Peacock Border Lace Pattern', description: 'Seamless running border lace with majestic peacock motifs. Ideal for saree borders, dupatta hems, and sherwani cuffs. Easily resizable.', price: 199, preview_image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80', category: 'Border', is_featured: false, created_at: new Date(Date.now() - 172800000).toISOString(), downloads: 34 },
  { id: '4', title: 'Abstract Geometry Sleeve Pattern', description: 'Modern abstract geometric sleeve embroidery panel. Fits multiple frame sizes, neat color changes, low thread-break rate.', price: 249, preview_image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80', category: 'Sleeve', is_featured: false, created_at: new Date(Date.now() - 259200000).toISOString(), downloads: 20 },
  { id: '5', title: 'Classic Floral Pallu Border', description: 'Detailed heavy floral vines pattern for saree pallus. Contains multi-layered shaded fills and delicate running borders.', price: 349, preview_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80', category: 'Pallu', is_featured: true, created_at: new Date(Date.now() - 345600000).toISOString(), downloads: 55 },
  { id: '6', title: 'Delicate Rose Vines neckline', description: 'Elegant neck design featuring delicate rose vines and leaves. Beautiful placement for kurtis, suits, and dresses.', price: 279, preview_image_url: 'https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&w=400&q=80', category: 'Neckline', is_featured: false, created_at: new Date(Date.now() - 432000000).toISOString(), downloads: 18 }
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
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState(() => getSortedCategories(MOCK_CATEGORIES));
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest'); // price-asc, price-desc, popularity, newest
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Maintain exactly 2 rows based on responsive grid columns
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(12); // 6 cols * 2 rows
      } else if (window.innerWidth >= 640) {
        setItemsPerPage(8);  // 4 cols * 2 rows
      } else {
        setItemsPerPage(4);  // 2 cols * 2 rows
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch designs and categories from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (isDummyClient) {
        setDesigns(MOCK_DESIGNS);
        setLoading(false);
        return;
      }

      try {
        // Fetch categories
        const { data: dbCategories } = await supabase.from('categories').select('name');
        if (dbCategories && dbCategories.length > 0) {
          const rawCats = ['All', ...dbCategories.map(c => c.name)];
          setCategories(getSortedCategories(rawCats));
        }

        // Fetch designs with categories
        const { data: dbDesigns, error } = await supabase
          .from('designs')
          .select(`
            *,
            categories (name)
          `);

        if (error) throw error;

        if (dbDesigns && dbDesigns.length > 0) {
          const formatted = dbDesigns.map(d => ({
            ...d,
            category: d.categories?.name || 'Border'
          }));
          setDesigns(formatted);
        } else {
          // Fallback if DB is empty to show beautiful mock catalog
          setDesigns(MOCK_DESIGNS);
        }
      } catch (err) {
        console.error('Failed to load designs from Supabase. Falling back to mock:', err);
        setDesigns(MOCK_DESIGNS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "numberOfItems": designs.length,
      "itemListElement": designs.slice(0, 12).map((d, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${window.location.origin}/design/${d.id}`,
        "name": d.title,
        "image": d.preview_image_url || d.image_url,
        "description": d.description
      }))
    };

    updateSEO({
      title: 'Premium Weaving & Embroidery Designs Marketplace',
      description: 'Explore and download premium Jacquard weaving designs, border styles, motifs, and custom embroidery layouts with full color charts and machine config specs.',
      image: designs[0]?.preview_image_url || designs[0]?.image_url || `${window.location.origin}/logo.jpg`,
      url: window.location.href,
      type: 'website',
      schema: itemListSchema
    });
  }, [designs]);

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
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, activePage - 1);
      let end = Math.min(totalPages - 1, activePage + 1);
      
      if (activePage <= 3) {
        end = 4;
      } else if (activePage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-fade-in">
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
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Sort By:</span>
              <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-100/80 dark:bg-dark-950/80 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none pr-10 font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="newest">Newest Additions</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="popularity">Popularity (Downloads)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <ArrowUpDown size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
              <SlidersHorizontal size={14} className="text-brand-500" />
              <span>Categories</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl text-xs font-semibold transition-all transform hover:scale-[1.03] active:scale-95 duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500 to-teal-600 text-white shadow-md shadow-brand-500/25 border border-brand-500'
                        : 'bg-slate-100/90 dark:bg-dark-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-dark-800 border border-slate-200/20 dark:border-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200'
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 py-12">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100/80 dark:bg-dark-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl h-64 sm:h-72"></div>
            ))}
          </div>
        ) : displayedDesigns.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-5">
              {displayedDesigns.map((design) => (
                <div 
                  key={design.id} 
                  className="group relative bg-white dark:bg-dark-900 border border-slate-100 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-brand-500/5 hover:border-brand-500/20 dark:hover:border-brand-500/20 transition-all duration-300 flex flex-col h-full"
                >
                  
                  {/* Design Image Preview */}
                  <Link to={`/design/${design.id}`} className="relative block overflow-hidden aspect-square bg-slate-100 dark:bg-dark-950">
                    {/* Visual protection watermark banner */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[size:30px_30px] pointer-events-none z-10 opacity-60"></div>
                    
                    {/* Image overlay gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>

                    <img
                      src={design.preview_image_url || design.image_url}
                      alt={design.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 no-select"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    
                    {/* Featured Tag */}
                    {design.is_featured && (
                      <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-md shadow-orange-500/20 z-20">
                        Popular
                      </span>
                    )}

                    {/* Category Label Overlay */}
                    <span className="absolute bottom-2.5 left-2.5 bg-slate-900/60 backdrop-blur-[4px] text-slate-200 px-2 py-0.5 rounded-md text-[9px] font-medium tracking-wide border border-white/5 z-20">
                      {design.category}
                    </span>
                  </Link>

                  {/* Card Metadata */}
                  <div className="p-2.5 sm:p-3.5 flex flex-col flex-grow">
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 line-clamp-1 transition-colors text-xs sm:text-sm">
                      <Link to={`/design/${design.id}`}>{design.title}</Link>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mt-1 line-clamp-2 leading-relaxed flex-grow whitespace-pre-wrap">
                      {design.description}
                    </p>
                    
                    {/* Action Bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-2.5 mt-2.5 gap-1.5">
                      <div>
                        <span className="font-display font-bold text-teal-600 dark:text-teal-400 text-xs sm:text-sm md:text-base leading-none">
                          ₹{design.price}
                        </span>
                      </div>
                      
                      {isInCart(design.id) ? (
                        <Link
                          to="/cart"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-semibold transition-all text-center whitespace-nowrap shadow-sm"
                        >
                          Added
                        </Link>
                      ) : (
                        <button
                          onClick={() => addToCart(design)}
                          className="bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 text-white px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-semibold shadow-md shadow-brand-500/15 hover:shadow-lg hover:shadow-brand-500/20 transform hover:scale-[1.02] transition-all text-center whitespace-nowrap"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-12 py-6 border-t border-slate-100 dark:border-slate-900/60">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={activePage === 1}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activePage === 1
                      ? 'bg-slate-100 dark:bg-dark-900/40 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
                      : 'bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 hover:scale-[1.02] shadow-sm'
                  }`}
                >
                  &larr; First
                </button>

                {getPageNumbers().map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 py-2 text-slate-400 dark:text-slate-600 text-xs sm:text-sm select-none"
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = activePage === page;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-500 to-teal-600 text-white shadow-md shadow-brand-500/25 scale-105 border border-brand-500'
                          : 'bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 hover:scale-[1.02] shadow-sm'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={activePage === totalPages}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activePage === totalPages
                      ? 'bg-slate-100 dark:bg-dark-900/40 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
                      : 'bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 hover:scale-[1.02] shadow-sm'
                  }`}
                >
                  Last &rarr;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-dark-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
            <p className="text-slate-500 dark:text-slate-400 font-medium">No weaving designs found matching the current filters.</p>
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
