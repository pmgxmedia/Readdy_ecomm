import { useState, useEffect, useRef } from 'react';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import Skeleton, { SkeletonProductRow } from '../../../components/base/Skeleton';

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
  badge?: string;
}

const BADGE_OPTIONS = ['Just Dropped', 'New', "Editor's Pick", 'Trending', 'Hot', 'Sale'];
const BADGE_COLORS: Record<string, string> = {
  'Just Dropped': 'bg-teal-500 text-white',
  'New': 'bg-emerald-500 text-white',
  "Editor's Pick": 'bg-amber-500 text-white',
  'Trending': 'bg-rose-500 text-white',
  'Hot': 'bg-orange-500 text-white',
  'Sale': 'bg-red-500 text-white',
};

const NewArrivalsPage = () => {
  const { newArrivalsProducts = [], setNewArrivalsProducts, newArrivalsMaxProducts, setNewArrivalsMaxProducts, settingsLoading } = useAdminStore();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>(newArrivalsProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [maxInput, setMaxInput] = useState<number>(newArrivalsMaxProducts);

  // Image upload state (single edit)
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk image upload state
  const [showBulkImageModal, setShowBulkImageModal] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<{ file: File; preview: string; productId: string | null; assigned: boolean }[]>([]);
  const [bulkDragOver, setBulkDragOver] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Image preview tooltip
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const categories = ['Over-Ear Headphones', 'True Wireless Earbuds', 'Studio Headphones', 'Sport Earbuds', 'Foldable Headphones', 'Noise Cancelling', 'Accessories'];

  useEffect(() => {
    setProducts(newArrivalsProducts);
  }, [newArrivalsProducts]);

  useEffect(() => {
    setMaxInput(newArrivalsMaxProducts);
  }, [newArrivalsMaxProducts]);

  const triggerSave = () => {
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const persist = (updated: Product[]) => {
    setProducts(updated);
    setNewArrivalsProducts(updated);
    triggerSave();
  };

  const handleSaveMax = () => {
    const clamped = Math.max(1, Math.min(50, maxInput));
    setMaxInput(clamped);
    setNewArrivalsMaxProducts(clamped);
    triggerSave();
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  // ── Bulk selection ─────────────────────────────────────────────────────────
  const allSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id));
  const someSelected = filteredProducts.some(p => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      filteredProducts.forEach(p => next.delete(p.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredProducts.forEach(p => next.add(p.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    persist(products.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setShowBulkDeleteConfirm(false);
  };

  // ── Single edit ────────────────────────────────────────────────────────────
  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setImageTab('upload');
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    persist(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    persist(products.filter(p => p.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `new-${Date.now()}`,
      name: 'New Arrival Product',
      price: 199,
      originalPrice: 249,
      category: categories[0],
      image: 'https://readdy.ai/api/search-image?query=modern%20premium%20audio%20headphones%20sleek%20minimalist%20design%20floating%20on%20clean%20white%20background%20professional%20product%20photography%20high%20quality&width=500&height=500&seq=new-add-' + Date.now() + '&orientation=squarish',
      rating: 4.5,
      reviewCount: 0,
      badge: 'New',
      isNew: true,
      stock: 50,
    };
    persist([...products, newProduct]);
  };

  // ── Single image upload ────────────────────────────────────────────────────
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && editingProduct) {
        setEditingProduct(prev => prev ? { ...prev, image: result } : prev);
      }
      setImageUploading(false);
    };
    reader.onerror = () => setImageUploading(false);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setImageDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  // ── Bulk image upload ──────────────────────────────────────────────────────
  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const processBulkFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newEntries = await Promise.all(
      imageFiles.map(async (file) => ({
        file,
        preview: await readFileAsDataURL(file),
        productId: null as string | null,
        assigned: false,
      }))
    );
    setBulkFiles(prev => [...prev, ...newEntries]);
  };

  const handleBulkFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await processBulkFiles(e.target.files);
    e.target.value = '';
  };

  const handleBulkDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setBulkDragOver(false);
    if (e.dataTransfer.files) await processBulkFiles(e.dataTransfer.files);
  };

  const assignBulkImage = (fileIndex: number, productId: string) => {
    setBulkFiles(prev =>
      prev.map((entry, i) =>
        i === fileIndex ? { ...entry, productId, assigned: !!productId } : entry
      )
    );
  };

  const removeBulkFile = (index: number) => {
    setBulkFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkApply = async () => {
    const toApply = bulkFiles.filter(f => f.productId);
    if (toApply.length === 0) return;

    setBulkUploading(true);
    setBulkUploadProgress(0);

    let updated = [...products];
    for (let i = 0; i < toApply.length; i++) {
      const { preview, productId } = toApply[i];
      updated = updated.map(p => p.id === productId ? { ...p, image: preview } : p);
      setBulkUploadProgress(Math.round(((i + 1) / toApply.length) * 100));
      await new Promise(r => setTimeout(r, 80));
    }

    setBulkUploading(false);
    persist(updated);
    setBulkFiles([]);
    setShowBulkImageModal(false);
  };

  const autoAssignBulkImages = () => {
    const unassignedProducts = products.filter(p => !bulkFiles.some(f => f.productId === p.id));
    setBulkFiles(prev =>
      prev.map((entry, i) => {
        if (entry.assigned) return entry;
        const product = unassignedProducts[i];
        return product ? { ...entry, productId: product.id, assigned: true } : entry;
      })
    );
  };

  // ── Image preview tooltip ──────────────────────────────────────────────────
  const handleImageMouseEnter = (e: React.MouseEvent<HTMLDivElement>, product: Product) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setPreviewProduct(product);
    setPreviewPos({ x: rect.right + 12, y: rect.top });
  };

  if (settingsLoading) {
    return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-56 mb-3" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonProductRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h1>
          <p className="text-gray-600">Manage products shown in the New Arrivals section on the homepage</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setBulkFiles([]); setShowBulkImageModal(true); }}
            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-image-add-line"></i>
            Bulk Upload Images
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Add Product
          </button>
        </div>
      </div>

      {/* Save Confirmation */}
      {showSaveConfirm && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="ri-check-circle-fill text-2xl text-green-600"></i>
          <div>
            <p className="font-semibold text-green-900">Changes Saved!</p>
            <p className="text-sm text-green-700">New Arrivals have been updated</p>
          </div>
        </div>
      )}

      {/* ── Display Limit Setting ─────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-teal-50 rounded-lg flex-shrink-0">
              <i className="ri-layout-grid-line text-teal-600 text-lg"></i>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Max Products Shown on Homepage</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Only the first <span className="font-semibold text-gray-700">{newArrivalsMaxProducts}</span> products will appear in the New Arrivals section.
                {products.length > newArrivalsMaxProducts && (
                  <span className="ml-1 text-teal-600 font-medium">
                    {products.length - newArrivalsMaxProducts} product{products.length - newArrivalsMaxProducts > 1 ? 's' : ''} hidden — visible via "View All".
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setMaxInput(v => Math.max(1, v - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer border-r border-gray-300"
              >
                <i className="ri-subtract-line text-sm"></i>
              </button>
              <input
                type="number"
                min={1}
                max={50}
                value={maxInput}
                onChange={(e) => setMaxInput(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-14 text-center text-sm font-semibold text-gray-900 py-2 focus:outline-none"
              />
              <button
                onClick={() => setMaxInput(v => Math.min(50, v + 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer border-l border-gray-300"
              >
                <i className="ri-add-line text-sm"></i>
              </button>
            </div>
            <button
              onClick={handleSaveMax}
              disabled={maxInput === newArrivalsMaxProducts}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i className="ri-save-line text-sm"></i>
              Apply
            </button>
          </div>
        </div>

        {/* Visual indicator bar */}
        {products.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-gray-500">Visibility</span>
              <span className="text-xs font-semibold text-gray-700">
                {Math.min(newArrivalsMaxProducts, products.length)} / {products.length} products shown
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-teal-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (Math.min(newArrivalsMaxProducts, products.length) / Math.max(products.length, 1)) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-teal-600 font-medium">Shown on homepage</span>
              {products.length > newArrivalsMaxProducts && (
                <span className="text-xs text-gray-400">+{products.length - newArrivalsMaxProducts} via "View All"</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none w-5 h-full">
              <i className="ri-search-line text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or category…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center w-5 h-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Filter:</span>
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filteredProducts.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{products.length}</span> products
          </p>
          {(searchQuery || activeCategory !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 bg-gray-900 text-white rounded-lg px-5 py-3 flex items-center gap-4 shadow-lg">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-checkbox-multiple-line text-lg"></i>
            </div>
            <span className="font-semibold text-sm">
              {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-delete-bin-line text-sm"></i>
              </div>
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="pl-6 pr-2 py-4 w-10">
                  <div
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                      allSelected ? 'bg-gray-900 border-gray-900'
                        : someSelected ? 'bg-gray-400 border-gray-400'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {allSelected && <i className="ri-check-line text-white text-xs"></i>}
                    {!allSelected && someSelected && <i className="ri-subtract-line text-white text-xs"></i>}
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Badge</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);
                return (
                  <tr key={product.id} className={`transition-colors ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                    <td className="pl-6 pr-2 py-4 w-10">
                      <div
                        onClick={() => toggleSelectOne(product.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {isSelected && <i className="ri-check-line text-white text-xs"></i>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 cursor-zoom-in ring-0 hover:ring-2 hover:ring-gray-300 transition-all relative group"
                          onMouseEnter={(e) => handleImageMouseEnter(e, product)}
                          onMouseLeave={() => setPreviewProduct(null)}
                        >
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                            <div className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <i className="ri-zoom-in-line text-white text-sm drop-shadow"></i>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.badge ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${BADGE_COLORS[product.badge] ?? 'bg-gray-800 text-white'}`}>
                          {product.badge}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
                        {product.originalPrice && (
                          <p className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        (product.stock ?? 0) === 0 ? 'bg-red-100 text-red-700'
                          : (product.stock ?? 0) <= 10 ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.stock ?? 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(product.id)}
                          className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                        <i className="ri-search-line text-2xl text-gray-400"></i>
                      </div>
                      <p className="font-semibold text-gray-700">No products found</p>
                      <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="text-sm text-gray-700 underline cursor-pointer hover:text-gray-900">
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditingProduct({ ...editingProduct, badge: undefined })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors cursor-pointer whitespace-nowrap ${
                      !editingProduct.badge ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    None
                  </button>
                  {BADGE_OPTIONS.map(badge => (
                    <button
                      key={badge}
                      onClick={() => setEditingProduct({ ...editingProduct, badge })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        editingProduct.badge === badge
                          ? (BADGE_COLORS[badge] ?? 'bg-gray-800 text-white') + ' ring-2 ring-offset-1 ring-gray-400'
                          : 'border-2 border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ($)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stock ?? 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Product Image</label>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 w-fit">
                  {(['upload', 'url'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setImageTab(tab)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        imageTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className={`${tab === 'upload' ? 'ri-upload-cloud-2-line' : 'ri-link'} text-sm`}></i>
                      </span>
                      {tab === 'upload' ? 'Upload File' : 'Use URL'}
                    </button>
                  ))}
                </div>

                {imageTab === 'upload' && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
                      onDragLeave={() => setImageDragOver(false)}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        imageDragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {imageUploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin"></i>
                          </div>
                          <p className="text-sm text-gray-500">Processing image…</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                            <i className="ri-image-add-line text-2xl text-gray-500"></i>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Click to upload or drag &amp; drop</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {imageTab === 'url' && (
                  <input
                    type="text"
                    value={editingProduct.image.startsWith('data:') ? '' : editingProduct.image}
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                )}

                {editingProduct.image && (
                  <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
                      {editingProduct.image.startsWith('data:') && (
                        <span className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                          <span className="w-3 h-3 flex items-center justify-center"><i className="ri-check-line text-xs"></i></span>
                          Uploaded
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-center h-52 bg-white">
                      <img src={editingProduct.image} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={handleSaveEdit} className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-save-line mr-2"></i>Save Changes
              </button>
              <button onClick={() => setEditingProduct(null)} className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Image Upload Modal ─────────────────────────────────────────── */}
      {showBulkImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bulk Image Upload</h2>
                <p className="text-sm text-gray-500 mt-0.5">Upload multiple product images at once and assign them to products</p>
              </div>
              <button onClick={() => setShowBulkImageModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Drop Zone */}
              <div>
                <input ref={bulkFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBulkFileInput} />
                <div
                  onClick={() => bulkFileInputRef.current?.click()}
                  onDrop={handleBulkDrop}
                  onDragOver={(e) => { e.preventDefault(); setBulkDragOver(true); }}
                  onDragLeave={() => setBulkDragOver(false)}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    bulkDragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center bg-teal-50 rounded-full">
                      <i className="ri-upload-cloud-2-line text-3xl text-teal-500"></i>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-700">Click to select images or drag &amp; drop</p>
                      <p className="text-sm text-gray-400 mt-1">Select multiple images at once — PNG, JPG, WEBP supported</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                      <i className="ri-folder-open-line"></i>
                      Browse Files
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Files + Assignment */}
              {bulkFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {bulkFiles.length} image{bulkFiles.length > 1 ? 's' : ''} ready
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={autoAssignBulkImages}
                        className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-magic-line"></i>
                        Auto-assign in order
                      </button>
                      <button
                        onClick={() => setBulkFiles([])}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line"></i>
                        Clear all
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {bulkFiles.map((entry, index) => (
                      <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 border border-gray-200">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200">
                          <img src={entry.preview} alt={entry.file.name} className="w-full h-full object-contain" />
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{entry.file.name}</p>
                          <p className="text-xs text-gray-400">{(entry.file.size / 1024).toFixed(0)} KB</p>
                        </div>

                        {/* Assign to product */}
                        <div className="flex-shrink-0 w-56">
                          <select
                            value={entry.productId ?? ''}
                            onChange={(e) => assignBulkImage(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer ${
                              entry.assigned ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-gray-300 text-gray-600'
                            }`}
                          >
                            <option value="">— Assign to product —</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Status */}
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                          {entry.assigned ? (
                            <i className="ri-check-circle-fill text-teal-500 text-lg"></i>
                          ) : (
                            <i className="ri-circle-line text-gray-300 text-lg"></i>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeBulkFile(index)}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                      <i className="ri-check-circle-fill text-teal-500"></i>
                      {bulkFiles.filter(f => f.assigned).length} assigned
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">
                      {bulkFiles.filter(f => !f.assigned).length} unassigned
                    </span>
                  </div>
                </div>
              )}

              {/* Upload progress */}
              {bulkUploading && (
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-teal-800">Applying images…</p>
                    <p className="text-sm font-bold text-teal-700">{bulkUploadProgress}%</p>
                  </div>
                  <div className="w-full bg-teal-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${bulkUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={handleBulkApply}
                disabled={bulkUploading || bulkFiles.filter(f => f.assigned).length === 0}
                className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-check-line"></i>
                Apply {bulkFiles.filter(f => f.assigned).length} Image{bulkFiles.filter(f => f.assigned).length !== 1 ? 's' : ''}
              </button>
              <button
                onClick={() => setShowBulkImageModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-alert-line text-2xl text-red-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Product?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">Delete</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-delete-bin-line text-2xl text-red-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''}?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleBulkDelete} className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">Delete All</button>
              <button onClick={() => setShowBulkDeleteConfirm(false)} className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Tooltip */}
      {previewProduct && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: previewPos.x, top: previewPos.y }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-52">
            <div className="w-full h-44 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center mb-2">
              <img src={previewProduct.image} alt={previewProduct.name} className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-semibold text-gray-900 truncate">{previewProduct.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{previewProduct.category}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs font-bold text-gray-900">{formatPrice(previewProduct.price)}</span>
              {previewProduct.badge && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[previewProduct.badge] ?? 'bg-gray-800 text-white'}`}>
                  {previewProduct.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewArrivalsPage;
