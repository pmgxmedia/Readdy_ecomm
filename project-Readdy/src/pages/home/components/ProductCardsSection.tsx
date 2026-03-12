import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import { useRef, useState, useEffect } from 'react';

const SWIPE_HINT_KEY = 'promo_swipe_hint_shown';

const ProductCardsSection = () => {
  const { promotionalProducts } = useAdminStore();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [hintAnimating, setHintAnimating] = useState(false);

  const products = promotionalProducts.slice(0, 3).map((p, idx) => ({
    id: p.id,
    title: p.name,
    subtitle: p.category,
    image: p.image,
    bgColor: idx === 0
      ? 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20'
      : idx === 1
      ? 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20'
      : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20',
  }));

  const handleCardClick = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement;
    if (card) {
      container.scrollTo({ left: card.offsetLeft - container.offsetLeft, behavior: 'smooth' });
    }
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const prev = Math.max(activeIndex - 1, 0);
    scrollToIndex(prev);
  };

  const handleNext = () => {
    const next = Math.min(activeIndex + 1, products.length - 1);
    scrollToIndex(next);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = (container.children[0] as HTMLElement)?.offsetWidth ?? 0;
      const gap = 16;
      const idx = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(Math.max(idx, 0), products.length - 1));
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [products.length]);

  // Swipe hint: only on mobile, only once
  useEffect(() => {
    const alreadyShown = localStorage.getItem(SWIPE_HINT_KEY);
    if (alreadyShown) return;

    // Only run on mobile widths
    if (window.innerWidth >= 1024) return;

    const timer = setTimeout(() => {
      setShowSwipeHint(true);
      setHintAnimating(true);

      // Animate the scroll container slightly to the right then back
      const container = scrollRef.current;
      if (container) {
        container.scrollTo({ left: 60, behavior: 'smooth' });
        setTimeout(() => {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        }, 600);
      }

      // Hide hint overlay after animation
      setTimeout(() => {
        setHintAnimating(false);
        setTimeout(() => setShowSwipeHint(false), 400);
        localStorage.setItem(SWIPE_HINT_KEY, 'true');
      }, 1400);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wrapper with relative for swipe hint overlay */}
        <div className="relative">
          {/* Mobile: horizontal scroll | Desktop: grid */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0"
          >
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleCardClick(product.subtitle)}
                className={`${product.bgColor} rounded-xl p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer flex-shrink-0 w-72 sm:w-80 snap-start lg:w-auto`}
              >
                <div className="relative z-10 text-center space-y-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center justify-center gap-1">
                      {product.subtitle}
                      <span className="inline-flex items-center justify-center w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <i className="ri-arrow-right-line text-xs text-gray-500 dark:text-gray-400" />
                      </span>
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex justify-center">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-full backdrop-blur-sm">
                    Shop {product.subtitle} →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Swipe hint overlay — mobile only, first visit only */}
          {showSwipeHint && (
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none lg:hidden transition-opacity duration-400 ${
                hintAnimating ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex flex-col items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-lg">
                {/* Animated swipe hand icon */}
                <div className="flex items-center gap-1">
                  <i
                    className="ri-arrow-left-line text-lg"
                    style={{
                      animation: hintAnimating
                        ? 'swipeArrowLeft 0.7s ease-in-out infinite alternate'
                        : 'none',
                    }}
                  />
                  <span className="inline-flex items-center justify-center w-8 h-8">
                    <i
                      className="ri-drag-move-2-line text-2xl"
                      style={{
                        animation: hintAnimating
                          ? 'swipeHandMove 0.7s ease-in-out infinite alternate'
                          : 'none',
                        display: 'inline-block',
                      }}
                    />
                  </span>
                  <i
                    className="ri-arrow-right-line text-lg"
                    style={{
                      animation: hintAnimating
                        ? 'swipeArrowRight 0.7s ease-in-out infinite alternate'
                        : 'none',
                    }}
                  />
                </div>
                <span className="text-xs font-medium tracking-wide opacity-90">Swipe to explore</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile scroll controls — hidden on desktop */}
        <div className="flex items-center justify-center gap-4 mt-4 lg:hidden">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-30 transition-opacity cursor-pointer"
            aria-label="Previous"
          >
            <i className="ri-arrow-left-s-line text-lg" />
          </button>

          <div className="flex items-center gap-2">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex
                    ? 'w-5 h-2 bg-gray-800 dark:bg-white'
                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={activeIndex === products.length - 1}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-30 transition-opacity cursor-pointer"
            aria-label="Next"
          >
            <i className="ri-arrow-right-s-line text-lg" />
          </button>
        </div>
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes swipeHandMove {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(-12px); }
        }
        @keyframes swipeArrowLeft {
          0%   { opacity: 0.4; transform: translateX(0px); }
          100% { opacity: 1;   transform: translateX(-4px); }
        }
        @keyframes swipeArrowRight {
          0%   { opacity: 1;   transform: translateX(0px); }
          100% { opacity: 0.4; transform: translateX(4px); }
        }
      `}</style>
    </section>
  );
};

export default ProductCardsSection;
