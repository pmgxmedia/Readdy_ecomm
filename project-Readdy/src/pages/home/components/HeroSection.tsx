import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../contexts/AdminStoreContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const { heroContent } = useAdminStore();

  const handleBuyNowClick = () => {
    navigate(heroContent.ctaUrl);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroContent.backgroundImage}
          alt="Hero Background"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-white/10 dark:bg-black/30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-5 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Main Heading */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                {heroContent.heading1}
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                {heroContent.heading2}
              </h1>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {heroContent.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <button
                onClick={handleBuyNowClick}
                className="w-full sm:w-auto bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 whitespace-nowrap cursor-pointer transform hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                {heroContent.ctaLabel}
              </button>
            </div>
          </div>

          {/* Right Column - Product Image */}
          <div className="flex justify-center items-center">
            {/* Image removed as requested */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
