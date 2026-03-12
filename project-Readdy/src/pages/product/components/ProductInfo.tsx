import { useState } from 'react';
import { useCart } from '../../../hooks/useCart';
import { useFavorites } from '../../../hooks/useFavorites';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface Product {
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
}

interface ProductInfoProps {
  product: Product;
}

const FEATURES = [
  { icon: 'ri-truck-line', label: 'Free Shipping', desc: 'On orders over R500' },
  { icon: 'ri-shield-check-line', label: '2-Year Warranty', desc: 'Full manufacturer coverage' },
  { icon: 'ri-refresh-line', label: '30-Day Returns', desc: 'Hassle-free returns' },
  { icon: 'ri-headphone-line', label: '24/7 Support', desc: 'Always here to help' },
];

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { formatPrice } = useCurrency();

  const numericId = parseInt(product.id.replace(/\D/g, '')) || 0;
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

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

  return (
    <div className="flex flex-col gap-6">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{product.category}</span>
        {product.isNew && (
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">NEW</span>
        )}
        {discount > 0 && (
          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">-{discount}% OFF</span>
        )}
      </div>

      {/* Name */}
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h1>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`text-base ${i < Math.floor(product.rating!) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300 dark:text-gray-600'}`}
              ></i>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{product.rating}</span>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">({product.reviewCount?.toLocaleString()} reviews)</span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-end gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <span className="text-base sm:text-lg lg:text-xl text-gray-400 dark:text-gray-500 line-through mb-0.5">{formatPrice(product.originalPrice)}</span>
        )}
        {discount > 0 && (
          <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            You save {formatPrice(product.originalPrice! - product.price)}
          </span>
        )}
      </div>

      {/* Stock */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
        <span className={`text-sm font-medium ${inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {!inStock ? 'Out of Stock' : lowStock ? `Only ${product.stock} left in stock` : 'In Stock'}
        </span>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700"></div>

      {/* Color Selector */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Color: <span className="font-normal text-gray-500 dark:text-gray-400">{selectedColor}</span>
          </p>
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={color}
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                  selectedColor === color ? 'border-gray-900 dark:border-teal-400 scale-110 shadow-md' : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
              ></button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quantity</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <i className="ri-subtract-line"></i>
            </button>
            <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock ?? 99, q + 1))}
              className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <i className="ri-add-line"></i>
            </button>
          </div>
          <span className="text-sm text-gray-400 dark:text-gray-500">{product.stock ?? 99} available</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex-1 py-4 sm:py-4 rounded-xl font-semibold text-base sm:text-base transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 min-h-[56px] sm:min-h-[52px] ${
            added
              ? 'bg-emerald-500 text-white'
              : inStock
              ? 'bg-gray-900 dark:bg-teal-600 hover:bg-gray-700 dark:hover:bg-teal-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          <i className={`text-lg ${added ? 'ri-check-line' : 'ri-shopping-cart-line'}`}></i>
          {added ? 'Added to Cart!' : 'Add to Cart'}
        </button>
        <button
          className="flex-1 py-4 rounded-xl font-semibold text-base transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 min-h-[56px] sm:min-h-[52px] bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
        >
          <i className="ri-flashlight-line text-lg"></i>
          Buy Now
        </button>
        <button
          onClick={handleToggleFavorite}
          className={`w-full sm:w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer sm:flex-none ${
            isFavorite(numericId)
              ? 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400'
          }`}
        >
          <i className={`text-xl ${isFavorite(numericId) ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
          <span className="sm:hidden ml-2 font-semibold text-base">
            {isFavorite(numericId) ? 'Saved' : 'Save'}
          </span>
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((f) => (
          <div key={f.label} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <i className={`${f.icon} text-gray-700 dark:text-gray-300 text-lg`}></i>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{f.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700"></div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
          {(['description', 'specs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer capitalize whitespace-nowrap ${
                activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
            <p>
              Experience audio like never before with the <strong className="text-gray-900 dark:text-white">{product.name}</strong>. 
              Engineered for audiophiles and casual listeners alike, this {product.category.toLowerCase()} delivers 
              rich, immersive sound with exceptional clarity across all frequencies.
            </p>
            <p>
              Featuring advanced acoustic engineering, premium materials, and an ergonomic design built for 
              all-day comfort. Whether you're commuting, working, or relaxing at home, the {product.name} 
              adapts to your lifestyle seamlessly.
            </p>
            <ul className="space-y-1.5 mt-3">
              {['40mm custom-tuned drivers', 'Up to 30 hours battery life', 'Bluetooth 5.3 connectivity', 'Foldable design for portability', 'Built-in microphone for calls'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <i className="ri-check-line text-emerald-500 dark:text-emerald-400 text-sm"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-2">
            {[
              ['Driver Size', '40mm'],
              ['Frequency Response', '20Hz – 20kHz'],
              ['Impedance', '32 Ohm'],
              ['Connectivity', 'Bluetooth 5.3 / 3.5mm Jack'],
              ['Battery Life', 'Up to 30 hours'],
              ['Charging', 'USB-C, 2hr full charge'],
              ['Weight', '250g'],
              ['Warranty', '2 Years'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
