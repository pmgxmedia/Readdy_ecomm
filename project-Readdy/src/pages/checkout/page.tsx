import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCheckoutSettings } from '../../contexts/CheckoutSettingsContext';
import { supabase } from '../../lib/supabase';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems: items, getTotalPrice, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const {
    settings: {
      checkoutEnabled,
      maintenanceMessage,
      taxRate,
      shippingMethods,
      promoCodes,
      paymentMethods,
    }
  } = useCheckoutSettings();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState('credit_card');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Set default shipping method
  useEffect(() => {
    const enabledShipping = shippingMethods.filter(m => m.enabled);
    if (enabledShipping.length > 0 && !selectedShipping) {
      setSelectedShipping(enabledShipping[0]);
    }
  }, [shippingMethods, selectedShipping]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderConfirmed) {
      navigate('/shop');
    }
  }, [items, navigate, orderConfirmed]);

  // Calculate totals
  const subtotal = getTotalPrice();
  const discount = appliedPromo
    ? appliedPromo.discountType === 'percentage'
      ? (subtotal * appliedPromo.discountValue) / 100
      : appliedPromo.discountValue
    : 0;
  const subtotalAfterDiscount = subtotal - discount;
  const tax = (subtotalAfterDiscount * taxRate) / 100;
  const shipping = selectedShipping?.price || 0;
  const total = subtotalAfterDiscount + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.zipCode) errors.zipCode = 'ZIP code is required';
    if (!formData.country) errors.country = 'Country is required';
    if (!formData.phone) errors.phone = 'Phone is required';
    else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) errors.phone = 'Phone number is invalid';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCodes.find(
      p => p.code.toUpperCase() === promoCode.toUpperCase() &&
        p.active &&
        p.usedCount < p.usageLimit &&
        new Date(p.expiryDate) > new Date()
    );
    if (code) {
      setAppliedPromo(code);
    } else {
      setPromoError('Invalid or expired promo code');
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const orderNum = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const orderPayload = {
      order_number: orderNum,
      customer_name: `${formData.firstName} ${formData.lastName}`,
      customer_email: formData.email,
      customer_phone: formData.phone,
      shipping_address: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        country: formData.country,
      },
      items: items.map(item => ({
        id: String(item.id),
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping_cost: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      currency: currency.code,
      status: 'Processing',
      payment_status: 'Pending',
      payment_method: selectedPayment,
      notes: appliedPromo ? `Promo code applied: ${appliedPromo.code}` : null,
    };

    const { error } = await supabase.from('Orders').insert([orderPayload]);

    if (error) {
      setSubmitError('Failed to place order. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setOrderNumber(orderNum);
    setOrderConfirmed(true);
    clearCart();
    setIsSubmitting(false);
  };

  // Checkout disabled view
  if (!checkoutEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-tools-line text-3xl text-yellow-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Unavailable</h2>
          <p className="text-gray-600 mb-6">{maintenanceMessage}</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Order confirmation view
  if (orderConfirmed) {
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (selectedShipping?.estimatedDays || 7));

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-4xl text-green-600"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been saved.</p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">Order Number</span>
                <span className="font-mono font-semibold text-gray-900">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">Estimated Delivery</span>
                <span className="font-semibold text-gray-900">
                  {estimatedDelivery.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount ({appliedPromo.code})</span>
                    <span className="text-green-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/shop')}
                className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout form view
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <i className="ri-error-warning-line text-red-500 text-xl"></i>
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="you@example.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                      {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                      {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="123 Main Street" />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`} />
                      {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.state ? 'border-red-500' : 'border-gray-300'}`} />
                      {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.zipCode ? 'border-red-500' : 'border-gray-300'}`} />
                      {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input type="text" name="country" value={formData.country} onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm ${formErrors.country ? 'border-red-500' : 'border-gray-300'}`} />
                      {formErrors.country && <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Method</h2>
                <div className="space-y-3">
                  {shippingMethods.filter(m => m.enabled).map((method) => (
                    <label key={method.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedShipping?.id === method.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center">
                        <input type="radio" name="shipping" checked={selectedShipping?.id === method.id}
                          onChange={() => setSelectedShipping(method)} className="w-4 h-4 text-black focus:ring-black" />
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.estimatedDays} business days</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {method.price === 0 ? 'Free' : formatPrice(method.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.filter(p => p.enabled).map((method) => {
                    const iconMap: Record<string, string> = {
                      'Credit Card': 'ri-bank-card-line',
                      'PayPal': 'ri-paypal-line',
                      'Apple Pay': 'ri-apple-line',
                      'Google Pay': 'ri-google-line',
                    };
                    const valueMap: Record<string, string> = {
                      'Credit Card': 'credit_card',
                      'PayPal': 'paypal',
                      'Apple Pay': 'apple_pay',
                      'Google Pay': 'google_pay',
                    };
                    const value = valueMap[method.name] || method.id;
                    return (
                      <label key={method.id}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPayment === value ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value={value} checked={selectedPayment === value}
                          onChange={(e) => setSelectedPayment(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <i className={`${iconMap[method.name] || 'ri-money-dollar-circle-line'} text-xl text-gray-700 ml-3`}></i>
                        <span className="ml-3 font-medium text-gray-900">{method.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="ri-check-line text-green-600 mr-2"></i>
                      <span className="text-sm font-medium text-green-800">{appliedPromo.code}</span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-sm text-red-600 hover:text-red-700 whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-red-500 text-xs mt-1">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      Discount ({appliedPromo.discountType === 'percentage' 
                        ? `${appliedPromo.discountValue}%` 
                        : formatPrice(appliedPromo.discountValue)})
                    </span>
                    <span className="text-green-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({taxRate}%)</span>
                  <span className="text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-lg"></i>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}