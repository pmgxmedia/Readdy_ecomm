import { useState } from 'react';

interface ProductImagesProps {
  image: string;
  name: string;
}

const ProductImages = ({ image, name }: ProductImagesProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const thumbnails = [image, image, image, image];

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      {/* Main Image */}
      <div
        className={`relative bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden cursor-zoom-in ${isZoomed ? 'cursor-zoom-out' : ''}`}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <div className="aspect-square flex items-center justify-center p-4 sm:p-8">
          <img
            src={thumbnails[activeThumb]}
            alt={name}
            className={`w-full h-full object-contain transition-transform duration-500 ${isZoomed ? 'scale-125' : 'scale-100 hover:scale-105'}`}
          />
        </div>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-sm">
          <i className={`${isZoomed ? 'ri-zoom-out-line' : 'ri-zoom-in-line'} text-gray-600 dark:text-gray-300 text-xs sm:text-sm`}></i>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 sm:gap-3">
        {thumbnails.map((thumb, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveThumb(idx); setIsZoomed(false); }}
            className={`flex-1 aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
              idx === activeThumb
                ? 'border-gray-900 dark:border-teal-500'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <img
              src={thumb}
              alt={`${name} view ${idx + 1}`}
              className="w-full h-full object-contain p-1 sm:p-2"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
