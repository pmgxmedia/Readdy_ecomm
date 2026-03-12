import { useState } from 'react';
import { useCurrency } from '../../../contexts/CurrencyContext';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

export default function CurrencyPage() {
  const { currency, setCurrency } = useCurrency();
  const [saved, setSaved] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const handleSave = () => {
    setCurrency(selectedCurrency);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatPrice = (price: number, curr: typeof currency) => {
    if (curr.code === 'JPY') {
      return `${curr.symbol}${Math.round(price * 110)}`;
    }
    return `${curr.symbol}${price.toFixed(2)}`;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Currency Settings</h1>
        <p className="text-sm text-gray-600">Select the global currency for your entire platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Currency Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Select Currency</h2>
          
          <div className="space-y-3">
            {currencies.map((curr) => (
              <label
                key={curr.code}
                className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-gray-400"
                style={{
                  borderColor: selectedCurrency.code === curr.code ? '#000' : '#e5e7eb',
                  backgroundColor: selectedCurrency.code === curr.code ? '#f9fafb' : '#fff'
                }}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="currency"
                    checked={selectedCurrency.code === curr.code}
                    onChange={() => setSelectedCurrency(curr)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{curr.name}</div>
                    <div className="text-xs text-gray-500">{curr.code}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{curr.symbol}</div>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Save Currency
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <i className="ri-check-line text-lg"></i>
                <span>Currency updated globally</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Live Preview</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-500 mb-3">How prices will display:</p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product Price</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(299, selectedCurrency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Discounted Price</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg line-through text-gray-400">{formatPrice(399, selectedCurrency)}</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(299, selectedCurrency)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Cart Total</span>
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(897, selectedCurrency)}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <i className="ri-information-line text-amber-600 text-lg flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">Global Impact</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Changing the currency will update all prices across the entire platform including shop pages, cart, checkout, and all product sections.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-900">Affected Areas:</p>
              <div className="grid grid-cols-2 gap-2">
                {['Shop Page', 'Cart Sidebar', 'Checkout', 'Featured Products', 'Recommended Items', 'Product Cards'].map((area) => (
                  <div key={area} className="flex items-center gap-2 text-xs text-gray-600">
                    <i className="ri-check-line text-green-600"></i>
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}