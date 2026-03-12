import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import FavoritesSidebar from './FavoritesSidebar';
import AnnouncementBar from './AnnouncementBar';
import { useCart } from '../../hooks/useCart';
import { useFavorites } from '../../hooks/useFavorites';
import { useAdminStore } from '../../contexts/AdminStoreContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useDarkMode } from '../../contexts/DarkModeContext';

const CurrencySwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors whitespace-nowrap"
      >
        <span className="font-semibold text-gray-800">{currency.symbol}</span>
        <span>{currency.code}</span>
        <i className={`ri-arrow-down-s-line text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className={`absolute ${compact ? 'left-0' : 'right-0'} mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50`}>
          {availableCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors whitespace-nowrap
                ${currency.code === c.code
                  ? 'bg-gray-50 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-6 text-center font-medium text-gray-800">{c.symbol}</span>
                <span>{c.code}</span>
              </span>
              <span className="text-xs text-gray-400">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { getTotalFavorites } = useFavorites();
  const { storeName, navLinks } = useAdminStore();
  const { isDark, toggleDarkMode } = useDarkMode();

  const visibleLinks = (navLinks || []).filter((l) => l.visible);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="sticky top-0 z-50">
        <header className="bg-white dark:bg-gray-900 shadow-sm dark:border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white cursor-pointer" style={{ fontFamily: '\'Playfair Display\', serif' }}>
                  {storeName}
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.id}
                    to={link.url}
                    className={`font-medium cursor-pointer whitespace-nowrap ${isActive(link.url) ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right Icons */}
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2">
                  {/* Currency Switcher */}
                  <CurrencySwitcher />

                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    <i className={`${isDark ? 'ri-sun-line' : 'ri-moon-line'} text-xl`}></i>
                  </button>

                  <button
                    onClick={() => navigate('/contact')}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                  >
                    <i className="ri-user-line text-xl"></i>
                  </button>
                  <button
                    onClick={() => setIsFavoritesOpen(true)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer relative"
                  >
                    <i className="ri-heart-line text-xl"></i>
                    {getTotalFavorites() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalFavorites()}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer relative"
                  >
                    <i className="ri-shopping-bag-line text-xl"></i>
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden py-4 border-t dark:border-gray-700">
                <nav className="flex flex-col space-y-4">
                  {visibleLinks.map((link) => (
                    <Link
                      key={link.id}
                      to={link.url}
                      className={`font-medium cursor-pointer ${isActive(link.url) ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center space-x-3 mt-4 pt-4 border-t dark:border-gray-700 flex-wrap gap-y-2">
                  {/* Currency Switcher (mobile) */}
                  <CurrencySwitcher compact />

                  {/* Dark Mode Toggle (mobile) */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    <i className={`${isDark ? 'ri-sun-line' : 'ri-moon-line'} text-xl`}></i>
                  </button>

                  <button onClick={() => { navigate('/contact'); setIsMenuOpen(false); }} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                    <i className="ri-user-line text-xl"></i>
                  </button>
                  <button onClick={() => { setIsFavoritesOpen(true); setIsMenuOpen(false); }} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer relative">
                    <i className="ri-heart-line text-xl"></i>
                    {getTotalFavorites() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalFavorites()}
                      </span>
                    )}
                  </button>
                  <button onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer relative">
                    <i className="ri-shopping-bag-line text-xl"></i>
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <AnnouncementBar />
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <FavoritesSidebar isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />
    </>
  );
};

export default Header;
