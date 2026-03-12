import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import Skeleton, { SkeletonProductRow } from '../../../components/base/Skeleton';
import { usePriceHistory } from '../../../hooks/usePriceHistory';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  stock?: number;
}

const PopularPage = () => {
  const { popularProducts = [], setPopularProducts, settingsLoading, lowStockThreshold } = useAdminStore();
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addEntries } = usePriceHistory();

  const [products, setProducts] = useState<Product[]>(popularProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    'Headphones', 'Earbuds', 'Speakers', 'Accessories',
    'Tablets', 'Phones', 'Laptops', 'Cameras',
  ]);
  const [newCategory, setNewCategory] = useState('');

  // Image upload state for edit modal
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Sorting state
  type SortField = 'name' | 'price' | 'stock';
  type SortDir = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');

  // Bulk price editing state
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  type BulkPriceMode = 'set' | 'percent' | 'fixed';
  const [bulkPriceMode, setBulkPriceMode] = useState<BulkPriceMode>('set');
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkPriceDirection, setBulkPriceDirection] = useState<'increase' | 'decrease'>('decrease');
  const [bulkPricePreview, setBulkPricePreview] = useState<{ id: string; name: string; oldPrice: number; newPrice: number }[]>([]);

  // Inline stock editing state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>('');
  const restockRowRef = useRef<HTMLTableRowElement | null>(null);

  // Auto-open inline stock editor when navigated from Dashboard "Restock" button
  useEffect(() => {
    const restockId = searchParams.get('restock');
    if (!restockId || settingsLoading) return;
    const target = products.find(p => p.id === restockId);
    if (!target) return;
    setEditingStockId(restockId);
    setEditingStockValue(String(target.stock ?? 0));
    setSearchParams({}, { replace: true });
    setTimeout(() => {
      if (restockRowRef.current) {
        restockRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }, [searchParams, settingsLoading, products, setSearchParams]);

  const handleStockClick = (product: Product) => {
    setEditingStockId(product.id);
    setEditingStockValue(String(product.stock ?? 0));
  };

  const handleStockSave = (productId: string) => {
    const newStock = parseInt(editingStockValue, 10);
    if (!isNaN(newStock) && newStock >= 0) {
      const updated = products.map(p =>
        p.id === productId ? { ...p, stock: newStock } : p
      );
      setProducts(updated);
      setPopularProducts(updated);
      triggerSaveConfirmation();
    }
    setEditingStockId(null);
    setEditingStockValue('');
  };

  const handleStockKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, productId: string) => {
    if (e.key === 'Enter') handleStockSave(productId);
    if (e.key === 'Escape') {
      setEditingStockId(null);
      setEditingStockValue('');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <span className="w-4 h-4 flex items-center justify-center ml-1 opacity-30">
          <i className="ri-arrow-up-down-line text-xs"></i>
        </span>
      );
    }
    return (
      <span className="w-4 h-4 flex items-center justify-center ml-1 text-gray-900">
        <i className={`ri-arrow-${sortDir === 'asc' ? 'up' : 'down'}-line text-xs`}></i>
      </span>
    );
  };

  useEffect(() => {
    setProducts(popularProducts);
  }, [popularProducts]);

  // Derived filtered + sorted list
  const filteredProducts = [...products]
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.id).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let valA: string | number;
      let valB: string | number;
      if (sortField === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
      else if (sortField === 'price') { valA = a.price; valB = b.price; }
      else { valA = a.stock ?? 0; valB = b.stock ?? 0; }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // Bulk selection helpers
  const allFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id));
  const someFilteredSelected = filteredProducts.some(p => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
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
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    const updated = products.filter(p => !selectedIds.has(p.id));
    setProducts(updated);
    setPopularProducts(updated);
    setSelectedIds(new Set());
    setShowBulkDeleteConfirm(false);
    triggerSaveConfirmation();
  };

  const handleBulkCategoryChange = () => {
    if (!bulkCategory) return;
    const updated = products.map(p =>
      selectedIds.has(p.id) ? { ...p, category: bulkCategory } : p
    );
    setProducts(updated);
    setPopularProducts(updated);
    setSelectedIds(new Set());
    setShowBulkCategoryModal(false);
    setBulkCategory('');
    triggerSaveConfirmation();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setImageTab('upload');
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    const original = products.find(p => p.id === editingProduct.id);
    const updatedLocal = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    setProducts(updatedLocal);
    setPopularProducts(updatedLocal);
    setEditingProduct(null);
    triggerSaveConfirmation();

    // Log price change if price actually changed
    if (original && original.price !== editingProduct.price) {
      addEntries([{
        productId: editingProduct.id,
        productName: editingProduct.name,
        oldPrice: original.price,
        newPrice: editingProduct.price,
        changeType: 'single',
      }]);
    }
  };

  const handleDelete = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    setPopularProducts(updated);
    setShowDeleteConfirm(null);
    triggerSaveConfirmation();
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `pop-${Date.now()}`,
      name: 'New Product',
      price: 99,
      originalPrice: 129,
      category: categories[0] ?? '',
      image: `https://readdy.ai/api/search-image?query=modern%20premium%20tech%20product%20with%20sleek%20minimalist%20design%20floating%20on%20clean%20white%20background%20professional%20product%20photography%20style%20high%20quality%20aesthetic&width=500&height=500&seq=new-pop-${Date.now()}&orientation=squarish`,
      stock: 50,
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    setPopularProducts(updated);
    setShowAddForm(false);
    triggerSaveConfirmation();
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const triggerSaveConfirmation = () => {
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  // ── Image upload helpers ──────────────────────────────────────────────────

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setImageDragOver(true);
  };

  const handleDragLeave = () => setImageDragOver(false);

  // Image preview tooltip state
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleImageMouseEnter = (e: React.MouseEvent<HTMLDivElement>, product: Product) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setPreviewProduct(product);
    setPreviewPos({ x: rect.right + 12, y: rect.top });
  };

  const handleImageMouseLeave = () => {
    setPreviewProduct(null);
  };

  const computeBulkPricePreview = (
    mode: BulkPriceMode,
    value: string,
    direction: 'increase' | 'decrease'
  ) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) { setBulkPricePreview([]); return; }
    const selected = products.filter(p => selectedIds.has(p.id));
    const preview = selected.map(p => {
      let newPrice = p.price;
      if (mode === 'set') {
        newPrice = num;
      } else if (mode === 'percent') {
        const delta = p.price * (num / 100);
        newPrice = direction === 'increase' ? p.price + delta : p.price - delta;
      } else {
        newPrice = direction === 'increase' ? p.price + num : p.price - num;
      }
      newPrice = Math.max(0, Math.round(newPrice * 100) / 100);
      return { id: p.id, name: p.name, oldPrice: p.price, newPrice };
    });
    setBulkPricePreview(preview);
  };

  const handleBulkPriceApply = () => {
    const num = parseFloat(bulkPriceValue);
    if (isNaN(num) || num < 0) return;
    const updated = products.map(p => {
      if (!selectedIds.has(p.id)) return p;
      let newPrice = p.price;
      if (bulkPriceMode === 'set') {
        newPrice = num;
      } else if (bulkPriceMode === 'percent') {
        const delta = p.price * (num / 100);
        newPrice = bulkPriceDirection === 'increase' ? p.price + delta : p.price - delta;
      } else {
        newPrice = bulkPriceDirection === 'increase' ? p.price + num : p.price - num;
      }
      newPrice = Math.max(0, Math.round(newPrice * 100) / 100);
      return { ...p, price: newPrice };
    });

    // Log all changed prices
    const changeType =
      bulkPriceMode === 'set' ? 'bulk_set' :
      bulkPriceMode === 'percent' ? 'bulk_percent' : 'bulk_fixed';
    const entries = products
      .filter(p => selectedIds.has(p.id))
      .map(p => {
        let newPrice = p.price;
        if (bulkPriceMode === 'set') {
          newPrice = num;
        } else if (bulkPriceMode === 'percent') {
          const delta = p.price * (num / 100);
          newPrice = bulkPriceDirection === 'increase' ? p.price + delta : p.price - delta;
        } else {
          newPrice = bulkPriceDirection === 'increase' ? p.price + num : p.price - num;
        }
        newPrice = Math.max(0, Math.round(newPrice * 100) / 100);
        return { productId: p.id, productName: p.name, oldPrice: p.price, newPrice, changeType };
      })
      .filter(e => e.oldPrice !== e.newPrice);
    if (entries.length > 0) addEntries(entries);

    setProducts(updated);
    setPopularProducts(updated);
    setSelectedIds(new Set());
    setShowBulkPriceModal(false);
    setBulkPriceValue('');
    setBulkPricePreview([]);
    triggerSaveConfirmation();
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex gap-6">
            {['Product', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
              <Skeleton key={h} className="h-3 flex-1" />
            ))}
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Popular Products</h1>
          <p className="text-gray-600">Manage products displayed in the shop page</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          Add Product
        </button>
      </div>

      {/* Low-stock alert banner */}
      {lowStockThreshold > 0 && (() => {
        const lowItems = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= lowStockThreshold);
        const outItems = products.filter(p => (p.stock ?? 0) === 0);
        if (lowItems.length === 0 && outItems.length === 0) return null;
        return (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-alarm-warning-fill text-amber-500 text-xl"></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">Stock Alert</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {lowItems.length > 0 && (
                    <p className="text-sm text-amber-700">
                      <span className="font-semibold">{lowItems.length}</span> product{lowItems.length > 1 ? 's' : ''} running low
                      ({lowItems.map(p => p.name).join(', ')})
                    </p>
                  )}
                  {outItems.length > 0 && (
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">{outItems.length}</span> product{outItems.length > 1 ? 's' : ''} out of stock
                      ({outItems.map(p => p.name).join(', ')})
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Save Confirmation */}
      {showSaveConfirm && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="ri-check-circle-fill text-2xl text-green-600"></i>
          <div>
            <p className="font-semibold text-green-900">Changes Saved!</p>
            <p className="text-sm text-green-700">Products have been updated</p>
          </div>
        </div>
      )}

      {/* Category Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Management</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <div key={category} className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{category}</span>
              <button
                onClick={() => handleRemoveCategory(category)}
                className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
          <button
            onClick={handleAddCategory}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-1"></i>Add
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
              placeholder="Search by name, category or ID…"
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
                  activeCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              onClick={() => { setBulkCategory(categories[0] ?? ''); setShowBulkCategoryModal(true); }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-price-tag-3-line text-sm"></i>
              </div>
              Change Category
            </button>
            <button
              onClick={() => {
                setBulkPriceMode('set');
                setBulkPriceValue('');
                setBulkPriceDirection('decrease');
                setBulkPricePreview([]);
                setShowBulkPriceModal(true);
              }}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-sm"></i>
              </div>
              Edit Prices
            </button>
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
                      allFilteredSelected
                        ? 'bg-gray-900 border-gray-900'
                        : someFilteredSelected
                        ? 'bg-gray-400 border-gray-400'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {allFilteredSelected && <i className="ri-check-line text-white text-xs"></i>}
                    {!allFilteredSelected && someFilteredSelected && (
                      <i className="ri-subtract-line text-white text-xs"></i>
                    )}
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center cursor-pointer hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    Product <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center cursor-pointer hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    Price <SortIcon field="price" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('stock')}
                    className="flex items-center cursor-pointer hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    Stock <SortIcon field="stock" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  const stock = product.stock ?? 0;
                  const isOutOfStock = stock === 0;
                  const isLowStock = lowStockThreshold > 0 && stock > 0 && stock <= lowStockThreshold;
                  const isRestockTarget = editingStockId === product.id;

                  const stockBadgeClass = isOutOfStock
                    ? 'bg-red-100 text-red-700 hover:ring-red-400'
                    : isLowStock
                    ? 'bg-amber-100 text-amber-700 hover:ring-amber-400'
                    : stock > 50
                    ? 'bg-green-100 text-green-700 hover:ring-green-400'
                    : 'bg-yellow-100 text-yellow-700 hover:ring-yellow-400';

                  return (
                    <tr
                      key={product.id}
                      ref={isRestockTarget ? restockRowRef : null}
                      className={`transition-colors ${
                        isLowStock || isOutOfStock ? 'bg-amber-50/40' : ''
                      } ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'} ${
                        isRestockTarget ? 'ring-2 ring-inset ring-amber-400' : ''
                      }`}
                    >
                      <td className="pl-6 pr-2 py-4 w-10">
                        <div
                          onClick={() => toggleSelectOne(product.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-gray-900 border-gray-900'
                              : 'border-gray-300 hover:border-gray-500'
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
                            onMouseLeave={handleImageMouseLeave}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                              <div className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="ri-zoom-in-line text-white text-sm drop-shadow"></i>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{product.name}</p>
                              {(isLowStock || isOutOfStock) && (
                                <div className="w-4 h-4 flex items-center justify-center" title={isOutOfStock ? 'Out of stock' : `Low stock (≤ ${lowStockThreshold})`}>
                                  <i className="ri-alarm-warning-fill text-amber-500 text-sm"></i>
                                </div>
                              )}
                            </div>
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
                        <div>
                          <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
                          {product.originalPrice && (
                            <p className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingStockId === product.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              autoFocus
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(e.target.value)}
                              onKeyDown={(e) => handleStockKeyDown(e, product.id)}
                              onBlur={() => handleStockSave(product.id)}
                              className="w-20 px-2 py-1 border-2 border-gray-900 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                            <button
                              onMouseDown={(e) => { e.preventDefault(); handleStockSave(product.id); }}
                              className="w-6 h-6 flex items-center justify-center bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
                              title="Save"
                            >
                              <i className="ri-check-line text-xs"></i>
                            </button>
                            <button
                              onMouseDown={(e) => { e.preventDefault(); setEditingStockId(null); setEditingStockValue(''); }}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <i className="ri-close-line text-xs"></i>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStockClick(product)}
                            title="Click to edit stock"
                            className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer hover:ring-2 hover:ring-offset-1 ${stockBadgeClass}`}
                          >
                            {isLowStock && (
                              <span className="w-3 h-3 flex items-center justify-center">
                                <i className="ri-alarm-warning-fill text-xs"></i>
                              </span>
                            )}
                            {stock} units
                            <span className="w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity">
                              <i className="ri-pencil-line text-xs"></i>
                            </span>
                          </button>
                        )}
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
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                        <i className="ri-search-line text-2xl text-gray-400"></i>
                      </div>
                      <p className="font-semibold text-gray-700">No products found</p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search or filter to find what you&apos;re looking for.
                      </p>
                      <button
                        onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                        className="mt-1 text-sm text-gray-700 underline cursor-pointer hover:text-gray-900"
                      >
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
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stock ?? 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>

              {/* ── Product Image ─────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Product Image</label>

                {/* Tab switcher */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 w-fit">
                  <button
                    onClick={() => setImageTab('upload')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      imageTab === 'upload'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-upload-cloud-2-line text-sm"></i>
                    </span>
                    Upload File
                  </button>
                  <button
                    onClick={() => setImageTab('url')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      imageTab === 'url'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-link text-sm"></i>
                    </span>
                    Use URL
                  </button>
                </div>

                {/* Upload tab */}
                {imageTab === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        imageDragOver
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                            <p className="text-sm font-semibold text-gray-700">
                              Click to upload or drag &amp; drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* URL tab */}
                {imageTab === 'url' && (
                  <div>
                    <input
                      type="text"
                      value={editingProduct.image.startsWith('data:') ? '' : editingProduct.image}
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>
                )}

                {/* Preview */}
                {editingProduct.image && (
                  <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
                      {editingProduct.image.startsWith('data:') && (
                        <span className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                          <span className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-check-line text-xs"></i>
                          </span>
                          Uploaded
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-center h-52 bg-white">
                      <img
                        src={editingProduct.image}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-save-line mr-2"></i>Save Changes
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Product</h2>
            <p className="text-gray-600 mb-6">
              A new product will be created with default values. You can edit it after creation.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Create Product
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
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
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-delete-bin-line text-2xl text-red-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''}?
                </h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkDelete}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Delete All
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Change Category Modal */}
      {showBulkCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-price-tag-3-line text-2xl text-gray-700"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Change Category</h3>
                <p className="text-sm text-gray-600">
                  Apply to {selectedIds.size} selected product{selectedIds.size > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Category</label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkCategoryChange}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Apply
              </button>
              <button
                onClick={() => setShowBulkCategoryModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Price Edit Modal */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Bulk Price Edit</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Updating {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowBulkPriceModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Mode selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Edit Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'set', label: 'Set Price', icon: 'ri-price-tag-3-line', desc: 'Fixed amount' },
                    { value: 'percent', label: 'By %', icon: 'ri-percent-line', desc: 'Percentage' },
                    { value: 'fixed', label: 'By Amount', icon: 'ri-add-circle-line', desc: 'Fixed delta' },
                  ] as { value: BulkPriceMode; label: string; icon: string; desc: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setBulkPriceMode(opt.value);
                        setBulkPriceValue('');
                        setBulkPriceDirection('decrease');
                        setBulkPricePreview([]);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        bulkPriceMode === opt.value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className={`${opt.icon} text-base`}></i>
                      </div>
                      <span className="text-xs font-semibold">{opt.label}</span>
                      <span className={`text-xs ${bulkPriceMode === opt.value ? 'text-gray-300' : 'text-gray-400'}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direction (only for percent / fixed) */}
              {(bulkPriceMode === 'percent' || bulkPriceMode === 'fixed') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Direction</label>
                  <div className="flex gap-2">
                    {(['decrease', 'increase'] as const).map((dir) => (
                      <button
                        key={dir}
                        onClick={() => {
                          setBulkPriceDirection(dir);
                          computeBulkPricePreview(bulkPriceMode, bulkPriceValue, dir);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                          bulkPriceDirection === dir
                            ? dir === 'decrease'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`${dir === 'decrease' ? 'ri-arrow-down-line' : 'ri-arrow-up-line'} text-sm`}></i>
                        </div>
                        {dir === 'decrease' ? 'Decrease' : 'Increase'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Value input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {bulkPriceMode === 'set'
                    ? 'New Price ($)'
                    : bulkPriceMode === 'percent'
                    ? 'Percentage (%)'
                    : 'Amount ($)'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm font-medium">
                      {bulkPriceMode === 'percent' ? '%' : '$'}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step={bulkPriceMode === 'percent' ? '0.1' : '0.01'}
                    value={bulkPriceValue}
                    onChange={(e) => {
                      setBulkPriceValue(e.target.value);
                      computeBulkPricePreview(bulkPriceMode, e.target.value, bulkPriceDirection);
                    }}
                    placeholder={bulkPriceMode === 'percent' ? 'e.g. 10' : 'e.g. 50.00'}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                {bulkPriceMode === 'set' && (
                  <p className="text-xs text-gray-400 mt-1.5">All selected products will be set to this exact price.</p>
                )}
                {bulkPriceMode === 'percent' && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Each product&apos;s price will {bulkPriceDirection} by this percentage.
                  </p>
                )}
                {bulkPriceMode === 'fixed' && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    This amount will be {bulkPriceDirection === 'decrease' ? 'subtracted from' : 'added to'} each product&apos;s price.
                  </p>
                )}
              </div>

              {/* Preview table */}
              {bulkPricePreview.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <span>Product</span>
                      <span className="text-center">Current</span>
                      <span className="text-center">New Price</span>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                      {bulkPricePreview.map((row) => (
                        <div key={row.id} className="px-4 py-2.5 grid grid-cols-3 gap-2 items-center">
                          <span className="text-sm text-gray-800 font-medium truncate">{row.name}</span>
                          <span className="text-sm text-gray-500 text-center">{formatPrice(row.oldPrice)}</span>
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`text-sm font-semibold ${
                              row.newPrice < row.oldPrice
                                ? 'text-red-600'
                                : row.newPrice > row.oldPrice
                                ? 'text-green-600'
                                : 'text-gray-700'
                            }`}>
                              {formatPrice(row.newPrice)}
                            </span>
                            {row.newPrice !== row.oldPrice && (
                              <span className="w-3.5 h-3.5 flex items-center justify-center">
                                <i className={`${row.newPrice < row.oldPrice ? 'ri-arrow-down-line text-red-500' : 'ri-arrow-up-line text-green-500'} text-xs`}></i>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleBulkPriceApply}
                disabled={!bulkPriceValue || parseFloat(bulkPriceValue) < 0 || bulkPricePreview.length === 0}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="ri-check-line mr-2"></i>Apply to {selectedIds.size} Product{selectedIds.size > 1 ? 's' : ''}
              </button>
              <button
                onClick={() => setShowBulkPriceModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Tooltip Portal */}
      {previewProduct && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: previewPos.x,
            top: previewPos.y,
            transform: previewPos.x + 220 > window.innerWidth
              ? `translateX(calc(-100% - ${(previewPos.x - (previewPos.x - 220 - 12))}px - 24px))`
              : undefined,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-52 animate-fade-in">
            <div className="w-full h-44 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center mb-2">
              <img
                src={previewProduct.image}
                alt={previewProduct.name}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-semibold text-gray-900 truncate">{previewProduct.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{previewProduct.category}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs font-bold text-gray-900">{formatPrice(previewProduct.price)}</span>
              {previewProduct.stock !== undefined && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  previewProduct.stock === 0
                    ? 'bg-red-100 text-red-700'
                    : previewProduct.stock <= 10
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {previewProduct.stock} in stock
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularPage;
