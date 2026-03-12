import { useState, useCallback } from 'react';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import UnsavedChangesBanner from '../../../components/feature/UnsavedChangesBanner';

export default function StorePage() {
  const {
    storeName, setStoreName,
    storeLogo, setStoreLogo,
    storeTagline, setStoreTagline,
    lowStockThreshold, setLowStockThreshold,
    footerContent, setFooterContent,
  } = useAdminStore();

  const [formData, setFormData] = useState({
    name: storeName,
    logo: storeLogo || 'https://readdy.ai/api/search-image?query=modern%20minimalist%20audio%20technology%20brand%20logo%20design%20with%20clean%20geometric%20shapes%20and%20premium%20feel%20on%20white%20background%20simple%20elegant%20professional&width=200&height=80&seq=store-logo-001&orientation=landscape',
    tagline: storeTagline,
    description: 'We deliver exceptional audio products that combine cutting-edge technology with timeless design. Our mission is to bring studio-quality sound to everyone.',
    threshold: lowStockThreshold,
  });
  const [isSaving, setIsSaving] = useState(false);

  const savedSnapshot = {
    name: storeName,
    logo: storeLogo,
    tagline: storeTagline,
    threshold: lowStockThreshold,
  };
  const hasChanges =
    formData.name !== savedSnapshot.name ||
    formData.logo !== savedSnapshot.logo ||
    formData.tagline !== savedSnapshot.tagline ||
    formData.threshold !== savedSnapshot.threshold;

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setStoreName(formData.name);
    setStoreLogo(formData.logo);
    setStoreTagline(formData.tagline);
    setLowStockThreshold(formData.threshold);

    // Sync footer brand name, tagline, and copyright with store name/tagline
    const currentYear = new Date().getFullYear();
    setFooterContent({
      ...footerContent,
      brandName: formData.name,
      tagline: formData.tagline,
      copyright: `© ${currentYear} ${formData.name}. All rights reserved.`,
    });

    // Update document title
    document.title = `${formData.name} - Premium Audio Store`;

    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
  }, [formData, setStoreName, setStoreLogo, setStoreTagline, setLowStockThreshold, footerContent, setFooterContent]);

  const handleDiscard = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      name: storeName,
      logo: storeLogo,
      tagline: storeTagline,
      threshold: lowStockThreshold,
    }));
  }, [storeName, storeLogo, storeTagline, lowStockThreshold]);

  const PRESET_THRESHOLDS = [5, 10, 20, 50];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Settings</h1>
        <p className="text-sm text-gray-600">Manage your store&apos;s basic information and branding</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-3xl">
        <div className="space-y-6">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Store Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter store name"
            />
            <p className="text-xs text-gray-500 mt-2">This will appear in the header and footer</p>
          </div>

          {/* Store Logo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Store Logo</label>
            <div className="flex items-start gap-6">
              <div className="w-48 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                <img src={formData.logo} alt="Store logo preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent mb-2"
                  placeholder="Enter logo URL"
                />
                <p className="text-xs text-gray-500">Recommended size: 200x80px</p>
              </div>
            </div>
          </div>

          {/* Store Tagline */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Store Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter store tagline"
            />
            <p className="text-xs text-gray-500 mt-2">A short, memorable phrase about your store</p>
          </div>

          {/* Store Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Store Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              placeholder="Enter store description"
            />
            <p className="text-xs text-gray-500 mt-2">{formData.description.length}/500 characters</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-lg">
                <i className="ri-alarm-warning-line text-amber-600 text-base"></i>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Low Stock Alert Threshold</h2>
            </div>
            <p className="text-xs text-gray-500 mb-5 ml-11">
              Products with stock at or below this number will be flagged with a warning across the admin panel.
            </p>

            {/* Preset pills */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Quick set:</span>
              {PRESET_THRESHOLDS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFormData({ ...formData, threshold: val })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    formData.threshold === val
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700'
                  }`}
                >
                  {val} units
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-3">
              <div className="relative w-40">
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={formData.threshold}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 0) setFormData({ ...formData, threshold: val });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  units
                </span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
                formData.threshold === 0
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`text-sm ${formData.threshold === 0 ? 'ri-information-line text-gray-400' : 'ri-alarm-warning-fill text-amber-500'}`}></i>
                </div>
                {formData.threshold === 0
                  ? 'Alerts disabled'
                  : `Warn when stock ≤ ${formData.threshold}`}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              onClick={handleDiscard}
              disabled={!hasChanges}
              className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Discard
            </button>
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
}
