
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface CartSidebarProps {
  /** Controls whether the sidebar is visible */
  isOpen: boolean;
  /** Callback to close the sidebar */
  onClose: () => void;
}

/**
 * Shopping cart sidebar component.
 * Handles displaying cart items, quantity updates, removal and checkout navigation.
 */
const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  const navigate = useNavigate();

  /** Navigate to checkout page and close the sidebar */
  const handleCheckout = () => {
    try {
      navigate('/checkout');
      onClose();
    } catch (error) {
      console.error('Failed to navigate to checkout:', error);
    }
  };

  /** Close sidebar when clicking outside of it */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('cart-sidebar');
      const target = event.target as Node;
      if (isOpen && sidebar && !sidebar.contains(target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" />
      )}

      {/* Sidebar */}
      <div
        id="cart-sidebar"
        className={`
          fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl z-50 border-l dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Shopping Cart ({getTotalItems()})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer"
              aria-label="Close cart sidebar"
            >
              <i className="ri-close-line text-xl text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-shopping-bag-line text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">Your cart is empty</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Add some products to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer text-sm"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-l border-r border-gray-300 dark:border-gray-600 text-sm dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with total and checkout */}
          <div className="p-6 border-t dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 dark:text-gray-300">Total</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#2563EB] text-white py-2 rounded hover:bg-[#1d4ed8] transition cursor-pointer whitespace-nowrap"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
