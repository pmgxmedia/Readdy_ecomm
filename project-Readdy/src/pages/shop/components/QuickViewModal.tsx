import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useFavorites } from '../../../hooks/useFavorites';
import { useCurrency } from '../../../contexts/CurrencyContext';

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

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  onClose: () => void;
}

const FEATURES = [
  { icon: 'ri-truck-line', label: 'Free Shipping', desc: 'On orders over R500' },
  { icon: 'ri-shield-check-line', label: '2-Year Warranty', desc: 'Full coverage' },
  { icon: 'ri-refresh-line', label: '30-Day Returns', desc: 'Hassle-free' },
];

const SPECS = [
  ['Driver Size', '40mm'],
  ['Frequency', '20Hz – 20kHz'],
  ['Connectivity', 'Bluetooth 5.3'],
  ['Battery Life', 'Up to 30 hours'],
  ['Weight', '250g'],
];

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { formatPrice } = useCurrency();

  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] ?? '');
      setQuantity(1);
      setAdded(false);
      setActiveTab('description');
      setImageLoaded(false);
    }
  }, [product]);

  // Lock body scroll when open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!product) return null;

  const numericId = parseInt(product.id.replace(/\D/g, '')) || 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const inStock = (product.stock ?? 99) > 0;
  const lowStock = (product.stock ?? 99) <= 10 && inStock;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({ id: numericId, name: product.name, price: product.price, image: product.image });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleFavorite = () => {
    if (isFavorite(numericId)) {
      removeFromFavorites(numericId);
    } else {
      addToFavorites({ id: numericId, name: product.name, price: formatPrice(product.price), image: product.image });
    }
  };

  const handleViewFull = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-[fadeInScale_0.25s_ease-out]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all cursor-pointer shadow-sm"
        >
          <i className="ri-close-line text-lg"></i>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col md:flex-row">

            {/* ── Left: Image ── */}
            <div className="md:w-5/12 bg-gray-50 flex items-center justify-center p-8 min-h-64 relative flex-shrink-0">
              {/* Badge */}
              {product.badge && (
                <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-teal-500 text-white z-10">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white z-10">
                  -{discount}%
                </span>
              )}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={product.image}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                className={`w-full max-h-72 object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>

            {/* ── Right: Info ── */}
            <div className="md:w-7/12 p-7 flex flex-col gap-5">

              {/* Category + Name */}
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1.5">{product.category}</p>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h2>
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`text-sm ${i < Math.floor(product.rating!) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'}`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{product.rating}</span>
                  <span className="text-sm text-gray-400">({product.reviewCount?.toLocaleString()} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through mb-0.5">{formatPrice(product.originalPrice)}</span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-semibold text-emerald-600 mb-1">
                    Save {formatPrice(product.originalPrice! - product.price)}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${inStock ? 'text-emerald-600' : 'text-red-600'}`}>
                  {!inStock ? 'Out of Stock' : lowStock ? `Only ${product.stock} left` : 'In Stock'}
                </span>
              </div>

              <div className="border-t border-gray-100"></div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2.5">
                    Color: <span className="font-normal text-gray-500">{selectedColor}</span>
                  </p>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                          selectedColor === color
                            ? 'border-gray-900 scale-110 shadow-md'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2.5">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <i className="ri-subtract-line"></i>
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900 text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock ?? 99, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{product.stock ?? 99} available</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                    added
                      ? 'bg-emerald-500 text-white'
                      : inStock
                      ? 'bg-gray-900 hover:bg-gray-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <i className={`text-base ${added ? 'ri-check-line' : 'ri-shopping-cart-line'}`}></i>
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0 ${
                    isFavorite(numericId)
                      ? 'border-red-400 bg-red-50 text-red-500'
                      : 'border-gray-200 hover:border-gray-400 text-gray-500'
                  }`}
                >
                  <i className={`text-lg ${isFavorite(numericId) ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                </button>
              </div>

              {/* View Full Details */}
              <button
                onClick={handleViewFull}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-external-link-line text-sm"></i>
                View Full Details
              </button>

              {/* Features */}
              <div className="flex gap-3">
                {FEATURES.map((f) => (
                  <div key={f.label} className="flex-1 flex flex-col items-center text-center gap-1 bg-gray-50 rounded-xl p-3">
                    <div className="w-7 h-7 flex items-center justify-center">
                      <i className={`${f.icon} text-gray-600 text-base`}></i>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 leading-tight">{f.label}</p>
                    <p className="text-xs text-gray-400 leading-tight">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
                  {(['description', 'specs'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer capitalize whitespace-nowrap ${
                        activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {activeTab === 'description' && (
                  <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                    <p>
                      Experience audio like never before with the <strong className="text-gray-900">{product.name}</strong>.
                      Engineered for audiophiles and casual listeners alike, delivering rich, immersive sound with exceptional clarity.
                    </p>
                    <ul className="space-y-1.5 mt-2">
                      {['40mm custom-tuned drivers', 'Up to 30 hours battery life', 'Bluetooth 5.3 connectivity', 'Built-in microphone for calls'].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <i className="ri-check-line text-emerald-500 text-sm flex-shrink-0"></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-1">
                    {SPECS.map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
