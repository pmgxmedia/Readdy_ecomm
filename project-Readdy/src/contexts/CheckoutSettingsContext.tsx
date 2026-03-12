import { createContext, useContext, useState, ReactNode } from 'react';

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  enabled: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

interface CheckoutSettings {
  checkoutEnabled: boolean;
  maintenanceMessage: string;
  taxRate: number;
  shippingMethods: ShippingMethod[];
  promoCodes: PromoCode[];
  paymentMethods: PaymentMethod[];
}

interface CheckoutSettingsContextType {
  settings: CheckoutSettings;
  updateCheckoutEnabled: (enabled: boolean) => void;
  updateMaintenanceMessage: (message: string) => void;
  updateTaxRate: (rate: number) => void;
  addShippingMethod: (method: Omit<ShippingMethod, 'id'>) => void;
  updateShippingMethod: (id: string, method: Partial<ShippingMethod>) => void;
  deleteShippingMethod: (id: string) => void;
  addPromoCode: (code: Omit<PromoCode, 'id' | 'usedCount'>) => void;
  updatePromoCode: (id: string, code: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;
  updatePaymentMethod: (id: string, enabled: boolean) => void;
}

const CheckoutSettingsContext = createContext<CheckoutSettingsContextType | undefined>(undefined);

const defaultShippingMethods: ShippingMethod[] = [
  { id: '1', name: 'Free Shipping', price: 0, estimatedDays: '7-10 days', enabled: true },
  { id: '2', name: 'Standard Shipping', price: 15, estimatedDays: '4-6 days', enabled: true },
  { id: '3', name: 'Express Shipping', price: 35, estimatedDays: '2-3 days', enabled: true },
];

const defaultPromoCodes: PromoCode[] = [
  { id: '1', code: 'SAVE10', discountType: 'percentage', discountValue: 10, expiryDate: '2025-12-31', usageLimit: 100, usedCount: 23, active: true },
  { id: '2', code: 'SAVE20', discountType: 'percentage', discountValue: 20, expiryDate: '2025-06-30', usageLimit: 50, usedCount: 12, active: true },
  { id: '3', code: 'WELCOME15', discountType: 'percentage', discountValue: 15, expiryDate: '2025-12-31', usageLimit: 200, usedCount: 45, active: true },
  { id: '4', code: 'FREESHIP', discountType: 'flat', discountValue: 15, expiryDate: '2025-12-31', usageLimit: 150, usedCount: 67, active: true },
];

const defaultPaymentMethods: PaymentMethod[] = [
  { id: '1', name: 'Credit Card', enabled: true },
  { id: '2', name: 'PayPal', enabled: true },
  { id: '3', name: 'Apple Pay', enabled: false },
  { id: '4', name: 'Google Pay', enabled: false },
];

export function CheckoutSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CheckoutSettings>({
    checkoutEnabled: true,
    maintenanceMessage: 'Checkout is temporarily unavailable. Please try again later.',
    taxRate: 8.5,
    shippingMethods: defaultShippingMethods,
    promoCodes: defaultPromoCodes,
    paymentMethods: defaultPaymentMethods,
  });

  const updateCheckoutEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, checkoutEnabled: enabled }));
  };

  const updateMaintenanceMessage = (message: string) => {
    setSettings(prev => ({ ...prev, maintenanceMessage: message }));
  };

  const updateTaxRate = (rate: number) => {
    setSettings(prev => ({ ...prev, taxRate: rate }));
  };

  const addShippingMethod = (method: Omit<ShippingMethod, 'id'>) => {
    const newMethod = { ...method, id: Date.now().toString() };
    setSettings(prev => ({
      ...prev,
      shippingMethods: [...prev.shippingMethods, newMethod],
    }));
  };

  const updateShippingMethod = (id: string, method: Partial<ShippingMethod>) => {
    setSettings(prev => ({
      ...prev,
      shippingMethods: prev.shippingMethods.map(m => (m.id === id ? { ...m, ...method } : m)),
    }));
  };

  const deleteShippingMethod = (id: string) => {
    setSettings(prev => ({
      ...prev,
      shippingMethods: prev.shippingMethods.filter(m => m.id !== id),
    }));
  };

  const addPromoCode = (code: Omit<PromoCode, 'id' | 'usedCount'>) => {
    const newCode = { ...code, id: Date.now().toString(), usedCount: 0 };
    setSettings(prev => ({
      ...prev,
      promoCodes: [...prev.promoCodes, newCode],
    }));
  };

  const updatePromoCode = (id: string, code: Partial<PromoCode>) => {
    setSettings(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.map(c => (c.id === id ? { ...c, ...code } : c)),
    }));
  };

  const deletePromoCode = (id: string) => {
    setSettings(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.filter(c => c.id !== id),
    }));
  };

  const updatePaymentMethod = (id: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(p => (p.id === id ? { ...p, enabled } : p)),
    }));
  };

  return (
    <CheckoutSettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </CheckoutSettingsContext.Provider>
  );
}

export function useCheckoutSettings() {
  const context = useContext(CheckoutSettingsContext);
  if (context === undefined) {
    throw new Error('useCheckoutSettings must be used within a CheckoutSettingsProvider');
  }
  return context;
}