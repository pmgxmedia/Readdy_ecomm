import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { supabase } from '../../../lib/supabase';
import { SkeletonCard, SkeletonTable } from '../../../components/base/Skeleton';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  currency: string;
  payment_status: string;
  status: string;
  payment_method: string;
  shipping_address: ShippingAddress;
  notes: string | null;
}

type FulfillmentStatus = 'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export default function OrdersPage() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FulfillmentStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const itemsPerPage = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('Orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Failed to load orders. Please try again.');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: number, field: 'status' | 'payment_status', value: string) => {
    setUpdatingStatus(true);
    const { error: updateError } = await supabase
      .from('Orders')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (!updateError) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, [field]: value } : prev);
      }
    }
    setUpdatingStatus(false);
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab !== 'All') {
      filtered = filtered.filter(order => order.status === activeTab);
    }
    return filtered;
  }, [orders, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-teal-100 text-teal-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFulfillmentStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-teal-100 text-teal-800';
      case 'Shipped': return 'bg-sky-100 text-sky-800';
      case 'Processing': return 'bg-amber-100 text-amber-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Orders Management</h1>
          <p className="text-sm md:text-base text-gray-600">View and manage all customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <i className="ri-refresh-line text-base"></i>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <i className="ri-error-warning-line text-red-500 text-xl"></i>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={8} cols={8} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 mb-4 md:mb-6">
              <div className="flex-1">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                  <input
                    type="text"
                    placeholder="Search by order ID, customer name or email..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              {(['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as FulfillmentStatus[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                  {tab !== 'All' && (
                    <span className="ml-1.5 text-xs opacity-75">
                      ({orders.filter(o => o.status === tab).length})
                    </span>
                  )}
                  {tab === 'All' && (
                    <span className="ml-1.5 text-xs opacity-75">({orders.length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery || activeTab !== 'All'
                  ? 'Try adjusting your search or filter.'
                  : 'Orders placed through checkout will appear here.'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-bold text-gray-900 mb-1">{order.order_number}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{order.customer_name}</p>
                        <p className="text-xs text-gray-500 truncate">{order.customer_email}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-base font-bold text-gray-900 whitespace-nowrap">{formatPrice(order.total)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFulfillmentStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">{order.items?.length ?? 0} items</span>
                    </div>
                    
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full py-2 px-3 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-medium text-gray-900">{order.order_number}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.items?.length ?? 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getFulfillmentStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium whitespace-nowrap cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}
                      className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                      <span className="hidden sm:inline">Previous</span>
                      <i className="ri-arrow-left-s-line sm:hidden"></i>
                    </button>
                    <div className="hidden sm:flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-teal-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                          {page}
                        </button>
                      ))}
                    </div>
                    <div className="sm:hidden text-sm font-medium text-gray-700 px-3 py-2">
                      {currentPage} / {totalPages}
                    </div>
                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}
                      className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                      <span className="hidden sm:inline">Next</span>
                      <i className="ri-arrow-right-s-line sm:hidden"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 md:p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white w-full h-full md:h-auto md:rounded-lg md:max-w-4xl md:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono font-medium text-gray-900">{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-gray-900 capitalize">{selectedOrder.payment_method?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <select
                        value={selectedOrder.payment_status}
                        onChange={(e) => handleStatusUpdate(selectedOrder.id, 'payment_status', e.target.value)}
                        disabled={updatingStatus}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                      >
                        {['Pending', 'Paid', 'Failed'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Fulfillment Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusUpdate(selectedOrder.id, 'status', e.target.value)}
                        disabled={updatingStatus}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                      >
                        {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {selectedOrder.notes && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Notes:</span>
                        <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium text-gray-900 break-all">{selectedOrder.customer_email}</p>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium text-gray-900">{selectedOrder.customer_phone}</p>
                      </div>
                    )}
                    {selectedOrder.shipping_address && (
                      <div>
                        <span className="text-gray-600">Shipping Address:</span>
                        <p className="font-medium text-gray-900 mt-1">
                          {selectedOrder.shipping_address.street}<br />
                          {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}<br />
                          {selectedOrder.shipping_address.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">{item.name}</h4>
                        <p className="text-xs md:text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900 text-sm md:text-base">{formatPrice(item.price)}</p>
                        <p className="text-xs md:text-sm text-gray-600">each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2 text-sm max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium text-gray-900">{formatPrice(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-gray-900">
                      {selectedOrder.shipping_cost === 0 ? 'Free' : formatPrice(selectedOrder.shipping_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-base md:text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-base md:text-lg font-bold text-teal-600">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
