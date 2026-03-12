import { useState, useEffect, useRef } from 'react';
import { useAdminStore } from '../../../contexts/AdminStoreContext';
import Skeleton from '../../../components/base/Skeleton';
import { supabase } from '../../../lib/supabase';

interface PromotionalCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
}

const BG_COLOR_OPTIONS = [
  { label: 'Blue to Purple', value: 'from-blue-100 to-purple-100' },
  { label: 'Purple to Pink', value: 'from-purple-100 to-pink-100' },
  { label: 'Green to Blue', value: 'from-green-100 to-blue-100' },
  { label: 'Orange to Red', value: 'from-orange-100 to-red-100' },
  { label: 'Yellow to Orange', value: 'from-yellow-100 to-orange-100' },
  { label: 'Pink to Purple', value: 'from-pink-100 to-purple-100' },
  { label: 'Teal to Cyan', value: 'from-teal-100 to-cyan-100' },
  { label: 'Gray to Slate', value: 'from-gray-100 to-slate-100' },
];

const DEFAULT_BG_COLORS = [
  'from-blue-100 to-purple-100',
  'from-blue-100 to-purple-100',
  'from-purple-100 to-pink-100',
];

const PromotionalPage = () => {
  const { promotionalProducts, setPromotionalProducts, settingsLoading } = useAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const promoToCard = (
    p: { id: string; name: string; category: string; image: string },
    idx: number
  ): PromotionalCard => ({
    id: p.id,
    title: p.name,
    subtitle: p.category,
    image: p.image,
    bgColor: DEFAULT_BG_COLORS[idx] ?? 'from-blue-100 to-purple-100',
  });

  const [cards, setCards] = useState<PromotionalCard[]>(() =>
    (promotionalProducts ?? []).map(promoToCard)
  );
  const [editingCard, setEditingCard] = useState<PromotionalCard | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local cards when Supabase data loads
  useEffect(() => {
    setCards((promotionalProducts ?? []).map(promoToCard));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotionalProducts]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCard) return;

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
    const fileName = `promo-${Date.now()}.${ext}`;

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

    setEditingCard(prev => prev ? { ...prev, image: urlData.publicUrl } : prev);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const persistCards = async (updated: PromotionalCard[]) => {
    setIsSaving(true);
    const asProducts = updated.map((c) => ({
      id: c.id,
      name: c.title,
      category: c.subtitle,
      image: c.image,
      price: 0,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (setPromotionalProducts as any)(asProducts);
    setIsSaving(false);
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const handleEdit = (card: PromotionalCard) => {
    setEditingCard({ ...card });
    setUploadError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCard) return;
    const updated = cards.map((c) => (c.id === editingCard.id ? editingCard : c));
    setCards(updated);
    setEditingCard(null);
    await persistCards(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    setShowDeleteConfirm(null);
    await persistCards(updated);
  };

  const handleAddNew = async () => {
    const timestamp = Date.now();
    const newCard: PromotionalCard = {
      id: `promo-${timestamp}`,
      title: 'New Product',
      subtitle: 'Category',
      image: `https://readdy.ai/api/search-image?query=modern%20premium%20tech%20product%20with%20sleek%20design%20floating%20on%20minimal%20clean%20background%20professional%20product%20photography%20style%20high%20quality%20aesthetic&width=600&height=600&seq=new-promo-${timestamp}&orientation=squarish`,
      bgColor: 'from-blue-100 to-purple-100',
    };
    const updated = [...cards, newCard];
    setCards(updated);
    await persistCards(updated);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...cards];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setCards(updated);
    await persistCards(updated);
  };

  const handleMoveDown = async (index: number) => {
    if (index === cards.length - 1) return;
    const updated = [...cards];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setCards(updated);
    await persistCards(updated);
  };

  if (settingsLoading) {
    return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-3" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Skeleton className="h-56 w-full" />
              <div className="p-4 bg-gray-50 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                  <Skeleton className="h-9 w-12 rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotional Products</h1>
          <p className="text-gray-600">
            Manage the promotional product cards displayed on your homepage
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={isSaving}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
        >
          <i className="ri-add-line mr-2"></i>
          Add New Card
        </button>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
          <i className="ri-loader-4-line text-2xl text-gray-500 animate-spin"></i>
          <p className="text-sm text-gray-600">Saving to Supabase...</p>
        </div>
      )}

      {/* Save Confirmation */}
      {showSaveConfirm && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="ri-check-circle-fill text-2xl text-green-600"></i>
          <div>
            <p className="font-semibold text-green-900">Saved to Supabase!</p>
            <p className="text-sm text-green-700">
              Promotional cards will persist after refresh
            </p>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Card Preview */}
            <div className={`bg-gradient-to-br ${card.bgColor} p-6`}>
              <div className="text-center space-y-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.subtitle}</p>
              </div>
              <div className="flex justify-center">
                <div className="w-full h-40">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="p-4 bg-gray-50 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(card)}
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-1"></i>Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(card.id)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className={`flex-1 px-4 py-2 border rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                    index === 0
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <i className="ri-arrow-up-line mr-1"></i>Up
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === cards.length - 1}
                  className={`flex-1 px-4 py-2 border rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                    index === cards.length - 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <i className="ri-arrow-down-line mr-1"></i>Down
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Promotional Card</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingCard.title}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={editingCard.subtitle}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, subtitle: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>

              {/* Image Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Image</label>

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
                {editingCard.image && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3 bg-gray-50" style={{ height: '80px' }}>
                    <img
                      src={editingCard.image}
                      alt="Preview"
                      className="w-full h-full object-contain"
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
                    value={editingCard.image}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, image: e.target.value })
                    }
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Or paste an image URL…"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Gradient
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {BG_COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setEditingCard({ ...editingCard, bgColor: option.value })
                      }
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        editingCard.bgColor === option.value
                          ? 'border-gray-900 ring-2 ring-gray-900'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div
                        className={`h-12 rounded-lg bg-gradient-to-br ${option.value} mb-2`}
                      ></div>
                      <p className="text-xs font-medium text-gray-700 text-center">
                        {option.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                <i className="ri-save-line mr-2"></i>Save Changes
              </button>
              <button
                onClick={() => setEditingCard(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-alert-line text-2xl text-red-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Card?</h3>
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
    </div>
  );
};

export default PromotionalPage;
