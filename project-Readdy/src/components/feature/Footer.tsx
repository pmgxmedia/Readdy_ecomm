import { useRef, useState } from 'react';
import { useAdminStore } from '../../contexts/AdminStoreContext';
import AdminAuthModal from './AdminAuthModal';

const Footer = () => {
  const { footerContent } = useAdminStore();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBrandDoubleClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 2) {
      clickCountRef.current = 0;
      setShowAuthModal(true);
    } else {
      clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 400);
    }
  };

  return (
    <>
      {showAuthModal && <AdminAuthModal onClose={() => setShowAuthModal(false)} />}

      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Newsletter Section */}
        <div className="border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Get the latest updates on new products, exclusive deals, and tech innovations delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
                <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div
                className="text-3xl font-bold cursor-pointer select-none"
                style={{ fontFamily: '"Pacifico", serif' }}
                onClick={handleBrandDoubleClick}
                title="Double-click for admin access"
              >
                {footerContent.brandName}
              </div>
              <p className="text-gray-300 leading-relaxed">{footerContent.tagline}</p>
              <div className="flex space-x-4">
                {footerContent.socialLinks.facebook && (
                  <a href={footerContent.socialLinks.facebook} target="_blank" rel="nofollow noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                    <i className="ri-facebook-fill text-lg"></i>
                  </a>
                )}
                {footerContent.socialLinks.twitter && (
                  <a href={footerContent.socialLinks.twitter} target="_blank" rel="nofollow noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                    <i className="ri-twitter-fill text-lg"></i>
                  </a>
                )}
                {footerContent.socialLinks.instagram && (
                  <a href={footerContent.socialLinks.instagram} target="_blank" rel="nofollow noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                    <i className="ri-instagram-fill text-lg"></i>
                  </a>
                )}
                {footerContent.socialLinks.youtube && (
                  <a href={footerContent.socialLinks.youtube} target="_blank" rel="nofollow noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                    <i className="ri-youtube-fill text-lg"></i>
                  </a>
                )}
              </div>
            </div>

            {/* Products Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Products</h4>
              <ul className="space-y-3">
                {footerContent.productsLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} className="text-gray-300 hover:text-teal-400 transition-colors cursor-pointer">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {footerContent.supportLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} className="text-gray-300 hover:text-teal-400 transition-colors cursor-pointer">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-4">
                {footerContent.contactInfo.address && (
                  <div className="flex items-start space-x-3">
                    <i className="ri-map-pin-line text-teal-400 mt-1"></i>
                    <div className="text-gray-300 text-sm">{footerContent.contactInfo.address}</div>
                  </div>
                )}
                {footerContent.contactInfo.phone && (
                  <div className="flex items-center space-x-3">
                    <i className="ri-phone-line text-teal-400"></i>
                    <a href={`tel:${footerContent.contactInfo.phone}`} className="text-gray-300 hover:text-teal-400 transition-colors cursor-pointer text-sm">
                      {footerContent.contactInfo.phone}
                    </a>
                  </div>
                )}
                {footerContent.contactInfo.email && (
                  <div className="flex items-center space-x-3">
                    <i className="ri-mail-line text-teal-400"></i>
                    <a href={`mailto:${footerContent.contactInfo.email}`} className="text-gray-300 hover:text-teal-400 transition-colors cursor-pointer text-sm">
                      {footerContent.contactInfo.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-gray-400 text-sm text-center lg:text-left">{footerContent.copyright}</div>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors cursor-pointer">Privacy Policy</a>
                <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors cursor-pointer">Terms of Service</a>
                <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors cursor-pointer">Cookie Policy</a>
                <a href="https://readdy.ai/?origin=logo" rel="nofollow" className="text-gray-300 hover:text-teal-400 transition-colors cursor-pointer">Website Builder</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm mr-2">We Accept:</span>
                <div className="flex gap-2">
                  {['ri-visa-line', 'ri-mastercard-line', 'ri-paypal-line', 'ri-bank-card-line'].map((icon) => (
                    <div key={icon} className="w-8 h-6 bg-gray-700 rounded flex items-center justify-center">
                      <i className={`${icon} text-white text-xs`}></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            {footerContent.showTrustBadges && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex flex-wrap justify-center items-center gap-8">
                  <div className="flex items-center gap-2 text-gray-400 text-sm"><i className="ri-shield-check-line text-green-400"></i><span>SSL Secured</span></div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm"><i className="ri-truck-line text-teal-400"></i><span>Free Shipping</span></div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm"><i className="ri-award-line text-yellow-400"></i><span>Quality Guaranteed</span></div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm"><i className="ri-customer-service-line text-teal-400"></i><span>24/7 Support</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
