import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../contexts/AdminStoreContext';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Transaction {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;
}

const AdminDashboard = () => {
  const { popularProducts, lowStockThreshold } = useAdminStore();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [transactions] = useState<Transaction[]>([
    { id: '1', orderId: '#ORD-2025-001', customer: 'John Smith', amount: 299, status: 'Paid', date: '2025-01-15' },
    { id: '2', orderId: '#ORD-2025-002', customer: 'Emma Wilson', amount: 199, status: 'Paid', date: '2025-01-15' },
    { id: '3', orderId: '#ORD-2025-003', customer: 'Michael Brown', amount: 349, status: 'Pending', date: '2025-01-14' },
    { id: '4', orderId: '#ORD-2025-004', customer: 'Sarah Davis', amount: 249, status: 'Paid', date: '2025-01-14' },
    { id: '5', orderId: '#ORD-2025-005', customer: 'James Johnson', amount: 129, status: 'Failed', date: '2025-01-13' },
    { id: '6', orderId: '#ORD-2025-006', customer: 'Lisa Anderson', amount: 399, status: 'Paid', date: '2025-01-13' },
    { id: '7', orderId: '#ORD-2025-007', customer: 'David Martinez', amount: 179, status: 'Paid', date: '2025-01-12' },
    { id: '8', orderId: '#ORD-2025-008', customer: 'Jennifer Taylor', amount: 279, status: 'Pending', date: '2025-01-12' },
  ]);

  const handleRestock = (productId: string) => {
    navigate(`/admin/content/popular?restock=${productId}`);
  };

  // Derive inventory rows from real product data
  const inventory = popularProducts.map((p) => {
    const stock = p.stock ?? 0;
    const isOut = stock === 0;
    const isLow = lowStockThreshold > 0 && stock > 0 && stock <= lowStockThreshold;
    const status: 'In Stock' | 'Low' | 'Out' = isOut ? 'Out' : isLow ? 'Low' : 'In Stock';
    return { id: p.id, name: p.name, stock, status, category: p.category };
  });

  const lowStockItems = inventory.filter((i) => i.status === 'Low');
  const outOfStockItems = inventory.filter((i) => i.status === 'Out');
  const alertCount = lowStockItems.length + outOfStockItems.length;

  const stats = [
    { label: 'Total Orders', value: '1,247', icon: 'ri-shopping-cart-line', color: 'bg-teal-500' },
    { label: 'Total Revenue', value: formatPrice(124567), icon: 'ri-money-dollar-circle-line', color: 'bg-green-500' },
    { label: 'Total Products', value: String(popularProducts.length), icon: 'ri-box-line', color: 'bg-orange-400' },
    { label: 'Active Users', value: '3,892', icon: 'ri-user-line', color: 'bg-rose-400' },
  ];

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStockBadge = (status: 'In Stock' | 'Low' | 'Out') => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-700';
      case 'Low': return 'bg-amber-100 text-amber-700';
      case 'Out': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center`}>
                <i className={`${stat.icon} text-white text-lg md:text-xl w-5 h-5 md:w-6 md:h-6 flex items-center justify-center`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low-stock summary alert */}
      {alertCount > 0 && (
        <div className={`mb-4 md:mb-6 rounded-lg border p-3 md:p-4 flex items-start gap-2 md:gap-3 ${
          outOfStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className={`ri-alarm-warning-fill text-lg md:text-xl ${outOfStockItems.length > 0 ? 'text-red-500' : 'text-amber-500'}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm md:text-base font-semibold mb-1 ${outOfStockItems.length > 0 ? 'text-red-900' : 'text-amber-900'}`}>
              Inventory Alert — {alertCount} product{alertCount > 1 ? 's' : ''} need attention
            </p>
            <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-1 text-xs md:text-sm">
              {lowStockItems.length > 0 && (
                <p className="text-amber-700">
                  <span className="font-semibold">{lowStockItems.length}</span> running low (≤{lowStockThreshold} units):&nbsp;
                  {lowStockItems.map((i) => i.name).join(', ')}
                </p>
              )}
              {outOfStockItems.length > 0 && (
                <p className="text-red-700">
                  <span className="font-semibold">{outOfStockItems.length}</span> out of stock:&nbsp;
                  {outOfStockItems.map((i) => i.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Inventory Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Inventory Overview</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Current stock levels</p>
            </div>
            {alertCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded-full whitespace-nowrap">
                <div className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                  <i className="ri-alarm-warning-fill text-xs md:text-sm"></i>
                </div>
                {alertCount} alert{alertCount > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => {
                  const isAlert = item.status === 'Low' || item.status === 'Out';
                  return (
                    <tr key={item.id} className={`transition-colors ${isAlert ? 'bg-amber-50/50' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-gray-900 flex items-center gap-1.5">
                              {item.name}
                              {isAlert && (
                                <span className="w-4 h-4 flex items-center justify-center" title={item.status === 'Out' ? 'Out of stock' : `Low stock (≤${lowStockThreshold})`}>
                                  <i className={`ri-alarm-warning-fill text-sm ${item.status === 'Out' ? 'text-red-500' : 'text-amber-500'}`}></i>
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${item.status === 'Out' ? 'text-red-600' : item.status === 'Low' ? 'text-amber-600' : 'text-gray-900'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStockBadge(item.status)}`}>
                          {(item.status === 'Low' || item.status === 'Out') && (
                            <span className="w-3 h-3 flex items-center justify-center">
                              <i className="ri-alarm-warning-fill text-xs"></i>
                            </span>
                          )}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isAlert ? (
                          <button
                            onClick={() => handleRestock(item.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                              item.status === 'Out'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 flex items-center justify-center">
                              <i className="ri-add-circle-line text-xs"></i>
                            </span>
                            Restock
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {inventory.length > 0 ? inventory.map((item) => {
              const isAlert = item.status === 'Low' || item.status === 'Out';
              return (
                <div key={item.id} className={`p-4 ${isAlert ? 'bg-amber-50/50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 mb-0.5">
                        {item.name}
                        {isAlert && (
                          <span className="w-4 h-4 flex items-center justify-center">
                            <i className={`ri-alarm-warning-fill text-xs ${item.status === 'Out' ? 'text-red-500' : 'text-amber-500'}`}></i>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStockBadge(item.status)}`}>
                      {(item.status === 'Low' || item.status === 'Out') && (
                        <span className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-alarm-warning-fill text-xs"></i>
                        </span>
                      )}
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Stock:</span>
                      <span className={`font-bold text-sm ${item.status === 'Out' ? 'text-red-600' : item.status === 'Low' ? 'text-amber-600' : 'text-gray-900'}`}>
                        {item.stock} units
                      </span>
                    </div>
                    {isAlert && (
                      <button
                        onClick={() => handleRestock(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          item.status === 'Out'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 flex items-center justify-center">
                          <i className="ri-add-circle-line text-xs"></i>
                        </span>
                        Restock
                      </button>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-sm text-gray-400">No products found</div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Transactions</h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Latest order activity</p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.slice(0, 6).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.orderId}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{transaction.customer}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatPrice(transaction.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTransactionStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {transactions.slice(0, 6).map((transaction) => (
              <div key={transaction.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{transaction.orderId}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTransactionStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{transaction.customer}</p>
                  <p className="font-bold text-gray-900">{formatPrice(transaction.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 md:mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all whitespace-nowrap cursor-pointer">
            <i className="ri-add-circle-line text-2xl md:text-3xl text-teal-500 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"></i>
            <span className="text-xs md:text-sm font-medium text-gray-700">Add Product</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all whitespace-nowrap cursor-pointer">
            <i className="ri-file-list-line text-2xl md:text-3xl text-teal-500 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"></i>
            <span className="text-xs md:text-sm font-medium text-gray-700">View Orders</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all whitespace-nowrap cursor-pointer">
            <i className="ri-settings-3-line text-2xl md:text-3xl text-teal-500 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"></i>
            <span className="text-xs md:text-sm font-medium text-gray-700">Store Settings</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all whitespace-nowrap cursor-pointer">
            <i className="ri-user-add-line text-2xl md:text-3xl text-teal-500 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"></i>
            <span className="text-xs md:text-sm font-medium text-gray-700">Manage Users</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;