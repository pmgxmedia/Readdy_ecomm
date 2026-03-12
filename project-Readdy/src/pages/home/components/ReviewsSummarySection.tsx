import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAdminStore } from '../../../contexts/AdminStoreContext';

interface TopProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  avgRating: number;
  reviewCount: number;
  topReview: {
    author_name: string;
    comment: string;
    rating: number;
  } | null;
}

const StarDisplay = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const cls = size === 'md' ? 'text-base' : 'text-xs';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={`${cls} ${
            s <= Math.round(rating) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const ReviewsSummarySection = () => {
  const { recommendedProducts, popularProducts, promotionalProducts } = useAdminStore();
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [overallStats, setOverallStats] = useState({ total: 0, avg: 0, fiveStar: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      try {
        const { data: reviews, error } = await supabase
          .from('product_reviews')
          .select('id, product_id, author_name, rating, comment, created_at')
          .order('created_at', { ascending: false });

        if (error || !reviews || reviews.length === 0) {
          setLoading(false);
          return;
        }

        // Overall stats
        const total = reviews.length;
        const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
        const fiveStar = reviews.filter((r) => r.rating === 5).length;
        setOverallStats({ total, avg: Math.round(avg * 10) / 10, fiveStar });

        // Group by product
        const grouped: Record<string, typeof reviews> = {};
        for (const r of reviews) {
          if (!grouped[r.product_id]) grouped[r.product_id] = [];
          grouped[r.product_id].push(r);
        }

        // All known products pool
        const allProducts = [
          ...recommendedProducts,
          ...popularProducts,
          ...promotionalProducts,
        ];
        const seen = new Set<string>();
        const uniqueProducts = allProducts.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        // Build top products list (only those with real reviews)
        const ranked: TopProduct[] = Object.entries(grouped)
          .map(([pid, pReviews]) => {
            const avgR = pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length;
            const topReview = pReviews.find((r) => r.rating >= 4) || pReviews[0];
            const meta = uniqueProducts.find((p) => p.id === pid);
            return {
              id: pid,
              name: meta?.name ?? `Product ${pid}`,
              image: meta?.image ?? '',
              category: meta?.category ?? '',
              avgRating: Math.round(avgR * 10) / 10,
              reviewCount: pReviews.length,
              topReview: topReview
                ? { author_name: topReview.author_name, comment: topReview.comment, rating: topReview.rating }
                : null,
            };
          })
          .filter((p) => p.reviewCount >= 1)
          .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
          .slice(0, 3);

        setTopProducts(ranked);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [recommendedProducts, popularProducts, promotionalProducts]);

  // Don't render if no reviews at all
  if (!loading && topProducts.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <i className="ri-star-fill text-amber-500"></i>
            Verified Customer Reviews
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Real reviews from real buyers — discover the products our community loves most.
          </p>
        </div>

        {/* Overall Stats Bar */}
        {!loading && overallStats.total > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-14">
            {[
              {
                icon: 'ri-chat-smile-3-line',
                value: overallStats.total.toLocaleString(),
                label: 'Total Reviews',
                color: 'text-teal-600 dark:text-teal-400',
                bg: 'bg-teal-50 dark:bg-teal-900/30',
              },
              {
                icon: 'ri-star-fill',
                value: overallStats.avg.toFixed(1),
                label: 'Average Rating',
                color: 'text-amber-500 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-900/30',
              },
              {
                icon: 'ri-thumb-up-line',
                value: `${Math.round((overallStats.fiveStar / overallStats.total) * 100)}%`,
                label: '5-Star Reviews',
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-900/30',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <i className={`${stat.icon} text-2xl ${stat.color}`}></i>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Rated Product Cards */}
        {!loading && topProducts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {topProducts.map((product, idx) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                {/* Top badge */}
                {idx === 0 && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
                    <i className="ri-trophy-fill"></i>
                    Top Rated Product
                  </div>
                )}

                {/* Product info */}
                <div className="p-6 flex items-center gap-4 border-b border-gray-50 dark:border-gray-700">
                  {product.image ? (
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-headphone-line text-2xl text-gray-400 dark:text-gray-500"></i>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">{product.category}</p>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StarDisplay rating={product.avgRating} />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{product.avgRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">({product.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Top review quote */}
                {product.topReview && (
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <i className="ri-double-quotes-l text-3xl text-amber-200 dark:text-amber-700 leading-none block mb-2"></i>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                        {product.topReview.comment}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">
                            {product.topReview.author_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{product.topReview.author_name}</span>
                      </div>
                      <StarDisplay rating={product.topReview.rating} />
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="px-6 pb-6">
                  <Link
                    to={`/product/${product.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold py-2.5 rounded-xl transition-colors duration-200 cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-eye-line"></i>
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-8 py-3.5 rounded-xl font-semibold text-sm transition-colors duration-200 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-store-2-line"></i>
            Browse All Products
          </Link>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Reviews update automatically as customers submit them
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSummarySection;
