import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { ProductCard } from '@/components/ProductCard';
import { Search, ChevronDown, Leaf, Plug, Sprout, Package, MessageSquare } from 'lucide-react';
import { LeavesBackground } from '@/components/LeavesBackground';
import Lottie from 'lottie-react';
import beeAnimation from '../lotties/wired-outline-1148-bee-hover-pinch.json';

const categories = [
  { id: 'all', name: 'All Products', icon: <Leaf className="w-5 h-5" /> },
  { id: 'mosquito-traps', name: 'Mosquito Traps', icon: <Plug className="w-5 h-5" /> },
  { id: 'ant-control', name: 'Ant Control', icon: <div className="w-5 h-5"><Lottie animationData={beeAnimation} loop={true} autoplay={true} /></div> },
  { id: 'organic-sprays', name: 'Organic Sprays', icon: <Sprout className="w-5 h-5" /> },
  { id: 'accessories', name: 'Accessories', icon: <Package className="w-5 h-5" /> },
];

const priceRanges = [
  { min: 0, max: 5000, label: 'Under ₦5,000' },
  { min: 5000, max: 15000, label: '₦5,000 - ₦15,000' },
  { min: 15000, max: 30000, label: '₦15,000 - ₦30,000' },
  { min: 30000, max: Infinity, label: 'Above ₦30,000' },
];

export function ShopPage() {
  const {
    products,
    isLoadingProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeCouponCode,
    setActiveCouponCode,
  } = useStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [currentFlyIndex, setCurrentFlyIndex] = useState(0);
  const targetFliesImages = useMemo(() => [
    { src: '/images/dead_house_fly_final.png', alt: 'Realistic Housefly' },
    { src: '/images/mosquito.png', alt: 'Realistic Mosquito' },
    { src: '/images/cockroach.png', alt: 'Realistic Cockroach' },
    { src: '/images/bedbug.png', alt: 'Realistic Bedbug' },
    { src: '/images/tick.png', alt: 'Realistic Tick' }
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFlyIndex(prev => (prev + 1) % targetFliesImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [targetFliesImages.length]);

  useEffect(() => {
    const coupon = new URLSearchParams(window.location.search).get('coupon');
    if (coupon) {
      setActiveCouponCode(coupon);
    }
  }, [setActiveCouponCode]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          (p.name?.toLowerCase() || '').includes(query) ||
          (p.description?.toLowerCase() || '').includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price filter
    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange];
      result = result.filter(p => p.price >= range.min && p.price < range.max);
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        result.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedPriceRange, minRating, inStockOnly, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange(null);
    setMinRating(0);
    setInStockOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-outline-variant relative overflow-hidden">
        <LeavesBackground opacity={0.08} />
        <div className="section-padding py-8 relative z-10">
          <h1 className="font-display font-bold text-forest text-3xl md:text-4xl mb-2">
            Our Products
          </h1>
          <p className="text-muted-foreground">
            Premium non-toxic and odourless housefly control solutions for Nigerian homes and farms.
          </p>
        </div>
      </div>

      <div className="section-padding py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Target Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-outline-variant font-medium btn-anim"
            >
              <div className="w-5 h-5 relative z-10">
                <Lottie animationData={beeAnimation} loop={true} autoplay={true} />
              </div>
              <span>What Our Products Work For</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Sidebar Target Flies */}
          <aside
            className={`lg:w-72 flex-shrink-0 ${
              isFilterOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <div className="mb-4 text-center">
                <div className="w-20 h-20 mx-auto -mb-1 flex items-center justify-center relative">
                  {targetFliesImages.map((fly, idx) => (
                    <img
                      key={fly.src}
                      src={fly.src}
                      alt={fly.alt}
                      className={`absolute w-full h-full object-cover mix-blend-multiply drop-shadow-md transition-opacity duration-1000 ${
                        idx === currentFlyIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ clipPath: 'circle(36%)' }}
                    />
                  ))}
                </div>
                <h3 className="font-display font-semibold text-forest text-lg leading-tight px-4">What Our Products Work For</h3>
                <p className="text-sm text-muted-foreground mt-1">Our products are engineered to eliminate:</p>
              </div>

              <div className="space-y-2 mt-6">
                {[
                  'House Flies',
                  'Mosquitoes',
                  'Cockroaches',
                  'Sand Flies',
                  'Fruit Flies',
                  'Gnat Flies',
                  'Aphids',
                  'Fleas',
                  'Bedbugs',
                  'Ticks'
                ].map((fly) => (
                  <div
                    key={fly}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-outline-variant hover:bg-forest/5 hover:border-forest/20 transition-colors"
                  >
                    <div className="w-5 h-5">
                      <Lottie animationData={beeAnimation} loop={true} autoplay={true} />
                    </div>
                    <span className="font-medium text-forest text-sm">{fly}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search our collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-forest/20"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-white rounded-xl border-0 focus:ring-2 focus:ring-forest/20 text-sm cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {(filteredProducts || []).length} results
              {selectedCategory !== 'all' && ` for "${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}"`}
            </p>

            {/* Products */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">

                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[32px] p-6 shadow-sm border border-outline-variant animate-pulse">
                    <div className="bg-surface-high aspect-square rounded-2xl mb-4"></div>
                    <div className="h-6 bg-surface-high rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-surface-high rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-surface-high rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (filteredProducts || []).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">

                {(filteredProducts || []).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl relative overflow-hidden">
                <LeavesBackground opacity={0.1} />
                <div className="relative z-10">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-forest mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-10 mb-16">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-muted-foreground hover:bg-white transition-colors no-anim">
                  ←
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors no-anim ${
                      page === 1
                        ? 'bg-forest text-white'
                        : 'bg-white text-forest hover:bg-surface'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="text-muted-foreground">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-muted-foreground hover:bg-white transition-colors no-anim">
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Order Section */}
      <section className="relative flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/bulk-order-bg.png')" }}
        />
        {/* Dark Black Overlay for extra contrast */}
        <div className="absolute inset-0 bg-black/75" />

        <div className="section-padding relative z-10 w-full py-4 md:py-6">
          <div className="max-w-3xl text-left">
            <h2 className="text-white text-2xl md:text-4xl font-display font-black leading-tight">
              Want to become a <span className="text-gold">Distributor?</span>
            </h2>
            <p className="text-white/90 text-sm md:text-lg font-medium leading-relaxed max-w-2xl mt-1 mb-4">
              Got a bulk order? We offer special rates for wholesalers and distributors.
            </p>

            <button
              onClick={() => window.open('https://wa.me/2348031301311?text=Hi%2C%20I%20am%20interested%20in%20becoming%20a%20Haify%20Trap%20distributor.', '_blank')}
              className="group bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-3 hover:bg-[#20ba5a] active:scale-[0.98] shadow-xl w-fit"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 md:w-6 md:h-6 fill-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-base md:text-lg">Talk on WhatsApp</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
