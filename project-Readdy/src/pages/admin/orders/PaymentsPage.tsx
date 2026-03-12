import { useState, useMemo } from 'react';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: string;
  status: 'Paid' | 'Refunded' | 'Failed';
  date: string;
}

const mockPayments: Payment[] = [
  { id: 'TXN-2024-001', orderId: 'ORD-2024-001', customerName: 'Sarah Johnson', amount: 382.17, method: 'Visa •••• 4242', status: 'Paid', date: '2024-01-15' },
  { id: 'TXN-2024-002', orderId: 'ORD-2024-002', customerName: 'Michael Chen', amount: 431.99, method: 'Mastercard •••• 5555', status: 'Paid', date: '2024-01-16' },
  { id: 'TXN-2024-003', orderId: 'ORD-2024-003', customerName: 'Emily Rodriguez', amount: 220.57, method: 'PayPal', status: 'Paid', date: '2024-01-17' },
  { id: 'TXN-2024-004', orderId: 'ORD-2024-004', customerName: 'David Thompson', amount: 109.19, method: 'Visa •••• 1234', status: 'Failed', date: '2024-01-17' },
  { id: 'TXN-2024-005', orderId: 'ORD-2024-005', customerName: 'Jessica Martinez', amount: 215.98, method: 'Visa •••• 9876', status: 'Failed', date: '2024-01-18' },
  { id: 'TXN-2024-006', orderId: 'ORD-2024-006', customerName: 'Robert Wilson', amount: 539.99, method: 'Mastercard •••• 8888', status: 'Paid', date: '2024-01-18' },
  { id: 'TXN-2024-007', orderId: 'ORD-2024-007', customerName: 'Amanda Lee', amount: 299.99, method: 'PayPal', status: 'Paid', date: '2024-01-19' },
  { id: 'TXN-2024-008', orderId: 'ORD-2024-008', customerName: 'Christopher Brown', amount: 189.99, method: 'Visa •••• 3333', status: 'Paid', date: '2024-01-19' },
  { id: 'TXN-2024-009', orderId: 'ORD-2024-009', customerName: 'Nicole Davis', amount: 449.99, method: 'Mastercard •••• 7777', status: 'Refunded', date: '2024-01-20' },
  { id: 'TXN-2024-010', orderId: 'ORD-2024-010', customerName: 'Daniel Garcia', amount: 159.99, method: 'PayPal', status: 'Paid', date: '2024-01-20' },
  { id: 'TXN-2024-011', orderId: 'ORD-2024-011', customerName: 'Sophia Anderson', amount: 329.99, method: 'Visa •••• 6666', status: 'Paid', date: '2024-01-21' },
  { id: 'TXN-2024-012', orderId: 'ORD-2024-012', customerName: 'Matthew Taylor', amount: 89.99, method: 'Mastercard •••• 2222', status: 'Paid', date: '2024-01-21' }
];

export default function PaymentsPage() {
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Refunded' | 'Failed'>('All');

  const filteredPayments = useMemo(() => {
    let filtered = mockPayments;

    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    return filtered;
  }, [searchQuery, statusFilter]);

  const totalRevenue = mockPayments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunds = mockPayments
    .filter(p => p.status === 'Refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = mockPayments
    .filter(p => p.status === 'Failed')
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulTransactions = mockPayments.filter(p => p.status === 'Paid').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-teal-100 text-teal-800';
      case 'Refunded': return 'bg-amber-100 text-amber-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    if (method.includes('Visa')) return 'ri-bank-card-line';
    if (method.includes('Mastercard')) return 'ri-bank-card-2-line';
    if (method.includes('PayPal')) return 'ri-paypal-line';
    return 'ri-wallet-line';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Payments Management</h1>
        <p className="text-sm md:text-base text-gray-600">Track and manage all payment transactions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-teal-100 rounded-lg">
              <i className="ri-money-dollar-circle-line text-xl md:text-2xl text-teal-600"></i>
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
          <p className="text-xs md:text-sm text-teal-600 mt-2">+12.5% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-amber-100 rounded-lg">
              <i className="ri-refund-2-line text-xl md:text-2xl text-amber-600"></i>
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1">Total Refunds</h3>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{formatPrice(totalRefunds)}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">1 refund processed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-red-100 rounded-lg">
              <i className="ri-error-warning-line text-xl md:text-2xl text-red-600"></i>
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1">Failed Payments</h3>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{formatPrice(pendingPayments)}</p>
          <p className="text-xs md:text-sm text-red-600 mt-2">2 failed transactions</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-blue-100 rounded-lg">
              <i className="ri-check-double-line text-xl md:text-2xl text-blue-600"></i>
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1">Successful Transactions</h3>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{successfulTransactions}</p>
          <p className="text-xs md:text-sm text-blue-600 mt-2">83.3% success rate</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 mb-4 md:mb-6">
            <div className="flex-1">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <input
                  type="text"
                  placeholder="Search by transaction ID, order ID, or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
            {(['All', 'Paid', 'Refunded', 'Failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">{payment.id}</p>
                  <p className="text-xs text-teal-600 font-medium mb-1">{payment.orderId}</p>
                  <p className="text-sm text-gray-900 truncate">{payment.customerName}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-base font-bold text-gray-900 whitespace-nowrap">{formatPrice(payment.amount)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{payment.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <i className={`${getMethodIcon(payment.method)} text-base text-gray-600 flex-shrink-0`}></i>
                  <span className="text-xs text-gray-700 truncate">{payment.method}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{payment.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-teal-600 font-medium">{payment.orderId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{payment.customerName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{formatPrice(payment.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <i className={`${getMethodIcon(payment.method)} text-lg text-gray-600`}></i>
                      <span className="text-sm text-gray-700">{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-12 text-center">
            <i className="ri-file-list-3-line text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-sm md:text-base">No payments found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}