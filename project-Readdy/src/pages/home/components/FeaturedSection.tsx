import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

const FeaturedSection = () => {
  const { addToCart } = useCart();
  const { featuredProduct } = useAdminStore();
  const { currency } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);

  if (!featuredProduct) return null;

  const formatPrice = (price: number) => {
    if (currency.code === 'JPY') return `${currency.symbol}${Math.round(price * 110)}`;
    return `${currency.symbol}${price.toFixed(2)}`;
  };

  const discount = featuredProduct.originalPrice
    ? Math.round(((featuredProduct.originalPrice - featuredProduct.price) / featuredProduct.originalPrice) * 100)
    : 0;

  const savings = featuredProduct.originalPrice
    ? featuredProduct.originalPrice - featuredProduct.price
    : 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      id: featuredProduct.id as unknown as number,
      name: featuredProduct.name,
      price: featuredProduct.price,
      image: featuredProduct.image,
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="p-12 lg:p-16 space-y-8">
              <div className="inline-flex items-center bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full px-4 py-2 text-sm font-semibold">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span>
                Featured Product
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">{featuredProduct.name}</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">{featuredProduct.category}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(featuredProduct.price)}</span>
                  {featuredProduct.originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 dark:text-gray-400 line-through">{formatPrice(featuredProduct.originalPrice)}</span>
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    You save {formatPrice(savings)}!
                  </p>
                )}
                {featuredProduct.stock !== undefined && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <i className="ri-store-line mr-1"></i>
                    {featuredProduct.stock} units in stock
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 active:scale-95 hover:shadow-lg ${
                    isAdding ? 'bg-teal-500 text-white animate-pulse' : 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900'
                  }`}
                >
                  {isAdding ? (
                    <span className="flex items-center gap-2">
                      <i className="ri-check-line"></i>Added to Cart!
                    </span>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
                <Link
                  to={`/product/${featuredProduct.id}`}
                  className="px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all duration-300 cursor-pointer whitespace-nowrap text-center transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-eye-line"></i>View Details
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Content - Product Image */}
            <div className="relative p-8 lg:p-12 bg-gray-50 dark:bg-gray-700">
              <img
                src={featuredProduct.image}
                alt={featuredProduct.name}
                className="w-full h-auto object-contain max-h-96"
              />
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm">
                  <div className="text-center">
                    <div className="text-xs">SAVE</div>
                    <div>{discount}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
