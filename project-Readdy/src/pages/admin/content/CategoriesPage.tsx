import { useState, useEffect, useRef } from 'react';
import { useAdminStore, StoreCategory, DEFAULT_STORE_CATEGORIES } from '../../../contexts/AdminStoreContext';

const CategoriesPage = () => {
  const { storeCategories, setStoreCategories, settingsLoading } = useAdminStore();
  const [categories, setCategories] = useState<StoreCategory[]>(storeCategories);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('url');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCategory, setNewCategory] = useState<Omit<StoreCategory, 'id'>>({
    name: '',
    image: '',
    description: '',
  });
  const [newImageTab, setNewImageTab] = useState<'upload' | 'url'>('url');
  const [newImageUploading, setNewImageUploading] = useState(false);
  const [newImageDragOver, setNewImageDragOver] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCategories(storeCategories);
  }, [storeCategories]);

  const triggerSave = () => {
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const handleSaveEdit = () => {
    if (!editingCategory) return;
    const updated = categories.map(c => c.id === editingCategory.id ? editingCategory : c);
    setCategories(updated);
    setStoreCategories(updated);
    setEditingCategory(null);
    triggerSave();
  };

  const handleDelete = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    setStoreCategories(updated);
    setShowDeleteConfirm(null);
    triggerSave();
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;
    const created: StoreCategory = {
      id: `cat-${Date.now()}`,
      name: newCategory.name.trim(),
      image: newCategory.image || `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28newCategory.name%20%20%20%20product%20isolated%20on%20pure%20white%20background%2C%20product%20photography%2C%20clean%20minimal%20style%2C%20professional%20studio%20lighting%2C%20centered%20composition%29%7D&width=200&height=200&seq=cat-new-${Date.now()}&orientation=squarish`,
      description: newCategory.description?.trim() || undefined,
    };
    const updated = [...categories, created];
    setCategories(updated);
    setStoreCategories(updated);
    setShowAddModal(false);
    setNewCategory({ name: '', image: '', description: '' });
    triggerSave();
  };

  const handleResetDefaults = () => {
    setCategories(DEFAULT_STORE_CATEGORIES);
    setStoreCategories(DEFAULT_STORE_CATEGORIES);
    triggerSave();
  };

  // ── Image upload helpers ──────────────────────────────────────────────────
  const processImageFile = (file: File, target: 'edit' | 'new') => {
    if (!file.type.startsWith('image/')) return;
    if (target === 'edit') setImageUploading(true);
    else setNewImageUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (target === 'edit') {
          setEditingCategory(prev => prev ? { ...prev, image: result } : prev);
          setImageUploading(false);
        } else {
          setNewCategory(prev => ({ ...prev, image: result }));
          setNewImageUploading(false);
        }
      }
    };
    reader.onerror = () => {
      if (target === 'edit') setImageUploading(false);
      else setNewImageUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newArr = [...categories];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newArr.length) return;
    [newArr[index], newArr[swapIdx]] = [newArr[swapIdx], newArr[index]];
    setCategories(newArr);
    setStoreCategories(newArr);
    triggerSave();
  };

  if (settingsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-9 w-56 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-600">Manage the product categories shown on your homepage</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-sm font-medium"
          >
            <i className="ri-refresh-line"></i>
            Reset to Defaults
          </button>
          <button
            onClick={() => { setShowAddModal(true); setNewCategory({ name: '', image: '', description: '' }); setNewImageTab('url'); }}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Add Category
          </button>
        </div>
      </div>

      {/* Save Confirmation */}
      {showSaveConfirm && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="ri-check-circle-fill text-2xl text-green-600"></i>
          <div>
            <p className="font-semibold text-green-900">Changes Saved!</p>
            <p className="text-sm text-green-700">Categories have been updated on your homepage</p>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-6 bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="ri-information-line text-teal-600"></i>
        </div>
        <p className="text-sm text-teal-800">
          These categories appear in the <strong>Shop by Category</strong> section on your homepage. Each category links to the shop page filtered by that category name. You can reorder them using the arrows.
        </p>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
            <i className="ri-grid-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6">Add your first category to display it on the homepage.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Image Preview */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-44 flex items-center justify-center overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-32 h-32 object-cover rounded-full shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <i className="ri-image-line text-4xl text-gray-400"></i>
                  </div>
                )}
                {/* Order badge */}
                <div className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center bg-white rounded-full shadow text-xs font-bold text-gray-700">
                  {index + 1}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                  <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                    /shop?category={encodeURIComponent(cat.name)}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-sm text-gray-500 mb-4">{cat.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  {/* Reorder */}
                  <button
                    onClick={() => moveCategory(index, 'up')}
                    disabled={index === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <i className="ri-arrow-up-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => moveCategory(index, 'down')}
                    disabled={index === categories.length - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <i className="ri-arrow-down-line text-sm"></i>
                  </button>

                  <div className="flex-1"></div>

                  <button
                    onClick={() => { setEditingCategory({ ...cat }); setImageTab('url'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium whitespace-nowrap"
                  >
                    <i className="ri-edit-line text-sm"></i>
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(cat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-sm font-medium whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Category</h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="e.g. Headphones"
                />
                <p className="text-xs text-gray-400 mt-1">This name is used to filter products in the shop.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={editingCategory.description ?? ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="e.g. Over-ear & on-ear"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category Image</label>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 w-fit">
                  {(['url', 'upload'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setImageTab(tab)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        imageTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className={tab === 'url' ? 'ri-link' : 'ri-upload-cloud-2-line'}></i>
                      {tab === 'url' ? 'Use URL' : 'Upload File'}
                    </button>
                  ))}
                </div>

                {imageTab === 'url' && (
                  <input
                    type="text"
                    value={editingCategory.image.startsWith('data:') ? '' : editingCategory.image}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                )}

                {imageTab === 'upload' && (
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processImageFile(f, 'edit'); e.target.value = ''; }} />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={(e) => { e.preventDefault(); setImageDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processImageFile(f, 'edit'); }}
                      onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
                      onDragLeave={() => setImageDragOver(false)}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${imageDragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                    >
                      {imageUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin"></i>
                          <p className="text-sm text-gray-500">Processing…</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                            <i className="ri-image-add-line text-2xl text-gray-500"></i>
                          </div>
                          <p className="text-sm font-semibold text-gray-700">Click to upload or drag &amp; drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {editingCategory.image && (
                  <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    <div className="px-4 py-2.5 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
                    </div>
                    <div className="p-4 flex items-center justify-center h-40 bg-white">
                      <img src={editingCategory.image} alt="Preview" className="max-w-full max-h-full object-contain rounded-full w-28 h-28" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={handleSaveEdit} className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-save-line mr-2"></i>Save Changes
              </button>
              <button onClick={() => setEditingCategory(null)} className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Modal ─────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Category</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="e.g. Cameras, Clothing, Books…"
                />
                <p className="text-xs text-gray-400 mt-1">Must match the category name used in your products.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={newCategory.description ?? ''}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="Short subtitle shown under the name"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category Image <span className="text-gray-400 font-normal">(optional — auto-generated if empty)</span></label>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 w-fit">
                  {(['url', 'upload'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setNewImageTab(tab)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        newImageTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className={tab === 'url' ? 'ri-link' : 'ri-upload-cloud-2-line'}></i>
                      {tab === 'url' ? 'Use URL' : 'Upload File'}
                    </button>
                  ))}
                </div>

                {newImageTab === 'url' && (
                  <input
                    type="text"
                    value={newCategory.image.startsWith('data:') ? '' : newCategory.image}
                    onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                )}

                {newImageTab === 'upload' && (
                  <div>
                    <input ref={newFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processImageFile(f, 'new'); e.target.value = ''; }} />
                    <div
                      onClick={() => newFileInputRef.current?.click()}
                      onDrop={(e) => { e.preventDefault(); setNewImageDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processImageFile(f, 'new'); }}
                      onDragOver={(e) => { e.preventDefault(); setNewImageDragOver(true); }}
                      onDragLeave={() => setNewImageDragOver(false)}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${newImageDragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                    >
                      {newImageUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin"></i>
                          <p className="text-sm text-gray-500">Processing…</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                            <i className="ri-image-add-line text-2xl text-gray-500"></i>
                          </div>
                          <p className="text-sm font-semibold text-gray-700">Click to upload or drag &amp; drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {newCategory.image && (
                  <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    <div className="px-4 py-2.5 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
                    </div>
                    <div className="p-4 flex items-center justify-center h-40 bg-white">
                      <img src={newCategory.image} alt="Preview" className="max-w-full max-h-full object-contain rounded-full w-28 h-28" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.name.trim()}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="ri-add-line mr-2"></i>Add Category
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-alert-line text-2xl text-red-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Category?</h3>
                <p className="text-sm text-gray-600">This will remove it from the homepage section.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">Delete</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
