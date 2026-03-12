import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../contexts/AdminStoreContext';

const CategorySection = () => {
  const navigate = useNavigate();
  const { storeCategories } = useAdminStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [storeCategories]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  const showArrows = storeCategories.length > 6;

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-7 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Shop by Category</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Browse our curated collections — find exactly what you&apos;re looking for across all product categories.
          </p>
        </div>

        <div className="relative" data-product-shop>
          {/* Left Arrow */}
          {showArrows && (
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 cursor-pointer whitespace-nowrap
                ${canScrollLeft ? 'opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
            >
              <i className="ri-arrow-left-s-line text-gray-700 dark:text-gray-200 text-lg sm:text-xl" />
            </button>
          )}

          {/* Scrollable Row */}
          <div
            ref={scrollRef}
            className={`flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-2 ${showArrows ? 'px-2' : 'justify-center flex-wrap'}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {storeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                className="group cursor-pointer flex flex-col items-center text-center flex-shrink-0"
                style={{ minWidth: '72px' }}
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md mb-2 sm:mb-3 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2 max-w-[90px] sm:max-w-[120px] hidden sm:block">
                    {cat.description}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          {showArrows && (
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 cursor-pointer whitespace-nowrap
                ${canScrollRight ? 'opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
            >
              <i className="ri-arrow-right-s-line text-gray-700 dark:text-gray-200 text-lg sm:text-xl" />
            </button>
          )}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <button
            onClick={() => {
              navigate('/shop');
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
