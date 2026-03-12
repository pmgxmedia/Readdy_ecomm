import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useFavorites } from '../../../hooks/useFavorites';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

const RecommendedSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { recommendedProducts } = useAdminStore();
  const { currency } = useCurrency();
  const [addingItems, setAddingItems] = useState<{ [key: string]: boolean }>({});

  const formatPrice = (price: number) => {
    if (currency.code === 'JPY') return `${currency.symbol}${Math.round(price * 110)}`;
    return `${currency.symbol}${price.toFixed(2)}`;
  };

  const handleAddToCart = (product: typeof recommendedProducts[0]) => {
    setAddingItems((prev) => ({ ...prev, [product.id]: true }));
    addToCart({ id: product.id as unknown as number, name: product.name, price: product.price, image: product.image });
    setTimeout(() => setAddingItems((prev) => ({ ...prev, [product.id]: false })), 1000);
  };

  const handleToggleFavorite = (product: typeof recommendedProducts[0]) => {
    if (isFavorite(product.id as unknown as number)) {
      removeFromFavorites(product.id as unknown as number);
    } else {
      addToFavorites({ id: product.id as unknown as number, name: product.name, price: formatPrice(product.price), image: product.image });
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Highly Recommended</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Browse our top picks — the best products our customers love most, with great reviews and unbeatable discounts.
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="hidden lg:block bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-product-shop>
          {recommendedProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div
                className="relative bg-gray-50 dark:bg-gray-700 p-6 cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                )}
                {product.originalPrice && !product.isNew && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">SALE</span>
                )}
                {product.originalPrice && product.isNew && (
                  <span className="absolute top-11 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">SALE</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product); }}
                  className="absolute top-4 right-4 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <i className={`${isFavorite(product.id as unknown as number) ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-600 dark:text-gray-300'}`}></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3
                    className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  {product.rating && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`ri-star-${i < Math.floor(product.rating!) ? 'fill' : 'line'} text-yellow-400 text-sm`}></i>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{product.rating} ({product.reviewCount})</span>
                    </div>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {product.colors.map((color) => (
                        <div key={color} className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: color }}></div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                        addingItems[product.id] ? 'bg-teal-500 text-white animate-pulse' : 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900'
                      }`}
                    >
                      <i className={`${addingItems[product.id] ? 'ri-check-line' : 'ri-shopping-cart-line'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:hidden text-center mt-8">
          <button onClick={() => navigate('/shop')} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecommendedSection;
