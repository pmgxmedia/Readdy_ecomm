import { useState, useEffect, useCallback } from 'react';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import UnsavedChangesBanner from '../../../components/feature/UnsavedChangesBanner';

export default function NavbarPage() {
  const { navLinks, setNavLinks } = useAdminStore();

  const [links, setLinks] = useState(() => (Array.isArray(navLinks) ? navLinks : []));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', url: '', visible: true });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(navLinks)) {
      setLinks(navLinks);
    }
  }, [navLinks]);

  const hasChanges = JSON.stringify(links) !== JSON.stringify(navLinks);

  const handleAddLink = () => {
    if (newLink.label && newLink.url) {
      setLinks([...links, { ...newLink, id: Date.now().toString() }]);
      setNewLink({ label: '', url: '', visible: true });
      setShowAddForm(false);
    }
  };

  const handleToggleVisibility = (id: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, visible: !link.visible } : link)));
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newLinks = [...links];
      [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
      setLinks(newLinks);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < links.length - 1) {
      const newLinks = [...links];
      [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
      setLinks(newLinks);
    }
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setNavLinks(links);
    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
  }, [links, setNavLinks]);

  const handleDiscard = useCallback(() => {
    setLinks(Array.isArray(navLinks) ? navLinks : []);
  }, [navLinks]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Navbar Management</h1>
        <p className="text-sm text-gray-600">Manage navigation links displayed in the header</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
        {/* Add New Link Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-add-line text-lg"></i>
            Add New Link
          </button>
        </div>

        {/* Add Link Form */}
        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4">New Navigation Link</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Label</label>
                <input
                  type="text"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., About Us"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">URL</label>
                <input
                  type="text"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., /about"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddLink}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Add Link
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Links List */}
        <div className="space-y-3 mb-6">
          {links.map((link, index) => (
            <div
              key={link.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="ri-arrow-up-s-line text-lg text-gray-600"></i>
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === links.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="ri-arrow-down-s-line text-lg text-gray-600"></i>
                </button>
              </div>

              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{link.label}</div>
                <div className="text-xs text-gray-500">{link.url}</div>
              </div>

              <div>
                {link.visible ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">
                    Visible
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full whitespace-nowrap">
                    Hidden
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(link.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  title={link.visible ? 'Hide link' : 'Show link'}
                >
                  <i className={`${link.visible ? 'ri-eye-line' : 'ri-eye-off-line'} text-lg text-gray-600`}></i>
                </button>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete link"
                >
                  <i className="ri-delete-bin-line text-lg text-red-600"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
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

      <UnsavedChangesBanner
        hasChanges={hasChanges}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
      />
    </div>
  );
}
