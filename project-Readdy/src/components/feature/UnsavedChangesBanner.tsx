import { useEffect, useState } from 'react';

interface UnsavedChangesBannerProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}

const UnsavedChangesBanner = ({
  hasChanges,
  onSave,
  onDiscard,
  isSaving = false,
}: UnsavedChangesBannerProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasChanges) {
      setVisible(true);
    } else {
      // Slight delay before hiding so the "saved" state feels smooth
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [hasChanges]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-4 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-700 min-w-[420px]">
        {/* Icon + message */}
        <div className="w-8 h-8 flex items-center justify-center bg-amber-500/20 rounded-full flex-shrink-0">
          <i className="ri-edit-line text-amber-400 text-base"></i>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white leading-tight">Unsaved changes</p>
          <p className="text-xs text-gray-400 mt-0.5">You have edits that haven&apos;t been saved yet.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm"></i>
                Saving…
              </>
            ) : (
              <>
                <i className="ri-save-line text-sm"></i>
                Save now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesBanner;
