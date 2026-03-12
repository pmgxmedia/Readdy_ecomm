import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';
import { useAdminStore } from '../../contexts/AdminStoreContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { NEW_ARRIVALS_DATA, NEW_ARRIVALS_BADGE_COLORS } from '../../mocks/newArrivals';
import QuickViewModal from './components/QuickViewModal';
import CompareBar from './components/CompareBar';
import CompareModal from './components/CompareModal';
import type { CompareProduct } from './components/CompareBar';
import { useReviewCounts } from '../../hooks/useReviewCounts';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'top-rated' | 'most-reviewed';

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'featured',      label: 'Featured',              icon: 'ri-star-line' },
  { value: 'price-asc',     label: 'Price: Low to High',    icon: 'ri-sort-asc' },
  { value: 'price-desc',    label: 'Price: High to Low',    icon: 'ri-sort-desc' },
  { value: 'top-rated',     label: 'Top Rated',             icon: 'ri-award-line' },
  { value: 'most-reviewed', label: 'Most Reviewed',         icon: 'ri-chat-3-line' },
];

const RECENTLY_VIEWED_KEY = 'shop_recently_viewed';
const MAX_RECENTLY_VIEWED = 8;

interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
}

interface QuickViewProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  isNew?: boolean;
  stock?: number;
  badge?: string;
}

function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentlyViewed(items: RecentlyViewedItem[]) {
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
}

function addToRecentlyViewed(item: RecentlyViewedItem) {
  const current = getRecentlyViewed().filter(p => p.id !== item.id);
  const updated = [item, ...current].slice(0, MAX_RECENTLY_VIEWED);
  saveRecentlyViewed(updated);
}

function applySorting<T extends { price: number; rating?: number; reviewCount?: number }>(
  items: T[],
  sort: SortOption
): T[] {
  const arr = [...items];
  switch (sort) {
    case 'price-asc':     return arr.sort((a, b) => a.price - b.price);
    case 'price-desc':    return arr.sort((a, b) => b.price - a.price);
    case 'top-rated':     return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'most-reviewed': return arr.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    default:              return arr;
  }
}

// ── Review Badge ───────────────────────────────────────────────────────────
interface ReviewBadgeProps {
  productId: string;
  fallbackRating?: number;
  fallbackCount?: number;
  reviewMap: Record<string, { reviewCount: number; avgRating: number }>;
  size?: 'sm' | 'xs';
}

const ReviewBadge = ({ productId, fallbackRating, fallbackCount, reviewMap, size = 'sm' }: ReviewBadgeProps) => {
  const live = reviewMap[productId];
  const count = live ? live.reviewCount : (fallbackCount ?? 0);
  const rating = live ? live.avgRating : (fallbackRating ?? 0);

  const starSize = size === 'xs' ? 'text-xs' : 'text-sm';
  const textSize = size === 'xs' ? 'text-xs' : 'text-xs';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`${starSize} ${i < Math.floor(rating) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'}`}
          ></i>
        ))}
      </div>
      <span className={`${textSize} font-medium text-gray-600`}>{rating > 0 ? rating.toFixed(1) : '—'}</span>
      <span
        className={`inline-flex items-center gap-0.5 ${textSize} font-semibold px-2 py-0.5 rounded-full ${
          count > 0
            ? 'bg-teal-50 text-teal-700 border border-teal-100'
            : 'bg-gray-100 text-gray-400 border border-gray-200'
        }`}
      >
        <i className="ri-chat-3-line text-xs"></i>
        {count > 0 ? count.toLocaleString() : '0'}
      </span>
    </div>
  );
};

// ── Recently Viewed Strip ──────────────────────────────────────────────────
interface RecentlyViewedStripProps {
  items: RecentlyViewedItem[];
  onClear: () => void;
  onNavigate: (id: string) => void;
  formatPrice: (n: number) => string;
}

