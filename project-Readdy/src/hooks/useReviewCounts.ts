import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ReviewSummary {
  reviewCount: number;
  avgRating: number;
}

type ReviewCountMap = Record<string, ReviewSummary>;

export function useReviewCounts(productIds: string[]) {
  const [reviewMap, setReviewMap] = useState<ReviewCountMap>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productIds.length === 0) return;

    let cancelled = false;

    const fetchCounts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('product_id, rating')
          .in('product_id', productIds);

        if (error || !data || cancelled) return;

        const map: ReviewCountMap = {};
        for (const row of data) {
          if (!map[row.product_id]) {
            map[row.product_id] = { reviewCount: 0, avgRating: 0 };
          }
          map[row.product_id].reviewCount += 1;
          map[row.product_id].avgRating += row.rating;
        }
        // Compute averages
        for (const pid of Object.keys(map)) {
          map[pid].avgRating = Math.round((map[pid].avgRating / map[pid].reviewCount) * 10) / 10;
        }

        setReviewMap(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCounts();
    return () => { cancelled = true; };
  }, [productIds.join(',')]);

  return { reviewMap, loading };
}
