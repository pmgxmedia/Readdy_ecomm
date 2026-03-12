import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { AppRoutes } from './router';
import { AdminStoreProvider, useAdminStore } from './contexts/AdminStoreContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CheckoutSettingsProvider } from './contexts/CheckoutSettingsContext';
import { CartProvider } from './hooks/useCart';
import { FavoritesProvider } from './hooks/useFavorites';
import { DarkModeProvider } from './contexts/DarkModeContext';

function AppInner() {
  const { settingsLoading, storeName } = useAdminStore();

  useEffect(() => {
    if (storeName) {
      document.title = `${storeName} - Premium Audio Store`;
    }
  }, [storeName]);

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading store settings…</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <FavoritesProvider>
        <AppRoutes />
      </FavoritesProvider>
    </CartProvider>
  );
}

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <CurrencyProvider>
        <CheckoutSettingsProvider>
          <AdminStoreProvider>
            <DarkModeProvider>
              <AppInner />
            </DarkModeProvider>
          </AdminStoreProvider>
        </CheckoutSettingsProvider>
      </CurrencyProvider>
    </BrowserRouter>
  );
}

export default App;
