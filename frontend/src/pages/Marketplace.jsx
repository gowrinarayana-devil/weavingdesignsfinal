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

export default function Marketplace() {
  const { addToCart, isInCart } = useCart();
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest'); // price-asc, price-desc, popularity, newest
  const [loading, setLoading] = useState(true);

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
          setCategories(['All', ...dbCategories.map(c => c.name)]);
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
    updateSEO(
      'Premium Weaving & Embroidery Designs Marketplace',
      'Explore and download premium Jacquard weaving designs, border styles, motifs, and custom embroidery layouts with full color charts and machine config specs.'
    );
  }, []);

  // Filter and Sort designs
  const filteredDesigns = designs
    .filter(design => {
      const matchesSearch = design.title.toLowerCase().includes(search.toLowerCase()) || 
                            design.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || design.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'popularity') return (b.downloads || 0) - (a.downloads || 0);
      return new Date(b.created_at) - new Date(a.created_at); // newest
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Featured Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-r from-teal-900 to-slate-900 dark:from-brand-900 dark:to-dark-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-brand-500/30">
            <Tag size={12} />
            <span>Premium Files</span>
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Craft Masterpieces with Premium Weaving Designs
          </h1>
          <p className="text-slate-300 mt-4 text-base sm:text-lg">
            Download production-ready patterns compatible with all major computer-controlled weaving machines. Fully watermarked previews, instant UPI payments, and lifetime downloads.
          </p>
        </div>
        {/* Background Decorative Art */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-25 hidden md:block">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-400 via-teal-800 to-transparent rounded-full transform scale-150 translate-x-1/4 translate-y-1/4"></div>
        </div>
      </div>

      {/* Catalog Search & Controls Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <SlidersHorizontal size={18} className="text-brand-500" />
              <span>Filter Categories</span>
            </h3>
            <div className="flex flex-row flex-wrap lg:flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold text-left transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
                      : 'bg-slate-100 dark:bg-dark-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Search & List */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-dark-900/40 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search designs..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
              />
            </div>

            {/* Sorting Select */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <ArrowUpDown size={16} className="text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="newest">Newest Additions</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>

          {/* Grid Designs List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-100 dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl h-80"></div>
              ))}
            </div>
          ) : filteredDesigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigns.map((design) => (
                <div key={design.id} className="group relative bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                  
                  {/* Design Image Preview */}
                  <Link to={`/design/${design.id}`} className="relative block overflow-hidden aspect-square bg-slate-100 dark:bg-dark-950">
                    {/* Visual protection watermark banner */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] bg-[size:40px_40px] pointer-events-none z-10 opacity-75"></div>
                    
                    <img
                      src={design.preview_image_url || design.image_url}
                      alt={design.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 no-select"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    
                    {/* Featured Tag */}
                    {design.is_featured && (
                      <span className="absolute top-3 left-3 bg-brand-600 text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-md z-20">
                        Best Seller
                      </span>
                    )}

                    {/* Category Label Overlay */}
                    <span className="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-sm text-slate-100 px-2 py-0.5 rounded text-xs font-medium border border-white/10 z-20">
                      {design.category}
                    </span>
                  </Link>

                  {/* Card Metadata */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 line-clamp-1 transition-colors text-base">
                      <Link to={`/design/${design.id}`}>{design.title}</Link>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed flex-grow">
                      {design.description}
                    </p>
                    
                    {/* Action Bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Price</span>
                        <span className="font-display font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                          ₹{design.price}
                        </span>
                      </div>
                      
                      {isInCart(design.id) ? (
                        <Link
                          to="/cart"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          Added in Cart
                        </Link>
                      ) : (
                        <button
                          onClick={() => addToCart(design)}
                          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-brand-600/10 transition-all"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-dark-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No weaving designs found matching the current filters.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                className="text-brand-500 font-bold hover:underline mt-2 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
