import { useState, useRef } from 'react';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import Skeleton from '../../../components/base/Skeleton';
import { supabase } from '../../../lib/supabase';

const FeaturedPage = () => {
  const { featuredProduct, setFeaturedProduct, settingsLoading } = useAdminStore();
  const { formatPrice } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [features, setFeatures] = useState<string[]>([
    'Google Assistant & Alexa Built-in',
    'Quantum Dot Color Technology',
    'Advanced 4K Processor',
    'Ultra-Slim Design',
    'HDMI 2.1 Connectivity',
  ]);
  const [newFeature, setNewFeature] = useState('');

  const [formData, setFormData] = useState({
    name: featuredProduct?.name || '',
    price: featuredProduct?.price.toString() || '',
    originalPrice: featuredProduct?.originalPrice?.toString() || '',
    category: featuredProduct?.category || '',
    image: featuredProduct?.image || '',
    stock: featuredProduct?.stock?.toString() || '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPG, PNG, WEBP, or GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const ext = file.name.split('.').pop();
    const fileName = `featured-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('hero-images')
      .upload(fileName, file, { upsert: true });

    if (error) {
      setUploadError('Upload failed. Please try again.');
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('hero-images')
      .getPublicUrl(fileName);

    setFormData(prev => ({ ...prev, image: urlData.publicUrl }));
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (featuredProduct) {
      setFeaturedProduct({
        ...featuredProduct,
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        image: formData.image,
        stock: parseInt(formData.stock),
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: featuredProduct?.name || '',
      price: featuredProduct?.price.toString() || '',
      originalPrice: featuredProduct?.originalPrice?.toString() || '',
      category: featuredProduct?.category || '',
      image: featuredProduct?.image || '',
      stock: featuredProduct?.stock?.toString() || '',
    });
    setUploadError(null);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleEditFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const discount = featuredProduct?.originalPrice && featuredProduct?.price
    ? Math.round(((featuredProduct.originalPrice - featuredProduct.price) / featuredProduct.originalPrice) * 100)
    : 0;

  const savings = featuredProduct?.originalPrice && featuredProduct?.price
    ? featuredProduct.originalPrice - featuredProduct.price
    : 0;

  if (settingsLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-56 mb-3" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-80 w-full rounded-xl" />
            <div className="space-y-5">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-40" />
              <div className="flex gap-4 items-center">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-6 w-20" /></div>
                <div><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-6 w-16" /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <Skeleton className="h-6 w-40 mb-6" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg mb-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Featured Product</h1>
          <p className="text-gray-600 mt-2">Manage your featured product showcase section</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-edit-line"></i>
            Edit Product
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        {isEditing ? (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Featured Product</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Smart TV, Audio"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="899.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price ($)</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="1199.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="50"
                />
              </div>

              {/* Image Upload Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>

                {/* Upload area */}
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`flex items-center justify-center gap-3 w-full border-2 border-dashed rounded-lg py-5 transition-colors mb-3 ${
                    isUploading
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-900 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-gray-400 text-xl"></i>
                      <span className="text-sm text-gray-500">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className="ri-upload-cloud-2-line text-gray-400 text-2xl"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Click to upload an image</p>
                        <p className="text-xs text-gray-400">JPG, PNG, WEBP or GIF · max 5 MB</p>
                      </div>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {uploadError && (
                  <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>
                    {uploadError}
                  </p>
                )}

                {/* Current image thumbnail */}
                {formData.image && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3" style={{ height: '80px' }}>
                    <img
                      src={formData.image}
                      alt="Current product"
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </div>
                )}

                {/* URL fallback */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-link text-gray-400 text-sm"></i>
                  </span>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    placeholder="Or paste an image URL…"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.price}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center">
              <img
                src={featuredProduct?.image}
                alt={featuredProduct?.name}
                className="w-full h-auto object-contain max-h-96"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  Featured Product
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{featuredProduct?.name}</h2>
                <p className="text-lg text-gray-600">{featuredProduct?.category}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-900">{featuredProduct ? formatPrice(featuredProduct.price) : ''}</span>
                {featuredProduct?.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">{formatPrice(featuredProduct.originalPrice)}</span>
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Stock Available</p>
                    <p className="text-lg font-semibold text-gray-900">{featuredProduct?.stock} units</p>
                  </div>
                  {savings > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">You Save</p>
                      <p className="text-lg font-semibold text-green-600">{formatPrice(savings)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Bullets Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Product Features</h3>
          <span className="text-sm text-gray-600">{features.length} features</span>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-check-line text-green-600"></i>
              </div>
              <input
                type="text"
                value={feature}
                onChange={(e) => handleEditFeature(index, e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 font-medium"
              />
              <button
                onClick={() => handleRemoveFeature(index)}
                className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          ))}
        </div>

        {/* Add New Feature */}
        <div className="flex gap-3">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Add a new feature..."
          />
          <button
            onClick={handleAddFeature}
            disabled={!newFeature.trim()}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-add-line mr-2"></i>
            Add Feature
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Live Preview</h3>
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Featured Product
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{featuredProduct?.name}</h2>
                <p className="text-lg text-gray-600">{featuredProduct?.category}</p>
              </div>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-green-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-4">
                <span className="text-3xl font-bold text-gray-900">{featuredProduct ? formatPrice(featuredProduct.price) : ''}</span>
                {featuredProduct?.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">{formatPrice(featuredProduct.originalPrice)}</span>
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center">
              <img
                src={featuredProduct?.image}
                alt={featuredProduct?.name}
                className="w-full h-auto object-contain max-h-80"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPage;