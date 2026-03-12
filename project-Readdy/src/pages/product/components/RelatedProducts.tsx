import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating?: number;
  reviewCount?: number;
}

interface RelatedProductsProps {
  products: Product[];
  currentId: string;
}

const RelatedProducts = ({ products, currentId }: RelatedProductsProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const related = products.filter((p) => p.id !== currentId).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-20 border-t border-gray-100 dark:border-gray-700 pt-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">You May Also Like</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((product) => {
          const numericId = parseInt(product.id.replace(/\D/g, '')) || 0;
          return (
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 aspect-square flex items-center justify-center p-6 group-hover:shadow-lg transition-shadow duration-300">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{product.name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ id: numericId, name: product.name, price: product.price, image: product.image });
                  }}
                  className="w-8 h-8 bg-gray-900 dark:bg-teal-600 hover:bg-gray-700 dark:hover:bg-teal-500 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  <i className="ri-shopping-cart-line text-sm"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProducts;
