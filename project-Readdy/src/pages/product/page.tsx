import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import ProductImages from './components/ProductImages';
import ProductInfo from './components/ProductInfo';
import RelatedProducts from './components/RelatedProducts';
import ReviewSection from './components/ReviewSection';
import { useAdminStore } from '../../contexts/AdminStoreContext';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  isNew?: boolean;
  stock?: number;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { popularProducts, recommendedProducts, promotionalProducts, featuredProduct } = useAdminStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const combined: Product[] = [
      ...popularProducts,
      ...recommendedProducts,
      ...promotionalProducts,
      ...(featuredProduct ? [featuredProduct] : []),
    ];
    setAllProducts(combined);

    const found = combined.find(
      (p) => p.id === id || p.id.replace(/\D/g, '') === id
    );
    setProduct(found ?? null);
  }, [id, popularProducts, recommendedProducts, promotionalProducts, featuredProduct]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-search-line text-3xl text-gray-400 dark:text-gray-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Product Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-gray-900 dark:bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            Back to Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Home</Link>
          <i className="ri-arrow-right-s-line text-gray-300 dark:text-gray-600"></i>
          <Link to="/shop" className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Shop</Link>
          <i className="ri-arrow-right-s-line text-gray-300 dark:text-gray-600"></i>
          <span className="text-gray-400 dark:text-gray-500">{product.category}</span>
          <i className="ri-arrow-right-s-line text-gray-300 dark:text-gray-600"></i>
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Images */}
          <div className="lg:sticky lg:top-24 self-start">
            <ProductImages image={product.image} name={product.name} />
          </div>

          {/* Right: Info */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={product.id} productName={product.name} />

        {/* Related Products */}
        <RelatedProducts products={allProducts} currentId={product.id} />
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
