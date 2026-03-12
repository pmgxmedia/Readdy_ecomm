import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../../contexts/CurrencyContext';

export interface CompareProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  stock?: number;
}

interface CompareBarProps {
  products: CompareProduct[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

const CompareBar = ({ products, onRemove, onClear, onCompare }: CompareBarProps) => {
  const { formatPrice } = useCurrency();

  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl animate-[slideUp_0.3s_ease-out]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          {/* Label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-lg">
              <i className="ri-bar-chart-horizontal-line text-white text-sm"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">Compare</p>
              <p className="text-xs text-gray-400">{products.length}/3 selected</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-200 flex-shrink-0"></div>

          {/* Product Slots */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-shrink-0 border border-gray-100"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                </div>
                <div className="max-w-[120px]">
                  <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{p.name}</p>
                  <p className="text-xs text-teal-600 font-medium">{formatPrice(p.price)}</p>
                </div>
                <button
                  onClick={() => onRemove(p.id)}
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-400 transition-colors cursor-pointer flex-shrink-0 ml-1"
                >
                  <i className="ri-close-line text-xs"></i>
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - products.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center w-36 h-14 rounded-xl border-2 border-dashed border-gray-200 flex-shrink-0"
              >
                <p className="text-xs text-gray-300 font-medium">+ Add product</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClear}
              className="px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear all
            </button>
            <button
              onClick={onCompare}
              disabled={products.length < 2}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                products.length >= 2
                  ? 'bg-gray-900 text-white hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <i className="ri-bar-chart-horizontal-line text-sm"></i>
              Compare Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
