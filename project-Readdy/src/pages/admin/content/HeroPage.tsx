import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import { SkeletonFormField } from '../../../components/base/Skeleton';
import Skeleton from '../../../components/base/Skeleton';
import UnsavedChangesBanner from '../../../components/feature/UnsavedChangesBanner';
import { supabase } from '../../../lib/supabase';

const HeroPage = () => {
  const { heroContent, setHeroContent, settingsLoading } = useAdminStore();
  const [formData, setFormData] = useState(heroContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(heroContent);
  }, [heroContent]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(heroContent);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    const fileName = `hero-bg-${Date.now()}.${ext}`;

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

    handleInputChange('backgroundImage', urlData.publicUrl);
    setIsUploading(false);

    // reset input so same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await Promise.resolve(setHeroContent(formData));
    setIsSaving(false);
  }, [formData, setHeroContent]);

  const handleDiscard = useCallback(() => {
    setFormData(heroContent);
  }, [heroContent]);

  if (settingsLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-72 mb-3" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <Skeleton className="h-6 w-40 mb-2" />
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonFormField key={i} />
            ))}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 w-28 rounded-lg" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton className="h-6 w-32 mb-6" />
            <Skeleton className="h-[500px] w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hero Section Management</h1>
        <p className="text-gray-600">Edit the main hero section content displayed on your homepage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Settings</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading - Line 1</label>
              <input
                type="text"
                value={formData.heading1}
                onChange={(e) => handleInputChange('heading1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder="Enter first line of heading"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading - Line 2</label>
              <input
                type="text"
                value={formData.heading2}
                onChange={(e) => handleInputChange('heading2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder="Enter second line of heading"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlighted Word (Badge)</label>
              <input
                type="text"
                value={formData.highlightedWord}
                onChange={(e) => handleInputChange('highlightedWord', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder="Word to highlight in black badge"
              />
              <p className="text-xs text-gray-500 mt-1">This word will appear in a black badge</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
                placeholder="Enter hero section description"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length} characters</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Label</label>
              <input
                type="text"
                value={formData.ctaLabel}
                onChange={(e) => handleInputChange('ctaLabel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder="Button text"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button URL</label>
              <input
                type="text"
                value={formData.ctaUrl}
                onChange={(e) => handleInputChange('ctaUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                placeholder="/shop"
              />
            </div>

            {/* Background Image Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>

              {/* Upload Button */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-3 w-full border-2 border-dashed rounded-lg py-5 transition-colors cursor-pointer mb-3 ${
                  isUploading
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-gray-900 hover:bg-gray-50'
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
              {formData.backgroundImage && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3" style={{ height: '80px' }}>
                  <img
                    src={formData.backgroundImage}
                    alt="Current background"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Current image</span>
                  </div>
                </div>
              )}

              {/* URL input as fallback */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-link text-gray-400 text-sm"></i>
                </span>
                <input
                  type="text"
                  value={formData.backgroundImage}
                  onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="Or paste an image URL…"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-save-line mr-2"></i>
                Save Changes
              </button>
              <button
                onClick={handleDiscard}
                disabled={!hasChanges}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-refresh-line mr-2"></i>
                Discard
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Preview</h2>
            <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height: '500px' }}>
              <div className="absolute inset-0">
                <img
                  src={formData.backgroundImage}
                  alt="Hero Background"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-white/10"></div>
              </div>
              <div className="relative z-10 p-8 flex flex-col justify-center h-full">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">{formData.heading1}</h1>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                      {formData.heading2}{' '}
                      <span className="bg-black text-white px-3 py-1 rounded-lg text-2xl">
                        {formData.highlightedWord}
                      </span>
                    </h1>
                  </div>
                  <p className="text-sm text-gray-600 max-w-md leading-relaxed">{formData.description}</p>
                  <div className="pt-2">
                    <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer">
                      {formData.ctaLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <i className="ri-information-line mr-1"></i>
                This is a scaled-down preview. The actual hero section will be full-width on your homepage.
              </p>
            </div>
          </div>
        </div>
      </div>

      <UnsavedChangesBanner
        hasChanges={hasChanges}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
      />
    </div>
  );
};

export default HeroPage;
