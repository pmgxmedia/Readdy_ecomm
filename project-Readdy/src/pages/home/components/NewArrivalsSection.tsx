import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useFavorites } from '../../../hooks/useFavorites';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useAdminStore } from '../../../contexts/AdminStoreContext';

interface NewProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  colors?: string[];
  isNew: boolean;
}

const badgeColors: Record<string, string> = {
  'Just Dropped': 'bg-teal-500 text-white',
  'New': 'bg-emerald-500 text-white',
  "Editor's Pick": 'bg-amber-500 text-white',
  'Trending': 'bg-rose-500 text-white',
  'Hot': 'bg-orange-500 text-white',
  'Sale': 'bg-red-500 text-white',
};

const NewArrivalsSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currency } = useCurrency();
  const { newArrivalsProducts, newArrivalsMaxProducts } = useAdminStore();
  const [addingItems, setAddingItems] = useState<Record<string, boolean>>({});

  const displayedProducts = newArrivalsProducts.slice(0, newArrivalsMaxProducts);
  const hiddenCount = newArrivalsProducts.length - displayedProducts.length;

  const formatPrice = (price: number) => {
    if (currency.code === 'JPY') return `${currency.symbol}${Math.round(price * 110)}`;
    return `${currency.symbol}${price.toFixed(2)}`;
  };

  const handleAddToCart = (product: typeof newArrivalsProducts[0]) => {
    setAddingItems((prev) => ({ ...prev, [product.id]: true }));
    addToCart({
      id: product.id as unknown as number,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setTimeout(() => setAddingItems((prev) => ({ ...prev, [product.id]: false })), 1000);
  };

  const handleToggleFavorite = (product: typeof newArrivalsProducts[0]) => {
    if (isFavorite(product.id as unknown as number)) {
      removeFromFavorites(product.id as unknown as number);
    } else {
      addToFavorites({
        id: product.id as unknown as number,
        name: product.name,
        price: formatPrice(product.price),
        image: product.image,
      });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              Fresh In Stock
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
              New Arrivals
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl">
              The latest additions to our collection — cutting-edge audio gear crafted for the modern listener.
            </p>
          </div>
          <button
            onClick={() => navigate('/shop?filter=new-arrivals')}
            className="hidden lg:flex items-center gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            View All New Arrivals
            {hiddenCount > 0 && (
              <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                +{hiddenCount}
              </span>
            )}
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7" data-product-shop>
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Image Area */}
              <div
                className="relative bg-gray-50 dark:bg-gray-700 p-6 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-contain group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge */}
                {product.badge && (
                  <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${badgeColors[product.badge] ?? 'bg-gray-800 text-white'}`}>
                    {product.badge}
                  </span>
                )}

                {/* Sale Badge */}
                {product.originalPrice && !product.badge && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    SALE
                  </span>
                )}
                {product.originalPrice && product.badge && (
                  <span className="absolute top-11 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    SALE
                  </span>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product); }}
                  className="absolute top-4 right-4 w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <i className={`${isFavorite(product.id as unknown as number) ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-500 dark:text-gray-300'} text-base`}></i>
                </button>

                {/* Discount Tag */}
                {product.originalPrice && (
                  <div className="absolute bottom-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Info Area */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
                  <h3
                    className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer leading-snug"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.rating !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`ri-star-${i < Math.floor(product.rating!) ? 'fill' : 'line'} text-yellow-400 text-sm`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-sm text-gray-400 dark:text-gray-500">{product.rating} ({product.reviewCount ?? 0} reviews)</span>
                    </div>
                  )}

                  {/* Color Swatches */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1.5 mt-3">
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

                {/* Price + Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap text-sm font-medium flex items-center gap-1"
                    >
                      <i className="ri-eye-line text-sm"></i>
                      Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingItems[product.id]}
                      className={`w-10 h-10 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center ${
                        addingItems[product.id]
                          ? 'bg-teal-500 text-white animate-pulse'
                          : 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900'
                      }`}
                    >
                      <i className={`${addingItems[product.id] ? 'ri-check-line' : 'ri-shopping-cart-line'} text-base`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/shop?filter=new-arrivals')}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            View All New Arrivals
            {hiddenCount > 0 && (
              <span className="bg-teal-500 text-white dark:text-white text-xs font-bold px-2 py-0.5 rounded-full">
                +{hiddenCount} more
              </span>
            )}
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsSection;
