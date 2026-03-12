import { useState } from 'react';
import { useCheckoutSettings } from '../../../contexts/CheckoutSettingsContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

export default function CheckoutPage() {
  const {
    settings,
    updateCheckoutEnabled,
    updateMaintenanceMessage,
    updateTaxRate,
    addShippingMethod,
    updateShippingMethod,
    deleteShippingMethod,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    updatePaymentMethod,
  } = useCheckoutSettings();

  const { currency } = useCurrency();

  const [maintenanceMsg, setMaintenanceMsg] = useState(settings.maintenanceMessage);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());

  // Shipping Method Modal
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [editingShipping, setEditingShipping] = useState<string | null>(null);
  const [shippingForm, setShippingForm] = useState({
    name: '',
    price: '',
    estimatedDays: '',
    enabled: true,
  });

  // Promo Code Modal
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountType: 'percentage' as 'flat' | 'percentage',
    discountValue: '',
    expiryDate: '',
    usageLimit: '',
    active: true,
  });

  const handleSaveMaintenanceMessage = () => {
    updateMaintenanceMessage(maintenanceMsg);
  };

  const handleSaveTaxRate = () => {
    const rate = parseFloat(taxRate);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      updateTaxRate(rate);
    }
  };

  const handleOpenShippingModal = (id?: string) => {
    if (id) {
      const method = settings.shippingMethods.find(m => m.id === id);
      if (method) {
        setEditingShipping(id);
        setShippingForm({
          name: method.name,
          price: method.price.toString(),
          estimatedDays: method.estimatedDays,
          enabled: method.enabled,
        });
      }
    } else {
      setEditingShipping(null);
      setShippingForm({ name: '', price: '', estimatedDays: '', enabled: true });
    }
    setShowShippingModal(true);
  };

  const handleSaveShippingMethod = () => {
    const price = parseFloat(shippingForm.price);
    if (!shippingForm.name || isNaN(price) || !shippingForm.estimatedDays) return;

    if (editingShipping) {
      updateShippingMethod(editingShipping, {
        name: shippingForm.name,
        price,
        estimatedDays: shippingForm.estimatedDays,
        enabled: shippingForm.enabled,
      });
    } else {
      addShippingMethod({
        name: shippingForm.name,
        price,
        estimatedDays: shippingForm.estimatedDays,
        enabled: shippingForm.enabled,
      });
    }
    setShowShippingModal(false);
  };

  const handleOpenPromoModal = (id?: string) => {
    if (id) {
      const code = settings.promoCodes.find(c => c.id === id);
      if (code) {
        setEditingPromo(id);
        setPromoForm({
          code: code.code,
          discountType: code.discountType,
          discountValue: code.discountValue.toString(),
          expiryDate: code.expiryDate,
          usageLimit: code.usageLimit.toString(),
          active: code.active,
        });
      }
    } else {
      setEditingPromo(null);
      setPromoForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: '',
        usageLimit: '',
        active: true,
      });
    }
    setShowPromoModal(true);
  };

  const handleSavePromoCode = () => {
    const discountValue = parseFloat(promoForm.discountValue);
    const usageLimit = parseInt(promoForm.usageLimit);
    if (!promoForm.code || isNaN(discountValue) || isNaN(usageLimit) || !promoForm.expiryDate) return;

    if (editingPromo) {
      updatePromoCode(editingPromo, {
        code: promoForm.code.toUpperCase(),
        discountType: promoForm.discountType,
        discountValue,
        expiryDate: promoForm.expiryDate,
        usageLimit,
        active: promoForm.active,
      });
    } else {
      addPromoCode({
        code: promoForm.code.toUpperCase(),
        discountType: promoForm.discountType,
        discountValue,
        expiryDate: promoForm.expiryDate,
        usageLimit,
        active: promoForm.active,
      });
    }
    setShowPromoModal(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout Management</h1>
        <p className="text-gray-600">Configure checkout settings, shipping methods, promo codes, and payment options</p>
      </div>

      {/* Global Checkout Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Checkout Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Enable Checkout</h3>
              <p className="text-sm text-gray-500">Allow customers to complete purchases</p>
            </div>
            <button
              onClick={() => updateCheckoutEnabled(!settings.checkoutEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.checkoutEnabled ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.checkoutEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Maintenance Message
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Message to show when checkout is disabled"
              />
              <button
                onClick={handleSaveMaintenanceMessage}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 whitespace-nowrap"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Configuration</h2>
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Global Tax Rate (%)
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="8.5"
            />
          </div>
          <button
            onClick={handleSaveTaxRate}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 whitespace-nowrap"
          >
            Update Tax Rate
          </button>
        </div>
      </div>

      {/* Shipping Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Shipping Methods</h2>
          <button
            onClick={() => handleOpenShippingModal()}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Add Method
          </button>
        </div>

        <div className="space-y-3">
          {settings.shippingMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => updateShippingMethod(method.id, { enabled: !method.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    method.enabled ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{method.name}</h3>
                  <p className="text-sm text-gray-500">
                    {currency.symbol}{method.price.toFixed(2)} • {method.estimatedDays}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenShippingModal(method.id)}
                  className="p-2 text-gray-600 hover:text-teal-500 hover:bg-teal-50 rounded-lg"
                >
                  <i className="ri-edit-line"></i>
                </button>
                <button
                  onClick={() => deleteShippingMethod(method.id)}
                  className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Codes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Promo Codes</h2>
          <button
            onClick={() => handleOpenPromoModal()}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Create Code
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Code</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Discount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Expiry Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Usage</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.promoCodes.map((code) => (
                <tr key={code.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm font-medium text-gray-900">{code.code}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {code.discountType === 'percentage' ? `${code.discountValue}%` : `${currency.symbol}${code.discountValue}`}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{code.expiryDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {code.usedCount} / {code.usageLimit}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        code.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {code.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => updatePromoCode(code.id, { active: !code.active })}
                        className="p-2 text-gray-600 hover:text-teal-500 hover:bg-teal-50 rounded-lg"
                      >
                        <i className={code.active ? 'ri-pause-circle-line' : 'ri-play-circle-line'}></i>
                      </button>
                      <button
                        onClick={() => handleOpenPromoModal(code.id)}
                        className="p-2 text-gray-600 hover:text-teal-500 hover:bg-teal-50 rounded-lg"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => deletePromoCode(code.id)}
                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h2>
        
        <div className="space-y-3">
          {settings.paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                  {method.name === 'Credit Card' && <i className="ri-bank-card-line text-xl text-gray-700"></i>}
                  {method.name === 'PayPal' && <i className="ri-paypal-line text-xl text-gray-700"></i>}
                  {method.name === 'Apple Pay' && <i className="ri-apple-line text-xl text-gray-700"></i>}
                  {method.name === 'Google Pay' && <i className="ri-google-line text-xl text-gray-700"></i>}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{method.name}</h3>
                  <p className="text-sm text-gray-500">
                    {method.enabled ? 'Enabled for checkout' : 'Disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => updatePaymentMethod(method.id, !method.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  method.enabled ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    method.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Method Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingShipping ? 'Edit Shipping Method' : 'Add Shipping Method'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Method Name</label>
                <input
                  type="text"
                  value={shippingForm.name}
                  onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Express Shipping"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Price ({currency.symbol})</label>
                <input
                  type="number"
                  value={shippingForm.price}
                  onChange={(e) => setShippingForm({ ...shippingForm, price: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Estimated Delivery</label>
                <input
                  type="text"
                  value={shippingForm.estimatedDays}
                  onChange={(e) => setShippingForm({ ...shippingForm, estimatedDays: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 2-3 days"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Enable Method</label>
                <button
                  onClick={() => setShippingForm({ ...shippingForm, enabled: !shippingForm.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    shippingForm.enabled ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shippingForm.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowShippingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShippingMethod}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 whitespace-nowrap"
              >
                {editingShipping ? 'Update' : 'Add'} Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Code</label>
                <input
                  type="text"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="SAVE20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Discount Type</label>
                <select
                  value={promoForm.discountType}
                  onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as 'flat' | 'percentage' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount ({currency.symbol})</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Discount Value</label>
                <input
                  type="number"
                  value={promoForm.discountValue}
                  onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={promoForm.discountType === 'percentage' ? '10' : '15.00'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={promoForm.expiryDate}
                  onChange={(e) => setPromoForm({ ...promoForm, expiryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Usage Limit</label>
                <input
                  type="number"
                  value={promoForm.usageLimit}
                  onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="100"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Active</label>
                <button
                  onClick={() => setPromoForm({ ...promoForm, active: !promoForm.active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    promoForm.active ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      promoForm.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPromoModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePromoCode}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 whitespace-nowrap"
              >
                {editingPromo ? 'Update' : 'Create'} Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}