const RecentlyViewedStrip = ({ items, onClear, onNavigate, formatPrice }: RecentlyViewedStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-900 dark:bg-teal-600 rounded-lg">
              <i className="ri-history-line text-white text-sm"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Recently Viewed</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">{items.length} product{items.length !== 1 ? 's' : ''} visited</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Scroll arrows */}
            {items.length > 3 && (
              <>
                <button
                  onClick={scrollLeft}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-left-s-line text-base"></i>
                </button>
                <button
                  onClick={scrollRight}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-right-s-line text-base"></i>
                </button>
              </>
            )}
            <button
              onClick={onClear}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <i className="ri-delete-bin-6-line text-sm"></i>
              Clear
            </button>
          </div>
        </div>

        {/* Scrollable Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex-shrink-0 w-44 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left group"
            >
              <div className="w-full h-28 bg-gray-50 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium truncate mb-0.5">{item.category}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {item.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(item.price)}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 line-through">{formatPrice(item.originalPrice)}</span>
                  )}
                </div>
                {item.rating && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`ri-star-${i < Math.floor(item.rating!) ? 'fill' : 'line'} text-yellow-400 text-xs`}></i>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [addedProducts, setAddedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const [compareList, setCompareList] = useState<CompareProduct[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState<string[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const { popularProducts } = useAdminStore();
  const { formatPrice } = useCurrency();

  // Collect all product IDs for live review fetching
  const allProductIds = useMemo(() => {
    const ids = [
      ...popularProducts.map(p => String(p.id)),
      ...NEW_ARRIVALS_DATA.map(p => String(p.id)),
    ];
    return [...new Set(ids)];
  }, [popularProducts]);

  const { reviewMap } = useReviewCounts(allProductIds);

  // Load recently viewed on mount
  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  // Read ?category= from URL on mount / when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('All');
    }
  }, [location.search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToProduct = useCallback(
    (product: RecentlyViewedItem) => {
      addToRecentlyViewed(product);
      setRecentlyViewed(getRecentlyViewed());
      navigate(`/product/${product.id}`);
    },
    [navigate]
  );

  const handleClearRecentlyViewed = () => {
    saveRecentlyViewed([]);
    setRecentlyViewed([]);
  };

  // ── Compare helpers ──────────────────────────────────────────────────────
  const isInCompare = (id: string) => compareList.some(p => p.id === id);

  const toggleCompare = (product: CompareProduct) => {
    if (isInCompare(product.id)) {
      setCompareList(prev => prev.filter(p => p.id !== product.id));
    } else {
      if (compareList.length >= 3) return;
      setCompareList(prev => [...prev, product]);
    }
  };

  const removeFromCompare = (id: string) => setCompareList(prev => prev.filter(p => p.id !== id));
  const clearCompare = () => setCompareList([]);

  const categories = ['All', 'New Arrivals', ...Array.from(new Set(popularProducts.map(p => p.category)))];

  const baseFiltered =
    selectedCategory === 'New Arrivals'
      ? []
      : selectedCategory === 'All'
      ? popularProducts
      : popularProducts.filter((p) => p.category === selectedCategory);

  const searchFiltered = searchQuery.trim()
    ? baseFiltered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : baseFiltered;

  const filteredProducts = applySorting(searchFiltered, sortBy);

  const searchFilteredNewArrivals = searchQuery.trim()
    ? NEW_ARRIVALS_DATA.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : NEW_ARRIVALS_DATA;

  const sortedNewArrivals = applySorting(searchFilteredNewArrivals, sortBy);

  const isNewArrivals = selectedCategory === 'New Arrivals';
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Featured';

  const handleAddToCart = (product: { id: string; name: string; price: number; image: string }) => {
    const numericId = parseInt(product.id.replace(/\D/g, '')) || 0;
    addToCart({ id: numericId, name: product.name, price: product.price, image: product.image });
    setAddedProducts(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedProducts(prev => prev.filter(id => id !== product.id));
    }, 1000);
  };

  const handleToggleFavorite = (
    e: React.MouseEvent,
    product: { id: string; name: string; price: number; image: string }
  ) => {
    e.stopPropagation();
    const numericId = parseInt(product.id.replace(/\D/g, '')) || 0;
    if (isFavorite(numericId)) {
      removeFromFavorites(numericId);
    } else {
      addToFavorites({ id: numericId, name: product.name, price: String(product.price), image: product.image });
    }
    setHeartAnimating(prev => [...prev, product.id]);
    setTimeout(() => setHeartAnimating(prev => prev.filter(id => id !== product.id)), 400);
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 ${compareList.length > 0 ? 'pb-20' : ''}`}>
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-6 sm:py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isNewArrivals ? (
            <>
              <div className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full px-3 py-1 text-xs font-semibold mb-2 sm:mb-4">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                Fresh In Stock
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">New Arrivals</h1>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                The latest additions to our collection — cutting-edge audio gear crafted for the modern listener.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">Shop All Products</h1>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover our complete collection of premium audio products and accessories
              </p>
            </>
          )}
        </div>
      </div>

      {/* Recently Viewed Strip */}
      <RecentlyViewedStrip
        items={recentlyViewed}
        onClear={handleClearRecentlyViewed}
        onNavigate={(id) => {
          const all = [...popularProducts, ...NEW_ARRIVALS_DATA];
          const found = all.find(p => p.id === String(id));
          if (found) {
            handleNavigateToProduct({
              id: String(found.id),
              name: found.name,
              price: found.price,
              originalPrice: found.originalPrice,
              image: found.image,
              category: found.category,
              rating: found.rating,
            });
          } else {
            navigate(`/product/${id}`);
          }
        }}
        formatPrice={formatPrice}
      />

      {/* Filter + Sort Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400 dark:text-gray-500 text-lg"></i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name…"
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          )}
        </div>

        {/* Category Tabs + Sort — single inline scrollable row */}
        <div className="flex items-center gap-2 mb-8 min-w-0">
          {/* Scrollable Tabs */}
          <div
            ref={tabsScrollRef}
            className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-2 py-0.5 rounded-full border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 font-sans text-[9px] sm:text-[10px] font-medium ${
                  selectedCategory === category
                    ? 'bg-gray-900 dark:bg-teal-600 text-white border-gray-900 dark:border-teal-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-teal-600 hover:text-white dark:hover:border-teal-600'
                }`}
              >
                {category === 'New Arrivals' && (
                  <span className={`w-1 h-1 rounded-full flex-shrink-0 ${selectedCategory === 'New Arrivals' ? 'bg-teal-400' : 'bg-teal-500'} animate-pulse`}></span>
                )}
                {category}
                {category === 'New Arrivals' && (
                  <span className={`font-sans text-[7px] sm:text-[8px] font-bold px-1 py-0.5 rounded-full flex-shrink-0 ${selectedCategory === 'New Arrivals' ? 'bg-teal-500 text-white' : 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400'}`}>
                    {NEW_ARRIVALS_DATA.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 flex-shrink-0"></div>

          {/* Sort Dropdown — pinned right */}
          <div className="relative flex-shrink-0" ref={sortRef}>
            <button
              onClick={() => setSortOpen(prev => !prev)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap font-sans text-[9px] sm:text-[10px] font-medium bg-white dark:bg-gray-800"
            >
              <i className="ri-sort-line text-[9px] sm:text-[10px]"></i>
              <span className="hidden sm:inline">Sort: <span className="font-semibold">{activeSortLabel}</span></span>
              <span className="sm:hidden font-semibold">{activeSortLabel}</span>
              <i className={`ri-arrow-down-s-line text-[9px] sm:text-[10px] transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {sortOpen && (
              <div className="absolute right-0 mt-2 w-40 sm:w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setSortBy(option.value); setSortOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 font-sans text-[9px] sm:text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                      sortBy === option.value
                        ? 'bg-gray-900 dark:bg-teal-600 text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <i className={`${option.icon} text-[9px] sm:text-[10px]`}></i>
                    {option.label}
                    {sortBy === option.value && <i className="ri-check-line ml-auto text-teal-400 text-[9px] sm:text-[10px]"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* No search results state */}
        {searchQuery.trim() && filteredProducts.length === 0 && sortedNewArrivals.length === 0 && (
          <div className="text-center py-16">
            <i className="ri-search-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results for "{searchQuery}"</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Try a different keyword or browse by category</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2 rounded-full bg-gray-900 dark:bg-teal-600 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* New Arrivals Grid */}
        {isNewArrivals && sortedNewArrivals.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-7" data-product-shop>
            {sortedNewArrivals.map((product, index) => {
              const inCompare = isInCompare(product.id);
              const compareDisabled = !inCompare && compareList.length >= 3;
              const numericId = parseInt(product.id.replace(/\D/g, '')) || 0;
              const favorited = isFavorite(numericId);
              const heartAnim = heartAnimating.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Image area */}
                  <div
                    className="relative bg-gray-50 dark:bg-gray-700 p-3 sm:p-6 cursor-pointer overflow-hidden"
                    onClick={() => handleNavigateToProduct({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: product.image,
                      category: product.category,
                      rating: product.rating,
                    })}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 sm:h-52 object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${NEW_ARRIVALS_BADGE_COLORS[product.badge] ?? 'bg-gray-800 text-white'}`}>
                        {product.badge}
                      </span>
                    )}
                    {product.originalPrice && !product.badge && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        SALE
                      </span>
                    )}
                    {product.originalPrice && product.badge && (
                      <span className="absolute top-11 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        SALE
                      </span>
                    )}
                    {product.originalPrice && (
                      <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, product)}
                      className={`absolute top-2 right-2 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer z-10 ${
                        favorited
                          ? 'bg-red-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                      } ${heartAnim ? 'scale-125' : 'scale-100'}`}
                    >
                      <i className={`${favorited ? 'ri-heart-fill' : 'ri-heart-line'} text-xs sm:text-base`}></i>
                    </button>
                    {/* Quick View Overlay — desktop only */}
                    <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct({ ...product });
                        }}
                        className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-gray-900 dark:hover:bg-teal-600 hover:text-white cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <i className="ri-eye-line text-sm"></i>
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                    <div>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider mb-0.5 truncate">{product.category}</p>
                      <h3
                        className="text-xs sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer leading-snug line-clamp-2"
                        onClick={() => handleNavigateToProduct({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          image: product.image,
                          category: product.category,
                          rating: product.rating,
                        })}
                      >
                        {product.name}
                      </h3>
                      {/* Review Badge — hidden on mobile */}
                      <div className="hidden sm:block mt-2">
                        <ReviewBadge
                          productId={String(product.id)}
                          fallbackRating={product.rating}
                          fallbackCount={product.reviewCount}
                          reviewMap={reviewMap}
                          size="xs"
                        />
                      </div>
                      {product.colors && product.colors.length > 0 && (
                        <div className="hidden sm:flex gap-1.5 mt-3">
                          {product.colors.map((color) => (
                            <div
                              key={color}
                              className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Quick View — hidden on mobile */}
                      <button
                        onClick={() => setQuickViewProduct({ ...product })}
                        className="hidden sm:flex flex-1 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap items-center justify-center gap-1"
                      >
                        <i className="ri-eye-line text-sm"></i>
                        Quick View
                      </button>
                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`flex-1 sm:flex-none sm:w-10 h-9 sm:h-10 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold ${
                          addedProducts.includes(product.id)
                            ? 'bg-teal-500 text-white'
                            : 'bg-black dark:bg-teal-600 hover:bg-gray-800 dark:hover:bg-teal-500 text-white'
                        }`}
                      >
                        <i className={`${addedProducts.includes(product.id) ? 'ri-check-line' : 'ri-shopping-cart-line'} text-sm`}></i>
                        <span className="sm:hidden">{addedProducts.includes(product.id) ? 'Added' : 'Add'}</span>
                      </button>
                    </div>

                    {/* Compare Toggle — hidden on mobile */}
                    <button
                      onClick={() => toggleCompare({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        category: product.category,
                        image: product.image,
                        rating: product.rating,
                        reviewCount: product.reviewCount,
                        colors: product.colors,
                        stock: product.stock,
                      })}
                      disabled={compareDisabled}
                      className={`hidden sm:flex w-full py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap items-center justify-center gap-1.5 ${
                        inCompare
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50'
                          : compareDisabled
                          ? 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <i className={`${inCompare ? 'ri-check-line' : 'ri-bar-chart-horizontal-line'} text-sm`}></i>
                      {inCompare ? 'Added to Compare' : compareDisabled ? 'Compare full (3/3)' : 'Add to Compare'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Regular Products Grid */}
        {!isNewArrivals && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
            {filteredProducts.map((product) => {
              const inCompare = isInCompare(String(product.id));
              const compareDisabled = !inCompare && compareList.length >= 3;
              const numericId = parseInt(String(product.id).replace(/\D/g, '')) || 0;
              const favorited = isFavorite(numericId);
              const heartAnim = heartAnimating.includes(String(product.id));
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-sm sm:shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
                  data-product-shop
                >
                  {/* Image area */}
                  <div
                    className="aspect-square bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 cursor-pointer relative overflow-hidden"
                    onClick={() => handleNavigateToProduct({
                      id: String(product.id),
                      name: product.name,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: product.image,
                      category: product.category,
                      rating: product.rating,
                    })}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.originalPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        SALE
                      </span>
                    )}
                    {product.isNew && !product.originalPrice && (
                      <span className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        NEW
                      </span>
                    )}
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, { id: String(product.id), name: product.name, price: product.price, image: product.image })}
                      className={`absolute top-2 right-2 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer z-10 ${
                        favorited
                          ? 'bg-red-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                      } ${heartAnim ? 'scale-125' : 'scale-100'}`}
                    >
                      <i className={`${favorited ? 'ri-heart-fill' : 'ri-heart-line'} text-xs sm:text-base`}></i>
                    </button>
                    {/* Quick View Overlay — desktop only */}
                    <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct({
                            id: String(product.id),
                            name: product.name,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            category: product.category,
                            image: product.image,
                            rating: product.rating,
                            reviewCount: product.reviewCount,
                            colors: product.colors,
                            isNew: product.isNew,
                            stock: product.stock,
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-gray-900 dark:hover:bg-teal-600 hover:text-white cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <i className="ri-eye-line text-sm"></i>
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3 sm:p-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 truncate">{product.category}</p>
                    <h3
                      className="text-xs sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-2 leading-snug"
                      onClick={() => handleNavigateToProduct({
                        id: String(product.id),
                        name: product.name,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        image: product.image,
                        category: product.category,
                        rating: product.rating,
                      })}
                    >
                      {product.name}
                    </h3>
                    {/* Review Badge — hidden on mobile */}
                    <div className="hidden sm:block mb-3">
                      <ReviewBadge
                        productId={String(product.id)}
                        fallbackRating={product.rating}
                        fallbackCount={product.reviewCount}
                        reviewMap={reviewMap}
                        size="xs"
                      />
                    </div>
                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-2 sm:mb-4">
                      <span className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      {/* Quick View — hidden on mobile */}
                      <button
                        onClick={() => setQuickViewProduct({
                          id: String(product.id),
                          name: product.name,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          category: product.category,
                          image: product.image,
                          rating: product.rating,
                          reviewCount: product.reviewCount,
                          colors: product.colors,
                          isNew: product.isNew,
                          stock: product.stock,
                        })}
                        className="hidden sm:flex flex-1 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap items-center justify-center gap-1"
                      >
                        <i className="ri-eye-line text-sm"></i>
                        Quick View
                      </button>
                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`flex-1 sm:flex-none sm:w-10 h-9 sm:h-10 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer text-xs font-semibold ${
                          addedProducts.includes(String(product.id))
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-900 dark:bg-teal-600 hover:bg-gray-700 dark:hover:bg-teal-500 text-white'
                        }`}
                      >
                        <i className={`${addedProducts.includes(String(product.id)) ? 'ri-check-line' : 'ri-shopping-cart-line'} text-sm`}></i>
                        <span className="sm:hidden">{addedProducts.includes(String(product.id)) ? 'Added' : 'Add'}</span>
                      </button>
                    </div>
                    {/* Compare Toggle — hidden on mobile */}
                    <button
                      onClick={() => toggleCompare({
                        id: String(product.id),
                        name: product.name,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        category: product.category,
                        image: product.image,
                        rating: product.rating,
                        reviewCount: product.reviewCount,
                        colors: product.colors,
                        stock: product.stock,
                      })}
                      disabled={compareDisabled}
                      className={`hidden sm:flex w-full py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap items-center justify-center gap-1.5 ${
                        inCompare
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50'
                          : compareDisabled
                          ? 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <i className={`${inCompare ? 'ri-check-line' : 'ri-bar-chart-horizontal-line'} text-sm`}></i>
                      {inCompare ? 'Added to Compare' : compareDisabled ? 'Compare full (3/3)' : 'Add to Compare'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isNewArrivals && filteredProducts.length === 0 && !searchQuery.trim() && (
          <div className="text-center py-16">
            <i className="ri-shopping-bag-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try selecting a different category</p>
          </div>
        )}
      </div>

      <Footer />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Compare Bar */}
      <CompareBar
        products={compareList}
        onRemove={removeFromCompare}
        onClear={clearCompare}
        onCompare={() => setCompareModalOpen(true)}
      />

      {/* Compare Modal */}
      {compareModalOpen && (
        <CompareModal
          products={compareList}
          onClose={() => setCompareModalOpen(false)}
          onRemove={(id) => {
            removeFromCompare(id);
            if (compareList.length <= 1) setCompareModalOpen(false);
          }}
        />
      )}

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 dark:bg-teal-600 text-white shadow-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-all duration-300 cursor-pointer ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        } ${compareList.length > 0 ? 'bottom-24' : 'bottom-8'}`}
      >
        <i className="ri-arrow-up-line text-lg"></i>
      </button>
    </div>
  );
};

export default ShopPage;
