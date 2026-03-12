import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

interface Review {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewSectionProps {
  productId: string;
  productName: string;
}

const StarRatingInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="w-8 h-8 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
        >
          <i
            className={`text-2xl ${
              star <= (hovered || value)
                ? 'ri-star-fill text-amber-400'
                : 'ri-star-line text-gray-300'
            }`}
          ></i>
        </button>
      ))}
    </div>
  );
};

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const ReviewSection = ({ productId, productName }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    author_name: '',
    rating: 0,
    comment: '',
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!fetchError && data) setReviews(data);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.author_name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (form.rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (form.comment.trim().length < 10) {
      setError('Review must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from('product_reviews').insert({
      product_id: productId,
      author_name: form.author_name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
    });

    if (insertError) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    setForm({ author_name: '', rating: 0, comment: '' });
    setShowForm(false);
    fetchReviews();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="mt-12 border-t border-gray-100 dark:border-gray-700 pt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {reviews.length > 0
              ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''} for ${productName}`
              : `Be the first to review ${productName}`}
          </p>
        </div>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gray-900 dark:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 dark:hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-edit-line"></i>
            Write a Review
          </button>
        )}
        {submitted && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-semibold">
            <i className="ri-check-line"></i>
            Review submitted!
          </div>
        )}
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8">
          {/* Average */}
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <i
                  key={s}
                  className={`text-base ${
                    s <= Math.round(avgRating) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300 dark:text-gray-600'
                  }`}
                ></i>
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{reviews.length} reviews</span>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-2">
            {ratingCounts.map(({ star, count }) => {
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-4 text-right">{star}</span>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-star-fill text-amber-400 text-xs"></i>
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Write Your Review</h3>
            <button
              onClick={() => { setShowForm(false); setError(''); }}
              className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.author_name}
                onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                placeholder="e.g. Sarah M."
                maxLength={60}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 transition-colors"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <StarRatingInput
                  value={form.rating}
                  onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                />
                {form.rating > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{RATING_LABELS[form.rating]}</span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.comment}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setForm((f) => ({ ...f, comment: e.target.value }));
                  }
                }}
                placeholder="Share your experience with this product..."
                rows={4}
                maxLength={500}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 transition-colors resize-none"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">{form.comment.length}/500</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-xl px-4 py-2.5 text-sm">
                <i className="ri-error-warning-line"></i>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gray-900 dark:bg-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 dark:hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line"></i>
                    Submit Review
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); }}
                className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-chat-3-line text-2xl text-gray-400 dark:text-gray-500"></i>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No reviews yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Be the first to share your thoughts!</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm font-semibold text-gray-900 dark:text-teal-400 underline underline-offset-2 cursor-pointer hover:text-gray-600 dark:hover:text-teal-300 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {review.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.author_name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i
                          key={s}
                          className={`text-xs ${
                            s <= review.rating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300 dark:text-gray-600'
                          }`}
                        ></i>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formatDate(review.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
