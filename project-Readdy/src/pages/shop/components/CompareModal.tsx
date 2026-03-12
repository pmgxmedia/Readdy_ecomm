import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useCurrency } from '../../../contexts/CurrencyContext';
import type { CompareProduct } from './CompareBar';

interface CompareModalProps {
  products: CompareProduct[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

const SPEC_ROWS = [
  { label: 'Category', key: 'category' },
  { label: 'Price', key: 'price' },
  { label: 'Original Price', key: 'originalPrice' },
  { label: 'Discount', key: 'discount' },
  { label: 'Rating', key: 'rating' },
  { label: 'Reviews', key: 'reviewCount' },
  { label: 'Availability', key: 'stock' },
  { label: 'Colors', key: 'colors' },
  { label: 'Driver Size', key: 'driver' },
  { label: 'Frequency', key: 'frequency' },
  { label: 'Connectivity', key: 'connectivity' },
  { label: 'Battery Life', key: 'battery' },
  { label: 'Weight', key: 'weight' },
  { label: 'Warranty', key: 'warranty' },
];

const STATIC_SPECS: Record<string, string> = {
  driver: '40mm',
  frequency: '20Hz – 20kHz',
  connectivity: 'Bluetooth 5.3',
  battery: 'Up to 30 hours',
  weight: '250g',
  warranty: '2 Years',
};

const CompareModal = ({ products, onClose, onRemove }: CompareModalProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getCellValue = (product: CompareProduct, key: string): { display: string | JSX.Element; raw: number | string } => {
    switch (key) {
      case 'category':
        return { display: product.category, raw: product.category };
      case 'price':
        return { display: <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>, raw: product.price };
      case 'originalPrice':
        return {
          display: product.originalPrice
            ? <span className="line-through text-gray-400">{formatPrice(product.originalPrice)}</span>
            : <span className="text-gray-300">—</span>,
          raw: product.originalPrice ?? 0,
        };
      case 'discount':
        if (!product.originalPrice) return { display: <span className="text-gray-300">—</span>, raw: 0 };
        const pct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        return {
          display: <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">-{pct}%</span>,
          raw: pct,
        };
      case 'rating':
        if (!product.rating) return { display: <span className="text-gray-300">—</span>, raw: 0 };
        return {
          display: (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`text-xs ${i < Math.floor(product.rating!) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'}`}></i>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-800">{product.rating.toFixed(1)}</span>
            </div>
          ),
          raw: product.rating,
        };
      case 'reviewCount':
        return {
          display: product.reviewCount
            ? <span className="font-medium text-gray-700">{product.reviewCount.toLocaleString()}</span>
            : <span className="text-gray-300">—</span>,
          raw: product.reviewCount ?? 0,
        };
      case 'stock':
        const inStock = (product.stock ?? 99) > 0;
        const low = (product.stock ?? 99) <= 10 && inStock;
        return {
          display: (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              !inStock ? 'bg-red-50 text-red-600' : low ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${!inStock ? 'bg-red-500' : low ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              {!inStock ? 'Out of Stock' : low ? `Only ${product.stock} left` : 'In Stock'}
            </span>
          ),
          raw: product.stock ?? 99,
        };
      case 'colors':
        if (!product.colors || product.colors.length === 0)
          return { display: <span className="text-gray-300">—</span>, raw: 0 };
        return {
          display: (
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.colors.map((c) => (
                <div key={c} className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: c }} title={c}></div>
              ))}
              <span className="text-xs text-gray-500">{product.colors.length} color{product.colors.length !== 1 ? 's' : ''}</span>
            </div>
          ),
          raw: product.colors.length,
        };
      default:
        return { display: <span className="text-gray-600">{STATIC_SPECS[key] ?? '—'}</span>, raw: STATIC_SPECS[key] ?? '' };
    }
  };

  // Determine best value for numeric comparisons
  const getBestIds = (key: string): string[] => {
    const numericKeys = ['price', 'rating', 'reviewCount', 'stock', 'discount'];
    if (!numericKeys.includes(key)) return [];
    const values = products.map(p => ({ id: p.id, raw: getCellValue(p, key).raw as number }));
    const best = key === 'price'
      ? Math.min(...values.map(v => v.raw))
      : Math.max(...values.map(v => v.raw));
    return values.filter(v => v.raw === best && v.raw > 0).map(v => v.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col animate-[fadeInScale_0.25s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-gray-900 rounded-xl">
              <i className="ri-bar-chart-horizontal-line text-white text-base"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Product Comparison</h2>
              <p className="text-xs text-gray-400">Comparing {products.length} products side by side</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                {/* Row label column */}
                <th className="w-36 min-w-[144px] bg-gray-50 border-b border-r border-gray-100 px-4 py-3 text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Spec</span>
                </th>
                {products.map((p) => (
                  <th key={p.id} className="min-w-[200px] border-b border-r border-gray-100 last:border-r-0 px-4 py-3 bg-white">
                    <div className="flex flex-col items-center gap-3">
                      {/* Remove button */}
                      <button
                        onClick={() => onRemove(p.id)}
                        className="self-end w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-400 transition-colors cursor-pointer"
                      >
                        <i className="ri-close-line text-xs"></i>
                      </button>
                      {/* Product image */}
                      <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                      </div>
                      {/* Product name */}
                      <div className="text-center">
                        <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider mb-0.5">{p.category}</p>
                        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{p.name}</p>
                      </div>
                      {/* CTA */}
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => {
                            const numId = parseInt(p.id.replace(/\D/g, '')) || 0;
                            addToCart({ id: numId, name: p.name, price: p.price, image: p.image });
                          }}
                          className="flex-1 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1"
                        >
                          <i className="ri-shopping-cart-line text-xs"></i>
                          Add to Cart
                        </button>
                        <button
                          onClick={() => { onClose(); navigate(`/product/${p.id}`); }}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-external-link-line text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                {/* Empty placeholder columns */}
                {Array.from({ length: 3 - products.length }).map((_, i) => (
                  <th key={`ph-${i}`} className="min-w-[200px] border-b border-r border-gray-100 last:border-r-0 px-4 py-3 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center h-40 gap-2">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-dashed border-gray-200">
                        <i className="ri-add-line text-gray-300 text-xl"></i>
                      </div>
                      <p className="text-xs text-gray-300 font-medium">No product</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {SPEC_ROWS.map((row, rowIdx) => {
                const bestIds = getBestIds(row.key);
                return (
                  <tr key={row.key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                    {/* Label */}
                    <td className="border-r border-gray-100 px-4 py-3.5 bg-gray-50">
                      <span className="text-xs font-semibold text-gray-500">{row.label}</span>
                    </td>
                    {/* Product cells */}
                    {products.map((p) => {
                      const isBest = bestIds.includes(p.id);
                      return (
                        <td
                          key={p.id}
                          className={`border-r border-gray-100 last:border-r-0 px-4 py-3.5 text-sm text-center ${
                            isBest ? 'bg-teal-50/60' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            {getCellValue(p, row.key).display}
                            {isBest && (
                              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-teal-500 flex-shrink-0" title="Best value">
                                <i className="ri-check-line text-white text-xs"></i>
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    {/* Empty placeholder cells */}
                    {Array.from({ length: 3 - products.length }).map((_, i) => (
                      <td key={`ph-${i}`} className="border-r border-gray-100 last:border-r-0 px-4 py-3.5 bg-gray-50/30">
                        <div className="flex items-center justify-center">
                          <span className="text-gray-200 text-sm">—</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-teal-500 flex-shrink-0">
              <i className="ri-check-line text-white text-xs"></i>
            </span>
            Highlighted cells indicate the best value in that category
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
