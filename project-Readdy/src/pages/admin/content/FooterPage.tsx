import { useState, useEffect } from 'react';
import { useAdminStore } from '../../../contexts/AdminStoreContext';

interface LinkItem {
  id: string;
  label: string;
  url: string;
}

interface EditingLink {
  id: string;
  label: string;
  url: string;
}

const FooterPage = () => {
  const { footerContent, setFooterContent } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'basic' | 'links' | 'contact' | 'social'>('basic');
  const [draft, setDraft] = useState(footerContent);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newProductLink, setNewProductLink] = useState({ label: '', url: '' });
  const [newSupportLink, setNewSupportLink] = useState({ label: '', url: '' });

  // Edit-in-place state
  const [editingProductLink, setEditingProductLink] = useState<EditingLink | null>(null);
  const [editingSupportLink, setEditingSupportLink] = useState<EditingLink | null>(null);

  useEffect(() => {
    setDraft(footerContent);
  }, [footerContent]);

  useEffect(() => {
    const changed = JSON.stringify(draft) !== JSON.stringify(footerContent);
    setHasChanges(changed);
    if (changed) setSaved(false);
  }, [draft, footerContent]);

  const handleSaveAll = () => {
    setFooterContent(draft);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDiscard = () => {
    setDraft(footerContent);
    setHasChanges(false);
    setEditingProductLink(null);
    setEditingSupportLink(null);
  };

  const updateDraftBasic = (field: string, value: string | boolean) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateDraftSocial = (platform: string, url: string) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: url },
    }));
  };

  const updateDraftContact = (field: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value },
    }));
  };

  // Products Links handlers
  const handleAddProductLink = () => {
    if (newProductLink.label && newProductLink.url) {
      setDraft((prev) => ({
        ...prev,
        productsLinks: [
          ...prev.productsLinks,
          { id: Date.now().toString(), ...newProductLink },
        ],
      }));
      setNewProductLink({ label: '', url: '' });
    }
  };

  const handleRemoveProductLink = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      productsLinks: prev.productsLinks.filter((link) => link.id !== id),
    }));
  };

  const handleStartEditProductLink = (link: LinkItem) => {
    setEditingProductLink({ id: link.id, label: link.label, url: link.url });
  };

  const handleConfirmEditProductLink = () => {
    if (!editingProductLink) return;
    if (!editingProductLink.label.trim() || !editingProductLink.url.trim()) return;
    setDraft((prev) => ({
      ...prev,
      productsLinks: prev.productsLinks.map((link) =>
        link.id === editingProductLink.id
          ? { ...link, label: editingProductLink.label.trim(), url: editingProductLink.url.trim() }
          : link
      ),
    }));
    setEditingProductLink(null);
  };

  const handleCancelEditProductLink = () => {
    setEditingProductLink(null);
  };

  // Support Links handlers
  const handleAddSupportLink = () => {
    if (newSupportLink.label && newSupportLink.url) {
      setDraft((prev) => ({
        ...prev,
        supportLinks: [
          ...prev.supportLinks,
          { id: Date.now().toString(), ...newSupportLink },
        ],
      }));
      setNewSupportLink({ label: '', url: '' });
    }
  };

  const handleRemoveSupportLink = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      supportLinks: prev.supportLinks.filter((link) => link.id !== id),
    }));
  };

  const handleStartEditSupportLink = (link: LinkItem) => {
    setEditingSupportLink({ id: link.id, label: link.label, url: link.url });
  };

  const handleConfirmEditSupportLink = () => {
    if (!editingSupportLink) return;
    if (!editingSupportLink.label.trim() || !editingSupportLink.url.trim()) return;
    setDraft((prev) => ({
      ...prev,
      supportLinks: prev.supportLinks.map((link) =>
        link.id === editingSupportLink.id
          ? { ...link, label: editingSupportLink.label.trim(), url: editingSupportLink.url.trim() }
          : link
      ),
    }));
    setEditingSupportLink(null);
  };

  const handleCancelEditSupportLink = () => {
    setEditingSupportLink(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Footer Content</h1>
          <p className="text-gray-600 mt-2">Manage your website footer information and links</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleDiscard}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSaveAll}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              saved
                ? 'bg-green-600 text-white'
                : hasChanges
                ? 'bg-black hover:bg-gray-800 text-white shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saved ? (
              <>
                <i className="ri-check-line"></i>
                Saved!
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

      {/* Unsaved changes notice */}
      {hasChanges && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg">
          <i className="ri-error-warning-line"></i>
          You have unsaved changes. Click <strong className="mx-1">Save Changes</strong> to apply them.
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            {(['basic', 'links', 'contact', 'social'] as const).map((tab) => {
              const icons: Record<string, string> = {
                basic: 'ri-information-line',
                links: 'ri-links-line',
                contact: 'ri-contacts-line',
                social: 'ri-share-line',
              };
              const labels: Record<string, string> = {
                basic: 'Basic Info',
                links: 'Navigation Links',
                contact: 'Contact Info',
                social: 'Social Media',
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${icons[tab]} mr-2`}></i>
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Name</label>
                <input
                  type="text"
                  value={draft.brandName}
                  onChange={(e) => updateDraftBasic('brandName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Your Brand Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={draft.tagline}
                  onChange={(e) => updateDraftBasic('tagline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Your brand tagline"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Copyright Text</label>
                <input
                  type="text"
                  value={draft.copyright}
                  onChange={(e) => updateDraftBasic('copyright', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="© 2025 Your Company. All rights reserved."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.showTrustBadges}
                    onChange={(e) => updateDraftBasic('showTrustBadges', e.target.checked)}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700">Show Trust Badges (SSL, Free Shipping, etc.)</span>
                </label>
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-8">
              {/* Products Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Products Links</h3>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <i className="ri-pencil-line"></i> Click the pencil icon to edit a link
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  {draft.productsLinks.map((link) => {
                    const isEditing = editingProductLink?.id === link.id;
                    return (
                      <div
                        key={link.id}
                        className={`flex items-center gap-3 rounded-lg p-4 transition-colors ${
                          isEditing ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-transparent'
                        }`}
                      >
                        {isEditing ? (
                          <>
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Label</label>
                                <input
                                  type="text"
                                  value={editingProductLink.label}
                                  onChange={(e) =>
                                    setEditingProductLink((prev) => prev ? { ...prev, label: e.target.value } : prev)
                                  }
                                  autoFocus
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                  placeholder="Link label"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">URL</label>
                                <input
                                  type="text"
                                  value={editingProductLink.url}
                                  onChange={(e) =>
                                    setEditingProductLink((prev) => prev ? { ...prev, url: e.target.value } : prev)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirmEditProductLink();
                                    if (e.key === 'Escape') handleCancelEditProductLink();
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                  placeholder="Link URL"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handleConfirmEditProductLink}
                                disabled={!editingProductLink.label.trim() || !editingProductLink.url.trim()}
                                className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Confirm"
                              >
                                <i className="ri-check-line text-sm"></i>
                              </button>
                              <button
                                onClick={handleCancelEditProductLink}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <i className="ri-close-line text-sm"></i>
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Label</p>
                                <p className="font-semibold text-gray-900 text-sm">{link.label}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">URL</p>
                                <p className="text-gray-600 truncate text-sm">{link.url}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEditProductLink(link)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-black hover:text-white text-gray-500 rounded-lg transition-colors cursor-pointer"
                                title="Edit link"
                              >
                                <i className="ri-pencil-line text-sm"></i>
                              </button>
                              <button
                                onClick={() => handleRemoveProductLink(link.id)}
                                className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete link"
                              >
                                <i className="ri-delete-bin-line text-sm"></i>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newProductLink.label}
                    onChange={(e) => setNewProductLink({ ...newProductLink, label: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    placeholder="New link label"
                  />
                  <input
                    type="text"
                    value={newProductLink.url}
                    onChange={(e) => setNewProductLink({ ...newProductLink, url: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    placeholder="New link URL"
                  />
                  <button
                    onClick={handleAddProductLink}
                    disabled={!newProductLink.label || !newProductLink.url}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>

              {/* Support Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Support Links</h3>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <i className="ri-pencil-line"></i> Click the pencil icon to edit a link
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  {draft.supportLinks.map((link) => {
                    const isEditing = editingSupportLink?.id === link.id;
                    return (
                      <div
                        key={link.id}
                        className={`flex items-center gap-3 rounded-lg p-4 transition-colors ${
                          isEditing ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-transparent'
                        }`}
                      >
                        {isEditing ? (
                          <>
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Label</label>
                                <input
                                  type="text"
                                  value={editingSupportLink.label}
                                  onChange={(e) =>
                                    setEditingSupportLink((prev) => prev ? { ...prev, label: e.target.value } : prev)
                                  }
                                  autoFocus
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                  placeholder="Link label"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">URL</label>
                                <input
                                  type="text"
                                  value={editingSupportLink.url}
                                  onChange={(e) =>
                                    setEditingSupportLink((prev) => prev ? { ...prev, url: e.target.value } : prev)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirmEditSupportLink();
                                    if (e.key === 'Escape') handleCancelEditSupportLink();
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                  placeholder="Link URL"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handleConfirmEditSupportLink}
                                disabled={!editingSupportLink.label.trim() || !editingSupportLink.url.trim()}
                                className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Confirm"
                              >
                                <i className="ri-check-line text-sm"></i>
                              </button>
                              <button
                                onClick={handleCancelEditSupportLink}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <i className="ri-close-line text-sm"></i>
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Label</p>
                                <p className="font-semibold text-gray-900 text-sm">{link.label}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">URL</p>
                                <p className="text-gray-600 truncate text-sm">{link.url}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEditSupportLink(link)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-black hover:text-white text-gray-500 rounded-lg transition-colors cursor-pointer"
                                title="Edit link"
                              >
                                <i className="ri-pencil-line text-sm"></i>
                              </button>
                              <button
                                onClick={() => handleRemoveSupportLink(link.id)}
                                className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete link"
                              >
                                <i className="ri-delete-bin-line text-sm"></i>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSupportLink.label}
                    onChange={(e) => setNewSupportLink({ ...newSupportLink, label: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    placeholder="New link label"
                  />
                  <input
                    type="text"
                    value={newSupportLink.url}
                    onChange={(e) => setNewSupportLink({ ...newSupportLink, url: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    placeholder="New link URL"
                  />
                  <button
                    onClick={handleAddSupportLink}
                    disabled={!newSupportLink.label || !newSupportLink.url}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="ri-map-pin-line mr-2"></i>Address
                </label>
                <textarea
                  value={draft.contactInfo.address}
                  onChange={(e) => updateDraftContact('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="123 Main Street, City, State 12345"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="ri-phone-line mr-2"></i>Phone Number
                </label>
                <input
                  type="text"
                  value={draft.contactInfo.phone}
                  onChange={(e) => updateDraftContact('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="ri-mail-line mr-2"></i>Email Address
                </label>
                <input
                  type="email"
                  value={draft.contactInfo.email}
                  onChange={(e) => updateDraftContact('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="contact@yourcompany.com"
                />
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              {[
                { key: 'facebook', icon: 'ri-facebook-fill', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
                { key: 'twitter', icon: 'ri-twitter-fill', label: 'Twitter URL', placeholder: 'https://twitter.com/yourhandle' },
                { key: 'instagram', icon: 'ri-instagram-fill', label: 'Instagram URL', placeholder: 'https://instagram.com/yourprofile' },
                { key: 'youtube', icon: 'ri-youtube-fill', label: 'YouTube URL', placeholder: 'https://youtube.com/yourchannel' },
              ].map(({ key, icon, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className={`${icon} mr-2`}></i>{label}
                  </label>
                  <input
                    type="text"
                    value={(draft.socialLinks as Record<string, string>)[key]}
                    onChange={(e) => updateDraftSocial(key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save bar at bottom */}
      {hasChanges && (
        <div className="sticky bottom-6 flex justify-end gap-3">
          <button
            onClick={handleDiscard}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 shadow-md transition-colors cursor-pointer whitespace-nowrap"
          >
            Discard
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-black hover:bg-gray-800 text-white text-sm font-semibold shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-save-line"></i>
            Save Changes
          </button>
        </div>
      )}

      {/* Live Preview */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Live Preview</h3>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-xl overflow-hidden shadow-lg">
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="text-2xl font-bold">{draft.brandName}</div>
                <p className="text-gray-300 text-sm">{draft.tagline}</p>
                <div className="flex space-x-3">
                  {draft.socialLinks.facebook && (
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <i className="ri-facebook-fill"></i>
                    </div>
                  )}
                  {draft.socialLinks.twitter && (
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <i className="ri-twitter-fill"></i>
                    </div>
                  )}
                  {draft.socialLinks.instagram && (
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <i className="ri-instagram-fill"></i>
                    </div>
                  )}
                  {draft.socialLinks.youtube && (
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <i className="ri-youtube-fill"></i>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4">Products</h4>
                <ul className="space-y-2">
                  {draft.productsLinks.map((link) => (
                    <li key={link.id}>
                      <span className="text-gray-300 text-sm hover:text-white cursor-pointer">{link.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4">Support</h4>
                <ul className="space-y-2">
                  {draft.supportLinks.map((link) => (
                    <li key={link.id}>
                      <span className="text-gray-300 text-sm hover:text-white cursor-pointer">{link.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4">Contact</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <i className="ri-map-pin-line mt-1"></i>
                    <span className="text-gray-300">{draft.contactInfo.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="ri-phone-line"></i>
                    <span className="text-gray-300">{draft.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="ri-mail-line"></i>
                    <span className="text-gray-300">{draft.contactInfo.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 px-12 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">{draft.copyright}</div>
              {draft.showTrustBadges && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <i className="ri-shield-check-line text-green-400"></i>
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <i className="ri-truck-line"></i>
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <i className="ri-customer-service-line"></i>
                    <span>24/7 Support</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterPage;
