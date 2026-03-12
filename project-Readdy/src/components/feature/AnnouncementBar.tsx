import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../contexts/AdminStoreContext';

const AnnouncementBar = () => {
  const { announcementBar } = useAdminStore();
  const [dismissed, setDismissed] = useState(false);

  if (!announcementBar?.enabled || dismissed) return null;

  const bgColor = announcementBar.bgColor || '#0f766e';
  const textColor = announcementBar.textColor || '#ffffff';

  const content = (
    <span className="flex items-center gap-2">
      {announcementBar.icon && (
        <span className="w-4 h-4 flex items-center justify-center">
          <i className={`${announcementBar.icon} text-sm`}></i>
        </span>
      )}
      <span className="font-medium text-sm">{announcementBar.message}</span>
      {announcementBar.linkLabel && announcementBar.linkUrl && (
        <span className="underline underline-offset-2 font-semibold text-sm opacity-90 hover:opacity-100 ml-1">
          {announcementBar.linkLabel} →
        </span>
      )}
    </span>
  );

  return (
    <div
      className="w-full relative flex items-center justify-center px-10 py-2.5 transition-all dark:brightness-90"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {announcementBar.linkUrl ? (
        <Link to={announcementBar.linkUrl} className="cursor-pointer hover:opacity-90 transition-opacity">
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}

      {announcementBar.dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          style={{ color: textColor }}
          aria-label="Dismiss"
        >
          <i className="ri-close-line text-sm"></i>
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;