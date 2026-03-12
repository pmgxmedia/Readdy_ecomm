import { useState, useEffect } from 'react';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import type { AnnouncementBarSettings } from '../../../contexts/AdminStoreContext';

const COLOR_PRESETS = [
  { label: 'Teal', bg: '#0f766e', text: '#ffffff' },
  { label: 'Black', bg: '#111111', text: '#ffffff' },
  { label: 'Coral', bg: '#e11d48', text: '#ffffff' },
  { label: 'Amber', bg: '#d97706', text: '#ffffff' },
  { label: 'Slate', bg: '#334155', text: '#ffffff' },
  { label: 'Warm Sand', bg: '#f5f0e8', text: '#1a1a1a' },
];

const ICON_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'Megaphone', value: 'ri-megaphone-line' },
  { label: 'Gift', value: 'ri-gift-line' },
  { label: 'Truck', value: 'ri-truck-line' },
  { label: 'Star', value: 'ri-star-line' },
  { label: 'Fire', value: 'ri-fire-line' },
  { label: 'Tag', value: 'ri-price-tag-3-line' },
  { label: 'Bell', value: 'ri-notification-3-line' },
  { label: 'Lightning', value: 'ri-flashlight-line' },
  { label: 'Percent', value: 'ri-percent-line' },
];

const DEFAULT_SETTINGS: AnnouncementBarSettings = {
  enabled: true,
  message: '🎧 Free shipping on orders over $50 — Limited time offer!',
  icon: '',
  linkLabel: 'Shop Now',
  linkUrl: '/shop',
  bgColor: '#0f766e',
  textColor: '#ffffff',
  dismissible: true,
};

const AnnouncementBarPage = () => {
  const { announcementBar, setAnnouncementBar, settingsLoading } = useAdminStore();
  const [form, setForm] = useState<AnnouncementBarSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (announcementBar) setForm(announcementBar);
  }, [announcementBar]);

  const handleSave = async () => {
    setIsSaving(true);
    await setAnnouncementBar(form);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const applyPreset = (preset: { bg: string; text: string }) => {
    setForm((f) => ({ ...f, bgColor: preset.bg, textColor: preset.text }));
  };

  if (settingsLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcement Bar</h1>
        <p className="text-gray-500 text-sm">
          Display a slim banner below the header to highlight promotions, shipping offers, or announcements.
        </p>
      </div>

      {/* Save feedback */}
      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="ri-check-circle-fill text-xl text-green-600"></i>
          <p className="text-sm font-semibold text-green-800">Announcement bar saved successfully!</p>
        </div>
      )}

      {/* Live Preview */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Live Preview</p>
        <div
          className="w-full rounded-lg flex items-center justify-center px-10 py-3 relative"
          style={{ backgroundColor: form.bgColor, color: form.textColor }}
        >
          <span className="flex items-center gap-2">
            {form.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
                <i className={`${form.icon} text-sm`}></i>
              </span>
            )}
            <span className="font-medium text-sm">{form.message || 'Your message here…'}</span>
            {form.linkLabel && (
              <span className="underline underline-offset-2 font-semibold text-sm opacity-90 ml-1">
                {form.linkLabel} →
              </span>
            )}
          </span>
          {form.dismissible && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full opacity-60"
              style={{ color: form.textColor }}
            >
              <i className="ri-close-line text-sm"></i>
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

        {/* Enable toggle */}
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Enable Announcement Bar</p>
            <p className="text-xs text-gray-500 mt-0.5">Show or hide the bar across all pages</p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.enabled ? 'bg-teal-500' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.enabled ? 'translate-x-6' : 'translate-x-0'}`}
            ></span>
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
          <input
            type="text"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            maxLength={200}
            placeholder="e.g. Free shipping on orders over $50!"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/200</p>
        </div>

        {/* Icon */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, icon: opt.value }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all cursor-pointer whitespace-nowrap ${
                  form.icon === opt.value
                    ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {opt.value && (
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className={opt.value}></i>
                  </span>
                )}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Link */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Link Label</label>
            <input
              type="text"
              value={form.linkLabel}
              onChange={(e) => setForm((f) => ({ ...f, linkLabel: e.target.value }))}
              placeholder="e.g. Shop Now"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Link URL</label>
            <input
              type="text"
              value={form.linkUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              placeholder="e.g. /shop"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Color Presets</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                title={preset.label}
                className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                  form.bgColor === preset.bg ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: preset.bg }}
              ></button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                <input
                  type="color"
                  value={form.bgColor}
                  onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-sm text-gray-700 font-mono">{form.bgColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                <input
                  type="color"
                  value={form.textColor}
                  onChange={(e) => setForm((f) => ({ ...f, textColor: e.target.value }))}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-sm text-gray-700 font-mono">{form.textColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dismissible */}
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Allow Dismiss</p>
            <p className="text-xs text-gray-500 mt-0.5">Show a close button so visitors can hide the bar</p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, dismissible: !f.dismissible }))}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.dismissible ? 'bg-teal-500' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.dismissible ? 'translate-x-6' : 'translate-x-0'}`}
            ></span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              Saving…
            </>
          ) : (
            <>
              <i className="ri-save-line"></i>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBarPage;
